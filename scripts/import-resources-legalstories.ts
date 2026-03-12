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

type ModelSummary = {
  key: "gpt4" | "gpt35" | "llama2";
  title: string;
  slug: string;
  filePath: string;
  url: string;
  access: AccessType[];
  questionCoverage: {
    concept: number;
    ending: number;
    limitation: number;
  };
  rows: number;
  avgStoryWords: number;
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

function cleanText(raw: string): string {
  return raw
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function countWords(text: string): number {
  const trimmed = cleanText(text);
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
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

function normalizeHeader(h: string): string {
  return h.replace(/^\uFEFF/, "").trim();
}

function parseTsvRecords(filePath: string): Array<Record<string, string>> {
  if (!fs.existsSync(filePath)) {
    console.error(`Missing TSV file: ${filePath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const rows = parseTsvRows(raw);
  if (rows.length === 0) return [];

  const rawHeader = rows[0] ?? [];
  const dropLeadingIndex = (rawHeader[0] ?? "").trim() === "";
  const headers = (dropLeadingIndex ? rawHeader.slice(1) : rawHeader).map(normalizeHeader);

  const out: Array<Record<string, string>> = [];
  for (let i = 1; i < rows.length; i += 1) {
    const rawRow = rows[i] ?? [];
    const row = dropLeadingIndex ? rawRow.slice(1) : rawRow;
    const record: Record<string, string> = {};
    for (let c = 0; c < headers.length; c += 1) {
      const key = headers[c] ?? "";
      if (!key) continue;
      record[key] = row[c] ?? "";
    }
    out.push(record);
  }

  return out;
}

function summarizeModel(args: {
  key: ModelSummary["key"];
  title: string;
  slug: string;
  filePath: string;
  url: string;
  access: AccessType[];
}): ModelSummary {
  const records = parseTsvRecords(args.filePath);

  const concept = records.filter((r) => cleanText(r.concept_question ?? "").length > 0).length;
  const ending = records.filter((r) => cleanText(r.ending_question ?? "").length > 0).length;
  const limitation = records.filter((r) => cleanText(r.limitation_question ?? "").length > 0).length;

  const avgStoryWords = mean(records.map((r) => countWords(r.story ?? "")));

  return {
    key: args.key,
    title: args.title,
    slug: args.slug,
    filePath: args.filePath,
    url: args.url,
    access: args.access,
    questionCoverage: { concept, ending, limitation },
    rows: records.length,
    avgStoryWords
  };
}

function difficultyCounts(records: Array<Record<string, string>>): Record<"easy" | "medium" | "hard", number> {
  const out: Record<"easy" | "medium" | "hard", number> = { easy: 0, medium: 0, hard: 0 };

  for (const row of records) {
    const d = cleanText(row.difficulty ?? "").toLowerCase();
    if (d === "easy" || d === "medium" || d === "hard") out[d] += 1;
  }

  return out;
}

function main() {
  const repoRoot = process.cwd();
  const contentRoot = process.env.CB_CONTENT_ROOT?.trim() ? process.env.CB_CONTENT_ROOT.trim() : "content";
  const baseDir = argValue("baseDir") || path.join(repoRoot, "data", "third_party", "legalstories");
  const outDir = argValue("outDir") || path.join(repoRoot, contentRoot, "resources", "legalstories");
  const lastChecked = argValue("lastChecked") || new Date().toISOString().slice(0, 10);

  const doctrines294Path = path.join(baseDir, "data", "294-doctrines", "legal_doctrines_294.tsv");
  const doctrines101Path = path.join(baseDir, "data", "101-doctrines", "legal_doctrines_101.tsv");
  const doctrines20Path = path.join(baseDir, "data", "20-doctrines", "legal_doctrines_20.tsv");
  const finalQuestionsPath = path.join(baseDir, "analysis", "expert_annotations", "Final_regenerated_questions_20.tsv");
  const finalAnswersPath = path.join(baseDir, "analysis", "expert_annotations", "Final_answer_annotations.tsv");

  const doctrines294 = parseTsvRecords(doctrines294Path);
  const doctrines101 = parseTsvRecords(doctrines101Path);
  const doctrines20 = parseTsvRecords(doctrines20Path);
  const finalQuestions = parseTsvRecords(finalQuestionsPath);
  const finalAnswers = parseTsvRecords(finalAnswersPath);

  const wordCounts = doctrines294
    .map((r) => Number.parseInt(cleanText(r.word_count ?? ""), 10))
    .filter((n) => Number.isFinite(n) && n > 0);

  const averageWordCount = mean(wordCounts);
  const maxWordCount = Math.max(...wordCounts, 0);
  const minWordCount = wordCounts.length === 0 ? 0 : Math.min(...wordCounts);

  const models: ModelSummary[] = [
    summarizeModel({
      key: "gpt4",
      title: "LegalStories (GPT-4-0613) question set",
      slug: "legalstories-model-gpt4-0613",
      filePath: path.join(baseDir, "data", "294-doctrines", "gpt4_story_question_294.tsv"),
      url: "https://github.com/hjian42/LegalStories/blob/main/data/294-doctrines/gpt4_story_question_294.tsv",
      access: ["commercial", "api"]
    }),
    summarizeModel({
      key: "gpt35",
      title: "LegalStories (GPT-3.5-turbo-0613) question set",
      slug: "legalstories-model-gpt-3-5-turbo-0613",
      filePath: path.join(baseDir, "data", "294-doctrines", "gpt3.5_story_question_294.tsv"),
      url: "https://github.com/hjian42/LegalStories/blob/main/data/294-doctrines/gpt3.5_story_question_294.tsv",
      access: ["commercial", "api"]
    }),
    summarizeModel({
      key: "llama2",
      title: "LegalStories (LLaMA-2) question set",
      slug: "legalstories-model-llama2",
      filePath: path.join(baseDir, "data", "294-doctrines", "llama2_story_question_294.tsv"),
      url: "https://github.com/hjian42/LegalStories/blob/main/data/294-doctrines/llama2_story_question_294.tsv",
      access: ["open"]
    })
  ];

  const totalConceptQuestions = models.reduce((sum, m) => sum + m.questionCoverage.concept, 0);
  const totalEndingQuestions = models.reduce((sum, m) => sum + m.questionCoverage.ending, 0);
  const totalLimitationQuestions = models.reduce((sum, m) => sum + m.questionCoverage.limitation, 0);

  const difficulty = difficultyCounts(finalAnswers);

  ensureDir(outDir);

  const resources: Resource[] = [];

  resources.push({
    slug: "legalstories",
    title: "LegalStories",
    description:
      "ACL 2024 dataset and codebase for teaching legal doctrines through LLM-generated stories, with multi-question evaluation and expert-annotated subsets.",
    url: "https://github.com/hjian42/LegalStories",
    tags: ["LegalStories", "Legal education", "LLM storytelling"],
    type: "research",
    last_checked: lastChecked,
    jurisdiction: ["Global / Multi-jurisdictional"],
    source_type: "datasets-benchmarks",
    access: ["open"],
    coverage:
      `Core corpus includes ${doctrines294.length} doctrines with average definition length ${averageWordCount.toFixed(1)} words (range ${minWordCount}-${maxWordCount}).`,
    license_notes: "Repository includes an Apache-2.0 license file. Verify per-model API terms and downstream educational use requirements.",
    best_for: ["research", "benchmarking"]
  });

  resources.push({
    slug: "legalstories-acl-2024-paper",
    title: "Leveraging LLMs for Learning Complex Legal Concepts through Storytelling (ACL 2024)",
    description: "Primary paper describing the LegalStories dataset construction, RCT design, and educational outcomes.",
    url: "https://aclanthology.org/2024.acl-long.388/",
    tags: ["LegalStories", "ACL 2024", "Research paper"],
    type: "research",
    last_checked: lastChecked,
    jurisdiction: ["Global / Multi-jurisdictional"],
    source_type: "scholarship",
    access: ["open"],
    coverage:
      "Paper details 294 doctrine dataset construction, expert-in-the-loop question design, and randomized controlled trial results with legal novices.",
    license_notes: "Publication rights and reuse terms are governed by ACL Anthology policies.",
    best_for: ["research", "benchmarking", "citation-check"]
  });

  const corpusItems: Array<{ slug: string; title: string; count: number; url: string; desc: string }> = [
    {
      slug: "legalstories-corpus-294-doctrines",
      title: "LegalStories corpus: 294 doctrines",
      count: doctrines294.length,
      url: "https://github.com/hjian42/LegalStories/blob/main/data/294-doctrines/legal_doctrines_294.tsv",
      desc: "Full doctrine corpus collected from Wikipedia with definitions and word-count metadata."
    },
    {
      slug: "legalstories-corpus-101-doctrines",
      title: "LegalStories sampled corpus: 101 doctrines",
      count: doctrines101.length,
      url: "https://github.com/hjian42/LegalStories/blob/main/data/101-doctrines/legal_doctrines_101.tsv",
      desc: "Sampled doctrine subset used for intermediate evaluation stages."
    },
    {
      slug: "legalstories-corpus-20-doctrines",
      title: "LegalStories expert set: 20 doctrines",
      count: doctrines20.length,
      url: "https://github.com/hjian42/LegalStories/blob/main/data/20-doctrines/legal_doctrines_20.tsv",
      desc: "Focused doctrine subset used for deeper human and expert evaluation workflows."
    }
  ];

  for (const item of corpusItems) {
    resources.push({
      slug: item.slug,
      title: item.title,
      description: item.desc,
      url: item.url,
      tags: ["LegalStories", "Corpus", `${item.count} doctrines`],
      type: "research",
      last_checked: lastChecked,
      jurisdiction: ["Global / Multi-jurisdictional"],
      source_type: "datasets-benchmarks",
      access: ["open"],
      coverage: `${item.count} doctrine rows in TSV format for legal concept learning tasks.`,
      license_notes: "Dataset file distributed within repository context; validate educational and commercial reuse policy before redistribution.",
      best_for: ["benchmarking", "research"]
    });
  }

  for (const model of models) {
    resources.push({
      slug: model.slug,
      title: model.title,
      description: `Model-specific story and question output over ${model.rows} doctrines.`,
      url: model.url,
      tags: ["LegalStories", "Question generation", model.key.toUpperCase()],
      type: "toolkit",
      last_checked: lastChecked,
      jurisdiction: ["Global / Multi-jurisdictional"],
      source_type: "datasets-benchmarks",
      access: model.access,
      coverage:
        `Rows: ${model.rows}. Question coverage (concept / ending / limitation): ${model.questionCoverage.concept} / ${model.questionCoverage.ending} / ${model.questionCoverage.limitation}. Avg story length: ${model.avgStoryWords.toFixed(1)} words.`,
      license_notes: "Generated outputs are tied to underlying model service terms and prompts; verify operational use rights.",
      best_for: ["benchmarking", "research"]
    });
  }

  const questionTypeResources: Array<{ slug: string; title: string; count: number; prompt: string }> = [
    {
      slug: "legalstories-question-type-concept",
      title: "LegalStories question type: concept comprehension",
      count: totalConceptQuestions,
      prompt: "Concept questions test direct understanding of doctrine definitions after story exposure."
    },
    {
      slug: "legalstories-question-type-ending",
      title: "LegalStories question type: scenario prediction",
      count: totalEndingQuestions,
      prompt: "Ending questions test transfer by asking learners to predict outcomes in hypothetical legal scenarios."
    },
    {
      slug: "legalstories-question-type-limitation",
      title: "LegalStories question type: rule limitation",
      count: totalLimitationQuestions,
      prompt: "Limitation questions probe exceptions and boundary conditions for each doctrine."
    }
  ];

  for (const item of questionTypeResources) {
    resources.push({
      slug: item.slug,
      title: item.title,
      description: item.prompt,
      url: "https://github.com/hjian42/LegalStories/blob/main/generate_question.py",
      tags: ["LegalStories", "Question type", `${item.count} prompts`],
      type: "course",
      last_checked: lastChecked,
      jurisdiction: ["Global / Multi-jurisdictional"],
      source_type: "datasets-benchmarks",
      access: ["open"],
      coverage: `Approximate coverage across model runs: ${item.count} non-empty question prompts.`,
      license_notes: "Question-generation pipeline code is repository content; generated outputs may require additional review before classroom use.",
      best_for: ["research", "benchmarking"]
    });
  }

  resources.push({
    slug: "legalstories-expert-regenerated-questions-20",
    title: "LegalStories expert-regenerated question set (20 doctrines)",
    description: "Final regenerated question TSV used in expert annotation analysis for 20-doctrine subset.",
    url: "https://github.com/hjian42/LegalStories/blob/main/analysis/expert_annotations/Final_regenerated_questions_20.tsv",
    tags: ["LegalStories", "Expert annotations", "Question quality"],
    type: "research",
    last_checked: lastChecked,
    jurisdiction: ["Global / Multi-jurisdictional"],
    source_type: "datasets-benchmarks",
    access: ["open"],
    coverage: `${finalQuestions.length} expert-question rows across concept, prediction, and limitation tracks.`,
    license_notes: "Expert-generated annotation artifacts should be reviewed for downstream publishing and redistribution policy.",
    best_for: ["research", "benchmarking", "citation-check"]
  });

  resources.push({
    slug: "legalstories-expert-answer-annotations",
    title: "LegalStories final answer annotations",
    description: "Answer-key annotations for the expert 20-doctrine evaluation subset.",
    url: "https://github.com/hjian42/LegalStories/blob/main/analysis/expert_annotations/Final_answer_annotations.tsv",
    tags: ["LegalStories", "Answer key", "Evaluation"],
    type: "research",
    last_checked: lastChecked,
    jurisdiction: ["Global / Multi-jurisdictional"],
    source_type: "datasets-benchmarks",
    access: ["open"],
    coverage: `Rows: ${finalAnswers.length}. Difficulty distribution: easy ${difficulty.easy}, medium ${difficulty.medium}, hard ${difficulty.hard}.`,
    license_notes: "Annotation artifacts are for evaluation; verify adaptation policy before derivative educational products.",
    best_for: ["research", "benchmarking", "citation-check"]
  });

  for (const r of resources) {
    const suffix = hash6(`${r.slug}:${r.url}`);
    const finalSlug = r.slug === "legalstories" || r.slug.startsWith("legalstories-corpus-") || r.slug.startsWith("legalstories-model-") ? r.slug : `${r.slug}-${suffix}`;
    fs.writeFileSync(path.join(outDir, `${finalSlug}.json`), JSON.stringify({ ...r, slug: finalSlug }, null, 2) + "\n", "utf8");
  }

  console.log(
    JSON.stringify(
      {
        base_dir: baseDir,
        output_dir: outDir,
        generated_at: new Date().toISOString(),
        resources_written: resources.length,
        doctrine_counts: {
          all_294: doctrines294.length,
          sample_101: doctrines101.length,
          expert_20: doctrines20.length
        },
        model_rows: Object.fromEntries(models.map((m) => [m.key, m.rows])),
        difficulty
      },
      null,
      2
    )
  );
}

main();
