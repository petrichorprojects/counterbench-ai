import fs from "node:fs";
import path from "node:path";
import { getAllResources, type Resource } from "@/lib/resources";

export type LegalStoriesTier = "foundational" | "intermediate" | "advanced";

export type LegalStoriesDoctrine = {
  conceptId: string;
  label: string;
  wordCount: number;
  introSnippet: string;
  tier: LegalStoriesTier;
};

export type LegalStoriesModelStat = {
  key: "gpt4" | "gpt35" | "llama2";
  label: string;
  doctrineCount: number;
  storyAverageWords: number;
  questionCoverage: {
    concept: number;
    ending: number;
    limitation: number;
  };
};

export type LegalStoriesStats = {
  doctrineCount: number;
  sampledCount101: number;
  expertCount20: number;
  averageWordCount: number;
  tierCounts: Record<LegalStoriesTier, number>;
  difficultyCounts: Record<"easy" | "medium" | "hard", number>;
  questionTotals: {
    concept: number;
    ending: number;
    limitation: number;
  };
  modelStats: LegalStoriesModelStat[];
};

const BASE_DIR = path.join(process.cwd(), "data", "third_party", "legalstories");

let doctrinesCache: LegalStoriesDoctrine[] | null = null;
let modelStatsCache: LegalStoriesModelStat[] | null = null;
let sampled101Cache: number | null = null;
let expert20Cache: number | null = null;
let difficultyCache: Record<"easy" | "medium" | "hard", number> | null = null;

function cleanText(raw: string): string {
  return raw
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function parseTsvRows(raw: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < raw.length; i += 1) {
    const ch = raw[i] ?? "";

    if (ch === '"') {
      const next = raw[i + 1] ?? "";
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "\t" && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && raw[i + 1] === "\n") i += 1;
      row.push(field);
      field = "";
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
      continue;
    }

    field += ch;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((cell) => cell.length > 0)) rows.push(row);
  }

  return rows;
}

function parseTsvRecords(filePath: string): Array<Record<string, string>> {
  if (!fs.existsSync(filePath)) return [];

  const raw = fs.readFileSync(filePath, "utf8");
  const rows = parseTsvRows(raw);
  if (rows.length === 0) return [];

  const rawHeader = rows[0] ?? [];
  const dropLeadingIndex = (rawHeader[0] ?? "").trim() === "";
  const header = (dropLeadingIndex ? rawHeader.slice(1) : rawHeader).map((h) => h.replace(/^\uFEFF/, "").trim());

  const out: Array<Record<string, string>> = [];

  for (let i = 1; i < rows.length; i += 1) {
    const rawRow = rows[i] ?? [];
    const row = dropLeadingIndex ? rawRow.slice(1) : rawRow;

    const record: Record<string, string> = {};
    for (let c = 0; c < header.length; c += 1) {
      const key = header[c] ?? "";
      if (!key) continue;
      record[key] = row[c] ?? "";
    }

    out.push(record);
  }

  return out;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function quantile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.max(0, Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p)));
  return sorted[idx] ?? 0;
}

function countWords(text: string): number {
  const normalized = cleanText(text);
  if (!normalized) return 0;
  return normalized.split(/\s+/).length;
}

function conceptLabel(raw: string): string {
  const base = raw.replace(/_/g, " ").trim();
  return base.replace(/\s+/g, " ");
}

function determineTier(wordCount: number, q33: number, q66: number): LegalStoriesTier {
  if (wordCount <= q33) return "foundational";
  if (wordCount <= q66) return "intermediate";
  return "advanced";
}

function doctrineFilePath(size: 294 | 101 | 20): string {
  return path.join(BASE_DIR, "data", `${size}-doctrines`, `legal_doctrines_${size}.tsv`);
}

function difficultyFilePath(): string {
  return path.join(BASE_DIR, "analysis", "expert_annotations", "Final_answer_annotations.tsv");
}

function modelFilePath(key: LegalStoriesModelStat["key"]): string {
  if (key === "gpt4") return path.join(BASE_DIR, "data", "294-doctrines", "gpt4_story_question_294.tsv");
  if (key === "gpt35") return path.join(BASE_DIR, "data", "294-doctrines", "gpt3.5_story_question_294.tsv");
  return path.join(BASE_DIR, "data", "294-doctrines", "llama2_story_question_294.tsv");
}

function modelLabel(key: LegalStoriesModelStat["key"]): string {
  if (key === "gpt4") return "GPT-4-0613";
  if (key === "gpt35") return "GPT-3.5-turbo-0613";
  return "LLaMA-2";
}

function getSampledCount(size: 101 | 20): number {
  if (size === 101 && sampled101Cache !== null) return sampled101Cache;
  if (size === 20 && expert20Cache !== null) return expert20Cache;

  const records = parseTsvRecords(doctrineFilePath(size));
  const count = records.length;

  if (size === 101) sampled101Cache = count;
  if (size === 20) expert20Cache = count;
  return count;
}

function getDifficultyCounts() {
  if (difficultyCache) return difficultyCache;

  const records = parseTsvRecords(difficultyFilePath());
  const counts: Record<"easy" | "medium" | "hard", number> = { easy: 0, medium: 0, hard: 0 };

  for (const r of records) {
    const d = cleanText(r.difficulty ?? "").toLowerCase();
    if (d === "easy" || d === "medium" || d === "hard") counts[d] += 1;
  }

  difficultyCache = counts;
  return counts;
}

export function getLegalStoriesDoctrines(): LegalStoriesDoctrine[] {
  if (doctrinesCache) return doctrinesCache;

  const records = parseTsvRecords(doctrineFilePath(294));
  const wordCounts = records
    .map((r) => Number.parseInt(cleanText(r.word_count ?? ""), 10))
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => a - b);

  const q33 = quantile(wordCounts, 1 / 3);
  const q66 = quantile(wordCounts, 2 / 3);

  doctrinesCache = records
    .map((r) => {
      const conceptId = cleanText(r.concept ?? "");
      const wordCount = Number.parseInt(cleanText(r.word_count ?? ""), 10);
      const introText = cleanText(r.intro_text ?? "");

      if (!conceptId || !Number.isFinite(wordCount) || wordCount <= 0) return null;

      return {
        conceptId,
        label: conceptLabel(conceptId),
        wordCount,
        introSnippet: introText.slice(0, 220),
        tier: determineTier(wordCount, q33, q66)
      } satisfies LegalStoriesDoctrine;
    })
    .filter((item): item is LegalStoriesDoctrine => Boolean(item))
    .sort((a, b) => a.wordCount - b.wordCount || a.label.localeCompare(b.label));

  return doctrinesCache;
}

export function getLegalStoriesModelStats(): LegalStoriesModelStat[] {
  if (modelStatsCache) return modelStatsCache;

  const keys: LegalStoriesModelStat["key"][] = ["gpt4", "gpt35", "llama2"];

  modelStatsCache = keys.map((key) => {
    const records = parseTsvRecords(modelFilePath(key));
    const doctrineCount = records.length;

    return {
      key,
      label: modelLabel(key),
      doctrineCount,
      storyAverageWords: mean(records.map((r) => countWords(r.story ?? ""))),
      questionCoverage: {
        concept: records.filter((r) => cleanText(r.concept_question ?? "").length > 0).length,
        ending: records.filter((r) => cleanText(r.ending_question ?? "").length > 0).length,
        limitation: records.filter((r) => cleanText(r.limitation_question ?? "").length > 0).length
      }
    };
  });

  return modelStatsCache;
}

export function getLegalStoriesStats(): LegalStoriesStats {
  const doctrines = getLegalStoriesDoctrines();
  const modelStats = getLegalStoriesModelStats();
  const sampledCount101 = getSampledCount(101);
  const expertCount20 = getSampledCount(20);
  const difficultyCounts = getDifficultyCounts();

  const tierCounts: Record<LegalStoriesTier, number> = {
    foundational: 0,
    intermediate: 0,
    advanced: 0
  };

  for (const d of doctrines) {
    tierCounts[d.tier] += 1;
  }

  const questionTotals = modelStats.reduce(
    (acc, m) => {
      acc.concept += m.questionCoverage.concept;
      acc.ending += m.questionCoverage.ending;
      acc.limitation += m.questionCoverage.limitation;
      return acc;
    },
    { concept: 0, ending: 0, limitation: 0 }
  );

  return {
    doctrineCount: doctrines.length,
    sampledCount101,
    expertCount20,
    averageWordCount: mean(doctrines.map((d) => d.wordCount)),
    tierCounts,
    difficultyCounts,
    questionTotals,
    modelStats
  };
}

export function getLegalStoriesTopDoctrines(limit = 10): LegalStoriesDoctrine[] {
  const doctrines = getLegalStoriesDoctrines();
  return [...doctrines].sort((a, b) => b.wordCount - a.wordCount || a.label.localeCompare(b.label)).slice(0, Math.max(1, limit));
}

function isLegalStoriesResource(resource: Resource): boolean {
  if (resource.slug === "legalstories") return true;
  return resource.slug.startsWith("legalstories-") || resource.tags.some((t) => t.toLowerCase().trim() === "legalstories");
}

export function getLegalStoriesResources(): Resource[] {
  return getAllResources().filter(isLegalStoriesResource).sort((a, b) => a.title.localeCompare(b.title));
}
