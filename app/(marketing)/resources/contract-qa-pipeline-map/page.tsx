import Link from "next/link";
import { getContractQaBySection, getContractQaDefaults, getContractQaResources, getContractQaStats } from "@/lib/contract-qa-bot";

function pct(part: number, total: number): string {
  if (total <= 0) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

export const metadata = {
  title: "Contract QA Pipeline Map"
};

export default function ContractQaPipelineMapPage() {
  const resources = getContractQaResources();
  const sections = getContractQaBySection(resources);
  const stats = getContractQaStats(resources);
  const defaults = getContractQaDefaults();

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
                "radial-gradient(1100px 320px at 12% 0%, color-mix(in srgb, #f59e0b 30%, transparent), transparent 62%), linear-gradient(145deg, #1f2937 0%, #111827 56%, #020617 100%)"
            }}
          >
            <div className="label">Infographic</div>
            <h1 style={{ marginTop: 8, marginBottom: 8, fontSize: "clamp(2rem, 4.2vw, 3.3rem)", lineHeight: 1, letterSpacing: "-0.034em" }}>
              Contract QA Pipeline Map
            </h1>
            <p className="text-muted" style={{ maxWidth: 840, fontSize: "1.03rem", lineHeight: 1.55 }}>
              Visual map of the Legal Contract Q&A Bot architecture, configuration defaults, and implementation tasks for production-ready legal RAG systems.
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
                  Indexed resources
                </div>
                <div className="text-white" style={{ fontSize: "1.6rem", fontWeight: 850 }}>
                  {stats.total}
                </div>
              </div>
              <div className="card" style={{ borderRadius: 12, padding: "0.9rem" }}>
                <div className="label" style={{ margin: 0 }}>
                  Pipeline components
                </div>
                <div className="text-white" style={{ fontSize: "1.6rem", fontWeight: 850 }}>
                  {stats.componentCount}
                </div>
              </div>
              <div className="card" style={{ borderRadius: 12, padding: "0.9rem" }}>
                <div className="label" style={{ margin: 0 }}>
                  Roadmap tasks
                </div>
                <div className="text-white" style={{ fontSize: "1.6rem", fontWeight: 850 }}>
                  {stats.taskCount}
                </div>
              </div>
              <div className="card" style={{ borderRadius: 12, padding: "0.9rem" }}>
                <div className="label" style={{ margin: 0 }}>
                  API-linked entries
                </div>
                <div className="text-white" style={{ fontSize: "1.6rem", fontWeight: 850 }}>
                  {stats.apiReady}
                </div>
                <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                  {pct(stats.apiReady, stats.total)} of indexed items
                </div>
              </div>
            </div>

            <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link className="btn btn--primary btn--sm" href="/tools/contract-qa-planner">
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
              <div className="label">Core defaults</div>
              <h2 style={{ marginTop: 8, marginBottom: 12, fontSize: "1.35rem", letterSpacing: "-0.02em" }}>Extracted from source code</h2>
              <div style={{ display: "grid", gap: 8 }}>
                <div className="text-muted">Chunk size: {defaults.chunkSize ?? "N/A"}</div>
                <div className="text-muted">Chunk overlap: {defaults.chunkOverlap ?? "N/A"}</div>
                <div className="text-muted">Retriever k: {defaults.retrieverK ?? "N/A"}</div>
                <div className="text-muted">Persist directory: {defaults.persistDirectory ?? "N/A"}</div>
                <div className="text-muted">Answer model: {defaults.modelName ?? "N/A"}</div>
                <div className="text-muted">Temperature: {defaults.temperature ?? "N/A"}</div>
              </div>
            </div>

            <div className="card" style={{ borderRadius: 14 }}>
              <div className="label">Pipeline architecture</div>
              <h2 style={{ marginTop: 8, marginBottom: 12, fontSize: "1.35rem", letterSpacing: "-0.02em" }}>Implementation components</h2>
              <div style={{ display: "grid", gap: 8 }}>
                {sections.components.map((item) => (
                  <a key={item.slug} href={item.url} target="_blank" rel="noreferrer" className="text-white" style={{ textDecoration: "none", fontWeight: 700 }}>
                    {item.title}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid--2" style={{ gap: 14 }}>
            <div className="card" style={{ borderRadius: 14 }}>
              <div className="label">Dependency backbone</div>
              <h2 style={{ marginTop: 8, marginBottom: 12, fontSize: "1.3rem", letterSpacing: "-0.02em" }}>Libraries and providers</h2>
              <div style={{ display: "grid", gap: 8 }}>
                {sections.dependencies.map((item) => (
                  <a key={item.slug} href={item.url} target="_blank" rel="noreferrer" className="text-white" style={{ textDecoration: "none", fontWeight: 700 }}>
                    {item.title}
                  </a>
                ))}
              </div>
            </div>

            <div className="card" style={{ borderRadius: 14 }}>
              <div className="label">Project roadmap</div>
              <h2 style={{ marginTop: 8, marginBottom: 12, fontSize: "1.3rem", letterSpacing: "-0.02em" }}>Task sequence from README</h2>
              <div style={{ display: "grid", gap: 8 }}>
                {sections.tasks.map((item) => (
                  <div key={item.slug} className="card" style={{ borderRadius: 10, padding: "0.75rem" }}>
                    <div className="text-white" style={{ fontWeight: 700 }}>
                      {item.title}
                    </div>
                    <div className="text-muted" style={{ marginTop: 6, lineHeight: 1.45 }}>
                      {item.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card" style={{ borderRadius: 14 }}>
            <div className="label">Counterbench angle</div>
            <h2 style={{ marginTop: 8, marginBottom: 12, fontSize: "1.3rem", letterSpacing: "-0.02em" }}>Product and content leverage</h2>
            <div style={{ display: "grid", gap: 8 }}>
              <p className="text-muted" style={{ margin: 0, lineHeight: 1.6 }}>
                Reuse the extracted defaults as transparent baselines for your legal-RAG deployment planning content.
              </p>
              <p className="text-muted" style={{ margin: 0, lineHeight: 1.6 }}>
                Tie roadmap tasks to implementation checklists so teams move from prototype to production with explicit quality gates.
              </p>
              <p className="text-muted" style={{ margin: 0, lineHeight: 1.6 }}>
                Pair architecture map + planner export to generate qualified leads from legal ops and in-house innovation teams.
              </p>
            </div>

            <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link className="btn btn--primary btn--sm" href="/tools/contract-qa-planner">
                Build stack plan
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
