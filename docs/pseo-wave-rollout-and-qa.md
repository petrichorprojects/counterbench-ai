# Counterbench Programmatic SEO Rollout and QA Runbook (2026)

## Objective

Scale pSEO safely to 100,000+ potential URLs without publishing thin, duplicate, or orphaned pages.

## Wave-by-Wave Rollout Plan

### Wave 0 (Readiness, 3-5 days)

- Finalize taxonomy for categories, personas, integrations, locations, and file formats.
- Confirm canonical URL rules and slug patterns.
- Lock content templates and metadata schema for each playbook type.
- Enable QA scripts and reporting.
- Define publish/no-publish thresholds.

Exit criteria:

- URL and metadata standards approved.
- QA scripts passing on dry run.
- Internal-link architecture and sitemap strategy documented.

### Wave 1 (Stage 1 Execution, 1-2 weeks)

- Publish one high-value hub page per playbook type (12 total minimum).
- Include local market variants only where meaningful data and unique context exist.
- Ensure every page links to parent, siblings, and cross-playbook pages.
- Validate all pages with automated QA before release.

Exit criteria:

- All 12 playbooks represented in live pages.
- No duplicate slugs or duplicate primary keywords.
- Every page clears min-word threshold and link requirements.
- No broken internal URLs in release set.

### Wave 2 (Cluster Expansion, 2-4 weeks)

- Add 30-60 child pages targeting highest-intent combinations only.
- Prioritize templates, comparisons, conversions, and local pages with clear demand.
- Expand from Stage 1 winners using measured engagement and conversion signals.

Exit criteria:

- Indexation healthy for Wave 1+2 pages.
- No major keyword cannibalization between cluster pages.
- Conversion rate non-inferior versus Wave 1 baseline.

### Wave 3 (Scaled Expansion, rolling)

- Expand winning clusters in controlled batches (50-150 URLs/wave).
- Pause low-performing templates; improve before expanding.
- Continue segmented sitemap submissions by playbook.

Exit criteria:

- Stable crawl/index coverage.
- Sustained quality and conversion signals.
- No thin-page or duplicate-intent spikes.

## QA Framework

### Pre-Publish Gates

- Schema validation: page payload parses and meets required fields.
- Uniqueness: no repeated slug, no repeated primary keyword.
- Content depth: informational pages >= 900 words, utility pages >= 600 words.
- FAQ depth: at least 3 FAQs per page.
- Linking: at least 5 internal links and at least 2 related-page suggestions.
- Link architecture: parent + 2 siblings + 2 cross-playbook links per page.
- Playbook coverage: all 12 playbooks must exist in Stage 1.

### Post-Publish Gates

- Indexation coverage by sitemap segment.
- CTR and engagement by playbook and page template.
- Conversion rate and assisted-conversion attribution.
- Cannibalization checks for overlapping primary keywords.
- Broken link and orphan URL scan.

## Stage 1 (Executed in Repo)

Stage 1 is implemented through executable scripts and generated guide content:

- Seed script: `scripts/seed-pseo-stage1-guides.ts`
- QA script: `scripts/qa-pseo-stage1.ts`
- Manifest: `out/pseo-stage1-manifest.json`

Commands:

```bash
npm run seed-pseo:stage1
npm run qa:pseo:stage1
```

Outputs:

- Stage 1 guide JSON pages in `content/guides/`
- Stage 1 manifest in `out/pseo-stage1-manifest.json`
- QA report in `out/qa-pseo-stage1.json`

## Publishing Policy

- Do not ship all generated pages at once.
- Publish wave by wave only after QA and performance checks pass.
- Expand only proven templates and proven combinations.
