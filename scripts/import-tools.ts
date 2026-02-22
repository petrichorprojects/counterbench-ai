import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { ToolSchema, type Tool } from "../lib/schemas";
import { slugify } from "../lib/slug";

type CsvRow = Record<string, string>;

type ToolNoSlug = Omit<Tool, "slug">;

type ToolDraft = ToolNoSlug & {
  _key: string;
};

const ROOT = process.cwd();
const DEFAULT_IN = path.join(ROOT, "data", "tools.csv");
const CONTENT_ROOT = process.env.CB_CONTENT_ROOT?.trim() ? process.env.CB_CONTENT_ROOT.trim() : "content_preview";
const OUT_DIR_DEFAULT = path.join(ROOT, CONTENT_ROOT, "tools");

const DISALLOWED_HOSTS = new Set(["base44.pxf.io"]);

function stableSuffix(input: string): string {
  return createHash("sha1").update(input).digest("hex").slice(0, 6);
}

function normalizeUrl(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  try {
    const url = new URL(s);
    return url.toString();
  } catch {
    return null;
  }
}

function canonicalizeUrl(urlString: string): string {
  const url = new URL(urlString);
  url.hash = "";

  // Drop common tracking/affiliate params.
  for (const k of [...url.searchParams.keys()]) {
    const key = k.toLowerCase();
    if (key.startsWith("utm_") || key === "ref" || key === "fid" || key === "via" || key === "source") {
      url.searchParams.delete(k);
    }
  }

  if ([...url.searchParams.keys()].length === 0) url.search = "";
  if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, "");
  return url.toString();
}

function isValidTaaftToolUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (host !== "theresanaiforthat.com") return false;
    const p = url.pathname || "";
    if (p.includes("/comment/")) return false;
    if (p.startsWith("/ai/")) return true;
    if (p.startsWith("/gpt/")) return true;
    return false;
  } catch {
    return false;
  }
}

function isAllowedExternalUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (DISALLOWED_HOSTS.has(host)) return false;
    return true;
  } catch {
    return false;
  }
}

function inferPricing(raw: string): Tool["pricing"] {
  const s = raw.toLowerCase();
  if (!s) return "unknown";
  if (s.includes("freemium")) return "freemium";
  if (s.includes("trial")) return "trial";
  if (s.includes("free")) return "free";
  if (s.includes("$") || s.includes("paid") || s.includes("subscription")) return "paid";
  return "unknown";
}

function inferPlatform(raw: string): string[] {
  const s = raw.toLowerCase();
  const out = new Set<string>();
  if (!s) return [];
  if (s.includes("web")) out.add("web");
  if (s.includes("chrome")) out.add("chrome");
  if (s.includes("ios")) out.add("ios");
  if (s.includes("android")) out.add("android");
  if (s.includes("slack")) out.add("slack");
  if (s.includes("desktop")) out.add("desktop");
  if (out.size === 0) out.add("web");
  return [...out];
}

function splitList(raw: string): string[] {
  return raw
    .split(/[,;|]/g)
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 30);
}

function cleanLabel(input: string): string {
  // Strip leading emoji/punctuation.
  return input.replace(/^[^\p{L}\p{N}]+/gu, "").trim();
}

function ensureDir(dirPath: string) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function parseCsv(text: string): CsvRow[] {
  const rows: string[][] = [];
  let i = 0;
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    rows.push(row);
    row = [];
  };

  while (i < text.length) {
    const c = text[i] ?? "";
    if (inQuotes) {
      if (c === '"') {
        const next = text[i + 1];
        if (next === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += c;
      i += 1;
      continue;
    }

    if (c === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (c === ",") {
      pushField();
      i += 1;
      continue;
    }
    if (c === "\n") {
      pushField();
      pushRow();
      i += 1;
      continue;
    }
    if (c === "\r") {
      i += 1;
      continue;
    }
    field += c;
    i += 1;
  }

  pushField();
  if (row.length > 1 || row[0]?.trim()) pushRow();

  const header = (rows.shift() ?? []).map((h) => (h ?? "").trim());
  const out: CsvRow[] = [];

  for (const r of rows) {
    // Heuristic repair for occasional unescaped commas in the name field.
    // If a row has more columns than the header, merge fields into name until the first URL.
    let rowFixed = r;
    if (r.length !== header.length) {
      const firstUrlIdx = r.findIndex((v) => (v ?? "").trim().startsWith("http"));
      if (firstUrlIdx > 2) {
        const mergedName = r.slice(1, firstUrlIdx).join(",").trim();
        rowFixed = [r[0] ?? "", mergedName, ...r.slice(firstUrlIdx)];
      }
      if (rowFixed.length > header.length) rowFixed = rowFixed.slice(0, header.length);
      while (rowFixed.length < header.length) rowFixed.push("");
    }

    const obj: CsvRow = {};
    for (let idx = 0; idx < header.length; idx += 1) {
      const headerKey = header[idx] ?? "";
      const key = headerKey.trim() ? headerKey : `col_${idx}`;
      obj[key] = (rowFixed[idx] ?? "").trim();
    }
    out.push(obj);
  }

  return out;
}

function pick(row: CsvRow, keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (v && v.trim()) return v.trim();
  }
  return "";
}

function scoreText(hay: string, needles: string[]): number {
  let score = 0;
  for (const n of needles) {
    if (hay.includes(n)) score += 1;
  }
  return score;
}

function mergeDraft(existing: ToolDraft, incoming: ToolDraft): ToolDraft {
  const merged: ToolDraft = { ...existing };

  const hasAlpha = (s: string): boolean => /[A-Za-z]/.test(s);
  if (!hasAlpha(existing.name) && hasAlpha(incoming.name)) {
    merged.name = incoming.name;
  } else if (hasAlpha(incoming.name) && incoming.name.length > existing.name.length + 6) {
    merged.name = incoming.name;
  }


  // Prefer external URLs when they exist and are allowed.
  if (incoming.url && incoming.url !== existing.url && isAllowedExternalUrl(incoming.url)) {
    merged.url = incoming.url;
  }

  // Prefer richer descriptions.
  if ((incoming.description?.length ?? 0) > (existing.description?.length ?? 0)) {
    merged.description = incoming.description;
  }

  merged.categories = [...new Set([...(existing.categories ?? []), ...(incoming.categories ?? [])])];
  merged.tags = [...new Set([...(existing.tags ?? []), ...(incoming.tags ?? [])])];
  merged.platform = [...new Set([...(existing.platform ?? []), ...(incoming.platform ?? [])])];

  if (incoming.last_verified && (!existing.last_verified || incoming.last_verified > existing.last_verified)) {
    merged.last_verified = incoming.last_verified;
  }

  if (!merged.affiliate_url && incoming.affiliate_url) merged.affiliate_url = incoming.affiliate_url;

  return merged;
}

async function main() {
  const inPath = process.argv.includes("--in") ? (process.argv[process.argv.indexOf("--in") + 1] ?? "") : DEFAULT_IN;
  const outDir = process.argv.includes("--out") ? (process.argv[process.argv.indexOf("--out") + 1] ?? "") : OUT_DIR_DEFAULT;

  if (!inPath || !fs.existsSync(inPath)) {
    throw new Error(`CSV not found at ${inPath}`);
  }

  if (!outDir) {
    throw new Error("Missing output directory (resolved empty).");
  }

  ensureDir(outDir);

  const raw = fs.readFileSync(inPath, "utf8");
  const rows = parseCsv(raw);

  const byKey = new Map<string, ToolDraft>();
  const missing: string[] = [];
  const invalid: string[] = [];
  let mergedCount = 0;

  for (const row of rows) {
    const name = pick(row, ["name", "tool_name", "title"]).trim();
    const taaftToolRaw = pick(row, ["taaft_tool_url"]);
    const taaftToolUrl = normalizeUrl(taaftToolRaw);
    if (taaftToolUrl && !isValidTaaftToolUrl(taaftToolUrl)) {
      continue;
    }
    const taaftKey = taaftToolUrl ? canonicalizeUrl(taaftToolUrl) : null;

    const externalRaw = pick(row, ["external_website", "url", "website", "link"]);
    const externalUrl = normalizeUrl(externalRaw);

    const description = pick(row, ["description", "summary", "tagline"]);

    // Scraper outputs: tag_primary and tags_secondary (often ';' delimited).
    const tagPrimary = cleanLabel(pick(row, ["tag_primary", "category", "categories"]));
    const categories = splitList(tagPrimary).map(cleanLabel).filter(Boolean);

    const tagsSecondaryRaw = pick(row, ["tags_secondary", "tags", "tag"]);
    const tags = splitList(tagsSecondaryRaw)
      .map(cleanLabel)
      .filter(Boolean)
      // drop junk that shows up in some exports
      .filter((t) => t.toLowerCase() !== name.toLowerCase())
      .slice(0, 30);

    const pricingRaw = pick(row, ["pricing", "pricing_tier"]);
    const platformRaw = pick(row, ["platform", "platforms"]);
    const affiliate = normalizeUrl(pick(row, ["affiliate_url"]));
    const scrapedAt = pick(row, ["scraped_at_iso"]);

    const preferredUrl = externalUrl && isAllowedExternalUrl(externalUrl) ? externalUrl : (taaftKey ?? taaftToolUrl);
    const key = taaftKey ?? (preferredUrl ? canonicalizeUrl(preferredUrl) : "");

    if (!name || !key || !preferredUrl) {
      missing.push(JSON.stringify({ name, key, external: externalRaw, taaft: taaftToolRaw }).slice(0, 220));
      continue;
    }

    // If the record looks corrupted, allow a later merge to override it.
    const looksBad = scoreText(`${name} ${description} ${tags.join(" ")}`.toLowerCase(), ["released", "mo ago"]) >= 2 && !externalUrl;

    const draft: ToolDraft = {
      _key: key,
      name,
      description: description || "Description pending verification.",
      categories: categories.length ? categories : ["Legal"],
      tags,
      pricing: inferPricing(pricingRaw),
      platform: inferPlatform(platformRaw || "web"),
      url: preferredUrl,
      affiliate_url: affiliate,
      logo: null,
      featured: false,
      last_verified: scrapedAt ? scrapedAt.slice(0, 10) : null,
      status: "unknown",
      change_log: [
        {
          date: new Date().toISOString().slice(0, 10),
          note: "Imported into Counterbench.AI catalog"
        }
      ]
    };

    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, draft);
      continue;
    }

    // Merge strategy: if existing looks bad but incoming looks better, prefer incoming for url/desc.
    const merged = mergeDraft(existing, draft);
    if (looksBad && (externalUrl || (description && description.length > 40))) {
      merged.url = preferredUrl;
      merged.description = draft.description;
    }

    byKey.set(key, merged);
    mergedCount += 1;
  }

  // Assign readable slugs after merging.
  const usedSlugs = new Set<string>();
  const tools: Tool[] = [];

  for (const d of byKey.values()) {
    const baseSlug = slugify(d.name);
    let slug = baseSlug;
    if (usedSlugs.has(slug)) slug = `${baseSlug}-${stableSuffix(d._key)}`;
    usedSlugs.add(slug);

    const tool = ToolSchema.parse({
      slug,
      name: d.name,
      description: d.description,
      categories: d.categories,
      tags: d.tags,
      pricing: d.pricing,
      platform: d.platform,
      url: d.url,
      affiliate_url: d.affiliate_url,
      logo: d.logo,
      featured: d.featured,
      last_verified: d.last_verified,
      status: d.status,
      change_log: d.change_log
    });

    tools.push(tool);
  }

  // Clear previous outputs (avoid stale JSON files after slug changes).
  for (const f of fs.readdirSync(outDir)) {
    if (f.endsWith(".json")) fs.rmSync(path.join(outDir, f));
  }

  for (const tool of tools) {
    const outPath = path.join(outDir, `${tool.slug}.json`);
    fs.writeFileSync(outPath, `${JSON.stringify(tool, null, 2)}\n`, "utf8");
  }

  const report = {
    input_rows: rows.length,
    tools_written: tools.length,
    merged_records: mergedCount,
    missing_fields: missing.length,
    invalid: invalid.length,
    out_dir: outDir
  };

  console.log(JSON.stringify(report, null, 2));
  if (missing.length) console.log("missing_sample:", missing.slice(0, 10));
  if (invalid.length) console.log("invalid_sample:", invalid.slice(0, 10));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
