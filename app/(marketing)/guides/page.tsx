import Link from "next/link";
import { getAllGuides } from "@/lib/guides";

export const metadata = { title: "Guides" };

export default function GuidesIndexPage() {
  const guides = getAllGuides();

  return (
    <main>
      <section className="section" style={{ paddingTop: 120, paddingBottom: "4rem" }}>
        <div className="container">
          <div className="label">Guides</div>
          <h1 className="max-w-900">Answer hubs for high-intent legal AI workflows.</h1>
          <p className="max-w-800 mt-4" style={{ fontSize: "1.125rem" }}>
            TL;DRs, ranked shortlists, comparison tables, FAQs, and implementation risks. Built to be quotable and auditable.
          </p>

          <div className="grid grid--3 grid--gap-2 mt-6" style={{ gap: "1rem" }}>
            {guides.map((g) => (
              <div key={g.slug} className="card" style={{ padding: "1.5rem", borderRadius: 12 }}>
                <div className="label" style={{ marginBottom: 8 }}>
                  {g.year}
                </div>
                <Link className="text-white" style={{ fontSize: "1.05rem", fontWeight: 700 }} href={`/guides/${g.slug}`}>
                  {g.title}
                </Link>
                <div className="text-muted" style={{ fontSize: "0.875rem", marginTop: 10, lineHeight: 1.45 }}>
                  {g.description}
                </div>
                <div className="mt-4">
                  <Link className="btn btn--secondary btn--sm" href={`/guides/${g.slug}`}>
                    Open
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {guides.length === 0 && (
            <div className="card mt-6" style={{ padding: "1.25rem", borderRadius: 12 }}>
              <div className="text-white" style={{ fontWeight: 700 }}>
                No guides yet.
              </div>
              <div className="text-muted" style={{ marginTop: 8 }}>
                Add JSON files under <code>content/guides</code>.
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

