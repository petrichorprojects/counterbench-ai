import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

const DATA_PATH = path.join(process.cwd(), "data", "ai-native-companies.json");

export const AiNativeCompanySchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  website: z.string().url().nullable(),
  description: z.string().nullable(),
  focus: z.string().nullable(),
  hq: z.string().nullable(),
  uncertain: z.boolean()
});

export const AiNativeDatasetSchema = z.object({
  meta: z.object({
    title: z.string(),
    source: z.string(),
    compiled: z.string(),
    note: z.string()
  }),
  companies: z.array(AiNativeCompanySchema)
});

export type AiNativeCompany = z.infer<typeof AiNativeCompanySchema>;
export type AiNativeDataset = z.infer<typeof AiNativeDatasetSchema>;

// Category display order (matches the source market map).
const CATEGORY_ORDER = [
  "Legal",
  "Banking & Finance",
  "Tax & Accounting",
  "Insurance",
  "Healthcare",
  "HR",
  "BPO",
  "Logistics & Procurement",
  "Architecture & Real Estate",
  "Industrials",
  "Marketing"
];

let cache: AiNativeDataset | null = null;

function loadDataset(): AiNativeDataset {
  if (cache) return cache;
  const raw = fs.readFileSync(DATA_PATH, "utf8");
  cache = AiNativeDatasetSchema.parse(JSON.parse(raw));
  return cache;
}

export function getAiNativeMeta(): AiNativeDataset["meta"] {
  return loadDataset().meta;
}

export function getAiNativeCompanies(): AiNativeCompany[] {
  return loadDataset().companies;
}

export type AiNativeCategoryGroup = {
  category: string;
  companies: AiNativeCompany[];
};

export function getAiNativeByCategory(): AiNativeCategoryGroup[] {
  const companies = getAiNativeCompanies();
  const byCategory = new Map<string, AiNativeCompany[]>();
  for (const c of companies) {
    const list = byCategory.get(c.category) ?? [];
    list.push(c);
    byCategory.set(c.category, list);
  }
  const orderIndex = (cat: string) => {
    const i = CATEGORY_ORDER.indexOf(cat);
    return i === -1 ? CATEGORY_ORDER.length : i;
  };
  return [...byCategory.entries()]
    .sort((a, b) => orderIndex(a[0]) - orderIndex(b[0]) || a[0].localeCompare(b[0]))
    .map(([category, list]) => ({
      category,
      companies: list.sort((a, b) => a.name.localeCompare(b.name))
    }));
}

export type AiNativeStats = {
  total: number;
  verified: number;
  uncertain: number;
  categories: number;
  countries: number;
};

export function getAiNativeStats(): AiNativeStats {
  const companies = getAiNativeCompanies();
  const countries = new Set(companies.map((c) => c.hq).filter((hq): hq is string => Boolean(hq)));
  const categories = new Set(companies.map((c) => c.category));
  const uncertain = companies.filter((c) => c.uncertain).length;
  return {
    total: companies.length,
    verified: companies.length - uncertain,
    uncertain,
    categories: categories.size,
    countries: countries.size
  };
}
