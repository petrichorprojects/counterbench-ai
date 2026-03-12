import Link from "next/link";
import { getAwesomeLegalDataResources } from "@/lib/legal-data";
import { getLegalDataStats, sourceTypeLabel } from "@/lib/legal-data-core";
import { NewsletterCapture } from "@/components/NewsletterCapture";

export const metadata = {
  title: "US Legal Data Map 2026",
  description:
    "Visual coverage map of US legal data sources for research, citations, and policy checks. Jurisdiction density, source-type breakdown, and API readiness stats.",
  openGraph: {
    title: "US Legal Data Map 2026 | Counterbench.AI",
    description:
      "Where legal AI can run on strong, inspectable US source material. Jurisdiction coverage, source-type balance, and API readiness."
  }
};

function pct(part: number, total: number): string {
  if (total <= 0) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

export default function OpenLegalDataMapPage() {
  const sources = getAwesomeLegalDataResources();
  const stats = getLegalDataStats(sources);
  const maxJurisdiction = stats.topJurisdictions[0]?.count ?? 1;
  const maxType = stats.sourceTypeBreakdown[0]?.count ?? 1;

  return (
    <main>
      <section className="section" style={{ paddingTop: 112 }}>
        <div className="container">
          <div
            className="card"
            style={{
              borderRadius: 20,
              padding: "2rem",
              background:
                "radial-gradient(1200px 340px at 12% 0%, color-mix(in srgb, #0ea5e9 26%, transparent), transparent 65%), linear-gradient(145deg, #071325 0%, #0b1022 55%, #09090b 100%)"
            }}
          >
            <div className="label">Infographic</div>
            <h1 style={{ marginTop: 8, marginBottom: 8, fontSize: "clamp(2rem, 4.2vw, 3.5rem)", lineHeight: 1, letterSpacing: "-0.035em" }}>
              US Legal Data Map 2026
            </h1>
            <p className="text-muted" style={{ maxWidth: 780, fontSize: "1.04rem", lineHeight: 1.55 }}>
              A US-focused map of where legal AI can run on strong, inspectable source material. Built from a United States subset of the Awesome Legal Data index.
            </p>

            <div
              style={{
                marginTop: 18,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                gap: 10
              }}
            >
              <div className="card" style={{ borderRadius: 12, padding: "0.9rem" }}>
                <div className="label" style={{ margin: 0 }}>
                  Total indexed
                </div>
                <div className="text-white" style={{ fontSize: "1.65rem", fontWeight: 850 }}>
                  {stats.total}
                </div>
              </div>
              <div className="card" style={{ borderRadius: 12, padding: "0.9rem" }}>
                <div className="label" style={{ margin: 0 }}>
                  API-ready
                </div>
                <div className="text-white" style={{ fontSize: "1.65rem", fontWeight: 850 }}>
                  {stats.apiReady}
                </div>
                <div className="text-muted" style={{ fontSize: "0.76rem" }}>
                  {pct(stats.apiReady, stats.total)} of total
                </div>
              </div>
              <div className="card" style={{ borderRadius: 12, padding: "0.9rem" }}>
                <div className="label" style={{ margin: 0 }}>
                  Open access
                </div>
                <div className="text-white" style={{ fontSize: "1.65rem", fontWeight: 850 }}>
                  {stats.openSources}
                </div>
                <div className="text-muted" style={{ fontSize: "0.76rem" }}>
                  {pct(stats.openSources, stats.total)} of total
                </div>
              </div>
              <div className="card" style={{ borderRadius: 12, padding: "0.9rem" }}>
                <div className="label" style={{ margin: 0 }}>
                  Top jurisdiction
                </div>
                <div className="text-white" style={{ fontSize: "1.1rem", fontWeight: 750 }}>
                  {stats.topJurisdictions[0]?.label ?? "N/A"}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 10 }}>
              <Link className="btn btn--primary btn--sm" href="/tools/source-finder">
                Open Source Finder
              </Link>
              <Link className="btn btn--secondary btn--sm" href="/resources">
                Browse all resources
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 18, paddingBottom: "4rem" }}>
        <div className="container" style={{ display: "grid", gap: 14 }}>
          <div className="grid grid--2" style={{ gap: 14 }}>
            <div className="card" style={{ borderRadius: 14 }}>
              <div className="label">Jurisdiction coverage</div>
              <h2 style={{ marginTop: 8, marginBottom: 14, fontSize: "1.4rem", letterSpacing: "-0.02em" }}>Where source density is strongest</h2>
              <div style={{ display: "grid", gap: 10 }}>
                {stats.topJurisdictions.slice(0, 10).map((row) => (
                  <div key={row.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                      <span className="text-white" style={{ fontWeight: 700 }}>
                        {row.label}
                      </span>
                      <span className="text-muted">{row.count}</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 999, background: "color-mix(in srgb, var(--border) 76%, #0f172a 24%)", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${Math.max(8, Math.round((row.count / maxJurisdiction) * 100))}%`,
                          height: "100%",
                          background: "linear-gradient(90deg, #22d3ee, #0ea5e9)"
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ borderRadius: 14 }}>
              <div className="label">Source-type balance</div>
              <h2 style={{ marginTop: 8, marginBottom: 14, fontSize: "1.4rem", letterSpacing: "-0.02em" }}>What data forms dominate</h2>
              <div style={{ display: "grid", gap: 10 }}>
                {stats.sourceTypeBreakdown.map((row) => (
                  <div key={row.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                      <span className="text-white" style={{ fontWeight: 700 }}>
                        {sourceTypeLabel(row.label)}
                      </span>
                      <span className="text-muted">{row.count}</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 999, background: "color-mix(in srgb, var(--border) 76%, #0f172a 24%)", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${Math.max(8, Math.round((row.count / maxType) * 100))}%`,
                          height: "100%",
                          background: "linear-gradient(90deg, #f59e0b, #fb7185)"
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card" style={{ borderRadius: 14 }}>
            <div className="label">Strategic read</div>
            <h2 style={{ marginTop: 8, marginBottom: 12, fontSize: "1.3rem", letterSpacing: "-0.02em" }}>What this means for Counterbench users</h2>
            <div style={{ display: "grid", gap: 8 }}>
              <p className="text-muted" style={{ margin: 0, lineHeight: 1.6 }}>
                High API availability means teams can automate source checks directly into playbooks and QA loops.
              </p>
              <p className="text-muted" style={{ margin: 0, lineHeight: 1.6 }}>
                US source coverage is uneven across source types. Teams should define explicit fallback paths for missing primary-source APIs.
              </p>
              <p className="text-muted" style={{ margin: 0, lineHeight: 1.6 }}>
                Use the Source Finder to build matter-specific source packs, then attach them to prompts and operator checklists.
              </p>
            </div>

            <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link className="btn btn--primary btn--sm" href="/tools/source-finder">
                Build a source pack
              </Link>
              <Link className="btn btn--ghost btn--sm" href="/resources/attribution">
                View attribution and licensing notes
              </Link>
            </div>
          </div>

          <div className="card" style={{ borderRadius: 14 }}>
            <div className="label">Stay current</div>
            <h2 style={{ marginTop: 8, marginBottom: 8, fontSize: "1.3rem", letterSpacing: "-0.02em" }}>This map updates weekly</h2>
            <p className="text-muted" style={{ margin: 0, maxWidth: 560, lineHeight: 1.6 }}>
              New US legal data sources, API changes, and coverage shifts — delivered to your inbox so your source stacks stay current.
            </p>
            <div style={{ marginTop: 14, maxWidth: 480 }}>
              <NewsletterCapture source="legal-data-map" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
