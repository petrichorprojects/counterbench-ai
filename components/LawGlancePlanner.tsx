"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type PlannerResource = {
  slug: string;
  title: string;
  description: string;
  url: string;
};

type Audience = "legal-aid" | "law-firm" | "in-house" | "student";
type Goal = "research-assistant" | "document-drafting" | "case-management" | "citizen-helpdesk";
type Horizon = "30" | "60" | "90";

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

function includesAny(hay: string, needles: string[]): boolean {
  const h = hay.toLowerCase();
  return needles.some((n) => h.includes(n));
}

export function LawGlancePlanner(props: {
  coverage: PlannerResource[];
  stack: PlannerResource[];
  roadmap: PlannerResource[];
  developer: PlannerResource[];
}) {
  const [audience, setAudience] = useState<Audience>("legal-aid");
  const [goal, setGoal] = useState<Goal>("research-assistant");
  const [horizon, setHorizon] = useState<Horizon>("60");
  const [multilingual, setMultilingual] = useState(true);
  const [voice, setVoice] = useState(false);
  const [caching, setCaching] = useState(true);

  const plan = useMemo(() => {
    const foundation = [...props.stack];
    if (caching && !foundation.some((x) => includesAny(x.title, ["redis"]))) {
      foundation.push({
        slug: "redis-runtime",
        title: "Redis caching runtime",
        description: "Add Redis for chat history and response caching in production.",
        url: "https://redis.io/"
      });
    }

    const coverageBase = props.coverage.slice(0, horizon === "30" ? 3 : horizon === "60" ? 5 : 8);

    const roadmapWanted = props.roadmap.filter((item) => {
      const text = `${item.title} ${item.description}`.toLowerCase();
      if (voice && text.includes("voice")) return true;
      if (multilingual && (text.includes("multi-lingual") || text.includes("multilingual") || text.includes("language"))) return true;

      if (goal === "research-assistant" && includesAny(text, ["search", "precision", "multi-agentic"])) return true;
      if (goal === "document-drafting" && includesAny(text, ["document generation", "draft"])) return true;
      if (goal === "case-management" && includesAny(text, ["case management", "deadlines", "appointments"])) return true;
      if (goal === "citizen-helpdesk" && includesAny(text, ["global", "accessible", "voice", "language"])) return true;

      return false;
    });

    const roadmap = roadmapWanted.slice(0, horizon === "30" ? 2 : horizon === "60" ? 4 : 6);

    const audienceNotes: Record<Audience, string> = {
      "legal-aid": "Prioritize clarity, multilingual support, and low-friction intake-like guidance.",
      "law-firm": "Prioritize accuracy controls, search precision, and matter-oriented workflows.",
      "in-house": "Prioritize policy-aware responses, document generation, and escalation paths.",
      student: "Prioritize explainability and citation-backed educational responses."
    };

    const goalNotes: Record<Goal, string> = {
      "research-assistant": "Focus on retrieval quality, source freshness, and citation reliability.",
      "document-drafting": "Focus on template discipline, clause controls, and review checkpoints.",
      "case-management": "Focus on timeline/deadline scaffolds and operational state tracking.",
      "citizen-helpdesk": "Focus on plain-language explanations, triage boundaries, and accessibility."
    };

    return {
      foundation,
      coverage: coverageBase,
      roadmap,
      notes: [audienceNotes[audience], goalNotes[goal]],
      assumptions: {
        audience,
        goal,
        horizon,
        multilingual,
        voice,
        caching
      }
    };
  }, [props.stack, props.coverage, props.roadmap, audience, goal, horizon, multilingual, voice, caching]);

  function exportPlanJson() {
    triggerDownload(
      "counterbench-lawglance-plan.json",
      JSON.stringify(
        {
          generated_at: new Date().toISOString(),
          ...plan
        },
        null,
        2
      ),
      "application/json;charset=utf-8"
    );
  }

  function exportPlanCsv() {
    const header = ["phase", "title", "description", "url"];
    const rows: string[][] = [];

    for (const item of plan.foundation) rows.push(["Foundation", item.title, item.description, item.url]);
    for (const item of plan.coverage) rows.push(["Coverage", item.title, item.description, item.url]);
    for (const item of plan.roadmap) rows.push(["Roadmap", item.title, item.description, item.url]);

    const csv = [header.join(","), ...rows.map((r) => r.map((cell) => escapeCsv(cell)).join(","))].join("\n");
    triggerDownload("counterbench-lawglance-plan.csv", csv, "text/csv;charset=utf-8");
  }

  return (
    <div className="mt-5">
      <div
        className="card"
        style={{
          borderRadius: 18,
          border: "1px solid color-mix(in srgb, var(--border) 68%, #22d3ee 32%)",
          background:
            "linear-gradient(160deg, color-mix(in srgb, #111827 84%, #0c4a6e 16%) 0%, color-mix(in srgb, #020617 90%, #0f172a 10%) 100%)"
        }}
      >
        <div className="label">Free tool</div>
        <div className="text-white" style={{ fontSize: "1.85rem", fontWeight: 850, lineHeight: 1.1, letterSpacing: "-0.03em" }}>
          LawGlance Rollout Planner
        </div>
        <p className="text-muted" style={{ marginTop: 10, maxWidth: 800, fontSize: "1.02rem", lineHeight: 1.55 }}>
          Generate a practical rollout plan from LawGlance’s current legal coverage, stack, and public roadmap. Export your plan as JSON or CSV.
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
            <label className="label" htmlFor="lg-audience">
              Audience
            </label>
            <select
              id="lg-audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value as Audience)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--input-bg)", color: "var(--fg)" }}
            >
              <option value="legal-aid">Legal aid / NGO</option>
              <option value="law-firm">Law firm operations</option>
              <option value="in-house">In-house legal team</option>
              <option value="student">Law student / education</option>
            </select>
          </div>

          <div>
            <label className="label" htmlFor="lg-goal">
              Primary goal
            </label>
            <select
              id="lg-goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value as Goal)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--input-bg)", color: "var(--fg)" }}
            >
              <option value="research-assistant">Research assistant</option>
              <option value="document-drafting">Document drafting support</option>
              <option value="case-management">Case management support</option>
              <option value="citizen-helpdesk">Citizen self-help desk</option>
            </select>
          </div>

          <div>
            <label className="label" htmlFor="lg-horizon">
              Timeline
            </label>
            <select
              id="lg-horizon"
              value={horizon}
              onChange={(e) => setHorizon(e.target.value as Horizon)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--input-bg)", color: "var(--fg)" }}
            >
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 14, flexWrap: "wrap" }}>
          <label className="text-muted" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "0.9rem" }}>
            <input type="checkbox" checked={multilingual} onChange={(e) => setMultilingual(e.target.checked)} />
            Include multilingual track
          </label>
          <label className="text-muted" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "0.9rem" }}>
            <input type="checkbox" checked={voice} onChange={(e) => setVoice(e.target.checked)} />
            Include voice interaction track
          </label>
          <label className="text-muted" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "0.9rem" }}>
            <input type="checkbox" checked={caching} onChange={(e) => setCaching(e.target.checked)} />
            Add production caching
          </label>
        </div>
      </div>

      <div className="card mt-4" style={{ borderRadius: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <div className="label">Recommended plan</div>
            <div className="text-white" style={{ fontWeight: 800, fontSize: "1.25rem", letterSpacing: "-0.02em" }}>
              {plan.foundation.length + plan.coverage.length + plan.roadmap.length} action items
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn btn--secondary btn--sm" onClick={exportPlanCsv}>
              Export CSV
            </button>
            <button className="btn btn--secondary btn--sm" onClick={exportPlanJson}>
              Export JSON
            </button>
            <Link className="btn btn--primary btn--sm" href="/newsletter">
              Get rollout updates
            </Link>
          </div>
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          {plan.notes.map((n) => (
            <div key={n} className="text-muted" style={{ lineHeight: 1.45 }}>
              {n}
            </div>
          ))}
        </div>

        <div className="grid grid--3 mt-4" style={{ gap: 10 }}>
          <section className="card" style={{ borderRadius: 12, padding: "0.95rem" }}>
            <div className="label">Phase 1: foundation</div>
            <div style={{ display: "grid", gap: 8 }}>
              {plan.foundation.map((item) => (
                <a key={item.slug} href={item.url} target="_blank" rel="noreferrer" className="text-white" style={{ textDecoration: "none", fontWeight: 700 }}>
                  {item.title}
                </a>
              ))}
            </div>
          </section>

          <section className="card" style={{ borderRadius: 12, padding: "0.95rem" }}>
            <div className="label">Phase 2: coverage</div>
            <div style={{ display: "grid", gap: 8 }}>
              {plan.coverage.map((item) => (
                <a key={item.slug} href={item.url} target="_blank" rel="noreferrer" className="text-white" style={{ textDecoration: "none", fontWeight: 700 }}>
                  {item.title}
                </a>
              ))}
            </div>
          </section>

          <section className="card" style={{ borderRadius: 12, padding: "0.95rem" }}>
            <div className="label">Phase 3: roadmap options</div>
            <div style={{ display: "grid", gap: 8 }}>
              {plan.roadmap.length === 0 ? (
                <div className="text-muted">No roadmap track matched current options.</div>
              ) : (
                plan.roadmap.map((item) => (
                  <a key={item.slug} href={item.url} target="_blank" rel="noreferrer" className="text-white" style={{ textDecoration: "none", fontWeight: 700 }}>
                    {item.title}
                  </a>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      <div className="text-muted" style={{ marginTop: 14, fontSize: "0.82rem", lineHeight: 1.5 }}>
        Plans are generated from LawGlance’s public README snapshot and intended for implementation planning. Validate legal scope and production controls before rollout.
      </div>
    </div>
  );
}
