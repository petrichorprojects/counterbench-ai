"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  QUESTIONS,
  MAX_SCORE,
  scoreAudit,
  rulesFromFindings,
  LAST_VERIFIED,
  type AuditAnswers,
  type OptionValue,
} from "@/lib/conflict-check-audit";
const TOOL_SLUG = "conflict-check-audit";

// Local dataLayer helpers. Event shapes mirror lib/analytics.ts (tool_view,
// tool_click_cta) so GTM/GA sees identical events; kept inline here so this
// tool has no cross-module dependency to ship. Fold into lib/analytics.ts if
// that module is later extended.
function pushEvent(event: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(event);
}
function trackToolView(toolSlug: string): void {
  pushEvent({ event: "tool_view", tool_slug: toolSlug });
}
function trackToolCTA(toolSlug: string, destination: string): void {
  pushEvent({ event: "tool_click_cta", tool_slug: toolSlug, destination });
}

type FirmSize = "solo" | "2-5" | "6-10" | "11-25" | "25+";
type Benchmark = { size: FirmSize | ""; state: string; practice: string };

function effortLabel(minutes: number | null): string {
  if (minutes === null) return "Structural fix";
  if (minutes <= 30) return `~${minutes} min`;
  if (minutes < 60) return `~${minutes} min`;
  return "~1 hour";
}

export function ConflictCheckAudit() {
  const [answers, setAnswers] = useState<AuditAnswers>({});
  const [submitted, setSubmitted] = useState(false);
  const [benchmark, setBenchmark] = useState<Benchmark>({ size: "", state: "", practice: "" });
  const [benchmarkSent, setBenchmarkSent] = useState(false);

  useEffect(() => {
    trackToolView(TOOL_SLUG);
  }, []);

  const result = useMemo(() => scoreAudit(answers), [answers]);
  const answeredCount = Object.keys(answers).length;

  function choose(qid: string, value: OptionValue) {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  }

  function onSubmit() {
    if (!result.complete) return;
    setSubmitted(true);
    // Scroll the result into view for keyboard + mobile users.
    requestAnimationFrame(() => {
      document.getElementById("audit-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function reset() {
    setAnswers({});
    setSubmitted(false);
    setBenchmark({ size: "", state: "", practice: "" });
    setBenchmarkSent(false);
  }

  function ctaClick() {
    trackToolCTA(TOOL_SLUG, "/paralegals");
  }

  function saveBenchmark() {
    // Analytics (GTM) — unchanged, "unspecified" for empty firmographics.
    pushEvent({
      event: "conflict_audit_benchmark",
      tool_slug: TOOL_SLUG,
      score: result.score,
      tier: result.tier.key,
      firm_size: benchmark.size || "unspecified",
      state: benchmark.state || "unspecified",
      practice_area: benchmark.practice || "unspecified",
    });

    // Persist the anonymous row server-side. Fire-and-forget: the benchmark is
    // optional, so a failed/slow POST must never block the "thanks" state or
    // surface an error. Empty firmographics are omitted (server stores null).
    void fetch("/api/conflict-audit-benchmark", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        score: result.score,
        tier: result.tier.key,
        firm_size: benchmark.size || undefined,
        state: benchmark.state || undefined,
        practice_area: benchmark.practice || undefined,
      }),
    }).catch(() => {
      /* optional telemetry; ignore network errors */
    });

    setBenchmarkSent(true);
  }

  const rules = rulesFromFindings(result.findings);

  return (
    <div className="cca">
      {/* ---- Questions ---- */}
      {!submitted && (
        <form
          className="cca-form"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <ol className="cca-questions">
            {QUESTIONS.map((q, i) => (
              <li key={q.id} className="card mt-4 cca-q">
                <div className="label">
                  Question {i + 1} of {QUESTIONS.length}
                  {q.rules ? <span className="cca-rule"> · Model Rule {q.rules.join(", ")}</span> : null}
                </div>
                <h3 className="cca-q-title">{q.question}</h3>
                <fieldset className="cca-options">
                  <legend className="sr-only">{q.question}</legend>
                  {q.options.map((opt) => {
                    const id = `${q.id}-${opt.value}`;
                    return (
                      <label key={id} htmlFor={id} className="cca-option">
                        <input
                          type="radio"
                          id={id}
                          name={q.id}
                          value={opt.value}
                          checked={answers[q.id] === opt.value}
                          onChange={() => choose(q.id, opt.value)}
                        />
                        <span>{opt.label}</span>
                      </label>
                    );
                  })}
                </fieldset>
              </li>
            ))}
          </ol>

          <div className="cca-actions mt-5">
            <button type="submit" className="btn btn--primary" disabled={!result.complete}>
              {result.complete ? "See your blind spots" : `Answer all ${QUESTIONS.length} questions`}
            </button>
            <span className="text-muted cca-progress">
              {answeredCount}/{QUESTIONS.length} answered
            </span>
          </div>
        </form>
      )}

      {/* ---- Result ---- */}
      {submitted && (
        <div id="audit-result" className="cca-result">
          <div className="card cca-score-card">
            <div className="label">Your result</div>
            <div className="cca-score">
              <strong>{result.score}</strong>
              <span className="text-muted"> / {MAX_SCORE}</span>
            </div>
            <h2 className="cca-tier">{result.tier.label}</h2>
            <p className="cca-tier-meaning">{result.tier.meaning}</p>
          </div>

          {result.findings.length > 0 ? (
            <>
              <h3 className="mt-5">
                {result.findings.length} blind spot{result.findings.length === 1 ? "" : "s"}, cheapest fix first
              </h3>
              <ol className="cca-findings">
                {result.findings.map((f) => (
                  <li key={f.questionId} className="card mt-4 cca-finding">
                    <div className="label">
                      {f.failureMode}
                      {f.rules ? <span className="cca-rule"> · Model Rule {f.rules.join(", ")}</span> : null}
                      <span className="cca-effort"> · {effortLabel(f.effortMinutes)}</span>
                    </div>
                    <p className="cca-scenario">{f.scenario}</p>
                    <p className="cca-fix">
                      <strong>Fix:</strong> {f.fix}
                    </p>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <p className="mt-5">
              No blind spots flagged. Your process covers the eight failure modes this audit tests. Keep the written
              version current as the firm grows.
            </p>
          )}

          {/* CTA — honest, tier-aware, vendor-neutral */}
          <div className="card cca-cta mt-5">
            <p>
              Most of these gaps come down to the same thing: the process lives in one person&apos;s head instead of on
              paper. That is exactly the work a paralegal team takes off your plate — running checks the same way every
              time, and keeping the record that proves it.
            </p>
            <Link href="/paralegals" className="btn btn--primary" onClick={ctaClick}>
              See how Paralegal Teams works
            </Link>
          </div>

          {/* Benchmark ask — post-value, three fields, no email */}
          {!benchmarkSent ? (
            <div className="card cca-benchmark mt-5">
              <div className="label">Optional · anonymous</div>
              <p>See how firms like yours compare. Three fields, no email, not tied to you.</p>
              <div className="cca-benchmark-fields">
                <label>
                  Firm size
                  <select
                    value={benchmark.size}
                    onChange={(e) => setBenchmark((b) => ({ ...b, size: e.target.value as FirmSize }))}
                  >
                    <option value="">Select…</option>
                    <option value="solo">Solo</option>
                    <option value="2-5">2–5</option>
                    <option value="6-10">6–10</option>
                    <option value="11-25">11–25</option>
                    <option value="25+">25+</option>
                  </select>
                </label>
                <label>
                  State
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="e.g. CA"
                    value={benchmark.state}
                    onChange={(e) => setBenchmark((b) => ({ ...b, state: e.target.value.toUpperCase() }))}
                  />
                </label>
                <label>
                  Practice area
                  <input
                    type="text"
                    placeholder="e.g. Personal injury"
                    value={benchmark.practice}
                    onChange={(e) => setBenchmark((b) => ({ ...b, practice: e.target.value }))}
                  />
                </label>
              </div>
              <button type="button" className="btn btn--secondary btn--sm mt-4" onClick={saveBenchmark}>
                Add to the benchmark
              </button>
            </div>
          ) : (
            <p className="text-muted mt-5">Thanks — added anonymously.</p>
          )}

          <div className="cca-result-actions mt-5">
            <button type="button" className="btn btn--secondary btn--sm" onClick={() => window.print()}>
              Print / save as PDF
            </button>
            <button type="button" className="btn btn--secondary btn--sm" onClick={reset}>
              Start over
            </button>
          </div>

          <p className="text-muted cca-disclaimer mt-5">
            This audits your process, not any specific conflict, and is not legal advice. Rule citations reference the
            ABA Model Rules of Professional Conduct (last verified {LAST_VERIFIED}); your state&apos;s rules govern and
            may differ. {rules.length > 0 ? `Rules referenced in your result: ${rules.join(", ")}.` : ""}
          </p>
        </div>
      )}
    </div>
  );
}
