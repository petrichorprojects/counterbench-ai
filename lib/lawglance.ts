import { getAllResources, type Resource } from "@/lib/resources";

export type LawglanceSection = "index" | "coverage" | "stack" | "roadmap" | "developer";

export function isLawglanceResource(resource: Resource): boolean {
  return resource.slug === "lawglance" || resource.slug.startsWith("lg-") || resource.tags.some((t) => t.toLowerCase().trim() === "lawglance");
}

export function lawglanceSection(resource: Resource): LawglanceSection {
  if (resource.slug === "lawglance") return "index";
  if (resource.slug.startsWith("lg-coverage-")) return "coverage";
  if (resource.slug.startsWith("lg-stack-")) return "stack";
  if (resource.slug.startsWith("lg-roadmap-")) return "roadmap";
  return "developer";
}

export function getLawglanceResources(): Resource[] {
  return getAllResources().filter(isLawglanceResource).sort((a, b) => a.title.localeCompare(b.title));
}

export function getLawglanceBySection(resources: Resource[]) {
  return {
    index: resources.find((r) => lawglanceSection(r) === "index") ?? null,
    coverage: resources.filter((r) => lawglanceSection(r) === "coverage"),
    stack: resources.filter((r) => lawglanceSection(r) === "stack"),
    roadmap: resources.filter((r) => lawglanceSection(r) === "roadmap"),
    developer: resources.filter((r) => lawglanceSection(r) === "developer")
  };
}

export function getLawglanceStats(resources: Resource[]) {
  const grouped = getLawglanceBySection(resources);
  const apiReady = resources.filter((r) => (r.access ?? []).includes("api")).length;
  const openAccess = resources.filter((r) => (r.access ?? []).includes("open")).length;

  return {
    total: resources.length,
    coverageCount: grouped.coverage.length,
    stackCount: grouped.stack.length,
    roadmapCount: grouped.roadmap.length,
    apiReady,
    openAccess
  };
}
