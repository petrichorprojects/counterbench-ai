import Link from "next/link";
import { getAllInsights } from "@/lib/insights";

export const metadata = {
  title: "Insights",
  description:
    "Short, actionable writeups on defensible legal AI workflows. Templates, checklists, and implementation risks for litigation teams.",
  openGraph: {
    title: "Legal AI Insights | Counterbench.AI",
    description:
      "Actionable writeups on defensible legal AI workflows with templates, checklists, and implementation risks."
  }
};

export default function InsightsPage() {
  const insights = getAllInsights();

  return (
    <main>
      <section className="section" style={{ paddingTop: 120, paddingBottom: "4rem" }}>
        <div className="container">
          <div className="label">Insights</div>
          <h1 className="max-w-900">Notes on defensible legal AI workflows.</h1>
          <p className="max-w-800 mt-4" style={{ fontSize: "1.125rem" }}>
            Short, actionable writeups with templates, checklists, and implementation risks.
          </p>

          <div className="grid grid--3 grid--gap-2 mt-6" style={{ gap: "1rem" }}>
            {insights.map((p) => (
              <div key={p.slug} className="card" style={{ padding: "1.5rem", borderRadius: 12 }}>
                <div className="label" style={{ marginBottom: 8 }}>
                  {p.frontmatter.date}
                </div>
                <Link className="text-white" style={{ fontSize: "1.05rem", fontWeight: 800 }} href={`/insights/${p.slug}`}>
                  {p.frontmatter.title}
                </Link>
                <div className="text-muted" style={{ fontSize: "0.875rem", marginTop: 10, lineHeight: 1.45 }}>
                  {p.frontmatter.description}
                </div>
                <div className="mt-4">
                  <Link className="btn btn--secondary btn--sm" href={`/insights/${p.slug}`}>
                    Open
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {insights.length === 0 && (
            <div className="card mt-6" style={{ padding: "1.25rem", borderRadius: 12 }}>
              <div className="text-white" style={{ fontWeight: 700 }}>
                No insights yet.
              </div>
              <div className="text-muted" style={{ marginTop: 8 }}>
                Add MDX files under <code>content/insights</code>.
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

