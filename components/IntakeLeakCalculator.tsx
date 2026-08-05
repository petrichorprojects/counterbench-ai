"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  calculateIntakeLeak,
  formatUSD,
  recommendation,
  statusLabel,
  verdictSentence,
  type IntakeInputs,
  type IntakeStatus
} from "@/lib/intake-leak";

const TOOL_SLUG = "intake-leak-calculator";

// Local dataLayer helpers. Event shapes mirror the tool_view / tool_click_cta
// convention used by the other free tools in this repo (see
// components/ParalegalCapacityCalculator.tsx); kept inline so this tool has no
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

const STATUS_COLOR: Record<IntakeStatus, string> = {
  green: "var(--green)",
  amber: "var(--amber)",
  red: "var(--red)"
};

function toNonNegativeNumber(raw: string): number {
  const n = Number.parseFloat(raw);
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

export function IntakeLeakCalculator() {
  const [callsRaw, setCallsRaw] = useState("120");
  const [costRaw, setCostRaw] = useState("30");
  const [shareRaw, setShareRaw] = useState("80");
  const [minutesRaw, setMinutesRaw] = useState("12");
  const [paraRateRaw, setParaRateRaw] = useState("35");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [caseValueRaw, setCaseValueRaw] = useState("");

  const [email, setEmail] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [gateStatus, setGateStatus] = useState<"idle" | "loading" | "error">("idle");
  const [gateMessage, setGateMessage] = useState("");

  useEffect(() => {
    trackToolView();
  }, []);

  const inputs: IntakeInputs = useMemo(
    () => ({
      callsPerMonth: toNonNegativeNumber(callsRaw),
      costPerCall: toNonNegativeNumber(costRaw),
      shareNeverConvertPct: toNonNegativeNumber(shareRaw),
      minutesPerCall: toNonNegativeNumber(minutesRaw),
      paralegalCostPerHour: toNonNegativeNumber(paraRateRaw),
      avgCaseValue: toNonNegativeNumber(caseValueRaw),
      currentSignRatePct: 0
    }),
    [callsRaw, costRaw, shareRaw, minutesRaw, paraRateRaw, caseValueRaw]
  );

  const result = useMemo(() => calculateIntakeLeak(inputs), [inputs]);
  const hasEnoughInput = inputs.callsPerMonth > 0 && inputs.shareNeverConvertPct > 0;

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
            calls_per_month: inputs.callsPerMonth,
            cost_per_call: inputs.costPerCall,
            share_never_convert_pct: inputs.shareNeverConvertPct,
            minutes_per_call: inputs.minutesPerCall,
            paralegal_cost_per_hour: inputs.paralegalCostPerHour,
            avg_case_value: inputs.avgCaseValue,
            monthly_leak: Math.round(result.monthlyLeak),
            annual_leak: Math.round(result.annualLeak),
            wasted_hours: Math.round(result.wastedHours * 10) / 10,
            status: result.status
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
      pushEvent({ event: "intake_leak_lead", tool_slug: TOOL_SLUG, status: result.status });
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
          Intake Leak Calculator
        </div>
        <p className="text-muted" style={{ marginTop: 10, maxWidth: 820, fontSize: "1.03rem", lineHeight: 1.55 }}>
          Enter your intake numbers to see the dollars and paralegal hours your firm burns each month on calls that
          never become clients.
        </p>

        <div
          className="mt-5"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 10,
            alignItems: "end"
          }}
        >
          <div>
            <label className="label" htmlFor="ilc-calls">
              Intake calls / month
            </label>
            <input
              id="ilc-calls"
              type="number"
              min={0}
              inputMode="numeric"
              value={callsRaw}
              onChange={(e) => setCallsRaw(e.target.value)}
              style={fieldStyle()}
            />
          </div>

          <div>
            <label className="label" htmlFor="ilc-cost">
              Cost / call ($)
            </label>
            <input
              id="ilc-cost"
              type="number"
              min={0}
              inputMode="decimal"
              value={costRaw}
              onChange={(e) => setCostRaw(e.target.value)}
              style={fieldStyle()}
            />
          </div>

          <div>
            <label className="label" htmlFor="ilc-share">
              % that never convert
            </label>
            <input
              id="ilc-share"
              type="number"
              min={0}
              max={100}
              inputMode="numeric"
              value={shareRaw}
              onChange={(e) => setShareRaw(e.target.value)}
              style={fieldStyle()}
            />
          </div>

          <div>
            <label className="label" htmlFor="ilc-minutes">
              Paralegal min / call
            </label>
            <input
              id="ilc-minutes"
              type="number"
              min={0}
              inputMode="numeric"
              value={minutesRaw}
              onChange={(e) => setMinutesRaw(e.target.value)}
              style={fieldStyle()}
            />
          </div>

          <div>
            <label className="label" htmlFor="ilc-para-rate">
              Paralegal $ / hour
            </label>
            <input
              id="ilc-para-rate"
              type="number"
              min={0}
              inputMode="decimal"
              value={paraRateRaw}
              onChange={(e) => setParaRateRaw(e.target.value)}
              style={fieldStyle()}
            />
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <button
            type="button"
            className="text-muted"
            onClick={() => setShowAdvanced((v) => !v)}
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "0.82rem", textDecoration: "underline" }}
            aria-expanded={showAdvanced}
          >
            {showAdvanced ? "Hide" : "Add"} average case value to model recovered revenue
          </button>
          {showAdvanced ? (
            <div style={{ marginTop: 10, maxWidth: 260 }}>
              <label className="label" htmlFor="ilc-case-value">
                Avg case value ($)
              </label>
              <input
                id="ilc-case-value"
                type="number"
                min={0}
                inputMode="decimal"
                placeholder="e.g. 8000"
                value={caseValueRaw}
                onChange={(e) => setCaseValueRaw(e.target.value)}
                style={fieldStyle()}
              />
            </div>
          ) : null}
        </div>

        <div className="text-muted" style={{ marginTop: 12, fontSize: "0.8125rem", lineHeight: 1.5 }}>
          Referral firm with no per-call cost? Set cost / call to 0 and the leak runs on paralegal hours alone. These
          are your numbers, not a benchmark - adjust them to your firm.
        </div>
      </div>

      {!hasEnoughInput ? (
        <div className="card mt-4" style={{ borderRadius: 16 }}>
          <div className="text-muted">Enter your monthly call volume and the share that never convert to see your leak.</div>
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
                <div className="text-white" style={{ fontWeight: 800, fontSize: "1.6rem", letterSpacing: "-0.02em" }}>
                  {formatUSD(result.monthlyLeak)} / month leaking
                </div>
                <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                  {formatUSD(result.annualLeak)} / year &middot; {result.workdaysLostPerMonth.toFixed(1)} paralegal workdays / month
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
                Unlock the full leak report
              </div>
              <div className="text-muted" style={{ fontSize: "0.82rem", marginBottom: 10, lineHeight: 1.45 }}>
                See the annual leak, the paralegal time a screening layer reclaims, and where the fix pays for itself.
              </div>
              <div className="flex flex--gap-2 flex--resp-col" style={{ maxWidth: 460 }}>
                <label className="sr-only" htmlFor="ilc-email">
                  Email
                </label>
                <input
                  id="ilc-email"
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
                      Also adds you to firm intake updates. Unsubscribe anytime.{" "}
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
                Full leak report
              </div>

              <div className="mt-4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                <div>
                  <div className="text-muted" style={{ fontSize: "0.82rem" }}>
                    Annual leak
                  </div>
                  <div className="text-white" style={{ fontWeight: 800, fontSize: "1.4rem" }}>
                    {formatUSD(result.annualLeak)}
                  </div>
                </div>
                <div>
                  <div className="text-muted" style={{ fontSize: "0.82rem" }}>
                    Paralegal time reclaimed / month
                    <span title="Modeled: a screening layer is assumed to give back ~60% of dead-call time. Conservative, not guaranteed." style={{ cursor: "help" }}>
                      {" "}&#9432;
                    </span>
                  </div>
                  <div className="text-white" style={{ fontWeight: 800, fontSize: "1.4rem" }}>
                    {formatUSD(result.recoverableLaborDollars)}
                  </div>
                </div>
                <div>
                  <div className="text-muted" style={{ fontSize: "0.82rem" }}>
                    {result.hasRecoveryModel ? "Signed-case value recovered / month" : "Wasted paralegal hours / month"}
                    {result.hasRecoveryModel ? (
                      <span title="Modeled: a trained team is assumed to convert a small share of workable 'maybe' calls. Conservative, not guaranteed." style={{ cursor: "help" }}>
                        {" "}&#9432;
                      </span>
                    ) : null}
                  </div>
                  <div className="text-white" style={{ fontWeight: 800, fontSize: "1.4rem" }}>
                    {result.hasRecoveryModel ? formatUSD(result.recoveredRevenue) : result.wastedHours.toFixed(0)}
                  </div>
                </div>
              </div>

              <p className="text-muted" style={{ marginTop: 14, lineHeight: 1.55 }}>
                {recommendation(result)}
              </p>

              <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Link
                  className="btn btn--primary btn--sm"
                  href="/paralegals"
                  onClick={() => trackToolCTA("/paralegals")}
                >
                  See what a Paralegal Team costs vs. your leak
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
        This calculator gives a directional read on intake leak, not an audit. The recovery figures are modeled and
        conservative, not a promise - actual results vary by case mix, source quality, and how intake is run.
      </div>
    </div>
  );
}
