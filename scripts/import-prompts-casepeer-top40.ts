import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { slugify } from "../lib/slug";

type ParsedEntry = {
  section: string;
  useCase: string;
  prompt: string;
};

type ImportReport = {
  pdf_path: string;
  source_url: string;
  content_root: string;
  out_dir: string;
  prompts_parsed: number;
  prompts_written: number;
  prompts_skipped_existing: number;
  slugs_collided: number;
  pack_written: boolean;
  pack_path?: string;
  errors: { message: string }[];
  slugs_created: string[];
};

const ROOT = process.cwd();
const CONTENT_ROOT = process.env.CB_CONTENT_ROOT?.trim() ? process.env.CB_CONTENT_ROOT.trim() : "content";
const OUT_DIR = path.join(ROOT, CONTENT_ROOT, "prompts");
const PACK_DIR = path.join(ROOT, CONTENT_ROOT, "packs");

const SOURCE_URL = "https://www.casepeer.com/blog/chatgpt-prompts-for-lawyers/";
const DEFAULT_PDF = "/Users/philipprimmler/Downloads/Legal Prompts/Top 40 ChatGPT Prompts for Lawyers to Boost Productivity.pdf";

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

function normalizeSpaces(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function isNoiseLine(raw: string): boolean {
  const s = raw.trim();
  // Keep blank lines as separators for parsing.
  if (!s) return false;
  if (s.includes(SOURCE_URL)) return true;
  if (/^Top 40 ChatGPT Prompts for Lawyers/i.test(s)) return true;
  if (/^\d{1,2}\/\d{1,2}\/\d{2},\s*\d{1,2}:\d{2}\s*[AP]M/i.test(s)) return true;
  if (/^IN LEGAL TECHNOLOGY/i.test(s)) return true;
  if (/^WRITTEN BY/i.test(s)) return true;
  if (/^Justin Fisher/i.test(s)) return true;
  if (/^Last Updated:/i.test(s)) return true;
  if (/^\d+\/\d+\s*$/.test(s)) return true;
  if (/^Table of contents/i.test(s)) return true;
  if (/^The Power of ChatGPT/i.test(s)) return true;
  if (/^Essential Tips/i.test(s)) return true;
  if (/^Beyond ChatGPT/i.test(s)) return true;
  if (/^CASEpeer IQ/i.test(s)) return true;
  if (/^Use Case$/i.test(s)) return true;
  if (/^Prompt$/i.test(s)) return true;
  return false;
}

function isSectionHeading(raw: string): boolean {
  const s = raw.trim();
  if (!s) return false;
  if (/^Prompt (for|to)\b/i.test(s)) return false;
  if (!/Prompts$/i.test(s)) return false;
  // Avoid matching the article title line which contains "Prompts for Lawyers..."
  if (/Top 40 ChatGPT Prompts/i.test(s)) return false;
  if (/ChatGPT Prompts for Lawyer Productivity/i.test(s)) return false;
  return true;
}

function isUseCaseStart(raw: string): boolean {
  return /^Prompt (for|to|example for)\b/i.test(raw.trim());
}

function looksLikePromptLine(s: string): boolean {
  const t = s.trim();
  if (!t) return false;
  if (/^Prompt (for|to)\b/i.test(t)) return false;
  if (/^https?:\/\//i.test(t)) return false;
  return /^(Analyze|Assess|Compare|Create|Draft|Evaluate|Explain|Generate|Identify|List|Outline|Provide|Research|Summarize|Suggest|Write|Compose)\b/i.test(
    t
  );
}

function extractTitleFromPrompt(prompt: string): string {
  const t = normalizeSpaces(prompt);
  const m = /^(Generate|Draft|Summarize|Create|Write|Compose|Provide|Outline|List|Explain|Identify|Suggest)\s+(an?|the)?\s*([^.]*)/i.exec(
    t
  );
  if (!m) return "";
  let rest = (m[3] ?? "").trim();
  if (!rest) return "";
  // Prefer cutting before "for ..." or "to ..." to keep titles short.
  rest = rest.replace(/,.+$/i, "").trim();
  rest = rest.replace(/\s+(for|to)\s+.+$/i, "").trim();
  rest = rest.replace(/\s+highlighting\s+.+$/i, "").trim();
  rest = rest.replace(/\s+regarding\s+.+$/i, "").trim();
  rest = rest.replace(/\s+about\s+.+$/i, "").trim();
  rest = rest.replace(/\s+on\s+.+$/i, "").trim();
  // Remove bracketed placeholders.
  rest = rest.replace(/\[[^\]]+\]/g, "").trim();
  // Keep a sane length.
  if (rest.length > 70) rest = rest.slice(0, 70).trim();
  // Title-case-ish without being fancy.
  return rest
    .split(/\s+/g)
    .map((w) => (w.length <= 2 ? w.toLowerCase() : w[0]!.toUpperCase() + w.slice(1)))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function deriveBeginnerTitle(entry: ParsedEntry): string {
  const p = normalizeSpaces(entry.prompt);
  const low = p.toLowerCase();

  // Hand-tuned titles for common patterns in the PDF (short, beginner-friendly).
  if (low.includes("client intake questionnaire")) return "Client Intake Questionnaire";
  if (low.startsWith("analyze the legal precedents")) return "Supporting Case Law Finder";
  if (low.startsWith("compare and contrast")) return "Compare Two Legal Theories";
  if (low.startsWith("summarize the key provisions")) return "Regulation Key Provisions Summary";
  if (low.startsWith("identify potential legal challenges")) return "Counterarguments & Risks Checklist";
  if (low.startsWith("research the legal standards")) return "Legal Standard Research Brief";
  if (low.startsWith("analyze the strengths and weaknesses")) return "Strengths and Weaknesses Analysis";
  if (low.startsWith("provide an overview of the legislative history")) return "Legislative History Overview";
  if (low.startsWith("research the expert qualifications")) return "Expert Witness Qualification Checklist";
  if (low.startsWith("identify relevant legal journals")) return "Legal Journal Sources List";
  if (low.startsWith("summarize recent developments")) return "Recent Case Law Update Summary";

  if (low.startsWith("draft a") && low.includes("agreement between")) return "Contract Draft Starter";
  if (low.startsWith("generate a demand letter")) return "Demand Letter Draft";
  if (low.startsWith("create a legal template")) return "Reusable Legal Document Template";
  if (low.startsWith("prepare a motion") || low.startsWith("draft a motion") || low.startsWith("generate a motion") || low.startsWith("motion")) return "Motion Draft Starter";
  if (low.startsWith("generate a client welcome letter")) return "Client Welcome Letter";
  if (low.startsWith("draft an informative email")) return "Client Process Explanation Email";
  if (low.startsWith("summarize the key details")) return "Plain-Language Case Summary";
  if (low.startsWith("create a faq")) return "Client FAQ Document";
  if (low.startsWith("draft a clear explanation")) return "Plain-Language Legal Concept Explanation";
  if (low.startsWith("write a follow-up email")) return "Client Concern Follow-up Email";
  if (low.startsWith("summarize the potential outcomes")) return "Client Outcomes & Risks Summary";
  if (low.startsWith("compose a thank-you note")) return "Client Thank-You Note";
  if (low.startsWith("generate a client satisfaction survey")) return "Client Satisfaction Survey";
  if (low.startsWith("compose a persuasive closing argument")) return "Closing Argument Draft";
  if (low.startsWith("generate a script for a presentation")) return "Legal Presentation Script";
  if (low.startsWith("generate 10 blog topic ideas")) return "Legal Blog Topic Ideas";

  if (low.includes("non-disclosure agreement") || low.includes("nda")) return "Non-Disclosure Agreement (NDA) Draft";
  if (low.includes("cease-and-desist") || low.includes("cease and desist")) return "Cease and Desist Letter Draft";
  if (low.includes("legal memorandum")) return "Legal Memorandum Draft";
  if (low.includes("settlement agreement")) return "Settlement Agreement Draft";
  if (low.includes("opening statement")) return "Opening Statement Draft";
  if (low.includes("legal brief")) return "Legal Brief Draft";
  if (low.includes("client update letter")) return "Client Update Letter Draft";
  if (low.includes("letter to the editor")) return "Letter to the Editor (Legal Issue)";
  if (low.includes("welcome letter")) return "Client Welcome Letter";

  const fromPrompt = extractTitleFromPrompt(p);
  if (fromPrompt && !["Template", "Letter", "Motion", "Script"].includes(fromPrompt)) return fromPrompt;
  const uc = normalizeSpaces(entry.useCase).replace(/^Prompt (for|to)\s+/i, "");
  const short = uc.length > 70 ? `${uc.slice(0, 67).trim()}...` : uc;
  return short ? short[0]!.toUpperCase() + short.slice(1) : "Legal Prompt Template";
}

function deriveTags(section: string, prompt: string): string[] {
  const tags = new Set<string>(["Productivity", "Templates", "Casepeer-inspired", section]);
  const low = `${section} ${prompt}`.toLowerCase();
  const addIf = (needle: string, tag: string) => {
    if (low.includes(needle)) tags.add(tag);
  };
  addIf("intake", "intake");
  addIf("questionnaire", "intake");
  addIf("contract", "contracts");
  addIf("nda", "contracts");
  addIf("demand letter", "drafting");
  addIf("motion", "litigation");
  addIf("settlement", "negotiation");
  addIf("will", "estate planning");
  addIf("expert", "experts");
  addIf("research", "legal research");
  addIf("citation", "citations");
  addIf("blog", "marketing");
  addIf("presentation", "marketing");
  addIf("client", "client comms");
  return [...tags].slice(0, 14);
}

function rewritePrompt(entry: ParsedEntry): { prompt: string; inputs: string[]; outputFormat: string; steps: string[] } {
  // Rewrite to avoid copying verbatim and to make the templates higher-signal.
  const section = entry.section;
  const baseInputs = new Set<string>(["jurisdiction", "matter_type", "audience"]);

  const original = normalizeSpaces(entry.prompt);
  const hasCaseFacts = /\[case facts\]/i.test(original) || /\[case\]/i.test(original);
  if (hasCaseFacts) baseInputs.add("case_facts");
  if (/\[legal concept\]/i.test(original) || /\[legal issue\]/i.test(original)) baseInputs.add("topic");
  if (/\[publication\]/i.test(original)) baseInputs.add("publication");
  if (/\[type of legal case\]/i.test(original)) baseInputs.add("case_type");
  if (/\[legal strategy\]/i.test(original)) baseInputs.add("strategy");
  if (/\[legal procedure\]/i.test(original)) baseInputs.add("procedure");

  const inputs = [...baseInputs].slice(0, 10);

  const steps = [
    "Restate assumptions and ask for missing facts.",
    "Draft the output using plain language and structured sections.",
    "List risks, ambiguities, and what to verify before using."
  ];

  const outputFormat =
    section.toLowerCase().includes("intake") || /questionnaire/i.test(original)
      ? "A numbered questionnaire + a short checklist of follow-ups."
      : "A structured draft with headings + a short verification checklist.";

  const rewritten = [
    "You are a legal drafting assistant. Do not provide legal advice. If key facts are missing, ask up to 5 clarifying questions first.",
    "",
    `Context:`,
    `- Jurisdiction: {{jurisdiction}}`,
    `- Matter type: {{matter_type}}`,
    `- Intended reader: {{audience}}`,
    "",
    `Task:`,
    `- ${original.replace(/\[[^\]]+\]/g, "{{...}}")}`,
    "",
    "Requirements:",
    "- Use plain, client-friendly language unless the user requests formal legalese.",
    "- Avoid inventing citations, statutes, deadlines, or legal standards.",
    "- Flag any statements that depend on jurisdiction-specific rules.",
    "",
    "Output:",
    `- Provide the deliverable.`,
    "- Then add a short section titled \"What to Verify\" with 5-10 bullets.",
    ""
  ].join("\n");

  return { prompt: rewritten.trim(), inputs, outputFormat, steps };
}

function toMdx(params: {
  title: string;
  description: string;
  use_case: string;
  inputs: string[];
  steps: string[];
  output_format: string;
  tags: string[];
  prompt: string;
  source_url: string;
  last_updated_iso: string;
}): string {
  return [
    "---",
    `title: ${JSON.stringify(params.title)}`,
    `description: ${JSON.stringify(params.description)}`,
    `use_case: ${JSON.stringify(params.use_case)}`,
    `inputs:${yamlList(params.inputs)}`,
    `steps:${yamlList(params.steps)}`,
    `output_format: ${JSON.stringify(params.output_format)}`,
    `tags:${yamlList(params.tags)}`,
    `last_updated: ${JSON.stringify(params.last_updated_iso)}`,
    "---",
    "",
    "## Prompt",
    "```text",
    params.prompt.trim(),
    "```",
    "",
    "## Source",
    `- Inspired by: ${params.source_url}`,
    "- Note: This template is rewritten (not copied verbatim) for Counterbench.",
    ""
  ].join("\n");
}

function parseArgs(argv: string[]) {
  const out: { pdf?: string; overwrite: boolean; pack: boolean } = { overwrite: false, pack: true };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i] ?? "";
    if (a === "--overwrite") out.overwrite = true;
    if (a === "--no-pack") out.pack = false;
    if (a === "--pdf") out.pdf = argv[i + 1];
  }
  return out;
}

function parsePdf(pdfPath: string): ParsedEntry[] {
  const text = execFileSync("pdftotext", ["-layout", pdfPath, "-"], { encoding: "utf8" });
  const rawLines = text.replace(/\r/g, "").replace(/\f/g, "\n").split("\n");

  // Drop only non-empty noise lines; keep blanks for block boundaries.
  const lines = rawLines.filter((l) => !(l.trim() && isNoiseLine(l)));

  const out: ParsedEntry[] = [];
  let section = "Lawyer Productivity";
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? "";
    const trimmed = line.trim();

    if (isSectionHeading(trimmed)) {
      section = normalizeSpaces(trimmed.replace(/Prompts$/i, "").trim());
      if (!section) section = "Lawyer Productivity";
      i += 1;
      continue;
    }

    if (!isUseCaseStart(trimmed)) {
      i += 1;
      continue;
    }

    // Collect use case block until first blank separator.
    const useCaseParts: string[] = [trimmed];
    i += 1;
    while (i < lines.length) {
      const l = (lines[i] ?? "").trim();
      if (!l) break;
      if (l === "Use Case" || l === "Prompt") {
        i += 1;
        continue;
      }
      if (isSectionHeading(l) || isUseCaseStart(l)) break;
      useCaseParts.push(l);
      i += 1;
    }

    // Skip blank lines
    while (i < lines.length && !(lines[i] ?? "").trim()) i += 1;

    // Collect prompt block until blank separator or next use case.
    const promptParts: string[] = [];
    while (i < lines.length) {
      const l = (lines[i] ?? "").trim();
      if (!l) break;
      if (l === "Use Case" || l === "Prompt") {
        i += 1;
        continue;
      }
      if (isSectionHeading(l) || isUseCaseStart(l)) break;
      promptParts.push(l);
      i += 1;
    }

    const useCase = normalizeSpaces(useCaseParts.join(" "));
    const prompt = normalizeSpaces(promptParts.join(" "));
    if (useCase && prompt) out.push({ section, useCase, prompt });

    // Move past blank lines
    while (i < lines.length && !(lines[i] ?? "").trim()) i += 1;
  }

  return out;
}

function writePack(packSlug: string, title: string, description: string, promptSlugs: string[], todayIso: string) {
  ensureDir(PACK_DIR);
  const outPath = path.join(PACK_DIR, `${packSlug}.json`);
  const value = {
    slug: packSlug,
    title,
    description,
    prompt_slugs: promptSlugs,
    audience: "legal",
    workflow_stage: "general",
    seo: {
      title,
      description
    },
    last_updated: todayIso
  };
  fs.writeFileSync(outPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  return outPath;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const pdfPath = args.pdf?.trim() ? args.pdf.trim() : DEFAULT_PDF;

  const report: ImportReport = {
    pdf_path: pdfPath,
    source_url: SOURCE_URL,
    content_root: CONTENT_ROOT,
    out_dir: OUT_DIR,
    prompts_parsed: 0,
    prompts_written: 0,
    prompts_skipped_existing: 0,
    slugs_collided: 0,
    pack_written: false,
    errors: [],
    slugs_created: []
  };

  if (!exists(pdfPath)) {
    report.errors.push({ message: `PDF not found: ${pdfPath}` });
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }

  ensureDir(OUT_DIR);
  const entries = parsePdf(pdfPath);
  report.prompts_parsed = entries.length;

  const todayIso = new Date().toISOString().slice(0, 10);
  const slugsInOrder: string[] = [];

  for (const entry of entries) {
    const title = deriveBeginnerTitle(entry);
    const canonicalKey = `${SOURCE_URL}::${entry.section}::${entry.useCase}::${entry.prompt}`;
    const baseSlug = slugify(title);
    const slug = `${baseSlug}-${stableSuffix(canonicalKey)}`;

    const filePath = path.join(OUT_DIR, `${slug}.mdx`);
    if (exists(filePath) && !args.overwrite) {
      report.prompts_skipped_existing += 1;
      slugsInOrder.push(slug);
      continue;
    }

    const rewritten = rewritePrompt(entry);
    const description = normalizeSpaces(entry.useCase.replace(/^Prompt (for|to)\s+/i, ""));

    const mdx = toMdx({
      title,
      description: description ? description.slice(0, 180) : `Prompt template for ${entry.section}.`,
      use_case: entry.section,
      inputs: rewritten.inputs,
      steps: rewritten.steps,
      output_format: rewritten.outputFormat,
      tags: deriveTags(entry.section, entry.prompt),
      prompt: rewritten.prompt,
      source_url: SOURCE_URL,
      last_updated_iso: todayIso
    });

    fs.writeFileSync(filePath, `${mdx}\n`, "utf8");
    report.prompts_written += 1;
    report.slugs_created.push(slug);
    slugsInOrder.push(slug);
  }

  if (args.pack && slugsInOrder.length) {
    const packSlug = "lawyer-productivity-pack";
    const packTitle = "Lawyer Productivity Pack";
    const packDesc =
      "A practical pack of rewritten prompt templates (inspired by a public legal-tech article) for intake, drafting, litigation, research, and client communications.";
    const packPath = writePack(packSlug, packTitle, packDesc, slugsInOrder, todayIso);
    report.pack_written = true;
    report.pack_path = packPath;
  }

  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
