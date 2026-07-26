/**
 * Unit tests: /api/conflict-audit-benchmark input normalization.
 *
 * Covers the validation layer that keeps hostile or malformed POSTs from
 * poisoning the benchmark dataset. The DB insert itself is not exercised here
 * (integration concern); normalizeBenchmark is pure and the unit under test.
 *
 * Run: npx vitest run __tests__/conflict-audit-benchmark.test.ts
 */

import { describe, it, expect } from "vitest";
import { normalizeBenchmark } from "@/lib/conflict-benchmark";

describe("normalizeBenchmark — score", () => {
  it("accepts an in-range integer", () => {
    const r = normalizeBenchmark({ score: 16, tier: "person_dependent" });
    expect(r).toMatchObject({ score: 16 });
  });
  it("coerces numeric strings", () => {
    const r = normalizeBenchmark({ score: "0", tier: "undocumented" });
    expect(r).toMatchObject({ score: 0 });
  });
  it("rejects out-of-range", () => {
    expect(normalizeBenchmark({ score: 25, tier: "documented" })).toHaveProperty("error");
    expect(normalizeBenchmark({ score: -1, tier: "documented" })).toHaveProperty("error");
  });
  it("rejects non-integers and junk", () => {
    expect(normalizeBenchmark({ score: 3.5, tier: "reactive" })).toHaveProperty("error");
    expect(normalizeBenchmark({ score: "abc", tier: "reactive" })).toHaveProperty("error");
    expect(normalizeBenchmark({ score: null, tier: "reactive" })).toHaveProperty("error");
  });
});

describe("normalizeBenchmark — tier", () => {
  it("accepts the four known tiers", () => {
    for (const tier of ["documented", "person_dependent", "reactive", "undocumented"]) {
      expect(normalizeBenchmark({ score: 10, tier })).not.toHaveProperty("error");
    }
  });
  it("rejects unknown tiers", () => {
    expect(normalizeBenchmark({ score: 10, tier: "Person-dependent" })).toHaveProperty("error");
    expect(normalizeBenchmark({ score: 10, tier: "" })).toHaveProperty("error");
    expect(normalizeBenchmark({ score: 10, tier: 5 })).toHaveProperty("error");
  });
});

describe("normalizeBenchmark — firmographics drop to null, never reject", () => {
  it("keeps valid firm sizes, nulls the rest", () => {
    expect(normalizeBenchmark({ score: 1, tier: "reactive", firm_size: "6-10" })).toMatchObject({ firmSize: "6-10" });
    expect(normalizeBenchmark({ score: 1, tier: "reactive", firm_size: "unspecified" })).toMatchObject({ firmSize: null });
    expect(normalizeBenchmark({ score: 1, tier: "reactive", firm_size: "HUGE" })).toMatchObject({ firmSize: null });
    expect(normalizeBenchmark({ score: 1, tier: "reactive" })).toMatchObject({ firmSize: null });
  });

  it("normalizes state to a 2-letter uppercase code or null", () => {
    expect(normalizeBenchmark({ score: 1, tier: "reactive", state: "ca" })).toMatchObject({ state: "CA" });
    expect(normalizeBenchmark({ score: 1, tier: "reactive", state: " ny " })).toMatchObject({ state: "NY" });
    expect(normalizeBenchmark({ score: 1, tier: "reactive", state: "California" })).toMatchObject({ state: null });
    expect(normalizeBenchmark({ score: 1, tier: "reactive", state: "" })).toMatchObject({ state: null });
  });

  it("clamps practice area to 80 chars, nulls empty", () => {
    const long = "x".repeat(200);
    const r = normalizeBenchmark({ score: 1, tier: "reactive", practice_area: long });
    expect((r as { practiceArea: string }).practiceArea).toHaveLength(80);
    expect(normalizeBenchmark({ score: 1, tier: "reactive", practice_area: "  " })).toMatchObject({ practiceArea: null });
  });

  it("never stores anything resembling PII from unexpected fields", () => {
    // Extra fields (name, email) are simply ignored — not in the output shape.
    const r = normalizeBenchmark({
      score: 8,
      tier: "reactive",
      // @ts-expect-error — hostile extra fields must be dropped, not stored
      email: "leak@example.com",
      name: "Jane Doe",
    });
    expect(Object.keys(r as object).sort()).toEqual(["firmSize", "practiceArea", "score", "state", "tier"]);
  });
});
