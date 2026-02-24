import type { Tool } from "./schemas";

function uniq(arr: string[]): string[] {
  return [...new Set(arr)];
}

function stripTrailingCounts(input: string): string {
  let s = input.trim();
  // e.g. "Patent analysis (7)" -> "Patent analysis"
  s = s.replace(/\s*\(\d+\)\s*$/, "");
  // e.g. "Contract reviews34" -> "Contract reviews"
  s = s.replace(/(\D)\d+$/, "$1");
  // e.g. "Commercial law advice1 0" -> "Commercial law advice"
  s = s.replace(/\s+\d+(?:\s+\d+)*\s*$/, "");
  return s.trim();
}

function normalizeName(name: string): string {
  let s = name.trim();
  s = s.replace(/^@+/, "");
  // e.g. "Abstra 2,148" -> "Abstra" (likely a suffix count)
  s = s.replace(/\s+\d{1,3}(?:,\d{3})+\s*$/, "");
  // e.g. "AI Lawyer 472" -> "AI Lawyer"
  s = s.replace(/\s+\d{3,}\s*$/, "");
  return s.trim() || name.trim();
}

function normalizeCategory(cat: string): string | null {
  const s = stripTrailingCounts(cat);
  return s ? s : null;
}

function normalizeTag(tag: string): string | null {
  const s = stripTrailingCounts(tag);
  if (!s) return null;
  // Drop pure numeric / stray fragments from scraped sources.
  if (/^[\d\s,.)]+$/.test(s)) return null;
  return s;
}

function isPendingDescription(desc: string): boolean {
  const d = desc.trim().toLowerCase();
  return d === "description pending verification." || d === "description pending verification";
}

function titleize(input: string): string {
  const s = input.trim();
  if (!s) return s;
  // charAt() avoids TS "possibly undefined" on string indexing.
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function inferAutoDescription(tool: Tool): string {
  const cats = tool.categories.map((c) => c.toLowerCase());
  const tags = tool.tags.map((t) => t.toLowerCase());
  const hay = `${cats.join(" ")} ${tags.join(" ")}`;

  if (hay.includes("contract")) return "Contract review and drafting assistant for legal teams.";
  if (hay.includes("compliance") || hay.includes("gdpr") || hay.includes("privacy")) return "Compliance assistant for policies, controls, and audits.";
  if (hay.includes("patent") || hay.includes("ip")) return "IP and patent research and drafting assistant.";
  if (hay.includes("research") || hay.includes("case law") || hay.includes("citation")) return "Legal research assistant for faster case analysis and citations.";
  if (hay.includes("documents drafting") || hay.includes("draft")) return "Legal document drafting assistant for common workflows.";
  if (hay.includes("documents review") || hay.includes("review")) return "Legal document review and analysis assistant.";
  if (hay.includes("parking ticket")) return "Parking ticket appeal letter assistant.";
  if (hay.includes("verdict")) return "Case outcome and verdict analysis assistant.";
  if (hay.includes("advice")) return "General legal Q&A assistant (not legal advice).";

  // Safe default (broad but accurate for the directory).
  return "Legal AI tool for drafting, review, and research.";
}

export function normalizeTool(raw: Tool): Tool {
  const name = normalizeName(raw.name);
  const categories = uniq(raw.categories.map(normalizeCategory).filter(Boolean) as string[]);
  const tags = uniq(raw.tags.map(normalizeTag).filter(Boolean) as string[]);

  // Keep at least one category for filtering/navigation.
  const finalCategories = categories.length ? categories : ["Legal"];

  const description = isPendingDescription(raw.description) ? inferAutoDescription({ ...raw, name, categories: finalCategories, tags }) : raw.description;

  return {
    ...raw,
    name,
    categories: finalCategories.map(titleize),
    tags,
    description
  };
}
