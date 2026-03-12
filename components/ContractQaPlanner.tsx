"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ContractQaDefaults } from "@/lib/contract-qa-bot";

type PlannerResource = {
  slug: string;
  title: string;
  description: string;
  url: string;
};

type Deployment = "pilot" | "production";
type DataSensitivity = "standard" | "confidential" | "regulated";
type Latency = "standard" | "fast";
type Volume = "low" | "medium" | "high";
type CitationMode = "baseline" | "strict";

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

function recommendSettings(args: {
  defaults: ContractQaDefaults;
  deployment: Deployment;
  sensitivity: DataSensitivity;
  latency: Latency;
  volume: Volume;
  citationMode: CitationMode;
}) {
  const baseChunk = args.defaults.chunkSize ?? 1024;
  const baseOverlap = args.defaults.chunkOverlap ?? 200;
  const baseK = args.defaults.retrieverK ?? 20;

  let chunkSize = baseChunk;
  let overlap = baseOverlap;
  let retrieverK = baseK;

  if (args.volume === "high") {
    chunkSize += 256;
    overlap += 40;
  }
  if (args.volume === "low") {
    chunkSize = Math.max(512, chunkSize - 128);
  }

  if (args.latency === "fast") {
    retrieverK = Math.max(8, retrieverK - 6);
    chunkSize = Math.max(512, Math.round(chunkSize * 0.88));
  }

  if (args.citationMode === "strict") {
    retrieverK += 6;
    overlap += 40;
  }

  if (args.sensitivity === "regulated") {
    retrieverK += 2;
  }

  const modelRecommendation =
    args.deployment === "pilot"
      ? `Start with ${args.defaults.modelName ?? "baseline model"}.`
      : args.citationMode === "strict"
        ? "Move to a higher-accuracy model tier and enforce answer grounding/citation checks."
        : `Keep ${args.defaults.modelName ?? "baseline model"} for cost control, then upgrade only if quality fails evals.`;

  const governanceTrack =
    args.sensitivity === "regulated"
      ? "Add redaction, retention controls, and human approval for high-risk answers."
      : args.sensitivity === "confidential"
        ? "Add contract-level access controls and audit logging for document uploads."
        : "Use baseline access controls and monitoring, then harden based on incident findings.";

  return {
    chunkSize,
    overlap,
    retrieverK,
    modelRecommendation,
    governanceTrack
  };
}

export function ContractQaPlanner(props: {
  defaults: ContractQaDefaults;
  components: PlannerResource[];
  dependencies: PlannerResource[];
  tasks: PlannerResource[];
}) {
  const [deployment, setDeployment] = useState<Deployment>("pilot");
  const [sensitivity, setSensitivity] = useState<DataSensitivity>("confidential");
  const [latency, setLatency] = useState<Latency>("standard");
  const [volume, setVolume] = useState<Volume>("medium");
  const [citationMode, setCitationMode] = useState<CitationMode>("strict");
  const [includeEval, setIncludeEval] = useState(true);

  const recommendations = useMemo(
    () => recommendSettings({ defaults: props.defaults, deployment, sensitivity, latency, volume, citationMode }),
    [props.defaults, deployment, sensitivity, latency, volume, citationMode]
  );

  const planRows = useMemo(() => {
    const phases: Array<{ phase: string; title: string; detail: string; url: string }> = [];

    for (const c of props.components.slice(0, 3)) {
      phases.push({ phase: "Phase 1: Foundation", title: c.title, detail: c.description, url: c.url });
    }

    for (const c of props.components.slice(3)) {
      phases.push({ phase: "Phase 2: Retrieval and QA", title: c.title, detail: c.description, url: c.url });
    }

    for (const d of props.dependencies.slice(0, 3)) {
      phases.push({ phase: "Phase 2: Stack hardening", title: d.title, detail: d.description, url: d.url });
    }

    for (const t of props.tasks.slice(0, includeEval ? 4 : 3)) {
      phases.push({ phase: includeEval ? "Phase 3: Eval and optimization" : "Phase 3: Optimization", title: t.title, detail: t.description, url: t.url });
    }

    if (includeEval && props.tasks.length > 4) {
      for (const t of props.tasks.slice(4, 6)) {
        phases.push({ phase: "Phase 4: Reporting and rollout", title: t.title, detail: t.description, url: t.url });
      }
    }

    return phases;
  }, [props.components, props.dependencies, props.tasks, includeEval]);

  function exportJson() {
    const payload = {
      generated_at: new Date().toISOString(),
      assumptions: {
        deployment,
        data_sensitivity: sensitivity,
        latency_target: latency,
        contract_volume: volume,
        citation_mode: citationMode,
        include_eval_track: includeEval
      },
      recommended_settings: {
        chunk_size: recommendations.chunkSize,
        chunk_overlap: recommendations.overlap,
        retriever_k: recommendations.retrieverK,
        base_model: props.defaults.modelName,
        model_recommendation: recommendations.modelRecommendation,
        governance_track: recommendations.governanceTrack
      },
      plan: planRows
    };

    triggerDownload("counterbench-contract-qa-plan.json", JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
  }

  function exportCsv() {
    const header = ["phase", "title", "detail", "url", "chunk_size", "chunk_overlap", "retriever_k"];
    const rows = planRows.map((p) => [
      p.phase,
      p.title,
      p.detail,
      p.url,
      String(recommendations.chunkSize),
      String(recommendations.overlap),
      String(recommendations.retrieverK)
    ]);

    const csv = [header.join(","), ...rows.map((r) => r.map((x) => escapeCsv(x)).join(","))].join("\n");
    triggerDownload("counterbench-contract-qa-plan.csv", csv, "text/csv;charset=utf-8");
  }

  return (
    <div className="mt-5">
      <div
        className="card"
        style={{
          borderRadius: 18,
          border: "1px solid color-mix(in srgb, var(--border) 68%, #f59e0b 32%)",
          background:
            "linear-gradient(160deg, color-mix(in srgb, #111827 84%, #7c2d12 16%) 0%, color-mix(in srgb, #020617 90%, #0f172a 10%) 100%)"
        }}
      >
        <div className="label">Free tool</div>
        <div className="text-white" style={{ fontSize: "1.9rem", fontWeight: 850, lineHeight: 1.1, letterSpacing: "-0.03em" }}>
          Contract QA Stack Planner
        </div>
        <p className="text-muted" style={{ marginTop: 10, maxWidth: 820, fontSize: "1.03rem", lineHeight: 1.55 }}>
          Generate an implementation plan from the Legal Contract Q&A Bot architecture, then tune chunking and retrieval defaults for your risk and latency targets.
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
            <label className="label" htmlFor="cqa-deployment">
              Deployment stage
            </label>
            <select
              id="cqa-deployment"
              value={deployment}
              onChange={(e) => setDeployment(e.target.value as Deployment)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--input-bg)", color: "var(--fg)" }}
            >
              <option value="pilot">Pilot</option>
              <option value="production">Production</option>
            </select>
          </div>

          <div>
            <label className="label" htmlFor="cqa-sensitivity">
              Data sensitivity
            </label>
            <select
              id="cqa-sensitivity"
              value={sensitivity}
              onChange={(e) => setSensitivity(e.target.value as DataSensitivity)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--input-bg)", color: "var(--fg)" }}
            >
              <option value="standard">Standard</option>
              <option value="confidential">Confidential</option>
              <option value="regulated">Regulated / high-risk</option>
            </select>
          </div>

          <div>
            <label className="label" htmlFor="cqa-latency">
              Latency target
            </label>
            <select
              id="cqa-latency"
              value={latency}
              onChange={(e) => setLatency(e.target.value as Latency)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--input-bg)", color: "var(--fg)" }}
            >
              <option value="standard">Standard</option>
              <option value="fast">Fast response</option>
            </select>
          </div>

          <div>
            <label className="label" htmlFor="cqa-volume">
              Contract volume
            </label>
            <select
              id="cqa-volume"
              value={volume}
              onChange={(e) => setVolume(e.target.value as Volume)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--input-bg)", color: "var(--fg)" }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="label" htmlFor="cqa-citations">
              Citation rigor
            </label>
            <select
              id="cqa-citations"
              value={citationMode}
              onChange={(e) => setCitationMode(e.target.value as CitationMode)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--input-bg)", color: "var(--fg)" }}
            >
              <option value="baseline">Baseline</option>
              <option value="strict">Strict grounding</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 14, flexWrap: "wrap" }}>
          <label className="text-muted" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "0.9rem" }}>
            <input type="checkbox" checked={includeEval} onChange={(e) => setIncludeEval(e.target.checked)} />
            Include evaluation and reporting phase
          </label>
        </div>
      </div>

      <div className="card mt-4" style={{ borderRadius: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <div className="label">Recommended baseline</div>
            <div className="text-white" style={{ fontWeight: 800, fontSize: "1.25rem", letterSpacing: "-0.02em" }}>
              chunk={recommendations.chunkSize} • overlap={recommendations.overlap} • k={recommendations.retrieverK}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn btn--secondary btn--sm" onClick={exportCsv}>
              Export CSV
            </button>
            <button className="btn btn--secondary btn--sm" onClick={exportJson}>
              Export JSON
            </button>
            <Link className="btn btn--primary btn--sm" href="/newsletter">
              Get implementation updates
            </Link>
          </div>
        </div>

        <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
          <div className="text-muted" style={{ lineHeight: 1.5 }}>
            Model track: {recommendations.modelRecommendation}
          </div>
          <div className="text-muted" style={{ lineHeight: 1.5 }}>
            Governance: {recommendations.governanceTrack}
          </div>
          <div className="text-muted" style={{ lineHeight: 1.5 }}>
            Source defaults observed in repo: chunk {props.defaults.chunkSize ?? "N/A"}, overlap {props.defaults.chunkOverlap ?? "N/A"}, retriever k {props.defaults.retrieverK ?? "N/A"}, model {props.defaults.modelName ?? "N/A"}.
          </div>
        </div>

        <div className="mt-4" style={{ display: "grid", gap: 10 }}>
          {planRows.map((row, i) => (
            <article
              key={`${row.phase}-${row.title}-${i}`}
              className="card"
              style={{ borderRadius: 12, padding: "0.95rem", background: "color-mix(in srgb, var(--bg2) 86%, #f59e0b 14%)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                <div className="label" style={{ margin: 0 }}>
                  {row.phase}
                </div>
                <a href={row.url} target="_blank" rel="noreferrer" className="text-muted" style={{ fontSize: "0.8rem", textDecoration: "none" }}>
                  Source
                </a>
              </div>
              <div className="text-white" style={{ fontWeight: 700, marginTop: 6 }}>
                {row.title}
              </div>
              <div className="text-muted" style={{ marginTop: 6, lineHeight: 1.45 }}>
                {row.detail}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="text-muted" style={{ marginTop: 14, fontSize: "0.82rem", lineHeight: 1.5 }}>
        Planner output is a starting architecture plan. Validate legal policy, security boundaries, and answer quality before user-facing deployment.
      </div>
    </div>
  );
}
