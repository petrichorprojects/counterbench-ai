/**
 * Unit tests: Conflict Check Blind Spot Audit scoring.
 *
 * Locks the pure logic in lib/conflict-check-audit.ts:
 *   - tier boundaries (every threshold, both sides)
 *   - blind-spot triggers (each question fires exactly at/below its trigger)
 *   - finding ordering (cheapest fix first, structural last)
 *   - completeness flag
 *   - data integrity of the question set
 *
 * Run: npx vitest run __tests__/conflict-check-audit.test.ts
 */

import { describe, it, expect } from "vitest";
import {
  QUESTIONS,
  TIERS,
  MAX_SCORE,
  scoreAudit,
  tierForScore,
  rulesFromFindings,
  type AuditAnswers,
  type OptionValue,
} from "@/lib/conflict-check-audit";

function answerAll(value: OptionValue): AuditAnswers {
  return Object.fromEntries(QUESTIONS.map((q) => [q.id, value]));
}

describe("data integrity", () => {
  it("has exactly 8 questions and MAX_SCORE 24", () => {
    expect(QUESTIONS).toHaveLength(8);
    expect(MAX_SCORE).toBe(24);
  });

  it("every question has 4 options scoring 0,1,2,3", () => {
    for (const q of QUESTIONS) {
      expect(q.options.map((o) => o.value)).toEqual([0, 1, 2, 3]);
    }
  });

  it("question ids and keys are unique", () => {
    expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(8);
    expect(new Set(QUESTIONS.map((q) => q.key)).size).toBe(8);
  });

  it("tiers tile 0–24 with no gaps or overlaps", () => {
    const sorted = [...TIERS].sort((a, b) => a.min - b.min);
    expect(sorted[0]!.min).toBe(0);
    expect(sorted[sorted.length - 1]!.max).toBe(24);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i]!.min).toBe(sorted[i - 1]!.max + 1);
    }
  });
});

describe("tierForScore boundaries", () => {
  const cases: [number, string][] = [
    [0, "undocumented"],
    [5, "undocumented"],
    [6, "reactive"],
    [11, "reactive"],
    [12, "person_dependent"],
    [18, "person_dependent"],
    [19, "documented"],
    [24, "documented"],
  ];
  it.each(cases)("score %i => %s", (score, key) => {
    expect(tierForScore(score).key).toBe(key);
  });
});

describe("scoreAudit totals", () => {
  it("all 3s = 24, Documented, no findings", () => {
    const r = scoreAudit(answerAll(3));
    expect(r.score).toBe(24);
    expect(r.tier.key).toBe("documented");
    expect(r.findings).toHaveLength(0);
    expect(r.complete).toBe(true);
  });

  it("all 0s = 0, Undocumented, a finding for every question", () => {
    const r = scoreAudit(answerAll(0));
    expect(r.score).toBe(0);
    expect(r.tier.key).toBe("undocumented");
    expect(r.findings).toHaveLength(8);
  });

  it("all 2s = 16, Person-dependent, no findings (trigger is <=1)", () => {
    const r = scoreAudit(answerAll(2));
    expect(r.score).toBe(16);
    expect(r.tier.key).toBe("person_dependent");
    expect(r.findings).toHaveLength(0);
  });
});

describe("blind-spot triggers", () => {
  it("each question fires at value 1 and below, not at 2", () => {
    for (const q of QUESTIONS) {
      // trigger is 1 for all current questions; assert against the data, not a constant
      const at = q.finding.triggerAtOrBelow;
      const fires = scoreAudit({ [q.id]: at });
      expect(fires.findings.some((f) => f.questionId === q.id)).toBe(true);

      const above = (at + 1) as OptionValue;
      if (above <= 3) {
        const clears = scoreAudit({ [q.id]: above });
        expect(clears.findings.some((f) => f.questionId === q.id)).toBe(false);
      }
    }
  });

  it("q7 single-point-of-failure finding carries no rule (management gap)", () => {
    const r = scoreAudit({ q7: 1 });
    const f = r.findings.find((x) => x.questionId === "q7");
    expect(f).toBeDefined();
    expect(f!.rules).toBeNull();
  });

  it("q5 lateral finding maps to Rule 1.10", () => {
    const r = scoreAudit({ q5: 0 });
    const f = r.findings.find((x) => x.questionId === "q5");
    expect(f!.rules).toContain("1.10");
  });
});

describe("finding ordering", () => {
  it("cheapest fix first, structural (null effort) last", () => {
    const r = scoreAudit(answerAll(0));
    const efforts = r.findings.map((f) => f.effortMinutes ?? Number.POSITIVE_INFINITY);
    const sorted = [...efforts].sort((a, b) => a - b);
    expect(efforts).toEqual(sorted);
    // the three structural findings (q3, q5, q7) sink to the end
    const tail = r.findings.slice(-3).map((f) => f.questionId).sort();
    expect(tail).toEqual(["q3", "q5", "q7"]);
  });
});

describe("completeness", () => {
  it("is false until all eight are answered", () => {
    const partial: AuditAnswers = { q1: 3, q2: 3, q3: 3 };
    expect(scoreAudit(partial).complete).toBe(false);
  });

  it("ignores unanswered questions in the running total", () => {
    const r = scoreAudit({ q1: 3, q2: 3 });
    expect(r.score).toBe(6);
    expect(r.complete).toBe(false);
  });
});

describe("rulesFromFindings", () => {
  it("returns a sorted distinct set", () => {
    const r = scoreAudit(answerAll(0));
    const rules = rulesFromFindings(r.findings);
    expect(rules).toEqual([...new Set(rules)].sort());
    expect(rules).toContain("1.9");
    expect(rules).toContain("1.18");
  });
});
