// Intake Leak Calculator — pure calculation logic.
// Mirrors the shape of lib/paralegal-capacity.ts: types + pure functions, no React.
// A firm enters its intake volume and cost; this returns the dollars and paralegal
// hours it burns each month on calls that never become clients, then frames that
// number as the budget for a screening + paralegal-team fix.

export interface IntakeInputs {
  callsPerMonth: number;
  costPerCall: number; // USD per inbound intake call (LSA/PPC blended); 0 for referral firms
  shareNeverConvertPct: number; // 0-100, share of calls that never become clients
  minutesPerCall: number; // paralegal minutes spent per dead call (screen + notes + follow-up)
  paralegalCostPerHour: number; // loaded cost per hour
  // Optional advanced inputs for the modeled-recovery line. 0 = omit.
  avgCaseValue: number;
  currentSignRatePct: number; // 0-100
}

export type IntakeStatus = "green" | "amber" | "red";

export interface IntakeResult {
  wastedCalls: number;
  wastedAdDollars: number;
  wastedHours: number;
  wastedLaborDollars: number;
  monthlyLeak: number;
  annualLeak: number;
  workdaysLostPerMonth: number;
  // Modeled, conservative recovery (labeled as such in the UI).
  recoverableLaborDollars: number;
  recoveredRevenue: number; // 0 unless avgCaseValue provided
  status: IntakeStatus;
  hasRecoveryModel: boolean;
}

// Conservative recovery multipliers. Surfaced on hover in the UI; never presented
// as guaranteed. A screening + trained-team layer is modeled to reclaim ~60% of
// dead-call time and lift the signed-case count off the "maybes" it works properly.
export const RECOVERY = {
  laborReclaimRate: 0.6, // share of dead-call hours a screening layer gives back
  maybeShareOfCalls: 0.15, // share of calls that are workable "maybes"
  signRateLift: 0.1 // extra conversion on those maybes with a trained team
} as const;

// Red once the monthly leak clears a paralegal-team retainer floor ($3,750/mo):
// at that point the leak itself is the budget for the fix. Amber is a real but
// sub-retainer leak; green is a modest one.
const RED_FLOOR = 3750;
const AMBER_FLOOR = 1000;

function clampPct(pct: number): number {
  if (!Number.isFinite(pct) || pct < 0) return 0;
  if (pct > 100) return 100;
  return pct;
}

function nonNeg(n: number): number {
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function calculateIntakeLeak(input: IntakeInputs): IntakeResult {
  const calls = nonNeg(input.callsPerMonth);
  const costPerCall = nonNeg(input.costPerCall);
  const share = clampPct(input.shareNeverConvertPct) / 100;
  const minutes = nonNeg(input.minutesPerCall);
  const paraRate = nonNeg(input.paralegalCostPerHour);
  const avgCaseValue = nonNeg(input.avgCaseValue);

  const wastedCalls = calls * share;
  const wastedAdDollars = wastedCalls * costPerCall;
  const wastedHours = (wastedCalls * minutes) / 60;
  const wastedLaborDollars = wastedHours * paraRate;
  const monthlyLeak = wastedAdDollars + wastedLaborDollars;
  const annualLeak = monthlyLeak * 12;
  const workdaysLostPerMonth = wastedHours / 8;

  const recoverableLaborDollars = wastedHours * RECOVERY.laborReclaimRate * paraRate;

  const hasRecoveryModel = avgCaseValue > 0;
  const extraCasesPerMonth = calls * RECOVERY.maybeShareOfCalls * RECOVERY.signRateLift;
  const recoveredRevenue = hasRecoveryModel ? extraCasesPerMonth * avgCaseValue : 0;

  let status: IntakeStatus = "green";
  if (monthlyLeak >= RED_FLOOR) status = "red";
  else if (monthlyLeak >= AMBER_FLOOR) status = "amber";

  return {
    wastedCalls,
    wastedAdDollars,
    wastedHours,
    wastedLaborDollars,
    monthlyLeak,
    annualLeak,
    workdaysLostPerMonth,
    recoverableLaborDollars,
    recoveredRevenue,
    status,
    hasRecoveryModel
  };
}

export function statusLabel(status: IntakeStatus): string {
  switch (status) {
    case "green":
      return "Contained leak";
    case "amber":
      return "Real leak";
    case "red":
      return "Retainer-sized leak";
  }
}

export function formatUSD(n: number): string {
  const rounded = Math.round(nonNeg(n));
  return "$" + rounded.toLocaleString("en-US");
}

export function verdictSentence(r: IntakeResult): string {
  const leak = formatUSD(r.monthlyLeak);
  const days = r.workdaysLostPerMonth.toFixed(1);
  if (r.status === "red") {
    return `Your firm burns about ${leak} a month on calls that never become clients, and roughly ${days} paralegal workdays with them. That is more than a paralegal team costs. The leak is the budget for the fix.`;
  }
  if (r.status === "amber") {
    return `Your firm loses about ${leak} a month to intake that goes nowhere, plus roughly ${days} paralegal workdays. Not fatal, but it is a real line item hiding as "just how intake works."`;
  }
  return `Your intake leak runs about ${leak} a month and roughly ${days} paralegal workdays. Modest today. Worth watching as your call volume grows, because the leak scales with it.`;
}

export function recommendation(r: IntakeResult): string {
  const reclaim = formatUSD(r.recoverableLaborDollars);
  const base = `Intake is a triage problem, not a phone problem. Software screens the obvious noise; a trained paralegal works the maybes in the middle. Run both layers and a conservative model reclaims about ${reclaim} of paralegal time a month`;
  if (r.hasRecoveryModel && r.recoveredRevenue > 0) {
    return `${base}, plus roughly ${formatUSD(r.recoveredRevenue)} in signed-case value that today slips through mishandled calls. Modeled, not guaranteed. The point is the number is big enough to fund a better system.`;
  }
  return `${base}. Add your average case value to model the signed cases you recover on top of that. The point is the leak is usually big enough to fund a better system.`;
}
