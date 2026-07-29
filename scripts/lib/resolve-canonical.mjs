// resolve-canonical.mjs — resolve a canonical file by CONTENT, not by a
// hardcoded path (WS4 of PRD-concurrent-session-isolation).
//
// WHY: canonical docs move across concurrent sessions. On 2026-07-22 the
// voice-identity file moved three times in one day (.claude/rules/ ->
// .claude/reference/ -> content/voice/), each move leaving a markerless pointer
// stub. Every script that hardcoded one path broke (content-gate.mjs exited 2
// on every draft). The durable fix: give the reader an ordered list of
// candidate paths and a marker string that only the REAL file contains, and let
// it pick the first candidate that actually carries the marker. A retired path
// left behind as a stub never wins; a new home is a one-line prepend.
//
// Pure, dependency-free, synchronous. Import into any gate/script.

import { readFileSync, existsSync } from 'node:fs';
import { relative } from 'node:path';

/**
 * @param {string[]} candidates  Absolute paths, most-current first.
 * @param {string}   marker      A line/substring only the real file contains.
 * @param {object}   [opts]
 * @param {boolean}  [opts.exactLine=false]  Marker must equal a trimmed line
 *                                            (not just appear as a substring).
 * @param {string}   [opts.root=process.cwd()] For tidy error paths.
 * @returns {{ path: string, text: string }}
 * @throws  If no candidate exists AND contains the marker. The error names every
 *          path searched, so a failure is diagnosable, not a mystery.
 */
export function resolveCanonical(candidates, marker, opts = {}) {
  const { exactLine = false, root = process.cwd() } = opts;
  if (!Array.isArray(candidates) || candidates.length === 0) {
    throw new Error('resolveCanonical: candidates must be a non-empty array');
  }
  if (typeof marker !== 'string' || marker === '') {
    throw new Error('resolveCanonical: marker must be a non-empty string');
  }
  const searched = [];
  for (const cand of candidates) {
    searched.push(relative(root, cand));
    if (!existsSync(cand)) continue;
    const text = readFileSync(cand, 'utf8');
    const hit = exactLine
      ? text.split('\n').some((l) => l.trim() === marker)
      : text.includes(marker);
    if (hit) return { path: cand, text };
    // exists but no marker: a pointer stub. Keep looking.
  }
  throw new Error(
    `resolveCanonical: no candidate contained the marker ${JSON.stringify(marker)}. ` +
      `Searched, in order:\n  ${searched.join('\n  ')}\n` +
      `Add the file's new home to the FRONT of the candidate list.`,
  );
}

export default resolveCanonical;
