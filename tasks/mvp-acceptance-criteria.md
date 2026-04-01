# CounterbenchAI — MVP Acceptance Criteria & User Flow Map

Created: 2026-03-19
Status: Draft for review

---

## What the Product Actually Is (Current State)

CounterbenchAI is a **curated legal AI directory and resource platform** — not a SaaS product with user accounts. It's a Next.js content site (deployed on Vercel) that aggregates legal AI tools, prompts, skills, playbooks, guides, and data resources into a searchable, filterable library for legal professionals.

### Content inventory (as of audit):
- **275 tools** (JSON files with structured metadata: pricing, platform, categories, tags, verification status)
- **803 prompts** (MDX files with frontmatter: use case, inputs, steps, output format)
- **30 skills** (MDX files with when-to-use guidance and examples)
- **29 prompt packs** (curated bundles of prompts by workflow)
- **11 collections** (curated tool groupings)
- **10 playbooks** (JSON: matter-type-specific tool/prompt/skill recommendations with checklists)
- **24 guides** (JSON: in-depth articles on legal AI topics — pSEO pages)
- **4 resources** (data maps and resource pages)
- **4 insights** (editorial content)

### Key features built:
1. **Homepage with smart search** — intent-aware search (HomeSuggest) that routes to tools, prompts, skills, playbooks
2. **Tool directory** — filterable by category, pricing, platform, tags; sortable; paginated
3. **Tool comparison** — side-by-side comparison view
4. **Prompt library** — searchable, taggable, with vote buttons
5. **Skills library** — structured "how to use AI for X" templates
6. **Playbooks** — matter-type workflow guides bundling tools + prompts + checklists
7. **Legal Pad** — localStorage-based "save for later" (no account required)
8. **Vote system** — localStorage-based upvote/downvote on prompts
9. **Source Finder** — interactive tool to build matter-specific legal data source stacks
10. **Contract QA Planner** — interactive contract review workflow builder
11. **LawGlance Planner, MLEB Shortlist Builder, LegalStories Lesson Builder** — interactive resource tools
12. **Global search** — MiniSearch-powered full-text search across all content types
13. **Newsletter capture** — Beehiiv/Formspree integration
14. **Advisory page** — retained AI strategy advisory service (from $3,500/mo) with form submission
15. **Guides (pSEO)** — 24 programmatic SEO pages targeting legal AI comparison/how-to queries
16. **Dark/light theme toggle**
17. **GTM + GA4 analytics**

### What does NOT exist:
- No user accounts / authentication
- No backend database (all content is static JSON/MDX files)
- No API beyond newsletter subscription
- No payment processing
- No AI-powered features (no LLM integration — despite the name, it's a directory, not an AI tool)
- No user-generated content
- The "litigation intelligence" hero section (HeroSection: "48,000+ litigation records indexed") appears aspirational — no evidence of actual litigation data or search functionality backing those claims

---

## User Flow Map

### Flow 1: Discovery → Tool Matching (Primary Value Path)

```
Google/Reddit/Newsletter → Landing Page
  ↓
Homepage hero search (HomeSuggest)
  → Type legal task (e.g., "contract review")
  → See ranked results across tools, prompts, skills, playbooks
  → Click result
    ↓
  Tool detail page → External tool website (outbound link)
  Prompt detail page → Read/copy prompt → Save to Legal Pad
  Skill detail page → Read/copy skill template
  Playbook detail page → See bundled tools + prompts + checklist
```

### Flow 2: Directory Browse → Filter → Compare

```
Homepage → "Browse the full directory" CTA
  ↓
Tools index page (/tools)
  → Filter by category, pricing, platform
  → Search within results
  → Click "Compare" → Side-by-side view
  → Click individual tool → Tool detail page → External link
```

### Flow 3: Prompt Discovery → Copy → Use

```
Nav → Prompts (/prompts)
  → Search or filter by tag
  → Click prompt → Read full prompt with inputs/steps/output format
  → Copy prompt text → Use in ChatGPT/Claude/etc.
  → Vote (up/down) → localStorage
  → Save to Legal Pad → localStorage
```

### Flow 4: Interactive Tools (Source Finder, Contract QA Planner)

```
Nav → AI Law Library → Source Finder (/tools/source-finder)
  → Select task type, jurisdiction, source type
  → See ranked legal data sources
  → Export as CSV
  → Newsletter capture at bottom

Nav → Contract QA Planner (/tools/contract-qa-planner)
  → Build contract review workflow
  → Get recommended tools + prompts
```

### Flow 5: Newsletter → Retention

```
Any page with NewsletterCapture component
  → Enter email → Beehiiv/Formspree
  → Receive weekly updates on tools/packs
```

### Flow 6: Advisory (Revenue Path)

```
Nav → AI Advisory (/advisory)
  → Read advisory service description
  → Fill out briefing request form
  → Form submits to Formspree/configured endpoint
  → Philipp follows up manually
```

### Flow 7: pSEO Guide Landing → Engagement

```
Google search → Guide page (e.g., /guides/best-contract-review-ai-tools-2026)
  → Read guide with tool recommendations
  → Click through to tool detail pages
  → Newsletter capture
```

---

## MVP Acceptance Criteria

The MVP question is: **What must work for a beta user (legal professional) to get value from CounterbenchAI?**

### P0 — Must Work (Beta-blocking)

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | **Homepage loads and smart search returns relevant results** for common legal tasks (contract review, discovery, research, compliance, intake) | PASS | HomeSuggest with intent-aware search is built and functional |
| 2 | **Tool directory displays all 275 tools** with working filters (category, pricing, platform) and pagination | PASS | Built, paginated at 24/page |
| 3 | **Each tool detail page renders** with name, description, categories, pricing, platform, external link, verification status | VERIFY | Need to confirm [slug] page renders correctly for all 275 tools |
| 4 | **Tool comparison works** — user can select 2+ tools and see side-by-side view | VERIFY | Compare page exists but functionality not audited |
| 5 | **Prompt library displays all 803 prompts** with search and tag filter | PASS | Built and functional |
| 6 | **Each prompt detail page renders** with title, description, full prompt text, inputs, steps, output format | VERIFY | Need to confirm MDX rendering works for all prompts |
| 7 | **Copy-to-clipboard works on prompt pages** | VERIFY | Core value prop — user needs to copy prompts into their LLM |
| 8 | **Legal Pad save/retrieve works** across sessions (localStorage persistence) | VERIFY | Built but not tested for reliability |
| 9 | **Newsletter signup works** with configured provider (Beehiiv or Formspree) | PASS* | Works but generic provider path missing dataLayer push (per conversion audit) |
| 10 | **Site is fast** — pages load in <2s on standard connection | VERIFY | Static generation should make this fast, but 275 tool JSON files + 803 prompt MDX files could slow build |
| 11 | **Mobile responsive** — all pages usable on phone/tablet | VERIFY | Nav has mobile toggle but page layouts not audited for mobile |
| 12 | **SEO fundamentals** — title tags, meta descriptions, canonical URLs, sitemap.xml, robots.txt all present and correct | PARTIAL | sitemap.ts and robots.ts exist; metadata set on key pages; canonical on advisory page |

### P1 — Should Work (Quality bar for public launch)

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 13 | **Playbooks render with linked tools, prompts, and checklists** | VERIFY | 10 playbooks exist; need to confirm cross-references resolve |
| 14 | **Source Finder produces useful results and CSV export works** | VERIFY | Interactive tool built; export logic present |
| 15 | **pSEO guide pages render correctly** with tool recommendations | VERIFY | 24 guide pages; need to confirm rendering and internal links |
| 16 | **Advisory form submits successfully** and data reaches Philipp | VERIFY | Form action URL configured via env var; needs end-to-end test |
| 17 | **CTA click tracking fires on Next.js pages** | FAIL | Dead code per conversion audit — no JS attaches listeners to data-track elements in React layer |
| 18 | **Skills library displays all 30 skills** with detail pages | VERIFY | Built but not audited |
| 19 | **Collections and packs pages render** with linked content | VERIFY | 11 collections, 29 packs exist |
| 20 | **Dark/light theme works** without flash on initial load | PASS | Theme init script in layout.tsx prevents FOUC |
| 21 | **Global search returns results across all content types** | VERIFY | SearchWorkspace built; search index built at build time |

### P2 — Nice to Have (Post-beta)

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 22 | **Diagnostic page has actual content** | FAIL | Currently a stub with no functionality |
| 23 | **About, Contact pages have content** | VERIFY | Static HTML pages exist but may be stale vs Next.js app |
| 24 | **Vote data persists and is useful** | PARTIAL | localStorage only — no aggregation, no backend, votes are per-device |
| 25 | **Insights/editorial content is populated** | PARTIAL | 4 insights exist; unclear if they're substantial |

---

## Gaps Between Current State and MVP Readiness

### Critical Gaps

1. **Messaging mismatch: "Litigation Intelligence" hero vs. actual product**
   - The HeroSection claims "48,000+ litigation records indexed," "1,200 defense firms tracked," "17,000 expert witnesses analyzed," "200ms average search speed" — but the product is a tool/prompt directory, not a litigation intelligence database. A beta user clicking "Search Litigation Intelligence" lands on the generic search page with no litigation-specific data.
   - **Risk**: Destroys credibility instantly with legal professionals who are skeptical by default.
   - **Recommendation**: Either build the litigation intelligence features or remove/replace HeroSection with honest product messaging.

2. **CTA tracking dead on all Next.js pages** (per conversion audit)
   - The advisory page — the highest-intent revenue page — has zero CTA tracking.
   - **Fix**: Create TrackedCTA component (recommended in conversion audit).

3. **No copy-to-clipboard verification**
   - The core value proposition (copy a prompt, use it) hasn't been verified as working. If prompt detail pages don't have a copy button or it doesn't work, the product fails at its primary use case.

4. **Static HTML pages vs. Next.js app drift**
   - `pages/` directory has static HTML files (about, advisory, contact, diagnostic, insights, newsletter) that are separate from the Next.js app routes. Some pages may exist in both places with different content. The `js/main.js` vs `public/js/main.js` drift noted in the conversion audit is a symptom.
   - **Recommendation**: Consolidate onto Next.js or remove static HTML duplicates.

### Moderate Gaps

5. **Diagnostic page is an empty stub** — marketing nav links to it but it has no functionality.

6. **No error handling or 404 pages audited** — if a user hits a broken tool slug or prompt slug, unclear what happens.

7. **No content freshness signals** — tools change pricing/features constantly. 275 tools with `last_verified` dates that may be stale erodes trust with the "verified" positioning.

8. **Advisory form endpoint not verified** — env var `NEXT_PUBLIC_ADVISORY_FORM_ACTION_URL` may not be configured in production.

9. **Build performance unknown** — 275 JSON + 803 MDX + 24 guide JSON files at build time. Need to verify build completes within Vercel limits and pages are statically generated.

### Minor Gaps

10. **No onboarding** — first-time user gets no guidance on what to do or how to use the platform.

11. **Legal Pad is fragile** — localStorage only, no backup mechanism beyond manual copy button. Adequate for MVP but sets up support burden.

12. **Vote system has no backend** — votes are localStorage-only, meaning they serve no analytical purpose (can't see what the community votes up).

---

## MVP Definition (Recommendation)

**CounterbenchAI MVP = a legal professional can arrive, find relevant AI tools and prompts for their workflow, copy/save what they need, and optionally subscribe for updates.**

The product is ready for beta with these conditions:
1. Remove or honestly reframe the HeroSection litigation intelligence claims
2. Verify copy-to-clipboard works on prompt pages
3. Fix CTA tracking on Next.js pages (TrackedCTA component)
4. Verify advisory form submits end-to-end
5. Remove or hide the empty Diagnostic page from navigation
6. Run E2E tests across critical paths (homepage search → tool detail, prompt browse → copy, advisory form submit)

Everything else is solid for a content-driven directory MVP. The content volume (275 tools, 803 prompts, 30 skills, 10 playbooks) is a genuine competitive advantage if the information is accurate and current.
