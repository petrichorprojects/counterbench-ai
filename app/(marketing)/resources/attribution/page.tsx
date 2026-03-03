import Link from "next/link";

export const metadata = { title: "Resources Attribution" };

export default function ResourcesAttributionPage() {
  return (
    <main>
      <section className="section" style={{ paddingTop: 120, paddingBottom: "4rem" }}>
        <div className="container">
          <div className="label">Resources</div>
          <h1 className="max-w-900">Attribution</h1>
          <p className="max-w-900 mt-4" style={{ fontSize: "1.125rem" }}>
            Counterbench.AI includes links and summaries to external resources. Some entries are imported from third-party curated lists and
            include the attribution and licensing notes required by those sources.
          </p>

          <div className="card mt-6" style={{ borderRadius: 12, padding: "1.75rem" }}>
            <div className="label">Legal Text Analytics</div>
            <div className="text-white" style={{ fontWeight: 800, fontSize: "1.05rem" }}>
              Liquid Legal Institute, “Legal Text Analytics”
            </div>
            <p className="text-muted" style={{ marginTop: 10, lineHeight: 1.55 }}>
              Resource entries under <code>content/resources/legal-text-analytics</code> are derived from the “Legal Text Analytics” resource list
              maintained by the Liquid Legal Institute.
            </p>
            <div className="mt-4" style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <a className="btn btn--secondary btn--sm" href="https://github.com/Liquid-Legal-Institute/Legal-Text-Analytics" target="_blank" rel="noreferrer">
                Source repository
              </a>
              <a className="btn btn--ghost btn--sm" href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">
                CC BY-SA 4.0 license
              </a>
              <Link className="btn btn--ghost btn--sm" href="/resources">
                Back to resources
              </Link>
            </div>
            <div className="text-muted" style={{ marginTop: 12, fontSize: "0.8125rem", lineHeight: 1.45 }}>
              If you notice a missing attribution, incorrect label, or want a source removed, contact us and we will fix it.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

