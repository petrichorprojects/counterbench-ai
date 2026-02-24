import fs from "node:fs";
import path from "node:path";
import MiniSearch from "minisearch";

type DocType = "tool" | "prompt" | "skill" | "playbook";

interface SearchIndexFile {
  version: number;
  built_at_iso: string;
  doc_count: number;
  index: unknown;
  docs: Array<{ id: string; type: DocType; slug: string; title: string; description: string }>;
}

let cached: { mini: MiniSearch; docsById: Map<string, SearchIndexFile["docs"][number]> } | null = null;

export function loadSearchIndex(): { mini: MiniSearch; docsById: Map<string, SearchIndexFile["docs"][number]> } | null {
  if (cached) return cached;
  const filePath = path.join(process.cwd(), "public", "search-index.json");
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw) as SearchIndexFile;

  const mini = MiniSearch.loadJSON(parsed.index as never, {
    fields: ["title", "description", "tags", "categories"],
    storeFields: ["id", "type", "slug", "title", "description"]
  });
  const docsById = new Map(parsed.docs.map((d) => [d.id, d]));
  cached = { mini, docsById };
  return cached;
}

export function searchAll(q: string, limit = 8): Array<{ id: string; type: DocType; slug: string; title: string; description: string }> {
  const index = loadSearchIndex();
  if (!index) return [];
  const hits = index.mini.search(q, { combineWith: "AND", prefix: true }).slice(0, limit);
  const out: Array<{ id: string; type: DocType; slug: string; title: string; description: string }> = [];
  for (const h of hits) {
    const id = String((h as { id?: string }).id ?? "");
    const doc = index.docsById.get(id);
    if (doc) out.push(doc);
  }
  return out;
}

export function searchTools(q: string, limit = 1000): string[] {
  const index = loadSearchIndex();
  if (!index) return [];
  const hits = index.mini.search(q, { combineWith: "AND", prefix: true }).slice(0, limit);
  const slugs: string[] = [];
  for (const h of hits) {
    const id = String((h as { id?: string }).id ?? "");
    if (!id.startsWith("tool:")) continue;
    const doc = index.docsById.get(id);
    if (doc) slugs.push(doc.slug);
  }
  return slugs;
}
