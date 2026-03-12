import Link from "next/link";
import { getLegalStoriesStats, getLegalStoriesTopDoctrines, type LegalStoriesTier } from "@/lib/legalstories";

function pct(part: number, total: number): string {
  if (total <= 0) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

function tierLabel(tier: LegalStoriesTier): string {
  if (tier === "foundational") return "Foundational";
  if (tier === "intermediate") return "Intermediate";
  return "Advanced";
}

export const metadata = {
  title: "LegalStories Learning Map"
};

export default function LegalStoriesLearningMapPage() {
  const stats = getLegalStoriesStats();
  const topComplex = getLegalStoriesTopDoctrines(8);

  const tierRows: Array<{ key: LegalStoriesTier; count: number }> = [
    { key: "foundational", count: stats.tierCounts.foundational },
    { key: "intermediate", count: stats.tierCounts.intermediate },
    { key: "advanced", count: stats.tierCounts.advanced }
  ];

  const maxTier = Math.max(...tierRows.map((r) => r.count), 1);
  const maxQuestionTotal = Math.max(stats.questionTotals.concept, stats.questionTotals.ending, stats.questionTotals.limitation, 1);

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
                "radial-gradient(1100px 340px at 12% 0%, color-mix(in srgb, #f59e0b 30%, transparent), transparent 63%), linear-gradient(145deg, #1f2937 0%, #111827 52%, #020617 100%)"
            }}
          >
            <div className="label">Infographic</div>
            <h1 style={{ marginTop: 8, marginBottom: 8, fontSize: "clamp(2rem, 4.2vw, 3.3rem)", lineHeight: 1, letterSpacing: "-0.034em" }}>
              LegalStories Learning Map
            </h1>
            <p className="text-muted" style={{ maxWidth: 840, fontSize: "1.03rem", lineHeight: 1.55 }}>
              A practical breakdown of doctrine complexity, model-question coverage, and expert-evaluated difficulty in the LegalStories dataset.
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
                  Doctrines
                </div>
                <div className="text-white" style={{ fontSize: "1.6rem", fontWeight: 850 }}>
                  {stats.doctrineCount}
                </div>
              </div>
              <div className="card" style={{ borderRadius: 12, padding: "0.9rem" }}>
                <div className="label" style={{ margin: 0 }}>
                  Avg definition length
                </div>
                <div className="text-white" style={{ fontSize: "1.6rem", fontWeight: 850 }}>
                  {stats.averageWordCount.toFixed(1)} words
                </div>
              </div>
              <div className="card" style={{ borderRadius: 12, padding: "0.9rem" }}>
                <div className="label" style={{ margin: 0 }}>
                  Sampled subset
                </div>
                <div className="text-white" style={{ fontSize: "1.6rem", fontWeight: 850 }}>
                  {stats.sampledCount101}
                </div>
              </div>
              <div className="card" style={{ borderRadius: 12, padding: "0.9rem" }}>
                <div className="label" style={{ margin: 0 }}>
                  Expert subset
                </div>
                <div className="text-white" style={{ fontSize: "1.6rem", fontWeight: 850 }}>
                  {stats.expertCount20}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link className="btn btn--primary btn--sm" href="/tools/legalstories-lesson-builder">
                Open lesson builder
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
              <div className="label">Complexity balance</div>
              <h2 style={{ marginTop: 8, marginBottom: 12, fontSize: "1.35rem", letterSpacing: "-0.02em" }}>Doctrine tiers by definition length</h2>
              <div style={{ display: "grid", gap: 10 }}>
                {tierRows.map((row) => (
                  <div key={row.key}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                      <span className="text-white" style={{ fontWeight: 700 }}>
                        {tierLabel(row.key)}
                      </span>
                      <span className="text-muted">
                        {row.count} ({pct(row.count, stats.doctrineCount)})
                      </span>
                    </div>
                    <div style={{ height: 8, borderRadius: 999, background: "color-mix(in srgb, var(--border) 76%, #0f172a 24%)", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${Math.max(8, Math.round((row.count / maxTier) * 100))}%`,
                          height: "100%",
                          background: "linear-gradient(90deg, #f59e0b, #fb7185)"
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ borderRadius: 14 }}>
              <div className="label">Question design</div>
              <h2 style={{ marginTop: 8, marginBottom: 12, fontSize: "1.35rem", letterSpacing: "-0.02em" }}>Coverage across question types</h2>
              <div style={{ display: "grid", gap: 10 }}>
                {[
                  { label: "Concept comprehension", count: stats.questionTotals.concept },
                  { label: "Scenario prediction", count: stats.questionTotals.ending },
                  { label: "Limitation / exception", count: stats.questionTotals.limitation }
                ].map((row) => (
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
                          width: `${Math.max(8, Math.round((row.count / maxQuestionTotal) * 100))}%`,
                          height: "100%",
                          background: "linear-gradient(90deg, #22d3ee, #0ea5e9)"
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid--2" style={{ gap: 14 }}>
            <div className="card" style={{ borderRadius: 14 }}>
              <div className="label">Model output profile</div>
              <h2 style={{ marginTop: 8, marginBottom: 12, fontSize: "1.3rem", letterSpacing: "-0.02em" }}>Story length and doctrine coverage by model</h2>
              <div style={{ display: "grid", gap: 10 }}>
                {stats.modelStats.map((model) => (
                  <div key={model.key} className="card" style={{ borderRadius: 10, padding: "0.85rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <div className="text-white" style={{ fontWeight: 700 }}>
                        {model.label}
                      </div>
                      <div className="text-muted" style={{ fontSize: "0.82rem" }}>
                        {model.doctrineCount} doctrines
                      </div>
                    </div>
                    <div className="text-muted" style={{ marginTop: 6, fontSize: "0.86rem", lineHeight: 1.45 }}>
                      Avg story length: {model.storyAverageWords.toFixed(1)} words. Question coverage: {model.questionCoverage.concept}/{model.questionCoverage.ending}/{model.questionCoverage.limitation}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ borderRadius: 14 }}>
              <div className="label">Challenging concepts</div>
              <h2 style={{ marginTop: 8, marginBottom: 12, fontSize: "1.3rem", letterSpacing: "-0.02em" }}>Longest doctrine definitions in corpus</h2>
              <div style={{ display: "grid", gap: 8 }}>
                {topComplex.map((d) => (
                  <div key={d.conceptId} style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
                    <span className="text-white" style={{ fontWeight: 700 }}>
                      {d.label}
                    </span>
                    <span className="text-muted" style={{ fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                      {d.wordCount} words
                    </span>
                  </div>
                ))}
              </div>

              <div className="text-muted" style={{ marginTop: 12, fontSize: "0.84rem" }}>
                Expert 20-doctrine subset difficulty: easy {stats.difficultyCounts.easy}, medium {stats.difficultyCounts.medium}, hard {stats.difficultyCounts.hard}.
              </div>
            </div>
          </div>

          <div className="card" style={{ borderRadius: 14 }}>
            <div className="label">Counterbench angle</div>
            <h2 style={{ marginTop: 8, marginBottom: 12, fontSize: "1.3rem", letterSpacing: "-0.02em" }}>How this becomes product + content</h2>
            <div style={{ display: "grid", gap: 8 }}>
              <p className="text-muted" style={{ margin: 0, lineHeight: 1.6 }}>
                Use doctrine tiers to scaffold legal-literacy onboarding tracks for new users and law-adjacent teams.
              </p>
              <p className="text-muted" style={{ margin: 0, lineHeight: 1.6 }}>
                Keep question-type mixes explicit so teams can balance comprehension, transfer, and edge-case reasoning.
              </p>
              <p className="text-muted" style={{ margin: 0, lineHeight: 1.6 }}>
                Tie model choice to curriculum expectations rather than abstract model benchmarks.
              </p>
            </div>

            <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link className="btn btn--primary btn--sm" href="/tools/legalstories-lesson-builder">
                Build lesson pack
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
