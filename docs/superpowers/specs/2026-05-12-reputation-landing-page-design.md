# Reputation Landing Page — Design Spec
**Date:** 2026-05-12
**Route:** `/reputation` on counterbench.ai
**Redirect change:** verdictops.com 301 → `counterbench.ai/reputation` (was `/paralegals`)

---

## Purpose

Single-audience page: attorney who received a VerdictOps cold email and googled the brand.
Job: confirm the service is real and the sender knows what they're talking about.
Not a lead gen page. Not a funnel. A trust validator.

---

## Architecture

New route: `app/(marketing)/reputation/page.tsx`
No new components required — follows existing marketing page patterns (inline JSX, CSS design tokens).
Metadata: title, description, canonical, OG tags.

---

## Sections

### 1. Hero
- **Headline:** Your reviews are public. Your silence is too.
- **Subhead:** VerdictOps writes bar-compliant Google review responses for law firms — posted within 24 hours, $175/month.
- No CTA button. No form. Price visible above the fold.

### 2. How It Works
Three steps, displayed as a horizontal or stacked grid:
1. **Send us the review** — Forward any review you want addressed. We handle the rest.
2. **We write the response** — Bar-compliant draft in your firm's voice. No client info disclosed. No admission of facts.
3. **Live within 24 hours** — We post it. You never touch Google.

### 3. Bar Compliance Callout
Dark background block (uses `--bg3` or `--bg` token). Tight copy:

> Every response is written to Rule 7.1 standards. No confirmation of attorney-client relationship. No disclosure of client identity. No admission of facts. Responses acknowledge — they don't argue.
>
> We've read the rules so you don't have to respond to a 1-star and end up with a grievance.

### 4. Closing / Contact
- **Price anchor:** $175/month. No contract. Cancel anytime.
- **CTA copy:** Reply to the email you received — or write directly to philipp@verdictops.com.
- **Signature:** — Philipp Rimmler, VerdictOps

---

## Redirect Change

`next.config.js` — update redirects array:
```js
// Before
{ source: "/", destination: "https://counterbench.ai/paralegals", permanent: true }
// (wherever verdictops.com redirect is configured — DNS/hosting level, not next.config)
```

**Note:** The verdictops.com → counterbench.ai redirect is at the DNS/hosting level (not in next.config.js). This is a Vercel domain redirect or registrar-level forward. Must be updated in Vercel project settings or domain registrar for verdictops.com to point to `counterbench.ai/reputation`.

---

## Design Constraints

- Follow existing marketing page patterns — no new CSS classes, no new components
- Dark/light theme via CSS tokens (`--bg`, `--fg`, `--muted`, `--border`)
- Typography: Inter (`--sans`) for body, Lora (`--serif`) for headline if needed
- Max width: `--max-w` (1120px) with `--pad` gutters
- No CounterbenchAI branding, no paralegal service mentions, no tool directory references
- Total copy target: ~200 words

---

## Success Criteria

- Attorney from cold email visits verdictops.com, lands on `/reputation`
- Sees the service name, price, and bar compliance claim within 5 seconds
- Can reply to the cold email with sufficient context to convert
- Page builds and deploys without breaking existing counterbench.ai routes

---

## Out of Scope

- Contact form or lead capture
- Calendly or booking integration
- Analytics events beyond existing site setup
- Mobile-specific layout changes (existing responsive grid handles it)
