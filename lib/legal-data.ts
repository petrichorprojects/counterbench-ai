import { getAllResources, type Resource } from "@/lib/resources";
import { isUsJurisdiction } from "@/lib/us-legal";

export * from "@/lib/legal-data-core";

function isAwesomeLegalDataResource(resource: Resource): boolean {
  return resource.slug.startsWith("ald-") || resource.tags.some((t) => t.toLowerCase().trim() === "awesome legal data");
}

export function getAllAwesomeLegalDataResources(): Resource[] {
  return getAllResources().filter(isAwesomeLegalDataResource);
}

export function getAwesomeLegalDataResources(): Resource[] {
  return getAllAwesomeLegalDataResources().filter((r) => (r.jurisdiction ?? []).some(isUsJurisdiction));
}
