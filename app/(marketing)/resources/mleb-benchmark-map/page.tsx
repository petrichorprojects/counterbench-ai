import Link from "next/link";
import { getMlebDatasetStats, getMlebModelSummaries } from "@/lib/mleb";

function pct(part: number, total: number): string {
  if (total <= 0) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

export const metadata = {
  title: "MLEB Benchmark Map"
};

export default function MlebBenchmarkMapPage() {
  const models = getMlebModelSummaries();
  const stats = getMlebDatasetStats();

  const topQuality = [...models].sort((a, b) => b.averageScore - a.averageScore).slice(0, 8);
  const maxScore = topQuality[0]?.averageScore ?? 1;

  const openModels = models.filter((m) => m.openSource).length;
  const closedModels = models.length - openModels;

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
                "radial-gradient(1100px 320px at 8% 0%, color-mix(in srgb, #22d3ee 28%, transparent), transparent 62%), linear-gradient(145deg, #082f49 0%, #0f172a 56%, #020617 100%)"
            }}
          >
            <div className="label">Infographic</div>
            <h1 style={{ marginTop: 8, marginBottom: 8, fontSize: "clamp(2rem, 4.2vw, 3.3rem)", lineHeight: 1, letterSpacing: "-0.034em" }}>
              MLEB Benchmark Map
            </h1>
            <p className="text-muted" style={{ maxWidth: 840, fontSize: "1.03rem", lineHeight: 1.55 }}>
              A practical view of legal embedding benchmark coverage and model performance, designed to help Counterbench users pick safer defaults for retrieval.
            </p>

            <div
              style={{
                marginTop: 16,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                gap: 10
              }}
            >
              <div className="card" style={{ borderRadius: 12, padding: "0.9rem" }}>
                <div className="label" style={{ margin: 0 }}>
                  Models scored
                </div>
                <div className="text-white" style={{ fontSize: "1.6rem", fontWeight: 850 }}>
                  {stats.modelCount}
                </div>
              </div>
              <div className="card" style={{ borderRadius: 12, padding: "0.9rem" }}>
                <div className="label" style={{ margin: 0 }}>
                  Datasets
                </div>
                <div className="text-white" style={{ fontSize: "1.6rem", fontWeight: 850 }}>
                  {stats.datasetCount}
                </div>
              </div>
              <div className="card" style={{ borderRadius: 12, padding: "0.9rem" }}>
                <div className="label" style={{ margin: 0 }}>
                  Open-source models
                </div>
                <div className="text-white" style={{ fontSize: "1.6rem", fontWeight: 850 }}>
                  {openModels}
                </div>
                <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                  {pct(openModels, stats.modelCount)} of all models
                </div>
              </div>
              <div className="card" style={{ borderRadius: 12, padding: "0.9rem" }}>
                <div className="label" style={{ margin: 0 }}>
                  Closed/API models
                </div>
                <div className="text-white" style={{ fontSize: "1.6rem", fontWeight: 850 }}>
                  {closedModels}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link className="btn btn--primary btn--sm" href="/tools/mleb-shortlist">
                Open shortlist tool
              </Link>
              <Link className="btn btn--secondary btn--sm" href="/resources">
                Browse resources
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 20, paddingBottom: "4rem" }}>
        <div className="container" style={{ display: "grid", gap: 14 }}>
          <div className="grid grid--2" style={{ gap: 14 }}>
            <div className="card" style={{ borderRadius: 14 }}>
              <div className="label">Dataset mix</div>
              <h2 style={{ marginTop: 8, marginBottom: 12, fontSize: "1.35rem", letterSpacing: "-0.02em" }}>Coverage by legal task family</h2>
              <div style={{ display: "grid", gap: 10 }}>
                {[{ label: "Case law", count: stats.byCategory.caselaw }, { label: "Regulation", count: stats.byCategory.regulation }, { label: "Contracts", count: stats.byCategory.contracts }].map(
                  (row) => (
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
                            width: `${Math.max(8, Math.round((row.count / stats.datasetCount) * 100))}%`,
                            height: "100%",
                            background: "linear-gradient(90deg, #22d3ee, #0ea5e9)"
                          }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="card" style={{ borderRadius: 14 }}>
              <div className="label">Top quality band</div>
              <h2 style={{ marginTop: 8, marginBottom: 12, fontSize: "1.35rem", letterSpacing: "-0.02em" }}>Highest average scores on MLEB</h2>
              <div style={{ display: "grid", gap: 10 }}>
                {topQuality.map((m) => (
                  <div key={m.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                      <span className="text-white" style={{ fontWeight: 700 }}>
                        {m.name}
                      </span>
                      <span className="text-muted">{m.averageScore.toFixed(4)}</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 999, background: "color-mix(in srgb, var(--border) 76%, #0f172a 24%)", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${Math.max(8, Math.round((m.averageScore / maxScore) * 100))}%`,
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
            <div className="label">Why this helps Counterbench</div>
            <h2 style={{ marginTop: 8, marginBottom: 12, fontSize: "1.3rem", letterSpacing: "-0.02em" }}>Direct product value, not research theater</h2>
            <div style={{ display: "grid", gap: 8 }}>
              <p className="text-muted" style={{ margin: 0, lineHeight: 1.6 }}>
                Benchmark-backed defaults let you recommend model tiers with evidence rather than vendor claims.
              </p>
              <p className="text-muted" style={{ margin: 0, lineHeight: 1.6 }}>
                Category-level scores (case law, regulation, contracts) map cleanly to your existing playbooks and prompt packs.
              </p>
              <p className="text-muted" style={{ margin: 0, lineHeight: 1.6 }}>
                Open-source and speed dimensions support practical deployment tradeoffs for legal teams with cost and compliance constraints.
              </p>
            </div>

            <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link className="btn btn--primary btn--sm" href="/tools/mleb-shortlist">
                Build model shortlist
              </Link>
              <Link className="btn btn--ghost btn--sm" href="/resources/attribution">
                View attribution
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
