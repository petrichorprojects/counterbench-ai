import type { Resource } from "@/lib/resources";

export type FinderTask = "research" | "citation-check" | "docket-watch" | "policy-check" | "benchmarking";

export type SourceFinderFilters = {
  jurisdiction: string;
  sourceType: string;
  task: FinderTask | "";
  query: string;
  onlyApi: boolean;
};

export type RankedResource = Resource & {
  score: number;
  match_reasons: string[];
};

function norm(s: string): string {
  return s.toLowerCase().trim();
}

export function getFinderOptionSets(resources: Resource[]) {
  const jurisdictions = new Set<string>();
  const sourceTypes = new Set<string>();

  for (const r of resources) {
    for (const j of r.jurisdiction ?? []) {
      if (j.trim()) jurisdictions.add(j.trim());
    }
    if (r.source_type && r.source_type !== "other") sourceTypes.add(r.source_type);
  }

  return {
    jurisdictions: [...jurisdictions].sort((a, b) => a.localeCompare(b)),
    sourceTypes: [...sourceTypes].sort((a, b) => a.localeCompare(b))
  };
}

function taskMatches(resource: Resource, task: FinderTask | ""): boolean {
  if (!task) return true;
  return (resource.best_for ?? []).map(norm).includes(norm(task));
}

function scoreResource(resource: Resource, filters: SourceFinderFilters): RankedResource | null {
  const reasons: string[] = [];
  let score = 0;

  if (filters.jurisdiction) {
    const jurisdictionMatch = (resource.jurisdiction ?? []).some((j) => norm(j) === norm(filters.jurisdiction));
    if (!jurisdictionMatch) return null;
    score += 5;
    reasons.push("Jurisdiction match");
  }

  if (filters.sourceType) {
    if (norm(resource.source_type) !== norm(filters.sourceType)) return null;
    score += 4;
    reasons.push("Source type match");
  }

  if (filters.onlyApi) {
    const hasApi = (resource.access ?? []).includes("api");
    if (!hasApi) return null;
    score += 2;
    reasons.push("API available");
  }

  if (!taskMatches(resource, filters.task)) return null;
  if (filters.task) {
    score += 3;
    reasons.push(`Best for ${filters.task}`);
  }

  if (filters.query) {
    const q = norm(filters.query);
    const hay = norm(
      [
        resource.title,
        resource.description,
        resource.coverage,
        ...(resource.tags ?? []),
        ...(resource.jurisdiction ?? []),
        resource.source_type
      ].join(" ")
    );

    if (!hay.includes(q)) return null;
    score += 2;
    reasons.push("Keyword match");
  }

  if ((resource.access ?? []).includes("open")) {
    score += 1;
    reasons.push("Open access");
  }

  if ((resource.access ?? []).includes("api")) score += 1;
  if (resource.last_checked) score += 0.5;

  return {
    ...resource,
    score,
    match_reasons: reasons
  };
}

export function rankLegalDataSources(resources: Resource[], filters: SourceFinderFilters): RankedResource[] {
  return resources
    .map((r) => scoreResource(r, filters))
    .filter((r): r is RankedResource => Boolean(r))
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
}

export function getLegalDataStats(resources: Resource[]) {
  const byJurisdiction = new Map<string, number>();
  const bySourceType = new Map<string, number>();
  const byAccess = new Map<string, number>();

  for (const r of resources) {
    const jurisdictions = r.jurisdiction?.length ? r.jurisdiction : ["Global / Multi-jurisdictional"];
    for (const j of jurisdictions) {
      byJurisdiction.set(j, (byJurisdiction.get(j) ?? 0) + 1);
    }

    const sourceType = r.source_type || "other";
    bySourceType.set(sourceType, (bySourceType.get(sourceType) ?? 0) + 1);

    const access = r.access?.length ? r.access : ["unknown"];
    for (const a of access) {
      byAccess.set(a, (byAccess.get(a) ?? 0) + 1);
    }
  }

  const topJurisdictions = [...byJurisdiction.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 12)
    .map(([label, count]) => ({ label, count }));

  const sourceTypeBreakdown = [...bySourceType.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, count]) => ({ label, count }));

  const accessBreakdown = [...byAccess.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, count]) => ({ label, count }));

  const apiReady = resources.filter((r) => (r.access ?? []).includes("api")).length;
  const openSources = resources.filter((r) => (r.access ?? []).includes("open")).length;

  return {
    total: resources.length,
    apiReady,
    openSources,
    topJurisdictions,
    sourceTypeBreakdown,
    accessBreakdown
  };
}

export function sourceTypeLabel(sourceType: string): string {
  switch (sourceType) {
    case "case-law":
      return "Case law";
    case "statutes-regulation":
      return "Statutes & regulation";
    case "dockets-filings":
      return "Dockets & filings";
    case "scholarship":
      return "Scholarship";
    case "datasets-benchmarks":
      return "Datasets & benchmarks";
    case "research-platform":
      return "Research platform";
    default:
      return "Other";
  }
}
