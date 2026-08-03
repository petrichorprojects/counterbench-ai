/**
 * Paralegal Capacity Calculator - data + pure scoring logic.
 *
 * Pure data and pure functions only. No React, no DOM, no side effects, so
 * the whole module is unit-testable and can be imported by the server
 * component to render the tool without depending on client-side state.
 *
 * The target caseload bands below are an industry rule of thumb, not a
 * measured benchmark - every case type, jurisdiction, and firm workflow
 * differs. The UI must label this as a starting point, adjustable per firm,
 * never as hard data.
 */

export type PracticeType = "auto" | "premises" | "medmal" | "masstort" | "mixed";

export type CapacityStatus = "green" | "amber" | "red";

export interface CapacityInputs {
  attorneys: number;
  paralegals: number;
  activeCases: number;
  newIntakesPerMonth: number;
  practiceType?: PracticeType;
}

export interface CapacityResult {
  /** Active cases carried per paralegal at current staffing. */
  casesPerParalegal: number;
  /** Paralegals per attorney. Below 0.5 signals thin paralegal support regardless of caseload. */
  attorneyRatio: number;
  /** Target caseload per paralegal for the selected practice mix (rule of thumb). */
  target: number;
  /** Percent over (positive) or under (negative/zero) the target caseload. */
  overloadPct: number;
  /** New intakes per paralegal per month. */
  intakeLoadPerPara: number;
  status: CapacityStatus;
  /** Active cases being carried past what the target caseload supports. */
  casesUnderServed: number;
  /** Additional paralegals needed to bring caseload back to the target. */
  staffingGap: number;
}

export const DEFAULT_PRACTICE_TYPE: PracticeType = "mixed";

/** Order mirrors how the options should appear in the UI. */
export const PRACTICE_TYPES: PracticeType[] = ["mixed", "auto", "premises", "medmal", "masstort"];

export const PRACTICE_TYPE_TARGETS: Record<PracticeType, number> = {
  auto: 70,
  premises: 60,
  medmal: 35,
  masstort: 40,
  mixed: 50
};

export const PRACTICE_TYPE_LABELS: Record<PracticeType, string> = {
  auto: "Auto accident",
  premises: "Premises liability",
  medmal: "Medical malpractice",
  masstort: "Mass tort",
  mixed: "Mixed / general PI"
};

export function practiceTypeLabel(practiceType: PracticeType): string {
  return PRACTICE_TYPE_LABELS[practiceType];
}

export function practiceTypeTarget(practiceType: PracticeType): number {
  return PRACTICE_TYPE_TARGETS[practiceType];
}

export function calculateCapacity(inputs: CapacityInputs): CapacityResult {
  const practiceType = inputs.practiceType ?? DEFAULT_PRACTICE_TYPE;
  const target = PRACTICE_TYPE_TARGETS[practiceType];

  const paralegalsForDivision = Math.max(inputs.paralegals, 1);
  const attorneysForDivision = Math.max(inputs.attorneys, 1);

  const casesPerParalegal = inputs.activeCases / paralegalsForDivision;
  const attorneyRatio = inputs.paralegals / attorneysForDivision;
  const overloadPct = (casesPerParalegal / target - 1) * 100;
  const intakeLoadPerPara = inputs.newIntakesPerMonth / paralegalsForDivision;

  let status: CapacityStatus;
  if (overloadPct > 40 || attorneyRatio < 0.5) {
    status = "red";
  } else if (overloadPct > 0) {
    status = "amber";
  } else {
    status = "green";
  }

  const casesUnderServed = Math.max(0, inputs.activeCases - inputs.paralegals * target);
  const staffingGap = Math.max(0, Math.ceil(inputs.activeCases / target) - inputs.paralegals);

  return {
    casesPerParalegal,
    attorneyRatio,
    target,
    overloadPct,
    intakeLoadPerPara,
    status,
    casesUnderServed,
    staffingGap
  };
}

export function statusLabel(status: CapacityStatus): string {
  if (status === "green") return "Under capacity";
  if (status === "amber") return "Approaching capacity";
  return "Over capacity";
}

/**
 * One-line, ungated verdict. Kept plain and numeric - no hype, no adjectives
 * beyond what the numbers support.
 */
export function verdictSentence(result: CapacityResult): string {
  const cases = Math.round(result.casesPerParalegal);
  const overPct = Math.round(result.overloadPct);

  if (result.overloadPct <= 0) {
    const underPct = Math.abs(overPct);
    return `Your paralegals carry about ${cases} active cases each, about ${underPct}% under the target caseload for this practice mix.`;
  }

  return `Your paralegals carry about ${cases} active cases each, about ${overPct}% over a manageable caseload.`;
}

/**
 * Gated recommendation paragraph. Neutral, operator voice - states the gap in
 * this firm's own numbers, then names the service that closes it without
 * quoting price or claiming exclusivity.
 */
export function recommendation(result: CapacityResult, practiceType: PracticeType): string {
  const label = practiceTypeLabel(practiceType).toLowerCase();

  if (result.status === "green") {
    return `At current staffing, this firm's paralegal caseload is within the industry rule of thumb for ${label} work. Keep watching intake volume as case count grows - the gap can open quickly after a busy quarter.`;
  }

  const underServed = Math.round(result.casesUnderServed);
  const gapNote =
    result.staffingGap > 0
      ? ` Closing the gap fully would take roughly ${result.staffingGap} more paralegal${result.staffingGap === 1 ? "" : "s"} at this caseload target.`
      : "";

  return `At current staffing, about ${underServed} active case${underServed === 1 ? "" : "s"} are being carried past a manageable caseload for ${label} work.${gapNote} Paralegal Teams adds dedicated paralegal capacity sized to that gap, without a full-time hire.`;
}
