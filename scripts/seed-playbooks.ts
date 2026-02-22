import fs from "node:fs";
import path from "node:path";

type Tool = {
  slug: string;
  name: string;
  description: string;
  categories: string[];
  tags: string[];
  pricing: string;
  platform: string[];
  url: string;
  last_verified: string | null;
};

type Collection = {
  slug: string;
  title: string;
  description: string;
  tool_slugs: string[];
  order: number;
  seo: { title: string; description: string };
};

const ROOT = process.cwd();
const CONTENT_ROOT = process.env.CB_CONTENT_ROOT?.trim() ? process.env.CB_CONTENT_ROOT.trim() : "content_preview";
const TOOLS_DIR = path.join(ROOT, CONTENT_ROOT, "tools");
const OUT_DIR = path.join(ROOT, CONTENT_ROOT, "collections");

function readTools(): Tool[] {
  if (!fs.existsSync(TOOLS_DIR)) throw new Error(`Missing tools dir: ${TOOLS_DIR}`);
  return fs
    .readdirSync(TOOLS_DIR)
    .filter((f) => f.endsWith(".json") && !f.startsWith("."))
    .map((f) => JSON.parse(fs.readFileSync(path.join(TOOLS_DIR, f), "utf8")) as Tool);
}

function scoreTool(t: Tool, keywords: readonly string[]): number {
  const hay = `${t.name} ${t.description} ${(t.categories || []).join(" ")} ${(t.tags || []).join(" ")}`.toLowerCase();
  let score = 0;
  for (const k of keywords) {
    const kk = k.toLowerCase();
    if (hay.includes(kk)) score += 3;
  }

  // Prefer verified entries slightly.
  if (t.last_verified) score += 1;

  // Penalize obviously corrupted numeric names.
  if (!/[A-Za-z]/.test(t.name || "")) score -= 100;

  return score;
}

function pickTools(tools: Tool[], keywords: readonly string[], n: number, used: Set<string>): string[] {
  const ranked = tools
    .map((t) => ({ t, s: scoreTool(t, keywords) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.t)
    .filter((t) => !used.has(t.slug));

  const picked: string[] = [];
  for (const t of ranked) {
    picked.push(t.slug);
    used.add(t.slug);
    if (picked.length >= n) return picked;
  }

  // Fallback: fill with any remaining tools.
  for (const t of tools) {
    if (used.has(t.slug)) continue;
    if (!/[A-Za-z]/.test(t.name || "")) continue;
    picked.push(t.slug);
    used.add(t.slug);
    if (picked.length >= n) break;
  }

  return picked;
}

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

function writeJson(filePath: string, value: unknown) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function main() {
  const tools = readTools();
  ensureDir(OUT_DIR);

  const defs = [
    {
      slug: "solo-intake-starter",
      title: "Solo intake starter stack",
      description: "A lightweight setup for client intake, summarization, and follow-ups.",
      keywords: ["intake", "client", "intake form", "crm", "email", "summary", "follow-up", "questionnaire"]
    },
    {
      slug: "contract-review-drafting",
      title: "Contract review and drafting stack",
      description: "Tools to review clauses, draft redlines, and generate first-pass agreements.",
      keywords: ["contract", "clause", "redline", "nda", "msa", "draft", "agreement", "review"]
    },
    {
      slug: "legal-research-briefs",
      title: "Legal research and brief building",
      description: "Research assistants and drafting helpers for memos, briefs, and citations.",
      keywords: ["research", "brief", "memo", "case law", "citation", "westlaw", "lexis", "verdict"]
    },
    {
      slug: "ediscovery-doc-review",
      title: "eDiscovery and document review",
      description: "Tools for doc review, extraction, summarization, and review workflows.",
      keywords: ["ediscovery", "document review", "pdf", "extraction", "summarize", "discovery", "deposition"]
    },
    {
      slug: "privacy-compliance",
      title: "Privacy and compliance monitoring",
      description: "Support compliance checks, policy drafts, and risk monitoring workflows.",
      keywords: ["compliance", "privacy", "gdpr", "hipaa", "soc 2", "risk", "policy", "audit"]
    },
    {
      slug: "litigation-support",
      title: "Litigation support toolkit",
      description: "Deposition prep, chronology building, issue spotting, and motion drafting support.",
      keywords: ["litigation", "deposition", "chronology", "motion", "pleading", "dispute", "trial"]
    },
    {
      slug: "ip-and-patents",
      title: "IP and patents workflow",
      description: "Tools for IP research, patent drafting support, and prior art organization.",
      keywords: ["patent", "prior art", "ip", "trademark", "invention", "claim", "office action"]
    },
    {
      slug: "document-automation",
      title: "Document automation and templates",
      description: "Generate, fill, and manage document templates with consistent outputs.",
      keywords: ["document", "template", "automation", "generate", "fill", "forms", "docx"]
    },
    {
      slug: "knowledge-management",
      title: "Knowledge management and internal search",
      description: "Search, summarize, and organize internal knowledge and matter notes.",
      keywords: ["knowledge", "search", "notion", "wiki", "notes", "organize", "summarize"]
    },
    {
      slug: "firm-ops-efficiency",
      title: "Firm ops and efficiency stack",
      description: "Scheduling, billing support, client comms, and internal ops helpers.",
      keywords: ["billing", "time tracking", "schedule", "calendar", "invoice", "operations", "workflow"]
    }
  ] as const;

  const used = new Set<string>();
  const collections: Collection[] = [];

  let order = 10;
  for (const d of defs) {
    const picked = pickTools(tools, d.keywords, 8, used);
    collections.push({
      slug: d.slug,
      title: d.title,
      description: d.description,
      tool_slugs: picked,
      order,
      seo: {
        title: `${d.title} | Counterbench.AI`,
        description: d.description
      }
    });
    order += 10;
  }

  // Write files.
  for (const c of collections) {
    writeJson(path.join(OUT_DIR, `${c.slug}.json`), c);
  }

  console.log(JSON.stringify({ content_root: CONTENT_ROOT, collections_written: collections.length, out_dir: OUT_DIR }, null, 2));
}

main();
