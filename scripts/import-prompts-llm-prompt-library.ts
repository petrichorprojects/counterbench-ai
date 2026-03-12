import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { slugify } from "../lib/slug";

type ImportReport = {
  source_root: string;
  source_url: string;
  content_root: string;
  out_dir: string;
  packs_dir: string;
  files_scanned: number;
  files_selected: number;
  prompts_parsed: number;
  prompts_written: number;
  prompts_skipped_existing: number;
  slugs_collided: number;
  pack_written: boolean;
  by_use_case: Record<string, number>;
  errors: { message: string; file?: string }[];
};

type PromptDraft = {
  slug: string;
  title: string;
  description: string;
  use_case: string;
  inputs: string[];
  steps: string[];
  output_format: string;
  tags: string[];
  prompt: string;
  source_file: string;
  source_url: string;
};

const ROOT = process.cwd();
const CONTENT_ROOT = process.env.CB_CONTENT_ROOT?.trim() ? process.env.CB_CONTENT_ROOT.trim() : "content";
const OUT_DIR = path.join(ROOT, CONTENT_ROOT, "prompts");
const PACKS_DIR = path.join(ROOT, CONTENT_ROOT, "packs");
const REPO_URL = "https://github.com/abilzerian/LLM-Prompt-Library";
const DEFAULT_SOURCE_ROOT = path.join(ROOT, "data", "third_party", "llm-prompt-library");
const DEFAULT_INCLUDE_PREFIXES = [
  "legal/",
  "sales/",
  "writing/extraction_summarization/",
  "writing/editing_revision/",
  "writing/verification/",
  "writing/educational/"
];
const EXCLUDED_NAME_FRAGMENTS = ["formatting", "hemingway"];

function ensureDir(dirPath: string) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function exists(filePath: string): boolean {
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

function normalizeWhitespace(input: string): string {
  return input.replace(/\r/g, "").replace(/\t/g, "  ");
}

function yamlList(items: string[]): string {
  if (!items.length) return " []";
  return `\n${items.map((s) => `  - ${JSON.stringify(s)}`).join("\n")}`;
}

function listFilesRecursive(dirPath: string): string[] {
  if (!exists(dirPath)) return [];
  const out: string[] = [];

  const walk = (current: string) => {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile()) {
        out.push(full);
      }
    }
  };

  walk(dirPath);
  return out;
}

function toInputKey(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function extractInputs(prompt: string): string[] {
  const out = new Set<string>();

  for (const m of prompt.matchAll(/\{\{\s*([^}]+?)\s*\}\}/g)) {
    const key = toInputKey((m[1] ?? "").trim());
    if (key) out.add(key);
    if (out.size >= 12) break;
  }

  if (out.size < 12) {
    for (const m of prompt.matchAll(/\[([^\]]+?)\]/g)) {
      const text = (m[1] ?? "").trim();
      if (!text) continue;
      if (text.length > 50) continue;
      if (!/[a-z]/i.test(text)) continue;
      if (/^example/i.test(text)) continue;
      const key = toInputKey(text);
      if (!key || key.length < 2 || key.length > 40) continue;
      out.add(key);
      if (out.size >= 12) break;
    }
  }

  return [...out];
}

function firstSentence(text: string): string {
  const compact = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !/^`[^`]+`$/.test(line) && !line.startsWith("```"))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  if (!compact) return "";
  const stripped = compact
    .split(" ")
    .filter((token) => !/^`[^`]+`$/.test(token))
    .join(" ")
    .trim();
  const match = stripped.match(/^(.{1,180}?[.!?])(?:\s|$)/);
  const sentence = (match?.[1] ?? stripped.slice(0, 180)).trim();
  return sentence.length >= 180 ? `${sentence}...` : sentence;
}

function descriptionFromPrompt(title: string, prompt: string, useCase: string): string {
  const seed = firstSentence(prompt);
  if (!seed) return `${title} template for ${useCase.toLowerCase()} workflows.`;

  const low = seed.toLowerCase();
  if (low.startsWith("ignore all prior instructions") || low.startsWith("once you have fully")) {
    return `${title} template for ${useCase.toLowerCase()} workflows.`;
  }

  return seed;
}

function deriveUseCase(relPath: string): string {
  const rel = relPath.toLowerCase();
  if (rel.startsWith("legal/")) return "Legal Research & Drafting";
  if (rel.startsWith("sales/")) return "Client Communications";
  if (rel.startsWith("writing/extraction_summarization/")) return "Summaries & Extraction";
  if (rel.startsWith("writing/editing_revision/")) return "Editing & Revision";
  if (rel.startsWith("writing/verification/")) return "Accuracy Verification";
  if (rel.startsWith("writing/educational/")) return "Teaching & Explanation";
  return "General";
}

function deriveTags(relPath: string, title: string, prompt: string): string[] {
  const out = new Set<string>(["Open source", "LLM-Prompt-Library", "MIT"]);

  const rel = relPath.toLowerCase();
  if (rel.startsWith("legal/")) {
    out.add("legal");
    out.add("legal research");
  }
  if (rel.startsWith("sales/")) {
    out.add("client communications");
    out.add("outreach");
  }
  if (rel.startsWith("writing/")) out.add("writing");
  if (rel.includes("summarization")) out.add("summarization");
  if (rel.includes("editing_revision")) out.add("editing");
  if (rel.includes("verification")) out.add("fact-checking");
  if (rel.includes("educational")) out.add("teaching");

  const t = `${title} ${prompt}`.toLowerCase();
  const titleOnly = title.toLowerCase();
  const addIf = (needle: string, tag: string) => {
    if (t.includes(needle)) out.add(tag);
  };
  if (titleOnly.includes("contract")) out.add("contracts");
  if (titleOnly.includes("case law")) out.add("case law");
  if (titleOnly.includes("proofread")) out.add("proofreading");
  if (titleOnly.includes("rewrite")) out.add("rewriting");
  addIf("summary", "summaries");
  addIf("action item", "action items");

  return [...out].slice(0, 14);
}

function normalizePrompt(raw: string): string {
  let text = normalizeWhitespace(raw)
    .split("\n")
    .map((line) => line.replace(/\s+$/g, ""))
    .join("\n")
    .trim();

  const lines = text.split("\n");
  while (lines.length > 0 && lines[0]!.trim().startsWith("```")) lines.shift();
  while (lines.length > 0 && lines[lines.length - 1]!.trim().startsWith("```")) lines.pop();
  text = lines.join("\n").trim();

  return text;
}

function extractPromptBody(rawFile: string): string {
  const text = normalizeWhitespace(rawFile);

  const fenced = text.match(/```(?:markdown|md|text)?\n([\s\S]*?)```/i);
  if (fenced?.[1]) return normalizePrompt(fenced[1]);

  let withoutHeading = text.replace(/^#\s+.+\n?/m, "").trim();
  if (withoutHeading.startsWith("```")) {
    const lines = withoutHeading.split("\n");
    lines.shift();
    withoutHeading = lines.join("\n").trim();
  }
  return normalizePrompt(withoutHeading);
}

function parseTitle(rawFile: string, relPath: string): string {
  const text = normalizeWhitespace(rawFile);
  const heading = text.match(/^#\s+(.+)$/m);
  if (heading?.[1]?.trim()) return heading[1].trim();

  const base = path.basename(relPath).replace(/\.md$/i, "");
  return base.replace(/[_-]+/g, " ").trim();
}

function promptSteps(useCase: string): string[] {
  const base = ["Fill placeholders and provide task-specific context.", "Run the prompt and review for accuracy."];
  if (useCase === "Legal Research & Drafting") base.push("Verify law and citations with primary sources.");
  base.push("Edit into your workflow format.");
  return base;
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
  source_file: string;
  last_updated: string;
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
    `last_updated: ${JSON.stringify(params.last_updated)}`,
    "---",
    "",
    "## Prompt",
    "```text",
    params.prompt.trim(),
    "```",
    "",
    "## Notes",
    "- Treat outputs as drafting support, not legal advice.",
    "- Verify critical facts and primary sources before use.",
    "",
    "## Source",
    `- Project: ${REPO_URL}`,
    `- File: ${params.source_file}`,
    `- URL: ${params.source_url}`,
    "- License: MIT",
    ""
  ].join("\n");
}

function parseArgs(argv: string[]) {
  const out: {
    root?: string;
    include?: string;
    overwrite: boolean;
  } = {
    overwrite: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i] ?? "";
    if (a === "--root") out.root = argv[i + 1];
    if (a === "--include") out.include = argv[i + 1];
    if (a === "--overwrite") out.overwrite = true;
  }

  return out;
}

function shouldInclude(relPath: string, includePrefixes: string[]): boolean {
  const rel = relPath.replace(/\\/g, "/");
  if (!rel.toLowerCase().endsWith(".md")) return false;
  const low = rel.toLowerCase();
  if (EXCLUDED_NAME_FRAGMENTS.some((frag) => low.includes(frag))) return false;
  return includePrefixes.some((prefix) => low.startsWith(prefix.toLowerCase()));
}

function buildPack(promptSlugs: string[], todayIso: string) {
  const packPath = path.join(PACKS_DIR, "open-source-llm-prompt-library-curated.json");
  const pack = {
    slug: "open-source-llm-prompt-library-curated",
    title: "Open Source: LLM Prompt Library (Curated)",
    description:
      "Curated legal and writing prompts imported from the LLM-Prompt-Library open-source repository for research, review, summaries, and client communications.",
    prompt_slugs: promptSlugs,
    audience: "legal",
    workflow_stage: "research",
    seo: {
      title: "Open Source: LLM Prompt Library (Curated)",
      description:
        "Curated legal and writing prompts imported from the LLM-Prompt-Library open-source repository for research, review, summaries, and client communications."
    },
    last_updated: todayIso
  };

  ensureDir(PACKS_DIR);
  fs.writeFileSync(packPath, `${JSON.stringify(pack, null, 2)}\n`, "utf8");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const sourceRoot = path.resolve(args.root?.trim() ? args.root.trim() : DEFAULT_SOURCE_ROOT);
  const includePrefixes = args.include?.trim()
    ? args.include
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : DEFAULT_INCLUDE_PREFIXES;

  const report: ImportReport = {
    source_root: sourceRoot,
    source_url: REPO_URL,
    content_root: CONTENT_ROOT,
    out_dir: OUT_DIR,
    packs_dir: PACKS_DIR,
    files_scanned: 0,
    files_selected: 0,
    prompts_parsed: 0,
    prompts_written: 0,
    prompts_skipped_existing: 0,
    slugs_collided: 0,
    pack_written: false,
    by_use_case: {},
    errors: []
  };

  ensureDir(OUT_DIR);
  ensureDir(path.join(ROOT, "out"));

  const promptsRoot = path.join(sourceRoot, "prompts");
  if (!exists(promptsRoot)) {
    report.errors.push({ message: `prompts directory not found: ${promptsRoot}` });
    fs.writeFileSync(path.join(ROOT, "out", "import-prompts-llm-prompt-library-report.json"), `${JSON.stringify(report, null, 2)}\n`);
    console.error(report.errors[0]?.message);
    process.exit(1);
  }

  const allFiles = listFilesRecursive(promptsRoot);
  report.files_scanned = allFiles.length;

  const selected = allFiles
    .map((fullPath) => ({ fullPath, relPath: path.relative(promptsRoot, fullPath).replace(/\\/g, "/") }))
    .filter(({ relPath }) => shouldInclude(relPath, includePrefixes))
    .sort((a, b) => a.relPath.localeCompare(b.relPath));

  report.files_selected = selected.length;

  const drafts: PromptDraft[] = [];

  for (const item of selected) {
    try {
      const raw = fs.readFileSync(item.fullPath, "utf8");
      const title = parseTitle(raw, item.relPath);
      const prompt = extractPromptBody(raw);
      if (!title || !prompt) continue;

      const use_case = deriveUseCase(item.relPath);
      const description = descriptionFromPrompt(title, prompt, use_case);
      const inputs = extractInputs(prompt);
      const tags = deriveTags(item.relPath, title, prompt);
      const slugSeed = `llm-library-${item.relPath.replace(/\.md$/i, "").replace(/[\\/]+/g, "-")}`;
      const slug = slugify(slugSeed);

      drafts.push({
        slug,
        title,
        description,
        use_case,
        inputs,
        steps: promptSteps(use_case),
        output_format: "",
        tags,
        prompt,
        source_file: `prompts/${item.relPath}`,
        source_url: `${REPO_URL}/blob/main/prompts/${item.relPath}`
      });
      report.by_use_case[use_case] = (report.by_use_case[use_case] ?? 0) + 1;
    } catch (error) {
      report.errors.push({ message: (error as Error).message, file: item.relPath });
    }
  }

  report.prompts_parsed = drafts.length;

  const todayIso = new Date().toISOString().slice(0, 10);
  const packSlugs: string[] = [];

  for (const draft of drafts) {
    let slug = draft.slug;
    let outPath = path.join(OUT_DIR, `${slug}.mdx`);

    if (exists(outPath) && !args.overwrite) {
      report.slugs_collided += 1;
      const withSuffix = `${draft.slug}-${stableSuffix(draft.source_file)}`;
      slug = withSuffix;
      outPath = path.join(OUT_DIR, `${slug}.mdx`);
    }

    if (exists(outPath) && !args.overwrite) {
      report.prompts_skipped_existing += 1;
      packSlugs.push(slug);
      continue;
    }

    const mdx = toMdx({
      title: draft.title,
      description: draft.description,
      use_case: draft.use_case,
      inputs: draft.inputs,
      steps: draft.steps,
      output_format: draft.output_format,
      tags: draft.tags,
      prompt: draft.prompt,
      source_url: draft.source_url,
      source_file: draft.source_file,
      last_updated: todayIso
    });

    fs.writeFileSync(outPath, mdx, "utf8");
    report.prompts_written += 1;
    packSlugs.push(slug);
  }

  if (packSlugs.length > 0) {
    const uniqueSorted = [...new Set(packSlugs)].sort((a, b) => a.localeCompare(b));
    buildPack(uniqueSorted, todayIso);
    report.pack_written = true;
  }

  const reportPath = path.join(ROOT, "out", "import-prompts-llm-prompt-library-report.json");
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(
    `llm-prompt-library: scanned ${report.files_scanned}, selected ${report.files_selected}, parsed ${report.prompts_parsed}, wrote ${report.prompts_written}, skipped ${report.prompts_skipped_existing}, collisions ${report.slugs_collided}`
  );
  console.log(`Report: ${reportPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
