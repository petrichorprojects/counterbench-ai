export const INTAKE_LEAK_DEFAULTS = {
  callVolume: 120,
  costPerCall: 30,
  seriousRate: 12,
  averageMinutes: 9,
  hourlyCost: 32,
} as const;

export interface IntakeLeakInput {
  callVolume?: number | string;
  costPerCall?: number | string;
  seriousRate?: number | string;
  averageMinutes?: number | string;
  hourlyCost?: number | string;
}

export interface IntakeLeakResult {
  callVolume: number;
  costPerCall: number;
  seriousRate: number;
  averageMinutes: number;
  hourlyCost: number;
  seriousCalls: number;
  nonSeriousCalls: number;
  monthlyLsaSpend: number;
  nonSeriousAdSpend: number;
  staffHours: number;
  staffCost: number;
  monthlyLeak: number;
  annualLeak: number;
  callsPerSeriousInquiry: number | null;
  costPerSeriousInquiry: number | null;
}

function clamp(value: number | string | undefined, minimum: number, maximum: number): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return minimum;
  return Math.min(maximum, Math.max(minimum, numeric));
}

export function calculateIntakeLeak(input: IntakeLeakInput = {}): IntakeLeakResult {
  const callVolume = clamp(input.callVolume ?? INTAKE_LEAK_DEFAULTS.callVolume, 0, 100_000);
  const costPerCall = clamp(input.costPerCall ?? INTAKE_LEAK_DEFAULTS.costPerCall, 0, 10_000);
  const seriousRate = clamp(input.seriousRate ?? INTAKE_LEAK_DEFAULTS.seriousRate, 0, 100);
  const averageMinutes = clamp(input.averageMinutes ?? INTAKE_LEAK_DEFAULTS.averageMinutes, 0, 480);
  const hourlyCost = clamp(input.hourlyCost ?? INTAKE_LEAK_DEFAULTS.hourlyCost, 0, 1_000);

  const seriousCalls = callVolume * (seriousRate / 100);
  const nonSeriousCalls = callVolume - seriousCalls;
  const monthlyLsaSpend = callVolume * costPerCall;
  const nonSeriousAdSpend = nonSeriousCalls * costPerCall;
  const staffHours = (nonSeriousCalls * averageMinutes) / 60;
  const staffCost = staffHours * hourlyCost;
  const monthlyLeak = nonSeriousAdSpend + staffCost;

  return {
    callVolume,
    costPerCall,
    seriousRate,
    averageMinutes,
    hourlyCost,
    seriousCalls,
    nonSeriousCalls,
    monthlyLsaSpend,
    nonSeriousAdSpend,
    staffHours,
    staffCost,
    monthlyLeak,
    annualLeak: monthlyLeak * 12,
    callsPerSeriousInquiry: seriousCalls > 0 ? callVolume / seriousCalls : null,
    costPerSeriousInquiry: seriousCalls > 0 ? monthlyLsaSpend / seriousCalls : null,
  };
}
