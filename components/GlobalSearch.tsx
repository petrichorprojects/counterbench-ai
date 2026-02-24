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

export function GlobalSearch() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [results, setResults] = useState<Array<SearchIndexFile["docs"][number]>>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const indexRef = useRef<{ mini: MiniSearchType; docsById: Map<string, SearchIndexFile["docs"][number]> } | null>(null);

  const placeholder = useMemo(() => "Search tools, playbooks, prompts, skills…", []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest("[data-global-search-root]")) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  async function ensureIndexLoaded() {
    if (indexRef.current) return;
    try {
      const res = await fetch("/search-index.json", { cache: "force-cache" });
      if (!res.ok) {
        setReady(true);
        indexRef.current = null;
        return;
      }
      const data = (await res.json()) as SearchIndexFile;
      const docsById = new Map(data.docs.map((d) => [d.id, d]));
      const { default: MiniSearch } = await import("minisearch");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    // MiniSearch.loadJSON expects a JSON string; our search-index.json stores the parsed object.
    const mini = MiniSearch.loadJSON(JSON.stringify(data.index) as never, {
      fields: ["title", "description", "tags", "categories"],
      storeFields: ["id", "type", "slug", "title", "description"]
    }) as unknown as MiniSearchType;
      indexRef.current = { mini, docsById };
      setReady(true);
    } catch {
      setReady(true);
      indexRef.current = null;
    }
  }

  function routeFor(doc: SearchIndexFile["docs"][number]) {
    if (doc.type === "tool") return `/tools/${doc.slug}`;
    if (doc.type === "playbook") return `/playbooks/${doc.slug}`;
    if (doc.type === "prompt") return `/prompts/${doc.slug}`;
    return `/skills/${doc.slug}`;
  }

  async function onChange(next: string) {
    setQ(next);
    if (!next.trim()) {
      setResults([]);
      setActiveIndex(-1);
      return;
    }
    await ensureIndexLoaded();
    const idx = indexRef.current;
    if (!idx) return;
    const hits = idx.mini.search(next.trim(), { combineWith: "AND", prefix: true }).slice(0, 8);
    const mapped: Array<SearchIndexFile["docs"][number]> = [];
    for (const h of hits) {
      const doc = idx.docsById.get(h.id);
      if (doc) mapped.push(doc);
    }
    setResults(mapped);
    setActiveIndex(mapped.length ? 0 : -1);
  }

  return (
    <div data-global-search-root style={{ position: "relative" }}>
      <input
        ref={inputRef}
        value={q}
        onChange={(e) => void onChange(e.target.value)}
        onFocus={() => {
          setOpen(true);
          void ensureIndexLoaded();
        }}
        onKeyDown={(e) => {
          if (!open) setOpen(true);
          if (e.key === "Escape") {
            setOpen(false);
            setActiveIndex(-1);
            return;
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, results.length - 1));
            return;
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
            return;
          }
          if (e.key === "Enter" && activeIndex >= 0 && results[activeIndex]) {
            const doc = results[activeIndex];
            window.location.href = routeFor(doc);
          }
        }}
        placeholder={placeholder}
        aria-label="Global search"
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 999,
          border: "1px solid var(--border)",
          background: "rgba(255,255,255,0.04)",
          color: "var(--fg)"
        }}
      />
      {open && (q.trim() || results.length > 0) && (
        <div
          role="listbox"
          aria-label="Search results"
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            left: 0,
            right: 0,
            background: "rgba(10,10,10,0.98)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "var(--shadow-1)",
            zIndex: 200,
            padding: "8px"
          }}
        >
          {!ready && <div className="text-muted" style={{ padding: "10px 10px", fontSize: "0.875rem" }}>Loading…</div>}
          {ready && results.length === 0 && q.trim() && (
            <div className="text-muted" style={{ padding: "10px 10px", fontSize: "0.875rem" }}>
              No matches.
            </div>
          )}
          {results.map((r, idx) => {
            const active = idx === activeIndex;
            return (
              <Link
                key={r.id}
                href={routeFor(r)}
                role="option"
                aria-selected={active}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => setOpen(false)}
                style={{
                  display: "block",
                  padding: "10px 10px",
                  borderRadius: 10,
                  background: active ? "rgba(255,255,255,0.06)" : "transparent"
                }}
              >
                <div className="text-white" style={{ fontSize: "0.9375rem", fontWeight: 600 }}>
                  {r.title}
                </div>
                <div className="text-muted" style={{ fontSize: "0.8125rem", marginTop: 4 }}>
                  {r.type.toUpperCase()} • {r.description.slice(0, 92)}
                  {r.description.length > 92 ? "…" : ""}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
