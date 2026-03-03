import fs from "node:fs";
import path from "node:path";

type Pack = {
  slug: string;
  title: string;
  description: string;
  prompt_slugs: string[];
  audience: string;
  workflow_stage: string;
  seo?: { title?: string; description?: string };
  last_updated?: string;
};

const ROOT = process.cwd();
const CONTENT_ROOT = process.env.CB_CONTENT_ROOT?.trim() ? process.env.CB_CONTENT_ROOT.trim() : "content";
const CONTENT_DIR = path.join(ROOT, CONTENT_ROOT);
const PROMPTS_DIR = path.join(CONTENT_DIR, "prompts");
const OUT_DIR = path.join(CONTENT_DIR, "packs");
const TODAY_ISO = new Date().toISOString().slice(0, 10);

function argFlag(name: string): boolean {
  return process.argv.includes(`--${name}`) || process.argv.some((a) => a.startsWith(`--${name}=`) && a.endsWith("true"));
}

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

function listFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => !f.startsWith("."))
    .sort((a, b) => a.localeCompare(b));
}

function writeJson(filePath: string, value: unknown) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

const CAT_META: Record<
  string,
  { title: string; description: string; workflow_stage: string }
> = {
  "commercial-contracts": {
    title: "In-House Starters: Commercial Contracts",
    description: "Contract review, drafting, and negotiation starter prompts for in-house teams.",
    workflow_stage: "review"
  },
  "privacy-security": {
    title: "In-House Starters: Privacy and Security",
    description: "Privacy ops, incident response, and policy starter prompts for privacy/security workflows.",
    workflow_stage: "compliance"
  },
  governance: {
    title: "In-House Starters: Corporate Governance",
    description: "Governance explainers, templates, and operating docs for board/corporate workflows.",
    workflow_stage: "governance"
  },
  employment: {
    title: "In-House Starters: Employment and Labor",
    description: "HR/legal templates and checklists for hiring, policies, and termination workflows.",
    workflow_stage: "employment"
  },
  "m-a": {
    title: "In-House Starters: M&A and Strategic Transactions",
    description: "Due diligence, term sheet, and deal workflow starter prompts.",
    workflow_stage: "deal"
  },
  litigation: {
    title: "In-House Starters: Litigation and Disputes",
    description: "Litigation holds, privilege hygiene, and dispute clause workflow starter prompts.",
    workflow_stage: "disputes"
  },
  "compliance-ethics": {
    title: "In-House Starters: Compliance and Ethics",
    description: "Training, escalation, and policy templates for compliance and ethics programs.",
    workflow_stage: "compliance"
  },
  "legal-research": {
    title: "In-House Starters: Legal Research",
    description: "Research prompt templates for quick briefs, comparisons, and compliance checklists.",
    workflow_stage: "research"
  },
  "ip-tech": {
    title: "In-House Starters: IP and Technology",
    description: "IP clauses, licensing, and trade secret hygiene starter prompts for tech teams.",
    workflow_stage: "ip"
  },
  "legal-ops": {
    title: "In-House Starters: Legal Ops and Leadership",
    description: "Intake, KPI, and operating-system prompt templates for running Legal like a function.",
    workflow_stage: "legal-ops"
  }
};

function main() {
  const overwrite = argFlag("overwrite");

  ensureDir(OUT_DIR);
  const files = listFiles(PROMPTS_DIR).filter((f) => f.startsWith("inhouse-") && f.endsWith(".mdx"));

  const byCat = new Map<string, string[]>();
  const catKeys = Object.keys(CAT_META).sort((a, b) => b.length - a.length);
  for (const f of files) {
    const slug = f.replace(/\.mdx$/, "");
    const rest = slug.replace(/^inhouse-/, "");
    const cat = catKeys.find((k) => rest.startsWith(`${k}-`));
    if (!cat) continue;
    const arr = byCat.get(cat) ?? [];
    arr.push(slug);
    byCat.set(cat, arr);
  }

  let packsWritten = 0;
  for (const [cat, slugs] of byCat.entries()) {
    const meta = CAT_META[cat];
    if (!meta) continue;
    slugs.sort((a, b) => a.localeCompare(b));

    const packSlug = `inhouse-${cat}`;
    const filePath = path.join(OUT_DIR, `${packSlug}.json`);
    if (!overwrite && fs.existsSync(filePath)) continue;

    const pack: Pack = {
      slug: packSlug,
      title: meta.title,
      description: meta.description,
      prompt_slugs: slugs,
      audience: "legal",
      workflow_stage: meta.workflow_stage,
      seo: {
        title: meta.title,
        description: meta.description
      },
      last_updated: TODAY_ISO
    };

    writeJson(filePath, pack);
    packsWritten += 1;
  }

  console.log(
    JSON.stringify(
      {
        content_root: CONTENT_ROOT,
        prompts_found: files.length,
        packs_written: packsWritten,
        out_dir: OUT_DIR,
        last_updated: TODAY_ISO
      },
      null,
      2
    )
  );
}

main();
