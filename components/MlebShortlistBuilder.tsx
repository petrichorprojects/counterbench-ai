"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { MlebModelSummary, MlebShortlistFilters } from "@/lib/mleb";

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

export function MlebShortlistBuilder(props: { models: MlebModelSummary[] }) {
  const [openOnly, setOpenOnly] = useState(true);
  const [focus, setFocus] = useState<MlebShortlistFilters["focus"]>("balanced");
  const [speed, setSpeed] = useState<MlebShortlistFilters["speed"]>("balanced");
  const [minContextWindow, setMinContextWindow] = useState<number>(8192);

  const ranked = useMemo(() => {
    const filtered = props.models
      .filter((m) => (openOnly ? m.openSource : true))
      .filter((m) => m.contextWindow >= minContextWindow)
      .map((m) => {
        const focusScore = focus === "caselaw" ? m.caselawScore : focus === "regulation" ? m.regulationScore : focus === "contracts" ? m.contractsScore : m.averageScore;

        const times = props.models.map((x) => x.averageTime);
        const min = Math.min(...times);
        const max = Math.max(...times);
        const speedNorm = max - min < 1e-9 ? 1 : 1 - (m.averageTime - min) / (max - min);

        let rankScore = focusScore;
        if (speed === "balanced") rankScore = focusScore * 0.85 + speedNorm * 0.15;
        if (speed === "fast") rankScore = focusScore * 0.7 + speedNorm * 0.3;

        return { ...m, rankScore };
      })
      .sort((a, b) => b.rankScore - a.rankScore || a.name.localeCompare(b.name));

    return filtered;
  }, [props.models, openOnly, focus, speed, minContextWindow]);

  const top = ranked.slice(0, 12);

  function exportJson() {
    const payload = {
      generated_at: new Date().toISOString(),
      filters: { openOnly, focus, speed, minContextWindow },
      count: ranked.length,
      models: ranked.map((m) => ({
        name: m.name,
        provider: m.provider,
        open_source: m.openSource,
        rank_score: m.rankScore,
        average_score: m.averageScore,
        average_time_seconds: m.averageTime,
        context_window: m.contextWindow,
        dimensions: m.embeddingDimensions,
        link: m.link
      }))
    };

    triggerDownload("counterbench-mleb-shortlist.json", JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
  }

  function exportCsv() {
    const header = [
      "name",
      "provider",
      "open_source",
      "rank_score",
      "average_score",
      "caselaw_score",
      "regulation_score",
      "contracts_score",
      "average_time_seconds",
      "context_window",
      "embedding_dimensions",
      "link"
    ];

    const rows = ranked.map((m) =>
      [
        m.name,
        m.provider,
        String(m.openSource),
        m.rankScore.toFixed(4),
        m.averageScore.toFixed(4),
        m.caselawScore.toFixed(4),
        m.regulationScore.toFixed(4),
        m.contractsScore.toFixed(4),
        m.averageTime.toFixed(2),
        String(m.contextWindow),
        String(m.embeddingDimensions),
        m.link
      ].map((c) => escapeCsv(c))
    );

    const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    triggerDownload("counterbench-mleb-shortlist.csv", csv, "text/csv;charset=utf-8");
  }

  return (
    <div className="mt-5">
      <div
        className="card"
        style={{
          borderRadius: 18,
          border: "1px solid color-mix(in srgb, var(--border) 68%, #22d3ee 32%)",
          background:
            "linear-gradient(160deg, color-mix(in srgb, #0f172a 84%, #155e75 16%) 0%, color-mix(in srgb, #020617 90%, #0b1120 10%) 100%)"
        }}
      >
        <div className="label">Free tool</div>
        <div className="text-white" style={{ fontSize: "1.9rem", fontWeight: 850, lineHeight: 1.1, letterSpacing: "-0.03em" }}>
          MLEB Model Shortlist Builder
        </div>
        <p className="text-muted" style={{ marginTop: 10, maxWidth: 830, fontSize: "1.03rem", lineHeight: 1.55 }}>
          Translate benchmark results into a practical shortlist for legal retrieval stacks. Filter by open-source policy, legal focus, speed profile, and context window.
        </p>

        <div
          className="mt-5"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 10,
            alignItems: "end"
          }}
        >
          <div>
            <label className="label" htmlFor="mleb-focus">
              Legal focus
            </label>
            <select
              id="mleb-focus"
              value={focus}
              onChange={(e) => setFocus(e.target.value as MlebShortlistFilters["focus"])}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--input-bg)", color: "var(--fg)" }}
            >
              <option value="balanced">Balanced</option>
              <option value="caselaw">Case law</option>
              <option value="regulation">Regulation</option>
              <option value="contracts">Contracts</option>
            </select>
          </div>

          <div>
            <label className="label" htmlFor="mleb-speed">
              Optimization goal
            </label>
            <select
              id="mleb-speed"
              value={speed}
              onChange={(e) => setSpeed(e.target.value as MlebShortlistFilters["speed"])}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--input-bg)", color: "var(--fg)" }}
            >
              <option value="quality">Quality first</option>
              <option value="balanced">Balanced</option>
              <option value="fast">Speed first</option>
            </select>
          </div>

          <div>
            <label className="label" htmlFor="mleb-context">
              Min context window
            </label>
            <select
              id="mleb-context"
              value={String(minContextWindow)}
              onChange={(e) => setMinContextWindow(Number.parseInt(e.target.value, 10) || 8192)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--input-bg)", color: "var(--fg)" }}
            >
              <option value="8192">8,192 tokens</option>
              <option value="16384">16,384 tokens</option>
              <option value="32000">32,000 tokens</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 14, flexWrap: "wrap" }}>
          <label className="text-muted" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "0.9rem" }}>
            <input type="checkbox" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} />
            Open-source models only
          </label>
          <div className="text-muted" style={{ fontSize: "0.86rem" }}>
            Matched models: {ranked.length}
          </div>
        </div>
      </div>

      <div className="card mt-4" style={{ borderRadius: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <div className="label">Shortlist output</div>
            <div className="text-white" style={{ fontWeight: 800, fontSize: "1.25rem", letterSpacing: "-0.02em" }}>
              Top {Math.min(top.length, 12)} models
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn btn--secondary btn--sm" disabled={ranked.length === 0} onClick={exportCsv}>
              Export CSV
            </button>
            <button className="btn btn--secondary btn--sm" disabled={ranked.length === 0} onClick={exportJson}>
              Export JSON
            </button>
            <Link className="btn btn--primary btn--sm" href="/newsletter">
              Get benchmark updates
            </Link>
          </div>
        </div>

        {top.length === 0 ? (
          <div className="text-muted" style={{ marginTop: 14 }}>
            No models match current filters.
          </div>
        ) : (
          <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
            {top.map((model) => (
              <article
                key={model.id}
                className="card"
                style={{ borderRadius: 12, padding: "1rem", background: "color-mix(in srgb, var(--bg2) 86%, #0ea5e9 14%)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <div>
                    <a href={model.link} target="_blank" rel="noreferrer" className="text-white" style={{ fontWeight: 800, textDecoration: "none" }}>
                      {model.name}
                    </a>
                    <div className="text-muted" style={{ marginTop: 6 }}>
                      {model.provider} • {model.openSource ? "Open-source" : "Closed-source"}
                    </div>
                  </div>
                  <div className="label label--pill" style={{ margin: 0 }}>
                    Rank {model.rankScore.toFixed(4)}
                  </div>
                </div>

                <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
                  <div className="text-muted">Avg score: {model.averageScore.toFixed(4)}</div>
                  <div className="text-muted">Case law: {model.caselawScore.toFixed(4)}</div>
                  <div className="text-muted">Regulation: {model.regulationScore.toFixed(4)}</div>
                  <div className="text-muted">Contracts: {model.contractsScore.toFixed(4)}</div>
                  <div className="text-muted">Avg time: {model.averageTime.toFixed(2)}s</div>
                  <div className="text-muted">Context: {model.contextWindow}</div>
                  <div className="text-muted">Dims: {model.embeddingDimensions}</div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="text-muted" style={{ marginTop: 14, fontSize: "0.82rem", lineHeight: 1.5 }}>
        Use this as a starting shortlist, then run your own eval set for jurisdiction-specific edge cases before production rollout.
      </div>
    </div>
  );
}
