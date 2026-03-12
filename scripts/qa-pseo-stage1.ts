import fs from "node:fs";
import path from "node:path";
import { GuideSchema, type Guide } from "../lib/guides";

type ManifestPage = {
  slug: string;
  title: string;
  playbook_type: string;
  primary_keyword: string;
  search_intent: string;
  content_type: "informational" | "utility";
  min_words: number;
  generated_words: number;
  parent_category_url: string;
  sibling_urls: string[];
  cross_playbook_urls: string[];
  related_pages: string[];
  internal_links: string[];
};

type Manifest = {
  generated_at: string;
  stage: string;
  description: string;
  page_count: number;
  pages: ManifestPage[];
};

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, "out", "pseo-stage1-manifest.json");
const GUIDES_DIR = path.join(ROOT, "content", "guides");
const OUT_DIR = path.join(ROOT, "out");

const REQUIRED_PLAYBOOKS = new Set([
  "Templates",
  "Curation",
  "Conversions",
  "Comparisons",
  "Examples",
  "Locations",
  "Personas",
  "Integrations",
  "Glossary",
  "Translations",
  "Directory",
  "Profiles"
]);

function wordCount(guide: Guide): number {
  const text = [
    guide.title,
    guide.description,
    guide.direct_answer ?? "",
    guide.tldr,
    ...guide.answer_intents,
    ...guide.how_to_choose,
    ...guide.implementation_risks,
    ...guide.operator_playbook.flatMap((s) => [s.title, ...s.bullets]),
    ...guide.ranked_tools.flatMap((r) => [r.why]),
    ...guide.workflow_tool_comparison.flatMap((r) => [
      r.best_for,
      ...r.workflow_fit,
      r.auditability,
      r.qa_support,
      r.privilege_controls,
      r.exports_logs,
      r.notes
    ]),
    ...guide.faq.flatMap((f) => [f.q, f.a]),
    ...guide.worked_examples.flatMap((w) => [
      w.title,
      w.scenario,
      w.time_box,
      ...w.inputs,
      ...w.process,
      ...w.outputs,
      ...w.qa_findings,
      ...w.adjustments_made,
      w.key_takeaway
    ])
  ].join(" ");
  return text
    .replace(/[^\w\s-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

function readJson<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as T;
}

function isGuidePath(url: string): boolean {
  return /^\/guides\/[a-z0-9-]+$/.test(url);
}

function main() {
  const errors: string[] = [];
  const warnings: string[] = [];
  const details: Array<{ slug: string; words: number; min_words: number; links: number }> = [];

  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error(`Missing manifest: ${MANIFEST_PATH}. Run seed-pseo:stage1 first.`);
  }

  const manifest = readJson<Manifest>(MANIFEST_PATH);
  if (manifest.stage !== "stage-1") {
    errors.push(`Unexpected manifest stage: ${manifest.stage}`);
  }
  if (manifest.page_count !== manifest.pages.length) {
    errors.push(`Manifest page_count (${manifest.page_count}) does not match pages length (${manifest.pages.length}).`);
  }

  const seenSlugs = new Set<string>();
  const seenKeywords = new Set<string>();
  const playbooksFound = new Set<string>();
  const stageSlugs = new Set(manifest.pages.map((p) => p.slug));

  for (const page of manifest.pages) {
    playbooksFound.add(page.playbook_type);
    if (seenSlugs.has(page.slug)) errors.push(`Duplicate slug in manifest: ${page.slug}`);
    if (seenKeywords.has(page.primary_keyword)) errors.push(`Duplicate primary keyword in manifest: ${page.primary_keyword}`);
    seenSlugs.add(page.slug);
    seenKeywords.add(page.primary_keyword);

    const guidePath = path.join(GUIDES_DIR, `${page.slug}.json`);
    if (!fs.existsSync(guidePath)) {
      errors.push(`Missing guide JSON for slug ${page.slug}: ${guidePath}`);
      continue;
    }

    let guide: Guide;
    try {
      guide = GuideSchema.parse(readJson<unknown>(guidePath));
    } catch (err) {
      errors.push(`Guide schema parse failed for ${page.slug}: ${(err as Error).message}`);
      continue;
    }

    const words = wordCount(guide);
    if (words < page.min_words) {
      errors.push(`${page.slug} word count ${words} below minimum ${page.min_words}`);
    }
    if (guide.faq.length < 3) errors.push(`${page.slug} has fewer than 3 FAQs`);
    if (guide.ranked_tools.length < 3) errors.push(`${page.slug} has fewer than 3 ranked tools`);
    if (page.internal_links.length < 5) errors.push(`${page.slug} has fewer than 5 internal links`);
    if (page.related_pages.length < 2) errors.push(`${page.slug} has fewer than 2 related pages`);
    if (page.sibling_urls.length < 2) errors.push(`${page.slug} has fewer than 2 sibling URLs`);
    if (page.cross_playbook_urls.length < 2) errors.push(`${page.slug} has fewer than 2 cross-playbook URLs`);
    if (!page.parent_category_url.startsWith("/")) errors.push(`${page.slug} parent category URL must be absolute path`);

    const allLinks = [...page.internal_links, ...page.related_pages];
    for (const link of allLinks) {
      if (!link.startsWith("/")) {
        errors.push(`${page.slug} has non-site-relative link: ${link}`);
        continue;
      }
      if (isGuidePath(link)) {
        const linkedSlug = link.replace(/^\/guides\//, "");
        if (!stageSlugs.has(linkedSlug)) {
          warnings.push(`${page.slug} links to non-stage1 guide slug: ${linkedSlug}`);
        }
      }
    }

    details.push({ slug: page.slug, words, min_words: page.min_words, links: page.internal_links.length });
  }

  for (const required of REQUIRED_PLAYBOOKS) {
    if (!playbooksFound.has(required)) errors.push(`Missing required playbook in stage-1 manifest: ${required}`);
  }

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const summary = {
    manifest: MANIFEST_PATH,
    pages_checked: manifest.pages.length,
    playbooks_found: [...playbooksFound].sort(),
    errors,
    warnings,
    details: details.sort((a, b) => a.slug.localeCompare(b.slug))
  };

  fs.writeFileSync(path.join(OUT_DIR, "qa-pseo-stage1.json"), `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  if (errors.length > 0) {
    console.error(JSON.stringify(summary, null, 2));
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        status: "ok",
        pages_checked: manifest.pages.length,
        warning_count: warnings.length,
        report: path.join(OUT_DIR, "qa-pseo-stage1.json")
      },
      null,
      2
    )
  );
}

main();
