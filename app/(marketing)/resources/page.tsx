import { getAllResources } from "@/lib/resources";
import { isUsFocusedResource } from "@/lib/us-legal";
import Link from "next/link";

export const metadata = {
  title: "Resources",
  description:
    "US legal research resources, data source indexes, and implementation references for legal AI workflows. Filtered to United States jurisdiction.",
  openGraph: {
    title: "Legal AI Resources | Counterbench.AI",
    description:
      "US-focused legal data sources, research indexes, and implementation references for legal AI teams."
  }
};

export default function ResourcesPage() {
  const resources = getAllResources().filter(isUsFocusedResource);
  const tagStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid var(--border)",
    background: "var(--input-bg)",
    color: "var(--muted)",
    fontSize: "0.75rem",
    lineHeight: 1
  };

  return (
    <main>
      <section className="section" style={{ paddingTop: 120 }}>
        <div className="container">
          <div className="label">Resources</div>
          <h1 className="max-w-900">US legal research, workflows, and implementation references.</h1>
          <p className="max-w-700 mt-4" style={{ fontSize: "1.125rem" }}>
            This view is intentionally filtered to US-focused legal resources and US-ready implementation patterns.
          </p>

          <div className="grid grid--2 mt-5" style={{ gap: "1rem" }}>
            <Link
              href="/tools/source-finder"
              className="card"
              style={{
                textDecoration: "none",
                borderRadius: 16,
                background:
                  "linear-gradient(145deg, color-mix(in srgb, #0ea5e9 24%, #020617 76%) 0%, color-mix(in srgb, #020617 86%, #0f172a 14%) 100%)"
              }}
            >
              <div className="label">Free tool</div>
              <div className="text-white" style={{ fontSize: "1.2rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
                US Legal Data Source Finder
              </div>
              <div className="text-muted" style={{ marginTop: 8 }}>
                Build a defensible US source pack by task, source type, and API readiness.
              </div>
            </Link>

            <Link
              href="/resources/open-legal-data-map"
              className="card"
              style={{
                textDecoration: "none",
                borderRadius: 16,
                background:
                  "linear-gradient(145deg, color-mix(in srgb, #f59e0b 22%, #020617 78%) 0%, color-mix(in srgb, #020617 86%, #0f172a 14%) 100%)"
              }}
            >
              <div className="label">Infographic</div>
              <div className="text-white" style={{ fontSize: "1.2rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
                US Legal Data Map 2026
              </div>
              <div className="text-muted" style={{ marginTop: 8 }}>
                Coverage map of US legal data sources for research, citations, and policy checks.
              </div>
            </Link>
          </div>

          <div className="grid grid--2 mt-4" style={{ gap: "1rem" }}>
            <Link
              href="/tools/contract-qa-planner"
              className="card"
              style={{
                textDecoration: "none",
                borderRadius: 16,
                background:
                  "linear-gradient(145deg, color-mix(in srgb, #f97316 26%, #020617 74%) 0%, color-mix(in srgb, #020617 88%, #0f172a 12%) 100%)"
              }}
            >
              <div className="label">Free tool</div>
              <div className="text-white" style={{ fontSize: "1.2rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
                Contract QA Stack Planner
              </div>
              <div className="text-muted" style={{ marginTop: 8 }}>
                Generate a US-legal-ready implementation roadmap with tuned chunking and retrieval defaults.
              </div>
            </Link>

            <Link
              href="/resources/contract-qa-pipeline-map"
              className="card"
              style={{
                textDecoration: "none",
                borderRadius: 16,
                background:
                  "linear-gradient(145deg, color-mix(in srgb, #fb923c 24%, #020617 76%) 0%, color-mix(in srgb, #020617 88%, #0f172a 12%) 100%)"
              }}
            >
              <div className="label">Infographic</div>
              <div className="text-white" style={{ fontSize: "1.2rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
                Contract QA Pipeline Map
              </div>
              <div className="text-muted" style={{ marginTop: 8 }}>
                Visual breakdown of architecture components, dependency stack, and roadmap tasks.
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 24 }}>
        <div className="container">
          <div className="grid grid--3" style={{ gap: "1rem" }}>
            {resources.map((r) => (
              <a
                key={r.slug}
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="card"
                style={{ display: "block", textDecoration: "none" }}
              >
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                  <div className="text-white" style={{ fontSize: "1rem", fontWeight: 700 }}>
                    {r.title}
                  </div>
                  <div className="label label--pill" style={{ margin: 0, padding: "6px 12px" }}>
                    {r.type}
                  </div>
                </div>

                <div className="text-muted" style={{ marginTop: 10, lineHeight: 1.45 }}>
                  {r.description}
                </div>

                <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {(r.tags ?? []).slice(0, 6).map((t) => (
                    <span key={t} style={tagStyle}>
                      {t}
                    </span>
                  ))}
                </div>

                {r.last_checked && (
                  <div className="text-muted" style={{ marginTop: 12, fontSize: "0.75rem" }}>
                    Last checked: {r.last_checked}
                  </div>
                )}
              </a>
            ))}
          </div>

          {resources.length === 0 && (
            <div className="card" style={{ marginTop: 16 }}>
              <div className="text-white" style={{ fontWeight: 700 }}>
                No US resources yet.
              </div>
              <div className="text-muted" style={{ marginTop: 8 }}>
                Add JSON files under <code>content/resources</code> with United States jurisdiction tags.
              </div>
            </div>
          )}

          <div className="text-muted" style={{ marginTop: 18, fontSize: "0.8125rem" }}>
            All imported source snapshots are retained for future international mode. Some entries are imported from third-party curated lists and include required
            attribution. <Link href="/resources/attribution" className="text-white" style={{ textDecoration: "underline" }}>View attribution</Link>.
          </div>
        </div>
      </section>
    </main>
  );
}
