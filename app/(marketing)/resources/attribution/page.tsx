import Link from "next/link";

export const metadata = {
  title: "Resources Attribution",
  description:
    "Attribution and licensing details for third-party legal data sources indexed on Counterbench.AI, including Awesome Legal Data, Legal Text Analytics, and Legal Contract QA Bot."
};

export default function ResourcesAttributionPage() {
  return (
    <main>
      <section className="section" style={{ paddingTop: 120, paddingBottom: "4rem" }}>
        <div className="container">
          <div className="label">Resources</div>
          <h1 className="max-w-900">Attribution</h1>
          <p className="max-w-900 mt-4" style={{ fontSize: "1.125rem" }}>
            Counterbench.AI includes links and summaries to external resources. The current experience is US-focused, while imported source snapshots are retained for
            future international mode.
          </p>

          <div className="card mt-6" style={{ borderRadius: 12, padding: "1.75rem" }}>
            <div className="label">Legal Text Analytics</div>
            <div className="text-white" style={{ fontWeight: 800, fontSize: "1.05rem" }}>
              Liquid Legal Institute, “Legal Text Analytics”
            </div>
            <p className="text-muted" style={{ marginTop: 10, lineHeight: 1.55 }}>
              Resource entries under <code>content/resources/legal-text-analytics</code> are derived from the “Legal Text Analytics” resource list maintained by the
              Liquid Legal Institute.
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
          </div>

          <div className="card mt-4" style={{ borderRadius: 12, padding: "1.75rem" }}>
            <div className="label">Awesome Legal Data (US-filtered view)</div>
            <div className="text-white" style={{ fontWeight: 800, fontSize: "1.05rem" }}>
              openlegaldata, “Awesome Legal Data”
            </div>
            <p className="text-muted" style={{ marginTop: 10, lineHeight: 1.55 }}>
              Resource entries under <code>content/resources/awesome-legal-data</code> are normalized from the “Awesome Legal Data” curated list. The active UI filters
              this index to United States jurisdiction entries.
            </p>
            <div className="mt-4" style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <a className="btn btn--secondary btn--sm" href="https://github.com/openlegaldata/awesome-legal-data" target="_blank" rel="noreferrer">
                Source repository
              </a>
              <a className="btn btn--ghost btn--sm" href="https://raw.githubusercontent.com/openlegaldata/awesome-legal-data/master/README.md" target="_blank" rel="noreferrer">
                Snapshot source file
              </a>
              <Link className="btn btn--ghost btn--sm" href="/resources/open-legal-data-map">
                Open infographic
              </Link>
            </div>
            <div className="text-muted" style={{ marginTop: 12, fontSize: "0.8125rem", lineHeight: 1.45 }}>
              Repository metadata does not currently expose an explicit license field. We treat this as a discovery index and defer to each linked source’s own licensing terms.
            </div>
          </div>

          <div className="card mt-4" style={{ borderRadius: 12, padding: "1.75rem" }}>
            <div className="label">Legal Contract Q&A Bot</div>
            <div className="text-white" style={{ fontWeight: 800, fontSize: "1.05rem" }}>
              Prbn, “Legal Contract Q&A Bot”
            </div>
            <p className="text-muted" style={{ marginTop: 10, lineHeight: 1.55 }}>
              Resource entries under <code>content/resources/legal-contract-qa-bot</code> are normalized from the public Legal Contract Q&A Bot repository, including README,
              requirements, and core pipeline source files.
            </p>
            <div className="mt-4" style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <a className="btn btn--secondary btn--sm" href="https://github.com/Prbn/Legal-Contract-QA-Bot" target="_blank" rel="noreferrer">
                Source repository
              </a>
              <a className="btn btn--ghost btn--sm" href="https://opensource.org/licenses/MIT" target="_blank" rel="noreferrer">
                MIT license
              </a>
              <Link className="btn btn--ghost btn--sm" href="/resources/contract-qa-pipeline-map">
                Open infographic
              </Link>
            </div>
            <div className="text-muted" style={{ marginTop: 12, fontSize: "0.8125rem", lineHeight: 1.45 }}>
              We use this source to produce derivative architecture metadata and planning outputs. Original code and project content remain attributed to the repository author.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
