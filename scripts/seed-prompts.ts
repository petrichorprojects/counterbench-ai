import fs from "node:fs";
import path from "node:path";

type PromptDef = {
  slug: string;
  title: string;
  description: string;
  use_case: string;
  inputs: string[];
  steps: string[];
  output_format: string;
  tags: string[];
  prompt: string;
};

const ROOT = process.cwd();
const CONTENT_ROOT = process.env.CB_CONTENT_ROOT?.trim() ? process.env.CB_CONTENT_ROOT.trim() : "content";
const OUT_DIR = path.join(ROOT, CONTENT_ROOT, "prompts");

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

function exists(filePath: string) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function yamlList(items: string[]): string {
  if (!items.length) return "[]";
  return `\n${items.map((s) => `  - ${JSON.stringify(s)}`).join("\n")}`;
}

function toMdx(def: PromptDef, lastUpdatedIso: string): string {
  const fm = [
    "---",
    `title: ${JSON.stringify(def.title)}`,
    `description: ${JSON.stringify(def.description)}`,
    `use_case: ${JSON.stringify(def.use_case)}`,
    `inputs:${yamlList(def.inputs)}`,
    `steps:${yamlList(def.steps)}`,
    `output_format: ${JSON.stringify(def.output_format)}`,
    `tags:${yamlList(def.tags)}`,
    `last_updated: ${JSON.stringify(lastUpdatedIso)}`,
    "---",
    "",
    "## When to use",
    def.description,
    "",
    "## Inputs",
    def.inputs.length
      ? def.inputs.map((i) => `- \`{{${i}}}\``).join("\n")
      : "- (None.)",
    "",
    "## Prompt",
    "```text",
    def.prompt.trim(),
    "```",
    "",
    "## Output format",
    def.output_format || "Use concise bullets.",
    "",
    "## Quality checks",
    "- If anything is missing, ask clarifying questions before drafting.",
    "- Tie claims back to the provided text. Quote clause numbers/snippets where applicable.",
    "- Mark assumptions explicitly. Never invent facts.",
    "",
    "## Confidentiality",
    "Do not paste privileged, confidential, or regulated data into third-party tools unless your policy permits it.",
    ""
  ].join("\n");

  return `${fm}\n`;
}

function parseArgs(argv: string[]) {
  const flags = new Set(argv.filter((a) => a.startsWith("--")));
  return { overwrite: flags.has("--overwrite") };
}

const TODAY_ISO = new Date().toISOString().slice(0, 10);

const PROMPTS: PromptDef[] = [
  {
    slug: "intake-summary",
    title: "Intake Summary (One-Page)",
    description: "Turn messy notes into a clean internal matter summary with risks, deadlines, and next steps.",
    use_case: "Intake / Triage",
    inputs: ["intake_notes", "jurisdiction", "client_role", "deadline_constraints"],
    steps: ["Paste intake notes", "Specify jurisdiction and client role", "Confirm any deadlines", "Generate a one-page summary"],
    output_format: "Sections: Matter overview; Key facts; Parties; Issues; Deadlines; Risks; Questions; Next steps (7-day plan).",
    tags: ["intake", "triage", "general"],
    prompt: `
You are a legal operations assistant. You produce organized drafting and workflow outputs (not legal advice).

Context:
- Jurisdiction: {{jurisdiction}}
- Client role: {{client_role}}
- Deadlines/constraints: {{deadline_constraints}}

Intake notes:
{{intake_notes}}

Task:
1) Create a one-page internal matter summary for a legal team.
2) List missing information as targeted follow-up questions.
3) Identify workflow risks (privilege, privacy, conflicts, retention, deadlines) as "Risk notes" without giving legal advice.

Style:
- Crisp headings, short bullets, no fluff.
- Do not invent facts. If uncertain, say "Unknown" and ask a question.
`.trim()
  },

  // Intake + comms
  {
    slug: "client-followup-questions",
    title: "Client Follow-up Questions",
    description: "Generate a focused list of follow-up questions to de-risk an intake before work begins.",
    use_case: "Intake / Triage",
    inputs: ["intake_notes", "jurisdiction", "work_type"],
    steps: ["Paste notes", "Pick work type", "Generate a question list grouped by theme"],
    output_format: "Grouped bullets under: Facts; Documents; Deadlines; Stakeholders; Systems/data; Approvals; Desired outcome.",
    tags: ["intake", "questions", "general"],
    prompt: `
You are assisting with legal intake. Do not provide legal advice.

Work type: {{work_type}}
Jurisdiction: {{jurisdiction}}

Notes:
{{intake_notes}}

Generate 15-25 follow-up questions that a paralegal or attorney should ask next.
Group questions by theme, prioritize the 5 most critical, and keep wording client-friendly.
`.trim()
  },
  {
    slug: "intake-client-email-draft",
    title: "Client Email Draft (Intake Acknowledgement)",
    description: "Draft a client-friendly intake acknowledgement email that requests documents and sets expectations.",
    use_case: "Intake / Client Comms",
    inputs: ["client_name", "matter_summary", "requested_documents", "next_steps", "tone"],
    steps: ["Provide summary", "List requested docs", "Set expectations", "Draft email"],
    output_format: "Email with subject line + short paragraphs + bulleted doc list + next step CTA.",
    tags: ["intake", "email", "general"],
    prompt: `
Draft an intake acknowledgement email. This is not legal advice.

Client: {{client_name}}
Tone: {{tone}}

Matter summary (internal):
{{matter_summary}}

Requested documents:
{{requested_documents}}

Next steps:
{{next_steps}}

Requirements:
- Clear, concise, professional.
- Ask for documents and confirm preferred deadline.
- Include a confidentiality reminder (do not email sensitive items unless secure channel is used).
`.trim()
  },

  // Contracts
  {
    slug: "contract-redline-summary",
    title: "Contract Redline Summary",
    description: "Summarize a redline and flag the most material changes with suggested responses.",
    use_case: "Contracts / Review",
    inputs: ["contract_section_or_redline", "party_position", "jurisdiction", "risk_tolerance"],
    steps: ["Paste text", "State party position and tolerance", "Generate a change-by-change summary"],
    output_format: "Table: Change | Risk level | Why it matters | Suggested response | Fallback language.",
    tags: ["contracts", "review", "negotiation"],
    prompt: `
You are a contract review assistant for a legal team. Not legal advice.

Party position (customer/vendor): {{party_position}}
Jurisdiction: {{jurisdiction}}
Risk tolerance (low/med/high): {{risk_tolerance}}

Redline or clause text:
{{contract_section_or_redline}}

Produce:
1) A table summarizing each material change.
2) A short "Top 5 concerns" list in priority order.
3) Fallback language (plain English + clause-style) for the top 3 concerns.
`.trim()
  },
  {
    slug: "contract-clause-risk-matrix",
    title: "Contract Clause Risk Matrix",
    description: "Extract key clauses and produce a quick risk matrix with negotiation notes.",
    use_case: "Contracts / Review",
    inputs: ["contract_text", "party_position", "jurisdiction"],
    steps: ["Paste contract excerpt", "Choose customer/vendor", "Generate matrix"],
    output_format: "Matrix with rows: Liability, Indemnity, Termination, Confidentiality, IP, Security, Privacy, Audit, Subprocessors.",
    tags: ["contracts", "review"],
    prompt: `
You are a contract review assistant (not legal advice).

Party position: {{party_position}}
Jurisdiction: {{jurisdiction}}

Contract text:
{{contract_text}}

Task:
- Identify whether each key clause exists.
- Summarize what it says (quote short snippets where possible).
- Assign a risk level (Low/Med/High) and a negotiation note.
`.trim()
  },
  {
    slug: "negotiation-fallback-positions",
    title: "Negotiation Fallback Positions",
    description: "Generate a negotiation plan: ideal, target, and fallback positions for key clauses.",
    use_case: "Contracts / Negotiation",
    inputs: ["counterparty_type", "deal_context", "must_haves", "nice_to_haves", "jurisdiction"],
    steps: ["Describe deal", "List must-haves", "Generate fallback positions"],
    output_format: "Table: Clause topic | Ideal | Target | Fallback | Trade-offs | Rationale.",
    tags: ["contracts", "negotiation"],
    prompt: `
You support contract negotiation planning (not legal advice).

Counterparty type: {{counterparty_type}}
Jurisdiction: {{jurisdiction}}
Deal context:
{{deal_context}}

Must-haves:
{{must_haves}}

Nice-to-haves:
{{nice_to_haves}}

Create an "ideal/target/fallback" plan for the top 8-12 clause topics relevant to this deal.
`.trim()
  },
  {
    slug: "nda-summary-and-redflags",
    title: "NDA Summary + Red Flags",
    description: "Summarize an NDA and flag unusual terms (term length, residuals, exclusions, remedies).",
    use_case: "Contracts / Review",
    inputs: ["nda_text", "disclosing_or_receiving", "jurisdiction"],
    steps: ["Paste NDA", "Pick role", "Get summary + red flags"],
    output_format: "Sections: Summary; Unusual terms; Questions; Suggested edits.",
    tags: ["contracts", "nda", "review"],
    prompt: `
You are reviewing an NDA (not legal advice).

Role (disclosing/receiving): {{disclosing_or_receiving}}
Jurisdiction: {{jurisdiction}}

NDA text:
{{nda_text}}

Provide:
1) Plain-English summary.
2) Red flags and "unusual" terms.
3) Suggested edits (short clause rewrites).
`.trim()
  },

  // Privacy + compliance
  {
    slug: "dpa-review-checklist",
    title: "DPA Review Checklist",
    description: "Generate a checklist for reviewing a Data Processing Addendum with gaps and questions.",
    use_case: "Privacy / Compliance",
    inputs: ["dpa_text", "controller_or_processor", "jurisdictions", "data_types"],
    steps: ["Paste DPA", "Set role and jurisdictions", "Generate checklist"],
    output_format: "Checklist grouped by: roles, subprocessors, SCCs, security, breach notice, audits, retention/deletion, data subject requests.",
    tags: ["privacy", "compliance", "contracts"],
    prompt: `
You are assisting with DPA review (not legal advice).

Role (controller/processor): {{controller_or_processor}}
Jurisdictions: {{jurisdictions}}
Data types (e.g., HR, customer, health): {{data_types}}

DPA text:
{{dpa_text}}

Task:
- Produce a review checklist.
- Identify gaps and missing sections.
- Draft 10 targeted questions to send to the vendor.
`.trim()
  },
  {
    slug: "privacy-policy-gap-check",
    title: "Privacy Policy Gap Check",
    description: "Compare a privacy policy draft to a given product data flow and list missing disclosures.",
    use_case: "Privacy / Compliance",
    inputs: ["product_data_flow", "privacy_policy_draft", "jurisdictions"],
    steps: ["Describe data flow", "Paste policy draft", "List missing disclosures"],
    output_format: "Table: Data flow item | Required disclosure | Present? | Suggested addition (plain English).",
    tags: ["privacy", "compliance", "drafting"],
    prompt: `
You help review a privacy policy draft (not legal advice).

Jurisdictions: {{jurisdictions}}

Product data flow (what we collect, why, who we share with):
{{product_data_flow}}

Policy draft:
{{privacy_policy_draft}}

Identify missing or unclear disclosures and propose concise additions.
Mark anything that requires counsel review.
`.trim()
  },
  {
    slug: "vendor-security-questionnaire-draft",
    title: "Vendor Security Questionnaire Draft",
    description: "Draft a vendor security questionnaire tailored to the data type and risk tolerance.",
    use_case: "Security / Vendor Review",
    inputs: ["vendor_type", "data_types", "risk_tolerance", "required_standards"],
    steps: ["Specify vendor and data types", "Set tolerance", "Generate questionnaire"],
    output_format: "Sections with numbered questions + required evidence items (policies, reports, certifications).",
    tags: ["security", "compliance", "vendor"],
    prompt: `
Draft a vendor security questionnaire (not legal advice).

Vendor type: {{vendor_type}}
Data types: {{data_types}}
Risk tolerance: {{risk_tolerance}}
Required standards (if any): {{required_standards}}

Output:
- 25-40 questions grouped by domain (access control, encryption, logging, SDLC, incident response, subcontractors).
- For each domain, list evidence artifacts to request.
`.trim()
  },

  // Litigation
  {
    slug: "litigation-case-theory-outline",
    title: "Case Theory Outline",
    description: "Turn facts into a structured case theory outline with issues, elements, and evidence buckets.",
    use_case: "Litigation",
    inputs: ["facts", "claims_or_issues", "jurisdiction", "key_evidence"],
    steps: ["Paste facts", "List issues", "Outline theory"],
    output_format: "Outline: issues; elements; supporting facts; missing evidence; risks/weaknesses; next discovery steps.",
    tags: ["litigation", "intake", "strategy"],
    prompt: `
You assist with organizing litigation analysis (not legal advice).

Jurisdiction: {{jurisdiction}}
Claims/issues:
{{claims_or_issues}}

Key facts:
{{facts}}

Key evidence available:
{{key_evidence}}

Create a case theory outline with evidence buckets and missing items to request.
`.trim()
  },
  {
    slug: "deposition-outline-builder",
    title: "Deposition Outline Builder",
    description: "Generate a deposition outline with themes, exhibits, and sequencing.",
    use_case: "Litigation / Discovery",
    inputs: ["witness_role", "case_facts", "goals", "exhibits_list"],
    steps: ["Describe witness role", "Paste facts", "Generate outline"],
    output_format: "Sections with question stems; exhibit tie-ins; admissions sought; follow-ups.",
    tags: ["litigation", "discovery", "deposition"],
    prompt: `
You draft deposition outlines (not legal advice).

Witness role: {{witness_role}}
Goals (admissions/knowledge you need):
{{goals}}

Case facts:
{{case_facts}}

Exhibits (if any):
{{exhibits_list}}

Produce a practical deposition outline with sequencing and question stems.
`.trim()
  },
  {
    slug: "discovery-requests-draft",
    title: "Discovery Requests Draft (RFPs / Interrogatories)",
    description: "Draft discovery requests tailored to a fact pattern and issues list.",
    use_case: "Litigation / Discovery",
    inputs: ["issues_list", "facts", "party_role", "jurisdiction_rules"],
    steps: ["Paste issues and facts", "Generate requests", "Add definitions/instructions"],
    output_format: "Definitions; Instructions; Interrogatories; RFPs; Requests for admission (optional).",
    tags: ["litigation", "discovery", "drafting"],
    prompt: `
You draft discovery request language for review by counsel (not legal advice).

Party role (plaintiff/defendant): {{party_role}}
Jurisdiction / rules constraints:
{{jurisdiction_rules}}

Issues list:
{{issues_list}}

Facts:
{{facts}}

Draft:
- Definitions and instructions (generic).
- 10-15 interrogatories and 15-25 RFPs aligned to issues.
Keep requests specific and avoid overbreadth where possible.
`.trim()
  },

  // Research
  {
    slug: "legal-research-plan",
    title: "Legal Research Plan",
    description: "Generate a research plan with queries, sources, and an outline for a short memo.",
    use_case: "Legal Research",
    inputs: ["research_question", "jurisdiction", "constraints", "facts"],
    steps: ["State the question", "Provide jurisdiction and constraints", "Generate plan + memo outline"],
    output_format: "Plan: key issues; search queries; source list; memo outline; unknowns; next steps.",
    tags: ["research", "memo", "citations"],
    prompt: `
You create a legal research plan (not legal advice).

Jurisdiction: {{jurisdiction}}
Research question:
{{research_question}}

Facts (relevant, high level):
{{facts}}

Constraints (time, available databases):
{{constraints}}

Output a research plan + a memo outline. Include suggested search queries and how you'd validate authority.
`.trim()
  },
  {
    slug: "citation-checklist",
    title: "Citation & Quote Check Checklist",
    description: "Produce a cite-check checklist for a draft brief/memo to reduce hallucinations and misquotes.",
    use_case: "Legal Research / QA",
    inputs: ["draft_text", "citation_style"],
    steps: ["Paste draft excerpt", "Choose citation style", "Generate checklist"],
    output_format: "Checklist: each citation -> claim supported? quote accurate? pin cite? jurisdiction? date? negative treatment?",
    tags: ["research", "qa", "citations"],
    prompt: `
You are doing quality control on a legal draft (not legal advice).

Citation style: {{citation_style}}

Draft excerpt (with citations if present):
{{draft_text}}

Create a cite-check checklist and flag statements that likely need authority or verification.
Do not invent citations.
`.trim()
  }
];

// Expand: add more prompts by composition to reach a useful baseline.
const EXTRA: Array<Omit<PromptDef, "prompt"> & { promptSeed: string }> = [
  {
    slug: "contract-definition-extractor",
    title: "Contract Definition Extractor",
    description: "Extract defined terms and build a quick glossary for reviewers.",
    use_case: "Contracts / Review",
    inputs: ["contract_text"],
    steps: ["Paste text", "Extract definitions", "Output glossary"],
    output_format: "Table: Defined term | Definition | Where defined | Notes.",
    tags: ["contracts", "review"],
    promptSeed: "Extract all defined terms and their definitions from the text. Quote the exact definition and cite the section heading/number if present."
  },
  {
    slug: "lease-abstract",
    title: "Lease Abstract (Key Terms)",
    description: "Create a lease abstract with key commercial terms and critical clauses.",
    use_case: "Real Estate",
    inputs: ["lease_text", "jurisdiction"],
    steps: ["Paste lease text", "Extract key terms", "Flag risky clauses"],
    output_format: "Abstract table + red flags list + questions for landlord/tenant.",
    tags: ["real_estate", "review"],
    promptSeed: "Produce a lease abstract and flag non-standard or risky clauses. Ask clarifying questions where needed."
  },
  {
    slug: "employment-policy-draft",
    title: "Employment Policy Draft (Template)",
    description: "Draft a short internal policy section in a consistent tone (for counsel review).",
    use_case: "Employment",
    inputs: ["policy_topic", "jurisdiction", "company_context", "tone"],
    steps: ["Choose topic", "Provide context", "Draft policy"],
    output_format: "Policy section with headings + definitions + responsibilities + exceptions.",
    tags: ["employment", "drafting"],
    promptSeed: "Draft a concise policy section. Use plain language. Include responsibilities, exceptions, and escalation paths. Do not provide legal advice."
  },
  {
    slug: "ip-claim-chart-starter",
    title: "IP Claim Chart Starter",
    description: "Create a starter claim chart structure from a patent claim (for internal analysis).",
    use_case: "IP / Patents",
    inputs: ["claim_text", "accused_product_description"],
    steps: ["Paste claim", "Describe product", "Generate chart scaffold"],
    output_format: "Table: Claim limitation | Evidence (TBD) | Notes | Questions.",
    tags: ["ip", "research"],
    promptSeed: "Break the claim into limitations and propose a claim chart scaffold. Do not make definitive infringement conclusions."
  },
  {
    slug: "privilege-log-skeleton",
    title: "Privilege Log Skeleton",
    description: "Generate a privilege log skeleton and guidance fields for doc review teams.",
    use_case: "Litigation / Discovery",
    inputs: ["jurisdiction", "matter_context"],
    steps: ["Provide jurisdiction", "Generate fields + QC rules"],
    output_format: "Columns + instructions + QC checklist.",
    tags: ["litigation", "discovery"],
    promptSeed: "Provide a privilege log column set and QC rules. Include guidance on consistent descriptions and avoiding waiver."
  },
  {
    slug: "incident-response-initial-brief",
    title: "Incident Response Initial Brief (Draft)",
    description: "Turn incident notes into an initial internal brief and action checklist.",
    use_case: "Privacy / Security",
    inputs: ["incident_notes", "systems_affected", "jurisdictions"],
    steps: ["Paste incident notes", "Summarize", "Checklist actions"],
    output_format: "Sections: What happened; Systems; Data; Timeline; Actions; Open questions; Communications plan (draft).",
    tags: ["privacy", "security", "compliance"],
    promptSeed: "Draft an initial internal incident brief and a checklist of immediate actions. Avoid legal advice; focus on operational steps and questions."
  },

  // More prompts to populate the library quickly (v1)
  {
    slug: "contract-business-summary",
    title: "Contract Summary for Business Stakeholders",
    description: "Rewrite contract terms into a short, non-legal summary for internal stakeholders.",
    use_case: "Contracts / Comms",
    inputs: ["contract_text", "audience_role", "deal_context"],
    steps: ["Paste contract excerpt", "Specify audience", "Generate a plain-English summary + action items"],
    output_format: "Sections: What this means; Key obligations; Key risks; Decisions needed; Next steps.",
    tags: ["contracts", "summary", "comms"],
    promptSeed: "Rewrite the contract excerpt into a business-friendly summary. Keep it accurate. Flag items requiring counsel review."
  },
  {
    slug: "msa-sow-consistency-check",
    title: "MSA vs SOW Consistency Check",
    description: "Identify conflicts between an MSA and a SOW (order of precedence, scope, pricing, SLAs).",
    use_case: "Contracts / Review",
    inputs: ["msa_text", "sow_text", "order_of_precedence_clause"],
    steps: ["Paste MSA + SOW", "Include precedence clause if available", "List conflicts and proposed fixes"],
    output_format: "Table: Topic | MSA | SOW | Conflict? | Recommended resolution.",
    tags: ["contracts", "review"],
    promptSeed: "Compare the two documents and identify inconsistencies. Quote relevant snippets. Propose fixes aligned to the stated order of precedence."
  },
  {
    slug: "liability-cap-analysis",
    title: "Limitation of Liability Analysis",
    description: "Extract liability caps/exclusions and explain exposure in plain terms.",
    use_case: "Contracts / Review",
    inputs: ["liability_clause_text", "party_position", "deal_value"],
    steps: ["Paste clause", "Provide deal value", "Explain exposure + red flags"],
    output_format: "Bullets + a table: scenario | capped? | cap amount | notes.",
    tags: ["contracts", "review", "risk"],
    promptSeed: "Explain what is capped vs excluded, how the cap is calculated, and what scenarios could create uncapped exposure. Focus on interpreting the text; do not provide legal advice."
  },
  {
    slug: "termination-and-renewal-summary",
    title: "Termination + Renewal Summary",
    description: "Summarize termination rights, notice periods, and renewal mechanics with action items.",
    use_case: "Contracts / Review",
    inputs: ["termination_clause_text", "renewal_clause_text"],
    steps: ["Paste clauses", "Summarize triggers and dates", "List action items"],
    output_format: "Table: Trigger | Notice | Effect | Fees | Action owner.",
    tags: ["contracts", "review"],
    promptSeed: "Summarize termination and renewal mechanics, identify key dates/notice windows, and list operational action items."
  },
  {
    slug: "assignment-change-of-control",
    title: "Assignment + Change of Control Review",
    description: "Extract assignment/change-of-control restrictions and recommend internal actions.",
    use_case: "Contracts / Review",
    inputs: ["assignment_clause_text", "client_context"],
    steps: ["Paste clause", "Provide context", "Summarize restrictions"],
    output_format: "Bullets: allowed assignments, consent requirements, risks, suggested follow-ups.",
    tags: ["contracts", "review"],
    promptSeed: "Summarize the assignment/change-of-control restrictions and list what approvals/notifications could be needed in common scenarios."
  },
  {
    slug: "security-exhibit-summary",
    title: "Security Exhibit Summary",
    description: "Summarize a security exhibit (controls, commitments, audit rights) and flag gaps.",
    use_case: "Security / Contracts",
    inputs: ["security_exhibit_text", "required_controls"],
    steps: ["Paste exhibit", "List required controls", "Flag missing items"],
    output_format: "Table: Control | Present? | Evidence needed | Notes.",
    tags: ["security", "contracts", "review"],
    promptSeed: "Summarize commitments and map to required controls. Flag missing commitments and unclear wording."
  },
  {
    slug: "gdpr-ropa-starter",
    title: "GDPR ROPA Starter (Processing Inventory)",
    description: "Generate a starter Record of Processing Activities entry from a product/workflow description.",
    use_case: "Privacy / Compliance",
    inputs: ["processing_description", "data_categories", "purpose", "processors", "retention"],
    steps: ["Describe processing", "List categories and processors", "Generate a ROPA-style entry"],
    output_format: "ROPA fields: activity, purposes, categories, recipients, transfers, retention, security measures (high level).",
    tags: ["privacy", "compliance", "gdpr"],
    promptSeed: "Create a structured ROPA-style entry. Highlight unknowns and request missing details."
  },
  {
    slug: "cookie-banner-audit",
    title: "Cookie Banner + Consent Flow Audit",
    description: "Audit a consent/cookie banner against a described tracking setup and list fixes.",
    use_case: "Privacy / Compliance",
    inputs: ["tracking_tools", "banner_behavior", "jurisdictions"],
    steps: ["Describe tracking tools", "Describe banner behavior", "List gaps + fixes"],
    output_format: "Table: Requirement | Current behavior | Risk | Recommended change.",
    tags: ["privacy", "compliance"],
    promptSeed: "Identify likely gaps (granularity, opt-in vs opt-out, default settings, recordkeeping) and propose concrete UI/behavior changes."
  },
  {
    slug: "data-retention-policy-draft",
    title: "Data Retention Policy Draft (Starter)",
    description: "Draft a starter data retention policy section from a system list and retention needs.",
    use_case: "Privacy / Compliance",
    inputs: ["systems_list", "data_types", "retention_requirements", "deletion_process"],
    steps: ["List systems", "List retention requirements", "Draft policy"],
    output_format: "Policy with scope, roles, retention schedule (high level), deletion workflow, exceptions, audit.",
    tags: ["privacy", "compliance", "policy"],
    promptSeed: "Draft a clear internal policy section. Keep it operational. Flag items requiring counsel input."
  },
  {
    slug: "dsar-playbook",
    title: "DSAR Response Playbook (Starter)",
    description: "Generate an operational playbook for handling DSARs from intake to fulfillment.",
    use_case: "Privacy / Operations",
    inputs: ["jurisdictions", "systems_list", "verification_steps"],
    steps: ["Provide jurisdictions", "List systems", "Generate workflow"],
    output_format: "Workflow steps + roles + checklist + template comms snippets.",
    tags: ["privacy", "operations", "compliance"],
    promptSeed: "Create a DSAR handling workflow: intake, identity verification, scoping, collection, review/redaction, response, logging."
  },
  {
    slug: "ediscovery-collection-plan",
    title: "eDiscovery Collection Plan",
    description: "Draft a collection plan with custodians, sources, scope limits, and chain-of-custody notes.",
    use_case: "eDiscovery",
    inputs: ["matter_context", "custodians", "data_sources", "date_range"],
    steps: ["Describe matter", "List custodians and sources", "Generate plan"],
    output_format: "Plan: scope, sources, custodian table, collection steps, logging fields, open questions.",
    tags: ["ediscovery", "litigation"],
    promptSeed: "Draft an eDiscovery collection plan. Keep it operational and defensible; do not provide legal advice."
  },
  {
    slug: "keyword-search-protocol",
    title: "Keyword Search Protocol (Starter)",
    description: "Generate a keyword search protocol with query strings, iterations, and validation steps.",
    use_case: "eDiscovery",
    inputs: ["case_themes", "key_terms", "custodian_context"],
    steps: ["List themes and terms", "Generate queries", "Add validation steps"],
    output_format: "Protocol: seed terms, queries, exclusions, iteration plan, sampling/validation checklist.",
    tags: ["ediscovery", "search"],
    promptSeed: "Draft a keyword search protocol with an iteration plan and validation checklist. Include cautions about over/under-inclusiveness."
  },
  {
    slug: "doc-review-coding-guide",
    title: "Doc Review Coding Guide (Starter)",
    description: "Create a coding guide for responsiveness/issues/privilege and QC rules.",
    use_case: "eDiscovery / Review",
    inputs: ["issues_list", "privilege_rules", "production_specs"],
    steps: ["Provide issues list", "Provide privilege rules/specs", "Generate guide"],
    output_format: "Coding definitions + examples + escalation rules + QC checklist.",
    tags: ["ediscovery", "review"],
    promptSeed: "Create a doc review coding guide with clear definitions and escalation paths. Include QC checks and common edge cases."
  },
  {
    slug: "litigation-chronology-builder",
    title: "Litigation Chronology Builder",
    description: "Turn a document set summary into a dated chronology with evidence references.",
    use_case: "Litigation",
    inputs: ["events_and_sources", "time_zone"],
    steps: ["Paste events/sources", "Normalize dates", "Generate chronology + gaps"],
    output_format: "Table: Date/time | Event | Source | Reliability | Follow-ups.",
    tags: ["litigation", "timeline"],
    promptSeed: "Build a chronology. For each event, cite the source snippet/name and mark confidence. Call out missing gaps."
  },
  {
    slug: "motion-outline-starter",
    title: "Motion Outline Starter",
    description: "Generate a motion/brief outline with headings tailored to issues and record facts.",
    use_case: "Litigation / Drafting",
    inputs: ["motion_type", "issues", "facts_record"],
    steps: ["State motion type", "Paste issues and record facts", "Generate outline"],
    output_format: "Outline with headings + bullet arguments + record cites placeholders.",
    tags: ["litigation", "drafting"],
    promptSeed: "Draft a persuasive outline (not the full brief) with argument headings and where evidence/citations should go. Do not invent citations."
  },
  {
    slug: "witness-prep-question-bank",
    title: "Witness Prep Question Bank",
    description: "Generate witness prep questions grouped by themes and key documents.",
    use_case: "Litigation",
    inputs: ["witness_role", "themes", "key_documents"],
    steps: ["Provide role and themes", "List key documents", "Generate questions"],
    output_format: "Themes -> questions -> doc tie-ins -> risks.",
    tags: ["litigation", "prep"],
    promptSeed: "Create a witness prep question bank and identify likely cross-examination angles to prepare for."
  },
  {
    slug: "board-consent-draft-starter",
    title: "Board Consent Draft (Starter)",
    description: "Draft a short board consent template for a described corporate action (for counsel review).",
    use_case: "Corporate / Ops",
    inputs: ["corporate_action", "company_name", "date", "signers"],
    steps: ["Describe action", "Provide company/date/signers", "Generate consent draft"],
    output_format: "Consent format: recitals + resolutions + signature blocks.",
    tags: ["corporate", "drafting"],
    promptSeed: "Draft a board consent template. Keep placeholders for details that require confirmation."
  },
  {
    slug: "due-diligence-checklist",
    title: "Due Diligence Checklist (Starter)",
    description: "Generate a due diligence checklist tailored to deal type and target profile.",
    use_case: "Corporate / M&A",
    inputs: ["deal_type", "target_profile", "risk_areas"],
    steps: ["Provide deal type and profile", "List risk areas", "Generate checklist"],
    output_format: "Checklist by area: corporate, contracts, IP, privacy, employment, litigation, finance, regulatory.",
    tags: ["corporate", "diligence"],
    promptSeed: "Generate a diligence checklist with document requests and red flag callouts."
  },
  {
    slug: "plain-english-rewrite",
    title: "Plain-English Rewrite",
    description: "Rewrite a legal paragraph for clarity while preserving meaning and adding a short summary.",
    use_case: "General / Drafting",
    inputs: ["text", "audience", "constraints"],
    steps: ["Paste text", "Specify audience", "Rewrite + summarize"],
    output_format: "1) One-sentence summary 2) Rewritten version 3) List of ambiguous terms/questions.",
    tags: ["drafting", "clarity", "general"],
    promptSeed: "Rewrite for clarity without changing meaning. Do not add new obligations. Flag ambiguity instead of guessing."
  },
  {
    slug: "issue-spotting-checklist",
    title: "Issue Spotting Checklist",
    description: "Generate an issue-spotting checklist for a workflow/matter type to reduce misses.",
    use_case: "General / QA",
    inputs: ["matter_type", "jurisdiction", "context"],
    steps: ["Pick matter type", "Provide context", "Generate checklist"],
    output_format: "Checklist grouped by: facts, documents, deadlines, stakeholders, privacy/security, privilege, approvals.",
    tags: ["qa", "general"],
    promptSeed: "Create a practical issue-spotting checklist and a short set of 'stop the line' questions."
  }
];

function buildExtraPrompt(x: (typeof EXTRA)[number]): PromptDef {
  const prompt = `
You are a legal operations assistant. Provide drafting and workflow support (not legal advice).

Context:
${x.inputs.map((i) => `- ${i}: {{${i}}}`).join("\n")}

Task:
${x.promptSeed}

Rules:
- Do not invent facts; cite the provided text where possible.
- If the input is incomplete, ask 5-10 clarifying questions.
`.trim();

  return { ...x, prompt };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  ensureDir(OUT_DIR);

  const defs: PromptDef[] = [...PROMPTS, ...EXTRA.map(buildExtraPrompt)];

  let written = 0;
  let skipped = 0;
  for (const def of defs) {
    const filePath = path.join(OUT_DIR, `${def.slug}.mdx`);
    if (!args.overwrite && exists(filePath)) {
      skipped++;
      continue;
    }
    fs.writeFileSync(filePath, toMdx(def, TODAY_ISO), "utf8");
    written++;
  }

  console.log(
    JSON.stringify(
      {
        content_root: CONTENT_ROOT,
        out_dir: OUT_DIR,
        prompts_total: defs.length,
        written,
        skipped,
        overwrite: args.overwrite
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
