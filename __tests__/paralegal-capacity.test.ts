/**
 * Unit tests: Paralegal Capacity Calculator scoring.
 *
 * Locks the pure logic in lib/paralegal-capacity.ts:
 *   - practice type target bands
 *   - core ratio math (division-by-zero guards on paralegals/attorneys)
 *   - status thresholds (green/amber/red boundaries, attorney-ratio override)
 *   - gated report math (casesUnderServed, staffingGap)
 *
 * Run: npx vitest run __tests__/paralegal-capacity.test.ts
 */

import { describe, it, expect } from "vitest";
import {
  calculateCapacity,
  practiceTypeTarget,
  practiceTypeLabel,
  statusLabel,
  verdictSentence,
  recommendation,
  PRACTICE_TYPE_TARGETS,
  PRACTICE_TYPES,
  DEFAULT_PRACTICE_TYPE,
  type CapacityInputs
} from "@/lib/paralegal-capacity";

describe("practice type targets", () => {
  it("matches the fixed rule-of-thumb bands", () => {
    expect(PRACTICE_TYPE_TARGETS).toEqual({
      auto: 70,
      premises: 60,
      medmal: 35,
      masstort: 40,
      mixed: 50
    });
  });

  it("defaults to mixed", () => {
    expect(DEFAULT_PRACTICE_TYPE).toBe("mixed");
  });

  it("every listed practice type has a target and a label", () => {
    for (const pt of PRACTICE_TYPES) {
      expect(practiceTypeTarget(pt)).toBeGreaterThan(0);
      expect(practiceTypeLabel(pt).length).toBeGreaterThan(0);
    }
  });
});

describe("calculateCapacity - core ratios", () => {
  it("computes cases per paralegal and attorney ratio for a normal case", () => {
    const inputs: CapacityInputs = { attorneys: 3, paralegals: 5, activeCases: 460, newIntakesPerMonth: 50, practiceType: "mixed" };
    const r = calculateCapacity(inputs);

    expect(r.target).toBe(50);
    expect(r.casesPerParalegal).toBeCloseTo(92, 5);
    expect(r.attorneyRatio).toBeCloseTo(5 / 3, 5);
    expect(r.overloadPct).toBeCloseTo(84, 5);
    expect(r.intakeLoadPerPara).toBeCloseTo(10, 5);
  });

  it("guards division by zero when paralegals is 0 (uses max(paralegals,1) for ratios)", () => {
    const inputs: CapacityInputs = { attorneys: 2, paralegals: 0, activeCases: 100, newIntakesPerMonth: 10, practiceType: "mixed" };
    const r = calculateCapacity(inputs);

    expect(r.casesPerParalegal).toBeCloseTo(100, 5); // 100 / max(0,1)
    expect(r.intakeLoadPerPara).toBeCloseTo(10, 5); // 10 / max(0,1)
    expect(r.attorneyRatio).toBe(0); // raw paralegals (0) / max(attorneys,1)
  });

  it("guards division by zero when attorneys is 0 (uses max(attorneys,1) for attorneyRatio)", () => {
    const inputs: CapacityInputs = { attorneys: 0, paralegals: 2, activeCases: 50, newIntakesPerMonth: 5, practiceType: "mixed" };
    const r = calculateCapacity(inputs);

    expect(r.attorneyRatio).toBeCloseTo(2, 5); // 2 / max(0,1)
  });

  it("defaults to the mixed target when practiceType is omitted", () => {
    const inputs: CapacityInputs = { attorneys: 2, paralegals: 2, activeCases: 100, newIntakesPerMonth: 10 };
    const r = calculateCapacity(inputs);
    expect(r.target).toBe(50);
  });
});

describe("calculateCapacity - status thresholds", () => {
  const base = { attorneys: 4, newIntakesPerMonth: 10, practiceType: "mixed" as const };

  it("green when overloadPct <= 0", () => {
    // casesPerParalegal = 50 -> overloadPct = 0
    expect(calculateCapacity({ ...base, paralegals: 2, activeCases: 100 }).status).toBe("green");
    // casesPerParalegal = 45 -> overloadPct = -10
    expect(calculateCapacity({ ...base, paralegals: 2, activeCases: 90 }).status).toBe("green");
  });

  it("amber when 0 < overloadPct <= 40", () => {
    // casesPerParalegal = 70 -> overloadPct = 40 (boundary, inclusive)
    expect(calculateCapacity({ ...base, paralegals: 2, activeCases: 140 }).status).toBe("amber");
    // casesPerParalegal = 60 -> overloadPct = 20
    expect(calculateCapacity({ ...base, paralegals: 2, activeCases: 120 }).status).toBe("amber");
  });

  it("red when overloadPct > 40", () => {
    // casesPerParalegal = 71 -> overloadPct = 42
    expect(calculateCapacity({ ...base, paralegals: 2, activeCases: 142 }).status).toBe("red");
  });

  it("red when attorneyRatio < 0.5, even if overloadPct is low", () => {
    // paralegals=1, attorneys=3 -> ratio = 0.333; casesPerParalegal = 10 -> overloadPct = -80 (would be green)
    const r = calculateCapacity({ attorneys: 3, paralegals: 1, activeCases: 10, newIntakesPerMonth: 5, practiceType: "mixed" });
    expect(r.attorneyRatio).toBeLessThan(0.5);
    expect(r.overloadPct).toBeLessThan(0);
    expect(r.status).toBe("red");
  });
});

describe("calculateCapacity - gated report math", () => {
  it("computes casesUnderServed and staffingGap for an over-capacity firm", () => {
    const inputs: CapacityInputs = { attorneys: 3, paralegals: 5, activeCases: 460, newIntakesPerMonth: 50, practiceType: "mixed" };
    const r = calculateCapacity(inputs);

    // casesUnderServed = max(0, 460 - 5*50) = 210
    expect(r.casesUnderServed).toBe(210);
    // staffingGap = max(0, ceil(460/50) - 5) = max(0, 10 - 5) = 5
    expect(r.staffingGap).toBe(5);
  });

  it("floors both at 0 for an under-capacity firm", () => {
    const inputs: CapacityInputs = { attorneys: 3, paralegals: 5, activeCases: 100, newIntakesPerMonth: 10, practiceType: "mixed" };
    const r = calculateCapacity(inputs);

    expect(r.casesUnderServed).toBe(0);
    expect(r.staffingGap).toBe(0);
  });

  it("handles zero paralegals without throwing and reports the full gap", () => {
    const inputs: CapacityInputs = { attorneys: 2, paralegals: 0, activeCases: 100, newIntakesPerMonth: 10, practiceType: "mixed" };
    const r = calculateCapacity(inputs);

    // casesUnderServed = max(0, 100 - 0*50) = 100
    expect(r.casesUnderServed).toBe(100);
    // staffingGap = max(0, ceil(100/50) - 0) = 2
    expect(r.staffingGap).toBe(2);
  });
});

describe("copy helpers", () => {
  it("statusLabel covers all three statuses", () => {
    expect(statusLabel("green")).toBe("Under capacity");
    expect(statusLabel("amber")).toBe("Approaching capacity");
    expect(statusLabel("red")).toBe("Over capacity");
  });

  it("verdictSentence names the over-capacity direction and rounded numbers", () => {
    const r = calculateCapacity({ attorneys: 3, paralegals: 5, activeCases: 460, newIntakesPerMonth: 50, practiceType: "mixed" });
    const sentence = verdictSentence(r);
    expect(sentence).toContain("92");
    expect(sentence).toContain("84%");
    expect(sentence).toContain("over");
  });

  it("verdictSentence names the under-capacity direction", () => {
    const r = calculateCapacity({ attorneys: 3, paralegals: 5, activeCases: 200, newIntakesPerMonth: 20, practiceType: "mixed" });
    const sentence = verdictSentence(r);
    expect(sentence).toContain("under");
  });

  it("recommendation does not restate the Paralegal Teams price", () => {
    const r = calculateCapacity({ attorneys: 3, paralegals: 5, activeCases: 460, newIntakesPerMonth: 50, practiceType: "mixed" });
    const text = recommendation(r, "mixed");
    expect(text).not.toMatch(/\$3,?750|\$6,?500/);
  });

  it("recommendation uses singular 'paralegal' when staffingGap is 1", () => {
    // activeCases just over one paralegal's worth of gap
    const r = calculateCapacity({ attorneys: 5, paralegals: 4, activeCases: 250, newIntakesPerMonth: 20, practiceType: "mixed" });
    expect(r.staffingGap).toBe(1);
    expect(recommendation(r, "mixed")).toContain("1 more paralegal ");
  });

  it("no copy helper output contains an em dash", () => {
    const r = calculateCapacity({ attorneys: 3, paralegals: 5, activeCases: 460, newIntakesPerMonth: 50, practiceType: "mixed" });
    for (const text of [verdictSentence(r), recommendation(r, "mixed"), statusLabel(r.status)]) {
      expect(text).not.toContain("—");
    }
  });
});
