# Decisions Log

## 2026-05-21: Sales motion locked + Remote Receptionist admin endpoints landed

**Decision**: Lock CB paralegal-teams sales motion (ICP, offer, channel mix, cadence) until 2026-08-01 review. No edits to motion mid-quarter — only data updates. Ship `/api/admin/receptionist/firms` CRUD behind `x-admin-key` so firms can be seeded without raw SQL.

**Rationale**: Strategic Self-Audit (May 2026) named CounterbenchAI top portfolio priority and flagged "no repeatable sales motion" as bottleneck. VerdictOps brand sunset (2026-04-22) — verdictops.com 301s to counterbench.ai/paralegals; all receptionist work is CB-only now. Admin endpoint replaces the raw-SQL seeding step in `docs/vapi-setup.md` so launch is repeatable per firm.

**Implication**:
- Branch `feat/sales-motion-lock` ready for PR (4 commits: sales motion lock, admin CRUD, NextJS 15 async params fix)
- Phil's 90-min sitting captured in `tasks/remote-receptionist-launch-checklist.md` and `scripts/receptionist-launch.fish`
- Kill criteria tripwire D added: Receptionist V1 not E2E-tested by 2026-06-15
- VerdictOps Express/EJS receptionist endpoint is dead code (live URL 301-redirects); no longer maintained
- ADMIN_API_KEY for prod was generated 2026-05-21 and stored in `.env.local.scratch` (gitignored via `*.scratch`)

---

## 2026-03-29: Stripe checkout custom_fields use semantic value names

**Decision**: Stripe dropdown `value` fields must be alphanumeric-only. Used semantic names: `small`/`midsize`/`large`/`enterprise` for firm_size, `officemanager` for office manager role.

**Rationale**: Stripe rejects hyphens, underscores, and plus signs in dropdown values. Labels shown to customers are unaffected. Semantic names are more useful for analytics than numeric ranges.

**Implication**: When querying Stripe session data or webhooks, expect `small`/`midsize`/`large`/`enterprise` in `custom_fields.firm_size`.

---

## 2026-03-29: Stripe live products (Petrichorgrowth account)

**Decision**: One Stripe account (Petrichorgrowth) for all businesses including CounterbenchAI.

**Products created** (live mode, `sk_live_51SpIBd...`):
- Standard: `prod_UF0CvnvjG5Up0e` | full `price_1TGWCGBPgpxuJAS662InYwwM` | early bird `price_1TGWCGBPgpxuJAS6E7MVvIxL`
- Premium: `prod_UF0CHx4MVTE0zb` | full `price_1TGWCHBPgpxuJAS6N7XoFsyo` | early bird `price_1TGWCHBPgpxuJAS6YoE0t2tq`

**SECURITY NOTE**: Key `sk_live_51SpIBd...` was shared in chat — rotate it.

---

## 2026-03-19: Hero messaging rewrite — honest product positioning

**Decision**: Completely rewrote HeroSection from "litigation intelligence platform" positioning to "curated legal AI toolkit" positioning.

**Context**: The hero claimed "48,000+ litigation records indexed", "1,200 defense firms tracked", "17,000 expert witnesses analyzed" — none of which exist. The product is actually a directory of 275+ legal AI tools, 800+ prompts, 30+ workflow skills, and 10+ playbooks. This was flagged in `tasks/mvp-acceptance-criteria.md` as a critical credibility risk with skeptical legal professionals.

**Rationale**: Legal professionals are professionally skeptical. Making claims the product can't back up is worse than no hero at all — it actively destroys trust. Better to be honest about what exists and compelling about why it matters.

**What changed**:
- Eyebrow: "FOR PLAINTIFF ATTORNEYS" → "FOR LEGAL PROFESSIONALS" (broader, accurate)
- Headline: litigation-specific → general legal AI toolkit
- All four feature cards rewritten to match actual product (tool directory, prompt library, workflow skills, playbooks)
- Metrics strip uses real numbers instead of fabricated ones
- CTA: "Search Litigation Intelligence" → "Explore Legal AI Tools"

**What was left alone**: `scripts/seed-pseo-stage1-guides.ts` still references "litigation intelligence" as pSEO keyword targets — those are SEO strategy, not product claims on the homepage.

**Implication**: If Counterbench ever builds actual litigation intelligence features, the hero can be updated then. Until then, sell what exists.

## 2026-03-19: Analytics dual-setup (GA4 direct + GTM)

**Decision**: Keep GA4 direct tag AND GTM-managed GA4 as dual setup.

**Rationale**: Direct tag is a safety net if GTM is blocked by ad blockers. GA4 deduplicates by measurement ID so no double-counting.

**Implication**: Meta Pixel and LinkedIn snippets follow the same pattern — in code for ad-blocker resilience, GTM layers custom events on top.
