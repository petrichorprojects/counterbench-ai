# Analytics & Tracking Setup — Status

Updated: 2026-03-19

## DONE (in code)

- [x] **GTM container** — `GTM-K8KVFZKG` snippet in `app/layout.tsx` (head + noscript fallback)
- [x] **GA4 direct tag** — `G-RSECPPZQ56` gtag.js in `app/layout.tsx`, fires independently of GTM
- [x] **Meta Pixel base snippet** — `components/AnalyticsPixels.tsx` → `<MetaPixel />` in layout. Reads `NEXT_PUBLIC_META_PIXEL_ID` env var. Renders nothing when unset.
- [x] **LinkedIn Insight Tag base snippet** — `components/AnalyticsPixels.tsx` → `<LinkedInInsightTag />` in layout. Reads `NEXT_PUBLIC_LINKEDIN_PARTNER_ID` env var. Renders nothing when unset.
- [x] **TrackedCTA component** — `components/TrackedCTA.tsx` pushes `cta_click` to dataLayer. Replaced all 6 dead `data-track` elements on `/advisory` page. Fixes the FAIL from conversion-audit.md.
- [x] **Newsletter generic provider fix** — Added `dataLayer.push` before `form.submit()` in generic provider path (`NewsletterCapture.tsx`). Closes the tracking gap from conversion-audit.md.
- [x] **next.config.js compat** — Moved `outputFileTracingExcludes` out of `experimental` (deprecated in Next 16), added `turbopack.root` for workspace inference.
- [x] **Build passes** — `tsc --noEmit` clean, `next build` clean.

## dataLayer events ready for GTM triggers

| Event                  | Component                    | Parameters                                      |
|------------------------|------------------------------|-------------------------------------------------|
| `cta_click`            | `TrackedCTA.tsx`             | `cta_text`, `cta_location`, `page`              |
| `newsletter_subscribe` | `NewsletterCapture.tsx`      | `email_source`                                  |
| `guide_download`       | `TrackedDownloadLink.tsx`    | `guide_slug`, `file_label`, `file_url`          |
| `strategy_call_book`   | `TrackedAdvisoryForm.tsx`    | `booking_source`                                |
| `source_finder_lead`   | `LegalDataSourceFinder.tsx`  | `email_source`                                  |

## NEEDS MANUAL GTM UI CONFIGURATION

### 1. Set env vars on Vercel
- [ ] `NEXT_PUBLIC_META_PIXEL_ID` — Get from Meta Business Manager → Events Manager → Pixel ID
- [ ] `NEXT_PUBLIC_LINKEDIN_PARTNER_ID` — Get from LinkedIn Campaign Manager → Account Assets → Insight Tag

### 2. GTM container (petrichorgrowth account)
- [ ] **GA4 Configuration tag** — Tag type: GA4 Configuration. Measurement ID: `G-RSECPPZQ56`. Trigger: All Pages. (This lets GTM manage GA4 config; the direct gtag in layout is a fallback.)
- [ ] **GA4 Event tags** — One per dataLayer event above. Tag type: GA4 Event. Use Custom Event triggers matching the event names.
- [ ] **Google Ads Conversion tag** — Tag type: Google Ads Conversion Tracking. Requires a Conversion ID + Label from Google Ads account. Trigger: `strategy_call_book` custom event (highest intent).
- [ ] **Meta Pixel tags** — Can manage entirely via base snippet + GTM Custom HTML for custom events, OR use Meta's GTM template. Key events to fire: `Lead` on `strategy_call_book`, `CompleteRegistration` on `newsletter_subscribe`.
- [ ] **LinkedIn Insight Tag** — Already loads via base snippet. In GTM, add conversion events: `strategy_call_book` → LinkedIn conversion pixel.

### 3. Testing
- [ ] Use GTM Preview mode to verify all tags fire on counterbench.ai
- [ ] Meta Pixel Helper extension to verify fbq events
- [ ] LinkedIn Insight Tag Helper to verify
- [ ] GA4 DebugView (Realtime) to confirm events arrive

## Hero Messaging Fix (2026-03-19)

- [x] **Replaced misleading HeroSection** — Removed fake "48,000+ litigation records indexed", "1,200 defense firms tracked", "17,000 expert witnesses analyzed", "200ms average search speed" metrics. Replaced with real numbers: 275+ legal AI tools, 800+ prompts, 30+ workflow skills, 10+ playbooks.
- [x] **Rewrote hero copy** — Changed from "litigation intelligence" positioning (which the product doesn't deliver) to accurate "curated legal AI toolkit" positioning. Updated eyebrow, headline, body, CTA, trust line, and all four feature cards.
- [x] **Build passes** — `next build` clean, no type errors.
- **Note**: `scripts/seed-pseo-stage1-guides.ts` still references "litigation intelligence" in SEO seed data — separate concern, left untouched since those are pSEO keyword targets, not product claims.

## Decisions

- Kept GA4 direct tag AND GTM-managed GA4 as dual setup — direct tag is a safety net if GTM is blocked by ad blockers. Duplicates are deduplicated by GA4 measurement ID.
- Meta Pixel and LinkedIn snippets are in code (not GTM-only) for the same ad-blocker resilience reason. GTM can layer custom events on top.
- TrackedCTA uses `next/link` for internal paths (prefetch + client nav) and plain `<a>` for anchors/external. No behavior change for users.
