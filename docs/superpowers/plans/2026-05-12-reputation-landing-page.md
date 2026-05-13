# Reputation Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `app/(marketing)/reputation/page.tsx` — a minimal, trust-validating landing page for the VerdictOps Google review response service at `counterbench.ai/reputation`.

**Architecture:** Single static Next.js page inside the existing `(marketing)` route group. No new components, no client components, no API calls. Follows the inline-JSX + CSS token pattern established by `app/(marketing)/paralegals/page.tsx`. Four sections: Hero, How It Works, Bar Compliance callout, Closing/Contact.

**Tech Stack:** Next.js App Router (TypeScript), CSS custom properties (existing design tokens), no new dependencies.

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Create | `app/(marketing)/reputation/page.tsx` | The full page — metadata + four sections |

No other files modified. The verdictops.com → `/reputation` redirect change is a Vercel domain setting, not a code change — handled outside this plan.

---

## Task 1: Create the page file

**Files:**
- Create: `app/(marketing)/reputation/page.tsx`

- [ ] **Step 1: Create the file with full implementation**

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Google Review Responses for Law Firms | VerdictOps",
  description:
    "Bar-compliant Google review responses written and posted within 24 hours. $175/month. No contract. Built for law firms in the Boston metro.",
  alternates: { canonical: "https://counterbench.ai/reputation" },
  openGraph: {
    title: "Google Review Responses for Law Firms | VerdictOps",
    description:
      "Bar-compliant review responses for law firms. Written in your voice, posted within 24 hours. $175/month. No contract.",
    type: "website",
    url: "https://counterbench.ai/reputation",
  },
};

const steps = [
  {
    number: "01",
    title: "Send us the review",
    body: "Forward any review you want addressed. We handle the rest.",
  },
  {
    number: "02",
    title: "We write the response",
    body: "Bar-compliant draft in your firm's voice. No client info disclosed. No admission of facts.",
  },
  {
    number: "03",
    title: "Live within 24 hours",
    body: "We post it. You never touch Google.",
  },
];

export default function ReputationPage() {
  return (
    <main>
      {/* Hero */}
      <section className="section" style={{ paddingTop: 120, paddingBottom: "4rem" }}>
        <div className="container">
          <div className="label" style={{ display: "inline-block" }}>For law firms</div>
          <h1 className="max-w-900 mt-2">
            Your reviews are public.<br />Your silence is too.
          </h1>
          <p className="max-w-700 mt-3" style={{ fontSize: "1.1875rem", lineHeight: 1.6 }}>
            VerdictOps writes bar-compliant Google review responses for law firms — posted within 24 hours, $175/month.
          </p>
          <div className="mt-4" style={{ borderTop: "1px solid var(--border)", paddingTop: "1.25rem" }}>
            <div className="grid grid--3 grid--gap-2" style={{ maxWidth: 720 }}>
              {["$175/month", "Posted within 24 hours", "No contract"].map((point) => (
                <div key={point} style={{ fontSize: "0.875rem", display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                  <span style={{ color: "var(--green)", flexShrink: 0 }}>✓</span>
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="container">
          <div className="label" style={{ display: "inline-block" }}>How it works</div>
          <h2 className="mt-2" style={{ maxWidth: 480 }}>Three steps. Nothing complicated.</h2>
          <div className="grid grid--3 grid--gap-2 mt-4">
            {steps.map((s) => (
              <div key={s.number} style={{ borderLeft: "2px solid var(--border)", paddingLeft: "1.25rem" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>{s.number}</div>
                <div style={{ fontWeight: 600, fontSize: "1rem" }}>{s.title}</div>
                <p className="mt-2" style={{ fontSize: "0.9375rem", color: "var(--muted)" }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bar compliance */}
      <section className="section" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="container">
          <div
            style={{
              background: "var(--bg3)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "2rem 2.5rem",
              maxWidth: 720,
            }}
          >
            <div className="label" style={{ display: "inline-block", marginBottom: "1rem" }}>Bar compliance</div>
            <p style={{ fontSize: "1.0625rem", lineHeight: 1.7, marginBottom: "1rem" }}>
              Every response is written to Rule 7.1 standards. No confirmation of
              attorney-client relationship. No disclosure of client identity. No
              admission of facts. Responses acknowledge — they don&apos;t argue.
            </p>
            <p style={{ fontSize: "0.9375rem", color: "var(--muted)", lineHeight: 1.65 }}>
              We&apos;ve read the rules so you don&apos;t have to respond to a
              1-star and end up with a grievance.
            </p>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="section" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              marginBottom: "0.5rem",
            }}
          >
            $175
            <span style={{ fontSize: "1rem", fontWeight: 400, color: "var(--muted)" }}>
              /month
            </span>
          </div>
          <div style={{ fontSize: "0.9375rem", color: "var(--muted)", marginBottom: "2rem" }}>
            No contract. Cancel anytime.
          </div>
          <p style={{ fontSize: "1.0625rem", lineHeight: 1.65 }}>
            Reply to the email you received — or write directly to{" "}
            <a
              href="mailto:philipp@verdictops.com"
              style={{ color: "inherit", textDecoration: "underline" }}
            >
              philipp@verdictops.com
            </a>
            .
          </p>
          <p className="mt-3" style={{ fontSize: "0.9375rem", color: "var(--muted)" }}>
            — Philipp Rimmler, VerdictOps
          </p>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run from project root:
```bash
npx tsc --noEmit
```
Expected: no errors. If errors appear, fix type issues in the new file only.

- [ ] **Step 3: Run Next.js build**

```bash
npm run build
```
Expected: build completes, route `/reputation` appears in the output page list. If build fails, check the error — likely an unclosed JSX tag or missing import.

- [ ] **Step 4: Commit**

```bash
git add app/\(marketing\)/reputation/page.tsx
git commit -m "feat: add reputation landing page at /reputation"
```

---

## Task 2: Verify the route in dev

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Open the page**

Navigate to `http://localhost:3000/reputation`. Verify:
- Hero headline visible above the fold
- Three steps render in a row (or stacked on mobile)
- Bar compliance block has a distinct background
- Price `$175/month` and email link visible at bottom
- No CounterbenchAI or paralegal service text anywhere on the page

- [ ] **Step 3: Stop dev server and confirm**

All sections match the spec. No console errors.

---

## Post-Deploy: Redirect update (manual — outside this plan)

After deploying to production, update the verdictops.com domain redirect in Vercel:

1. Go to Vercel → project for verdictops.com (or the project where the domain is assigned)
2. Settings → Domains → verdictops.com
3. Change the redirect destination from `https://counterbench.ai/paralegals` to `https://counterbench.ai/reputation`
4. Save. Propagation is near-instant on Vercel.

This is a one-click change in the Vercel dashboard — no code, no deploy needed.
