import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { slugify } from "@/lib/slug";

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

function readTextSafe(filePath: string): string {
  return fs.readFileSync(filePath, "utf8");
}

const InsightFrontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.string().min(1),
  tags: z.array(z.string().min(1)).default([]),
  guideUrl: z.string().min(1).optional(),
  kitLabel: z.string().min(1).optional()
});

export type InsightFrontmatter = z.infer<typeof InsightFrontmatterSchema>;

export type Insight = {
  slug: string;
  frontmatter: InsightFrontmatter;
  content: string;
};

function parseInsight(slug: string, raw: string): Insight {
  const parsed = matter(raw);
  const frontmatter = InsightFrontmatterSchema.parse(parsed.data);
  const content = (parsed.content ?? "").trim();
  return { slug, frontmatter, content };
}

function parseDateScore(isoish: string): number {
  const d = new Date(isoish);
  const t = d.getTime();
  return Number.isNaN(t) ? 0 : t;
}

export function getAllInsights(): Array<Omit<Insight, "content">> {
  const dir = overlayDir("insights");
  return readDirSafe(dir)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .map((filename) => {
      const slug = filename.replace(/\.(md|mdx)$/i, "");
      const raw = readTextSafe(path.join(dir, filename));
      const parsed = parseInsight(slug, raw);
      return { slug: parsed.slug, frontmatter: parsed.frontmatter };
    })
    .sort((a, b) => parseDateScore(b.frontmatter.date) - parseDateScore(a.frontmatter.date) || a.frontmatter.title.localeCompare(b.frontmatter.title));
}

export function getInsightBySlug(slug: string): Insight | null {
  const dir = overlayDir("insights");
  const mdx = path.join(dir, `${slug}.mdx`);
  const md = path.join(dir, `${slug}.md`);

  const filePath = fs.existsSync(mdx) ? mdx : fs.existsSync(md) ? md : null;
  if (!filePath) return null;
  const raw = readTextSafe(filePath);
  return parseInsight(slug, raw);
}

export function extractToc(source: string): Array<{ id: string; label: string }> {
  const lines = (source ?? "").split(/\r?\n/);
  const out: Array<{ id: string; label: string }> = [];
  for (const line of lines) {
    const m = line.match(/^##\s+(.+?)\s*$/);
    if (!m) continue;
    const label = (m[1] ?? "").trim();
    if (!label) continue;
    const id = slugify(label);
    if (!id) continue;
    if (out.some((x) => x.id === id)) continue;
    out.push({ id, label });
  }
  return out.slice(0, 14);
}
