import { z } from "zod";

export const PricingEnum = z.enum(["free", "paid", "trial", "freemium", "unknown"]);
export const ToolStatusEnum = z.enum(["active", "deprecated", "unknown"]);

export const ToolChangeLogEntrySchema = z.object({
  date: z.string(),
  note: z.string()
});

export const ToolSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  pricing: PricingEnum,
  platform: z.array(z.string()).default([]),
  url: z.string().url(),
  affiliate_url: z.string().url().nullable(),
  logo: z.string().nullable(),
  featured: z.boolean(),
  last_verified: z.string().nullable(),
  status: ToolStatusEnum,
  change_log: z.array(ToolChangeLogEntrySchema).default([])
});

export type Tool = z.infer<typeof ToolSchema>;

export const CollectionSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  tool_slugs: z.array(z.string()).default([]),
  order: z.number().int().default(0),
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional()
    })
    .optional()
});

export type Collection = z.infer<typeof CollectionSchema>;

export const PackSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  prompt_slugs: z.array(z.string()).default([]),
  audience: z.string().default("legal"),
  workflow_stage: z.string().default("general"),
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional()
    })
    .optional()
});

export type Pack = z.infer<typeof PackSchema>;

export const PromptFrontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  use_case: z.string().default(""),
  inputs: z.array(z.string()).default([]),
  steps: z.array(z.string()).default([]),
  output_format: z.string().default(""),
  tags: z.array(z.string()).default([]),
  last_updated: z.string().default("")
});

export type PromptFrontmatter = z.infer<typeof PromptFrontmatterSchema>;

export const SkillFrontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  when_to_use: z.string().default(""),
  inputs: z.array(z.string()).default([]),
  examples: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  last_updated: z.string().default("")
});

export type SkillFrontmatter = z.infer<typeof SkillFrontmatterSchema>;

