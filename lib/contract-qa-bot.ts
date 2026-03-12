import fs from "node:fs";
import path from "node:path";
import { getAllResources, type Resource } from "@/lib/resources";

export type ContractQaSection = "index" | "runbook" | "defaults" | "components" | "dependencies" | "tasks" | "references" | "other";

export type ContractQaDefaults = {
  chunkSize: number | null;
  chunkOverlap: number | null;
  retrieverK: number | null;
  persistDirectory: string | null;
  modelName: string | null;
  temperature: number | null;
  hasOpenAIEmbeddings: boolean;
  hasChroma: boolean;
  hasStreamlit: boolean;
  runCommand: string;
};

const BASE_DIR = path.join(process.cwd(), "data", "third_party", "legal-contract-qa-bot");

let defaultsCache: ContractQaDefaults | null = null;

function readSafe(filePath: string): string {
  if (!fs.existsSync(filePath)) return "";
  return fs.readFileSync(filePath, "utf8");
}

function cleanText(raw: string): string {
  return raw
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
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
  const text = cleanText(m[1] ?? "");
  return text || null;
}

export function getContractQaDefaults(): ContractQaDefaults {
  if (defaultsCache) return defaultsCache;

  const readme = readSafe(path.join(BASE_DIR, "README.md"));
  const textSplit = readSafe(path.join(BASE_DIR, "app", "utils", "text_split_utils.py"));
  const vectorDb = readSafe(path.join(BASE_DIR, "app", "utils", "vector_db_utils.py"));
  const chain = readSafe(path.join(BASE_DIR, "app", "utils", "langchain_utils.py"));
  const mainPy = readSafe(path.join(BASE_DIR, "app", "main.py"));

  defaultsCache = {
    chunkSize: findNum(textSplit, /chunk_size\s*=\s*(\d+)/),
    chunkOverlap: findNum(textSplit, /chunk_overlap\s*=\s*(\d+)/),
    retrieverK: findNum(vectorDb, /search_kwargs\s*=\s*\{\s*"k"\s*:\s*(\d+)\s*\}/),
    persistDirectory: findText(vectorDb, /persist_directory\s*=\s*["']([^"']+)["']/),
    modelName: findText(chain, /ChatOpenAI\(\s*model_name\s*=\s*["']([^"']+)["']/),
    temperature: findNum(chain, /temperature\s*=\s*([0-9.]+)/),
    hasOpenAIEmbeddings: /OpenAIEmbeddings/.test(vectorDb),
    hasChroma: /Chroma/.test(vectorDb),
    hasStreamlit: /import\s+streamlit\s+as\s+st/.test(mainPy),
    runCommand: /streamlit\s+run\s+app\/main\.py/i.test(readme) ? "streamlit run app/main.py" : "streamlit run app/main.py"
  };

  return defaultsCache;
}

export function isContractQaResource(resource: Resource): boolean {
  if (resource.slug === "legal-contract-qa-bot") return true;
  if (resource.slug.startsWith("lcqa-")) return true;
  return resource.tags.some((t) => t.toLowerCase().includes("contract qa"));
}

export function contractQaSection(resource: Resource): ContractQaSection {
  if (resource.slug === "legal-contract-qa-bot") return "index";
  if (resource.slug === "lcqa-setup-runbook") return "runbook";
  if (resource.slug === "lcqa-pipeline-defaults") return "defaults";
  if (resource.slug.startsWith("lcqa-component-")) return "components";
  if (resource.slug.startsWith("lcqa-dependency-")) return "dependencies";
  if (resource.slug.startsWith("lcqa-task-")) return "tasks";
  if (resource.slug.startsWith("lcqa-reference-")) return "references";
  return "other";
}

export function getContractQaResources(): Resource[] {
  return getAllResources().filter(isContractQaResource).sort((a, b) => a.title.localeCompare(b.title));
}

export function getContractQaBySection(resources: Resource[]) {
  return {
    index: resources.find((r) => contractQaSection(r) === "index") ?? null,
    runbook: resources.filter((r) => contractQaSection(r) === "runbook"),
    defaults: resources.filter((r) => contractQaSection(r) === "defaults"),
    components: resources.filter((r) => contractQaSection(r) === "components"),
    dependencies: resources.filter((r) => contractQaSection(r) === "dependencies"),
    tasks: resources.filter((r) => contractQaSection(r) === "tasks"),
    references: resources.filter((r) => contractQaSection(r) === "references"),
    other: resources.filter((r) => contractQaSection(r) === "other")
  };
}

export function getContractQaStats(resources: Resource[]) {
  const sections = getContractQaBySection(resources);
  const apiReady = resources.filter((r) => (r.access ?? []).includes("api")).length;
  const open = resources.filter((r) => (r.access ?? []).includes("open")).length;

  return {
    total: resources.length,
    componentCount: sections.components.length,
    dependencyCount: sections.dependencies.length,
    taskCount: sections.tasks.length,
    referenceCount: sections.references.length,
    apiReady,
    open
  };
}
