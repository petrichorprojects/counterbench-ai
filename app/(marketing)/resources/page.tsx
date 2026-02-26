import { getAllResources } from "@/lib/resources";

export const metadata = { title: "Resources" };

export default function ResourcesPage() {
  const resources = getAllResources();
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
          <h1 className="max-w-900">Research, programs, and reference hubs.</h1>
          <p className="max-w-700 mt-4" style={{ fontSize: "1.125rem" }}>
            Curated external resources that help legal teams understand AI policy, workflows, and implementation risks.
          </p>
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
                No resources yet.
              </div>
              <div className="text-muted" style={{ marginTop: 8 }}>
                Add JSON files under <code>content/resources</code>.
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
