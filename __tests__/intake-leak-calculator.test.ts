import { describe, expect, it } from "vitest";
import { calculateIntakeLeak, INTAKE_LEAK_DEFAULTS } from "@/lib/intake-leak-calculator";

describe("calculateIntakeLeak", () => {
  it("calculates the default monthly leak", () => {
    const result = calculateIntakeLeak(INTAKE_LEAK_DEFAULTS);

    expect(result.seriousCalls).toBeCloseTo(14.4);
    expect(result.nonSeriousCalls).toBeCloseTo(105.6);
    expect(result.nonSeriousAdSpend).toBeCloseTo(3168);
    expect(result.staffHours).toBeCloseTo(15.84);
    expect(result.staffCost).toBeCloseTo(506.88);
    expect(result.monthlyLeak).toBeCloseTo(3674.88);
    expect(result.annualLeak).toBeCloseTo(44098.56);
    expect(result.costPerSeriousInquiry).toBeCloseTo(250);
  });

  it("returns null ratios when the serious-inquiry rate is zero", () => {
    const result = calculateIntakeLeak({ ...INTAKE_LEAK_DEFAULTS, seriousRate: 0 });

    expect(result.seriousCalls).toBe(0);
    expect(result.callsPerSeriousInquiry).toBeNull();
    expect(result.costPerSeriousInquiry).toBeNull();
  });

  it("clamps percentages and negative inputs", () => {
    const result = calculateIntakeLeak({
      callVolume: -10,
      costPerCall: -5,
      seriousRate: 140,
      averageMinutes: -1,
      hourlyCost: -20,
    });

    expect(result.callVolume).toBe(0);
    expect(result.costPerCall).toBe(0);
    expect(result.seriousRate).toBe(100);
    expect(result.averageMinutes).toBe(0);
    expect(result.hourlyCost).toBe(0);
    expect(result.monthlyLeak).toBe(0);
  });

  it("accepts form values as strings", () => {
    const result = calculateIntakeLeak({
      callVolume: "50",
      costPerCall: "30",
      seriousRate: "2",
      averageMinutes: "10",
      hourlyCost: "30",
    });

    expect(result.nonSeriousCalls).toBe(49);
    expect(result.staffHours).toBeCloseTo(8.1667, 3);
    expect(result.monthlyLeak).toBeCloseTo(1715);
  });
});
