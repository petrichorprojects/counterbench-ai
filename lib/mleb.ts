import fs from "node:fs";
import path from "node:path";
import { getAllResources, type Resource } from "@/lib/resources";

export type MlebCategory = "Caselaw" | "Regulation" | "Contracts";

type MlebDatasetResult = {
  dataset: {
    id: string;
    name: string;
    creator: string;
    category: MlebCategory;
    link: string;
  };
  score: number;
  time_taken: number;
};

type MlebResultLine = {
  model: {
    id: string;
    name: string;
    open_source: boolean;
    embedding_dimensions: number;
    context_window: number;
    link: string;
    provider?: { id?: string; name?: string; link?: string };
  };
  results: MlebDatasetResult[];
};

export type MlebModelSummary = {
  id: string;
  name: string;
  provider: string;
  openSource: boolean;
  link: string;
  embeddingDimensions: number;
  contextWindow: number;
  averageScore: number;
  averageTime: number;
  caselawScore: number;
  regulationScore: number;
  contractsScore: number;
};

export type MlebShortlistFilters = {
  openOnly: boolean;
  focus: "balanced" | "caselaw" | "regulation" | "contracts";
  speed: "quality" | "balanced" | "fast";
  minContextWindow: number;
};

let parsedCache: MlebResultLine[] | null = null;
let modelSummaryCache: MlebModelSummary[] | null = null;

function mean(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function readMlebJsonl(): MlebResultLine[] {
  if (parsedCache) return parsedCache;

  const filePath = path.join(process.cwd(), "data", "third_party", "mleb", "results.jsonl");
  if (!fs.existsSync(filePath)) return [];

  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as MlebResultLine);

  parsedCache = parsed;
  return parsed;
}

export function getMlebModelSummaries(): MlebModelSummary[] {
  if (modelSummaryCache) return modelSummaryCache;

  const lines = readMlebJsonl();

  modelSummaryCache = lines.map((line) => {
    const caselaw = line.results.filter((r) => r.dataset.category === "Caselaw").map((r) => r.score);
    const regulation = line.results.filter((r) => r.dataset.category === "Regulation").map((r) => r.score);
    const contracts = line.results.filter((r) => r.dataset.category === "Contracts").map((r) => r.score);

    return {
      id: line.model.id,
      name: line.model.name,
      provider: line.model.provider?.name || "Unknown",
      openSource: line.model.open_source,
      link: line.model.link,
      embeddingDimensions: line.model.embedding_dimensions,
      contextWindow: line.model.context_window,
      averageScore: mean(line.results.map((r) => r.score)),
      averageTime: mean(line.results.map((r) => r.time_taken)),
      caselawScore: mean(caselaw),
      regulationScore: mean(regulation),
      contractsScore: mean(contracts)
    };
  });

  return modelSummaryCache;
}

function normalizedSpeed(models: MlebModelSummary[], value: number): number {
  const times = models.map((m) => m.averageTime);
  const min = Math.min(...times);
  const max = Math.max(...times);
  if (!Number.isFinite(min) || !Number.isFinite(max) || max - min < 1e-9) return 1;
  // lower time = better speed
  return 1 - (value - min) / (max - min);
}

function baseFocusScore(model: MlebModelSummary, focus: MlebShortlistFilters["focus"]): number {
  if (focus === "caselaw") return model.caselawScore;
  if (focus === "regulation") return model.regulationScore;
  if (focus === "contracts") return model.contractsScore;
  return model.averageScore;
}

export function shortlistMlebModels(filters: MlebShortlistFilters): Array<MlebModelSummary & { rankScore: number }> {
  const models = getMlebModelSummaries()
    .filter((m) => (filters.openOnly ? m.openSource : true))
    .filter((m) => m.contextWindow >= filters.minContextWindow);

  return models
    .map((model) => {
      const quality = baseFocusScore(model, filters.focus);
      const speed = normalizedSpeed(models, model.averageTime);

      let rankScore = quality;
      if (filters.speed === "balanced") rankScore = quality * 0.85 + speed * 0.15;
      if (filters.speed === "fast") rankScore = quality * 0.7 + speed * 0.3;

      return { ...model, rankScore };
    })
    .sort((a, b) => b.rankScore - a.rankScore || a.name.localeCompare(b.name));
}

export function getMlebDatasetStats() {
  const lines = readMlebJsonl();
  const datasetMap = new Map<string, MlebDatasetResult["dataset"]>();

  for (const line of lines) {
    for (const r of line.results) {
      datasetMap.set(r.dataset.id, r.dataset);
    }
  }

  const datasets = [...datasetMap.values()];
  const byCategory = new Map<MlebCategory, number>([
    ["Caselaw", 0],
    ["Regulation", 0],
    ["Contracts", 0]
  ]);

  for (const d of datasets) {
    byCategory.set(d.category, (byCategory.get(d.category) ?? 0) + 1);
  }

  return {
    modelCount: lines.length,
    datasetCount: datasets.length,
    byCategory: {
      caselaw: byCategory.get("Caselaw") ?? 0,
      regulation: byCategory.get("Regulation") ?? 0,
      contracts: byCategory.get("Contracts") ?? 0
    }
  };
}

export function getMlebResources(): Resource[] {
  return getAllResources().filter((r) => r.slug === "mleb" || r.slug.startsWith("mleb-")).sort((a, b) => a.title.localeCompare(b.title));
}
