"use client";

import { useMemo, useState } from "react";
import { rankLegalDataSources, sourceTypeLabel, type FinderTask, type SourceFinderFilters } from "@/lib/legal-data-core";
import { NewsletterCapture } from "@/components/NewsletterCapture";

type SourceRecord = {
  slug: string;
  title: string;
  description: string;
  url: string;
  type: "program" | "research" | "toolkit" | "policy" | "community" | "course" | "news" | "other";
  tags: string[];
  jurisdiction: string[];
  source_type: "case-law" | "statutes-regulation" | "dockets-filings" | "scholarship" | "datasets-benchmarks" | "research-platform" | "other";
  access: Array<"open" | "commercial" | "api" | "bulk" | "mixed" | "unknown">;
  coverage: string;
  license_notes: string;
  best_for: string[];
  last_checked: string | null;
};

const TASK_OPTIONS: Array<{ value: FinderTask; label: string; hint: string }> = [
  { value: "research", label: "Research", hint: "Find primary materials quickly" },
  { value: "citation-check", label: "Citation check", hint: "Backstop AI claims with primary authority" },
  { value: "docket-watch", label: "Docket watch", hint: "Track filings and case movement" },
  { value: "policy-check", label: "Policy check", hint: "Locate current statutes and regulations" },
  { value: "benchmarking", label: "Benchmarking", hint: "Find datasets for evaluation or model testing" }
];

function taskLabel(v: FinderTask | ""): string {
  if (!v) return "Any task";
  return TASK_OPTIONS.find((t) => t.value === v)?.label ?? v;
}

function accessLabel(access: string): string {
  if (access === "api") return "API";
  if (access === "open") return "Open";
  if (access === "commercial") return "Commercial";
  if (access === "bulk") return "Bulk";
  if (access === "mixed") return "Mixed";
  return "Unknown";
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes("\n") || value.includes('"')) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

function triggerDownload(filename: string, content: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function LegalDataSourceFinder(props: {
  sources: SourceRecord[];
  jurisdictions: string[];
  sourceTypes: string[];
}) {
  const [jurisdiction, setJurisdiction] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [task, setTask] = useState<FinderTask | "">("");
  const [query, setQuery] = useState("");
  const [onlyApi, setOnlyApi] = useState(false);

  const filters = useMemo<SourceFinderFilters>(
    () => ({ jurisdiction, sourceType, task, query, onlyApi }),
    [jurisdiction, sourceType, task, query, onlyApi]
  );

  const ranked = useMemo(() => rankLegalDataSources(props.sources, filters), [props.sources, filters]);
  const top = ranked.slice(0, 24);

  const canExport = ranked.length > 0;

  function exportJson() {
    if (!canExport) return;
    const payload = {
      generated_at: new Date().toISOString(),
      filters,
      count: ranked.length,
      sources: ranked.map((r) => ({
        title: r.title,
        url: r.url,
        jurisdiction: r.jurisdiction,
        source_type: r.source_type,
        access: r.access,
        best_for: r.best_for,
        coverage: r.coverage,
        license_notes: r.license_notes
      }))
    };

    triggerDownload("counterbench-source-pack.json", JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
  }

  function exportCsv() {
    if (!canExport) return;

    const header = ["title", "url", "jurisdiction", "source_type", "access", "best_for", "coverage", "license_notes"];
    const rows = ranked.map((r) =>
      [
        r.title,
        r.url,
        r.jurisdiction.join(" | "),
        sourceTypeLabel(r.source_type),
        r.access.map(accessLabel).join(" | "),
        r.best_for.join(" | "),
        r.coverage,
        r.license_notes
      ].map((cell) => escapeCsv(cell ?? ""))
    );

    const csv = [header.join(","), ...rows.map((row) => row.join(","))].join("\n");
    triggerDownload("counterbench-source-pack.csv", csv, "text/csv;charset=utf-8");
  }

  return (
    <div className="mt-5">
      <div
        className="card"
        style={{
          borderRadius: 18,
          border: "1px solid color-mix(in srgb, var(--border) 72%, #22d3ee 28%)",
          background:
            "linear-gradient(155deg, color-mix(in srgb, #0f172a 85%, #155e75 15%) 0%, color-mix(in srgb, #020617 88%, #0b1120 12%) 55%, #020617 100%)"
        }}
      >
        <div className="label">Free tool</div>
        <div className="text-white" style={{ fontSize: "1.9rem", fontWeight: 850, lineHeight: 1.1, letterSpacing: "-0.03em" }}>
          Legal Data Source Finder
        </div>
        <p className="text-muted" style={{ marginTop: 10, maxWidth: 760, fontSize: "1.03rem", lineHeight: 1.55 }}>
          Match your matter context to vetted source stacks from the Awesome Legal Data universe. Build a defensible source pack in under a minute.
        </p>

        <div
          className="mt-5"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: 10,
            alignItems: "end"
          }}
        >
          <div>
            <label className="label" htmlFor="finder-jurisdiction">
              Jurisdiction
            </label>
            <select
              id="finder-jurisdiction"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--input-bg)", color: "var(--fg)" }}
            >
              <option value="">All jurisdictions</option>
              {props.jurisdictions.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="finder-source-type">
              Source type
            </label>
            <select
              id="finder-source-type"
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--input-bg)", color: "var(--fg)" }}
            >
              <option value="">Any source type</option>
              {props.sourceTypes.map((s) => (
                <option key={s} value={s}>
                  {sourceTypeLabel(s)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="finder-task">
              Task
            </label>
            <select
              id="finder-task"
              value={task}
              onChange={(e) => setTask(e.target.value as FinderTask | "")}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--input-bg)", color: "var(--fg)" }}
            >
              <option value="">Any task</option>
              {TASK_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="finder-query">
              Keyword
            </label>
            <input
              id="finder-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. federal register, contracts, tribunal"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--input-bg)", color: "var(--fg)" }}
            />
          </div>
        </div>

        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <label className="text-muted" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "0.9rem" }}>
            <input type="checkbox" checked={onlyApi} onChange={(e) => setOnlyApi(e.target.checked)} />
            API-ready only
          </label>
          <div className="text-muted" style={{ fontSize: "0.86rem" }}>
            Current filter: {jurisdiction || "all jurisdictions"} / {sourceType ? sourceTypeLabel(sourceType) : "any source type"} / {taskLabel(task)}
          </div>
        </div>
      </div>

      <div className="card mt-4" style={{ borderRadius: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <div className="label">Ranked results</div>
            <div className="text-white" style={{ fontWeight: 800, fontSize: "1.25rem", letterSpacing: "-0.02em" }}>
              {ranked.length} sources matched
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn btn--secondary btn--sm" disabled={!canExport} onClick={exportCsv}>
              Export CSV
            </button>
            <button className="btn btn--secondary btn--sm" disabled={!canExport} onClick={exportJson}>
              Export JSON
            </button>
            <button className="btn btn--primary btn--sm" onClick={() => document.getElementById("source-finder-newsletter")?.scrollIntoView({ behavior: "smooth" })}>
              Get weekly source updates
            </button>
          </div>
        </div>

        {top.length === 0 ? (
          <div className="text-muted" style={{ marginTop: 14 }}>
            No matches yet. Adjust a filter or remove one constraint.
          </div>
        ) : (
          <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
            {top.map((source) => (
              <article
                key={source.slug}
                className="card"
                style={{ borderRadius: 12, padding: "1rem", background: "color-mix(in srgb, var(--bg2) 86%, #0ea5e9 14%)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <div>
                    <a href={source.url} target="_blank" rel="noreferrer" className="text-white" style={{ fontWeight: 800, textDecoration: "none" }}>
                      {source.title}
                    </a>
                    <div className="text-muted" style={{ marginTop: 6, lineHeight: 1.45 }}>
                      {source.description}
                    </div>
                  </div>
                  <div className="label label--pill" style={{ margin: 0 }}>
                    Score {source.score.toFixed(1)}
                  </div>
                </div>

                <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <span className="label label--pill" style={{ margin: 0 }}>
                    {sourceTypeLabel(source.source_type)}
                  </span>
                  {(source.jurisdiction ?? []).slice(0, 2).map((j) => (
                    <span key={j} className="label label--pill" style={{ margin: 0 }}>
                      {j}
                    </span>
                  ))}
                  {(source.access ?? []).map((a) => (
                    <span key={a} className="label label--pill" style={{ margin: 0 }}>
                      {accessLabel(a)}
                    </span>
                  ))}
                </div>

                <div className="text-muted" style={{ marginTop: 10, fontSize: "0.84rem" }}>
                  Why this matched: {source.match_reasons.join(" · ")}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="text-muted" style={{ marginTop: 14, fontSize: "0.82rem", lineHeight: 1.5 }}>
        Source metadata is normalized from the Awesome Legal Data index. Always verify licensing and currency with the underlying primary source before relying on
        outputs in legal work.
      </div>

      <div id="source-finder-newsletter" className="card mt-5" style={{ borderRadius: 16 }}>
        <div className="label">Stay current</div>
        <div className="text-white" style={{ fontWeight: 800, fontSize: "1.25rem", letterSpacing: "-0.02em", marginTop: 4 }}>
          New sources added weekly
        </div>
        <p className="text-muted" style={{ marginTop: 6, maxWidth: 560, lineHeight: 1.55 }}>
          Get notified when we index new US legal data sources, API changes, and licensing updates that affect your workflows.
        </p>
        <div style={{ marginTop: 12, maxWidth: 480 }}>
          <NewsletterCapture source="source-finder" />
        </div>
      </div>
    </div>
  );
}
