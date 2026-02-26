"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Doc = { id: string; type: "tool" | "prompt" | "skill"; slug: string; title: string; description: string };
type IndexFile = { index: unknown; docs: Doc[] };

function readCompare(): string[] {
  try {
    const raw = localStorage.getItem("cb_compare");
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    if (Array.isArray(arr)) return arr.filter((x) => typeof x === "string");
  } catch {
    // ignore
  }
  return [];
}

function writeCompare(slugs: string[]) {
  localStorage.setItem("cb_compare", JSON.stringify(slugs.slice(0, 12)));
}

export function CompareManager({ initialSlugs }: { initialSlugs: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [slugs, setSlugs] = useState<string[]>(initialSlugs);
  const [q, setQ] = useState("");
  const [candidates, setCandidates] = useState<Doc[]>([]);

  useEffect(() => {
    // If no query param present, hydrate from localStorage.
    const hasParam = Boolean(searchParams?.get("tools"));
    if (!hasParam) {
      const stored = readCompare();
      if (stored.length) {
        setSlugs(stored.slice(0, 8));
        const next = new URLSearchParams(searchParams?.toString() ?? "");
        next.set("tools", stored.slice(0, 8).join(","));
        router.replace(`/tools/compare?${next.toString()}`);
      }
    } else {
      writeCompare(initialSlugs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    writeCompare(slugs);
  }, [slugs]);

  const toolsParam = useMemo(() => slugs.join(","), [slugs]);

  async function searchTools(nextQ: string) {
    setQ(nextQ);
    if (!nextQ.trim()) {
      setCandidates([]);
      return;
    }
    const res = await fetch("/search-index.json", { cache: "force-cache" }).catch(() => null);
    if (!res || !res.ok) {
      setCandidates([]);
      return;
    }
    const data = (await res.json()) as IndexFile;
    const docs = data.docs.filter((d) => d.type === "tool");
    const needle = nextQ.toLowerCase();
    const hits = docs
      .filter((d) => `${d.title} ${d.description}`.toLowerCase().includes(needle))
      .slice(0, 8);
    setCandidates(hits);
  }

  return (
    <div className="card" style={{ borderRadius: 12, padding: "1.25rem" }}>
      <div className="flex flex--between flex--center flex--gap-2" style={{ alignItems: "flex-start", flexWrap: "wrap" }}>
        <div>
          <div className="text-white" style={{ fontWeight: 700 }}>
            Selected ({slugs.length})
          </div>
          <div className="text-muted" style={{ fontSize: "0.875rem", marginTop: 6 }}>
            Shareable URL via `tools=` query param. Persisted in local storage.
          </div>
        </div>
        <div className="flex flex--gap-2">
          <button
            className="btn btn--secondary btn--sm"
            type="button"
            onClick={() => {
              setSlugs([]);
              writeCompare([]);
              router.replace("/tools/compare");
            }}
          >
            Clear
          </button>
          <button
            className="btn btn--ghost btn--sm"
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href).catch(() => undefined);
            }}
          >
            Copy URL
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex--gap-2 flex--resp-col">
        <input
          value={q}
          onChange={(e) => void searchTools(e.target.value)}
          placeholder="Add a tool by searching name…"
          aria-label="Add a tool"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 999,
                    border: "1px solid var(--border)",
                    background: "var(--input-bg)",
                    color: "var(--fg)"
                  }}
                />
        <button
          className="btn btn--primary btn--sm"
          type="button"
          onClick={() => {
            if (!q.trim()) return;
            const nextSlug = q.trim().toLowerCase().replace(/\s+/g, "-");
            const next = slugs.includes(nextSlug) ? slugs : [...slugs, nextSlug].slice(0, 8);
            setSlugs(next);
            const params = new URLSearchParams(searchParams?.toString() ?? "");
            params.set("tools", next.join(","));
            router.replace(`/tools/compare?${params.toString()}`);
            setQ("");
            setCandidates([]);
          }}
        >
          Add by slug
        </button>
      </div>

      {candidates.length > 0 && (
        <div className="mt-4" style={{ display: "grid", gap: 8 }}>
          {candidates.map((c) => (
            <button
              key={c.id}
              className="btn btn--secondary btn--sm"
              type="button"
              onClick={() => {
                const next = slugs.includes(c.slug) ? slugs : [...slugs, c.slug].slice(0, 8);
                setSlugs(next);
                const params = new URLSearchParams(searchParams?.toString() ?? "");
                params.set("tools", next.join(","));
                router.replace(`/tools/compare?${params.toString()}`);
                setQ("");
                setCandidates([]);
              }}
              style={{ justifyContent: "flex-start" }}
            >
              {c.title}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 text-muted" style={{ fontSize: "0.8125rem" }}>
        Current query param: {toolsParam || "(none)"}
      </div>
    </div>
  );
}
