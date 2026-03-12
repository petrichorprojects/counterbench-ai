"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { LegalStoriesDoctrine, LegalStoriesModelStat, LegalStoriesTier } from "@/lib/legalstories";

type Audience = "high-school" | "college" | "legal-ops" | "in-house";
type Horizon = "2" | "4" | "6";
type TierFilter = "mixed" | LegalStoriesTier;
type QuestionType = "concept" | "ending" | "limitation";

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

function questionTypeLabel(value: QuestionType): string {
  if (value === "concept") return "Concept comprehension";
  if (value === "ending") return "Scenario prediction";
  return "Limitation / exception";
}

function targetDoctrinesForHorizon(horizon: Horizon): number {
  if (horizon === "2") return 6;
  if (horizon === "4") return 10;
  return 14;
}

function buildAudienceRanker(audience: Audience, doctrines: LegalStoriesDoctrine[]) {
  if (audience === "high-school") {
    return [...doctrines].sort((a, b) => a.wordCount - b.wordCount || a.label.localeCompare(b.label));
  }

  if (audience === "in-house") {
    return [...doctrines].sort((a, b) => b.wordCount - a.wordCount || a.label.localeCompare(b.label));
  }

  const avg = doctrines.length > 0 ? doctrines.reduce((sum, d) => sum + d.wordCount, 0) / doctrines.length : 0;

  if (audience === "college") {
    return [...doctrines].sort((a, b) => {
      const da = Math.abs(a.wordCount - avg);
      const db = Math.abs(b.wordCount - avg);
      return da - db || a.label.localeCompare(b.label);
    });
  }

  // legal-ops: lean slightly above average but avoid only hard edge cases.
  return [...doctrines].sort((a, b) => {
    const ta = Math.abs(a.wordCount - avg * 1.15);
    const tb = Math.abs(b.wordCount - avg * 1.15);
    return ta - tb || a.label.localeCompare(b.label);
  });
}

export function LegalStoriesLessonBuilder(props: {
  doctrines: LegalStoriesDoctrine[];
  modelStats: LegalStoriesModelStat[];
}) {
  const [audience, setAudience] = useState<Audience>("college");
  const [horizon, setHorizon] = useState<Horizon>("4");
  const [tierFilter, setTierFilter] = useState<TierFilter>("mixed");
  const [modelKey, setModelKey] = useState<LegalStoriesModelStat["key"]>("gpt4");
  const [includeRetention, setIncludeRetention] = useState(true);
  const [questionTypes, setQuestionTypes] = useState<Record<QuestionType, boolean>>({
    concept: true,
    ending: true,
    limitation: false
  });

  const selectedQuestionTypes = useMemo(
    () => (Object.entries(questionTypes).filter(([, enabled]) => enabled).map(([k]) => k) as QuestionType[]),
    [questionTypes]
  );

  const selectedDoctrines = useMemo(() => {
    const pool = tierFilter === "mixed" ? props.doctrines : props.doctrines.filter((d) => d.tier === tierFilter);
    const fallbackPool = pool.length > 0 ? pool : props.doctrines;
    const ranked = buildAudienceRanker(audience, fallbackPool);
    return ranked.slice(0, targetDoctrinesForHorizon(horizon));
  }, [props.doctrines, tierFilter, audience, horizon]);

  const weeklyPlan = useMemo(() => {
    const weekCount = Number.parseInt(horizon, 10);
    const perWeek = Math.max(1, Math.ceil(selectedDoctrines.length / weekCount));
    const out: Array<{ week: number; doctrines: LegalStoriesDoctrine[] }> = [];

    for (let week = 0; week < weekCount; week += 1) {
      const start = week * perWeek;
      const end = start + perWeek;
      const doctrines = selectedDoctrines.slice(start, end);
      if (doctrines.length === 0) continue;
      out.push({ week: week + 1, doctrines });
    }

    return out;
  }, [selectedDoctrines, horizon]);

  const selectedModel = props.modelStats.find((m) => m.key === modelKey) ?? props.modelStats[0] ?? null;

  function exportJson() {
    const payload = {
      generated_at: new Date().toISOString(),
      assumptions: {
        audience,
        horizon_weeks: Number.parseInt(horizon, 10),
        tier_filter: tierFilter,
        model: selectedModel?.label ?? modelKey,
        include_retention_checkpoint: includeRetention,
        question_types: selectedQuestionTypes
      },
      totals: {
        doctrines: selectedDoctrines.length,
        weeks: weeklyPlan.length
      },
      plan: weeklyPlan.map((w) => ({
        week: w.week,
        doctrine_count: w.doctrines.length,
        doctrines: w.doctrines.map((d) => ({
          concept_id: d.conceptId,
          label: d.label,
          word_count: d.wordCount,
          tier: d.tier,
          intro_snippet: d.introSnippet
        }))
      }))
    };

    triggerDownload("counterbench-legalstories-lesson-pack.json", JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
  }

  function exportCsv() {
    const header = ["week", "concept_id", "label", "word_count", "tier", "model", "question_types", "intro_snippet"];
    const rows: string[][] = [];

    for (const section of weeklyPlan) {
      for (const doctrine of section.doctrines) {
        rows.push([
          String(section.week),
          doctrine.conceptId,
          doctrine.label,
          String(doctrine.wordCount),
          doctrine.tier,
          selectedModel?.label ?? modelKey,
          selectedQuestionTypes.map(questionTypeLabel).join(" | "),
          doctrine.introSnippet
        ]);
      }
    }

    const csv = [header.join(","), ...rows.map((r) => r.map((cell) => escapeCsv(cell)).join(","))].join("\n");
    triggerDownload("counterbench-legalstories-lesson-pack.csv", csv, "text/csv;charset=utf-8");
  }

  function toggleQuestionType(type: QuestionType) {
    setQuestionTypes((current) => ({ ...current, [type]: !current[type] }));
  }

  return (
    <div className="mt-5">
      <div
        className="card"
        style={{
          borderRadius: 18,
          border: "1px solid color-mix(in srgb, var(--border) 66%, #f59e0b 34%)",
          background:
            "linear-gradient(160deg, color-mix(in srgb, #111827 82%, #78350f 18%) 0%, color-mix(in srgb, #020617 90%, #0f172a 10%) 100%)"
        }}
      >
        <div className="label">Free tool</div>
        <div className="text-white" style={{ fontSize: "1.9rem", fontWeight: 850, lineHeight: 1.08, letterSpacing: "-0.03em" }}>
          LegalStories Lesson Pack Builder
        </div>
        <p className="text-muted" style={{ marginTop: 10, maxWidth: 840, fontSize: "1.03rem", lineHeight: 1.55 }}>
          Convert the LegalStories doctrine corpus into a practical learning sequence for legal literacy programs, onboarding modules, or client education.
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
            <label className="label" htmlFor="ls-audience">
              Audience
            </label>
            <select
              id="ls-audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value as Audience)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--input-bg)", color: "var(--fg)" }}
            >
              <option value="high-school">High-school legal literacy</option>
              <option value="college">Undergraduate / college</option>
              <option value="legal-ops">Legal ops onboarding</option>
              <option value="in-house">In-house legal training</option>
            </select>
          </div>

          <div>
            <label className="label" htmlFor="ls-horizon">
              Program length
            </label>
            <select
              id="ls-horizon"
              value={horizon}
              onChange={(e) => setHorizon(e.target.value as Horizon)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--input-bg)", color: "var(--fg)" }}
            >
              <option value="2">2 weeks (6 doctrines)</option>
              <option value="4">4 weeks (10 doctrines)</option>
              <option value="6">6 weeks (14 doctrines)</option>
            </select>
          </div>

          <div>
            <label className="label" htmlFor="ls-tier">
              Complexity tier
            </label>
            <select
              id="ls-tier"
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value as TierFilter)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--input-bg)", color: "var(--fg)" }}
            >
              <option value="mixed">Mixed</option>
              <option value="foundational">Foundational</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="label" htmlFor="ls-model">
              Question-generation baseline
            </label>
            <select
              id="ls-model"
              value={modelKey}
              onChange={(e) => setModelKey(e.target.value as LegalStoriesModelStat["key"])}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--input-bg)", color: "var(--fg)" }}
            >
              {props.modelStats.map((model) => (
                <option key={model.key} value={model.key}>
                  {model.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 14, flexWrap: "wrap" }}>
          <label className="text-muted" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "0.9rem" }}>
            <input
              type="checkbox"
              checked={questionTypes.concept}
              onChange={() => toggleQuestionType("concept")}
            />
            Include concept comprehension
          </label>
          <label className="text-muted" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "0.9rem" }}>
            <input type="checkbox" checked={questionTypes.ending} onChange={() => toggleQuestionType("ending")} />
            Include scenario prediction
          </label>
          <label className="text-muted" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "0.9rem" }}>
            <input
              type="checkbox"
              checked={questionTypes.limitation}
              onChange={() => toggleQuestionType("limitation")}
            />
            Include limitation checks
          </label>
          <label className="text-muted" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "0.9rem" }}>
            <input type="checkbox" checked={includeRetention} onChange={(e) => setIncludeRetention(e.target.checked)} />
            Add follow-up retention checkpoint
          </label>
        </div>
      </div>

      <div className="card mt-4" style={{ borderRadius: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <div className="label">Generated curriculum</div>
            <div className="text-white" style={{ fontWeight: 800, fontSize: "1.25rem", letterSpacing: "-0.02em" }}>
              {selectedDoctrines.length} doctrines across {weeklyPlan.length} week{weeklyPlan.length === 1 ? "" : "s"}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn btn--secondary btn--sm" disabled={selectedDoctrines.length === 0} onClick={exportCsv}>
              Export CSV
            </button>
            <button className="btn btn--secondary btn--sm" disabled={selectedDoctrines.length === 0} onClick={exportJson}>
              Export JSON
            </button>
            <Link className="btn btn--primary btn--sm" href="/newsletter">
              Get dataset updates
            </Link>
          </div>
        </div>

        <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span className="label label--pill" style={{ margin: 0 }}>
            Model: {selectedModel?.label ?? "N/A"}
          </span>
          <span className="label label--pill" style={{ margin: 0 }}>
            Question types: {selectedQuestionTypes.length > 0 ? selectedQuestionTypes.map(questionTypeLabel).join(" · ") : "None selected"}
          </span>
          {includeRetention && (
            <span className="label label--pill" style={{ margin: 0 }}>
              Includes retention checkpoint
            </span>
          )}
        </div>

        <div className="mt-4" style={{ display: "grid", gap: 10 }}>
          {weeklyPlan.map((weekBlock) => (
            <section
              key={weekBlock.week}
              className="card"
              style={{ borderRadius: 12, padding: "1rem", background: "color-mix(in srgb, var(--bg2) 86%, #f59e0b 14%)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <div className="text-white" style={{ fontWeight: 800 }}>
                  Week {weekBlock.week}
                </div>
                <div className="text-muted" style={{ fontSize: "0.86rem" }}>
                  {weekBlock.doctrines.length} doctrine{weekBlock.doctrines.length === 1 ? "" : "s"}
                </div>
              </div>

              <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                {weekBlock.doctrines.map((d) => (
                  <article key={d.conceptId} className="card" style={{ borderRadius: 10, padding: "0.75rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                      <div className="text-white" style={{ fontWeight: 700 }}>
                        {d.label}
                      </div>
                      <div className="text-muted" style={{ fontSize: "0.82rem" }}>
                        {d.wordCount} words • {d.tier}
                      </div>
                    </div>
                    <div className="text-muted" style={{ marginTop: 6, lineHeight: 1.45 }}>
                      {d.introSnippet}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className="text-muted" style={{ marginTop: 14, fontSize: "0.82rem", lineHeight: 1.5 }}>
        This builder creates curriculum scaffolds from the LegalStories dataset; validate pedagogy, legal jurisdiction scope, and assessment quality before classroom deployment.
      </div>
    </div>
  );
}
