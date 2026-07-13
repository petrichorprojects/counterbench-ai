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
- [x] Verify verdictops.com 301 -> counterbench.ai/paralegals is live — VERIFIED 2026-06-30 via curl: verdictops.com 307→www.verdictops.com 308→counterbench.ai/paralegals→200. Redirect live and functional (307/308 not literal 301, lands correct).
- [x] Fix hardcoded `noreply@verdictops.com` fallback in two API routes — ALREADY DONE (verified 2026-06-30). Both files now use `process.env.RESEND_FROM || "noreply@counterbench.ai"`:
  - `app/api/screenapp-webhook/route.ts` line 84 ✓
  - `app/api/receptionist/call-complete/route.ts` line 70 ✓
  - No `verdictops.com` string remains anywhere in CB codebase.
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

### E2E suite repair — 2026-07-06
- [x] Triage 23 "failing" Playwright specs → root cause: Grafana listens on port 3000; `reuseExistingServer: true` made the whole suite run against Grafana, not the app. No specs were stale; app was never broken.
- [x] Fix: `playwright.config.ts` default e2e port moved 3000 → 3100 (`E2E_PORT` env override; `E2E_BASE_URL` still wins).
- [x] Deleted `tests/e2e/receptionist.spec.ts` (untracked, never committed): its `page.route()` mocks never intercept `page.request.*` (APIRequestContext bypasses route handlers), so all 17 tests were self-mocking theater hitting the real server; real mode would need ADMIN_API_KEY and would write test rows to prod Neon. Contract coverage: `__tests__/receptionist-admin.test.ts` + `__tests__/receptionist-call-flow.test.ts` + new `__tests__/receptionist-calls.test.ts` (GET /api/receptionist/calls had zero coverage after the deletion).
- [ ] Backlog: real HTTP-layer e2e for receptionist routes (URL→handler wiring, [id] params) — gated on a test-DB story; do not point tests at prod Neon.
- [ ] **SECURITY (found in review, needs decision): `GET /api/receptionist/calls` is unauthenticated** and returns the last 100 call records — transcripts + caller phone numbers (PI-intake PII) — to anyone. Needs auth guard (x-admin-key like admin routes) or removal if unused.
- [x] Result: `npm run e2e` → 15 passed, 3 skipped (visual capture, opt-in via VISUAL=1), 0 failed.
- [x] Stale worktree `.claude/worktrees/stupefied-goldwasser-08fca0/` removed + branch deleted; its one unique file salvaged to `adr/legal-pi-review.md`.
- Gotcha for future runs: a squatted port + reuseExistingServer silently tests the wrong application. Now guarded automatically: `tests/e2e/global-setup.ts` asserts the server at baseURL is actually Counterbench before any test runs, and `reuseExistingServer` is disabled in CI.
