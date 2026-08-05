import { describe, expect, it } from "vitest";
import { calculateStackCost, type StackCostInputs } from "@/lib/law-firm-stack-cost";

function inputs(overrides: Partial<StackCostInputs> = {}): StackCostInputs {
  return {
    monthlySoftwareCost: 1_000,
    setupHours: 10,
    monthlyMaintenanceHours: 2,
    ownerRole: "operations",
    ownerHourlyValue: 100,
    disruptionsPerQuarter: 1,
    hoursLostPerDisruption: 2,
    ...overrides,
  };
}

describe("calculateStackCost", () => {
  it("calculates first-year, recurring, and three-year ownership cost", () => {
    const result = calculateStackCost(inputs());

    expect(result.annualLicenseCost).toBe(12_000);
    expect(result.setupLaborCost).toBe(1_000);
    expect(result.annualMaintenanceCost).toBe(2_400);
    expect(result.annualDowntimeCost).toBe(800);
    expect(result.hiddenLaborCost).toBe(4_200);
    expect(result.recurringAnnualCost).toBe(15_200);
    expect(result.firstYearCost).toBe(16_200);
    expect(result.threeYearCost).toBe(46_600);
    expect(result.firstYearOperatorHours).toBe(42);
    expect(result.recurringOperatorHours).toBe(32);
    expect(result.dominantCostDriver).toBe("software");
    expect(result.verdict.key).toBe("keep");
  });

  it("recommends handing off when an attorney owns material recurring work", () => {
    const result = calculateStackCost(
      inputs({
        monthlySoftwareCost: 2_000,
        setupHours: 0,
        monthlyMaintenanceHours: 6,
        ownerRole: "managing-attorney",
        ownerHourlyValue: 350,
        disruptionsPerQuarter: 0,
        hoursLostPerDisruption: 0,
      }),
    );

    expect(result.recurringOperatorHours).toBe(72);
    expect(result.verdict.key).toBe("hand-off");
  });

  it("recommends simplifying when recurring labor outweighs software", () => {
    const result = calculateStackCost(
      inputs({
        monthlySoftwareCost: 500,
        setupHours: 0,
        monthlyMaintenanceHours: 12,
        ownerRole: "operations",
        ownerHourlyValue: 75,
        disruptionsPerQuarter: 0,
        hoursLostPerDisruption: 0,
      }),
    );

    expect(result.recurringLaborShare).toBeGreaterThan(0.5);
    expect(result.verdict.key).toBe("simplify");
  });

  it("recommends replacing the weak link when disruptions are material", () => {
    const result = calculateStackCost(
      inputs({
        monthlySoftwareCost: 2_000,
        setupHours: 0,
        monthlyMaintenanceHours: 2,
        ownerHourlyValue: 300,
        disruptionsPerQuarter: 4,
        hoursLostPerDisruption: 4,
      }),
    );

    expect(result.annualDowntimeHours).toBe(64);
    expect(result.annualDowntimeCost).toBe(19_200);
    expect(result.verdict.key).toBe("replace-weak-link");
  });

  it("treats negative and non-finite numeric inputs as zero", () => {
    const result = calculateStackCost(
      inputs({
        monthlySoftwareCost: -100,
        setupHours: Number.POSITIVE_INFINITY,
        monthlyMaintenanceHours: -1,
        ownerHourlyValue: -50,
        disruptionsPerQuarter: Number.NaN,
        hoursLostPerDisruption: -2,
      }),
    );

    expect(result.firstYearCost).toBe(0);
    expect(result.threeYearCost).toBe(0);
    expect(result.hiddenLaborShare).toBe(0);
    expect(result.verdict.key).toBe("keep");
  });
});
