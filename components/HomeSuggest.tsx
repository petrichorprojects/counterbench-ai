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

export function HomeSuggest() {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [results, setResults] = useState<Array<SearchIndexFile["docs"][number]>>([]);
  const [err, setErr] = useState<string | null>(null);
  const indexRef = useRef<{ mini: MiniSearchType; docsById: Map<string, SearchIndexFile["docs"][number]> } | null>(null);

  const placeholder = useMemo(
    () => "e.g., review a vendor contract, draft a motion outline, respond to discovery, cite-check a memo…",
    []
  );

  useEffect(() => {
    // Warm index on idle for a snappy first submit.
    const id = window.setTimeout(() => void ensureIndexLoaded(), 600);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        storeFields: ["id", "type", "slug", "title", "description"]
      }) as unknown as MiniSearchType;
      indexRef.current = { mini, docsById };
      setReady(true);
    } catch {
      setReady(true);
    }
  }

  async function runSuggest() {
    const query = q.trim();
    setErr(null);
    if (!query) {
      setResults([]);
      return;
    }

    setBusy(true);
    try {
      await ensureIndexLoaded();
      const idx = indexRef.current;
      if (!idx) {
        setResults([]);
        setErr("Search index not available.");
        return;
      }

      let hits = idx.mini.search(query, { prefix: true, combineWith: "AND" }).slice(0, 24);
      if (hits.length === 0) {
        hits = idx.mini.search(query, { prefix: true, combineWith: "OR" }).slice(0, 24);
      }
      const mapped: Array<SearchIndexFile["docs"][number]> = [];
      for (const h of hits) {
        const doc = idx.docsById.get(h.id);
        if (doc) mapped.push(doc);
      }

      // Curate: prioritize tools/prompts/skills, and keep the list short.
      const curated: Array<SearchIndexFile["docs"][number]> = [];
      const buckets: Record<DocType, number> = { tool: 0, prompt: 0, skill: 0, playbook: 0 };
      for (const d of mapped) {
        if (d.type === "playbook") continue; // homepage: focus on tool/prompt/skill
        const cap = d.type === "tool" ? 4 : 3;
        if (buckets[d.type] >= cap) continue;
        curated.push(d);
        buckets[d.type]++;
        if (curated.length >= 10) break;
      }

      setResults(curated);
      if (curated.length === 0) setErr("No matches. Try different wording (or a specific task like ‘contract review’).");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div data-home-suggest-root className="mt-4" style={{ maxWidth: 820 }}>
      <div className="card" style={{ padding: "1.25rem", borderRadius: 14 }}>
        <div className="label" style={{ marginBottom: 10 }}>
          Describe what you need
        </div>
        <textarea
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") void runSuggest();
          }}
          placeholder={placeholder}
          aria-label="Describe what you need"
          rows={3}
          style={{
            width: "100%",
            resize: "vertical",
            padding: "12px 14px",
            borderRadius: 14,
            border: "1px solid var(--border)",
            background: "var(--input-bg)",
            color: "var(--fg)",
            lineHeight: 1.45
          }}
        />

        <div className="mt-3 flex flex--between flex--center flex--gap-2 flex--resp-col" style={{ alignItems: "center" }}>
          <div className="text-muted" style={{ fontSize: "0.8125rem" }}>
            {ready ? "Suggestions are computed locally from the library." : "Loading index…"}
          </div>
          <div className="flex flex--gap-2">
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={() => {
                setQ("");
                setResults([]);
                setErr(null);
              }}
              disabled={busy}
            >
              Clear
            </button>
            <button type="button" className="btn btn--primary btn--sm" onClick={() => void runSuggest()} disabled={busy}>
              {busy ? "Suggesting…" : "Suggest"}
            </button>
          </div>
        </div>

        {err && (
          <div className="mt-3 text-muted" style={{ fontSize: "0.875rem" }}>
            {err}
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-4" style={{ display: "grid", gap: 10 }}>
            {results.map((r) => (
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
                  background: "var(--bg2)"
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
