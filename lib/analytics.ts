/**
 * Typed GTM dataLayer analytics utility.
 *
 * All custom event pushes for Counterbench.AI flow through this module.
 * Each function is a thin wrapper around `window.dataLayer.push` — no
 * third-party library, no bundled overhead, just the raw dataLayer contract
 * that GTM reads.
 *
 * GTM container: GTM-K8KVFZKG
 * GA4 property:  G-RSECPPZQ56
 *
 * Event catalogue (custom events only — GTM built-ins like gtm.js / pageview
 * are fired automatically by the container):
 *
 *   tool_view              — fired once when a user lands on /tools/[slug]
 *   tool_click_cta         — fired when a user clicks through to an external tool
 *   paralegal_inquiry_start — fired when a user clicks a paralegal CTA
 *   paralegal_form_submit  — fired on submission of the paralegal inquiry form
 *
 * Existing events (wired in other components, documented here for reference):
 *   newsletter_subscribe   — NewsletterCapture.tsx
 *   guide_download         — TrackedDownloadLink.tsx
 *   strategy_call_book     — TrackedAdvisoryForm.tsx
 *   cta_click              — TrackedCTA.tsx
 */

/** Discriminated union of every custom event payload this site pushes. */
export type AnalyticsEvent =
  | {
      event: "tool_view";
      tool_slug: string;
    }
  | {
      event: "tool_click_cta";
      tool_slug: string;
      destination: string;
    }
  | {
      event: "paralegal_inquiry_start";
      inquiry_source: string;
    }
  | {
      event: "paralegal_form_submit";
      inquiry_source: string;
    }
  | {
      event: "newsletter_subscribe";
      email_source: string;
    }
  | {
      event: "guide_download";
      guide_slug: string;
      file_label: string;
      file_url: string;
    }
  | {
      event: "strategy_call_book";
      booking_source: string;
    }
  | {
      event: "cta_click";
      cta_text: string;
      cta_location: string;
      page: string;
    };

/**
 * Central push function. Initialises `window.dataLayer` if absent (GTM does
 * the same, but this guards against race conditions where the snippet hasn't
 * executed yet — e.g. in preview / blocked-GTM scenarios).
 *
 * Only callable in browser contexts. Server-side calls are silently ignored.
 */
function push(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(event as Record<string, unknown>);
}

// ---------------------------------------------------------------------------
// Tool directory events
// ---------------------------------------------------------------------------

/**
 * Fire when a user views a tool detail page (/tools/[slug]).
 * Call this from a client component mounted on page load (useEffect).
 *
 * @param toolSlug - The URL slug of the tool, e.g. "clio-draft"
 */
export function trackToolView(toolSlug: string): void {
  push({ event: "tool_view", tool_slug: toolSlug });
}

/**
 * Fire when a user clicks the primary "Visit tool" CTA on a tool detail page
 * or on a ToolCard, navigating to the external tool URL.
 *
 * @param toolSlug   - The URL slug of the tool
 * @param destination - The full external URL the user is navigating to
 */
export function trackToolCTA(toolSlug: string, destination: string): void {
  push({ event: "tool_click_cta", tool_slug: toolSlug, destination });
}

// ---------------------------------------------------------------------------
// Paralegal events
// ---------------------------------------------------------------------------

/**
 * Fire when a user takes an action that signals paralegal inquiry intent —
 * clicking a "Book a discovery call" or "Get started" CTA on /paralegals.
 *
 * @param step - "start" for CTA clicks, "submit" for form submission
 */
export function trackParalegalInquiry(step: "start" | "submit"): void {
  if (step === "start") {
    push({ event: "paralegal_inquiry_start", inquiry_source: "paralegals-page" });
  } else {
    push({ event: "paralegal_form_submit", inquiry_source: "paralegals-page" });
  }
}
