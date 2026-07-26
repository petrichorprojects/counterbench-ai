/**
 * Conflict Check Blind Spot Audit — data + scoring.
 *
 * Pure data and pure functions only. No React, no DOM, no side effects, so the
 * whole module is unit-testable and can be imported by the server component to
 * render every question, answer, tier and finding into the initial HTML (AEO
 * requirement: crawlers and LLMs must see the full content without running the
 * form).
 *
 * The tool audits a firm's conflict-checking *process*. It never evaluates a
 * specific conflict and never tells a firm whether it may take a matter. Rule
 * citations reference the ABA Model Rules of Professional Conduct and must be
 * verified against current text; state rules vary. See LAST_VERIFIED.
 */

export const LAST_VERIFIED = "2026-07-24";

export type OptionValue = 0 | 1 | 2 | 3;

export interface AuditOption {
  /** Points toward the 0–24 total. Higher = more institutionalised. */
  value: OptionValue;
  label: string;
}

export interface AuditQuestion {
  id: string;
  /** Short label for compact UI + analytics. */
  key: string;
  question: string;
  /** The documented failure mode this question tests. */
  failureMode: string;
  /** ABA Model Rule(s) this maps to, or null where it is a management gap. */
  rules: string[] | null;
  options: AuditOption[];
  /**
   * Blind-spot finding shown when the chosen answer scores at or below
   * `triggerAtOrBelow`. `scenario` names the concrete failure; `fix` is the
   * ranked remediation. `effortMinutes` orders fixes cheapest-first.
   */
  finding: {
    triggerAtOrBelow: OptionValue;
    scenario: string;
    fix: string;
    effortMinutes: number | null; // null = structural, not a quick fix
  };
}

export const QUESTIONS: AuditQuestion[] = [
  {
    id: "q1",
    key: "timing",
    question: "At what point in intake is a conflict check actually run?",
    failureMode: "Conflict discovered after work has already begun",
    rules: ["1.7"],
    options: [
      { value: 0, label: "It varies, or only when someone remembers" },
      { value: 1, label: "At the engagement letter" },
      { value: 2, label: "After the intake call, before any work" },
      { value: 3, label: "Before the first substantive intake conversation" },
    ],
    finding: {
      triggerAtOrBelow: 1,
      scenario:
        "A conflict surfaces after you have taken confidences or started work, which is the most expensive point to find it — you may have to withdraw and you have already learned things you cannot un-learn.",
      fix: "Move the check to a hard gate before the first substantive intake conversation. No matter opens without it.",
      effortMinutes: 30,
    },
  },
  {
    id: "q2",
    key: "parties",
    question: "Which parties get searched in a check?",
    failureMode: "Corporate families and related entities missed",
    rules: ["1.7", "1.13"],
    options: [
      { value: 0, label: "The named client only" },
      { value: 1, label: "Client plus the obvious adverse party" },
      { value: 2, label: "Client, adverse parties, and related entities / corporate families" },
      { value: 3, label: "All of the above plus witnesses, experts, and co-counsel" },
    ],
    finding: {
      triggerAtOrBelow: 1,
      scenario:
        "You clear the named party but miss the parent, subsidiary, or affiliate you are already adverse to. The organization is the client under Rule 1.13, and the conflict is real even though the names do not match.",
      fix: "Add related entities and corporate families to the standard search scope. Capture them on the intake form so the search has something to run against.",
      effortMinutes: 60,
    },
  },
  {
    id: "q3",
    key: "former_clients",
    question: "Are closed and former-client matters searched?",
    failureMode: "Duties to former clients under-checked",
    rules: ["1.9"],
    options: [
      { value: 0, label: "No, only open matters" },
      { value: 1, label: "Only if someone remembers the prior representation" },
      { value: 2, label: "Yes, going back a fixed number of years" },
      { value: 3, label: "Yes, the full closed-matter history" },
    ],
    finding: {
      triggerAtOrBelow: 1,
      scenario:
        "You take a matter adverse to a former client in a substantially related matter without catching it. Rule 1.9 duties survive the end of the representation; institutional memory does not.",
      fix: "Include closed matters in every search. If the system cannot reach them, that is the gap to close before the next intake.",
      effortMinutes: null,
    },
  },
  {
    id: "q4",
    key: "prospective_clients",
    question: "Are non-engaged consultations recorded and searched?",
    failureMode: "Prospective-client confidences ignored",
    rules: ["1.18"],
    options: [
      { value: 0, label: "No, we only record clients we sign" },
      { value: 1, label: "Sometimes, informally" },
      { value: 2, label: "Yes, most consults are logged" },
      { value: 3, label: "Yes, every consult is logged and searchable" },
    ],
    finding: {
      triggerAtOrBelow: 1,
      scenario:
        "Someone who consulted you and shared confidences, then never engaged, is invisible to your check. Rule 1.18 can still disqualify you from the other side of that matter.",
      fix: "Log every consultation — name, adverse parties, general subject — even the ones that never become clients. It is the only record that catches this.",
      effortMinutes: 30,
    },
  },
  {
    id: "q5",
    key: "lateral_hires",
    question: "When someone joins, is their prior client list run against your book?",
    failureMode: "Imputed disqualification from a lateral's history",
    rules: ["1.10"],
    options: [
      { value: 0, label: "No" },
      { value: 1, label: "Informally, if it comes up" },
      { value: 2, label: "Yes, for attorneys" },
      { value: 3, label: "Yes, systematically, for every hire including staff" },
    ],
    finding: {
      triggerAtOrBelow: 1,
      scenario:
        "A new attorney or paralegal carries a conflict from a prior firm and it is imputed to yours under Rule 1.10. You find out when the other side moves to disqualify — after the person has already touched the file.",
      fix: "Run every incoming hire's prior client list against your open and closed matters before their first day, and set up a screen where one is needed. Paralegals and assistants count.",
      effortMinutes: null,
    },
  },
  {
    id: "q6",
    key: "system_of_record",
    question: "Where do conflict-check results live?",
    failureMode: "No durable system of record",
    rules: null,
    options: [
      { value: 0, label: "Nowhere durable — it is done and forgotten" },
      { value: 1, label: "Email or a paper file" },
      { value: 2, label: "A spreadsheet" },
      { value: 3, label: "Conflict-check or practice-management software" },
    ],
    finding: {
      triggerAtOrBelow: 1,
      scenario:
        "You cannot show, months later, that a check was run or what it returned. When a conflict is alleged, the absence of a record is treated as the absence of a check.",
      fix: "Keep a dated, searchable record of every check and its result — who ran it, what was searched, what it returned. A shared spreadsheet is a real improvement over email; software is better.",
      effortMinutes: 60,
    },
  },
  {
    id: "q7",
    key: "ownership",
    question: "Who can run a complete conflict check today, without help?",
    failureMode: "Single point of failure",
    rules: null,
    options: [
      { value: 0, label: "It is unclear / no one is sure" },
      { value: 1, label: "Exactly one person" },
      { value: 2, label: "Two or more people" },
      { value: 3, label: "Any trained staff member, against a written procedure" },
    ],
    finding: {
      triggerAtOrBelow: 1,
      scenario:
        "Your conflict process lives in one person's head. When they are out, on leave, or gone, the firm is either running unchecked intakes or stalled. This is the same institutional-knowledge risk that shows up everywhere else in a small firm — here it has an ethics rule attached.",
      fix: "Write the procedure down so a second trained person can run a complete check against it. The written version is the asset; the person is the risk.",
      effortMinutes: null,
    },
  },
  {
    id: "q8",
    key: "waivers",
    question: "Are conflict waivers and ethical walls tracked with scope and expiry?",
    failureMode: "Waiver conditions lost or exceeded",
    rules: ["1.7(b)"],
    options: [
      { value: 0, label: "Not tracked" },
      { value: 1, label: "Verbally, or 'we'd remember'" },
      { value: 2, label: "In the matter file" },
      { value: 3, label: "Tracked in a system with scope and expiry" },
    ],
    finding: {
      triggerAtOrBelow: 1,
      scenario:
        "A waiver's scope is exceeded, or a screen quietly lapses, because no one is tracking its terms. Rule 1.7(b) requires informed consent confirmed in writing — an untracked waiver is hard to prove and easy to outgrow.",
      fix: "Record every waiver and screen with its scope and any expiry, in writing, where the next person can find it. A verbal 'we'd remember' is not a defensible record.",
      effortMinutes: 45,
    },
  },
];

export const MAX_SCORE = QUESTIONS.length * 3; // 24

export interface Tier {
  key: "documented" | "person_dependent" | "reactive" | "undocumented";
  label: string;
  min: number;
  max: number;
  meaning: string;
}

export const TIERS: Tier[] = [
  {
    key: "documented",
    label: "Documented",
    min: 19,
    max: 24,
    meaning:
      "Your conflict process survives the departure of any one person. Keep it current as the firm grows.",
  },
  {
    key: "person_dependent",
    label: "Person-dependent",
    min: 12,
    max: 18,
    meaning:
      "It works today, but it leans on specific people and specific memory. Turnover or a volume spike is where it breaks.",
  },
  {
    key: "reactive",
    label: "Reactive",
    min: 6,
    max: 11,
    meaning:
      "You catch the obvious conflict and miss the imputed one. The gaps are in former clients, related entities, and laterals — exactly where disqualification motions come from.",
  },
  {
    key: "undocumented",
    label: "Undocumented",
    min: 0,
    max: 5,
    meaning:
      "The process is running on memory. The next conflict is a question of when, not whether, and you will find out the expensive way.",
  },
];

export interface AuditAnswers {
  [questionId: string]: OptionValue;
}

export interface AuditFinding {
  questionId: string;
  key: string;
  failureMode: string;
  rules: string[] | null;
  scenario: string;
  fix: string;
  effortMinutes: number | null;
}

export interface AuditResult {
  score: number;
  maxScore: number;
  tier: Tier;
  /** Findings for every answer at or below its trigger, cheapest-fix first. */
  findings: AuditFinding[];
  /** True when all eight questions are answered. */
  complete: boolean;
}

// Undocumented is the floor tier; used as a defensive clamp for scores that
// somehow fall outside 0–24 (impossible with the fixed 0–3 option set).
const FLOOR_TIER: Tier = TIERS[TIERS.length - 1]!;

export function tierForScore(score: number): Tier {
  const t = TIERS.find((x) => score >= x.min && score <= x.max);
  return t ?? FLOOR_TIER;
}

export function scoreAudit(answers: AuditAnswers): AuditResult {
  let score = 0;
  const findings: AuditFinding[] = [];

  for (const q of QUESTIONS) {
    const a = answers[q.id];
    if (a === undefined) continue;
    score += a;
    if (a <= q.finding.triggerAtOrBelow) {
      findings.push({
        questionId: q.id,
        key: q.key,
        failureMode: q.failureMode,
        rules: q.rules,
        scenario: q.finding.scenario,
        fix: q.finding.fix,
        effortMinutes: q.finding.effortMinutes,
      });
    }
  }

  // Cheapest, most-actionable fixes first; structural (null) fixes last.
  findings.sort((a, b) => {
    const ea = a.effortMinutes ?? Number.POSITIVE_INFINITY;
    const eb = b.effortMinutes ?? Number.POSITIVE_INFINITY;
    return ea - eb;
  });

  const complete = QUESTIONS.every((q) => answers[q.id] !== undefined);

  return { score, maxScore: MAX_SCORE, tier: tierForScore(score), findings, complete };
}

/** Distinct set of rules referenced by the current findings, for the summary. */
export function rulesFromFindings(findings: AuditFinding[]): string[] {
  const set = new Set<string>();
  for (const f of findings) (f.rules ?? []).forEach((r) => set.add(r));
  return Array.from(set).sort();
}

/** FAQ used both on-page and in FAQPage JSON-LD. */
export const AUDIT_FAQ: { q: string; a: string }[] = [
  {
    q: "What is a law firm conflict check?",
    a: "A conflict check is the process a law firm runs before taking on a matter to confirm that representing the new client would not conflict with duties owed to a current client, a former client, or a prospective client. It searches the parties involved against the firm's current and past matters. This audit measures how reliably your firm's process actually catches those conflicts.",
  },
  {
    q: "Is this legal advice?",
    a: "No. This tool audits your firm's conflict-checking process. It does not evaluate any specific conflict and does not tell you whether you may take a particular matter. Rule citations reference the ABA Model Rules of Professional Conduct; your state's rules govern and may differ.",
  },
  {
    q: "Do you store my answers?",
    a: "The audit runs in your browser and we do not tie results to you. If you choose to share your firm size, state, and practice area at the end, those three fields are stored anonymously so we can build conflict-checking benchmarks for firms like yours. You are never asked for your name, your firm's name, or an email to see your result.",
  },
  {
    q: "How long does it take?",
    a: "Under three minutes. Eight multiple-choice questions, no signup.",
  },
];
