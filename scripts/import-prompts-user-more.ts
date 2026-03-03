import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import matter from "gray-matter";
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
  source_sections: string[];
};

type ImportReport = {
  input_path: string;
  content_root: string;
  out_dir: string;
  packs_dir: string;
  lines_scanned: number;
  items_parsed: number;
  prompts_materialized: number;
  prompts_written: number;
  prompts_skipped_existing_title: number;
  prompts_skipped_existing_slug: number;
  prompts_merged_duplicates: number;
  slugs_collided: number;
  packs_written: number;
  by_category: Record<string, { prompts: number; written: number; merged: number }>;
  errors: { message: string; line?: number }[];
};

type RawItem = {
  section_path: string[];
  text: string;
  line: number;
};

type Cat = {
  cat: string; // used for slug prefix + pack slug
  use_case: string;
  base_tags: string[];
};

const ROOT = process.cwd();
const CONTENT_ROOT = process.env.CB_CONTENT_ROOT?.trim() ? process.env.CB_CONTENT_ROOT.trim() : "content";
const PROMPTS_DIR = path.join(ROOT, CONTENT_ROOT, "prompts");
const PACKS_DIR = path.join(ROOT, CONTENT_ROOT, "packs");
const OUT_DIR = PROMPTS_DIR;
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

function stableSuffix(input: string): string {
  return createHash("sha1").update(input).digest("hex").slice(0, 6);
}

function yamlList(items: string[]): string {
  if (!items.length) return "[]";
  return `\n${items.map((s) => `  - ${JSON.stringify(s)}`).join("\n")}`;
}

function normalizeKey(input: string): string {
  return input
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .replace(/\[.*?\]/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(starter|template|drafting|prompt|library|legal research|legal)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTrailingPunct(s: string): string {
  return s.trim().replace(/[.;:]+$/g, "").trim();
}

function cleanLine(raw: string): string {
  return raw.replace(/\u00a0/g, " ").trim();
}

function isCommentaryLine(line: string): boolean {
  const s = line.trim();
  if (!s) return true;
  const low = s.toLowerCase();
  if (low.startsWith("the above prompts")) return true;
  if (low.startsWith("as you can see")) return true;
  if (low.startsWith("you are an experienced")) return true;
  if (low.startsWith("step 1:")) return true;
  if (low.startsWith("step 2:")) return true;
  if (low.startsWith("step 3:")) return true;
  if (low.startsWith("step 4:")) return true;
  if (low.startsWith("step 5:")) return true;
  if (low.startsWith("thanks for reading")) return true;
  if (low.includes("@gmail.com")) return true;
  if (low === "subscribe") return true;
  if (low === "password") return true;
  return false;
}

function isHeaderLine(line: string): boolean {
  const s = stripTrailingPunct(cleanLine(line));
  if (!s) return false;
  if (s.length > 140) return false;
  // Most items end with ".", headers do not.
  if (/[.!?]$/.test(line.trim())) return false;
  // Headings in this source are typically plain text, sometimes ending with ":"
  if (/:$/.test(line.trim())) return true;
  if (/^prompts for\b/i.test(s)) return true;
  if (/^chatgpt prompts for\b/i.test(s)) return true;
  if (/^document drafting\b/i.test(s)) return true;
  if (/^drafting agreements\b/i.test(s)) return true;
  if (/^legal templates\b/i.test(s)) return true;
  return /^[A-Za-z0-9 &/+()'-]+$/.test(s);
}

function parseItems(text: string): { items: RawItem[]; lines_scanned: number } {
  const lines = text.split(/\r?\n/g);
  const items: RawItem[] = [];
  let section: string[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const lineNo = i + 1;
    const raw = lines[i] ?? "";
    const cleaned = cleanLine(raw);
    if (!cleaned) continue;
    if (cleaned === "{" || cleaned === "}") continue;
    if (isCommentaryLine(cleaned)) continue;

    // Strip basic list markers.
    const debullet = cleaned
      .replace(/^[-*]\s+/, "")
      .replace(/^\d+\.\s+/, "")
      .replace(/^\d+\)\s+/, "")
      .trim();
    if (!debullet) continue;

    if (isHeaderLine(debullet)) {
      const hdr = stripTrailingPunct(debullet.replace(/:$/, "").trim());
      if (!hdr) continue;

      // Keep at most 2 levels (section / subsection).
      if (/^prompts for\b/i.test(hdr) || /^chatgpt prompts for\b/i.test(hdr)) {
        section = [hdr];
      } else if (!section.length) {
        section = [hdr];
      } else {
        section = [section[0]!, hdr];
      }
      continue;
    }

    const itemText = stripTrailingPunct(debullet);
    if (!itemText) continue;
    items.push({ section_path: section.length ? section : ["General"], text: itemText, line: lineNo });
  }

  return { items, lines_scanned: lines.length };
}

function classify(section_path: string[]): Cat {
  const s = section_path.join(" / ").toLowerCase();
  const base = (cat: string, use_case: string, base_tags: string[]): Cat => ({ cat, use_case, base_tags });

  if (s.includes("prompts for legal research") || s.includes("legal research")) {
    return base("library-legal-research", "Legal Research", ["legal research"]);
  }
  if (s.includes("drafting legal documents") || s.includes("legal document drafting")) {
    return base("library-document-drafting", "Document Drafting", ["drafting"]);
  }

  if (s.includes("family lawyers") || s.includes("family law")) {
    return base("library-family-law", "Family Law", ["family law", "drafting"]);
  }
  if (s.includes("personal injury")) {
    return base("library-personal-injury", "Personal Injury", ["personal injury", "litigation", "drafting"]);
  }
  if (s.includes("employment and labor") || s.includes("employment")) {
    return base("library-employment-labor", "Employment and Labor", ["employment", "policies", "drafting"]);
  }
  if (s.includes("immigration")) {
    return base("library-immigration", "Immigration", ["immigration", "drafting"]);
  }
  if (s.includes("business lawyers") || s.includes("business law")) {
    return base("library-business-law", "Business Law", ["business", "contracts", "drafting"]);
  }
  if (s.includes("tax lawyers") || s.includes("tax law")) {
    return base("library-tax-law", "Tax Law", ["tax", "drafting"]);
  }
  if (s.includes("real estate")) {
    return base("library-real-estate", "Real Estate", ["real estate", "drafting"]);
  }
  if (s.includes("intellectual property") || /\bip\b/.test(s)) {
    return base("library-ip", "Intellectual Property", ["ip", "drafting"]);
  }
  if (s.includes("criminal defense")) {
    return base("library-criminal-defense", "Criminal Defense", ["criminal defense", "litigation", "drafting"]);
  }

  return base("library-misc", "General", ["drafting"]);
}

function extractBracketInputs(text: string): string[] {
  const matches = [...text.matchAll(/\[([^\]]+)\]/g)].map((m) => (m[1] ?? "").trim());
  const inputs = new Set<string>();
  for (const raw of matches) {
    let s = raw;
    s = s.split(",")[0] ?? s;
    s = s.split("e.g.")[0] ?? s;
    s = s.split("e.g")[0] ?? s;
    s = s.replace(/['"]/g, "").trim();
    if (!s) continue;
    const key = s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "");
    if (!key) continue;
    if (key.length < 2 || key.length > 40) continue;
    if (["e", "eg", "example"].includes(key)) continue;
    inputs.add(key);
    if (inputs.size >= 10) break;
  }
  return [...inputs];
}

function docArchetype(docName: string): "agreement" | "policy" | "letter" | "motion" | "petition" | "plan" | "memo" | "other" {
  const s = docName.toLowerCase();
  if (/\bpolicy\b/.test(s) || /\bhandbook\b/.test(s) || /\bcode of conduct\b/.test(s) || /\btraining program\b/.test(s)) return "policy";
  if (/\bletter\b/.test(s) || /\bnotice\b/.test(s) || /\bdemand\b/.test(s) || /\bcease and desist\b/.test(s)) return "letter";
  if (/\bmotion\b/.test(s) || /\bopposition\b/.test(s) || /\bbrief\b/.test(s) || /\bmemorandum of law\b/.test(s)) return "motion";
  if (/\bpetition\b/.test(s) || /\bapplication\b/.test(s) || /\bfiling\b/.test(s) || /\bnotice of\b/.test(s)) return "petition";
  if (/\bplan\b/.test(s) || /\bschedule\b/.test(s) || /\bchecklist\b/.test(s)) return "plan";
  if (/\bmemo\b/.test(s) || /\bstatus update\b/.test(s) || /\breport\b/.test(s) || /\bimpact analysis\b/.test(s)) return "memo";
  if (/\bagreement\b/.test(s) || /\bcontract\b/.test(s) || /\blease\b/.test(s) || /\bdeed\b/.test(s) || /\bterms of service\b/.test(s) || /\bterms of use\b/.test(s))
    return "agreement";
  return "other";
}

function expandAbbreviations(title: string): string {
  const replacements: Array<[RegExp, string]> = [
    [/\bNDA\b/g, "Non-Disclosure Agreement (NDA)"],
    [/\bSLA\b/g, "Service Level Agreement (SLA)"],
    [/\bMOU\b/g, "Memorandum of Understanding (MOU)"],
    [/\bQDRO\b/g, "Qualified Domestic Relations Order (QDRO)"],
    [/\bVAWA\b/g, "Violence Against Women Act (VAWA)"],
    [/\bDACA\b/g, "Deferred Action for Childhood Arrivals (DACA)"],
    [/\bGDPR\b/g, "GDPR"],
    [/\bCCPA\b/g, "CCPA"],
    [/\bCPRA\b/g, "CPRA"],
    [/\bEB-5\b/g, "EB-5"],
    [/\bH-1B\b/g, "H-1B"],
    [/\bO-1\b/g, "O-1"],
    [/\bL-1\b/g, "L-1"],
    [/\bE-2\b/g, "E-2"],
    [/\bTN\b/g, "TN"],
    [/\bNAFTA\b/g, "NAFTA"],
    [/\bCOPPA\b/g, "COPPA"],
    [/\bADA\b/g, "ADA"]
  ];
  let out = title;
  for (const [re, rep] of replacements) out = out.replace(re, rep);
  return out;
}

function bestEffortDocName(raw: string): { docName: string; scenario?: string; isMistakes: boolean } {
  const s = raw.trim();
  const low = s.toLowerCase();

  const isMistakes = /\b(mistakes to avoid|common mistakes)\b/.test(low);
  const withoutMistakes = s.replace(/\b(Common mistakes in|Mistakes to avoid in)\b/i, "").trim();

  const prefixes = [
    /^components of\s+/i,
    /^standard clauses for\s+/i,
    /^elements of\s+/i,
    /^elements for\s+/i,
    /^terms for\s+/i,
    /^provisions for\s+/i,
    /^template for\s+/i,
    /^clauses for\s+/i,
    /^inclusions for\s+/i,
    /^inclusions in\s+/i
  ];

  let base = withoutMistakes;
  for (const re of prefixes) base = base.replace(re, "");
  base = base.trim();

  // Split "X: Y" into name + scenario.
  let docName = base;
  let scenario: string | undefined;
  const colonIdx = base.indexOf(":");
  if (colonIdx >= 0) {
    docName = base.slice(0, colonIdx).trim();
    scenario = base.slice(colonIdx + 1).trim();
  }

  // Split "X for Y" into name + scenario, but avoid "for" inside known constructs.
  const mFor = /^(.*)\s+for\s+(.+)$/.exec(docName);
  if (mFor && mFor[1] && mFor[2] && !/\b(power of attorney|letter of intent)\b/i.test(docName)) {
    docName = mFor[1].trim();
    scenario = scenario ?? mFor[2].trim();
  }

  // Normalize a couple of overly specific examples.
  docName = docName.replace(/\bLast Will and Testament for John Doe\b/i, "Last Will and Testament").trim();

  // Avoid "Draft a a/an/the ..." titles.
  docName = docName.replace(/^(a|an|the)\s+/i, "").trim();

  docName = expandAbbreviations(docName);
  scenario = scenario ? stripTrailingPunct(scenario) : undefined;

  return { docName: stripTrailingPunct(docName), scenario, isMistakes };
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
    "- If you are unsure, ask targeted clarifying questions before you draft.",
    "- Do not provide legal advice. Provide drafting, risk-spotting, and research support only.",
    "- Be explicit about what is fact vs. assumption vs. recommendation.",
    ...guard.map((g) => `- ${g}`)
  ].join("\n");
}

function draftingTemplate(args: {
  docName: string;
  archetype: ReturnType<typeof docArchetype>;
  scenarioHints: string[];
  use_case: string;
  tags: string[];
  source_sections: string[];
}): Omit<PromptDef, "slug"> {
  const inputs = [
    "jurisdiction",
    "parties",
    "facts_and_context",
    "business_goal",
    "must_have_terms",
    "constraints_or_red_lines"
  ];

  const archetypeNotes: Record<ReturnType<typeof docArchetype>, string> = {
    agreement:
      "Include: parties; purpose; definitions; term/termination; payment/fees (if applicable); confidentiality; IP; liability/indemnity; dispute resolution; assignment; notices; signature blocks.",
    policy:
      "Include: purpose; scope; definitions; policy rules; exceptions; procedures; reporting/escalation; enforcement; training; effective date; versioning; owner.",
    letter:
      "Include: sender/recipient; subject; facts; legal basis at a high level; ask/demand; deadline; reservation of rights; attachments; tone guidance.",
    motion:
      "Include: caption placeholders; relief requested; background; legal standard (state as 'verify for jurisdiction'); argument headings; requested order; exhibits checklist.",
    petition:
      "Include: caption placeholders; requested relief; statutory/regulatory basis (verify); eligibility elements; facts; exhibits checklist; declarations; filing notes.",
    plan:
      "Include: objective; scope; checklist; owners; timelines; decision points; fallback options; risks; communications plan.",
    memo:
      "Include: question; short answer; background; analysis (clearly scoped); options; risks; recommendation; open questions.",
    other:
      "Include: a clear structure, assumptions, and a checklist of what to verify in your jurisdiction."
  };

  const scenarioLine =
    args.scenarioHints.length > 0 ? `Scenario hints: ${args.scenarioHints.slice(0, 3).join(" | ")}.` : "Scenario: (Describe the scenario in the inputs.)";

  const title = `Draft a ${args.docName} (Starter Template)`;
  const description = `Draft a ${args.docName} with a clear structure, questions-to-ask first, and a pitfalls checklist.`;

  const task = [
    `Draft a ${args.docName} tailored to the provided context.`,
    scenarioLine,
    "",
    "Before drafting, ask up to 8 clarifying questions if any key inputs are missing (jurisdiction, parties, timing, money, data, IP, termination, confidentiality).",
    "",
    "Then draft the document and include a short 'pitfalls / mistakes to avoid' section relevant to this document type."
  ].join("\n");

  const deliverable = [
    "Return in this order:",
    "1) Clarifying questions (if needed, otherwise write: 'No questions.')",
    "2) One-paragraph plain-English summary of what the document does",
    `3) Draft document text (${args.archetype})`,
    "4) Key choices and negotiation notes (bullets)",
    "5) Pitfalls / mistakes to avoid (bullets)",
    "6) Checklist of attachments/exhibits (if applicable)"
  ].join("\n");

  const prompt = promptWrapper({
    role: "a careful legal drafting assistant for a busy legal team",
    context_inputs: [
      `Document: ${args.docName}`,
      `Jurisdiction: {{jurisdiction}}`,
      `Parties: {{parties}}`,
      `Facts/context: {{facts_and_context}}`,
      `Business goal: {{business_goal}}`,
      `Must-have terms: {{must_have_terms}}`,
      `Constraints / red lines: {{constraints_or_red_lines}}`,
      archetypeNotes[args.archetype] ?? archetypeNotes.other
    ],
    task,
    deliverable,
    guardrails: [
      "If jurisdiction-specific law is required, label it 'Verify in jurisdiction' and provide a verification plan instead of guessing.",
      "Use placeholders like [Company], [Counterparty], [Effective Date] where needed."
    ]
  });

  const output_format = "Sections: Questions; Summary; Draft; Negotiation notes; Pitfalls; Attachments checklist.";
  const steps = ["Fill in the inputs", "Answer clarifying questions", "Review the draft for missing business terms", "Verify jurisdiction-specific requirements"];
  const tags = [...new Set([...args.tags, ...args.source_sections, "starter template"])].slice(0, 14);

  return {
    title,
    description,
    use_case: args.use_case,
    inputs,
    steps,
    output_format,
    tags,
    prompt,
    source_sections: args.source_sections
  };
}

function researchTemplate(args: {
  titleRaw: string;
  use_case: string;
  tags: string[];
  source_sections: string[];
}): Omit<PromptDef, "slug"> {
  const bracketInputs = extractBracketInputs(args.titleRaw);
  const inputs = [
    ...new Set<string>([
      ...bracketInputs,
      "jurisdiction",
      "time_window",
      "facts_or_context",
      "audience",
      "preferred_sources"
    ])
  ].slice(0, 12);

  const title = expandAbbreviations(`Legal Research: ${stripTrailingPunct(args.titleRaw)}`);
  const description = `A research prompt to answer: "${stripTrailingPunct(args.titleRaw)}" with a verification-first approach.`;

  const task = [
    `Answer the question: "${stripTrailingPunct(args.titleRaw)}".`,
    "",
    "First, ask up to 5 clarifying questions if the issue is ambiguous (jurisdiction, timeframe, facts, standard of review, posture).",
    "",
    "Then provide a concise, structured research memo. If you cite authorities, label them as 'Verify' unless you were given exact citations as input.",
    "",
    "Do not fabricate case names, statute numbers, quotes, or pinpoint citations. If you don't have primary-source support, say so."
  ].join("\n");

  const deliverable = [
    "Return in this order:",
    "1) Clarifying questions (if needed, otherwise 'No questions.')",
    "2) Short answer (3-6 bullets)",
    "3) Analysis (clearly scoped to jurisdiction/time window provided)",
    "4) What to verify next (primary sources checklist)",
    "5) Practical implications / risks (bullets)"
  ].join("\n");

  const prompt = promptWrapper({
    role: "a legal research assistant (not a lawyer) supporting a legal team",
    context_inputs: [
      `Jurisdiction: {{jurisdiction}}`,
      `Time window: {{time_window}} (e.g., 'last 12 months')`,
      `Facts/context: {{facts_or_context}}`,
      `Audience: {{audience}} (e.g., 'partner', 'GC', 'paralegal')`,
      `Preferred sources: {{preferred_sources}} (e.g., statutes, regulations, official agency guidance, case law)`
    ],
    task,
    deliverable,
    guardrails: [
      "If you are missing primary sources, provide a verification plan and do not guess citations.",
      "Keep it concise. Use headings and bullets."
    ]
  });

  const output_format = "Memo: short answer; analysis; verification checklist; implications.";
  const steps = ["Provide jurisdiction + facts", "Answer clarifying questions", "Review memo scope", "Verify with primary sources"];
  const tags = [...new Set([...args.tags, ...args.source_sections, "research"])].slice(0, 14);

  return {
    title,
    description,
    use_case: args.use_case,
    inputs,
    steps,
    output_format,
    tags,
    prompt,
    source_sections: args.source_sections
  };
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
    "- Mark assumptions explicitly and separate: facts vs. analysis vs. recommendations.",
    "- If you mention jurisdiction-specific rules, label them as 'Verify in jurisdiction' unless the user provided exact citations.",
    "",
    "## Confidentiality",
    "Do not paste privileged, confidential, or regulated data into third-party tools unless your policy permits it.",
    ""
  ].join("\n");

  return `${fm}\n`;
}

function listPromptFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx") && !f.startsWith("."))
    .sort((a, b) => a.localeCompare(b));
}

function readExistingTitleKeys(): Set<string> {
  const keys = new Set<string>();
  for (const f of listPromptFiles(PROMPTS_DIR)) {
    const full = path.join(PROMPTS_DIR, f);
    let raw = "";
    try {
      raw = fs.readFileSync(full, "utf8");
    } catch {
      continue;
    }
    try {
      const parsed = matter(raw);
      const title = typeof parsed.data?.title === "string" ? parsed.data.title : "";
      if (title) keys.add(normalizeKey(title));
    } catch {
      // ignore frontmatter parse errors for this purpose
    }
  }
  return keys;
}

function writeJson(filePath: string, value: unknown) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function parseArgs(argv: string[]) {
  const out: { input?: string; overwrite: boolean; limit?: number } = { overwrite: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i] ?? "";
    if (a === "--overwrite") out.overwrite = true;
    if (a === "--input") out.input = argv[i + 1];
    if (a === "--limit") {
      const n = Number(argv[i + 1]);
      if (Number.isFinite(n) && n > 0) out.limit = Math.floor(n);
    }
  }
  return out;
}

function defaultInputPath(): string {
  const p = path.join(ROOT, "data", "prompt_sources", "user-more-prompts-2026-03-03.txt");
  return p;
}

function packMeta(cat: string): { title: string; description: string; workflow_stage: string } {
  const map: Record<string, { title: string; description: string; workflow_stage: string }> = {
    "library-legal-research": {
      title: "Library: Legal Research Starters",
      description: "Quick research prompts for definitions, standards, comparisons, and jurisdiction-scoped summaries.",
      workflow_stage: "research"
    },
    "library-document-drafting": {
      title: "Library: Document Drafting Templates",
      description: "Starter templates for agreements, letters, policies, and operating documents.",
      workflow_stage: "draft"
    },
    "library-family-law": {
      title: "Library: Family Law Drafting",
      description: "Family law drafting starters: custody, support, adoption, and related filings and agreements.",
      workflow_stage: "draft"
    },
    "library-personal-injury": {
      title: "Library: Personal Injury Litigation Starters",
      description: "PI litigation drafting starters: demands, discovery, motions, mediation, and trial docs.",
      workflow_stage: "disputes"
    },
    "library-employment-labor": {
      title: "Library: Employment and Labor Templates",
      description: "Employment templates and policy starters: onboarding, termination, compliance, and HR policies.",
      workflow_stage: "employment"
    },
    "library-immigration": {
      title: "Library: Immigration Filings and Support",
      description: "Immigration drafting starters: petitions, waivers, cover letters, and hearing support docs.",
      workflow_stage: "filing"
    },
    "library-business-law": {
      title: "Library: Business Law Templates",
      description: "Business law drafting starters: contracts, corporate docs, and deal support templates.",
      workflow_stage: "review"
    },
    "library-tax-law": {
      title: "Library: Tax and Transaction Templates",
      description: "Tax-adjacent drafting starters: transaction docs and supporting legal templates.",
      workflow_stage: "draft"
    },
    "library-real-estate": {
      title: "Library: Real Estate Drafting Starters",
      description: "Real estate drafting starters: leases, deeds, purchase agreements, and closing docs.",
      workflow_stage: "transaction"
    },
    "library-ip": {
      title: "Library: IP and Technology Drafting",
      description: "IP drafting starters: licensing, assignments, enforcement letters, and due diligence templates.",
      workflow_stage: "ip"
    },
    "library-criminal-defense": {
      title: "Library: Criminal Defense Drafting Starters",
      description: "Criminal defense drafting starters: motions, notices, sentencing memos, and trial documents.",
      workflow_stage: "disputes"
    },
    "library-misc": {
      title: "Library: Miscellaneous Starters",
      description: "Miscellaneous legal drafting and research starters not yet grouped elsewhere.",
      workflow_stage: "general"
    }
  };
  return map[cat] ?? map["library-misc"]!;
}

function writePack(cat: string, prompt_slugs: string[], overwrite: boolean): boolean {
  const meta = packMeta(cat);
  const packSlug = cat;
  const filePath = path.join(PACKS_DIR, `${packSlug}.json`);
  if (!overwrite && fs.existsSync(filePath)) return false;
  const pack = {
    slug: packSlug,
    title: meta.title,
    description: meta.description,
    prompt_slugs,
    audience: "legal",
    workflow_stage: meta.workflow_stage,
    seo: { title: meta.title, description: meta.description },
    last_updated: TODAY_ISO
  };
  ensureDir(PACKS_DIR);
  writeJson(filePath, pack);
  return true;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const inputPath = path.resolve(args.input?.trim() ? args.input.trim() : defaultInputPath());

  const report: ImportReport = {
    input_path: inputPath,
    content_root: CONTENT_ROOT,
    out_dir: OUT_DIR,
    packs_dir: PACKS_DIR,
    lines_scanned: 0,
    items_parsed: 0,
    prompts_materialized: 0,
    prompts_written: 0,
    prompts_skipped_existing_title: 0,
    prompts_skipped_existing_slug: 0,
    prompts_merged_duplicates: 0,
    slugs_collided: 0,
    packs_written: 0,
    by_category: {},
    errors: []
  };

  ensureDir(OUT_DIR);
  ensureDir(path.join(ROOT, "out"));

  if (!exists(inputPath)) {
    report.errors.push({ message: `Input not found: ${inputPath}` });
    writeJson(path.join(ROOT, "out", "import-prompts-user-more-report.json"), report);
    console.error(report.errors[0]?.message);
    process.exit(1);
  }

  const raw = fs.readFileSync(inputPath, "utf8");
  const parsed = parseItems(raw);
  report.lines_scanned = parsed.lines_scanned;
  const items = args.limit ? parsed.items.slice(0, args.limit) : parsed.items;
  report.items_parsed = items.length;

  const existingTitleKeys = readExistingTitleKeys();

  // Merge duplicates into one prompt per normalized key.
  const merged = new Map<string, Omit<PromptDef, "slug"> & { key: string; cat: string; scenarioHints: string[] }>();
  const mergedCountByCat = new Map<string, number>();

  for (const it of items) {
    try {
      const cat = classify(it.section_path);
      const sec = it.section_path.join(" / ");

      const looksResearch = cat.cat === "library-legal-research";
      if (looksResearch) {
        const key = `research:${normalizeKey(it.text)}`;
        const def = researchTemplate({
          titleRaw: it.text,
          use_case: cat.use_case,
          tags: [...new Set([...cat.base_tags])],
          source_sections: [sec]
        });

        const existing = merged.get(key);
        if (!existing) {
          merged.set(key, { ...def, key, cat: cat.cat, scenarioHints: [] });
        } else {
          report.prompts_merged_duplicates += 1;
          existing.tags = [...new Set([...existing.tags, ...def.tags])].slice(0, 14);
          existing.source_sections = [...new Set([...existing.source_sections, sec])];
        }
        continue;
      }

      // Drafting-style prompt
      const doc = bestEffortDocName(it.text);
      const archetype = docArchetype(doc.docName);
      const keyBase = normalizeKey(doc.docName);
      const key = `draft:${keyBase}`;
      const scenarioHints = [doc.scenario].filter(Boolean) as string[];

      const def = draftingTemplate({
        docName: doc.docName,
        archetype,
        scenarioHints,
        use_case: cat.use_case,
        tags: [...new Set([...cat.base_tags, archetype])],
        source_sections: [sec]
      });

      const existing = merged.get(key);
      if (!existing) {
        merged.set(key, { ...def, key, cat: cat.cat, scenarioHints });
      } else {
        report.prompts_merged_duplicates += 1;
        const cur = mergedCountByCat.get(cat.cat) ?? 0;
        mergedCountByCat.set(cat.cat, cur + 1);
        existing.tags = [...new Set([...existing.tags, ...def.tags])].slice(0, 14);
        existing.source_sections = [...new Set([...existing.source_sections, sec])];
        existing.scenarioHints = [...new Set([...existing.scenarioHints, ...scenarioHints])].slice(0, 6);

        // Prefer a more specific doc name if we previously had a very short one.
        if (existing.title.length < def.title.length) {
          existing.title = def.title;
          existing.description = def.description;
          existing.use_case = def.use_case;
          existing.inputs = def.inputs;
          existing.steps = def.steps;
          existing.output_format = def.output_format;
          existing.prompt = def.prompt;
        }
      }
    } catch (e) {
      report.errors.push({ message: (e as Error).message, line: it.line });
    }
  }

  report.prompts_materialized = merged.size;

  const byCatSlugs = new Map<string, string[]>();

  for (const m of merged.values()) {
    const titleKey = normalizeKey(m.title);
    if (existingTitleKeys.has(titleKey) && !args.overwrite) {
      report.prompts_skipped_existing_title += 1;
      continue;
    }

    const slugBase = slugify(m.title.replace(/^Legal Research:\s*/i, ""));
    const slugPrefix = m.cat;
    const slug = `${slugPrefix}-${slugBase}`;

    let outPath = path.join(OUT_DIR, `${slug}.mdx`);
    if (exists(outPath) && !args.overwrite) {
      report.slugs_collided += 1;
      const suff = stableSuffix(`${m.key}|${slug}|${m.source_sections.join("|")}`);
      outPath = path.join(OUT_DIR, `${slug}-${suff}.mdx`);
    }

    if (exists(outPath) && !args.overwrite) {
      report.prompts_skipped_existing_slug += 1;
      continue;
    }

    const def: PromptDef = { slug: path.basename(outPath, ".mdx"), ...m };
    fs.writeFileSync(outPath, toMdx(def), "utf8");
    report.prompts_written += 1;

    const arr = byCatSlugs.get(m.cat) ?? [];
    arr.push(def.slug);
    byCatSlugs.set(m.cat, arr);

    // Update dedupe set so we don't write the same title twice in one run.
    existingTitleKeys.add(titleKey);
  }

  // Packs: one per category we touched.
  for (const [cat, slugs] of byCatSlugs.entries()) {
    slugs.sort((a, b) => a.localeCompare(b));
    const wrote = writePack(cat, slugs, true /* overwrite packs for stability */);
    if (wrote) report.packs_written += 1;
  }

  for (const [cat, slugs] of byCatSlugs.entries()) {
    report.by_category[cat] = {
      prompts: (report.by_category[cat]?.prompts ?? 0) + slugs.length,
      written: (report.by_category[cat]?.written ?? 0) + slugs.length,
      merged: mergedCountByCat.get(cat) ?? 0
    };
  }

  writeJson(path.join(ROOT, "out", "import-prompts-user-more-report.json"), report);
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
