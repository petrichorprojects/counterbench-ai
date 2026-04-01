# Conversion Event Audit — dataLayer Push Events

Audited: 2026-03-19
Scope: 4 GTM conversion events across Next.js app + static HTML pages

---

## 1. `newsletter_subscribe` — PASS (with caveat)

**Locations:**
- `components/NewsletterCapture.tsx:66` — Beehiiv provider path (after successful API response)
- `components/NewsletterCapture.tsx:93` — Formspree provider path (after successful API response)
- `js/main.js:112` / `public/js/main.js:112` — Static HTML pages (`.newsletter-form` submit handler)

**Parameters:** `{ event: "newsletter_subscribe", email_source: "<source>" }`

**Reachability:** All paths are reachable and fire after confirmed successful subscription.

**Issue — generic provider path missing event:**
In `NewsletterCapture.tsx:104`, the `generic` provider falls through to `form.submit()` without pushing to dataLayer. If the provider env var is unset or set to anything other than `formspree`/`beehiiv`, the subscription succeeds but the event never fires.

**Risk:** Low in production (provider is configured), but fragile. If the env var is ever removed, tracking silently breaks.

**Fix needed:** Add `dataLayer.push()` before `form.submit()` on line 104, or move the push above the provider switch so it fires regardless of provider.

---

## 2. `guide_download` — PASS

**Location:** `components/TrackedDownloadLink.tsx:18-23`

**Parameters:** `{ event: "guide_download", guide_slug, file_label, file_url }`

**Reachability:** Component is used in `app/(marketing)/guides/[slug]/page.tsx` (lines 228, 633). Fires on click before browser navigates to download URL. No `preventDefault` — the click handler fires and the browser follows the href. This is correct behavior for a download link.

**Issues:** None.

---

## 3. `strategy_call_book` — PASS

**Location:** `components/TrackedAdvisoryForm.tsx:14-17`

**Parameters:** `{ event: "strategy_call_book", booking_source: "advisory-briefing-form" }`

**Reachability:** Component wraps the advisory briefing form at `app/(marketing)/advisory/page.tsx:653-715`. The `onSubmit` handler fires before native form submission (no `preventDefault`). Event will push to dataLayer before the page navigates away.

**Issues:** None. The `booking_source` is hardcoded to `"advisory-briefing-form"` which is fine since there's only one usage.

---

## 4. `cta_click` — FAIL (dead on Next.js pages)

**Location:** `public/js/main.js:149-159` (and identical `js/main.js:136-147`)

**Parameters:** `{ event: "cta_click", cta_text, cta_location, page }`

**Reachability on static HTML pages:** Works. `public/js/main.js` is loaded via `<script src="/js/main.js">` in `index.html` and all `pages/*.html` files. `data-track` attributes are present on buttons/links in those pages.

**Reachability on Next.js pages: DEAD CODE.** `public/js/main.js` is **never loaded** in the Next.js app (`app/layout.tsx` does not include it). The Next.js advisory page (`app/(marketing)/advisory/page.tsx`) has 6 elements with `data-track` attributes (lines 72, 75, 307, 335, 358, 619), but no JavaScript attaches click listeners to them. These `data-track` attributes are inert — `cta_click` never fires on any Next.js-rendered page.

**Impact:** All CTA click tracking on Next.js pages is lost. The advisory page — likely the highest-intent page — has zero CTA tracking.

**Fix needed:** Create a `"use client"` component (e.g., `TrackedCTA`) that pushes `cta_click` to dataLayer on click, or add a global effect in layout that attaches listeners to `[data-track]` elements after hydration.

---

## Summary

| Event                | Status | Notes                                              |
|----------------------|--------|----------------------------------------------------|
| `newsletter_subscribe` | PASS*  | Generic provider path missing push (low risk)     |
| `guide_download`       | PASS   | Clean, no issues                                  |
| `strategy_call_book`   | PASS   | Clean, no issues                                  |
| `cta_click`            | FAIL   | Dead on all Next.js pages — no JS loads the handler |

## Additional Observations

- **Drift between `js/main.js` and `public/js/main.js`:** The public version has an extra `briefing_request` event handler (lines 135-146) that the source `js/main.js` lacks. These files should be consolidated or one should be deleted.
- **`briefing_request` is not in the 4 audited events** but exists in `public/js/main.js:140`. Not audited here but may also need GTM configuration.
- **`source_finder_lead` event** in `LegalDataSourceFinder.tsx:104` is outside audit scope but present.
- **GTM + GA4 both initialized** in `app/layout.tsx` — dataLayer is available for all Next.js pages, confirming the issue is purely that `cta_click` has no push logic in the React layer.

## Priority Fix

The `cta_click` failure is the only blocking issue. Recommended approach: create a `TrackedCTA` client component that wraps `<a>` or `<Link>` and pushes `cta_click` on click, then replace the 6 raw `data-track` elements in the advisory page. This keeps the pattern consistent with how the other 3 events are tracked (dedicated React components).
