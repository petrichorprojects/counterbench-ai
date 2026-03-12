import Link from "next/link";
import { getLawglanceBySection, getLawglanceResources, getLawglanceStats } from "@/lib/lawglance";

function pct(part: number, total: number): string {
  if (total <= 0) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

export const metadata = {
  title: "LawGlance Blueprint Map"
};

export default function LawglanceBlueprintMapPage() {
  const resources = getLawglanceResources();
  const sections = getLawglanceBySection(resources);
  const stats = getLawglanceStats(resources);

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
                "radial-gradient(1100px 320px at 10% 0%, color-mix(in srgb, #22d3ee 28%, transparent), transparent 62%), linear-gradient(145deg, #082f49 0%, #0f172a 56%, #020617 100%)"
            }}
          >
            <div className="label">Infographic</div>
            <h1 style={{ marginTop: 8, marginBottom: 8, fontSize: "clamp(2rem, 4.2vw, 3.3rem)", lineHeight: 1, letterSpacing: "-0.034em" }}>
              LawGlance Blueprint Map
            </h1>
            <p className="text-muted" style={{ maxWidth: 820, fontSize: "1.03rem", lineHeight: 1.55 }}>
              A visual breakdown of LawGlance’s current legal coverage, technical stack, and roadmap tracks so teams can scope implementation faster.
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
                  Total entries
                </div>
                <div className="text-white" style={{ fontSize: "1.6rem", fontWeight: 850 }}>
                  {stats.total}
                </div>
              </div>
              <div className="card" style={{ borderRadius: 12, padding: "0.9rem" }}>
                <div className="label" style={{ margin: 0 }}>
                  Legal coverage
                </div>
                <div className="text-white" style={{ fontSize: "1.6rem", fontWeight: 850 }}>
                  {stats.coverageCount}
                </div>
              </div>
              <div className="card" style={{ borderRadius: 12, padding: "0.9rem" }}>
                <div className="label" style={{ margin: 0 }}>
                  Stack components
                </div>
                <div className="text-white" style={{ fontSize: "1.6rem", fontWeight: 850 }}>
                  {stats.stackCount}
                </div>
              </div>
              <div className="card" style={{ borderRadius: 12, padding: "0.9rem" }}>
                <div className="label" style={{ margin: 0 }}>
                  Roadmap tracks
                </div>
                <div className="text-white" style={{ fontSize: "1.6rem", fontWeight: 850 }}>
                  {stats.roadmapCount}
                </div>
              </div>
              <div className="card" style={{ borderRadius: 12, padding: "0.9rem" }}>
                <div className="label" style={{ margin: 0 }}>
                  Open access
                </div>
                <div className="text-white" style={{ fontSize: "1.6rem", fontWeight: 850 }}>
                  {stats.openAccess}
                </div>
                <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                  {pct(stats.openAccess, stats.total)} of indexed entries
                </div>
              </div>
            </div>

            <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link className="btn btn--primary btn--sm" href="/tools/lawglance-planner">
                Open planner
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
              <div className="label">Current legal coverage</div>
              <h2 style={{ marginTop: 8, marginBottom: 12, fontSize: "1.35rem", letterSpacing: "-0.02em" }}>India-focused corpus in current version</h2>
              <div style={{ display: "grid", gap: 8 }}>
                {sections.coverage.map((item) => (
                  <a key={item.slug} href={item.url} target="_blank" rel="noreferrer" className="text-white" style={{ textDecoration: "none", fontWeight: 700 }}>
                    {item.title}
                  </a>
                ))}
              </div>
            </div>

            <div className="card" style={{ borderRadius: 14 }}>
              <div className="label">Implementation stack</div>
              <h2 style={{ marginTop: 8, marginBottom: 12, fontSize: "1.35rem", letterSpacing: "-0.02em" }}>Core technology foundation</h2>
              <div style={{ display: "grid", gap: 8 }}>
                {sections.stack.map((item) => (
                  <a key={item.slug} href={item.url} target="_blank" rel="noreferrer" className="text-white" style={{ textDecoration: "none", fontWeight: 700 }}>
                    {item.title}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="card" style={{ borderRadius: 14 }}>
            <div className="label">Roadmap direction</div>
            <h2 style={{ marginTop: 8, marginBottom: 12, fontSize: "1.3rem", letterSpacing: "-0.02em" }}>Priority expansion tracks</h2>
            <div style={{ display: "grid", gap: 8 }}>
              {sections.roadmap.map((item) => (
                <div key={item.slug} className="card" style={{ borderRadius: 10, padding: "0.85rem" }}>
                  <a href={item.url} target="_blank" rel="noreferrer" className="text-white" style={{ textDecoration: "none", fontWeight: 700 }}>
                    {item.title}
                  </a>
                  <div className="text-muted" style={{ marginTop: 6, lineHeight: 1.45 }}>
                    {item.description}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link className="btn btn--primary btn--sm" href="/tools/lawglance-planner">
                Build rollout plan
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
