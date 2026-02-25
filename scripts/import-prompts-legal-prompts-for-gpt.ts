import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { slugify } from "../lib/slug";

type ImportReport = {
  source_root: string;
  content_root: string;
  out_dir: string;
  prompts_parsed: number;
  prompts_written: number;
  prompts_skipped_existing: number;
  slugs_collided: number;
  errors: { message: string }[];
};

type PromptDraft = {
  title: string;
  prompt: string;
  use_case: string;
  tags: string[];
  source_url: string;
  source_file: string;
  license: string;
  author: string;
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

function stripBlockquotePrefix(line: string): string {
  return line.replace(/^\s*>\s?/, "");
}

function normalizePromptText(raw: string): string {
  return raw
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.trimEnd())
    .join("\n")
    .trim();
}

function looksLikePrompt(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  const low = t.toLowerCase();

  // Tables or metadata blocks, not prompts.
  if (low.includes("| approach |") || low.includes("|---") || low.includes("| approach | details |")) return false;

  // Example dialogue chunks.
  if (low.includes("**question:**") || low.includes("**answer:**")) return false;
  if (low.startsWith("certainly!")) return false;

  // Heuristic: a prompt is typically long-ish and contains either role language or placeholders.
  if (t.length < 40) return false;
  if (/(act as|i want you to|i would like you to|我希望你)/i.test(t)) return true;
  if (t.includes("[") && t.includes("]")) return true;
  if (t.includes("{") && t.includes("}")) return true;
  if (t.includes("```")) return true;

  // Fallback: imperative prompt sentence.
  if (/(draft|summarize|analyze|identify|compare|provide|generate|rewrite)\b/i.test(t)) return true;
  return false;
}

function descriptionFromPrompt(prompt: string): string {
  const cleaned = prompt.replace(/\s+/g, " ").trim();
  if (!cleaned) return "Prompt template.";
  const first = cleaned.slice(0, 180);
  // Avoid "I want you to act..."
  if (/^i (want|would) you to act/i.test(first)) return "Reusable prompt template for legal workflows.";
  return first.length >= 180 ? `${first.trim()}...` : first;
}

function deriveTags(title: string, useCase: string): string[] {
  const t = `${title} ${useCase}`.toLowerCase();
  const out = new Set<string>(["Open source", "legal-prompts-for-gpt"]);
  const addIf = (needle: string, tag: string) => {
    if (t.includes(needle)) out.add(tag);
  };
  addIf("translation", "translation");
  addIf("clause", "contracts");
  addIf("agreement", "contracts");
  addIf("bluebook", "citations");
  addIf("citation", "citations");
  addIf("negotiation", "negotiation");
  addIf("research", "legal research");
  addIf("statute", "legal research");
  addIf("defense", "litigation");
  addIf("issues", "legal analysis");
  addIf("mandarin", "chinese");
  addIf("marketing", "marketing");
  for (const part of useCase.split("/").map((s) => s.trim()).filter(Boolean)) out.add(part);
  return [...out].slice(0, 14);
}

function toMdx(params: {
  title: string;
  description: string;
  use_case: string;
  tags: string[];
  prompt: string;
  source_url: string;
  source_file: string;
  license: string;
  author: string;
  last_updated_iso: string;
}): string {
  return [
    "---",
    `title: ${JSON.stringify(params.title)}`,
    `description: ${JSON.stringify(params.description)}`,
    `use_case: ${JSON.stringify(params.use_case)}`,
    `inputs: []`,
    `steps: []`,
    `output_format: ${JSON.stringify("")}`,
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
    `- Project: ${params.source_url}`,
    `- File: ${params.source_file}`,
    `- License: ${params.license}`,
    `- Author: ${params.author}`,
    ""
  ].join("\n");
}

function parseArgs(argv: string[]) {
  const out: { root?: string; overwrite: boolean } = { overwrite: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i] ?? "";
    if (a === "--overwrite") out.overwrite = true;
    if (a === "--root") out.root = argv[i + 1];
  }
  return out;
}

function defaultSourceRoot(): string {
  return "/Users/philipprimmler/Downloads/Legal Prompts/legal-prompts-for-gpt-main";
}

function parseReadme(readmeText: string): PromptDraft[] {
  const lines = readmeText.replace(/\r/g, "").split("\n");
  const drafts: PromptDraft[] = [];
  let currentTitle = "";
  let currentUseCase = "EN-US Law";
  let currentPrompt: string | null = null;
  let currentDistilled: string | null = null;

  const isNumberedHeading = (s: string): boolean => /^##\s+\d+\.\s+/.test(s.trim());

  const flush = () => {
    const chosen = currentDistilled ?? currentPrompt;
    if (!currentTitle || !chosen) return;
    const promptText = normalizePromptText(chosen);
    if (!looksLikePrompt(promptText)) return;

    drafts.push({
      title: currentTitle,
      prompt: promptText,
      use_case: currentUseCase,
      tags: deriveTags(currentTitle, currentUseCase),
      source_url: "https://github.com/TracyWang95/legal-prompts-for-gpt",
      source_file: "README.md",
      license: "MIT",
      author: "Wuyue Tracy Wang + contributors"
    });
  };

  const readBlockquoteChunk = (startIdx: number): { text: string; endIdx: number } | null => {
    if (!lines[startIdx]?.trim().startsWith(">")) return null;
    const buf: string[] = [];
    let i = startIdx;
    while (i < lines.length) {
      const l = lines[i] ?? "";
      if (!l.trim().startsWith(">")) break;
      buf.push(stripBlockquotePrefix(l));
      i += 1;
    }
    return { text: buf.join("\n").trim(), endIdx: i - 1 };
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? "";
    const trimmed = line.trim();

    if (/^#\s+EN-US Law/i.test(trimmed)) {
      currentUseCase = "EN-US Law";
      continue;
    }
    if (/^#\s+ZH-Chinese Law/i.test(trimmed)) {
      currentUseCase = "Chinese Law";
      continue;
    }

    const heading = /^##\s+\d+\.\s+(.+)$/.exec(trimmed);
    if (heading) {
      flush();
      currentTitle = heading[1]!.trim();
      currentPrompt = null;
      currentDistilled = null;

      // Try to capture the first blockquote prompt after heading.
      // Skip contributor/example headings until we hit a blockquote or the next numbered prompt.
      for (let j = i + 1; j < Math.min(i + 60, lines.length); j += 1) {
        const t = (lines[j] ?? "").trim();
        if (!t) continue;
        if (isNumberedHeading(t)) break;
        if (/^#\s+/.test(t)) break; // language boundary or new major section
        if (!t.startsWith(">")) continue;
        const chunk = readBlockquoteChunk(j);
        if (!chunk) break;
        if (looksLikePrompt(chunk.text)) {
          currentPrompt = chunk.text;
          break;
        }
        // Not a prompt (likely table or example). Keep scanning within this section.
        j = chunk.endIdx;
      }

      continue;
    }

    if (/^##\s+Distilled/i.test(trimmed)) {
      // Next blockquote chunk is the distilled prompt.
      for (let j = i + 1; j < Math.min(i + 20, lines.length); j += 1) {
        const t = (lines[j] ?? "").trim();
        if (!t) continue;
        if (!t.startsWith(">")) break;
        const chunk = readBlockquoteChunk(j);
        if (chunk && looksLikePrompt(chunk.text)) currentDistilled = chunk.text;
        break;
      }
      continue;
    }
  }

  flush();
  return drafts;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const sourceRoot = path.resolve(args.root?.trim() ? args.root.trim() : defaultSourceRoot());
  const report: ImportReport = {
    source_root: sourceRoot,
    content_root: CONTENT_ROOT,
    out_dir: OUT_DIR,
    prompts_parsed: 0,
    prompts_written: 0,
    prompts_skipped_existing: 0,
    slugs_collided: 0,
    errors: []
  };

  ensureDir(OUT_DIR);

  const readmePath = path.join(sourceRoot, "README.md");
  if (!exists(readmePath)) {
    report.errors.push({ message: `README not found: ${readmePath}` });
    ensureDir(path.join(ROOT, "out"));
    fs.writeFileSync(path.join(ROOT, "out", "import-prompts-legal-prompts-for-gpt-report.json"), `${JSON.stringify(report, null, 2)}\n`);
    console.error(report.errors[0]?.message);
    process.exit(1);
  }

  const readme = fs.readFileSync(readmePath, "utf8");
  const drafts = parseReadme(readme);
  report.prompts_parsed = drafts.length;

  const todayIso = new Date().toISOString().slice(0, 10);

  for (const d of drafts) {
    const baseSlug = slugify(d.title);
    let slug = baseSlug;
    let outPath = path.join(OUT_DIR, `${slug}.mdx`);
    if (exists(outPath) && !args.overwrite) {
      report.slugs_collided += 1;
      slug = `${baseSlug}-${stableSuffix(`${d.title}|${d.use_case}`)}`;
      outPath = path.join(OUT_DIR, `${slug}.mdx`);
    }
    if (exists(outPath) && !args.overwrite) {
      report.prompts_skipped_existing += 1;
      continue;
    }

    const mdx = toMdx({
      title: d.title,
      description: descriptionFromPrompt(d.prompt),
      use_case: d.use_case,
      tags: d.tags,
      prompt: d.prompt,
      source_url: d.source_url,
      source_file: d.source_file,
      license: d.license,
      author: d.author,
      last_updated_iso: todayIso
    });
    fs.writeFileSync(outPath, mdx, "utf8");
    report.prompts_written += 1;
  }

  ensureDir(path.join(ROOT, "out"));
  fs.writeFileSync(
    path.join(ROOT, "out", "import-prompts-legal-prompts-for-gpt-report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8"
  );
  console.log(
    `legal-prompts-for-gpt: parsed ${report.prompts_parsed}, wrote ${report.prompts_written}, skipped ${report.prompts_skipped_existing}, collisions ${report.slugs_collided}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
