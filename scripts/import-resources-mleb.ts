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

type MlebLine = {
  model: {
    id: string;
    name: string;
    open_source: boolean;
    embedding_dimensions: number;
    context_window: number;
    link: string;
    provider?: { name?: string; link?: string };
  };
  results: Array<{
    dataset: {
      id: string;
      name: string;
      creator: string;
      category: string;
      link: string;
    };
    score: number;
    time_taken: number;
  }>;
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
    .replace(/\s+/g, " ")
    .trim();
}

function datasetJurisdiction(datasetId: string, datasetName: string): string[] {
  const s = `${datasetId} ${datasetName}`.toLowerCase();
  if (s.includes("echr") || s.includes("gdpr")) return ["Europe & European Union"];
  if (s.includes("singapore")) return ["Singapore"];
  if (s.includes("uk")) return ["United Kingdom"];
  if (s.includes("australian")) return ["Australia"];
  if (s.includes("irish")) return ["Ireland"];
  if (s.includes("bar-exam")) return ["United States"];
  return ["Global / Multi-jurisdictional"];
}

function datasetSourceType(category: string): SourceType {
  const c = category.toLowerCase();
  if (c.includes("caselaw") || c.includes("case")) return "case-law";
  if (c.includes("regulation")) return "statutes-regulation";
  if (c.includes("contract")) return "datasets-benchmarks";
  return "datasets-benchmarks";
}

function datasetBestFor(sourceType: SourceType): FinderTask[] {
  if (sourceType === "case-law") return ["benchmarking", "citation-check", "research"];
  if (sourceType === "statutes-regulation") return ["benchmarking", "policy-check", "research"];
  return ["benchmarking", "research"];
}

function safeNum(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return n;
}

function readResultsJsonl(filePath: string): MlebLine[] {
  const raw = fs.readFileSync(filePath, "utf8");
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as MlebLine);
}

function extractReadmeSignals(readmeRaw: string): { setupSummary: string; usageSummary: string } {
  const lines = readmeRaw.split(/\r?\n/);
  let inSetup = false;
  let inUsage = false;
  const setupSteps: string[] = [];
  const usageSteps: string[] = [];

  for (const line of lines) {
    if (/^##\s+Setup/i.test(line)) {
      inSetup = true;
      inUsage = false;
      continue;
    }
    if (/^##\s+Usage/i.test(line)) {
      inSetup = false;
      inUsage = true;
      continue;
    }
    if (/^##\s+/.test(line)) {
      inSetup = false;
      inUsage = false;
    }

    const codeLine = line.match(/^\s*([a-zA-Z0-9][^\n]+)$/);
    if (inSetup && codeLine && /uv|git clone|\.venv|OPENAI_API_KEY|python/.test(codeLine[1] ?? "")) {
      setupSteps.push(cleanText(codeLine[1] ?? ""));
    }
    if (inUsage && codeLine && /scripts\/mleb\.py|scripts\/export\.py|results/.test(codeLine[1] ?? "")) {
      usageSteps.push(cleanText(codeLine[1] ?? ""));
    }
  }

  const setupSummary = setupSteps.slice(0, 5).join(" | ") || "uv setup, environment variables, and benchmark runner scripts.";
  const usageSummary = usageSteps.slice(0, 5).join(" | ") || "Run scripts/mleb.py and export combined results via scripts/export.py.";
  return { setupSummary, usageSummary };
}

function main() {
  const repoRoot = process.cwd();
  const contentRoot = process.env.CB_CONTENT_ROOT?.trim() ? process.env.CB_CONTENT_ROOT.trim() : "content";

  const readmePath = argValue("readme") || path.join(repoRoot, "data", "third_party", "mleb", "README.md");
  const resultsPath = argValue("results") || path.join(repoRoot, "data", "third_party", "mleb", "results.jsonl");
  const outDir = argValue("outDir") || path.join(repoRoot, contentRoot, "resources", "mleb");
  const lastChecked = argValue("lastChecked") || new Date().toISOString().slice(0, 10);

  if (!fs.existsSync(readmePath)) {
    console.error(`Missing README: ${readmePath}`);
    process.exit(1);
  }
  if (!fs.existsSync(resultsPath)) {
    console.error(`Missing results JSONL: ${resultsPath}`);
    process.exit(1);
  }

  const readmeRaw = fs.readFileSync(readmePath, "utf8");
  const lines = readResultsJsonl(resultsPath);
  const { setupSummary, usageSummary } = extractReadmeSignals(readmeRaw);

  ensureDir(outDir);

  const resources: Resource[] = [];

  resources.push({
    slug: "mleb",
    title: "Massive Legal Embedding Benchmark (MLEB)",
    description:
      "Comprehensive legal embedding benchmark with multi-dataset evaluation for legal retrieval and reasoning performance.",
    url: "https://github.com/isaacus-dev/mleb",
    tags: ["MLEB", "Legal embeddings", "Benchmark"],
    type: "research",
    last_checked: lastChecked,
    jurisdiction: ["Global / Multi-jurisdictional"],
    source_type: "datasets-benchmarks",
    access: ["open"],
    coverage: "Benchmark framework, model configurations, and published results across legal datasets and task categories.",
    license_notes: "MIT licensed repository. Verify external dataset licenses for downstream use.",
    best_for: ["benchmarking", "research"]
  });

  resources.push({
    slug: "mleb-setup-and-runbook",
    title: "MLEB Setup and Runbook",
    description: "Developer setup and execution guidance from the MLEB README.",
    url: "https://github.com/isaacus-dev/mleb#setup",
    tags: ["MLEB", "Runbook", "Setup"],
    type: "course",
    last_checked: lastChecked,
    jurisdiction: ["Global / Multi-jurisdictional"],
    source_type: "other",
    access: ["open"],
    coverage: `Setup: ${setupSummary}. Usage: ${usageSummary}`,
    license_notes: "Repository documentation under MIT project context.",
    best_for: ["benchmarking", "research"]
  });

  const datasetMap = new Map<string, MlebLine["results"][number]["dataset"]>();
  const providerMap = new Map<string, { name: string; link: string }>();

  for (const line of lines) {
    const providerName = line.model.provider?.name?.trim();
    const providerLink = line.model.provider?.link?.trim();
    if (providerName && providerLink) providerMap.set(providerName, { name: providerName, link: providerLink });

    for (const r of line.results ?? []) {
      datasetMap.set(r.dataset.id, r.dataset);
    }
  }

  for (const ds of datasetMap.values()) {
    const sourceType = datasetSourceType(ds.category);
    const jurisdiction = datasetJurisdiction(ds.id, ds.name);

    resources.push({
      slug: `mleb-dataset-${slugify(ds.id)}-${hash6(ds.id)}`,
      title: ds.name,
      description: `${ds.category} dataset in MLEB (creator: ${ds.creator}).`,
      url: ds.link,
      tags: ["MLEB", "Dataset", ds.category, ds.creator],
      type: "research",
      last_checked: lastChecked,
      jurisdiction,
      source_type: sourceType,
      access: ["open"],
      coverage: `Dataset ID: ${ds.id}. Category: ${ds.category}. Creator: ${ds.creator}.`,
      license_notes: "Benchmark references external dataset. Verify dataset-level licensing on source page.",
      best_for: datasetBestFor(sourceType)
    });
  }

  for (const line of lines) {
    const avgScore =
      line.results && line.results.length > 0
        ? line.results.map((x) => safeNum(x.score)).reduce((a, b) => a + b, 0) / line.results.length
        : 0;
    const avgTime =
      line.results && line.results.length > 0
        ? line.results.map((x) => safeNum(x.time_taken)).reduce((a, b) => a + b, 0) / line.results.length
        : 0;

    resources.push({
      slug: `mleb-model-${slugify(line.model.id)}-${hash6(line.model.id)}`,
      title: line.model.name,
      description: `Embedding model evaluated on MLEB (${line.model.id}).`,
      url: line.model.link,
      tags: [
        "MLEB",
        "Model",
        line.model.provider?.name || "Unknown provider",
        line.model.open_source ? "Open-source" : "Closed-source"
      ],
      type: "toolkit",
      last_checked: lastChecked,
      jurisdiction: ["Global / Multi-jurisdictional"],
      source_type: "datasets-benchmarks",
      access: [line.model.open_source ? "open" : "commercial"],
      coverage: `Average score: ${avgScore.toFixed(4)} across ${line.results.length} datasets. Avg evaluation time: ${avgTime.toFixed(2)}s. Context window: ${line.model.context_window}. Dimensions: ${line.model.embedding_dimensions}.`,
      license_notes: "Model usage terms depend on provider and model license.",
      best_for: ["benchmarking", "research"]
    });
  }

  for (const provider of providerMap.values()) {
    resources.push({
      slug: `mleb-provider-${slugify(provider.name)}-${hash6(provider.name)}`,
      title: `MLEB Provider: ${provider.name}`,
      description: `Provider with one or more models evaluated in MLEB.`,
      url: provider.link,
      tags: ["MLEB", "Provider", provider.name],
      type: "community",
      last_checked: lastChecked,
      jurisdiction: ["Global / Multi-jurisdictional"],
      source_type: "research-platform",
      access: ["mixed"],
      coverage: `Provider represented in MLEB model evaluations: ${provider.name}.`,
      license_notes: "Provider usage terms vary by model and API offering.",
      best_for: ["benchmarking", "research"]
    });
  }

  for (const r of resources) {
    fs.writeFileSync(path.join(outDir, `${r.slug}.json`), JSON.stringify(r, null, 2) + "\n", "utf8");
  }

  console.log(
    JSON.stringify(
      {
        readme: readmePath,
        results: resultsPath,
        output_dir: outDir,
        generated_at: new Date().toISOString(),
        resources_written: resources.length,
        dataset_entries: datasetMap.size,
        model_entries: lines.length,
        provider_entries: providerMap.size
      },
      null,
      2
    )
  );
}

main();
