import fs from "node:fs";
import path from "node:path";
import MiniSearch from "minisearch";
import { getAllPrompts, getAllSkills, getAllTools } from "../lib/content";

type DocType = "tool" | "prompt" | "skill";

interface SearchDoc {
  id: string;
  type: DocType;
  slug: string;
  title: string;
  description: string;
  tags: string[];
  categories?: string[];
}

function ensureDir(dirPath: string) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath: string, value: unknown) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(value)}\n`, "utf8");
}

async function main() {
  const tools = getAllTools();
  const prompts = getAllPrompts();
  const skills = getAllSkills();

  const docs: SearchDoc[] = [];

  for (const t of tools) {
    docs.push({
      id: `tool:${t.slug}`,
      type: "tool",
      slug: t.slug,
      title: t.name,
      description: t.description,
      tags: [...t.tags, ...t.platform],
      categories: t.categories
    });
  }
  for (const p of prompts) {
    docs.push({
      id: `prompt:${p.slug}`,
      type: "prompt",
      slug: p.slug,
      title: p.frontmatter.title,
      description: p.frontmatter.description,
      tags: p.frontmatter.tags
    });
  }
  for (const s of skills) {
    docs.push({
      id: `skill:${s.slug}`,
      type: "skill",
      slug: s.slug,
      title: s.frontmatter.title,
      description: s.frontmatter.description,
      tags: s.frontmatter.tags
    });
  }

  const mini = new MiniSearch<SearchDoc>({
    fields: ["title", "description", "tags", "categories"],
    storeFields: ["id", "type", "slug", "title", "description"],
    searchOptions: {
      boost: { title: 4, tags: 2, categories: 2, description: 1 },
      fuzzy: 0.2,
      prefix: true
    }
  });
  mini.addAll(docs);

  const out = {
    version: 1,
    built_at_iso: new Date().toISOString(),
    doc_count: docs.length,
    index: mini.toJSON(),
    docs: docs.map((d) => ({ id: d.id, type: d.type, slug: d.slug, title: d.title, description: d.description }))
  };

  const outPath = path.join(process.cwd(), "public", "search-index.json");
  writeJson(outPath, out);
  console.log(`Wrote ${docs.length} docs to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

