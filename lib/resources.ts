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

export const ResourceSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  url: z.string().url(),
  tags: z.array(z.string()).default([]),
  type: ResourceTypeEnum.default("other"),
  last_checked: z.string().nullable().default(null)
});

export type Resource = z.infer<typeof ResourceSchema>;

function readDirSafe(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath)
    .filter((f) => !f.startsWith("."))
    .sort((a, b) => a.localeCompare(b));
}

function readJsonFile<T>(filePath: string, parser: (value: unknown) => T): T {
  const raw = fs.readFileSync(filePath, "utf8");
  const value = JSON.parse(raw) as unknown;
  return parser(value);
}

export function getAllResources(): Resource[] {
  const dir = overlayDir("resources");
  return readDirSafe(dir)
    .filter((f) => f.endsWith(".json"))
    .map((filename) => readJsonFile(path.join(dir, filename), (v) => ResourceSchema.parse(v)));
}

