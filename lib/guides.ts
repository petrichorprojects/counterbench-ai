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

const RankedToolSchema = z.object({
  tool_slug: z.string().min(1),
  why: z.string().min(1)
});

const FaqSchema = z.object({
  q: z.string().min(1),
  a: z.string().min(1)
});

const CitationSchema = z.object({
  title: z.string().min(1),
  url: z.string().url()
});

const PlaybookSectionSchema = z.object({
  title: z.string().min(1),
  bullets: z.array(z.string().min(1)).min(1)
});

const DownloadSchema = z.object({
  label: z.string().min(1),
  url: z.string().min(1)
});

const ToolComparisonSchema = z.object({
  tool_slug: z.string().min(1),
  best_for: z.string().min(1),
  workflow_fit: z.array(z.string().min(1)).default([]),
  auditability: z.string().min(1),
  qa_support: z.string().min(1),
  privilege_controls: z.string().min(1),
  exports_logs: z.string().min(1),
  notes: z.string().min(1)
});

const ChangelogEntrySchema = z.object({
  date: z.string().min(1),
  changes: z.array(z.string().min(1)).min(1)
});

const WorkedExampleSchema = z.object({
  title: z.string().min(1),
  scenario: z.string().min(1),
  time_box: z.string().min(1),
  inputs: z.array(z.string().min(1)).min(1),
  process: z.array(z.string().min(1)).min(1),
  outputs: z.array(z.string().min(1)).min(1),
  qa_findings: z.array(z.string().min(1)).default([]),
  adjustments_made: z.array(z.string().min(1)).default([]),
  key_takeaway: z.string().min(1)
});

export const GuideSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  year: z.number().int().min(2000).max(2100),
  direct_answer: z.string().optional().default(""),
  tldr: z.string().min(1),
  answer_intents: z.array(z.string()).default([]),
  how_to_choose: z.array(z.string()).default([]),
  implementation_risks: z.array(z.string()).default([]),
  operator_playbook: z.array(PlaybookSectionSchema).default([]),
  ranked_tools: z.array(RankedToolSchema).min(3),
  workflow_tool_comparison: z.array(ToolComparisonSchema).default([]),
  downloads: z.array(DownloadSchema).default([]),
  worked_examples: z.array(WorkedExampleSchema).default([]),
  faq: z.array(FaqSchema).default([]),
  citations: z.array(CitationSchema).default([]),
  recommended_pack_slugs: z.array(z.string()).default([]),
  changelog: z.array(ChangelogEntrySchema).default([]),
  last_updated: z.string().min(1)
});

export type Guide = z.infer<typeof GuideSchema>;

export function getAllGuides(): Guide[] {
  const dir = overlayDir("guides");
  return readDirSafe(dir)
    .filter((f) => f.endsWith(".json"))
    .map((filename) => readJsonFile(path.join(dir, filename), (v) => GuideSchema.parse(v)))
    .sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
}

export function getGuideBySlug(slug: string): Guide | null {
  const dir = overlayDir("guides");
  const filePath = path.join(dir, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  return readJsonFile(filePath, (v) => GuideSchema.parse(v));
}
