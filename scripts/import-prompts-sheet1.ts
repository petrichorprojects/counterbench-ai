import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { slugify } from "../lib/slug";

type ParsedPrompt = {
  section: string;
  title: string;
  prompt: string;
  source_line: number;
};

type ImportReport = {
  input_path: string;
  content_root: string;
  out_dir: string;
  prompts_parsed: number;
  prompts_written: number;
  prompts_skipped_existing: number;
  slugs_collided: number;
  sections: Record<string, number>;
  errors: { message: string; line?: number }[];
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

function stableSuffix(input: string): string {
  return createHash("sha1").update(input).digest("hex").slice(0, 6);
}

function yamlList(items: string[]): string {
  if (!items.length) return "[]";
  return `\n${items.map((s) => `  - ${JSON.stringify(s)}`).join("\n")}`;
}

function stripWrappingQuotes(raw: string): string {
  const s = raw.trim();
  if (!s) return s;
  const pairs: Array<[string, string]> = [
    ['"', '"'],
    ["“", "”"]
  ];
  for (const [open, close] of pairs) {
    if (s.startsWith(open) && s.endsWith(close) && s.length >= 2) {
      return s.slice(open.length, s.length - close.length).trim();
    }
  }
  return s;
}

function detectSectionHeader(line: string): string | null {
  const s = stripWrappingQuotes(line);
  const m = /^([IVXLCDM]+)\.\s+(.+)$/.exec(s);
  if (!m) return null;
  return (m[2] ?? "").trim();
}

function isPromptTitle(line: string): boolean {
  const s = stripWrappingQuotes(line).trim();
  if (!s) return false;
  if (!s.endsWith(":")) return false;
  const base = s.slice(0, -1).trim();
  if (!base) return false;
  if (/^critical note/i.test(base)) return false;
  return true;
}

function takeFirstSentence(text: string): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  const idx = cleaned.search(/[.!?]\s/);
  const first = idx >= 0 ? cleaned.slice(0, idx + 1) : cleaned;
  return first.length > 180 ? `${first.slice(0, 177).trim()}...` : first;
}

function titleToDescription(title: string, section: string, prompt: string): string {
  const first = takeFirstSentence(prompt);
  if (first) return first;
  return `Prompt template for ${section}: ${title}.`;
}

function extractInputsFromBrackets(prompt: string): string[] {
  const matches = [...prompt.matchAll(/\[([^\]]+)\]/g)].map((m) => (m[1] ?? "").trim());
  const inputs = new Set<string>();
  for (const raw of matches) {
    let s = raw;
    s = s.split(",")[0] ?? s;
    s = s.split("e.g.")[0] ?? s;
    s = s.split("e.g")[0] ?? s;
    s = s.split("or")[0] ?? s;
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

function deriveTags(section: string, title: string): string[] {
  const tags = new Set<string>();
  const s = `${section} ${title}`.toLowerCase();

  const addIf = (needle: string, tag: string) => {
    if (s.includes(needle)) tags.add(tag);
  };

  tags.add(section);
  addIf("contract", "contracts");
  addIf("nda", "contracts");
  addIf("draft", "drafting");
  addIf("memo", "legal writing");
  addIf("motion", "litigation");
  addIf("discovery", "litigation");
  addIf("privacy", "privacy");
  addIf("gdpr", "privacy");
  addIf("citation", "citations");
  addIf("bluebook", "citations");
  addIf("regulation", "compliance");
  addIf("compliance", "compliance");
  addIf("employment", "employment");
  addIf("trademark", "ip");
  addIf("patent", "ip");
  addIf("copyright", "ip");
  addIf("tenant", "real estate");
  addIf("lease", "real estate");

  return [...tags].slice(0, 12);
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
  last_updated_iso: string;
}): string {
  const fm = [
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
    "## Notes",
    "- Treat outputs as drafting support, not legal advice.",
    "- Verify citations and current law with primary sources.",
    "- Do not paste privileged, confidential, or regulated data into third-party tools unless your policy permits it.",
    ""
  ].join("\n");

  return `${fm}\n`;
}

function parseArgs(argv: string[]) {
  const out: { input?: string; overwrite: boolean } = { overwrite: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i] ?? "";
    if (a === "--overwrite") out.overwrite = true;
    if (a === "--input") out.input = argv[i + 1];
  }
  return out;
}

function defaultInputPath(): string {
  const candidates = [
    "/Users/philipprimmler/Downloads/Legal Prompts/Legal Prompts - Sheet1.csv",
    "/Users/philipprimmler/Downloads/Legal Prompts - Sheet1.csv",
    path.join(ROOT, "data", "Legal Prompts - Sheet1.csv")
  ];
  for (const p of candidates) {
    if (exists(p)) return p;
  }
  return candidates[0]!;
}

function parseSheet(text: string): ParsedPrompt[] {
  const lines = text.split(/\r?\n/g);
  const out: ParsedPrompt[] = [];
  let section = "General";
  let pendingTitle: { title: string; line: number } | null = null;
  let collecting = false;
  let endQuote: '"' | "”" = '"';
  let body: string[] = [];

  const flush = () => {
    if (!pendingTitle) return;
    const promptText = body.join("\n").trim();
    if (!promptText) return;
    out.push({ section, title: pendingTitle.title, prompt: promptText, source_line: pendingTitle.line });
  };

  for (let idx = 0; idx < lines.length; idx += 1) {
    const raw = lines[idx] ?? "";
    const lineNo = idx + 1;
    const trimmed = raw.trim();
    if (!trimmed) continue;

    const sectionHeader = detectSectionHeader(trimmed);
    if (sectionHeader) {
      if (collecting) {
        collecting = false;
        flush();
      }
      pendingTitle = null;
      body = [];
      section = sectionHeader;
      continue;
    }

    const note = stripWrappingQuotes(trimmed);
    if (!pendingTitle && /^critical note/i.test(note)) continue;

    if (collecting) {
      let chunk = trimmed;
      if (chunk.endsWith(endQuote)) {
        chunk = chunk.slice(0, -1);
        body.push(chunk);
        collecting = false;
        flush();
        pendingTitle = null;
        body = [];
        continue;
      }
      body.push(chunk);
      continue;
    }

    if (!pendingTitle) {
      if (isPromptTitle(trimmed)) {
        const t = stripWrappingQuotes(trimmed).slice(0, -1).trim();
        pendingTitle = { title: t, line: lineNo };
        continue;
      }
      continue;
    }

    const firstChar = trimmed[0];
    if (firstChar === '"' || firstChar === "“") {
      endQuote = firstChar === "“" ? "”" : '"';
      let chunk = trimmed.slice(1);
      if (chunk.endsWith(endQuote)) {
        chunk = chunk.slice(0, -1);
        body = [chunk];
        flush();
        pendingTitle = null;
        body = [];
        collecting = false;
        continue;
      }
      body = [chunk];
      collecting = true;
      continue;
    }

    body = [stripWrappingQuotes(trimmed)];
    flush();
    pendingTitle = null;
    body = [];
  }

  if (collecting) {
    collecting = false;
    flush();
  }

  return out;
}

function writeJson(filePath: string, value: unknown) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const inputPath = args.input?.trim() ? path.resolve(args.input.trim()) : defaultInputPath();
  const report: ImportReport = {
    input_path: inputPath,
    content_root: CONTENT_ROOT,
    out_dir: OUT_DIR,
    prompts_parsed: 0,
    prompts_written: 0,
    prompts_skipped_existing: 0,
    slugs_collided: 0,
    sections: {},
    errors: []
  };

  ensureDir(OUT_DIR);

  if (!exists(inputPath)) {
    report.errors.push({ message: `Input not found: ${inputPath}` });
    writeJson(path.join(ROOT, "out", "import-prompts-sheet1-report.json"), report);
    console.error(report.errors[0]?.message);
    process.exit(1);
  }

  const text = fs.readFileSync(inputPath, "utf8");
  const parsed = parseSheet(text);
  report.prompts_parsed = parsed.length;

  const todayIso = new Date().toISOString().slice(0, 10);

  for (const p of parsed) {
    report.sections[p.section] = (report.sections[p.section] ?? 0) + 1;
    const baseSlug = slugify(p.title);

    let slug = baseSlug;
    let filePath = path.join(OUT_DIR, `${slug}.mdx`);
    if (exists(filePath) && !args.overwrite) {
      report.slugs_collided += 1;
      slug = `${baseSlug}-${stableSuffix(`${p.section}|${p.title}|${p.prompt}`)}`;
      filePath = path.join(OUT_DIR, `${slug}.mdx`);
    }

    if (exists(filePath) && !args.overwrite) {
      report.prompts_skipped_existing += 1;
      continue;
    }

    const inputs = extractInputsFromBrackets(p.prompt);
    const steps = [
      "Fill placeholders (jurisdiction, facts, constraints).",
      "Run the prompt and review for accuracy.",
      "Verify law and citations with primary sources.",
      "Edit into your firm's format."
    ];
    const tags = deriveTags(p.section, p.title);
    const description = titleToDescription(p.title, p.section, p.prompt);

    const mdx = toMdx({
      title: p.title,
      description,
      use_case: p.section,
      inputs,
      steps,
      output_format: "",
      tags,
      prompt: p.prompt,
      last_updated_iso: todayIso
    });

    fs.writeFileSync(filePath, mdx, "utf8");
    report.prompts_written += 1;
  }

  writeJson(path.join(ROOT, "out", "import-prompts-sheet1-report.json"), report);
  console.log(
    `Parsed ${report.prompts_parsed}. Wrote ${report.prompts_written}. Skipped existing ${report.prompts_skipped_existing}. Slug collisions ${report.slugs_collided}.`
  );
  console.log(`Report: ${path.join(ROOT, "out", "import-prompts-sheet1-report.json")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

