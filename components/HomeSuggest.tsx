"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type DocType = "tool" | "prompt" | "skill" | "playbook";

interface SearchIndexFile {
  index: unknown;
  docs: Array<{ id: string; type: DocType; slug: string; title: string; description: string }>;
}

type MiniSearchType = {
  search: (q: string, opts?: Record<string, unknown>) => Array<{ id: string; score: number }>;
};

function normalizeText(s: string) {
  return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

function analyzeQuery(raw: string) {
  const q = normalizeText(raw);
  const tokens = uniq(q.split(/\s+/).filter(Boolean));

  const hasAssessIntent = /\b(assess|evaluate|viability|strengths?|weakness(es)?|analysis|risk|likelihood)\b/.test(q);
  const hasDraftIntent =
    /\b(draft|write|generate|outline|template|starter|motion|brief|opposition|reply|memo)\b/.test(q) ||
    /\bmotion to\b/.test(q);

  const looksLikeMotion = /\b(motion|brief|opposition|reply)\b/.test(q);
  const looksLikeMotionSubtype = /\bmotion to\b/.test(q) || /\b(opposition|reply) to\b/.test(q);

  const expansions: string[] = [];
  if (looksLikeMotionSubtype) {
    // Ambiguous "motion to X" queries tend to mean "help me draft/build" rather than viability analysis.
    expansions.push("draft", "outline", "starter", "template", "brief", "headings", "drafting");
  } else if (looksLikeMotion) {
    expansions.push("outline", "drafting");
  }

  return {
    q,
    tokens,
    hasAssessIntent,
    hasDraftIntent,
    looksLikeMotion,
    looksLikeMotionSubtype,
    expandedQuery: uniq([...tokens, ...expansions]).join(" ")
  };
}

function rerankScore(args: {
  doc: SearchIndexFile["docs"][number];
  score: number;
  q: string;
  tokens: string[];
  hasAssessIntent: boolean;
  hasDraftIntent: boolean;
  looksLikeMotion: boolean;
  looksLikeMotionSubtype: boolean;
}) {
  const { doc, q, tokens } = args;
  let s = args.score;

  const title = normalizeText(doc.title);
  const desc = normalizeText(doc.description ?? "");

  // Strong preference for exact-ish title matches.
  if (q && title.includes(q)) s *= 1.6;
  const inTitle = tokens.filter((t) => title.includes(t)).length;
  if (inTitle >= Math.min(3, tokens.length) && tokens.length >= 2) s *= 1.18;
  if (inTitle === tokens.length && tokens.length > 0) s *= 1.25;

  const isPrompt = doc.type === "prompt";
  const isTool = doc.type === "tool";
  const isSkill = doc.type === "skill";

  // Intent-based boosts.
  const titleLooksDrafty = /\b(starter|outline|template|draft)\b/.test(title);
  const titleLooksAssessy = /\b(assess|viability|strengths? and weaknesses?|analysis)\b/.test(title);

  if (args.hasDraftIntent) {
    if (isPrompt) s *= 1.12;
    if (args.looksLikeMotionSubtype && isPrompt && titleLooksDrafty) s *= 1.35;
    if (args.looksLikeMotionSubtype && isPrompt && titleLooksAssessy && !args.hasAssessIntent) s *= 0.65;
  }

  if (args.hasAssessIntent) {
    if (isPrompt) s *= 1.06;
    if (titleLooksAssessy) s *= 1.18;
    if (titleLooksDrafty) s *= 0.85;
  }

  // Generic: actionable templates beat meta-analysis when the query has no explicit assess intent.
  if (!args.hasAssessIntent && titleLooksDrafty) s *= 1.12;
  if (!args.hasAssessIntent && titleLooksAssessy) s *= 0.9;

  // If the query includes a very specific example term only present in long descriptions,
  // de-emphasize description-only matches.
  const inDescNotTitle = tokens.some((t) => !title.includes(t) && desc.includes(t));
  if (inDescNotTitle && inTitle === 0) s *= 0.92;

  // Small type balancing so "Suggest" feels useful even for novices.
  if (args.looksLikeMotion && isTool) s *= 0.95;
  if (args.looksLikeMotion && isSkill) s *= 1.02;

  return s;
}

function routeFor(doc: SearchIndexFile["docs"][number]) {
  if (doc.type === "tool") return `/tools/${doc.slug}`;
  if (doc.type === "playbook") return `/playbooks/${doc.slug}`;
  if (doc.type === "prompt") return `/prompts/${doc.slug}`;
  return `/skills/${doc.slug}`;
}

function typeLabel(t: DocType) {
  if (t === "tool") return "Tool";
  if (t === "prompt") return "Prompt";
  if (t === "skill") return "Skill";
  return "Playbook";
}

export function HomeSuggest(props: { align?: "left" | "center"; variant?: "hero" | "card" } = {}) {
  const align = props.align ?? "left";
  const variant = props.variant ?? "card";
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [results, setResults] = useState<Array<SearchIndexFile["docs"][number]>>([]);
  const [err, setErr] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const indexRef = useRef<{ mini: MiniSearchType; docsById: Map<string, SearchIndexFile["docs"][number]> } | null>(null);

  const placeholder = useMemo(() => "e.g., motion to compel, vendor contract redlines, discovery responses", []);

  useEffect(() => {
    // Warm index on idle for a snappy first submit.
    const id = window.setTimeout(() => void ensureIndexLoaded(), 600);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Auto-suggest with a light debounce (search feels "search engine-like").
    if (!touched) return;
    const query = q.trim();
    if (!query) {
      setResults([]);
      setErr(null);
      return;
    }
    const t = window.setTimeout(() => void runSuggest({ manual: false }), 180);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, touched]);

  async function ensureIndexLoaded() {
    if (indexRef.current) return;
    try {
      const res = await fetch("/search-index.json", { cache: "force-cache" });
      if (!res.ok) {
        setReady(true);
        return;
      }
      const data = (await res.json()) as SearchIndexFile;
      const docsById = new Map(data.docs.map((d) => [d.id, d]));
      const { default: MiniSearch } = await import("minisearch");
      // MiniSearch.loadJSON expects a JSON string; our file stores the parsed object.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const mini = MiniSearch.loadJSON(JSON.stringify(data.index) as never, {
        fields: ["title", "description", "tags", "categories"],
        storeFields: ["id", "type", "slug", "title", "description"],
        // Mirror the index build settings so client-side search matches server-built behavior.
        searchOptions: {
          boost: { title: 4, tags: 2, categories: 2, description: 1 },
          fuzzy: 0.2,
          prefix: true
        }
      }) as unknown as MiniSearchType;
      indexRef.current = { mini, docsById };
      setReady(true);
    } catch {
      setReady(true);
    }
  }

  async function runSuggest(opts: { manual: boolean }) {
    const raw = q.trim();
    if (opts.manual) setTouched(true);
    if (opts.manual) setErr(null);
    if (!raw) {
      setResults([]);
      return;
    }

    const { q: queryNorm, tokens, hasAssessIntent, hasDraftIntent, looksLikeMotion, looksLikeMotionSubtype, expandedQuery } =
      analyzeQuery(raw);

    if (opts.manual) setBusy(true);
    try {
      await ensureIndexLoaded();
      const idx = indexRef.current;
      if (!idx) {
        setResults([]);
        if (opts.manual) setErr("Search index not available.");
        return;
      }

      const scoreById = new Map<string, number>();
      const addHits = (hits: Array<{ id: string; score: number }>, w = 1) => {
        for (const h of hits) scoreById.set(h.id, (scoreById.get(h.id) ?? 0) + h.score * w);
      };

      // Do a few searches and blend: strict, loose, and expanded.
      addHits(idx.mini.search(raw, { combineWith: "AND" }).slice(0, 18), 1.15);
      addHits(idx.mini.search(raw, { combineWith: "OR" }).slice(0, 24), 1.0);
      if (expandedQuery && expandedQuery !== queryNorm) addHits(idx.mini.search(expandedQuery, { combineWith: "OR" }).slice(0, 24), 0.95);

      const mapped: Array<{ doc: SearchIndexFile["docs"][number]; score: number }> = [];
      for (const [id, base] of scoreById.entries()) {
        const doc = idx.docsById.get(id);
        if (!doc) continue;
        const score = rerankScore({
          doc,
          score: base,
          q: queryNorm,
          tokens,
          hasAssessIntent,
          hasDraftIntent,
          looksLikeMotion,
          looksLikeMotionSubtype
        });
        mapped.push({ doc, score });
      }
      mapped.sort((a, b) => b.score - a.score);

      // Curate: prioritize tools/prompts/skills, and keep the list short.
      const curated: Array<SearchIndexFile["docs"][number]> = [];
      const buckets: Record<DocType, number> = { tool: 0, prompt: 0, skill: 0, playbook: 0 };
      for (const { doc: d } of mapped) {
        if (d.type === "playbook") continue; // homepage: focus on tool/prompt/skill
        const cap = d.type === "tool" ? 4 : 3;
        if (buckets[d.type] >= cap) continue;
        curated.push(d);
        buckets[d.type]++;
        if (curated.length >= 10) break;
      }

      setResults(curated);
      if (opts.manual && curated.length === 0) setErr("No matches. Try different wording (or a specific task like ‘contract review’).");
    } finally {
      if (opts.manual) setBusy(false);
    }
  }

  return (
    <div
      data-home-suggest-root
      className="mt-3"
      style={{ maxWidth: 820, marginLeft: align === "center" ? "auto" : undefined, marginRight: align === "center" ? "auto" : undefined }}
    >
      <div
        className={variant === "card" ? "card" : "cb-homeSuggestShell"}
        style={{ padding: "1.25rem", borderRadius: 18, textAlign: align === "center" ? "center" : "left" }}
      >
        <div className="label" style={{ marginBottom: 10, letterSpacing: "0.16em", display: "inline-block" }}>
          Describe your next deliverable
        </div>
        <div
          className="cb-suggestBar"
          aria-label="Describe your next deliverable"
          style={{ maxWidth: align === "center" ? 760 : undefined, marginLeft: align === "center" ? "auto" : undefined, marginRight: align === "center" ? "auto" : undefined }}
        >
          <span className="cb-suggestBar__icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M10.5 19a8.5 8.5 0 1 1 6.06-2.5L21 21.44"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <textarea
            className="cb-suggestBar__input"
            value={q}
            onChange={(e) => {
              setTouched(true);
              setQ(e.target.value);
            }}
            onKeyDown={(e) => {
              // Enter submits; Shift+Enter inserts a newline (SciSpace-like).
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void runSuggest({ manual: true });
              }
            }}
            placeholder={placeholder}
            aria-label="Describe your next deliverable"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            rows={2}
          />
          {q.trim().length > 0 && (
            <button
              type="button"
              className="cb-suggestBar__clear"
              aria-label="Clear"
              title="Clear"
              onClick={() => {
                setTouched(true);
                setQ("");
                setResults([]);
                setErr(null);
              }}
              disabled={busy}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 7l10 10M17 7 7 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          )}
          <button
            type="button"
            className="cb-suggestBar__go"
            onClick={() => void runSuggest({ manual: true })}
            aria-label="Suggest"
            title="Suggest"
            disabled={busy}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h12M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div
          className="mt-3 flex flex--center flex--gap-2 flex--resp-col"
          style={{ alignItems: "center", justifyContent: align === "center" ? "center" : "space-between" }}
        >
          <div className="text-muted" style={{ fontSize: "0.8125rem" }}>
            {ready ? "Private & local" : "Loading index…"}
          </div>
          <div className="text-muted" style={{ fontSize: "0.8125rem" }}>
            {ready ? "Nothing leaves your machine" : " "}
          </div>
          <div className="text-muted" style={{ fontSize: "0.8125rem" }}>
            {ready ? "Zero billable hours wasted" : " "}
          </div>
        </div>

        {err && (
          <div className="mt-3 text-muted" style={{ fontSize: "0.875rem" }}>
            {err}
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-4" style={{ display: "grid", gap: 10, textAlign: "left" }}>
            {results.map((r, idx) => (
              <Link
                key={r.id}
                href={routeFor(r)}
                data-home-suggest-item
                className="card"
                style={{
                  display: "block",
                  padding: "1rem 1rem",
                  borderRadius: 14,
                  textDecoration: "none",
                  background: idx === 0 ? "var(--bg3)" : "var(--bg2)",
                  borderColor: idx === 0 ? "rgba(95,255,227,0.35)" : undefined
                }}
              >
                <div className="flex flex--between flex--center" style={{ gap: 12, alignItems: "baseline" }}>
                  <div className="text-white" style={{ fontWeight: 700, fontSize: "0.98rem" }}>
                    {r.title}
                  </div>
                  <span className="label label--pill" style={{ margin: 0, padding: "6px 10px" }}>
                    {typeLabel(r.type)}
                  </span>
                </div>
                <div className="text-muted" style={{ marginTop: 8, fontSize: "0.875rem", lineHeight: 1.45 }}>
                  {r.description}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 text-muted" style={{ fontSize: "0.8125rem" }}>
        Prefer browsing? <Link href="/tools">Tools</Link>, <Link href="/prompts">Prompts</Link>, <Link href="/skills">Skills</Link>.
      </div>
    </div>
  );
}
