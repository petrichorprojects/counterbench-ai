import fs from "node:fs";
import path from "node:path";
import { ToolSchema, type Tool } from "../lib/schemas";
import { normalizeTool } from "../lib/normalize";

const ROOT = process.cwd();
// Default to production content (Git-backed). Use CB_CONTENT_ROOT=content_preview for QA against preview content.
const CONTENT_ROOT = process.env.CB_CONTENT_ROOT?.trim() ? process.env.CB_CONTENT_ROOT.trim() : "content";
const TOOLS_DIR = path.join(ROOT, CONTENT_ROOT, "tools");
const OUT_DIR = path.join(ROOT, "out");

function ensureDir(dirPath: string) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJson(filePath: string): unknown {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as unknown;
}

function listJson(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath)
    .filter((f) => f.endsWith(".json") && !f.startsWith("."))
    .sort((a, b) => a.localeCompare(b))
    .map((f) => path.join(dirPath, f));
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function isIsoDate(input: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(input);
}

function writeText(filePath: string, text: string) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, text, "utf8");
}

function writeJson(filePath: string, value: unknown) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function topN<T>(arr: T[], n: number): T[] {
  return arr.slice(0, Math.min(n, arr.length));
}

async function main() {
  const files = listJson(TOOLS_DIR);
  if (files.length === 0) {
    throw new Error(`No tool JSON files found in ${TOOLS_DIR}`);
  }

  const parsed: Tool[] = [];
  const schemaErrors: Array<{ file: string; error: string }> = [];

  for (const f of files) {
    try {
      const v = readJson(f);
      parsed.push(ToolSchema.parse(v));
    } catch (e) {
      schemaErrors.push({ file: f, error: (e as Error).message });
    }
  }

  const bySlug = new Map<string, Tool[]>();
  const byUrl = new Map<string, Tool[]>();
  const byName = new Map<string, Tool[]>();
  const hostCounts = new Map<string, number>();

  for (const t of parsed) {
    bySlug.set(t.slug, [...(bySlug.get(t.slug) ?? []), t]);
    byUrl.set(t.url, [...(byUrl.get(t.url) ?? []), t]);
    byName.set(t.name.toLowerCase(), [...(byName.get(t.name.toLowerCase()) ?? []), t]);
    const host = hostnameOf(t.url);
    if (host) hostCounts.set(host, (hostCounts.get(host) ?? 0) + 1);
  }

  const dupSlugs = [...bySlug.entries()].filter(([, v]) => v.length > 1).map(([k]) => k);
  const dupUrls = [...byUrl.entries()].filter(([, v]) => v.length > 1).map(([k]) => k);
  const dupNames = [...byName.entries()].filter(([, v]) => v.length > 1).map(([k]) => k);

  const normalized = parsed.map(normalizeTool);

  const quality = {
    name_without_letters: parsed.filter((t) => !/[A-Za-z]/.test(t.name)).length,
    description_placeholder: parsed.filter((t) => (t.description || "").toLowerCase().includes("pending verification")).length
  };

  const missing = {
    description: parsed.filter((t) => !t.description || t.description.includes("pending verification")).length,
    categories: parsed.filter((t) => !t.categories.length).length,
    tags: parsed.filter((t) => !t.tags.length).length,
    platform: parsed.filter((t) => !t.platform.length).length,
    last_verified: parsed.filter((t) => !t.last_verified).length
  };

  const normalizedQuality = {
    description_placeholder: normalized.filter((t) => (t.description || "").toLowerCase().includes("pending verification")).length,
    categories_with_trailing_digits: normalized.filter((t) => t.categories.some((c) => /\d+$/.test(c))).length,
    categories_too_short: normalized.filter((t) => t.categories.some((c) => c.trim().length <= 2)).length
  };

  const invalid = {
    last_verified_format: parsed.filter((t) => t.last_verified !== null && !isIsoDate(t.last_verified)).length,
    change_log_dates: parsed.filter((t) => t.change_log.some((c) => !isIsoDate(c.date))).length
  };

  const pricingCounts = parsed.reduce<Record<string, number>>((acc, t) => {
    acc[t.pricing] = (acc[t.pricing] ?? 0) + 1;
    return acc;
  }, {});

  const statusCounts = parsed.reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1;
    return acc;
  }, {});

  const topHosts = [...hostCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);

  const summary = {
    content_root: CONTENT_ROOT,
    tools_dir: TOOLS_DIR,
    file_count: files.length,
    parsed_count: parsed.length,
    schema_error_count: schemaErrors.length,
    duplicates: {
      slugs: dupSlugs.length,
      urls: dupUrls.length,
      names: dupNames.length
    },
    quality,
    normalizedQuality,
    missing,
    invalid,
    pricingCounts,
    statusCounts,
    topHosts
  };

  const reportMd = [
    `# Tool QA Report`,
    ``,
    `- content_root: \`${CONTENT_ROOT}\``,
    `- tools_dir: \`${TOOLS_DIR}\``,
    `- files: ${files.length}`,
    `- parsed: ${parsed.length}`,
    `- schema_errors: ${schemaErrors.length}`,
    ``,
    `## Duplicates`,
    `## Quality`,
    `- name_without_letters: ${quality.name_without_letters}`,
    `- description_placeholder: ${quality.description_placeholder}`,
    ``,
    `## Normalized (User-Facing)`,
    `- description_placeholder: ${normalizedQuality.description_placeholder}`,
    `- categories_with_trailing_digits: ${normalizedQuality.categories_with_trailing_digits}`,
    `- categories_too_short: ${normalizedQuality.categories_too_short}`,
    ``,
    `- slugs: ${dupSlugs.length}`,
    `- urls: ${dupUrls.length}`,
    `- names: ${dupNames.length}`,
    ``,
    `## Missing`,
    `- description: ${missing.description}`,
    `- categories: ${missing.categories}`,
    `- tags: ${missing.tags}`,
    `- platform: ${missing.platform}`,
    `- last_verified: ${missing.last_verified}`,
    ``,
    `## Invalid`,
    `- last_verified_format: ${invalid.last_verified_format}`,
    `- change_log_dates: ${invalid.change_log_dates}`,
    ``,
    `## Pricing`,
    ...Object.entries(pricingCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `- ${k}: ${v}`),
    ``,
    `## Status`,
    ...Object.entries(statusCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `- ${k}: ${v}`),
    ``,
    `## Top Tool Hosts`,
    ...topHosts.map(([h, c]) => `- ${h}: ${c}`),
    ``,
    `## Samples`,
    `- dup_slugs_sample: ${JSON.stringify(topN(dupSlugs, 10))}`,
    `- dup_urls_sample: ${JSON.stringify(topN(dupUrls, 10))}`,
    `- schema_errors_sample: ${JSON.stringify(topN(schemaErrors, 3), null, 2)}`
  ].join("\n");

  ensureDir(OUT_DIR);
  const suffix = CONTENT_ROOT === "content_preview" ? "-preview" : "";
  writeJson(path.join(OUT_DIR, `qa-tools${suffix}.json`), summary);
  writeText(path.join(OUT_DIR, `qa-tools${suffix}.md`), reportMd);
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
