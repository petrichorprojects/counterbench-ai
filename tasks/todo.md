# CounterbenchAI — Tasks (updated 2026-04-25)

## Deadline
- **May 5, 2026**: Billing deadline for active clients

---

## Pending (needs Philipp)
- [ ] Add Twilio env vars to Vercel production (required for Remote Receptionist call flow)
- [ ] Set up HIPAA BAAs with vendors (Twilio, Resend, Neon minimum)
- [ ] Fix Calendly booking link
- [ ] Set `NEXT_PUBLIC_META_PIXEL_ID` env var on Vercel (Meta Business Manager → Events Manager)
- [ ] Set `NEXT_PUBLIC_LINKEDIN_PARTNER_ID` env var on Vercel (LinkedIn Campaign Manager → Insight Tag)
- [ ] Configure GTM container (GA4 Event tags, Google Ads Conversion tag, Meta Pixel events) — see GTM checklist in this file below

---

## Ready to execute (Green)
- [ ] Run drizzle-kit push to create DB tables in production (schema is in `lib/db/schema.ts`)
- [ ] End-to-end test: full call flow (Vapi webhook → DB → email alert via `app/api/receptionist/call-complete/route.ts`)
- [ ] Ungate Remote Receptionist page (page exists at `app/(marketing)/paralegals/page.tsx` — confirm it is linked from nav and sitemap)
- [ ] Verify verdictops.com 301 -> counterbench.ai/paralegals is live (configured at the verdictops.com host/DNS level — NOT in next.config.js, which has no verdictops redirect; confirm via browser or curl)
- [ ] Fix hardcoded `noreply@verdictops.com` fallback in two API routes (post-merger cleanup):
  - `app/api/screenapp-webhook/route.ts` line 71
  - `app/api/receptionist/call-complete/route.ts` line 59
  - Replace fallback with `noreply@counterbench.ai`
- [ ] GTM Preview mode — verify all dataLayer tags fire on counterbench.ai
- [ ] Meta Pixel Helper — verify fbq events
- [ ] GA4 DebugView — confirm events arrive

---

## GTM Manual Config Checklist (UI work, needs access)
- [ ] GA4 Configuration tag — Measurement ID: `G-RSECPPZQ56`, Trigger: All Pages
- [ ] GA4 Event tags — one per event: `cta_click`, `newsletter_subscribe`, `guide_download`, `strategy_call_book`, `source_finder_lead`
- [ ] Google Ads Conversion tag — requires Conversion ID + Label from Google Ads account; trigger on `strategy_call_book`
- [ ] Meta Pixel custom events — `Lead` on `strategy_call_book`, `CompleteRegistration` on `newsletter_subscribe`
- [ ] LinkedIn Insight Tag conversion event — `strategy_call_book`

---

## Working Memory

### App structure
- Next.js 15, React 19, App Router at `app/`
- Route groups: `app/(marketing)/` for public pages
- Key pages: `/paralegals`, `/advisory`, `/workshop`, `/diagnostic`, `/insights`
- API routes: `app/api/receptionist/`, `app/api/checkout/`, `app/api/screenapp-webhook/`
- DB: Drizzle ORM + Neon Postgres (`lib/db/schema.ts`)
- Email: Resend

### Redirect config
- `next.config.js` handles legacy `/pages/*.html` -> clean URL redirects only
- NO verdictops.com redirect in the CB codebase — that 301 must be configured at the verdictops.com hosting/DNS layer (Vercel project for verdictops.com)
- `vercel.json` only sets security headers; no redirects defined there either

### Post-merger cleanup outstanding
- Two API routes still have `noreply@verdictops.com` as fallback sender (see Green tasks above)
- Ensure `RESEND_FROM` env var is set to `noreply@counterbench.ai` on Vercel to avoid fallback triggering

### Build status
- Last confirmed clean build: 2026-03-19 (per todo.md history — `tsc --noEmit` clean, `next build` clean)
- Scripts: `npm run typecheck` (tsc --noEmit), `npm run build` (next build)
