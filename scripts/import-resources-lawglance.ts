import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

type ResourceType = "program" | "research" | "toolkit" | "policy" | "community" | "course" | "news" | "other";
type SourceType =
  | "case-law"
  | "statutes-regulation"
  | "dockets-filings"
  | "scholarship"
  | "datasets-benchmarks"
  | "research-platform"
  | "other";
type AccessType = "open" | "commercial" | "api" | "bulk" | "mixed" | "unknown";
type FinderTask = "research" | "citation-check" | "docket-watch" | "policy-check" | "benchmarking";

type Resource = {
  slug: string;
  title: string;
  description: string;
  url: string;
  tags: string[];
  type: ResourceType;
  last_checked: string | null;
  jurisdiction: string[];
  source_type: SourceType;
  access: AccessType[];
  coverage: string;
  license_notes: string;
  best_for: FinderTask[];
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

function cleanText(raw: string): string {
  return raw
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\[[^\]]+\]\((https?:\/\/[^\s)]+)\)/g, "$1")
    .replace(/^[^\p{L}\p{N}]+/u, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeHeading(raw: string): string {
  return cleanText(raw).toLowerCase();
}

function sectionNameFromHeading(heading: string): "coverage" | "stack" | "roadmap" | "dev-quickstart" | "none" {
  const h = normalizeHeading(heading);
  if (h.includes("legal coverage")) return "coverage";
  if (h.includes("tools") && h.includes("technologies")) return "stack";
  if (h.includes("future roadmap")) return "roadmap";
  if (h.includes("developer quick start")) return "dev-quickstart";
  return "none";
}

function parseCoverage(lines: string[], sectionStart: number, sectionEnd: number): string[] {
  const out: string[] = [];
  for (let i = sectionStart + 1; i < sectionEnd; i += 1) {
    const line = lines[i] ?? "";
    const m = line.match(/^\s*-\s+(.+)$/);
    if (!m) continue;
    const value = cleanText(m[1] ?? "");
    if (!value) continue;
    out.push(value.replace(/^the\s+/i, "The "));
  }
  return out;
}

function parseStack(lines: string[], sectionStart: number, sectionEnd: number): string[] {
  const out = new Set<string>();

  for (let i = sectionStart + 1; i < sectionEnd; i += 1) {
    const line = lines[i] ?? "";
    if (!line.includes("|")) continue;
    const cols = line.split("|").map((c) => cleanText(c));
    if (cols.length < 3) continue;

    const tech = cols[1] ?? "";
    if (!tech || tech.toLowerCase() === "technology") continue;
    if (/^-+$/.test(tech)) continue;
    out.add(tech);
  }

  const raw = lines.slice(sectionStart, sectionEnd).join("\n").toLowerCase();
  if (raw.includes("crew ai") || raw.includes("crewai")) out.add("Crew AI");
  if (raw.includes("redis")) out.add("Redis");

  return [...out];
}

function parseRoadmap(lines: string[], sectionStart: number, sectionEnd: number): Array<{ title: string; detail: string }> {
  const out: Array<{ title: string; detail: string }> = [];

  for (let i = sectionStart + 1; i < sectionEnd; i += 1) {
    const line = lines[i] ?? "";
    const m = line.match(/^\s*\d+\.\s+(.+)$/);
    if (!m) continue;

    const title = cleanText(m[1] ?? "").replace(/\s*[:\-]\s*$/, "");
    let detail = "";

    for (let j = i + 1; j < sectionEnd; j += 1) {
      const next = lines[j] ?? "";
      if (/^\s*\d+\.\s+/.test(next)) break;
      const bullet = next.match(/^\s*\*\s+(.+)$/);
      if (bullet) {
        detail = cleanText(bullet[1] ?? "");
        break;
      }
    }

    out.push({ title, detail });
  }

  return out;
}

function techUrl(tech: string): string {
  const t = tech.toLowerCase();
  if (t.includes("langchain")) return "https://python.langchain.com/docs/introduction/";
  if (t.includes("chromadb")) return "https://www.trychroma.com/";
  if (t.includes("django")) return "https://www.djangoproject.com/";
  if (t.includes("openai")) return "https://platform.openai.com/docs/overview";
  if (t.includes("crew")) return "https://www.crewai.com/";
  if (t.includes("redis")) return "https://redis.io/";
  return "https://github.com/lawglance/lawglance";
}

function policyCheckTags(title: string): FinderTask[] {
  const t = title.toLowerCase();
  if (t.includes("case management") || t.includes("document")) return ["research", "benchmarking"];
  if (t.includes("voice") || t.includes("multi-lingual") || t.includes("multilingual")) return ["research"];
  if (t.includes("search") || t.includes("precision")) return ["research", "citation-check"];
  return ["research", "policy-check"];
}

function main() {
  const repoRoot = process.cwd();
  const contentRoot = process.env.CB_CONTENT_ROOT?.trim() ? process.env.CB_CONTENT_ROOT.trim() : "content";
  const inPath = argValue("in") || path.join(repoRoot, "data", "third_party", "lawglance", "README.md");
  const outDir = argValue("outDir") || path.join(repoRoot, contentRoot, "resources", "lawglance");
  const lastChecked = argValue("lastChecked") || new Date().toISOString().slice(0, 10);

  if (!fs.existsSync(inPath)) {
    console.error(`Missing input README: ${inPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(inPath, "utf8");
  const lines = raw.split(/\r?\n/);

  const sectionHeaders: Array<{ idx: number; name: ReturnType<typeof sectionNameFromHeading> }> = [];
  for (let i = 0; i < lines.length; i += 1) {
    const m = (lines[i] ?? "").match(/^##\s+(.+?)\s*$/);
    if (!m) continue;
    sectionHeaders.push({ idx: i, name: sectionNameFromHeading(m[1] ?? "") });
  }

  function bounds(name: ReturnType<typeof sectionNameFromHeading>) {
    const found = sectionHeaders.find((s) => s.name === name);
    if (!found) return null;
    const next = sectionHeaders.find((s) => s.idx > found.idx);
    return { start: found.idx, end: next ? next.idx : lines.length };
  }

  const coverageBounds = bounds("coverage");
  const stackBounds = bounds("stack");
  const roadmapBounds = bounds("roadmap");
  const quickStartBounds = bounds("dev-quickstart");

  const coverage = coverageBounds ? parseCoverage(lines, coverageBounds.start, coverageBounds.end) : [];
  const stack = stackBounds ? parseStack(lines, stackBounds.start, stackBounds.end) : [];
  const roadmap = roadmapBounds ? parseRoadmap(lines, roadmapBounds.start, roadmapBounds.end) : [];

  ensureDir(outDir);

  const resources: Resource[] = [];

  resources.push({
    slug: "lawglance",
    title: "LawGlance",
    description:
      "Open-source AI-powered legal assistant using RAG for accessible legal guidance, with current focus on Indian legal materials and planned global expansion.",
    url: "https://github.com/lawglance/lawglance",
    tags: ["LawGlance", "Open-source legal AI", "RAG"],
    type: "research",
    last_checked: lastChecked,
    jurisdiction: ["India", "Global / Multi-jurisdictional"],
    source_type: "research-platform",
    access: ["open"],
    coverage: "People-centric legal AI assistant with legal corpus coverage and roadmap for multilingual and global support.",
    license_notes: "Apache-2.0 licensed repository. Verify legal corpus licensing and jurisdiction-specific compliance before production use.",
    best_for: ["research", "policy-check"]
  });

  for (const law of coverage) {
    const slug = `lg-coverage-${slugify(law)}-${hash6(law)}`;
    resources.push({
      slug,
      title: law,
      description: "Legal corpus item listed in LawGlance current coverage.",
      url: "https://github.com/lawglance/lawglance#-legal-coverage",
      tags: ["LawGlance", "Coverage", "India"],
      type: "policy",
      last_checked: lastChecked,
      jurisdiction: ["India"],
      source_type: "statutes-regulation",
      access: ["open"],
      coverage: law,
      license_notes: "Coverage list from LawGlance README. Validate primary legal text source and recency before operational use.",
      best_for: ["policy-check", "research"]
    });
  }

  for (const tech of stack) {
    const slug = `lg-stack-${slugify(tech)}-${hash6(tech)}`;
    const access: AccessType[] = tech.toLowerCase().includes("openai") ? ["open", "api"] : ["open"];
    resources.push({
      slug,
      title: tech,
      description: `Technology used in LawGlance architecture (${tech}).`,
      url: techUrl(tech),
      tags: ["LawGlance", "Stack", "Implementation"],
      type: "toolkit",
      last_checked: lastChecked,
      jurisdiction: ["Global / Multi-jurisdictional"],
      source_type: "research-platform",
      access,
      coverage: `LawGlance implementation stack component: ${tech}.`,
      license_notes: "Check individual technology license and service terms before commercial deployment.",
      best_for: ["research", "benchmarking"]
    });
  }

  for (const item of roadmap) {
    const basis = `${item.title} ${item.detail}`.trim();
    const slug = `lg-roadmap-${slugify(item.title)}-${hash6(basis)}`;
    resources.push({
      slug,
      title: item.title,
      description: item.detail || "Planned roadmap item from LawGlance README.",
      url: "https://github.com/lawglance/lawglance#-future-roadmap",
      tags: ["LawGlance", "Roadmap", "Product strategy"],
      type: "program",
      last_checked: lastChecked,
      jurisdiction: ["Global / Multi-jurisdictional"],
      source_type: "other",
      access: ["unknown"],
      coverage: item.detail || item.title,
      license_notes: "Roadmap statements are forward-looking and may change.",
      best_for: policyCheckTags(item.title)
    });
  }

  if (quickStartBounds) {
    resources.push({
      slug: "lg-developer-quickstart",
      title: "LawGlance Developer Quick Start",
      description: "Setup flow for local development, dependencies, and running the app.",
      url: "https://github.com/lawglance/lawglance#-developer-quick-start-guide",
      tags: ["LawGlance", "Developer", "Setup"],
      type: "course",
      last_checked: lastChecked,
      jurisdiction: ["Global / Multi-jurisdictional"],
      source_type: "other",
      access: ["open"],
      coverage: "Clone repo, install uv, set OPENAI_API_KEY, run streamlit app, optional Redis caching.",
      license_notes: "Open-source setup instructions in Apache-2.0 repository.",
      best_for: ["research", "benchmarking"]
    });
  }

  for (const resource of resources) {
    fs.writeFileSync(path.join(outDir, `${resource.slug}.json`), JSON.stringify(resource, null, 2) + "\n", "utf8");
  }

  console.log(
    JSON.stringify(
      {
        input: inPath,
        output_dir: outDir,
        generated_at: new Date().toISOString(),
        resources_written: resources.length,
        coverage_items: coverage.length,
        stack_items: stack.length,
        roadmap_items: roadmap.length
      },
      null,
      2
    )
  );
}

main();
