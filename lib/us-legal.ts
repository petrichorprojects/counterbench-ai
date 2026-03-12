import type { Resource } from "@/lib/resources";

function norm(input: string): string {
  return input.toLowerCase().trim();
}

export function isUsJurisdiction(label: string): boolean {
  const s = norm(label);
  return s === "united states" || s === "united states of america" || s === "us" || s === "u.s." || s === "usa" || s.includes("united states");
}

export function isUsFocusedResource(resource: Resource): boolean {
  const jurisdictions = resource.jurisdiction ?? [];
  if (jurisdictions.some(isUsJurisdiction)) return true;

  // Architecture/tooling resources that are jurisdiction-neutral but configured for US workflows.
  if (resource.slug === "legal-contract-qa-bot" || resource.slug.startsWith("lcqa-")) return true;

  return false;
}

