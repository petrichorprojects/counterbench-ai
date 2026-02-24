import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  CollectionSchema,
  PackSchema,
  PromptFrontmatterSchema,
  SkillFrontmatterSchema,
  ToolSchema,
  type Collection,
  type Pack,
  type PromptFrontmatter,
  type SkillFrontmatter,
  type Tool
} from "./schemas";
import { normalizeTool } from "./normalize";

const ROOT = process.cwd();
const CONTENT_ROOT = process.env.CB_CONTENT_ROOT?.trim() ? process.env.CB_CONTENT_ROOT.trim() : "content";
const CONTENT_DIR = path.join(ROOT, CONTENT_ROOT);
const PROD_DIR = path.join(ROOT, "content");

function overlayDir(subdir: string): string {
  // Preview mode can override only some subdirectories; missing ones fall back to production content.
  if (CONTENT_ROOT === "content") {
    return path.join(CONTENT_DIR, subdir);
  }
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

export function getAllTools(): Tool[] {
  const dir = overlayDir("tools");
  return readDirSafe(dir)
    .filter((f) => f.endsWith(".json"))
    .map((filename) => {
      const filePath = path.join(dir, filename);
      const parsed = readJsonFile(filePath, (v) => ToolSchema.parse(v));
      return normalizeTool(parsed);
    });
}

export function getToolBySlug(slug: string): Tool | null {
  const dir = overlayDir("tools");
  const filePath = path.join(dir, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  const parsed = readJsonFile(filePath, (v) => ToolSchema.parse(v));
  return normalizeTool(parsed);
}

export function getAllCollections(): Collection[] {
  const dir = overlayDir("collections");
  return readDirSafe(dir)
    .filter((f) => f.endsWith(".json"))
    .map((filename) => {
      const filePath = path.join(dir, filename);
      return readJsonFile(filePath, (v) => CollectionSchema.parse(v));
    });
}

export function getCollectionBySlug(slug: string): Collection | null {
  const dir = overlayDir("collections");
  const filePath = path.join(dir, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  return readJsonFile(filePath, (v) => CollectionSchema.parse(v));
}

export function getAllPacks(): Pack[] {
  const dir = overlayDir("packs");
  return readDirSafe(dir)
    .filter((f) => f.endsWith(".json"))
    .map((filename) => {
      const filePath = path.join(dir, filename);
      return readJsonFile(filePath, (v) => PackSchema.parse(v));
    });
}

export function getPackBySlug(slug: string): Pack | null {
  const dir = overlayDir("packs");
  const filePath = path.join(dir, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  return readJsonFile(filePath, (v) => PackSchema.parse(v));
}

export interface PromptDoc {
  slug: string;
  frontmatter: PromptFrontmatter;
  content: string;
}

export interface SkillDoc {
  slug: string;
  frontmatter: SkillFrontmatter;
  content: string;
}

export function getAllPrompts(): PromptDoc[] {
  const dir = overlayDir("prompts");
  return readDirSafe(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(dir, filename), "utf8");
      const parsed = matter(raw);
      const frontmatter = PromptFrontmatterSchema.parse(parsed.data);
      return { slug, frontmatter, content: parsed.content };
    });
}

export function getPromptBySlug(slug: string): PromptDoc | null {
  const dir = overlayDir("prompts");
  const filePath = path.join(dir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  const frontmatter = PromptFrontmatterSchema.parse(parsed.data);
  return { slug, frontmatter, content: parsed.content };
}

export function getAllSkills(): SkillDoc[] {
  const dir = overlayDir("skills");
  return readDirSafe(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(dir, filename), "utf8");
      const parsed = matter(raw);
      const frontmatter = SkillFrontmatterSchema.parse(parsed.data);
      return { slug, frontmatter, content: parsed.content };
    });
}

export function getSkillBySlug(slug: string): SkillDoc | null {
  const dir = overlayDir("skills");
  const filePath = path.join(dir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  const frontmatter = SkillFrontmatterSchema.parse(parsed.data);
  return { slug, frontmatter, content: parsed.content };
}
