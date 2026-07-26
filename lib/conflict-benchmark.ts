/**
 * Validation for anonymous Conflict Check Audit benchmark submissions.
 *
 * Kept out of the route file so it stays pure and unit-testable (Next.js route
 * modules may only export handlers + config). Mirrors the client contract in
 * lib/conflict-check-audit.ts. Anything outside the allowlists drops to null
 * (firmographics) or is rejected (score/tier), so a malformed or hostile POST
 * cannot poison the benchmark dataset.
 */

const TIERS = new Set(["documented", "person_dependent", "reactive", "undocumented"]);
const FIRM_SIZES = new Set(["solo", "2-5", "6-10", "11-25", "25+"]);
const PRACTICE_MAX = 80;

export interface BenchmarkInput {
  score: unknown;
  tier: unknown;
  firm_size?: unknown;
  state?: unknown;
  practice_area?: unknown;
}

export interface NormalizedRow {
  score: number;
  tier: string;
  firmSize: string | null;
  state: string | null;
  practiceArea: string | null;
}

/** Returns a clean row, or an error string naming the first hard failure. */
export function normalizeBenchmark(body: BenchmarkInput): NormalizedRow | { error: string } {
  // Accept a number, or a non-empty numeric string. Reject null/bool/object/
  // empty-string — Number() coerces those to 0/1 and would silently store junk.
  let score: number;
  if (typeof body.score === "number") {
    score = body.score;
  } else if (typeof body.score === "string" && body.score.trim() !== "") {
    score = Number(body.score);
  } else {
    return { error: "score must be a number 0–24" };
  }
  if (!Number.isInteger(score) || score < 0 || score > 24) {
    return { error: "score must be an integer 0–24" };
  }

  const tier = typeof body.tier === "string" ? body.tier : "";
  if (!TIERS.has(tier)) {
    return { error: "unknown tier" };
  }

  const rawSize = typeof body.firm_size === "string" ? body.firm_size : "";
  const firmSize = FIRM_SIZES.has(rawSize) ? rawSize : null;

  const rawState = typeof body.state === "string" ? body.state.trim().toUpperCase() : "";
  const state = /^[A-Z]{2}$/.test(rawState) ? rawState : null;

  const rawPractice = typeof body.practice_area === "string" ? body.practice_area.trim() : "";
  const practiceArea = rawPractice ? rawPractice.slice(0, PRACTICE_MAX) : null;

  return { score, tier, firmSize, state, practiceArea };
}
