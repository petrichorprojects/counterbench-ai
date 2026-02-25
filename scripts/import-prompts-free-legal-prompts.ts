import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { slugify } from "../lib/slug";

type ImportReport = {
  source_root: string;
  content_root: string;
  out_dir: string;
  files_scanned: number;
  prompts_parsed: number;
  prompts_written: number;
  prompts_skipped_existing: number;
  slugs_collided: number;
  errors: { message: string; file?: string }[];
};

type ParsedPrompt = {
  title: string;
  prompt: string;
  use_case: string;
  tags: string[];
  source_relpath: string;
  source_url: string;
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

function stripBom(s: string): string {
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

function cleanUseCase(input: string): string {
  const s = input.replace(/\s+/g, " ").trim();
  return s || "General";
}

function deriveUseCaseFromPath(rel: string): string {
  const parts = rel.split(path.sep).filter(Boolean);
  const idxLawyers = parts.findIndex((p) => p.toLowerCase() === "forlawyers");
  const idxJudges = parts.findIndex((p) => p.toLowerCase() === "forjudges");
  const idx = idxLawyers >= 0 ? idxLawyers : idxJudges;
  const role = idxLawyers >= 0 ? "For Lawyers" : idxJudges >= 0 ? "For Judges" : "General";

  const topic = parts[idx + 1] ?? "";
  const cleanedTopic = topic.includes(" - ") ? topic.split(" - ").slice(-1)[0]!.trim() : topic.trim();
  const out = cleanedTopic ? `${role} / ${cleanedTopic}` : role;
  return cleanUseCase(out);
}

function detectLanguageTags(rel: string, prompt: string): string[] {
  const tags = new Set<string>();
  if (/[^\x00-\x7F]/.test(prompt)) tags.add("Non-English");
  if (/[àáâãäåæçèéêëìíîïñòóôõöøùúûüÿœß]/i.test(prompt)) tags.add("Dutch/European");
  if (rel.toLowerCase().includes("juridische") || rel.toLowerCase().includes("samenvattingen")) tags.add("Dutch");
  if (rel.toLowerCase().includes("getuigenverhoor") || rel.toLowerCase().includes("dagvaardingen")) tags.add("Dutch");
  return [...tags];
}

function titleFromFile(text: string, fallback: string): string {
  const m = /^\s*-\s*Title:\s*(.+?)\s*$/im.exec(text);
  if (m?.[1]) return m[1].trim();
  return fallback;
}

function extractStartEnd(text: string): string | null {
  const lines = stripBom(text).split(/\r?\n/g);
  const startIdx = lines.findIndex((l) => l.trim().toLowerCase() === "# start");
  if (startIdx < 0) return null;
  const endIdx = lines.findIndex((l, i) => i > startIdx && l.trim().toLowerCase() === "# end");
  const slice = lines.slice(startIdx + 1, endIdx > startIdx ? endIdx : lines.length);
  const body = slice.join("\n").trim();
  return body || null;
}

function descriptionFromPrompt(prompt: string): string {
  const cleaned = prompt.replace(/\s+/g, " ").trim();
  if (!cleaned) return "Prompt template.";
  const firstLine = cleaned.split("\n")[0] ?? cleaned;
  const first = firstLine.length > 180 ? `${firstLine.slice(0, 177).trim()}...` : firstLine;
  // Avoid "You are..." descriptions.
  if (/^you are\b/i.test(first)) return "Reusable prompt template for legal workflows.";
  return first;
}

function toMdx(params: {
  title: string;
  description: string;
  use_case: string;
  tags: string[];
  prompt: string;
  source_url: string;
  source_relpath: string;
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
    `- File: ${params.source_relpath}`,
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
  const p = "/Users/philipprimmler/Downloads/Legal Prompts/Free-Legal-Prompts-main";
  return p;
}

function listPromptFiles(rootDir: string): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ent.name.startsWith(".")) continue;
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(full);
      if (ent.isFile() && ent.name.toLowerCase().endsWith(".md")) out.push(full);
    }
  };
  walk(rootDir);
  return out.sort((a, b) => a.localeCompare(b));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const sourceRoot = path.resolve(args.root?.trim() ? args.root.trim() : defaultSourceRoot());

  const report: ImportReport = {
    source_root: sourceRoot,
    content_root: CONTENT_ROOT,
    out_dir: OUT_DIR,
    files_scanned: 0,
    prompts_parsed: 0,
    prompts_written: 0,
    prompts_skipped_existing: 0,
    slugs_collided: 0,
    errors: []
  };

  ensureDir(OUT_DIR);

  if (!exists(sourceRoot)) {
    report.errors.push({ message: `Source root not found: ${sourceRoot}` });
    fs.mkdirSync(path.join(ROOT, "out"), { recursive: true });
    fs.writeFileSync(path.join(ROOT, "out", "import-prompts-free-legal-prompts-report.json"), `${JSON.stringify(report, null, 2)}\n`);
    console.error(report.errors[0]?.message);
    process.exit(1);
  }

  const files = listPromptFiles(sourceRoot).filter((f) => {
    const base = path.basename(f).toLowerCase();
    if (base === "readme.md") return false;
    if (base === "license.md") return false;
    if (base === "code_of_conduct.md") return false;
    return true;
  });
  report.files_scanned = files.length;

  const parsed: ParsedPrompt[] = [];
  for (const filePath of files) {
    const rel = path.relative(sourceRoot, filePath);
    let text = "";
    try {
      text = fs.readFileSync(filePath, "utf8");
    } catch (e) {
      report.errors.push({ message: `Failed reading: ${(e as Error).message}`, file: filePath });
      continue;
    }
    const prompt = extractStartEnd(text);
    if (!prompt) continue;
    const title = titleFromFile(text, path.basename(filePath, path.extname(filePath)));
    const useCase = deriveUseCaseFromPath(rel);
    const tags = [
      "Open source",
      "Free-Legal-Prompts",
      ...detectLanguageTags(rel, prompt),
      ...useCase.split("/").map((s) => s.trim()).filter(Boolean)
    ];
    parsed.push({
      title,
      prompt,
      use_case: useCase,
      tags: [...new Set(tags)].slice(0, 14),
      source_relpath: rel,
      source_url: "https://github.com/anthonyloeff/Free-Legal-Prompts",
      license: "MIT",
      author: "Anthony Loeff"
    });
  }

  report.prompts_parsed = parsed.length;
  const todayIso = new Date().toISOString().slice(0, 10);

  for (const p of parsed) {
    const baseSlug = slugify(p.title);
    let slug = baseSlug;
    let outPath = path.join(OUT_DIR, `${slug}.mdx`);
    if (exists(outPath) && !args.overwrite) {
      report.slugs_collided += 1;
      slug = `${baseSlug}-${stableSuffix(`${p.source_relpath}|${p.title}`)}`;
      outPath = path.join(OUT_DIR, `${slug}.mdx`);
    }
    if (exists(outPath) && !args.overwrite) {
      report.prompts_skipped_existing += 1;
      continue;
    }

    const mdx = toMdx({
      title: p.title,
      description: descriptionFromPrompt(p.prompt),
      use_case: p.use_case,
      tags: p.tags,
      prompt: p.prompt,
      source_url: p.source_url,
      source_relpath: p.source_relpath,
      license: p.license,
      author: p.author,
      last_updated_iso: todayIso
    });

    fs.writeFileSync(outPath, mdx, "utf8");
    report.prompts_written += 1;
  }

  ensureDir(path.join(ROOT, "out"));
  fs.writeFileSync(path.join(ROOT, "out", "import-prompts-free-legal-prompts-report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(
    `Free-Legal-Prompts: scanned ${report.files_scanned}, parsed ${report.prompts_parsed}, wrote ${report.prompts_written}, skipped ${report.prompts_skipped_existing}, collisions ${report.slugs_collided}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

