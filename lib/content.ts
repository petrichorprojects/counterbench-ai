import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  CollectionSchema,
  PlaybookSchema,
  PackSchema,
  PromptFrontmatterSchema,
  SkillFrontmatterSchema,
  ToolSchema,
  type Collection,
  type Playbook,
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

type ToolCache = { dir: string; tools: Tool[]; bySlug: Map<string, Tool> };
type CollectionCache = { dir: string; collections: Collection[]; bySlug: Map<string, Collection> };
type PlaybookCache = { dir: string; playbooks: Playbook[]; bySlug: Map<string, Playbook> };
type PackCache = { dir: string; packs: Pack[]; bySlug: Map<string, Pack> };
type PromptCache = { dir: string; prompts: PromptDoc[]; bySlug: Map<string, PromptDoc> };
type SkillCache = { dir: string; skills: SkillDoc[]; bySlug: Map<string, SkillDoc> };

// Next build/SSG will call these functions hundreds of times. A tiny in-memory cache
// keeps builds reliably under time limits and also speeds up runtime in server mode.
let toolCache: ToolCache | null = null;
let collectionCache: CollectionCache | null = null;
let playbookCache: PlaybookCache | null = null;
let packCache: PackCache | null = null;
let promptCache: PromptCache | null = null;
let skillCache: SkillCache | null = null;

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
  if (toolCache && toolCache.dir === dir) return toolCache.tools;

  const tools = readDirSafe(dir)
    .filter((f) => f.endsWith(".json"))
    .map((filename) => {
      const filePath = path.join(dir, filename);
      const parsed = readJsonFile(filePath, (v) => ToolSchema.parse(v));
      return normalizeTool(parsed);
    });

  const bySlug = new Map<string, Tool>(tools.map((t) => [t.slug, t]));
  toolCache = { dir, tools, bySlug };
  return tools;
}

export function getToolBySlug(slug: string): Tool | null {
  const dir = overlayDir("tools");
  if (!toolCache || toolCache.dir !== dir) {
    // Warm cache once; used heavily by SSG.
    void getAllTools();
  }
  return toolCache?.dir === dir ? toolCache.bySlug.get(slug) ?? null : null;
}

export function getAllCollections(): Collection[] {
  const dir = overlayDir("collections");
  if (collectionCache && collectionCache.dir === dir) return collectionCache.collections;
  const collections = readDirSafe(dir)
    .filter((f) => f.endsWith(".json"))
    .map((filename) => {
      const filePath = path.join(dir, filename);
      return readJsonFile(filePath, (v) => CollectionSchema.parse(v));
    });
  const bySlug = new Map<string, Collection>(collections.map((c) => [c.slug, c]));
  collectionCache = { dir, collections, bySlug };
  return collections;
}

export function getCollectionBySlug(slug: string): Collection | null {
  const dir = overlayDir("collections");
  if (!collectionCache || collectionCache.dir !== dir) {
    void getAllCollections();
  }
  return collectionCache?.dir === dir ? collectionCache.bySlug.get(slug) ?? null : null;
}

export function getAllPlaybooks(): Playbook[] {
  const dir = overlayDir("playbooks");
  if (playbookCache && playbookCache.dir === dir) return playbookCache.playbooks;
  const playbooks = readDirSafe(dir)
    .filter((f) => f.endsWith(".json"))
    .map((filename) => {
      const filePath = path.join(dir, filename);
      return readJsonFile(filePath, (v) => PlaybookSchema.parse(v));
    })
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.title.localeCompare(b.title));
  const bySlug = new Map<string, Playbook>(playbooks.map((p) => [p.slug, p]));
  playbookCache = { dir, playbooks, bySlug };
  return playbooks;
}

export function getPlaybookBySlug(slug: string): Playbook | null {
  const dir = overlayDir("playbooks");
  if (!playbookCache || playbookCache.dir !== dir) {
    void getAllPlaybooks();
  }
  return playbookCache?.dir === dir ? playbookCache.bySlug.get(slug) ?? null : null;
}

export function getAllPacks(): Pack[] {
  const dir = overlayDir("packs");
  if (packCache && packCache.dir === dir) return packCache.packs;
  const packs = readDirSafe(dir)
    .filter((f) => f.endsWith(".json"))
    .map((filename) => {
      const filePath = path.join(dir, filename);
      return readJsonFile(filePath, (v) => PackSchema.parse(v));
    });
  const bySlug = new Map<string, Pack>(packs.map((p) => [p.slug, p]));
  packCache = { dir, packs, bySlug };
  return packs;
}

export function getPackBySlug(slug: string): Pack | null {
  const dir = overlayDir("packs");
  if (!packCache || packCache.dir !== dir) {
    void getAllPacks();
  }
  return packCache?.dir === dir ? packCache.bySlug.get(slug) ?? null : null;
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
  if (promptCache && promptCache.dir === dir) return promptCache.prompts;
  const prompts = readDirSafe(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(dir, filename), "utf8");
      const parsed = matter(raw);
      const frontmatter = PromptFrontmatterSchema.parse(parsed.data);
      return { slug, frontmatter, content: parsed.content };
    });
  const bySlug = new Map<string, PromptDoc>(prompts.map((p) => [p.slug, p]));
  promptCache = { dir, prompts, bySlug };
  return prompts;
}

export function getPromptBySlug(slug: string): PromptDoc | null {
  const dir = overlayDir("prompts");
  if (!promptCache || promptCache.dir !== dir) {
    void getAllPrompts();
  }
  return promptCache?.dir === dir ? promptCache.bySlug.get(slug) ?? null : null;
}

export function getAllSkills(): SkillDoc[] {
  const dir = overlayDir("skills");
  if (skillCache && skillCache.dir === dir) return skillCache.skills;
  const skills = readDirSafe(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(dir, filename), "utf8");
      const parsed = matter(raw);
      const frontmatter = SkillFrontmatterSchema.parse(parsed.data);
      return { slug, frontmatter, content: parsed.content };
    });
  const bySlug = new Map<string, SkillDoc>(skills.map((s) => [s.slug, s]));
  skillCache = { dir, skills, bySlug };
  return skills;
}

export function getSkillBySlug(slug: string): SkillDoc | null {
  const dir = overlayDir("skills");
  if (!skillCache || skillCache.dir !== dir) {
    void getAllSkills();
  }
  return skillCache?.dir === dir ? skillCache.bySlug.get(slug) ?? null : null;
}
