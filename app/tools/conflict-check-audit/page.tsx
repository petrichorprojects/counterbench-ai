import type { Metadata } from "next";
import { ConflictCheckAudit } from "@/components/ConflictCheckAudit";
import { absoluteUrl, faqPageJsonLd } from "@/lib/seo";
import { QUESTIONS, TIERS, AUDIT_FAQ, MAX_SCORE, LAST_VERIFIED } from "@/lib/conflict-check-audit";

const TITLE = "Conflict Check Blind Spot Audit";
const DESCRIPTION =
  "A free eight-question audit of how your law firm actually runs conflict checks. Get a risk tier plus a named list of the blind spots most likely to produce a disqualification motion. Under three minutes, no signup.";
const URL = absoluteUrl("/tools/conflict-check-audit");

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    title: `${TITLE} | Counterbench.AI`,
    description: DESCRIPTION,
    url: URL,
    type: "website",
  },
};

function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: TITLE,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: DESCRIPTION,
    url: URL,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    isAccessibleForFree: true,
  };
}

export default function ConflictCheckAuditPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd(AUDIT_FAQ)) }}
      />

      <section className="section" style={{ paddingTop: 108, paddingBottom: "4rem" }}>
        <div className="container">
          <div className="label">Free tool</div>
          <h1 className="max-w-900">Does your conflict check actually catch conflicts?</h1>

          {/* First 40 words: plain-text answer to the target query, above the tool,
              for the featured snippet and LLM extraction. */}
          <p className="max-w-820 mt-4" style={{ fontSize: "1.125rem" }}>
            A conflict check is the process a law firm runs before taking a matter to confirm the representation does not
            conflict with duties owed to a current, former, or prospective client. This audit measures how reliably your
            firm&apos;s process catches those conflicts, and names the gaps most likely to cost you.
          </p>

          <ConflictCheckAudit />
        </div>
      </section>

      {/* ---- Server-rendered reference. Guarantees crawlers and LLMs see the
           full instrument — every failure mode, rule, and tier — without
           running the form. ---- */}
      <section className="section" style={{ paddingTop: 0, paddingBottom: "4rem" }}>
        <div className="container">
          <h2>What this audit checks</h2>
          <p className="max-w-820 text-muted">
            Eight questions, each testing a documented way conflict checks fail at small firms. Where a rule applies, it
            references the ABA Model Rules of Professional Conduct.
          </p>
          <ul className="max-w-820 mt-4">
            {QUESTIONS.map((q) => (
              <li key={q.id} style={{ marginBottom: "0.75rem" }}>
                <strong>{q.failureMode}</strong>
                {q.rules ? <span className="text-muted"> — Model Rule {q.rules.join(", ")}</span> : null}
                <br />
                <span className="text-muted">{q.question}</span>
              </li>
            ))}
          </ul>

          <h2 className="mt-5">How the score reads</h2>
          <ul className="max-w-820 mt-4">
            {TIERS.map((t) => (
              <li key={t.key} style={{ marginBottom: "0.5rem" }}>
                <strong>
                  {t.label} ({t.min}–{t.max} of {MAX_SCORE})
                </strong>{" "}
                — <span className="text-muted">{t.meaning}</span>
              </li>
            ))}
          </ul>

          <h2 className="mt-5">Questions</h2>
          <dl className="max-w-820 mt-4">
            {AUDIT_FAQ.map((f) => (
              <div key={f.q} style={{ marginBottom: "1rem" }}>
                <dt>
                  <strong>{f.q}</strong>
                </dt>
                <dd className="text-muted" style={{ margin: 0 }}>
                  {f.a}
                </dd>
              </div>
            ))}
          </dl>

          <p className="text-muted mt-5" style={{ fontSize: "0.9rem" }}>
            Not legal advice. This tool audits process, never a specific conflict, and never tells a firm whether it may
            take a matter. Rule citations reference the ABA Model Rules of Professional Conduct (last verified{" "}
            {LAST_VERIFIED}); your state&apos;s rules govern and may differ.
          </p>
        </div>
      </section>
    </main>
  );
}
