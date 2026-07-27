export interface TrainingModule {
  number: number;
  skill: string;
  exercise: string;
  concept: string;
  starterPrompt: string;
  improvedPrompt: string;
  exampleOutput: string;
  locked: boolean;
}

export const MODULES: TrainingModule[] = [
  {
    number: 1,
    skill: "Role Assignment",
    exercise: "Draft a deposition prep memo — with and without role",
    locked: false,
    concept:
      "Claude's output quality changes dramatically based on the role you assign it before the task. A generic prompt gets a generic answer. Assigning a specific expert identity — with years of experience, a specialty, and context — is the single highest-ROI change you can make to any prompt. This is especially true in legal work, where precision and professional judgment are the entire point.",
    starterPrompt: `Summarize the key points to prepare for deposing Dr. Smith, a treating physician in a car accident case.`,
    improvedPrompt: `You are a senior litigation paralegal with 15 years of experience preparing deposition outlines for plaintiff-side personal injury trials in [State]. Draft a deposition preparation memo for deposing Dr. [Smith], the plaintiff's treating orthopedic surgeon. The plaintiff suffered a herniated disc at L4-L5 in a rear-end collision.

Include these five sections:
1. Background & credentials questions
2. Medical records review questions
3. Causation questions
4. Treatment and prognosis questions
5. Potential impeachment opportunities

Be specific. Each section should have 5–8 concrete questions.`,
    exampleOutput: `DEPOSITION PREPARATION MEMO
Re: Dr. [Smith] | Matter: [Client Name] v. [Defendant]

**1. Background & Credentials**
- How long have you practiced orthopedic surgery?
- What percentage of your practice involves spine injuries?
- How many herniated disc cases have you treated resulting from trauma?
- Are you familiar with the biomechanical literature on rear-end collision forces?
- Have you testified as a treating physician before? How many times?

**2. Medical Records Review**
- Walk me through the plaintiff's initial presentation on [date].
- What were the chief complaints documented at first visit?
- What imaging did you order and what did it show?
- Were there any pre-existing conditions noted in the records?
- When did you first diagnose the L4-L5 herniation?

[...continues with sections 3–5]`,
  },
  {
    number: 2,
    skill: "Constraint Setting",
    exercise: "Write a demand letter with explicit redlines",
    locked: false,
    concept:
      "Constraints tell Claude what NOT to do. In legal work this is critical — you cannot have AI speculating, using passive voice on liability questions, or omitting required elements. Most prompts describe what they want; power users also describe what they don't want. Think of constraints as your guardrails. Write them before the task, not after you've already gotten a bad draft.",
    starterPrompt: `Write a demand letter for a slip and fall case. The plaintiff fell at a grocery store and broke their wrist. Medical bills are $22,000.`,
    improvedPrompt: `Write a demand letter for a slip and fall personal injury case. Follow these rules exactly:

Constraints:
- Do NOT admit any comparative negligence or make statements that could be used against the plaintiff
- Do NOT speculate about future medical costs — reference only documented bills
- Use active voice throughout — no passive constructions on liability
- Do NOT reveal the settlement demand amount until the final paragraph
- Keep total length under 400 words
- Do not use em-dashes

Facts:
- Plaintiff: Maria Chen, 52
- Incident: Fell on wet floor at MetroMart, 3825 Commerce Blvd, March 15, 2026 at 2:14 PM
- No wet floor sign was present. Store employee was seen mopping the aisle 8 minutes prior.
- Injuries: Fractured right wrist (distal radius) requiring ORIF surgery
- Documented medical costs: $22,400 (itemized attached)
- Lost wages: $4,800 (documented)`,
    exampleOutput: `[Date]

Via Certified Mail
Claims Department
MetroMart Insurance Services
[Address]

Re: Personal Injury Claim — Maria Chen / Incident of March 15, 2026

Dear Claims Adjuster:

This firm represents Maria Chen in connection with injuries she sustained at your insured's premises on March 15, 2026. We write to demand compensation for the damages described below.

**The Incident**

At approximately 2:14 PM, Ms. Chen slipped on a wet floor in aisle 7 of MetroMart at 3825 Commerce Blvd. No wet floor warning sign was present. Surveillance footage shows a store employee mopping that aisle eight minutes before the fall. The store created the hazard and failed to warn customers of its existence.

**Injuries and Treatment**

Ms. Chen suffered a displaced distal radius fracture of her right (dominant) wrist. She underwent open reduction and internal fixation surgery on March 17, 2026. She completed 14 weeks of occupational therapy. Her orthopedic surgeon has documented permanent reduced grip strength.

**Documented Damages**

- Medical expenses: $22,400
- Lost wages (8 weeks): $4,800
- Total documented: $27,200

**Demand**

To resolve this matter without litigation, we demand $85,000. Please respond within 30 days.

[Attorney signature block]`,
  },
  {
    number: 3,
    skill: "Iteration Loops",
    exercise: "Improve a discovery objection through 3 rounds",
    locked: false,
    concept:
      "The first draft is never the final draft. Most people re-prompt randomly — they change everything at once and don't know what improved. Iteration loops are structured: one specific improvement per round, name exactly what to change, build toward a quality bar. Three focused rounds beats ten random ones. This is how you train AI to your standards rather than accepting its defaults.",
    starterPrompt: `Write a discovery objection to this interrogatory: "Describe in detail all communications you have had with any employees of the defendant company in the 12 months prior to the incident."`,
    improvedPrompt: `[Start with the starter prompt above, then run these rounds in sequence:]

Round 1 — after you get the first draft, send:
"The objection is too generic. Make it specific to the overbreadth of 'all communications.' Add a privilege carve-out for attorney-client and work product protected communications."

Round 2 — after the improved draft, send:
"Add a proportionality argument under Rule 26(b)(1). Reference the burden of identifying and reviewing 12 months of all communication types across an entire organization."

Round 3 — after that draft, send:
"Tighten the language. Remove any redundancy. The final objection should be under 120 words and read as something a senior partner would sign off on."`,
    exampleOutput: `**After Round 3:**

OBJECTION: Defendant objects to Interrogatory No. [X] as overbroad, unduly burdensome, and not proportional to the needs of the case pursuant to Fed. R. Civ. P. 26(b)(1). The request encompasses all communications — regardless of medium, subject matter, or relevance — with any of Defendant's employees over a 12-month period. Identifying, collecting, and reviewing such communications across Defendant's organization would impose costs grossly disproportionate to any probative value. Defendant further objects to the extent the interrogatory seeks information protected by the attorney-client privilege or work product doctrine. Subject to and without waiving these objections, Defendant will respond to a narrowed version of this request limited to communications directly related to [the incident/subject matter at issue].`,
  },
  {
    number: 4,
    skill: "Context Preservation",
    exercise: "Set up a Project for a mock client matter",
    locked: true,
    concept: "",
    starterPrompt: "",
    improvedPrompt: "",
    exampleOutput: "",
  },
  {
    number: 5,
    skill: "Persona Training",
    exercise: "Match a partner's writing style from 3 sample briefs",
    locked: true,
    concept: "",
    starterPrompt: "",
    improvedPrompt: "",
    exampleOutput: "",
  },
  {
    number: 6,
    skill: "Output Formatting",
    exercise: "Generate a case timeline as table, bullets, then exec summary",
    locked: true,
    concept: "",
    starterPrompt: "",
    improvedPrompt: "",
    exampleOutput: "",
  },
  {
    number: 7,
    skill: "Chain of Thought",
    exercise: "Analyze a contract clause with forced step-by-step risk analysis",
    locked: true,
    concept: "",
    starterPrompt: "",
    improvedPrompt: "",
    exampleOutput: "",
  },
  {
    number: 8,
    skill: "Projects and Memory",
    exercise: "Build a matter context file and persist across sessions",
    locked: true,
    concept: "",
    starterPrompt: "",
    improvedPrompt: "",
    exampleOutput: "",
  },
  {
    number: 9,
    skill: "Skill Files",
    exercise: "Deploy a pre-built Contract Review Checklist skill",
    locked: true,
    concept: "",
    starterPrompt: "",
    improvedPrompt: "",
    exampleOutput: "",
  },
  {
    number: 10,
    skill: "Failure Analysis",
    exercise: "Debug a bad prompt — ask Claude what went wrong",
    locked: true,
    concept: "",
    starterPrompt: "",
    improvedPrompt: "",
    exampleOutput: "",
  },
];
