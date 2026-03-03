import fs from "node:fs";
import path from "node:path";
import { slugify } from "../lib/slug";

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

type PromptSpec = Omit<PromptDef, "slug" | "prompt"> & {
  cat_slug: string;
  role: string;
  context_inputs: string[];
  task: string;
  deliverable: string;
  guardrails?: string[];
};

const ROOT = process.cwd();
const CONTENT_ROOT = process.env.CB_CONTENT_ROOT?.trim() ? process.env.CB_CONTENT_ROOT.trim() : "content";
const OUT_DIR = path.join(ROOT, CONTENT_ROOT, "prompts");
const TODAY_ISO = new Date().toISOString().slice(0, 10);

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

function toMdx(def: PromptDef): string {
  const fm = [
    "---",
    `title: ${JSON.stringify(def.title)}`,
    `description: ${JSON.stringify(def.description)}`,
    `use_case: ${JSON.stringify(def.use_case)}`,
    `inputs:${yamlList(def.inputs)}`,
    `steps:${yamlList(def.steps)}`,
    `output_format: ${JSON.stringify(def.output_format)}`,
    `tags:${yamlList(def.tags)}`,
    `last_updated: ${JSON.stringify(TODAY_ISO)}`,
    "---",
    "",
    "## When to use",
    def.description,
    "",
    "## Inputs",
    def.inputs.length ? def.inputs.map((i) => `- \`{{${i}}}\``).join("\n") : "- (None.)",
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
    "- Do not invent facts. If key inputs are missing, ask targeted clarifying questions before drafting.",
    "- When reviewing a document, quote the exact clause text you rely on.",
    "- Mark assumptions explicitly and separate: facts vs. analysis vs. recommendations.",
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

function mkSlug(cat: string, title: string): string {
  return `inhouse-${cat}-${slugify(title)}`;
}

function promptWrapper(params: {
  role: string;
  context_inputs: string[];
  task: string;
  deliverable: string;
  guardrails?: string[];
}): string {
  const guard = (params.guardrails ?? []).filter(Boolean);
  return [
    `You are ${params.role}.`,
    "",
    "Context / inputs:",
    ...params.context_inputs.map((i) => `- ${i}`),
    "",
    "Task:",
    params.task.trim(),
    "",
    "Deliverable:",
    params.deliverable.trim(),
    "",
    "Guardrails:",
    "- If you are unsure, ask targeted clarifying questions.",
    "- Use plain English. Avoid legal jargon when a business reader would misunderstand it.",
    "- Do not give legal advice. Provide drafting and risk-spotting support only.",
    ...guard.map((g) => `- ${g}`)
  ].join("\n");
}

function mk(spec: PromptSpec): PromptDef {
  const slug = mkSlug(spec.cat_slug, spec.title);
  return {
    slug,
    title: spec.title,
    description: spec.description,
    use_case: spec.use_case,
    inputs: spec.inputs,
    steps: spec.steps,
    output_format: spec.output_format,
    tags: spec.tags,
    prompt: promptWrapper({
      role: spec.role,
      context_inputs: spec.context_inputs,
      task: spec.task,
      deliverable: spec.deliverable,
      guardrails: spec.guardrails
    })
  };
}

const SPECS: PromptSpec[] = [
  // 1) Commercial Contracts
  {
    cat_slug: "commercial-contracts",
    title: "Contract Risk Scan (Indemnity, Liability, Termination, Exclusivity)",
    description: "Quickly spot contract risk in the clauses that usually matter most, and explain it in business terms.",
    use_case: "Commercial Contracts",
    inputs: ["contract_text_or_clause", "our_role", "deal_context", "jurisdiction_if_known"],
    steps: ["Paste the contract or clause text", "State your role and deal context", "Review risks by topic", "Capture edits + questions"],
    output_format:
      "Sections: Snapshot; Indemnity risks; Liability cap gaps; Termination/renewal traps; Exclusivity/channel risk; Questions; Suggested edits (with clause text).",
    tags: ["contracts", "commercial", "risk", "indemnity", "liability", "termination", "exclusivity"],
    role: "an experienced commercial contracts reviewer for a SaaS company",
    context_inputs: [
      `Our role: {{our_role}} (e.g., "vendor" or "customer")`,
      `Jurisdiction (if known): {{jurisdiction_if_known}}`,
      `Deal context: {{deal_context}}`,
      "Text to review:",
      "{{contract_text_or_clause}}"
    ],
    task:
      "Review the text and flag risks related to indemnity, limitation of liability, termination/renewal, and exclusivity. For each risk, explain why it matters operationally (money, security, uptime, customer commitments).",
    deliverable: "A short, business-friendly risk memo plus suggested edits. Quote the exact clause snippets you are reacting to."
  },
  {
    cat_slug: "commercial-contracts",
    title: "Balanced Indemnity Clause Rewrite",
    description: "Propose a more balanced indemnity clause that limits exposure and excludes the other party’s negligence.",
    use_case: "Commercial Contracts",
    inputs: ["current_indemnity_clause", "our_role", "product_description", "risk_tolerance"],
    steps: ["Paste the indemnity clause", "Specify role and product", "Choose risk tolerance", "Generate a rewrite + rationale"],
    output_format: "1) Issues with current clause; 2) Proposed rewrite; 3) Negotiation notes; 4) Fallback version.",
    tags: ["contracts", "indemnity", "drafting", "negotiation", "saas"],
    role: "an experienced contracts lawyer drafting SaaS terms",
    context_inputs: [
      `Our role: {{our_role}}`,
      `Product: {{product_description}}`,
      `Risk tolerance: {{risk_tolerance}} (low/medium/high)`,
      "Current indemnity clause:",
      "{{current_indemnity_clause}}"
    ],
    task:
      "Rewrite the indemnity clause to be more balanced. Limit scope to third-party claims, exclude indemnity for the other party’s negligence, and add reasonable defense/control language where appropriate.",
    deliverable:
      "Provide replacement clause text, explain changes in plain English, and give 2 fallback positions for negotiation."
  },
  {
    cat_slug: "commercial-contracts",
    title: "Limitation of Liability Clause (12-Month Fees Cap)",
    description: "Draft a SaaS limitation of liability clause capping liability at 12 months of fees and excluding indirect damages.",
    use_case: "Commercial Contracts",
    inputs: ["fees_paid_last_12_months_definition", "exceptions_to_cap", "our_role"],
    steps: ["Specify fee definition", "Pick exceptions", "Generate clause + rationale"],
    output_format: "Clause text + bullets: what it caps, what it excludes, and negotiation notes.",
    tags: ["contracts", "liability", "drafting", "saas"],
    role: "a commercial contracts drafter for a SaaS vendor",
    context_inputs: [
      `Our role: {{our_role}}`,
      `Fees definition: {{fees_paid_last_12_months_definition}}`,
      `Exceptions (if any): {{exceptions_to_cap}} (e.g., 'IP infringement, willful misconduct')`
    ],
    task:
      "Draft a limitation of liability clause that caps total liability at 12 months of fees paid (as defined above) and excludes indirect, incidental, special, consequential, and punitive damages.",
    deliverable: "Provide the clause text, then a short explanation of how it works and what to watch for in carve-outs."
  },
  {
    cat_slug: "commercial-contracts",
    title: "NDA Redline Checklist (Mutual, No Reverse Engineering, Trade Secrets)",
    description: "Redline an NDA for mutual protection, reverse engineering limits, and durable trade secret treatment.",
    use_case: "Commercial Contracts",
    inputs: ["nda_text", "our_role", "deal_purpose"],
    steps: ["Paste NDA", "Clarify purpose and sensitivity", "Generate a redline checklist + edits"],
    output_format: "Checklist + proposed edits (by clause) + open questions.",
    tags: ["contracts", "nda", "confidentiality", "trade-secrets", "reverse-engineering"],
    role: "an in-house counsel reviewing NDAs for a tech company",
    context_inputs: [`Our role: {{our_role}}`, `Purpose: {{deal_purpose}}`, "NDA text:", "{{nda_text}}"],
    task:
      "Review the NDA for mutual protection and practical enforceability. Ensure confidentiality obligations are mutual, include a no-reverse-engineering restriction, and address trade secrets with an appropriate duration and handling rules.",
    deliverable: "Return a checklist and proposed replacement language for the clauses that need edits.",
    guardrails: ["Avoid jurisdiction-specific claims unless jurisdiction is provided."]
  },
  {
    cat_slug: "commercial-contracts",
    title: "No Assignment Without Consent Clause",
    description: "Draft an assignment clause requiring written consent and voiding unauthorized transfers.",
    use_case: "Commercial Contracts",
    inputs: ["carveouts", "change_of_control_handling", "notice_period"],
    steps: ["Pick carveouts", "Decide change-of-control treatment", "Generate clause"],
    output_format: "Clause text + negotiation notes + fallback option.",
    tags: ["contracts", "assignment", "boilerplate", "drafting"],
    role: "a contracts drafter",
    context_inputs: [
      `Carveouts (if any): {{carveouts}}`,
      `Change of control: {{change_of_control_handling}}`,
      `Notice period (if any): {{notice_period}}`
    ],
    task:
      "Draft an assignment clause that prohibits assignment without prior written consent and states that unauthorized transfers are void. Include a clear approach for change of control.",
    deliverable: "Provide the clause plus a short rationale and one fallback version."
  },
  {
    cat_slug: "commercial-contracts",
    title: "Vendor Agreement Review Checklist (Long-Term Risk)",
    description: "Generate a practical checklist for reviewing vendor agreements for long-term operational risk.",
    use_case: "Commercial Contracts",
    inputs: ["vendor_type", "data_sensitivity", "integration_scope"],
    steps: ["Describe the vendor and integration", "Generate checklist", "Add internal owners and follow-ups"],
    output_format: "Checklist grouped by: security/privacy, uptime/support, pricing/renewal, liability/indemnity, IP, exit/portability, compliance, notices.",
    tags: ["contracts", "vendor", "checklist", "risk", "operations"],
    role: "a legal operations-focused contracts reviewer",
    context_inputs: [`Vendor type: {{vendor_type}}`, `Data sensitivity: {{data_sensitivity}}`, `Integration scope: {{integration_scope}}`],
    task:
      "Create a checklist to review a vendor agreement with a bias toward preventing long-term operational surprises: auto-renewals, data portability, audit rights, SLA gaps, hidden fees, unilateral changes, and termination traps.",
    deliverable: "Return a checklist that a PM or procurement lead can use without legal training."
  },
  {
    cat_slug: "commercial-contracts",
    title: "Negotiation Fallbacks (Unlimited Data Breach Liability Request)",
    description: "Create fallback positions when a customer asks for unlimited breach liability in a SaaS contract.",
    use_case: "Commercial Contracts",
    inputs: ["customer_request", "our_security_posture", "current_liability_model"],
    steps: ["Paste customer request", "Describe current model", "Generate fallbacks + clause language"],
    output_format: "Table: Customer ask -> Response -> Proposed language -> Why it’s fair -> Acceptability (green/yellow/red).",
    tags: ["contracts", "negotiation", "liability", "data-breach", "saas"],
    role: "an in-house SaaS contracts negotiator",
    context_inputs: [
      `Customer request: {{customer_request}}`,
      `Our security posture summary: {{our_security_posture}}`,
      `Current liability model: {{current_liability_model}}`
    ],
    task:
      "Generate fallback positions to move away from unlimited liability while still addressing legitimate customer risk concerns.",
    deliverable: "Provide 5 fallback options, each with suggested clause language and a short negotiation rationale."
  },
  {
    cat_slug: "commercial-contracts",
    title: "SOW Plain-English Summary for Project Manager",
    description: "Summarize a Statement of Work into what a PM needs: scope, deliverables, deadlines, and dependencies.",
    use_case: "Commercial Contracts",
    inputs: ["sow_text"],
    steps: ["Paste SOW text", "Extract scope + milestones", "List risks + action items"],
    output_format: "Sections: Scope; Deliverables; Timeline; Assumptions; Dependencies; Out-of-scope; Change control; Risks; PM action list.",
    tags: ["contracts", "sow", "summary", "pm"],
    role: "a legal-adjacent project coordinator",
    context_inputs: ["SOW text:", "{{sow_text}}"],
    task:
      "Create a short, plain-English PM summary of the SOW. Focus on what must happen, by when, who owns it, and what could cause slippage or change orders.",
    deliverable: "A PM-ready one-pager plus a list of questions to resolve ambiguities."
  },
  {
    cat_slug: "commercial-contracts",
    title: "Draft a Contract Template (Pick Document Type)",
    description: "Generate a starter template for a common agreement type with practical headings and placeholders.",
    use_case: "Commercial Contracts",
    inputs: ["document_type", "our_role", "jurisdiction_if_known", "business_terms"],
    steps: ["Choose document type", "Provide core business terms", "Generate a clean template"],
    output_format: "A structured template with headings, defined terms, and placeholders. No invented facts.",
    tags: ["contracts", "templates", "drafting"],
    role: "a contracts drafter",
    context_inputs: [
      `Document type: {{document_type}} (e.g., NDA, SaaS agreement, MSA, SOW, order form, website terms, privacy policy)`,
      `Our role: {{our_role}}`,
      `Jurisdiction (if known): {{jurisdiction_if_known}}`,
      `Business terms: {{business_terms}}`
    ],
    task:
      "Draft a starter template for the selected document type. Use sensible headings and placeholders. Keep language neutral and practical.",
    deliverable: "Output the full template text, plus a short checklist of what to customize before using it."
  },
  {
    cat_slug: "commercial-contracts",
    title: "Reseller Agreement Scan (Channel Conflict, Exclusivity)",
    description: "Spot reseller terms that create exclusivity, channel conflict, or partner lock-in.",
    use_case: "Commercial Contracts",
    inputs: ["reseller_agreement_text", "our_channel_strategy"],
    steps: ["Paste agreement", "Describe channel strategy", "Flag exclusivity + conflict terms"],
    output_format: "Findings grouped by: exclusivity, territory, pricing controls, marketing restrictions, customer ownership, termination, non-compete.",
    tags: ["contracts", "reseller", "channels", "exclusivity", "risk"],
    role: "a commercial counsel reviewing reseller terms",
    context_inputs: [`Channel strategy context: {{our_channel_strategy}}`, "Agreement text:", "{{reseller_agreement_text}}"],
    task:
      "Identify terms that create exclusivity, channel conflict, or limit our ability to sell directly or through other partners. Flag hidden lock-in mechanisms.",
    deliverable: "A risk memo + suggested edits to reduce exclusivity and preserve sales flexibility."
  },
  {
    cat_slug: "commercial-contracts",
    title: "Advanced Contract Review (Structured 5-Step)",
    description: "Run a structured contract review workflow that produces a summary, clause analysis, risk matrix, and suggested edits.",
    use_case: "Commercial Contracts",
    inputs: ["contract_text", "our_role", "jurisdiction_if_known", "playbook_or_redlines_if_any"],
    steps: ["Paste contract", "Set role + jurisdiction", "Run 5-step analysis", "Review risk matrix and edits"],
    output_format: "Executive summary; Key obligations; Clause-by-clause notes; Risk matrix; Proposed edits; Open questions.",
    tags: ["contracts", "review", "risk-matrix", "redlines", "advanced"],
    role: "an experienced contracts reviewer",
    context_inputs: [
      `Our role: {{our_role}}`,
      `Jurisdiction (if known): {{jurisdiction_if_known}}`,
      "Contract text:",
      "{{contract_text}}",
      "Internal playbook or preferred redlines (optional):",
      "{{playbook_or_redlines_if_any}}"
    ],
    task:
      "Follow a structured workflow: 1) executive summary 2) governing law/venue/DR 3) clause review across key topics 4) risk matrix 5) propose edits for top issues.",
    deliverable:
      "A scannable review memo with quoted clause snippets, a risk matrix (H/M/L), and precise replacement language for the top issues.",
    guardrails: ["Do not claim legal requirements without jurisdiction.", "If critical facts are missing, ask questions before drafting edits."]
  },

  // 2) Data Privacy & Security
  {
    cat_slug: "privacy-security",
    title: "CCPA/CPRA Request Handling Checklist (Access, Delete, Opt-Out)",
    description: "Create a practical checklist for responding to CPRA/CCPA access, deletion, and opt-out requests.",
    use_case: "Data Privacy & Security",
    inputs: ["company_profile", "systems_list", "request_type"],
    steps: ["Describe your company and systems", "Choose request type", "Generate checklist + owner map"],
    output_format: "Checklist with owners, timelines, and evidence artifacts. Include customer-support scripts.",
    tags: ["privacy", "cpra", "ccpa", "dsar", "operations"],
    role: "a privacy operations lead",
    context_inputs: [
      `Company profile: {{company_profile}}`,
      `Systems list: {{systems_list}} (CRM, product DB, analytics, support desk, etc.)`,
      `Request type: {{request_type}} (access/deletion/opt-out)`
    ],
    task:
      "Create an operational checklist for handling the request end-to-end: intake, identity verification, data mapping, fulfillment, exception handling, and response delivery.",
    deliverable: "A step-by-step checklist with roles/owners, plus the exact artifacts to save for auditability."
  },
  {
    cat_slug: "privacy-security",
    title: "GDPR Controller vs Processor (SaaS Examples)",
    description: "Explain controller vs processor under GDPR using SaaS-relevant examples and a simple decision test.",
    use_case: "Data Privacy & Security",
    inputs: ["product_description", "data_flows_summary"],
    steps: ["Describe your product + data flows", "Generate explanation + examples"],
    output_format: "Plain-English explanation + 3 examples + a decision checklist.",
    tags: ["privacy", "gdpr", "saas", "education"],
    role: "a privacy educator for a SaaS company",
    context_inputs: [`Product: {{product_description}}`, `Data flows: {{data_flows_summary}}`],
    task: "Explain what it means to be a controller vs. processor, using the product and data flows above.",
    deliverable: "A short explainer with examples, a decision checklist, and common mistakes to avoid."
  },
  {
    cat_slug: "privacy-security",
    title: "Employee FAQ: When Consent Is Required to Collect Personal Data",
    description: "Draft a plain-language employee FAQ on when consent is required and what to do if unsure.",
    use_case: "Data Privacy & Security",
    inputs: ["jurisdictions", "data_types", "internal_contacts"],
    steps: ["List jurisdictions and data types", "Generate FAQ", "Add escalation path"],
    output_format: "FAQ (10-15 Q/A) + escalation instructions.",
    tags: ["privacy", "internal-comms", "consent"],
    role: "an internal policy writer",
    context_inputs: [`Jurisdictions: {{jurisdictions}}`, `Data types we collect: {{data_types}}`, `Who to contact: {{internal_contacts}}`],
    task: "Write an employee-facing FAQ that explains when consent might be required and how to escalate questions safely.",
    deliverable: "A clear FAQ with do/don’t examples for marketing, product, HR, and customer support."
  },
  {
    cat_slug: "privacy-security",
    title: "Data Breach: First 48 Hours Checklist",
    description: "Generate an action plan for the first 48 hours after a suspected breach involving customer data.",
    use_case: "Data Privacy & Security",
    inputs: ["incident_summary", "systems_impacted", "jurisdictions", "stakeholders"],
    steps: ["Summarize incident", "List systems + jurisdictions", "Generate timeline + owners"],
    output_format: "Timeline (0-4h, 4-12h, 12-24h, 24-48h) with owners + evidence checklist.",
    tags: ["security", "incident-response", "privacy", "ops"],
    role: "an incident response coordinator working with legal and security",
    context_inputs: [
      `Incident summary: {{incident_summary}}`,
      `Systems impacted: {{systems_impacted}}`,
      `Jurisdictions: {{jurisdictions}}`,
      `Stakeholders: {{stakeholders}}`
    ],
    task: "Create a first-48-hours plan that prioritizes containment, evidence preservation, and decision inputs for notifications.",
    deliverable: "A timeline plan + a list of questions legal/security must answer before external notifications."
  },
  {
    cat_slug: "privacy-security",
    title: "AI Tool Use Memo (Protect Personal + Confidential Data)",
    description: "Draft internal rules for using AI tools while protecting personal, confidential, and privileged data.",
    use_case: "Data Privacy & Security",
    inputs: ["allowed_tools", "prohibited_data", "approved_workflows"],
    steps: ["List allowed tools", "Define prohibited inputs", "Draft policy memo + examples"],
    output_format: "1-page memo + examples of allowed vs prohibited use.",
    tags: ["ai-policy", "privacy", "security", "internal-comms"],
    role: "a legal/privacy policy drafter for an internal AI usage policy",
    context_inputs: [`Allowed tools: {{allowed_tools}}`, `Prohibited data: {{prohibited_data}}`, `Approved workflows: {{approved_workflows}}`],
    task: "Draft an internal memo that sets clear rules for AI tool usage: what is allowed, what is prohibited, and how to sanitize inputs.",
    deliverable: "A memo that is easy to enforce and includes concrete examples for common teams."
  },
  {
    cat_slug: "privacy-security",
    title: "Cookie Notice (US, CPRA-Aligned)",
    description: "Draft a cookie notice section that explains categories, purposes, and opt-out mechanisms for a US audience.",
    use_case: "Data Privacy & Security",
    inputs: ["cookie_categories", "tracking_tools", "opt_out_mechanism"],
    steps: ["List cookie categories/tools", "Generate notice text", "Add opt-out instructions"],
    output_format: "Policy section with headings + plain-language summary.",
    tags: ["privacy", "cookies", "cpra", "policy-draft"],
    role: "a privacy policy writer",
    context_inputs: [`Cookie categories: {{cookie_categories}}`, `Tracking tools/vendors: {{tracking_tools}}`, `Opt-out mechanism: {{opt_out_mechanism}}`],
    task: "Draft a cookie notice section that explains what cookies/trackers are used for, how users can control them, and what choices are available.",
    deliverable: "A cookie notice section suitable for a website policy page, plus a short summary for a banner."
  },
  {
    cat_slug: "privacy-security",
    title: "Support FAQ: GDPR Data Subject Requests",
    description: "Generate FAQs and scripts for customer support responding to GDPR data subject requests.",
    use_case: "Data Privacy & Security",
    inputs: ["support_channels", "identity_verification_method", "request_timeline"],
    steps: ["Describe support workflow", "Generate FAQs + scripts"],
    output_format: "FAQ + short scripts for email/chat + escalation rules.",
    tags: ["privacy", "gdpr", "dsar", "support"],
    role: "a privacy ops specialist writing support-facing documentation",
    context_inputs: [`Support channels: {{support_channels}}`, `Identity verification: {{identity_verification_method}}`, `Timeline expectations: {{request_timeline}}`],
    task: "Write a support FAQ that helps agents route and respond to GDPR requests without making promises they can’t keep.",
    deliverable: "A support-ready FAQ plus scripts and escalation guidelines."
  },
  {
    cat_slug: "privacy-security",
    title: "GDPR Legitimate Interest: Pros/Cons + When to Avoid",
    description: "Explain pros/cons of relying on legitimate interest and list when it’s a bad fit.",
    use_case: "Data Privacy & Security",
    inputs: ["processing_activity", "data_subjects", "jurisdiction_notes"],
    steps: ["Describe processing activity", "Generate pros/cons + risk notes"],
    output_format: "Pros/cons + risk checklist + recommended next steps (LIA).",
    tags: ["privacy", "gdpr", "legal-basis", "risk"],
    role: "a privacy analyst",
    context_inputs: [`Processing activity: {{processing_activity}}`, `Data subjects: {{data_subjects}}`, `Jurisdiction notes: {{jurisdiction_notes}}`],
    task: "Evaluate the pros and cons of using legitimate interest for the activity above. Identify risks and mitigation steps.",
    deliverable: "A short decision memo plus a checklist for a Legitimate Interest Assessment (LIA)."
  },
  {
    cat_slug: "privacy-security",
    title: "COPPA: Children’s Data Policy Language",
    description: "Draft policy language explaining how you handle children’s data and what you do if you learn a child used the service.",
    use_case: "Data Privacy & Security",
    inputs: ["product_audience", "age_gate_process", "contact_method"],
    steps: ["Describe audience + age gating", "Generate policy section"],
    output_format: "Policy section + support escalation playbook.",
    tags: ["privacy", "coppa", "policy-draft"],
    role: "a privacy policy drafter",
    context_inputs: [`Product audience: {{product_audience}}`, `Age gate process: {{age_gate_process}}`, `Contact method: {{contact_method}}`],
    task: "Draft a policy section on children’s data that is clear for a US audience and includes what actions you take if you discover a child’s data.",
    deliverable: "Policy language + a short internal process checklist for support."
  },
  {
    cat_slug: "privacy-security",
    title: "Vendor Due Diligence Summary (Privacy Lens)",
    description: "Summarize what to check in vendor due diligence from a privacy and data governance perspective.",
    use_case: "Data Privacy & Security",
    inputs: ["vendor_type", "data_shared", "risk_level"],
    steps: ["Describe vendor and data shared", "Generate due diligence checklist"],
    output_format: "Checklist + what evidence to collect + red flags.",
    tags: ["privacy", "vendors", "due-diligence", "risk"],
    role: "a privacy compliance reviewer",
    context_inputs: [`Vendor type: {{vendor_type}}`, `Data shared: {{data_shared}}`, `Risk level: {{risk_level}}`],
    task: "Generate a due diligence checklist covering retention, subprocessors, security controls, breach notification, data location, and audit rights.",
    deliverable: "A checklist plus a short red-flag list that triggers escalation."
  }
  ,

  // 3) Corporate Governance
  {
    cat_slug: "governance",
    title: "Delaware Fiduciary Duties One-Pager",
    description: "Write a one-page overview of fiduciary duties (care, loyalty) and the business judgment rule.",
    use_case: "Corporate Governance",
    inputs: ["audience", "company_stage"],
    steps: ["Set audience + company stage", "Generate overview + examples"],
    output_format: "One page with headings + examples + do/don’t list.",
    tags: ["governance", "delaware", "fiduciary-duties", "education"],
    role: "a corporate governance explainer",
    context_inputs: [`Audience: {{audience}}`, `Company stage: {{company_stage}}`],
    task:
      "Write a one-page overview of directors’ fiduciary duties under Delaware law: duty of care, duty of loyalty, and business judgment rule. Use practical examples.",
    deliverable: "A crisp one-pager an exec can read in 3 minutes."
  },
  {
    cat_slug: "governance",
    title: "Board Resolution: Authorize CEO to Sign Partnership Agreement",
    description: "Draft a board resolution authorizing the CEO to execute a partnership agreement.",
    use_case: "Corporate Governance",
    inputs: ["company_name", "counterparty_name", "agreement_summary", "effective_date"],
    steps: ["Fill company + counterparty details", "Describe the agreement", "Generate resolution"],
    output_format: "Board resolution text + a short checklist for board packet completion.",
    tags: ["governance", "board", "resolutions", "templates"],
    role: "a corporate paralegal drafting board resolutions",
    context_inputs: [
      `Company: {{company_name}}`,
      `Counterparty: {{counterparty_name}}`,
      `Agreement summary: {{agreement_summary}}`,
      `Effective date: {{effective_date}}`
    ],
    task:
      "Draft a board resolution that authorizes the CEO to execute the partnership agreement and take related actions (sign, deliver, and perform).",
    deliverable:
      "Provide resolution text suitable for minutes, plus a checklist of attachments (agreement, consents, exhibits)."
  },
  {
    cat_slug: "governance",
    title: "Change of Control Clause: What It Does + Trigger Scenarios",
    description: "Explain change-of-control clauses and give examples of when they trigger.",
    use_case: "Corporate Governance",
    inputs: ["clause_text_optional", "context"],
    steps: ["Provide context and clause text (if any)", "Generate explanation + scenarios"],
    output_format: "Plain-English explanation + 3 trigger scenarios + what to check next.",
    tags: ["governance", "contracts", "change-of-control", "education"],
    role: "an in-house legal educator",
    context_inputs: [`Context: {{context}}`, `Clause text (optional): {{clause_text_optional}}`],
    task:
      "Explain what a change-of-control clause does and why it matters. Provide three realistic scenarios where it could be triggered.",
    deliverable: "An exec-friendly explanation plus a checklist of what to verify in the actual agreement."
  },
  {
    cat_slug: "governance",
    title: "GC Talking Points: Legal Team Value-Add",
    description: "Prepare executive-friendly talking points explaining how Legal de-risks and accelerates the business.",
    use_case: "Corporate Governance",
    inputs: ["company_priorities", "legal_team_scope", "recent_wins"],
    steps: ["List priorities + scope", "Add wins/examples", "Generate talking points"],
    output_format: "Bullets for a 3-5 minute update + optional slide outline.",
    tags: ["leadership", "legal-ops", "internal-comms", "exec"],
    role: "a communications writer for a General Counsel",
    context_inputs: [`Company priorities: {{company_priorities}}`, `Legal scope: {{legal_team_scope}}`, `Recent wins: {{recent_wins}}`],
    task:
      "Write concise talking points that communicate Legal’s value in terms executives care about: revenue, risk, speed, and trust.",
    deliverable:
      "3-5 minute speaking bullets plus a short list of metrics to track going forward."
  },
  {
    cat_slug: "governance",
    title: "Why Legal Must Be Looped In (Internal Explainer)",
    description: "Draft a brief internal explanation of when and why Legal needs to be included in decisions.",
    use_case: "Corporate Governance",
    inputs: ["decision_types", "intake_link", "sla_expectations"],
    steps: ["List decision types", "Add intake link and SLA expectations", "Generate explainer"],
    output_format: "Short memo + a 6-bullet checklist of triggers to involve Legal.",
    tags: ["legal-ops", "intake", "internal-comms", "governance"],
    role: "a legal ops manager writing internal guidance",
    context_inputs: [`Decision types: {{decision_types}}`, `Intake link: {{intake_link}}`, `SLA expectations: {{sla_expectations}}`],
    task:
      "Write a short internal explainer that sets clear expectations: when to involve Legal, what info to provide, and what happens if Legal is brought in late.",
    deliverable: "An internal memo that is crisp and non-defensive, with clear next steps."
  },
  {
    cat_slug: "governance",
    title: "Delegation of Authority Matrix (Who Can Sign What)",
    description: "Create a delegation of authority matrix for signing, payments, and approving legal claims.",
    use_case: "Corporate Governance",
    inputs: ["roles", "contract_value_tiers", "exceptions"],
    steps: ["List roles and tiers", "Add exceptions", "Generate matrix"],
    output_format: "Table: action x threshold x approver x notes.",
    tags: ["governance", "legal-ops", "approvals", "templates"],
    role: "a legal operations analyst",
    context_inputs: [`Roles: {{roles}}`, `Contract value tiers: {{contract_value_tiers}}`, `Exceptions: {{exceptions}}`],
    task:
      "Draft a delegation of authority matrix that clearly defines who can sign contracts, approve spend, and approve settlement/legal claims at various thresholds.",
    deliverable: "A clean table plus a short implementation note for rollout (training + enforcement)."
  },
  {
    cat_slug: "governance",
    title: "Board Meeting Minutes Template (Annotated)",
    description: "Generate an annotated template for board meeting minutes for a Delaware corporation.",
    use_case: "Corporate Governance",
    inputs: ["company_name", "meeting_type", "agenda_items"],
    steps: ["Fill meeting details", "List agenda items", "Generate annotated minutes template"],
    output_format: "Minutes template with placeholders + notes on what to attach.",
    tags: ["governance", "board", "minutes", "templates"],
    role: "a corporate paralegal",
    context_inputs: [`Company: {{company_name}}`, `Meeting type: {{meeting_type}}`, `Agenda items: {{agenda_items}}`],
    task:
      "Create an annotated minutes template that includes attendance, notice, quorum, resolutions, and adjournment. Keep it clean and reusable.",
    deliverable: "Template text plus a short list of attachments (resolutions, exhibits, approvals)."
  },
  {
    cat_slug: "governance",
    title: "Corporate Resolution: What It Is + When You Need One",
    description: "Write a one-paragraph explanation of corporate resolutions and when they’re required.",
    use_case: "Corporate Governance",
    inputs: ["audience", "examples"],
    steps: ["Set audience", "Add examples", "Generate explanation"],
    output_format: "One paragraph + 5 examples.",
    tags: ["governance", "education", "resolutions"],
    role: "a corporate governance explainer",
    context_inputs: [`Audience: {{audience}}`, `Examples: {{examples}}`],
    task: "Explain what a corporate resolution is and list common situations where one is required or recommended.",
    deliverable: "A short paragraph plus 5 practical examples for a private US company."
  },
  {
    cat_slug: "governance",
    title: "Annual Governance Documents Checklist (Private US Company)",
    description: "List key governance documents a private US corporation should maintain and update annually.",
    use_case: "Corporate Governance",
    inputs: ["company_stage", "board_structure", "investors_optional"],
    steps: ["Describe stage + board", "List investors (optional)", "Generate checklist"],
    output_format: "Checklist grouped by: corporate records, equity, contracts, policies, finance/tax.",
    tags: ["governance", "checklist", "operations"],
    role: "a corporate legal operations assistant",
    context_inputs: [`Company stage: {{company_stage}}`, `Board structure: {{board_structure}}`, `Investors (optional): {{investors_optional}}`],
    task:
      "Create a checklist of governance documents to maintain and review annually, including where they should live and who owns updates.",
    deliverable: "A checklist that can be used as a yearly recurring task list."
  },
  {
    cat_slug: "governance",
    title: "Director Conflicts: Exec/Investor Overlap Risk Notes",
    description: "Summarize common fiduciary duty issues when directors are also executives or investors.",
    use_case: "Corporate Governance",
    inputs: ["scenario", "stakeholders"],
    steps: ["Describe scenario", "List stakeholders", "Generate risk notes + mitigations"],
    output_format: "Risk notes + mitigation checklist + questions to ask counsel.",
    tags: ["governance", "fiduciary-duties", "conflicts", "risk"],
    role: "a governance risk analyst",
    context_inputs: [`Scenario: {{scenario}}`, `Stakeholders: {{stakeholders}}`],
    task:
      "Summarize common fiduciary duty and conflict issues when directors are also executives or investors, and list practical mitigation steps (recusal, process, documentation).",
    deliverable: "A short risk memo with a mitigation checklist."
  }
  ,

  // 4) Employment & Labor
  {
    cat_slug: "employment",
    title: "Employee Confidentiality Agreement (US, Basic)",
    description: "Draft a basic confidentiality agreement for a US employee with clear post-termination obligations.",
    use_case: "Employment & Labor",
    inputs: ["company_name", "employee_role", "state_if_known", "confidential_info_examples"],
    steps: ["Fill company/role/state", "Provide examples of confidential info", "Generate agreement draft"],
    output_format: "Agreement text with sections + a short checklist of what to customize.",
    tags: ["employment", "confidentiality", "templates", "us"],
    role: "an employment law drafting assistant",
    context_inputs: [
      `Company: {{company_name}}`,
      `Role: {{employee_role}}`,
      `State (if known): {{state_if_known}}`,
      `Confidential info examples: {{confidential_info_examples}}`
    ],
    task:
      "Draft a basic employee confidentiality agreement including non-disclosure, return of information, and post-termination obligations. Keep language plain and enforceable.",
    deliverable: "Provide a clean draft plus a list of questions to confirm (state-specific restrictions, IP assignment, etc.)."
  },
  {
    cat_slug: "employment",
    title: "Termination for Performance: Legal Considerations Checklist",
    description: "List key legal considerations before terminating an employee for performance issues.",
    use_case: "Employment & Labor",
    inputs: ["employee_state", "role", "performance_history_summary", "timing_constraints"],
    steps: ["Provide state/role context", "Summarize performance history", "Generate checklist"],
    output_format: "Checklist: documentation, process, final pay/benefits, communications, and risk flags.",
    tags: ["employment", "termination", "checklist", "hr"],
    role: "an HR-legal checklist writer",
    context_inputs: [
      `Employee state: {{employee_state}}`,
      `Role: {{role}}`,
      `Performance history: {{performance_history_summary}}`,
      `Timing constraints: {{timing_constraints}}`
    ],
    task:
      "Create a checklist of considerations before terminating for performance, including documentation, consistency, final pay/benefits logistics, and messaging.",
    deliverable:
      "A checklist plus a short list of questions to run by counsel (protected leave, complaints, retaliation risk, etc.).",
    guardrails: ["Do not cite specific state law rules unless the user provides them or asks for them explicitly."]
  },
  {
    cat_slug: "employment",
    title: "Non-Exempt Timekeeping Explainer (Remote + Overtime)",
    description: "Explain why non-exempt employees must track all time worked, including remote work and overtime.",
    use_case: "Employment & Labor",
    inputs: ["audience", "timekeeping_tool", "common_edge_cases"],
    steps: ["Set audience", "List tools/edge cases", "Generate explainer + examples"],
    output_format: "Plain-language explainer + examples + manager do/don’t list.",
    tags: ["employment", "timekeeping", "remote-work", "education"],
    role: "an HR policy writer",
    context_inputs: [`Audience: {{audience}}`, `Timekeeping tool: {{timekeeping_tool}}`, `Edge cases: {{common_edge_cases}}`],
    task:
      "Write a plain-language explainer for why non-exempt employees must track all time worked (including overtime) and how this applies to remote work.",
    deliverable: "A short internal doc plus examples of what counts as work time."
  },
  {
    cat_slug: "employment",
    title: "Employee vs Contractor Decision Checklist (US)",
    description: "Compare employees vs contractors and generate a decision checklist for classification.",
    use_case: "Employment & Labor",
    inputs: ["role_description", "work_location", "supervision_level", "duration"],
    steps: ["Describe the role", "List supervision/duration", "Generate checklist + recommendation"],
    output_format: "Decision checklist + risk notes + what to document.",
    tags: ["employment", "contractors", "classification", "risk"],
    role: "an employment compliance assistant",
    context_inputs: [
      `Role description: {{role_description}}`,
      `Work location: {{work_location}}`,
      `Supervision level: {{supervision_level}}`,
      `Duration: {{duration}}`
    ],
    task:
      "Provide a practical checklist of factors to consider when classifying a worker as employee vs independent contractor. Explain tradeoffs and risks in business terms.",
    deliverable: "A checklist, risk flags, and what evidence to document regardless of the choice."
  },
  {
    cat_slug: "employment",
    title: "California HR Quick Guide (Hiring + Termination)",
    description: "Generate a short compliance guide for HR when hiring or terminating employees in California.",
    use_case: "Employment & Labor",
    inputs: ["company_size", "roles", "hr_systems"],
    steps: ["Provide company context", "List roles/systems", "Generate guide + checklist"],
    output_format: "Checklist grouped by hiring, onboarding, policies, termination, and recordkeeping.",
    tags: ["employment", "california", "hr", "checklist"],
    role: "an HR compliance checklist writer",
    context_inputs: [`Company size: {{company_size}}`, `Roles: {{roles}}`, `HR systems: {{hr_systems}}`],
    task:
      "Create a lightweight HR compliance guide for California hiring/termination workflows. Focus on process, documentation, and escalation triggers.",
    deliverable: "A checklist plus a short list of items that usually require counsel review."
  },
  {
    cat_slug: "employment",
    title: "Employee Monitoring Tool: Legal Risk Summary",
    description: "Summarize key legal and trust issues before implementing employee surveillance/productivity monitoring.",
    use_case: "Employment & Labor",
    inputs: ["tool_description", "data_collected", "countries_states", "business_rationale"],
    steps: ["Describe tool and data collected", "List jurisdictions", "Generate risk summary + mitigations"],
    output_format: "Risks + mitigations + rollout checklist + employee comms draft.",
    tags: ["employment", "privacy", "monitoring", "risk"],
    role: "a privacy and employment policy analyst",
    context_inputs: [
      `Tool description: {{tool_description}}`,
      `Data collected: {{data_collected}}`,
      `Jurisdictions: {{countries_states}}`,
      `Business rationale: {{business_rationale}}`
    ],
    task:
      "Summarize key legal, privacy, and culture risks of the monitoring tool and propose mitigations: purpose limitation, transparency, retention limits, and access controls.",
    deliverable: "A short risk memo plus a rollout checklist (policy, training, comms, and logging)."
  },
  {
    cat_slug: "employment",
    title: "PTO Policy Draft (US Remote Workforce)",
    description: "Draft a PTO policy for a US-based remote workforce with clear accrual, approval, and payout notes.",
    use_case: "Employment & Labor",
    inputs: ["pto_model", "states", "carryover_rules", "approval_process"],
    steps: ["Pick PTO model", "List states", "Define carryover/approval", "Generate policy draft"],
    output_format: "Policy text + manager FAQ + employee FAQ.",
    tags: ["employment", "policy-draft", "pto", "remote-work"],
    role: "an HR policy writer",
    context_inputs: [
      `PTO model: {{pto_model}} (accrual/unlimited/hybrid)`,
      `States: {{states}}`,
      `Carryover rules: {{carryover_rules}}`,
      `Approval process: {{approval_process}}`
    ],
    task:
      "Draft a PTO policy that is clear, fair, and operationally usable for a remote workforce. Include how PTO is requested, tracked, and handled at termination.",
    deliverable: "A policy draft plus questions to confirm for state-specific compliance."
  },
  {
    cat_slug: "employment",
    title: "Multi-State Hybrid Work: Common Employment Risks",
    description: "List common employment law risks for a company with hybrid work arrangements across multiple states.",
    use_case: "Employment & Labor",
    inputs: ["states", "roles", "current_policies"],
    steps: ["List states/roles", "Describe current policies", "Generate risk list + next steps"],
    output_format: "Risk list + prioritized next steps + owner map.",
    tags: ["employment", "multi-state", "risk", "policy"],
    role: "an employment risk analyst",
    context_inputs: [`States: {{states}}`, `Roles: {{roles}}`, `Current policies: {{current_policies}}`],
    task:
      "Identify the most common HR/legal risk areas for multi-state hybrid work (timekeeping, leave, payroll taxes, privacy, accommodations, termination process).",
    deliverable: "A prioritized risk list and a short implementation plan."
  },
  {
    cat_slug: "employment",
    title: "New Hire Onboarding Documents Checklist (US, Full-Time)",
    description: "Create a checklist of legal documents required when onboarding a full-time US employee.",
    use_case: "Employment & Labor",
    inputs: ["states", "employee_type", "benefits_offered"],
    steps: ["List states and employee type", "Describe benefits", "Generate checklist"],
    output_format: "Checklist + who owns each step + where to store documents.",
    tags: ["employment", "onboarding", "checklist", "hr"],
    role: "an HR operations checklist writer",
    context_inputs: [`States: {{states}}`, `Employee type: {{employee_type}}`, `Benefits offered: {{benefits_offered}}`],
    task:
      "Generate a checklist of documents and notices needed for onboarding, including offer letter, policies, confidentiality/IP, tax/payroll forms, and handbook acknowledgements.",
    deliverable: "A checklist with owners and a recommended storage/retention note."
  },
  {
    cat_slug: "employment",
    title: "Termination Letter Language (Avoid Implied Promises)",
    description: "Generate template termination letter language that avoids admissions and implied promises.",
    use_case: "Employment & Labor",
    inputs: ["termination_type", "state_if_known", "final_pay_details", "return_of_property_process"],
    steps: ["Choose termination type", "Provide pay/return details", "Generate letter language"],
    output_format: "Letter text + optional manager script + checklist.",
    tags: ["employment", "termination", "templates", "hr"],
    role: "an HR-legal drafting assistant",
    context_inputs: [
      `Termination type: {{termination_type}} (for cause/without cause/layoff)`,
      `State (if known): {{state_if_known}}`,
      `Final pay details: {{final_pay_details}}`,
      `Return of property process: {{return_of_property_process}}`
    ],
    task:
      "Draft a termination letter that is concise, respectful, and avoids unnecessary detail. Include logistics for final pay, benefits, and return of property.",
    deliverable: "Letter text plus a short checklist for HR execution."
  },

  // 5) M&A and Strategic Transactions
  {
    cat_slug: "m-a",
    title: "Software Acquisition Due Diligence Questions (IP, Contracts, Litigation, Employment)",
    description: "List key due diligence questions for acquiring a software company, focused on the highest-risk areas.",
    use_case: "M&A and Strategic Transactions",
    inputs: ["target_profile", "deal_type", "timeline"],
    steps: ["Describe target and deal type", "Set timeline", "Generate DD question list"],
    output_format: "DD questions grouped by topic + red flag list + requested documents list.",
    tags: ["m&a", "due-diligence", "software", "ip", "contracts"],
    role: "an M&A diligence coordinator",
    context_inputs: [`Target profile: {{target_profile}}`, `Deal type: {{deal_type}}`, `Timeline: {{timeline}}`],
    task:
      "Generate a diligence question list for a software acquisition, emphasizing IP ownership, key customer/vendor contracts, litigation exposure, privacy/security posture, and employment/contractor issues.",
    deliverable: "A DD questionnaire plus a short list of 'stop sign' red flags."
  },
  {
    cat_slug: "m-a",
    title: "Joint Venture Agreement Risk Scan (Exclusivity, IP, Governance, Exit)",
    description: "Summarize the main risks in a joint venture agreement and what to clarify before signing.",
    use_case: "M&A and Strategic Transactions",
    inputs: ["jv_text_or_summary", "our_goals", "risk_tolerance"],
    steps: ["Paste JV text or summary", "State goals and risk tolerance", "Generate risk scan + questions"],
    output_format: "Risks grouped by: exclusivity, IP, governance, economics, exit/termination, dispute resolution.",
    tags: ["m&a", "joint-venture", "risk", "ip", "governance"],
    role: "an M&A risk analyst",
    context_inputs: [`Our goals: {{our_goals}}`, `Risk tolerance: {{risk_tolerance}}`, "JV text/summary:", "{{jv_text_or_summary}}"],
    task:
      "Identify key risks in the JV: exclusivity constraints, IP ownership/licensing, governance deadlocks, economic splits, and exit rights.",
    deliverable: "A risk memo plus the top 15 questions to clarify with the counterparty."
  },
  {
    cat_slug: "m-a",
    title: "Standstill Clause Draft (Deal Negotiations)",
    description: "Draft a standstill clause to prevent the other party from pursuing a competing opportunity during negotiations.",
    use_case: "M&A and Strategic Transactions",
    inputs: ["standstill_scope", "duration", "exceptions"],
    steps: ["Define scope and duration", "Add exceptions", "Generate clause"],
    output_format: "Clause text + fallback version + negotiation notes.",
    tags: ["m&a", "drafting", "standstill", "negotiation"],
    role: "an M&A term sheet drafter",
    context_inputs: [`Scope: {{standstill_scope}}`, `Duration: {{duration}}`, `Exceptions: {{exceptions}}`],
    task: "Draft a standstill clause appropriate for deal negotiations, with clear scope, duration, and enforcement language.",
    deliverable: "Provide clause text plus a softer fallback version."
  },
  {
    cat_slug: "m-a",
    title: "No-Shop Clause Explained (Acquisitions)",
    description: "Explain what a no-shop clause is and how it protects parties in an acquisition.",
    use_case: "M&A and Strategic Transactions",
    inputs: ["deal_context", "audience"],
    steps: ["Provide deal context and audience", "Generate explanation + examples"],
    output_format: "Plain-English explanation + pros/cons + when to use a go-shop carveout.",
    tags: ["m&a", "education", "no-shop", "term-sheet"],
    role: "an M&A explainer",
    context_inputs: [`Deal context: {{deal_context}}`, `Audience: {{audience}}`],
    task:
      "Explain no-shop clauses in plain English, including typical carve-outs (fiduciary out, unsolicited superior proposals) and why sellers/buyers care.",
    deliverable: "A short explainer plus a checklist of negotiation levers."
  },
  {
    cat_slug: "m-a",
    title: "Change-of-Control Contract Risk Note (Merger Impact)",
    description: "Write an internal note explaining how change-of-control clauses can impact a merger or acquisition.",
    use_case: "M&A and Strategic Transactions",
    inputs: ["contract_portfolio_summary", "deal_type", "timing"],
    steps: ["Summarize contract portfolio", "Describe deal type", "Generate internal note"],
    output_format: "Internal note + action list + data to request from the business.",
    tags: ["m&a", "contracts", "change-of-control", "risk"],
    role: "an in-house M&A counsel",
    context_inputs: [`Contracts summary: {{contract_portfolio_summary}}`, `Deal type: {{deal_type}}`, `Timing: {{timing}}`],
    task:
      "Explain why change-of-control clauses matter for deals (consent requirements, termination rights, pricing changes) and outline a plan to triage contracts.",
    deliverable: "A short memo plus a prioritized plan for contract review."
  },
  {
    cat_slug: "m-a",
    title: "Reps and Warranties (Stock Purchase): Typical Set + Business Rationale",
    description: "List typical reps and warranties in a stock purchase agreement and explain why they exist.",
    use_case: "M&A and Strategic Transactions",
    inputs: ["deal_profile", "industry", "audience"],
    steps: ["Describe deal profile", "Set audience", "Generate list + rationale"],
    output_format: "Table: rep/warranty -> what it covers -> why it matters -> typical pushback.",
    tags: ["m&a", "reps-and-warranties", "education"],
    role: "an M&A explainer for business stakeholders",
    context_inputs: [`Deal profile: {{deal_profile}}`, `Industry: {{industry}}`, `Audience: {{audience}}`],
    task:
      "Provide a high-level list of typical reps and warranties in a stock purchase agreement and explain the business rationale for each.",
    deliverable: "A table plus 5 negotiation tips for non-lawyers."
  },
  {
    cat_slug: "m-a",
    title: "Term Sheet Confidentiality Clause (M&A)",
    description: "Draft a confidentiality clause for use in a term sheet during M&A discussions.",
    use_case: "M&A and Strategic Transactions",
    inputs: ["parties", "confidential_info_scope", "duration", "permitted_disclosures"],
    steps: ["Fill key variables", "Generate clause", "Add fallback option"],
    output_format: "Clause text + fallback version.",
    tags: ["m&a", "confidentiality", "drafting", "term-sheet"],
    role: "an M&A term sheet drafter",
    context_inputs: [
      `Parties: {{parties}}`,
      `Scope: {{confidential_info_scope}}`,
      `Duration: {{duration}}`,
      `Permitted disclosures: {{permitted_disclosures}}`
    ],
    task:
      "Draft a confidentiality clause suitable for a term sheet, including permitted disclosures (advisors), required protections, and return/destruction obligations.",
    deliverable: "Provide clause text plus a softer fallback if the counterparty pushes back."
  },
  {
    cat_slug: "m-a",
    title: "Earnout Explained + Seller Protections Checklist",
    description: "Explain what an earnout is and list protections a seller should request.",
    use_case: "M&A and Strategic Transactions",
    inputs: ["earnout_structure", "metrics", "control_rights_context"],
    steps: ["Describe earnout structure", "List metrics/control issues", "Generate explanation + protections"],
    output_format: "Plain-English explanation + protections checklist + example clauses (high level).",
    tags: ["m&a", "earnout", "risk", "education"],
    role: "an M&A deal analyst",
    context_inputs: [`Earnout structure: {{earnout_structure}}`, `Metrics: {{metrics}}`, `Control rights context: {{control_rights_context}}`],
    task:
      "Explain earnouts and why they can go wrong. Provide a seller-side protections checklist: reporting, audit rights, operating covenants, dispute resolution, and acceleration triggers.",
    deliverable: "A short memo plus a checklist of negotiation asks."
  },
  {
    cat_slug: "m-a",
    title: "Cross-Border M&A: Common Filings and Approvals Overview",
    description: "Summarize regulatory filings/approvals that may be required in cross-border M&A involving a US company.",
    use_case: "M&A and Strategic Transactions",
    inputs: ["countries_involved", "deal_size", "industry", "timeline"],
    steps: ["List countries and industry", "Set deal size/timeline", "Generate overview + questions"],
    output_format: "High-level overview + what to ask counsel + timeline risks.",
    tags: ["m&a", "regulatory", "cross-border", "risk"],
    role: "an M&A coordinator",
    context_inputs: [`Countries: {{countries_involved}}`, `Deal size: {{deal_size}}`, `Industry: {{industry}}`, `Timeline: {{timeline}}`],
    task:
      "Provide a high-level overview of typical filings/approvals to consider (competition/antitrust, sector-specific, foreign investment review) and how they impact timing.",
    deliverable: "A scannable list plus a question set for outside counsel."
  },
  {
    cat_slug: "m-a",
    title: "Post-Closing Transition Support Covenant (90 Days)",
    description: "Generate a sample covenant requiring seller transition support for 90 days post-close.",
    use_case: "M&A and Strategic Transactions",
    inputs: ["support_scope", "hours_per_week", "fees_if_any", "termination_conditions"],
    steps: ["Define support scope", "Set hours/fees", "Generate covenant text"],
    output_format: "Covenant text + support deliverables checklist.",
    tags: ["m&a", "transition", "drafting", "post-close"],
    role: "an M&A drafter",
    context_inputs: [
      `Support scope: {{support_scope}}`,
      `Hours/week: {{hours_per_week}}`,
      `Fees (if any): {{fees_if_any}}`,
      `Termination conditions: {{termination_conditions}}`
    ],
    task:
      "Draft a post-closing covenant requiring the seller to provide transition support for 90 days, with clear scope, availability, and handoff obligations.",
    deliverable: "Provide covenant text plus a checklist of deliverables (accounts, docs, training, contacts)."
  },

  // 6) Litigation & Disputes
  {
    cat_slug: "litigation",
    title: "Litigation Hold Notice (Employee Draft)",
    description: "Draft a litigation hold notice for employees to preserve documents and communications.",
    use_case: "Litigation & Disputes",
    inputs: ["matter_summary", "custodians", "systems_in_scope", "effective_date"],
    steps: ["Describe matter and scope", "List custodians/systems", "Generate hold notice"],
    output_format: "Hold notice email + acknowledgement text + FAQ.",
    tags: ["litigation", "ediscovery", "hold", "templates"],
    role: "a litigation support coordinator",
    context_inputs: [
      `Matter summary: {{matter_summary}}`,
      `Custodians: {{custodians}}`,
      `Systems in scope: {{systems_in_scope}}`,
      `Effective date: {{effective_date}}`
    ],
    task:
      "Draft a litigation hold notice that is clear, specific about what to preserve, and includes instructions for Slack/email/doc systems.",
    deliverable: "An employee-facing hold notice + acknowledgement language + a short FAQ."
  },
  {
    cat_slug: "litigation",
    title: "Cease-and-Desist Letter: First Steps Checklist",
    description: "List steps an in-house team should take after receiving a cease-and-desist letter.",
    use_case: "Litigation & Disputes",
    inputs: ["letter_summary", "business_context", "deadline"],
    steps: ["Summarize letter and claims", "Describe business context", "Generate response plan"],
    output_format: "Checklist + timeline + what to preserve + who to loop in.",
    tags: ["litigation", "trademark", "response", "checklist"],
    role: "an in-house legal operations assistant",
    context_inputs: [`Letter summary: {{letter_summary}}`, `Business context: {{business_context}}`, `Deadline: {{deadline}}`],
    task:
      "Create a first-response checklist: preserve evidence, assess claims, route to counsel, manage communications, and avoid admissions.",
    deliverable: "A timeline checklist plus a short list of do/don’t for internal stakeholders."
  },
  {
    cat_slug: "litigation",
    title: "Privilege Preservation Training Script (10 Minutes)",
    description: "Write a short training script to help employees preserve attorney-client privilege in writing.",
    use_case: "Litigation & Disputes",
    inputs: ["company_context", "common_mistakes"],
    steps: ["Describe context", "List common mistakes", "Generate training script"],
    output_format: "10-minute script + 5 scenario Q&As.",
    tags: ["litigation", "privilege", "training", "internal-comms"],
    role: "a litigation training writer",
    context_inputs: [`Company context: {{company_context}}`, `Common mistakes: {{common_mistakes}}`],
    task:
      "Write a short training script on attorney-client privilege basics, how to label/route communications, and what not to do in Slack/email.",
    deliverable: "A 10-minute script plus scenarios employees can recognize."
  },
  {
    cat_slug: "litigation",
    title: "Why Privileged Comms Shouldn’t Be Forwarded (Internal Explainer)",
    description: "Explain why privileged communications should not be forwarded to third parties and what risks that creates.",
    use_case: "Litigation & Disputes",
    inputs: ["audience", "examples"],
    steps: ["Set audience", "Provide examples", "Generate explainer + do/don’t list"],
    output_format: "Short explainer + do/don’t list + escalation path.",
    tags: ["litigation", "privilege", "internal-comms"],
    role: "an internal legal educator",
    context_inputs: [`Audience: {{audience}}`, `Examples: {{examples}}`],
    task:
      "Write a plain-language explanation of why forwarding privileged legal comms can waive privilege and increase risk.",
    deliverable: "A short explainer with examples and an escalation script."
  },
  {
    cat_slug: "litigation",
    title: "Outside Counsel Kickoff Checklist (Budget, Scope, Comms)",
    description: "Create a checklist for coordinating with outside counsel on a new litigation matter.",
    use_case: "Litigation & Disputes",
    inputs: ["matter_summary", "goals", "budget_constraints", "internal_stakeholders"],
    steps: ["Describe the matter", "Set goals/budget", "Generate kickoff checklist"],
    output_format: "Checklist grouped by: scope, budget, comms, preservation, roles, cadence.",
    tags: ["litigation", "outside-counsel", "checklist", "legal-ops"],
    role: "a legal operations manager",
    context_inputs: [`Matter summary: {{matter_summary}}`, `Goals: {{goals}}`, `Budget constraints: {{budget_constraints}}`, `Stakeholders: {{internal_stakeholders}}`],
    task:
      "Create a kickoff checklist that sets scope, roles, communication cadence, budget tracking, and evidence preservation responsibilities.",
    deliverable: "A checklist and a suggested kickoff agenda."
  },
  {
    cat_slug: "litigation",
    title: "Slack Preservation Guide (Collection + Export Steps)",
    description: "Write a step-by-step guide for collecting and preserving Slack and collaboration tool data for litigation.",
    use_case: "Litigation & Disputes",
    inputs: ["tools_in_scope", "admin_roles", "time_range", "channels_custodians"],
    steps: ["List tools and admins", "Set time range and custodians", "Generate collection guide"],
    output_format: "Step-by-step guide + evidence log template + chain-of-custody notes.",
    tags: ["litigation", "ediscovery", "slack", "preservation"],
    role: "an eDiscovery project lead",
    context_inputs: [`Tools: {{tools_in_scope}}`, `Admins: {{admin_roles}}`, `Time range: {{time_range}}`, `Channels/custodians: {{channels_custodians}}`],
    task:
      "Create a practical preservation guide that focuses on repeatability and defensibility: what to collect, how to export, how to log, and how to secure.",
    deliverable: "A step-by-step guide plus an evidence log template."
  },
  {
    cat_slug: "litigation",
    title: "Arbitration Clause FAQ (Internal)",
    description: "Draft an internal FAQ explaining what arbitration clauses do and how they affect dispute options.",
    use_case: "Litigation & Disputes",
    inputs: ["audience", "company_policy_optional"],
    steps: ["Set audience and policy context", "Generate FAQ"],
    output_format: "FAQ (10 Q/A) + 5 common misconceptions.",
    tags: ["litigation", "arbitration", "education"],
    role: "a legal educator",
    context_inputs: [`Audience: {{audience}}`, `Company policy (optional): {{company_policy_optional}}`],
    task:
      "Write an internal FAQ explaining arbitration vs litigation vs mediation, and what arbitration clauses typically change (forum, discovery, appeal rights, costs).",
    deliverable: "A readable FAQ for non-lawyers."
  },
  {
    cat_slug: "litigation",
    title: "Non-Disparagement Clause (Settlement Agreement)",
    description: "Draft a non-disparagement clause for a settlement agreement with clear scope and exceptions.",
    use_case: "Litigation & Disputes",
    inputs: ["parties", "scope", "exceptions", "duration"],
    steps: ["Fill variables", "Generate clause + fallback", "Add negotiation notes"],
    output_format: "Clause text + fallback version + negotiation notes.",
    tags: ["litigation", "settlement", "drafting", "non-disparagement"],
    role: "a settlement agreement drafter",
    context_inputs: [`Parties: {{parties}}`, `Scope: {{scope}}`, `Exceptions: {{exceptions}}`, `Duration: {{duration}}`],
    task:
      "Draft a non-disparagement clause with clear scope, reasonable exceptions (legal process, required disclosures), and enforcement language.",
    deliverable: "Provide clause text plus one fallback option if the counterparty pushes back."
  },
  {
    cat_slug: "litigation",
    title: "Privilege Waiver Mistakes: Common Patterns + How to Avoid",
    description: "List common mistakes employees make that risk waiving privilege, and how to avoid them.",
    use_case: "Litigation & Disputes",
    inputs: ["communication_channels", "common_scenarios"],
    steps: ["List comms channels", "Provide scenarios", "Generate mistakes + mitigations"],
    output_format: "List of mistakes + mitigations + short training bullets.",
    tags: ["litigation", "privilege", "training", "risk"],
    role: "a litigation training writer",
    context_inputs: [`Channels: {{communication_channels}}`, `Scenarios: {{common_scenarios}}`],
    task:
      "Identify common privilege-waiver patterns in modern collaboration tools (Slack threads, forwarding emails, adding third parties) and propose simple behavioral rules.",
    deliverable: "A list of mistakes, how to avoid them, and a short checklist to share company-wide."
  },
  {
    cat_slug: "litigation",
    title: "Dispute Resolution Options: Litigation vs Arbitration vs Mediation",
    description: "Summarize typical dispute resolution clauses and when each approach is appropriate.",
    use_case: "Litigation & Disputes",
    inputs: ["contract_context", "risk_profile", "geographies"],
    steps: ["Describe context and risk profile", "Generate comparison + recommendations"],
    output_format: "Comparison table + recommended default + negotiation notes.",
    tags: ["litigation", "dispute-resolution", "contracts", "education"],
    role: "an in-house disputes advisor",
    context_inputs: [`Contract context: {{contract_context}}`, `Risk profile: {{risk_profile}}`, `Geographies: {{geographies}}`],
    task:
      "Compare litigation, arbitration, and mediation for the scenario above: speed, cost, confidentiality, discovery, appeal rights, enforcement.",
    deliverable: "A comparison table plus a recommended default clause posture."
  }
  ,

  // 7) Compliance & Ethics
  {
    cat_slug: "compliance-ethics",
    title: "Code of Conduct Summary (New Hire Training)",
    description: "Write a concise Code of Conduct overview for new hire training: what it is, why it matters, how to report issues.",
    use_case: "Compliance & Ethics",
    inputs: ["company_values", "reporting_channels", "key_policies"],
    steps: ["List values, channels, policies", "Generate summary + training bullets"],
    output_format: "1-page summary + 5 scenario examples.",
    tags: ["compliance", "ethics", "training", "internal-comms"],
    role: "a compliance communications writer",
    context_inputs: [`Company values: {{company_values}}`, `Reporting channels: {{reporting_channels}}`, `Key policies: {{key_policies}}`],
    task:
      "Write a clear Code of Conduct overview for new hires, emphasizing reporting, non-retaliation, and practical examples (gifts, conflicts, harassment, data handling).",
    deliverable: "A one-page handout plus scenario examples."
  },
  {
    cat_slug: "compliance-ethics",
    title: "Escalation Protocol (Suspected Policy or Legal Violation)",
    description: "Draft a one-page escalation protocol for when business teams suspect a violation.",
    use_case: "Compliance & Ethics",
    inputs: ["reporting_channels", "response_sla", "examples"],
    steps: ["List channels and SLA", "Add examples", "Generate protocol"],
    output_format: "Protocol with steps, owners, and what evidence to capture.",
    tags: ["compliance", "escalation", "policy", "operations"],
    role: "a compliance operations writer",
    context_inputs: [`Reporting channels: {{reporting_channels}}`, `Response SLA: {{response_sla}}`, `Examples: {{examples}}`],
    task:
      "Create a simple escalation protocol: what to do, what not to do, who to notify, and what details to include to speed investigation.",
    deliverable: "A one-page protocol that can be pasted into the handbook."
  },
  {
    cat_slug: "compliance-ethics",
    title: "Anti-Corruption Quiz (10 Questions, Multiple Choice)",
    description: "Create a 10-question multiple choice quiz on anti-corruption and gifts/entertainment rules.",
    use_case: "Compliance & Ethics",
    inputs: ["policy_summary", "regions", "roles"],
    steps: ["Provide policy summary", "List regions/roles", "Generate quiz + answer key"],
    output_format: "10 MCQs + answer key + 1-paragraph rationale per question.",
    tags: ["compliance", "anti-corruption", "training", "quiz"],
    role: "a compliance training designer",
    context_inputs: [`Policy summary: {{policy_summary}}`, `Regions: {{regions}}`, `Roles: {{roles}}`],
    task:
      "Design a 10-question multiple choice quiz on anti-corruption and gifts/entertainment. Use realistic scenarios for sales, partnerships, and procurement.",
    deliverable: "Quiz + answer key + brief rationale."
  },
  {
    cat_slug: "compliance-ethics",
    title: "Anti-Retaliation Policy Summary + Manager Talking Points",
    description: "Summarize key provisions of an anti-retaliation policy and create manager talking points.",
    use_case: "Compliance & Ethics",
    inputs: ["policy_text_or_summary", "reporting_channels"],
    steps: ["Paste policy text/summary", "Add reporting channels", "Generate summary + talking points"],
    output_format: "Summary + manager script + do/don’t examples.",
    tags: ["compliance", "anti-retaliation", "training", "internal-comms"],
    role: "a compliance policy communicator",
    context_inputs: [`Policy text/summary: {{policy_text_or_summary}}`, `Reporting channels: {{reporting_channels}}`],
    task:
      "Summarize the anti-retaliation policy in clear language and create talking points managers can use in a 5-minute team meeting.",
    deliverable: "A summary + manager talking points + example scenarios."
  },
  {
    cat_slug: "compliance-ethics",
    title: "Conflicts of Interest: How to Recognize + Report (Employee Memo)",
    description: "Prepare a brief memo explaining how to recognize and report conflicts of interest.",
    use_case: "Compliance & Ethics",
    inputs: ["policy_summary", "disclosure_process", "examples"],
    steps: ["Provide policy/disclosure process", "Add examples", "Generate memo"],
    output_format: "Short memo + examples + disclosure checklist.",
    tags: ["compliance", "conflicts", "ethics", "internal-comms"],
    role: "a compliance communications writer",
    context_inputs: [`Policy summary: {{policy_summary}}`, `Disclosure process: {{disclosure_process}}`, `Examples: {{examples}}`],
    task:
      "Write an employee memo explaining what conflicts of interest look like in practice and how to disclose them without fear.",
    deliverable: "Memo + examples + a disclosure checklist."
  },
  {
    cat_slug: "compliance-ethics",
    title: "Conflict of Interest Policy + Annual Disclosure Form (Template)",
    description: "Draft a sample conflicts policy and an annual disclosure form employees can complete.",
    use_case: "Compliance & Ethics",
    inputs: ["company_context", "covered_people", "reporting_channels"],
    steps: ["Describe company context", "List covered people", "Generate policy + form"],
    output_format: "Policy text + disclosure form fields + instructions.",
    tags: ["compliance", "conflicts", "templates", "policy-draft"],
    role: "a compliance policy drafter",
    context_inputs: [`Company context: {{company_context}}`, `Covered people: {{covered_people}}`, `Reporting channels: {{reporting_channels}}`],
    task:
      "Draft a conflict of interest policy and an annual disclosure form. Keep it simple and operational.",
    deliverable: "Policy + form fields + guidance on review/approval workflow."
  },
  {
    cat_slug: "compliance-ethics",
    title: "Anti-Bribery Reminder Message (Before Sales Meeting)",
    description: "Create a short communication reminding employees of anti-bribery policy before a global sales meeting.",
    use_case: "Compliance & Ethics",
    inputs: ["meeting_context", "regions", "policy_links"],
    steps: ["Describe meeting context", "List regions/policy links", "Generate message"],
    output_format: "Short message suitable for Slack/email.",
    tags: ["compliance", "anti-bribery", "internal-comms"],
    role: "a compliance communications writer",
    context_inputs: [`Meeting context: {{meeting_context}}`, `Regions: {{regions}}`, `Policy links: {{policy_links}}`],
    task:
      "Draft a brief reminder message that is firm but not preachy. Emphasize gifts/entertainment, third parties, and how to get help fast.",
    deliverable: "One Slack-sized message and one email-sized version."
  },
  {
    cat_slug: "compliance-ethics",
    title: "Ethics Training Handout (Reporting + Non-Retaliation + Resources)",
    description: "Generate a one-page ethics training handout with reporting channels and key compliance resources.",
    use_case: "Compliance & Ethics",
    inputs: ["reporting_channels", "non_retaliation_statement", "resources_links"],
    steps: ["Provide channels/resources", "Generate handout"],
    output_format: "One-page handout + FAQ.",
    tags: ["compliance", "ethics", "training", "handout"],
    role: "a compliance training designer",
    context_inputs: [`Reporting channels: {{reporting_channels}}`, `Non-retaliation statement: {{non_retaliation_statement}}`, `Resources: {{resources_links}}`],
    task:
      "Create a one-page handout that employees can reference: what to report, how to report, what happens next, and assurances about non-retaliation.",
    deliverable: "Handout text + a short FAQ."
  },
  {
    cat_slug: "compliance-ethics",
    title: "Vendor Onboarding Compliance Audit Checklist",
    description: "List key steps for conducting an internal compliance audit on vendor onboarding practices.",
    use_case: "Compliance & Ethics",
    inputs: ["current_process_summary", "systems_used", "risk_areas"],
    steps: ["Describe process and systems", "List risk areas", "Generate audit checklist"],
    output_format: "Audit checklist + evidence to collect + remediation plan template.",
    tags: ["compliance", "vendors", "audit", "operations"],
    role: "a compliance auditor",
    context_inputs: [`Process summary: {{current_process_summary}}`, `Systems used: {{systems_used}}`, `Risk areas: {{risk_areas}}`],
    task:
      "Create an audit checklist to evaluate vendor onboarding for policy compliance: due diligence, approvals, contracts, security review, and recordkeeping.",
    deliverable: "Checklist + evidence list + a remediation plan skeleton."
  },
  {
    cat_slug: "compliance-ethics",
    title: "Anti-Retaliation Statement (Handbook Language)",
    description: "Draft a short anti-retaliation statement suitable for an employee handbook.",
    use_case: "Compliance & Ethics",
    inputs: ["reporting_channels", "tone", "jurisdiction_notes_optional"],
    steps: ["Set reporting channels and tone", "Generate statement"],
    output_format: "Short statement + optional longer version.",
    tags: ["compliance", "anti-retaliation", "policy-draft"],
    role: "a policy drafter",
    context_inputs: [`Reporting channels: {{reporting_channels}}`, `Tone: {{tone}}`, `Jurisdiction notes (optional): {{jurisdiction_notes_optional}}`],
    task:
      "Write a clear anti-retaliation statement that encourages reporting and explains consequences for retaliation.",
    deliverable: "A short handbook-ready statement and an expanded version."
  },

  // 8) Legal Research
  {
    cat_slug: "legal-research",
    title: "Legal Research Brief (Concise, Cited)",
    description: "Draft a concise research brief on a legal issue with sources to verify.",
    use_case: "Legal Research",
    inputs: ["issue", "jurisdiction", "constraints", "facts_optional"],
    steps: ["State issue + jurisdiction", "Add constraints and key facts", "Generate brief with sources"],
    output_format: "IRAC-style brief + source list (primary/secondary) + open questions.",
    tags: ["research", "citations", "irac"],
    role: "a legal research assistant",
    context_inputs: [`Issue: {{issue}}`, `Jurisdiction: {{jurisdiction}}`, `Constraints: {{constraints}}`, `Facts (optional): {{facts_optional}}`],
    task:
      "Provide a concise overview of relevant statutes/regulations and key case law. If you cannot reliably cite, say what to verify and where.",
    deliverable: "A short brief with a source list and a clear separation of facts vs analysis vs open questions.",
    guardrails: ["Never fabricate citations. If unsure, recommend where to look (official sources, treatises, court sites)."]
  },
  {
    cat_slug: "legal-research",
    title: "Contract Type Requirements (Jurisdiction Checklist)",
    description: "List primary legal requirements for a given contract type in a specified jurisdiction (high level).",
    use_case: "Legal Research",
    inputs: ["contract_type", "jurisdiction", "party_roles", "industry_context_optional"],
    steps: ["Specify contract type + jurisdiction", "Describe roles/context", "Generate checklist"],
    output_format: "Checklist of elements + common pitfalls + what to verify.",
    tags: ["research", "contracts", "checklist"],
    role: "a legal research assistant",
    context_inputs: [`Contract type: {{contract_type}}`, `Jurisdiction: {{jurisdiction}}`, `Party roles: {{party_roles}}`, `Industry context: {{industry_context_optional}}`],
    task:
      "Provide a high-level checklist of typical requirements and issues for the contract type. Include what varies materially by jurisdiction and what to verify with primary sources.",
    deliverable: "A checklist plus a short verification plan."
  },
  {
    cat_slug: "legal-research",
    title: "Compare Two Laws (Jurisdiction-Specific Differences)",
    description: "Outline major differences between two laws as applied in a jurisdiction, with practical implications.",
    use_case: "Legal Research",
    inputs: ["law_a", "law_b", "jurisdiction", "use_case_context"],
    steps: ["Name both laws and jurisdiction", "Provide use case context", "Generate comparison"],
    output_format: "Comparison table + what changes in compliance/workflow.",
    tags: ["research", "comparison", "compliance"],
    role: "a legal research assistant",
    context_inputs: [`Law A: {{law_a}}`, `Law B: {{law_b}}`, `Jurisdiction: {{jurisdiction}}`, `Use case: {{use_case_context}}`],
    task:
      "Compare the laws at a high level (scope, definitions, obligations, enforcement). Emphasize practical consequences for the use case.",
    deliverable: "A comparison table plus a short recommendation checklist."
  },
  {
    cat_slug: "legal-research",
    title: "Regulatory Framework Overview (Industry + Jurisdiction)",
    description: "Provide a high-level overview of the regulatory framework governing an activity in a jurisdiction.",
    use_case: "Legal Research",
    inputs: ["industry_or_activity", "jurisdiction", "company_profile", "risk_tolerance"],
    steps: ["Describe activity + jurisdiction", "Provide company profile", "Generate overview"],
    output_format: "Overview + key regulators + top obligations + enforcement posture + what to monitor.",
    tags: ["research", "regulatory", "overview"],
    role: "a legal research assistant",
    context_inputs: [`Activity: {{industry_or_activity}}`, `Jurisdiction: {{jurisdiction}}`, `Company profile: {{company_profile}}`, `Risk tolerance: {{risk_tolerance}}`],
    task:
      "Summarize the main regulatory bodies, key obligations, and common enforcement mechanisms relevant to the activity. Call out unknowns.",
    deliverable: "A scannable overview plus a monitoring checklist."
  },
  {
    cat_slug: "legal-research",
    title: "Standard of Care Overview (Industry + Jurisdiction)",
    description: "Explain the general standard of care concept and what to verify for a specific industry/jurisdiction.",
    use_case: "Legal Research",
    inputs: ["industry", "jurisdiction", "scenario"],
    steps: ["Specify industry/jurisdiction", "Describe scenario", "Generate overview"],
    output_format: "Plain-English overview + what sources to check + open questions.",
    tags: ["research", "torts", "negligence"],
    role: "a legal research assistant",
    context_inputs: [`Industry: {{industry}}`, `Jurisdiction: {{jurisdiction}}`, `Scenario: {{scenario}}`],
    task:
      "Provide a general explanation of standard of care for negligence analysis and outline what types of sources typically inform it (statutes, regs, case law, industry standards).",
    deliverable: "A short overview plus a verification checklist."
  },
  {
    cat_slug: "legal-research",
    title: "Compliance Requirements Under a Law (High-Level Checklist)",
    description: "Create a high-level compliance checklist for an activity under a specified law in a jurisdiction.",
    use_case: "Legal Research",
    inputs: ["law", "activity", "jurisdiction", "data_types_optional"],
    steps: ["Specify law + activity + jurisdiction", "Add data types (optional)", "Generate checklist"],
    output_format: "Checklist + implementation notes + what to verify.",
    tags: ["research", "compliance", "checklist"],
    role: "a compliance research assistant",
    context_inputs: [`Law: {{law}}`, `Activity: {{activity}}`, `Jurisdiction: {{jurisdiction}}`, `Data types (optional): {{data_types_optional}}`],
    task:
      "Provide a high-level compliance checklist and call out the most common pitfalls. Note what typically requires counsel review.",
    deliverable: "A checklist plus a short implementation plan."
  },
  {
    cat_slug: "legal-research",
    title: "Maintain Compliance Steps (Regulation Playbook Outline)",
    description: "Outline steps required to maintain ongoing compliance with a regulation.",
    use_case: "Legal Research",
    inputs: ["regulation", "jurisdiction", "business_processes", "owners"],
    steps: ["Name regulation/jurisdiction", "List processes/owners", "Generate playbook outline"],
    output_format: "Ongoing playbook: cadence, owners, evidence, audits, change management.",
    tags: ["research", "compliance", "playbook"],
    role: "a compliance operations assistant",
    context_inputs: [`Regulation: {{regulation}}`, `Jurisdiction: {{jurisdiction}}`, `Processes: {{business_processes}}`, `Owners: {{owners}}`],
    task:
      "Create a maintain-compliance playbook outline: what to do weekly/monthly/quarterly, evidence to store, and how to handle change.",
    deliverable: "A playbook outline with a clear cadence and owner map."
  },
  {
    cat_slug: "legal-research",
    title: "Enforcement Mechanisms Summary (Law + Jurisdiction)",
    description: "Summarize how a regulation is enforced in a jurisdiction and what penalties or remedies are typical.",
    use_case: "Legal Research",
    inputs: ["regulation", "jurisdiction", "industry_context"],
    steps: ["Name regulation/jurisdiction", "Add industry context", "Generate enforcement summary"],
    output_format: "Enforcement overview + typical triggers + what to monitor.",
    tags: ["research", "enforcement", "regulatory"],
    role: "a legal research assistant",
    context_inputs: [`Regulation: {{regulation}}`, `Jurisdiction: {{jurisdiction}}`, `Industry context: {{industry_context}}`],
    task:
      "Provide a high-level summary of enforcement mechanisms: regulator powers, complaint processes, civil penalties, private rights of action (if relevant).",
    deliverable: "A scannable enforcement overview and monitoring checklist."
  },
  {
    cat_slug: "legal-research",
    title: "Mandatory Disclosures Checklist (Business Type + Law)",
    description: "List mandatory disclosures required under a law for a specific business type, at a high level.",
    use_case: "Legal Research",
    inputs: ["law", "jurisdiction", "business_type", "channels"],
    steps: ["Specify business type and channels", "Name law/jurisdiction", "Generate checklist"],
    output_format: "Checklist grouped by channel (website, contracts, marketing, product UI).",
    tags: ["research", "disclosures", "compliance"],
    role: "a compliance research assistant",
    context_inputs: [`Law: {{law}}`, `Jurisdiction: {{jurisdiction}}`, `Business type: {{business_type}}`, `Channels: {{channels}}`],
    task:
      "Provide a high-level checklist of mandatory disclosures and where they typically appear (website footer, checkout flows, contracts, privacy notices).",
    deliverable: "A channel-based checklist plus a short verification plan."
  },
  {
    cat_slug: "legal-research",
    title: "Injunctive Relief: Standards Overview (Jurisdiction)",
    description: "Summarize requirements for injunctive relief and the standards courts apply, at a high level.",
    use_case: "Legal Research",
    inputs: ["jurisdiction", "scenario", "relief_sought"],
    steps: ["Specify jurisdiction", "Describe scenario and relief sought", "Generate overview"],
    output_format: "High-level standard + what evidence typically matters + open questions.",
    tags: ["research", "litigation", "injunctions"],
    role: "a legal research assistant",
    context_inputs: [`Jurisdiction: {{jurisdiction}}`, `Scenario: {{scenario}}`, `Relief sought: {{relief_sought}}`],
    task:
      "Provide a high-level overview of the typical injunctive relief standard (without inventing citations) and outline what evidence typically matters.",
    deliverable: "A short overview plus what to confirm with primary sources."
  },

  // 9) IP & Technology
  {
    cat_slug: "ip-tech",
    title: "Work-for-Hire Clause (Contractor Deliverables Owned by Company)",
    description: "Draft work-for-hire / assignment language to ensure contractor deliverables are owned by the company.",
    use_case: "IP & Technology",
    inputs: ["scope_of_work", "deliverables", "jurisdiction_if_known"],
    steps: ["Describe scope/deliverables", "Set jurisdiction (optional)", "Generate clause"],
    output_format: "Clause text + checklist of related clauses (IP, moral rights, open source).",
    tags: ["ip", "contracts", "work-for-hire", "drafting"],
    role: "an IP-savvy contracts drafter",
    context_inputs: [`Scope of work: {{scope_of_work}}`, `Deliverables: {{deliverables}}`, `Jurisdiction (optional): {{jurisdiction_if_known}}`],
    task:
      "Draft work-for-hire and IP assignment language that clearly transfers ownership of deliverables and related IP rights to the company, with reasonable cooperation obligations.",
    deliverable: "Clause text plus a checklist of companion provisions to include."
  },
  {
    cat_slug: "ip-tech",
    title: "Customer License Clause (Non-Exclusive, Non-Transferable, Usage Limits)",
    description: "Draft a customer license clause for software with clear usage limitations.",
    use_case: "IP & Technology",
    inputs: ["software_description", "license_scope", "usage_limits", "restrictions"],
    steps: ["Describe software and scope", "Set usage limits/restrictions", "Generate clause"],
    output_format: "Clause text + plain-English explanation.",
    tags: ["ip", "saas", "license", "drafting"],
    role: "a SaaS licensing drafter",
    context_inputs: [
      `Software: {{software_description}}`,
      `Scope: {{license_scope}}`,
      `Usage limits: {{usage_limits}}`,
      `Restrictions: {{restrictions}}`
    ],
    task:
      "Draft a license grant clause that is non-exclusive, non-transferable, limited to internal business use, and includes usage restrictions appropriate for SaaS.",
    deliverable: "Clause text plus a short explanation for business stakeholders."
  },
  {
    cat_slug: "ip-tech",
    title: "No Reverse Engineering Clause (SaaS/Software)",
    description: "Draft a clause prohibiting reverse engineering or decompiling software provided under an agreement.",
    use_case: "IP & Technology",
    inputs: ["scope", "exceptions_optional", "jurisdiction_if_known"],
    steps: ["Define scope", "Add exceptions (optional)", "Generate clause"],
    output_format: "Clause text + fallback version.",
    tags: ["ip", "reverse-engineering", "drafting"],
    role: "a software contracts drafter",
    context_inputs: [`Scope: {{scope}}`, `Exceptions (optional): {{exceptions_optional}}`, `Jurisdiction (optional): {{jurisdiction_if_known}}`],
    task:
      "Draft a restriction clause that prohibits reverse engineering, decompiling, disassembling, or attempting to derive source code, and prohibits benchmarking disclosure if desired.",
    deliverable: "Provide clause text plus a fallback version with narrower restrictions."
  },
  {
    cat_slug: "ip-tech",
    title: "Trademark Protection Best Practices (Co-Branding / White-Label)",
    description: "List best practices to protect trademarks when entering a co-branding or white-label arrangement.",
    use_case: "IP & Technology",
    inputs: ["arrangement_type", "brands_involved", "channels", "approval_workflow"],
    steps: ["Describe arrangement", "List channels/approval workflow", "Generate best practices"],
    output_format: "Best practices checklist + contract clauses to include (high level).",
    tags: ["ip", "trademarks", "branding", "checklist"],
    role: "a brand/IP advisor",
    context_inputs: [`Arrangement: {{arrangement_type}}`, `Brands: {{brands_involved}}`, `Channels: {{channels}}`, `Approval workflow: {{approval_workflow}}`],
    task:
      "Provide a checklist of best practices: quality control, usage guidelines, approval rights, enforcement, and termination/cleanup obligations.",
    deliverable: "A checklist plus recommended contract clause headings."
  },
  {
    cat_slug: "ip-tech",
    title: "Patent vs Trade Secret: Decision Guide (High Level)",
    description: "Summarize considerations when deciding whether to file a patent or keep an invention as a trade secret.",
    use_case: "IP & Technology",
    inputs: ["invention_summary", "business_timeline", "competitive_landscape"],
    steps: ["Describe invention and timeline", "Summarize competitive landscape", "Generate decision guide"],
    output_format: "Decision guide + pros/cons + recommended next steps with counsel.",
    tags: ["ip", "patents", "trade-secrets", "strategy"],
    role: "an IP strategy assistant",
    context_inputs: [`Invention summary: {{invention_summary}}`, `Timeline: {{business_timeline}}`, `Competitive landscape: {{competitive_landscape}}`],
    task:
      "Provide a high-level decision guide: disclosure risk, enforceability, costs, speed, and operational requirements for secrecy.",
    deliverable: "A decision memo plus a checklist of questions for IP counsel."
  },
  {
    cat_slug: "ip-tech",
    title: "Employee Invention Assignment Clause (Waiver of Moral Rights)",
    description: "Draft a clause assigning inventions created during employment to the company, with a moral rights waiver where applicable.",
    use_case: "IP & Technology",
    inputs: ["company_name", "role", "scope_limits_optional"],
    steps: ["Fill company/role", "Set scope limits", "Generate clause"],
    output_format: "Clause text + companion checklist (IP policy, disclosures, OSS).",
    tags: ["ip", "employment", "inventions", "drafting"],
    role: "an IP and employment drafting assistant",
    context_inputs: [`Company: {{company_name}}`, `Role: {{role}}`, `Scope limits (optional): {{scope_limits_optional}}`],
    task:
      "Draft an invention assignment clause that assigns relevant inventions to the company, requires disclosure, and includes cooperation obligations. Include a moral rights waiver where appropriate.",
    deliverable: "Clause text plus a checklist of companion policies/processes."
  },
  {
    cat_slug: "ip-tech",
    title: "IP Ownership Clause Pitfalls (Contractors): Checklist",
    description: "List common pitfalls in IP ownership clauses in contractor agreements and how to avoid them.",
    use_case: "IP & Technology",
    inputs: ["agreement_text_optional", "deliverables_type"],
    steps: ["Paste agreement text (optional)", "Describe deliverables", "Generate pitfalls checklist"],
    output_format: "Pitfalls + fixes + questions to ask before signing.",
    tags: ["ip", "contracts", "contractors", "checklist"],
    role: "an IP-focused contract reviewer",
    context_inputs: [`Deliverables type: {{deliverables_type}}`, `Agreement text (optional): {{agreement_text_optional}}`],
    task:
      "Identify common IP ownership pitfalls: missing assignment, unclear pre-existing IP, open source contamination, moral rights, and lack of cooperation language.",
    deliverable: "A checklist of pitfalls and recommended fixes."
  },
  {
    cat_slug: "ip-tech",
    title: "Trade Secret Protection Checklist (Vendor Relationships)",
    description: "Generate a checklist for ensuring trade secret protection when working with vendors and partners.",
    use_case: "IP & Technology",
    inputs: ["data_shared", "access_controls", "contract_terms_optional"],
    steps: ["Describe what’s shared", "List access controls", "Generate checklist"],
    output_format: "Checklist: labeling, access, logging, contractual controls, incident response.",
    tags: ["ip", "trade-secrets", "vendors", "checklist"],
    role: "a trade secret protection advisor",
    context_inputs: [`Data/shared info: {{data_shared}}`, `Access controls: {{access_controls}}`, `Contract terms (optional): {{contract_terms_optional}}`],
    task:
      "Create a practical checklist to protect trade secrets when sharing information with vendors: contract terms, access limits, retention, and monitoring.",
    deliverable: "A checklist plus a short list of red flags."
  },
  {
    cat_slug: "ip-tech",
    title: "Trademark Rights: Registration vs Use-Based (US, High Level)",
    description: "Summarize the difference between trademark registration and use-based rights in the US.",
    use_case: "IP & Technology",
    inputs: ["brand_names", "channels", "geographies"],
    steps: ["List brands/channels", "Generate summary + next steps"],
    output_format: "Plain-English summary + checklist for brand hygiene.",
    tags: ["ip", "trademarks", "education"],
    role: "an IP educator",
    context_inputs: [`Brand names: {{brand_names}}`, `Channels: {{channels}}`, `Geographies: {{geographies}}`],
    task:
      "Explain (at a high level) use-based trademark rights vs registration benefits. Include practical brand hygiene tips and what to track.",
    deliverable: "A short explainer plus a brand hygiene checklist."
  },
  {
    cat_slug: "ip-tech",
    title: "Copyright Clearance Checklist (Third-Party Content for Marketing)",
    description: "Explain how to do a basic copyright clearance for using third-party content in marketing materials.",
    use_case: "IP & Technology",
    inputs: ["content_type", "source", "intended_use", "distribution_channels"],
    steps: ["Describe content and use", "Generate clearance checklist"],
    output_format: "Checklist + risk notes + documentation to save.",
    tags: ["ip", "copyright", "marketing", "checklist"],
    role: "an IP clearance assistant",
    context_inputs: [`Content type: {{content_type}}`, `Source: {{source}}`, `Intended use: {{intended_use}}`, `Channels: {{distribution_channels}}`],
    task:
      "Provide a clearance checklist: ownership, license terms, attribution, modifications, and recordkeeping. Flag common red flags.",
    deliverable: "A checklist plus what to store for audit trail."
  },

  // 10) Legal Department Operations & Leadership
  {
    cat_slug: "legal-ops",
    title: "Legal Intake Form (Business Request Template)",
    description: "Create a legal intake form template for business teams to submit requests to Legal.",
    use_case: "Legal Department Operations & Leadership",
    inputs: ["request_types", "required_fields", "sla_targets"],
    steps: ["List request types and required fields", "Set SLAs", "Generate form template"],
    output_format: "Form fields + guidance text + routing rules.",
    tags: ["legal-ops", "intake", "templates"],
    role: "a legal operations manager",
    context_inputs: [`Request types: {{request_types}}`, `Required fields: {{required_fields}}`, `SLA targets: {{sla_targets}}`],
    task:
      "Design an intake form that captures enough detail to triage quickly: business goal, deadline, stakeholders, data sensitivity, and desired outcome.",
    deliverable: "A form template plus routing rules and a short explanation of why each field exists."
  },
  {
    cat_slug: "legal-ops",
    title: "When to Involve Legal in Vendor Negotiations (Internal Comms)",
    description: "Draft a short communication outlining when and how business teams should involve Legal in vendor negotiations.",
    use_case: "Legal Department Operations & Leadership",
    inputs: ["triggers", "intake_link", "what_to_include", "tone"],
    steps: ["List triggers and intake link", "Define what to include", "Generate communication"],
    output_format: "Slack version + email version + quick checklist.",
    tags: ["legal-ops", "internal-comms", "vendors"],
    role: "a legal ops communications writer",
    context_inputs: [`Triggers: {{triggers}}`, `Intake link: {{intake_link}}`, `What to include: {{what_to_include}}`, `Tone: {{tone}}`],
    task:
      "Write a message that sets expectations for involving Legal early in vendor negotiations, and explains what happens when Legal is brought in late.",
    deliverable: "Two versions (Slack + email) plus a 6-bullet checklist."
  },
  {
    cat_slug: "legal-ops",
    title: "Legal Ops KPI Dashboard (Framework)",
    description: "Draft a simple KPI dashboard framework for contract volume, turnaround time, litigation, and spend.",
    use_case: "Legal Department Operations & Leadership",
    inputs: ["team_size", "tools_used", "stakeholders", "reporting_cadence"],
    steps: ["Describe team/tools", "Set cadence", "Generate KPI framework"],
    output_format: "Dashboard sections + metric definitions + data sources.",
    tags: ["legal-ops", "kpis", "reporting"],
    role: "a legal operations analyst",
    context_inputs: [`Team size: {{team_size}}`, `Tools used: {{tools_used}}`, `Stakeholders: {{stakeholders}}`, `Cadence: {{reporting_cadence}}`],
    task:
      "Propose a KPI dashboard framework with clear metric definitions, data sources, and how to interpret trends (not vanity metrics).",
    deliverable: "A KPI framework plus a minimal first dashboard (top 8 metrics)."
  },
  {
    cat_slug: "legal-ops",
    title: "Legal Department Relationship Playbook (Sales, Finance, HR)",
    description: "List strategies a legal department can use to improve relationships with key business teams.",
    use_case: "Legal Department Operations & Leadership",
    inputs: ["teams", "pain_points", "current_processes"],
    steps: ["List teams and pain points", "Describe processes", "Generate strategies + quick wins"],
    output_format: "Strategies + quick wins + meeting cadence suggestions.",
    tags: ["legal-ops", "stakeholders", "process"],
    role: "a legal ops advisor",
    context_inputs: [`Teams: {{teams}}`, `Pain points: {{pain_points}}`, `Current processes: {{current_processes}}`],
    task:
      "Generate strategies to improve collaboration: SLAs, intake hygiene, templates, office hours, playbooks, and escalation paths.",
    deliverable: "A prioritized list of quick wins and a 30-day relationship plan."
  },
  {
    cat_slug: "legal-ops",
    title: "Junior In-House Prioritization Guide (Workflow + Comms)",
    description: "Write a short guide for junior in-house lawyers on prioritizing and communicating with business leaders.",
    use_case: "Legal Department Operations & Leadership",
    inputs: ["company_context", "typical_request_types", "escalation_rules"],
    steps: ["Describe context and request types", "Define escalation rules", "Generate guide"],
    output_format: "Guide + example status update templates.",
    tags: ["legal-ops", "career", "communication"],
    role: "a legal ops mentor",
    context_inputs: [`Company context: {{company_context}}`, `Requests: {{typical_request_types}}`, `Escalation rules: {{escalation_rules}}`],
    task:
      "Write a practical guide on prioritizing legal requests, setting expectations, and communicating risks without blocking the business.",
    deliverable: "A short guide plus 3 reusable status update templates."
  },
  {
    cat_slug: "legal-ops",
    title: "How to Work With Legal (Business Team Guide)",
    description: "Draft a short guide for business teams on how to work effectively with Legal.",
    use_case: "Legal Department Operations & Leadership",
    inputs: ["intake_process", "sla", "what_to_include", "common_delays"],
    steps: ["Describe intake process and SLA", "List common delays", "Generate guide"],
    output_format: "Guide + checklist + FAQ.",
    tags: ["legal-ops", "internal-comms", "intake"],
    role: "a legal ops communications writer",
    context_inputs: [`Intake process: {{intake_process}}`, `SLA: {{sla}}`, `What to include: {{what_to_include}}`, `Common delays: {{common_delays}}`],
    task:
      "Write a business-friendly guide explaining how to submit good requests, what timelines look like, and how to avoid common delays.",
    deliverable: "A short guide + a checklist + FAQ."
  },
  {
    cat_slug: "legal-ops",
    title: "Quarterly Legal KPI Status Update (Exec Format)",
    description: "Write a quarterly status update format for reporting legal KPIs to the executive team.",
    use_case: "Legal Department Operations & Leadership",
    inputs: ["kpis", "wins", "risks", "asks"],
    steps: ["List KPIs/wins/risks/asks", "Generate exec update format"],
    output_format: "One-page update with sections and example language.",
    tags: ["legal-ops", "exec", "reporting"],
    role: "an executive update writer",
    context_inputs: [`KPIs: {{kpis}}`, `Wins: {{wins}}`, `Risks: {{risks}}`, `Asks: {{asks}}`],
    task:
      "Create a one-page quarterly update format that executives will actually read. Keep it outcomes-based and specific.",
    deliverable: "A reusable template plus example prompts for each section."
  },
  {
    cat_slug: "legal-ops",
    title: "Legal Project Tracker Template (Issue, Owner, Deadline, Status)",
    description: "Generate a simple legal project tracker template for managing requests and deadlines.",
    use_case: "Legal Department Operations & Leadership",
    inputs: ["workstreams", "status_values", "tools_used"],
    steps: ["List workstreams and status values", "Generate template + usage rules"],
    output_format: "Table template + definitions + weekly review cadence.",
    tags: ["legal-ops", "project-management", "templates"],
    role: "a legal operations project manager",
    context_inputs: [`Workstreams: {{workstreams}}`, `Status values: {{status_values}}`, `Tools used: {{tools_used}}`],
    task:
      "Create a project tracker template that captures the minimum required fields and supports weekly triage.",
    deliverable: "A table template plus a short set of operating rules."
  },
  {
    cat_slug: "legal-ops",
    title: "Onboarding Playbook Outline (New In-House Lawyer)",
    description: "Create a playbook outline for onboarding a new in-house lawyer: systems, team, workflows, and stakeholders.",
    use_case: "Legal Department Operations & Leadership",
    inputs: ["company_context", "systems", "stakeholders", "first_30_days_goals"],
    steps: ["Describe context and systems", "List stakeholders/goals", "Generate playbook outline"],
    output_format: "Onboarding outline: Week 1/2/3/4 with tasks and meetings.",
    tags: ["legal-ops", "onboarding", "playbook"],
    role: "a legal ops onboarding designer",
    context_inputs: [`Company context: {{company_context}}`, `Systems: {{systems}}`, `Stakeholders: {{stakeholders}}`, `30-day goals: {{first_30_days_goals}}`],
    task:
      "Design a 30-day onboarding outline that gets a new lawyer productive quickly without missing key systems and stakeholders.",
    deliverable: "A week-by-week plan with goals, meetings, and deliverables."
  },
  {
    cat_slug: "legal-ops",
    title: "Document Summary Template (Pleading, Policy, Contract, Article)",
    description: "Summarize a document into a reusable template: what it is, what it requires, and what to do next.",
    use_case: "Legal Department Operations & Leadership",
    inputs: ["document_text", "document_type", "audience", "decision_needed"],
    steps: ["Paste document text", "Set type/audience", "Generate summary + action items"],
    output_format: "Sections: TL;DR; Key points; Deadlines; Risks; Open questions; Recommended next steps.",
    tags: ["legal-ops", "summary", "templates"],
    role: "a legal operations assistant",
    context_inputs: [`Document type: {{document_type}}`, `Audience: {{audience}}`, `Decision needed: {{decision_needed}}`, "Document text:", "{{document_text}}"],
    task:
      "Summarize the document for the target audience. Focus on what it means operationally: obligations, deadlines, decision points, and risks.",
    deliverable: "A structured summary plus a clear next-steps list."
  }
];

function main() {
  const args = parseArgs(process.argv.slice(2));
  ensureDir(OUT_DIR);

  const defs = SPECS.map(mk);

  let written = 0;
  let skipped = 0;
  for (const def of defs) {
    const filePath = path.join(OUT_DIR, `${def.slug}.mdx`);
    if (!args.overwrite && exists(filePath)) {
      skipped += 1;
      continue;
    }
    fs.writeFileSync(filePath, toMdx(def), "utf8");
    written += 1;
  }

  console.log(
    JSON.stringify(
      {
        content_root: CONTENT_ROOT,
        out_dir: OUT_DIR,
        last_updated: TODAY_ISO,
        prompts_defined: defs.length,
        prompts_written: written,
        prompts_skipped_existing: skipped
      },
      null,
      2
    )
  );
}

main();
