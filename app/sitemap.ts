import type { MetadataRoute } from "next";
import { getAllCollections, getAllPacks, getAllPlaybooks, getAllPrompts, getAllSkills, getAllTools } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const base: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: absoluteUrl("/tools"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/tools/collections"), lastModified: now, changeFrequency: "weekly", priority: 0.65 },
    { url: absoluteUrl("/playbooks"), lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: absoluteUrl("/prompts"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/skills"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/tools/compare"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/contact"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/insights"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/advisory"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/diagnostic"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/newsletter"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/privacy"), lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: absoluteUrl("/terms"), lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: absoluteUrl("/eula"), lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: absoluteUrl("/the-counterbench"), lastModified: now, changeFrequency: "weekly", priority: 0.6 }
  ];

  const tools = getAllTools().map((t) => ({
    url: absoluteUrl(`/tools/${t.slug}`),
    lastModified: t.last_verified ? new Date(t.last_verified) : now,
    changeFrequency: "weekly" as const,
    priority: 0.7
  }));

  const collections = getAllCollections().map((c) => ({
    url: absoluteUrl(`/tools/collections/${c.slug}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.65
  }));

  const prompts = getAllPrompts().map((p) => ({
    url: absoluteUrl(`/prompts/${p.slug}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6
  }));

  const packs = getAllPacks().map((p) => ({
    url: absoluteUrl(`/prompts/packs/${p.slug}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6
  }));

  const skills = getAllSkills().map((s) => ({
    url: absoluteUrl(`/skills/${s.slug}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6
  }));

  const playbooks = getAllPlaybooks().map((p) => ({
    url: absoluteUrl(`/playbooks/${p.slug}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.75
  }));

  const packIndex: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/prompts/packs"), lastModified: now, changeFrequency: "weekly", priority: 0.65 }
  ];

  return [...base, ...packIndex, ...tools, ...collections, ...playbooks, ...prompts, ...packs, ...skills];
}
