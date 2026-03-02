"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type DocType = "tool" | "agent" | "prompt" | "skill" | "playbook";

type SearchDoc = {
  id: string;
  type: DocType;
  slug: string;
  title: string;
  description: string;
  platform?: string[];
};

interface SearchIndexFile {
  index: unknown;
  docs: SearchDoc[];
}

type MiniSearchType = {
  search: (q: string, opts?: Record<string, unknown>) => Array<{ id: string; score: number }>;
};

function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

function normalizePlatform(p: string) {
  return p.trim().toLowerCase();
}

function prettyPlatform(p: string) {
  const v = normalizePlatform(p);
  if (v === "web") return "Web";
  if (v === "chrome") return "Chrome";
  if (v === "ios") return "iOS";
  if (v === "android") return "Android";
  if (v === "mac" || v === "macos") return "macOS";
  if (v === "windows") return "Windows";
  if (v === "api") return "API";
  return v.length ? v.charAt(0).toUpperCase() + v.slice(1) : v;
}

function routeFor(doc: SearchDoc) {
  if (doc.type === "tool" || doc.type === "agent") return `/tools/${doc.slug}`;
  if (doc.type === "playbook") return `/playbooks/${doc.slug}`;
  if (doc.type === "prompt") return `/prompts/${doc.slug}`;
  return `/skills/${doc.slug}`;
}

function typeLabel(t: DocType) {
  if (t === "tool") return "Tool";
  if (t === "agent") return "Agent";
  if (t === "prompt") return "Prompt";
  if (t === "skill") return "Skill";
  return "Playbook";
}

const TYPE_TABS: Array<{ key: "all" | DocType; label: string }> = [
  { key: "all", label: "All" },
  { key: "tool", label: "Tools" },
  { key: "agent", label: "Agents" },
  { key: "prompt", label: "Prompts" },
  { key: "skill", label: "Skills" }
];

export function SearchWorkspace(props: { initialQuery: string; initialType: string; initialPlatform: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [q, setQ] = useState(props.initialQuery ?? "");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [type, setType] = useState<"all" | DocType>(() => {
    const t = (props.initialType ?? "").toLowerCase();
    if (t === "tool" || t === "agent" || t === "prompt" || t === "skill" || t === "playbook") return t;
    return "all";
  });

  const [platform, setPlatform] = useState(() => (props.initialPlatform ?? "").toLowerCase());

  const [results, setResults] = useState<SearchDoc[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<Record<DocType, number>>({ tool: 0, agent: 0, prompt: 0, skill: 0, playbook: 0 });
  const [availablePlatforms, setAvailablePlatforms] = useState<string[]>([]);

  const [limit, setLimit] = useState(24);

  const indexRef = useRef<{ mini: MiniSearchType; docsById: Map<string, SearchDoc> } | null>(null);

  const platformEnabled = type === "all" || type === "tool" || type === "agent";

  const queryFromUrl = sp?.get("q") ?? "";
  const typeFromUrl = (sp?.get("type") ?? "").toLowerCase();
  const platformFromUrl = (sp?.get("platform") ?? "").toLowerCase();

  // Keep local state in sync with URL changes (back/forward).
  useEffect(() => {
    if (typeof queryFromUrl === "string" && queryFromUrl !== q) setQ(queryFromUrl);
    const urlType = ((): "all" | DocType => {
      if (typeFromUrl === "tool" || typeFromUrl === "agent" || typeFromUrl === "prompt" || typeFromUrl === "skill" || typeFromUrl === "playbook")
        return typeFromUrl;
      return "all";
    })();
    if (urlType !== type) setType(urlType);
    if (platformFromUrl !== platform) setPlatform(platformFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryFromUrl, typeFromUrl, platformFromUrl]);

  function setParams(next: { q?: string; type?: string; platform?: string }) {
    const params = new URLSearchParams(sp?.toString() ?? "");
    if (typeof next.q === "string") {
      if (next.q.trim()) params.set("q", next.q.trim());
      else params.delete("q");
    }
    if (typeof next.type === "string") {
      if (next.type && next.type !== "all") params.set("type", next.type);
      else params.delete("type");
    }
    if (typeof next.platform === "string") {
      if (next.platform && next.platform !== "all") params.set("platform", next.platform);
      else params.delete("platform");
    }
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`);
  }

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
      const mini = MiniSearch.loadJSON(JSON.stringify(data.index) as never, {
        fields: ["title", "description", "tags", "categories"],
        storeFields: ["id", "type", "slug", "title", "description", "platform"],
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
      indexRef.current = null;
    }
  }

  const placeholder = useMemo(() => "e.g., motion to compel, vendor contract redlines, discovery responses", []);

  function computePipeline(allMatched: SearchDoc[]) {
    const plat = normalizePlatform(platform);
    const platformFiltered = plat
      ? allMatched.filter((d) => (d.type === "tool" || d.type === "agent") && (d.platform ?? []).some((p) => normalizePlatform(p) === plat))
      : allMatched;

    const nextCounts: Record<DocType, number> = { tool: 0, agent: 0, prompt: 0, skill: 0, playbook: 0 };
    for (const d of platformFiltered) nextCounts[d.type] = (nextCounts[d.type] ?? 0) + 1;
    setCounts(nextCounts);

    const plats = uniq(
      platformFiltered
        .filter((d) => d.type === "tool" || d.type === "agent")
        .flatMap((d) => d.platform ?? [])
        .map(normalizePlatform)
        .filter(Boolean)
    ).sort((a, b) => prettyPlatform(a).localeCompare(prettyPlatform(b)));
    setAvailablePlatforms(plats);

    const typed = type === "all" ? platformFiltered : platformFiltered.filter((d) => d.type === type);

    setTotal(typed.length);
    setResults(typed.slice(0, limit));
  }

  async function runSearch() {
    const raw = q.trim();
    setErr(null);
    setBusy(true);
    setLimit(24);

    try {
      await ensureIndexLoaded();
      const idx = indexRef.current;
      if (!idx) {
        setResults([]);
        setTotal(0);
        setCounts({ tool: 0, agent: 0, prompt: 0, skill: 0, playbook: 0 });
        setAvailablePlatforms([]);
        setErr("Search index not available.");
        return;
      }

      if (!raw) {
        setResults([]);
        setTotal(0);
        setCounts({ tool: 0, agent: 0, prompt: 0, skill: 0, playbook: 0 });
        setAvailablePlatforms([]);
        return;
      }

      const hits = idx.mini.search(raw, { combineWith: "AND" }).slice(0, 240);
      const mapped: SearchDoc[] = [];
      for (const h of hits) {
        const doc = idx.docsById.get(h.id);
        if (doc) mapped.push(doc);
      }

      computePipeline(mapped);
      if (mapped.length === 0) setErr("No matches. Try different wording (or a more specific deliverable).");
    } finally {
      setBusy(false);
    }
  }

  // Debounced compute for URL-driven changes (type/platform/limit) without refetching.
  useEffect(() => {
    let cancelled = false;
    const t = window.setTimeout(async () => {
      if (cancelled) return;
      await ensureIndexLoaded();
      const idx = indexRef.current;
      if (!idx) return;
      const raw = (sp?.get("q") ?? "").trim();
      if (!raw) return;
      const hits = idx.mini.search(raw, { combineWith: "AND" }).slice(0, 240);
      const mapped: SearchDoc[] = [];
      for (const h of hits) {
        const doc = idx.docsById.get(h.id);
        if (doc) mapped.push(doc);
      }
      computePipeline(mapped);
    }, 40);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, platform, limit]);

  useEffect(() => {
    // auto-run on initial query
    if ((props.initialQuery ?? "").trim()) void runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div data-search-root className="mt-5">
      <div className="card cb-searchWorkspaceShell">
        <div className="label" style={{ marginBottom: 10 }}>
          Describe your next deliverable
        </div>

        <div className="cb-searchWorkspaceBar">
          <textarea
            className="cb-searchWorkspaceBar__input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                setParams({ q, type, platform: platformEnabled ? platform : "" });
                void runSearch();
              }
            }}
            placeholder={placeholder}
            aria-label="Search query"
            rows={3}
            spellCheck={false}
          />
          <button
            type="button"
            className="cb-searchWorkspaceBar__go"
            onClick={() => {
              setParams({ q, type, platform: platformEnabled ? platform : "" });
              void runSearch();
            }}
            disabled={busy}
            aria-label="Search"
            title="Search"
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>

        <div className="mt-3 flex flex--between flex--resp-col" style={{ gap: 12, alignItems: "center" }}>
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
      </div>

      <div className="mt-5">
        <div className="cb-tabRow" role="tablist" aria-label="Result type">
          {TYPE_TABS.map((t) => {
            const selected = type === t.key;
            const count =
              t.key === "all"
                ? counts.tool + counts.agent + counts.prompt + counts.skill
                : t.key === "tool"
                  ? counts.tool
                  : t.key === "agent"
                    ? counts.agent
                    : t.key === "prompt"
                      ? counts.prompt
                      : counts.skill;
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={selected}
                className={`cb-tab ${selected ? "is-active" : ""}`}
                onClick={() => {
                  const next = t.key;
                  // Platform is only meaningful for tools/agents/all.
                  const nextPlatform = next === "prompt" || next === "skill" ? "" : platform;
                  setType(next);
                  setParams({ q, type: next, platform: nextPlatform });
                }}
              >
                {t.label}
                <span className="cb-tab__count" aria-hidden="true">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex--between flex--resp-col" style={{ gap: 14, alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <label className="label" htmlFor="platform" style={{ marginBottom: 8 }}>
              Platform
            </label>
            <select
              id="platform"
              className="input"
              value={platformEnabled ? (platform || "all") : "all"}
              onChange={(e) => {
                const next = e.target.value === "all" ? "" : e.target.value;
                setPlatform(next);
                setParams({ q, type, platform: next });
              }}
              disabled={!platformEnabled}
              aria-disabled={!platformEnabled}
            >
              <option value="all">All platforms</option>
              {availablePlatforms.map((p) => (
                <option key={p} value={p}>
                  {prettyPlatform(p)}
                </option>
              ))}
            </select>
            {!platformEnabled && (
              <div className="text-muted mt-2" style={{ fontSize: "0.8125rem" }}>
                Platform filtering is available for Tools and Agents.
              </div>
            )}
          </div>

          <div className="flex flex--gap-2">
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={() => {
                setQ("");
                setType("all");
                setPlatform("");
                setResults([]);
                setTotal(0);
                setCounts({ tool: 0, agent: 0, prompt: 0, skill: 0, playbook: 0 });
                setAvailablePlatforms([]);
                setErr(null);
                setParams({ q: "", type: "all", platform: "" });
              }}
              disabled={busy}
            >
              Clear
            </button>
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => {
                setParams({ q, type, platform: platformEnabled ? platform : "" });
                void runSearch();
              }}
              disabled={busy}
            >
              Apply
            </button>
          </div>
        </div>

        {err && (
          <div className="mt-4 text-muted" style={{ fontSize: "0.95rem" }}>
            {err}
          </div>
        )}

        {total > 0 && (
          <div className="mt-4 text-muted" style={{ fontSize: "0.875rem" }}>
            Showing <strong className="text-white">{results.length}</strong> of <strong className="text-white">{total}</strong>
          </div>
        )}

        <div className="mt-4" style={{ display: "grid", gap: 12 }}>
          {results.map((r) => (
            <Link key={`${r.id}-${r.slug}`} href={routeFor(r)} className="card cb-searchResult" data-search-result-item>
              <div className="flex flex--between" style={{ gap: 12, alignItems: "baseline" }}>
                <div className="text-white" style={{ fontWeight: 700, fontSize: "1.05rem" }}>
                  {r.title}
                </div>
                <span className="label label--pill" style={{ margin: 0, padding: "6px 10px" }}>
                  {typeLabel(r.type)}
                </span>
              </div>
              <div className="text-muted" style={{ marginTop: 10, fontSize: "0.9375rem", lineHeight: 1.5 }}>
                {r.description}
              </div>
              {(r.type === "tool" || r.type === "agent") && (r.platform ?? []).length > 0 && (
                <div className="mt-3 text-muted" style={{ fontSize: "0.8125rem" }}>
                  Platform: {(r.platform ?? []).map(prettyPlatform).join(", ")}
                </div>
              )}
            </Link>
          ))}
        </div>

        {total > results.length && (
          <div className="mt-5" style={{ textAlign: "center" }}>
            <button
              type="button"
              className="btn btn--secondary btn--arrow"
              onClick={() => setLimit((n) => Math.min(n + 24, 240))}
              disabled={busy}
            >
              Load more
            </button>
          </div>
        )}

        <div className="mt-5 text-muted" style={{ fontSize: "0.8125rem" }}>
          Prefer browsing? <Link href="/tools">Tools</Link>, <Link href="/prompts">Prompts</Link>, <Link href="/skills">Skills</Link>.
        </div>
      </div>
    </div>
  );
}
