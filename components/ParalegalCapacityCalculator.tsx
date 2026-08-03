"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  calculateCapacity,
  practiceTypeLabel,
  practiceTypeTarget,
  recommendation,
  statusLabel,
  verdictSentence,
  DEFAULT_PRACTICE_TYPE,
  PRACTICE_TYPES,
  type CapacityInputs,
  type CapacityStatus,
  type PracticeType
} from "@/lib/paralegal-capacity";

const TOOL_SLUG = "paralegal-capacity-calculator";

// Local dataLayer helpers. Event shapes mirror the tool_view / tool_click_cta
// convention used by the other free tools in this repo (see
// components/ConflictCheckAudit.tsx); kept inline here so this tool has no
// cross-module dependency to ship.
function pushEvent(event: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(event);
}
function trackToolView(): void {
  pushEvent({ event: "tool_view", tool_slug: TOOL_SLUG });
}
function trackToolCTA(destination: string): void {
  pushEvent({ event: "tool_click_cta", tool_slug: TOOL_SLUG, destination });
}

const STATUS_COLOR: Record<CapacityStatus, string> = {
  green: "var(--green)",
  amber: "var(--amber)",
  red: "var(--red)"
};

function toNonNegativeInt(raw: string): number {
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

function isValidEmail(email: string): boolean {
  const e = email.trim();
  if (e.length < 5 || e.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function fieldStyle(): React.CSSProperties {
  return {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 999,
    border: "1px solid var(--border)",
    background: "var(--input-bg)",
    color: "var(--fg)"
  };
}

export function ParalegalCapacityCalculator() {
  const [attorneysRaw, setAttorneysRaw] = useState("2");
  const [paralegalsRaw, setParalegalsRaw] = useState("1");
  const [activeCasesRaw, setActiveCasesRaw] = useState("120");
  const [newIntakesRaw, setNewIntakesRaw] = useState("15");
  const [practiceType, setPracticeType] = useState<PracticeType>(DEFAULT_PRACTICE_TYPE);

  const [email, setEmail] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [gateStatus, setGateStatus] = useState<"idle" | "loading" | "error">("idle");
  const [gateMessage, setGateMessage] = useState("");

  useEffect(() => {
    trackToolView();
  }, []);

  const inputs: CapacityInputs = useMemo(
    () => ({
      attorneys: toNonNegativeInt(attorneysRaw),
      paralegals: toNonNegativeInt(paralegalsRaw),
      activeCases: toNonNegativeInt(activeCasesRaw),
      newIntakesPerMonth: toNonNegativeInt(newIntakesRaw),
      practiceType
    }),
    [attorneysRaw, paralegalsRaw, activeCasesRaw, newIntakesRaw, practiceType]
  );

  const result = useMemo(() => calculateCapacity(inputs), [inputs]);
  const target = practiceTypeTarget(practiceType);
  const hasEnoughInput = inputs.paralegals > 0 && inputs.activeCases > 0;

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setGateStatus("error");
      setGateMessage("Enter a valid email.");
      return;
    }

    setGateStatus("loading");
    setGateMessage("");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          source: TOOL_SLUG,
          meta: {
            tool: TOOL_SLUG,
            attorneys: inputs.attorneys,
            paralegals: inputs.paralegals,
            active_cases: inputs.activeCases,
            new_intakes_per_month: inputs.newIntakesPerMonth,
            practice_type: inputs.practiceType,
            cases_per_paralegal: Math.round(result.casesPerParalegal * 10) / 10,
            overload_pct: Math.round(result.overloadPct),
            status: result.status,
            cases_under_served: result.casesUnderServed,
            staffing_gap: result.staffingGap
          }
        })
      });

      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };

      if (!res.ok || !data.ok) {
        setGateStatus("error");
        setGateMessage(data.message || "Could not unlock the report. Try again in a moment.");
        return;
      }

      setUnlocked(true);
      setGateStatus("idle");
      pushEvent({ event: "capacity_calc_lead", tool_slug: TOOL_SLUG, status: result.status });
    } catch {
      setGateStatus("error");
      setGateMessage("Network error. Please try again.");
    }
  }

  return (
    <div className="mt-5">
      <div
        className="card"
        style={{
          borderRadius: 18,
          border: "1px solid color-mix(in srgb, var(--border) 68%, #0ea5e9 32%)",
          background:
            "linear-gradient(160deg, color-mix(in srgb, #111827 84%, #0c4a6e 16%) 0%, color-mix(in srgb, #020617 90%, #0f172a 10%) 100%)"
        }}
      >
        <div className="label">Free tool</div>
        <div className="text-white" style={{ fontSize: "1.9rem", fontWeight: 850, lineHeight: 1.1, letterSpacing: "-0.03em" }}>
          Paralegal Capacity Calculator
        </div>
        <p className="text-muted" style={{ marginTop: 10, maxWidth: 820, fontSize: "1.03rem", lineHeight: 1.55 }}>
          Enter your firm&apos;s numbers to see whether your paralegal function is over capacity, and by how much.
        </p>

        <div
          className="mt-5"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 10,
            alignItems: "end"
          }}
        >
          <div>
            <label className="label" htmlFor="pcc-attorneys">
              Attorneys
            </label>
            <input
              id="pcc-attorneys"
              type="number"
              min={0}
              inputMode="numeric"
              value={attorneysRaw}
              onChange={(e) => setAttorneysRaw(e.target.value)}
              style={fieldStyle()}
            />
          </div>

          <div>
            <label className="label" htmlFor="pcc-paralegals">
              Paralegals
            </label>
            <input
              id="pcc-paralegals"
              type="number"
              min={0}
              inputMode="numeric"
              value={paralegalsRaw}
              onChange={(e) => setParalegalsRaw(e.target.value)}
              style={fieldStyle()}
            />
          </div>

          <div>
            <label className="label" htmlFor="pcc-active-cases">
              Active cases
            </label>
            <input
              id="pcc-active-cases"
              type="number"
              min={0}
              inputMode="numeric"
              value={activeCasesRaw}
              onChange={(e) => setActiveCasesRaw(e.target.value)}
              style={fieldStyle()}
            />
          </div>

          <div>
            <label className="label" htmlFor="pcc-intakes">
              New intakes / month
            </label>
            <input
              id="pcc-intakes"
              type="number"
              min={0}
              inputMode="numeric"
              value={newIntakesRaw}
              onChange={(e) => setNewIntakesRaw(e.target.value)}
              style={fieldStyle()}
            />
          </div>

          <div>
            <label className="label" htmlFor="pcc-practice-type">
              Practice mix
            </label>
            <select
              id="pcc-practice-type"
              value={practiceType}
              onChange={(e) => setPracticeType(e.target.value as PracticeType)}
              style={fieldStyle()}
            >
              {PRACTICE_TYPES.map((pt) => (
                <option key={pt} value={pt}>
                  {practiceTypeLabel(pt)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-muted" style={{ marginTop: 12, fontSize: "0.8125rem", lineHeight: 1.5 }}>
          Target caseload for {practiceTypeLabel(practiceType).toLowerCase()} work: {target} active cases per paralegal.
          This is an industry rule of thumb, not a measured benchmark - adjust it to your firm.
        </div>
      </div>

      {!hasEnoughInput ? (
        <div className="card mt-4" style={{ borderRadius: 16 }}>
          <div className="text-muted">Enter your paralegal count and active case count above to see your capacity read.</div>
        </div>
      ) : (
        <div className="card mt-4" style={{ borderRadius: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                aria-hidden="true"
                style={{
                  display: "inline-block",
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: STATUS_COLOR[result.status]
                }}
              />
              <div>
                <div className="label" style={{ margin: 0 }}>
                  {statusLabel(result.status)}
                </div>
                <div className="text-white" style={{ fontWeight: 800, fontSize: "1.15rem", letterSpacing: "-0.02em" }}>
                  {result.casesPerParalegal.toFixed(1)} cases / paralegal - {result.attorneyRatio.toFixed(2)} paralegals / attorney
                </div>
              </div>
            </div>
          </div>

          <p className="text-muted" style={{ marginTop: 12, lineHeight: 1.55, fontSize: "1.03rem" }}>
            {verdictSentence(result)}
          </p>

          {!unlocked ? (
            <form
              onSubmit={handleUnlock}
              style={{
                marginTop: 16,
                padding: "14px 16px",
                borderRadius: 12,
                background: "color-mix(in srgb, var(--bg2) 90%, #0ea5e9 10%)",
                border: "1px solid var(--border)"
              }}
            >
              <div className="text-white" style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 6 }}>
                Unlock the full capacity report
              </div>
              <div className="text-muted" style={{ fontSize: "0.82rem", marginBottom: 10, lineHeight: 1.45 }}>
                See how many cases are past capacity and how many paralegals would close the gap.
              </div>
              <div className="flex flex--gap-2 flex--resp-col" style={{ maxWidth: 460 }}>
                <label className="sr-only" htmlFor="pcc-email">
                  Email
                </label>
                <input
                  id="pcc-email"
                  type="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@firm.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={gateStatus === "error" ? true : undefined}
                  style={fieldStyle()}
                />
                <button className="btn btn--primary btn--sm" type="submit" disabled={gateStatus === "loading"}>
                  {gateStatus === "loading" ? "Unlocking…" : "Get my full report"}
                </button>
              </div>
              <div className="text-muted" style={{ fontSize: "0.8125rem", marginTop: 8 }} aria-live="polite">
                {gateMessage ||
                  (
                    <>
                      Also adds you to firm capacity updates. Unsubscribe anytime.{" "}
                      <Link href="/privacy" className="text-muted" style={{ textDecoration: "underline" }}>
                        Privacy
                      </Link>
                      .
                    </>
                  )}
              </div>
            </form>
          ) : (
            <div
              className="card mt-4"
              style={{ borderRadius: 12, padding: "1rem", background: "color-mix(in srgb, var(--bg2) 86%, #0ea5e9 14%)" }}
            >
              <div className="label" style={{ margin: 0 }}>
                Full capacity report
              </div>

              <div className="mt-4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                <div>
                  <div className="text-muted" style={{ fontSize: "0.82rem" }}>
                    Cases past capacity
                  </div>
                  <div className="text-white" style={{ fontWeight: 800, fontSize: "1.4rem" }}>
                    {Math.round(result.casesUnderServed)}
                  </div>
                </div>
                <div>
                  <div className="text-muted" style={{ fontSize: "0.82rem" }}>
                    Paralegals needed to close the gap
                  </div>
                  <div className="text-white" style={{ fontWeight: 800, fontSize: "1.4rem" }}>
                    {result.staffingGap}
                  </div>
                </div>
                <div>
                  <div className="text-muted" style={{ fontSize: "0.82rem" }}>
                    New intakes / paralegal / month
                  </div>
                  <div className="text-white" style={{ fontWeight: 800, fontSize: "1.4rem" }}>
                    {result.intakeLoadPerPara.toFixed(1)}
                  </div>
                </div>
              </div>

              <p className="text-muted" style={{ marginTop: 14, lineHeight: 1.55 }}>
                {recommendation(result, practiceType)}
              </p>

              <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Link
                  className="btn btn--primary btn--sm"
                  href="/paralegals"
                  onClick={() => trackToolCTA("/paralegals")}
                >
                  See how a Paralegal Team closes that gap
                </Link>
                <Link className="btn btn--secondary btn--sm" href="/tools" onClick={() => trackToolCTA("/tools")}>
                  Browse the free tool directory
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="text-muted" style={{ marginTop: 14, fontSize: "0.82rem", lineHeight: 1.5 }}>
        This calculator gives a directional read on paralegal capacity, not a staffing audit. Target caseloads are an
        industry rule of thumb - actual capacity varies by case complexity, jurisdiction, and firm workflow.
      </div>
    </div>
  );
}
