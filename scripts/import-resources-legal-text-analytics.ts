import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

type ResourceType = "program" | "research" | "toolkit" | "policy" | "community" | "course" | "news" | "other";

type Resource = {
  slug: string;
  title: string;
  description: string;
  url: string;
  tags: string[];
  type: ResourceType;
  last_checked: string | null;
};

function argValue(key: string): string | null {
  const idx = process.argv.findIndex((a) => a === `--${key}` || a.startsWith(`--${key}=`));
  if (idx === -1) return null;
  const a = process.argv[idx] ?? "";
  if (a.includes("=")) return a.split("=").slice(1).join("=") || "";
  const next = process.argv[idx + 1];
  return typeof next === "string" ? next : "";
}

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

function hash6(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex").slice(0, 6);
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

function cleanTitle(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

const INCLUDED_HEADINGS = new Map<string, { type: ResourceType; tag: string }>([
  ["Methods", { type: "research", tag: "Methods" }],
  ["Libraries", { type: "toolkit", tag: "Libraries" }],
  ["Datasets and Data", { type: "research", tag: "Datasets" }],
  ["Large Language Models and GPT", { type: "research", tag: "LLMs" }],
  ["Annotation and Data Schemes", { type: "research", tag: "Annotation schemes" }],
  ["Annotation Tools", { type: "toolkit", tag: "Annotation tools" }],
  ["Software (interfaces)", { type: "toolkit", tag: "Software" }],
  ["Research Groups, Labs, and Communities", { type: "community", tag: "Research groups" }],
  ["Tutorials", { type: "course", tag: "Tutorials" }]
]);

function shouldSkip(url: string, title: string): boolean {
  const u = url.toLowerCase();
  if (!u.startsWith("http://") && !u.startsWith("https://")) return true;
  if (u.includes("shields.io")) return true;
  if (u.includes("ko-fi.com")) return true;
  if (u.includes("creativecommons.org")) return true;
  if (u.includes("img.shields.io")) return true;
  if (u.includes("media.licdn.com/dms/image")) return true;
  if (title.toLowerCase().includes("badge")) return true;
  return false;
}

function main() {
  const repoRoot = process.cwd();
  const inPath =
    argValue("in") ||
    path.join(repoRoot, "data", "third_party", "legal-text-analytics", "README.md");
  const outDir =
    argValue("outDir") ||
    path.join(repoRoot, "content", "resources", "legal-text-analytics");
  const lastChecked = argValue("lastChecked") || todayIso();

  if (!fs.existsSync(inPath)) {
    console.error(`Missing input README: ${inPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(inPath, "utf8");
  const lines = raw.split(/\r?\n/);

  let heading = "";
  const byUrl = new Map<string, Resource>();

  for (const line of lines) {
    const h = line.match(/^##\s+(.+?)\s*$/);
    if (h) {
      heading = cleanTitle(h[1] ?? "");
      continue;
    }

    const headingMeta = INCLUDED_HEADINGS.get(heading);
    if (!headingMeta) continue;

    // Extract all markdown links on the line.
    const re = /\[([^\]]+?)\]\((https?:\/\/[^)\s]+)\)/g;
    const matches = Array.from(line.matchAll(re));
    if (matches.length === 0) continue;

    for (const m of matches) {
      const title = cleanTitle(m[1] ?? "");
      const url = cleanTitle(m[2] ?? "");
      if (!title || !url) continue;
      if (shouldSkip(url, title)) continue;

      const existing = byUrl.get(url);
      if (existing) {
        if (!existing.tags.includes(headingMeta.tag)) existing.tags.push(headingMeta.tag);
        continue;
      }

      const slugBase = slugify(title) || `resource-${hash6(url)}`;
      const slug = `lta-${slugBase}-${hash6(url)}`;

      byUrl.set(url, {
        slug,
        title,
        url,
        type: headingMeta.type,
        tags: ["Legal Text Analytics", headingMeta.tag],
        last_checked: lastChecked,
        description: `Referenced in Liquid Legal Institute’s “Legal Text Analytics” list. Category: ${heading}.`
      });
    }
  }

  ensureDir(outDir);

  // Write a stable index entry for the parent list itself.
  const indexResource: Resource = {
    slug: "legal-text-analytics",
    title: "Legal Text Analytics (Liquid Legal Institute)",
    description: "A curated index of resources, methods, tools, datasets, and research groups focused on legal text analytics.",
    url: "https://github.com/Liquid-Legal-Institute/Legal-Text-Analytics",
    tags: ["Legal text analytics", "Research", "CC BY-SA 4.0"],
    type: "research",
    last_checked: lastChecked
  };

  fs.writeFileSync(path.join(outDir, `${indexResource.slug}.json`), JSON.stringify(indexResource, null, 2) + "\n", "utf8");

  const items = Array.from(byUrl.values()).sort((a, b) => a.title.localeCompare(b.title));
  for (const r of items) {
    fs.writeFileSync(path.join(outDir, `${r.slug}.json`), JSON.stringify(r, null, 2) + "\n", "utf8");
  }

  console.log(
    JSON.stringify(
      {
        input: inPath,
        output_dir: outDir,
        generated_at: new Date().toISOString(),
        resources_written: items.length + 1
      },
      null,
      2
    )
  );
}

main();

