import type { Tool } from "./schemas";

function uniq(arr: string[]): string[] {
  return [...new Set(arr)];
}

function stripTrailingCounts(input: string): string {
  let s = input.trim();
  // e.g. "Patent analysis (7)" -> "Patent analysis"
  s = s.replace(/\s*\([\p{N}]+\)\s*$/u, "");
  // e.g. "Contract reviews34" -> "Contract reviews"
  // e.g. "Commercial law advice1 0" -> "Commercial law advice"
  s = s.replace(/[\p{N}]+(?:\s+[\p{N}]+)*\s*$/u, "");
  return s.trim();
}

function normalizeName(name: string): string {
  let s = name.trim();
  s = s.replace(/^@+/, "");
  // Strip common trailing version suffixes: "v3", "v3.2", "version 2.1", "(v2)".
  s = s.replace(/\s*\(?v(?:er(?:sion)?)?\.?\s*\d+(?:[.\-]\d+)*\)?\s*$/i, "");
  // Strip trailing "beta/alpha" markers.
  s = s.replace(/\s+\(?((?:private\s+)?(?:alpha|beta))\)?\s*$/i, "");
  // e.g. "Abstra 2,148" -> "Abstra" (likely a suffix count)
  s = s.replace(/\s+\d{1,3}(?:,\d{3})+\s*$/, "");
  // e.g. "AI Lawyer 472" -> "AI Lawyer"
  s = s.replace(/\s+\d{3,}\s*$/, "");
  return s.trim() || name.trim();
}

function isUnhelpfulTitle(name: string): boolean {
  const s = (name || "").trim();
  if (!s) return true;
  // Pure numeric / punctuation names are not beginner friendly.
  if (/^[\d\W_]+$/.test(s)) return true;
  // Extremely short names are suspect unless they're clear acronyms.
  if (s.length <= 2 && !/^[A-Z]{2}$/.test(s)) return true;
  return false;
}

function titleFromSlug(slug: string): string | null {
  const raw = (slug || "").trim();
  if (!raw) return null;

  // If it's just an ID, don't fabricate a title.
  if (/^\d+$/.test(raw)) return null;

  const ACRONYMS = new Map<string, string>([
    ["ai", "AI"],
    ["gpt", "GPT"],
    ["rag", "RAG"],
    ["llm", "LLM"],
    ["api", "API"],
    ["apis", "APIs"],
    ["gdpr", "GDPR"],
    ["dpa", "DPA"],
    ["dsar", "DSAR"],
    ["kyc", "KYC"],
    ["aml", "AML"],
    ["soc2", "SOC 2"],
    ["sso", "SSO"],
    ["slas", "SLAs"],
    ["sla", "SLA"],
    ["eula", "EULA"],
    ["ediscovery", "eDiscovery"]
  ]);

  const parts = raw
    .replace(/[_]+/g, "-")
    .split("-")
    .filter(Boolean)
    // drop trailing numeric suffix tokens (common in scraped sources)
    .filter((p) => !/^\d+$/.test(p));

  if (parts.length === 0) return null;

  const words = parts.map((p) => {
    const lower = p.toLowerCase();
    const acr = ACRONYMS.get(lower);
    if (acr) return acr;
    // Preserve existing casing for mixed-case tokens like "vLex".
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) return p;
    return p.charAt(0).toUpperCase() + p.slice(1);
  });

  const candidate = words.join(" ").replace(/\s+/g, " ").trim();
  return candidate || null;
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
  // Scraped sources vary; treat any "pending verification" variant as missing.
  return d.includes("pending verification");
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
  let name = normalizeName(raw.name);
  // If the stored name is not beginner friendly, fall back to a readable title from the slug.
  if (isUnhelpfulTitle(name) || name.trim().toLowerCase() === raw.slug.trim().toLowerCase()) {
    const fromSlug = titleFromSlug(raw.slug);
    if (fromSlug && !isUnhelpfulTitle(fromSlug)) name = fromSlug;
  }
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
