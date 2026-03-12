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

type PipelineDefaults = {
  chunkSize: number | null;
  chunkOverlap: number | null;
  retrieverK: number | null;
  persistDirectory: string | null;
  modelName: string | null;
  temperature: number | null;
  hasOpenAIEmbeddings: boolean;
  hasChroma: boolean;
  runCommand: string;
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
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function read(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    console.error(`Missing file: ${filePath}`);
    process.exit(1);
  }
  return fs.readFileSync(filePath, "utf8");
}

function parseTaskList(readme: string): Array<{ num: number; title: string }> {
  const lines = readme.split(/\r?\n/);
  const tasks: Array<{ num: number; title: string }> = [];

  for (const line of lines) {
    const m = line.match(/^\s*-\s*Task\s*(\d+)\s*:\s*(.+)$/i);
    if (!m) continue;
    const num = Number.parseInt(m[1] ?? "", 10);
    const title = cleanText(m[2] ?? "");
    if (!Number.isFinite(num) || !title) continue;
    tasks.push({ num, title });
  }

  return tasks;
}

function parseReferences(readme: string): Array<{ title: string; url: string }> {
  const lines = readme.split(/\r?\n/);
  const refs: Array<{ title: string; url: string }> = [];

  for (const line of lines) {
    const m = line.match(/^-\s*\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);
    if (!m) continue;
    refs.push({ title: cleanText(m[1] ?? ""), url: cleanText(m[2] ?? "") });
  }

  return refs;
}

function parseRequirements(raw: string): Map<string, string> {
  const map = new Map<string, string>();

  for (const line of raw.split(/\r?\n/)) {
    const s = line.trim();
    if (!s || s.startsWith("#")) continue;
    const m = s.match(/^([A-Za-z0-9_.-]+)==(.+)$/);
    if (!m) continue;
    map.set((m[1] ?? "").toLowerCase(), cleanText(m[2] ?? ""));
  }

  return map;
}

function findNum(raw: string, pattern: RegExp): number | null {
  const m = raw.match(pattern);
  if (!m) return null;
  const n = Number.parseFloat((m[1] ?? "").trim());
  return Number.isFinite(n) ? n : null;
}

function findText(raw: string, pattern: RegExp): string | null {
  const m = raw.match(pattern);
  if (!m) return null;
  const s = cleanText(m[1] ?? "");
  return s || null;
}

function detectRunCommand(readme: string): string {
  const m = readme.match(/streamlit\s+run\s+app\/main\.py/i);
  return m ? "streamlit run app/main.py" : "streamlit run app/main.py";
}

function parseDefaults(args: { readme: string; textSplit: string; vectorDb: string; chain: string }): PipelineDefaults {
  return {
    chunkSize: findNum(args.textSplit, /chunk_size\s*=\s*(\d+)/),
    chunkOverlap: findNum(args.textSplit, /chunk_overlap\s*=\s*(\d+)/),
    retrieverK: findNum(args.vectorDb, /search_kwargs\s*=\s*\{\s*"k"\s*:\s*(\d+)\s*\}/),
    persistDirectory: findText(args.vectorDb, /persist_directory\s*=\s*["']([^"']+)["']/),
    modelName: findText(args.chain, /ChatOpenAI\(\s*model_name\s*=\s*["']([^"']+)["']/),
    temperature: findNum(args.chain, /temperature\s*=\s*([0-9.]+)/),
    hasOpenAIEmbeddings: /OpenAIEmbeddings/.test(args.vectorDb),
    hasChroma: /Chroma/.test(args.vectorDb),
    runCommand: detectRunCommand(args.readme)
  };
}

function depVersion(reqs: Map<string, string>, key: string): string {
  const v = reqs.get(key.toLowerCase());
  return v ? `${key}==${v}` : `${key} (version unspecified)`;
}

function main() {
  const repoRoot = process.cwd();
  const contentRoot = process.env.CB_CONTENT_ROOT?.trim() ? process.env.CB_CONTENT_ROOT.trim() : "content";
  const baseDir = argValue("baseDir") || path.join(repoRoot, "data", "third_party", "legal-contract-qa-bot");
  const outDir = argValue("outDir") || path.join(repoRoot, contentRoot, "resources", "legal-contract-qa-bot");
  const lastChecked = argValue("lastChecked") || new Date().toISOString().slice(0, 10);

  const readme = read(path.join(baseDir, "README.md"));
  const requirements = read(path.join(baseDir, "requirements.txt"));
  const mainPy = read(path.join(baseDir, "app", "main.py"));
  const docUtils = read(path.join(baseDir, "app", "utils", "doc_utils.py"));
  const textSplit = read(path.join(baseDir, "app", "utils", "text_split_utils.py"));
  const vectorDb = read(path.join(baseDir, "app", "utils", "vector_db_utils.py"));
  const chain = read(path.join(baseDir, "app", "utils", "langchain_utils.py"));

  const tasks = parseTaskList(readme);
  const refs = parseReferences(readme);
  const reqs = parseRequirements(requirements);
  const defaults = parseDefaults({ readme, textSplit, vectorDb, chain });

  const resources: Resource[] = [];

  resources.push({
    slug: "legal-contract-qa-bot",
    title: "Legal Contract Q&A Bot",
    description:
      "Open-source Streamlit RAG application for legal-contract question answering, combining PDF ingestion, chunking, vector retrieval, and LLM response generation.",
    url: "https://github.com/Prbn/Legal-Contract-QA-Bot",
    tags: ["Contract QA", "RAG", "Legal AI"],
    type: "research",
    last_checked: lastChecked,
    jurisdiction: ["United States"],
    source_type: "research-platform",
    access: ["open"],
    coverage:
      `Pipeline defaults include chunk_size=${defaults.chunkSize ?? "unknown"}, overlap=${defaults.chunkOverlap ?? "unknown"}, retriever_k=${defaults.retrieverK ?? "unknown"}, model=${defaults.modelName ?? "unknown"}.`,
    license_notes: "Repository is MIT licensed. Verify external model/API terms and uploaded document handling policies before production deployment.",
    best_for: ["research", "benchmarking"]
  });

  resources.push({
    slug: "lcqa-setup-runbook",
    title: "Legal Contract Q&A Bot setup runbook",
    description: "Installation and launch workflow extracted from the project README.",
    url: "https://github.com/Prbn/Legal-Contract-QA-Bot#usage",
    tags: ["Contract QA", "Runbook", "Streamlit"],
    type: "course",
    last_checked: lastChecked,
    jurisdiction: ["United States"],
    source_type: "other",
    access: ["open"],
    coverage: `Clone repo, install requirements, and launch with ${defaults.runCommand}.`,
    license_notes: "Usage guidance is from MIT-licensed project documentation.",
    best_for: ["research", "benchmarking"]
  });

  resources.push({
    slug: "lcqa-pipeline-defaults",
    title: "Legal Contract Q&A pipeline defaults",
    description: "Extracted baseline configuration from text chunking, vector retrieval, and answer-chain modules.",
    url: "https://github.com/Prbn/Legal-Contract-QA-Bot/tree/main/app/utils",
    tags: ["Contract QA", "Architecture", "Defaults"],
    type: "toolkit",
    last_checked: lastChecked,
    jurisdiction: ["United States"],
    source_type: "datasets-benchmarks",
    access: defaults.hasOpenAIEmbeddings ? ["open", "api"] : ["open"],
    coverage:
      `chunk_size=${defaults.chunkSize ?? "N/A"}; chunk_overlap=${defaults.chunkOverlap ?? "N/A"}; retriever_k=${defaults.retrieverK ?? "N/A"}; persist_directory=${defaults.persistDirectory ?? "N/A"}; model=${defaults.modelName ?? "N/A"}; temperature=${defaults.temperature ?? "N/A"}.`,
    license_notes: "Configuration defaults should be validated for legal accuracy, data privacy, and latency constraints before production use.",
    best_for: ["benchmarking", "research"]
  });

  const components: Array<{ slug: string; title: string; url: string; desc: string; coverage: string }> = [
    {
      slug: "lcqa-component-streamlit-ui",
      title: "LCQA component: Streamlit interface",
      url: "https://github.com/Prbn/Legal-Contract-QA-Bot/blob/main/app/main.py",
      desc: "Interactive UI for uploading contracts and querying the assistant.",
      coverage: "Handles file upload, question input, and response rendering in Streamlit session state."
    },
    {
      slug: "lcqa-component-pdf-ingestion",
      title: "LCQA component: PDF text extraction",
      url: "https://github.com/Prbn/Legal-Contract-QA-Bot/blob/main/app/utils/doc_utils.py",
      desc: "Document ingestion layer using PyPDF2 to extract text across all uploaded PDF pages.",
      coverage: `PDF ingestion implementation based on PdfReader with page-wise extraction. Source length: ${docUtils.split(/\r?\n/).length} lines.`
    },
    {
      slug: "lcqa-component-text-chunking",
      title: "LCQA component: recursive text chunking",
      url: "https://github.com/Prbn/Legal-Contract-QA-Bot/blob/main/app/utils/text_split_utils.py",
      desc: "Chunking layer built with RecursiveCharacterTextSplitter for retrieval-ready segments.",
      coverage: `Chunking parameters: size ${defaults.chunkSize ?? "N/A"}, overlap ${defaults.chunkOverlap ?? "N/A"}.`
    },
    {
      slug: "lcqa-component-vector-retrieval",
      title: "LCQA component: Chroma vector retrieval",
      url: "https://github.com/Prbn/Legal-Contract-QA-Bot/blob/main/app/utils/vector_db_utils.py",
      desc: "Embeds contract chunks and retrieves top-k context with persistent Chroma storage.",
      coverage: `Retriever top-k: ${defaults.retrieverK ?? "N/A"}. Persist path: ${defaults.persistDirectory ?? "N/A"}.`
    },
    {
      slug: "lcqa-component-answer-chain",
      title: "LCQA component: legal answer chain",
      url: "https://github.com/Prbn/Legal-Contract-QA-Bot/blob/main/app/utils/langchain_utils.py",
      desc: "Prompt + LLM chain that returns concise legal-contract answers and abstains when context is insufficient.",
      coverage: `Answer model: ${defaults.modelName ?? "N/A"} at temperature ${defaults.temperature ?? "N/A"}.`
    }
  ];

  for (const c of components) {
    resources.push({
      slug: c.slug,
      title: c.title,
      description: c.desc,
      url: c.url,
      tags: ["Contract QA", "Architecture", "RAG component"],
      type: "toolkit",
      last_checked: lastChecked,
      jurisdiction: ["United States"],
      source_type: "research-platform",
      access: ["open"],
      coverage: c.coverage,
      license_notes: "Component-level details derived from MIT-licensed source code.",
      best_for: ["research", "benchmarking"]
    });
  }

  const dependencies: Array<{ key: string; title: string; url: string; access: AccessType[]; sourceType: SourceType }> = [
    { key: "streamlit", title: "Streamlit", url: "https://streamlit.io/", access: ["open"], sourceType: "research-platform" },
    { key: "langchain", title: "LangChain", url: "https://python.langchain.com/", access: ["open"], sourceType: "research-platform" },
    { key: "chromadb", title: "ChromaDB", url: "https://www.trychroma.com/", access: ["open"], sourceType: "datasets-benchmarks" },
    { key: "langchain-openai", title: "LangChain OpenAI", url: "https://python.langchain.com/docs/integrations/providers/openai/", access: ["open", "api"], sourceType: "research-platform" },
    { key: "pypdf2", title: "PyPDF2", url: "https://pypi.org/project/PyPDF2/", access: ["open"], sourceType: "other" }
  ];

  for (const dep of dependencies) {
    const version = depVersion(reqs, dep.key);
    resources.push({
      slug: `lcqa-dependency-${slugify(dep.key)}-${hash6(dep.key)}`,
      title: `LCQA dependency: ${dep.title}`,
      description: `Core dependency used in the Legal Contract Q&A Bot stack (${version}).`,
      url: dep.url,
      tags: ["Contract QA", "Dependency", dep.title],
      type: "community",
      last_checked: lastChecked,
      jurisdiction: ["United States"],
      source_type: dep.sourceType,
      access: dep.access,
      coverage: `Pinned version in repository requirements: ${version}.`,
      license_notes: "Dependency licensing and terms are governed by each upstream project/provider.",
      best_for: ["research", "benchmarking"]
    });
  }

  for (const task of tasks) {
    const basis = `${task.num}:${task.title}`;
    resources.push({
      slug: `lcqa-task-${task.num}-${hash6(basis)}`,
      title: `LCQA roadmap task ${task.num}`,
      description: task.title,
      url: "https://github.com/Prbn/Legal-Contract-QA-Bot#project-structure",
      tags: ["Contract QA", "Roadmap", `Task ${task.num}`],
      type: "program",
      last_checked: lastChecked,
      jurisdiction: ["United States"],
      source_type: "other",
      access: ["unknown"],
      coverage: `Roadmap item from README task list: ${task.title}`,
      license_notes: "Roadmap statements are descriptive and may evolve outside repository updates.",
      best_for: ["research", "policy-check"]
    });
  }

  for (const ref of refs) {
    const key = `${ref.title}|${ref.url}`;
    resources.push({
      slug: `lcqa-reference-${slugify(ref.title)}-${hash6(key)}`,
      title: `LCQA reference: ${ref.title}`,
      description: "External educational reference cited in project README.",
      url: ref.url,
      tags: ["Contract QA", "Reference", "RAG learning"],
      type: "course",
      last_checked: lastChecked,
      jurisdiction: ["United States"],
      source_type: "scholarship",
      access: ["open"],
      coverage: `Referenced source supporting contract-RAG implementation and evaluation practices: ${ref.title}.`,
      license_notes: "External content remains under its own terms and attribution requirements.",
      best_for: ["research", "benchmarking", "citation-check"]
    });
  }

  ensureDir(outDir);

  for (const r of resources) {
    fs.writeFileSync(path.join(outDir, `${r.slug}.json`), JSON.stringify(r, null, 2) + "\n", "utf8");
  }

  console.log(
    JSON.stringify(
      {
        base_dir: baseDir,
        output_dir: outDir,
        generated_at: new Date().toISOString(),
        resources_written: resources.length,
        tasks: tasks.length,
        references: refs.length,
        pipeline_defaults: defaults
      },
      null,
      2
    )
  );
}

main();
