import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

const ROOT = process.cwd();
const CONTENT_ROOT = process.env.CB_CONTENT_ROOT?.trim() ? process.env.CB_CONTENT_ROOT.trim() : "content";
const CONTENT_DIR = path.join(ROOT, CONTENT_ROOT);
const PROD_DIR = path.join(ROOT, "content");

function overlayDir(subdir: string): string {
  if (CONTENT_ROOT === "content") return path.join(CONTENT_DIR, subdir);
  const preferred = path.join(CONTENT_DIR, subdir);
  if (fs.existsSync(preferred)) return preferred;
  return path.join(PROD_DIR, subdir);
}

const ResourceTypeEnum = z.enum(["program", "research", "toolkit", "policy", "community", "course", "news", "other"]);
const ResourceSourceTypeEnum = z.enum([
  "case-law",
  "statutes-regulation",
  "dockets-filings",
  "scholarship",
  "datasets-benchmarks",
  "research-platform",
  "other"
]);
const ResourceAccessTypeEnum = z.enum(["open", "commercial", "api", "bulk", "mixed", "unknown"]);

export const ResourceSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  url: z.string().url(),
  tags: z.array(z.string()).default([]),
  type: ResourceTypeEnum.default("other"),
  last_checked: z.string().nullable().default(null),
  jurisdiction: z.array(z.string()).default([]),
  source_type: ResourceSourceTypeEnum.default("other"),
  access: z.array(ResourceAccessTypeEnum).default([]),
  coverage: z.string().default(""),
  license_notes: z.string().default(""),
  best_for: z.array(z.string()).default([])
});

export type Resource = z.infer<typeof ResourceSchema>;

function readDirSafe(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) return [];
  return fs.readdirSync(dirPath).filter((f) => !f.startsWith("."));
}

function walkJsonFiles(rootDir: string): string[] {
  const out: string[] = [];

  const stack: string[] = [rootDir];
  while (stack.length > 0) {
    const dir = stack.pop();
    if (!dir) break;
    for (const entry of readDirSafe(dir)) {
      const full = path.join(dir, entry);
      let st: fs.Stats;
      try {
        st = fs.statSync(full);
      } catch {
        continue;
      }
      if (st.isDirectory()) {
        stack.push(full);
        continue;
      }
      if (st.isFile() && entry.endsWith(".json")) out.push(full);
    }
  }

  out.sort((a, b) => a.localeCompare(b));
  return out;
}

function readJsonFile<T>(filePath: string, parser: (value: unknown) => T): T {
  const raw = fs.readFileSync(filePath, "utf8");
  const value = JSON.parse(raw) as unknown;
  return parser(value);
}

export function getAllResources(): Resource[] {
  const dir = overlayDir("resources");
  return walkJsonFiles(dir)
    .map((filePath) => readJsonFile(filePath, (v) => ResourceSchema.parse(v)))
    .sort((a, b) => a.title.localeCompare(b.title));
}
