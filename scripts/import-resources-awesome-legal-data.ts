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
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanHeading(raw: string): string {
  return cleanText(raw).replace(/^#+\s*/, "").trim();
}

function classifySourceType(title: string, description: string, url: string): SourceType {
  const hay = `${title} ${description} ${url}`.toLowerCase();

  if (/docket|recap|pacer|filing|gazette/.test(hay)) return "dockets-filings";
  if (/case law|judgment|jurisprudence|court|opinion|citator/.test(hay)) return "case-law";
  if (/statute|legislation|regulation|federal register|code of federal regulations|official law|cfr|usc\b/.test(hay)) {
    return "statutes-regulation";
  }
  if (/dataset|benchmark|corpus|nlp|retrieval|classification|entailment|prediction/.test(hay)) return "datasets-benchmarks";
  if (/journal|scholarship|ssrn|preprint/.test(hay)) return "scholarship";
  if (/platform|research|database|portal|information institute|lii/.test(hay)) return "research-platform";
  return "other";
}

function inferBestFor(sourceType: SourceType): FinderTask[] {
  switch (sourceType) {
    case "case-law":
      return ["research", "citation-check"];
    case "statutes-regulation":
      return ["research", "policy-check"];
    case "dockets-filings":
      return ["docket-watch", "research"];
    case "datasets-benchmarks":
      return ["benchmarking", "research"];
    case "scholarship":
      return ["research", "citation-check"];
    case "research-platform":
      return ["research"];
    default:
      return ["research"];
  }
}

function parseAccess(meta: string): AccessType[] {
  const s = meta.toLowerCase();
  const out = new Set<AccessType>();

  if (!s) {
    out.add("unknown");
    return [...out];
  }

  if (s.includes("open")) out.add("open");
  if (s.includes("commercial")) out.add("commercial");
  if (s.includes("api")) out.add("api");
  if (s.includes("bulk")) out.add("bulk");
  if (s.includes("mixed")) out.add("mixed");

  if (out.size > 1 && out.has("open") && out.has("commercial")) out.add("mixed");
  if (out.size === 0) out.add("unknown");
  return [...out];
}

function normalizeUrl(url: string): string | null {
  const s = url.trim();
  if (!s) return null;
  try {
    return new URL(s).toString();
  } catch {
    return null;
  }
}

function shouldSkipLine(line: string): boolean {
  const s = line.trim();
  if (!s.startsWith("- ")) return true;
  if (s.includes("shields.io")) return true;
  if (s.includes("awesome")) return true;
  return false;
}

function extractFirstMarkdownLink(line: string): { title: string; url: string; index: number; rawLength: number } | null {
  const strict = /\[([^\]]+?)\]\((https?:\/\/[^\s)]+)\)/g;
  const relaxed = /\[([^\]]+?)\]\s*\((https?:\/\/[^\s)]+)\)/g;

  const m = strict.exec(line) ?? relaxed.exec(line);
  if (!m) return null;

  return {
    title: cleanText(m[1] ?? ""),
    url: cleanText(m[2] ?? ""),
    index: m.index,
    rawLength: m[0]?.length ?? 0
  };
}

function stripLegend(raw: string): { text: string; legend: string } {
  const legends = Array.from(raw.matchAll(/\*\(([^*]+)\)\*/g)).map((m) => cleanText(m[1] ?? "")).filter(Boolean);
  const legend = legends.join("; ");
  const withoutLegend = raw.replace(/\*\(([^*]+)\)\*/g, " ");
  const withoutLinks = withoutLegend.replace(/\[([^\]]+?)\]\((https?:\/\/[^\s)]+)\)/g, "$1");
  const withoutOrphanBrackets = withoutLinks.replace(/\[([^\]]+)\]/g, "$1");
  const text = cleanText(withoutOrphanBrackets.replace(/^[\s,•-]+/, "").replace(/^[-–—]+\s*/, ""));
  return { text, legend };
}

function inferType(sourceType: SourceType): ResourceType {
  if (sourceType === "datasets-benchmarks") return "research";
  if (sourceType === "scholarship") return "research";
  if (sourceType === "research-platform") return "research";
  if (sourceType === "dockets-filings") return "policy";
  return "research";
}

function licenseNotesForAccess(access: AccessType[]): string {
  if (access.includes("commercial") && access.includes("open")) {
    return "Mixed model; verify licensing and redistribution limits before operational use.";
  }
  if (access.includes("commercial")) {
    return "Commercial source; check subscription and downstream use constraints.";
  }
  if (access.includes("open")) {
    return "Listed as open in source index; verify source-specific terms before reuse.";
  }
  return "Verify licensing terms at the source before reuse.";
}

function main() {
  const repoRoot = process.cwd();
  const contentRoot = process.env.CB_CONTENT_ROOT?.trim() ? process.env.CB_CONTENT_ROOT.trim() : "content";
  const inPath = argValue("in") || path.join(repoRoot, "data", "third_party", "awesome-legal-data", "README.md");
  const outDir = argValue("outDir") || path.join(repoRoot, contentRoot, "resources", "awesome-legal-data");
  const lastChecked = argValue("lastChecked") || new Date().toISOString().slice(0, 10);

  if (!fs.existsSync(inPath)) {
    console.error(`Missing input README: ${inPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(inPath, "utf8");
  const lines = raw.split(/\r?\n/);

  let h2 = "";
  let h3 = "";
  const byUrl = new Map<string, Resource>();

  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+?)\s*$/);
    if (h2Match) {
      h2 = cleanHeading(h2Match[1] ?? "");
      h3 = "";
      continue;
    }

    const h3Match = line.match(/^###\s+(.+?)\s*$/);
    if (h3Match) {
      h3 = cleanHeading(h3Match[1] ?? "");
      continue;
    }

    if (shouldSkipLine(line)) continue;

    const link = extractFirstMarkdownLink(line);
    if (!link) continue;

    const url = normalizeUrl(link.url);
    if (!url) continue;

    const afterFirstLink = line.slice(link.index + link.rawLength).trim();
    let detailRaw = afterFirstLink;

    // Entries with multiple links often put the actual description after the first dash.
    const firstDash = detailRaw.search(/\s[—–-]\s/);
    if (firstDash >= 0) {
      detailRaw = detailRaw.slice(firstDash + 3);
    }

    detailRaw = detailRaw.replace(/^\)\s*[\-—–]?\s*/, "").trim();
    const { text: detailText, legend } = stripLegend(detailRaw);

    const sourceType = classifySourceType(link.title, detailText, url);
    const access = parseAccess(legend);
    const primaryJurisdiction = h3 || h2 || "Global / Multi-jurisdictional";
    const jurisdiction = [primaryJurisdiction];
    const tags = [
      "Awesome Legal Data",
      primaryJurisdiction,
      sourceType.replace("-", " "),
      ...(legend ? [legend] : [])
    ];

    const slugBase = slugify(link.title) || `source-${hash6(url)}`;
    const slug = `ald-${slugBase}-${hash6(url)}`;

    const existing = byUrl.get(url);
    if (existing) {
      const jurisdictionSet = new Set([...existing.jurisdiction, ...jurisdiction]);
      existing.jurisdiction = [...jurisdictionSet];
      continue;
    }

    byUrl.set(url, {
      slug,
      title: link.title,
      description: detailText || `Legal data source listed in Awesome Legal Data (${primaryJurisdiction}).`,
      url,
      tags,
      type: inferType(sourceType),
      last_checked: lastChecked,
      jurisdiction,
      source_type: sourceType,
      access,
      coverage: detailText,
      license_notes: licenseNotesForAccess(access),
      best_for: inferBestFor(sourceType)
    });
  }

  ensureDir(outDir);

  const indexResource: Resource = {
    slug: "awesome-legal-data",
    title: "Awesome Legal Data",
    description:
      "A curated list of legal data sources and legal NLP datasets grouped by jurisdiction. Used by Counterbench to build source maps and finder workflows.",
    url: "https://github.com/openlegaldata/awesome-legal-data",
    tags: ["Awesome Legal Data", "Open Legal Data", "Counterbench Source Map"],
    type: "research",
    last_checked: lastChecked,
    jurisdiction: ["Global / Multi-jurisdictional"],
    source_type: "research-platform",
    access: ["mixed"],
    coverage: "Global and jurisdiction-specific index of legal data repositories, APIs, case law, legislation, and datasets.",
    license_notes: "Repository does not declare an explicit software/content license in metadata; use as an index and verify each downstream source.",
    best_for: ["research", "citation-check", "policy-check"]
  };

  fs.writeFileSync(path.join(outDir, `${indexResource.slug}.json`), JSON.stringify(indexResource, null, 2) + "\n", "utf8");

  const items = Array.from(byUrl.values()).sort((a, b) => a.title.localeCompare(b.title));
  for (const resource of items) {
    fs.writeFileSync(path.join(outDir, `${resource.slug}.json`), JSON.stringify(resource, null, 2) + "\n", "utf8");
  }

  console.log(
    JSON.stringify(
      {
        input: inPath,
        output_dir: outDir,
        generated_at: new Date().toISOString(),
        resources_written: items.length + 1
      },
      null,
      2
    )
  );
}

main();
