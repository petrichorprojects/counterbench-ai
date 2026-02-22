import Link from "next/link";
import { getAllCollections } from "@/lib/content";

export const metadata = { title: "Collections" };

export default function CollectionsIndexPage() {
  const collections = getAllCollections().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <main>
      <section className="section" style={{ paddingTop: 120, paddingBottom: "4rem" }}>
        <div className="container">
          <div className="label">Collections</div>
          <h1 className="max-w-900">Curated tool collections</h1>
          <p className="max-w-700 mt-4" style={{ fontSize: "1.125rem" }}>
            Workflow-focused shortlists with SEO landing pages.
          </p>

          <div className="grid grid--3 grid--gap-2 mt-6" style={{ gap: "1rem" }}>
            {collections.map((c) => (
              <div key={c.slug} className="card" style={{ padding: "1.5rem", borderRadius: 12 }}>
                <Link className="text-white" style={{ fontSize: "1.05rem", fontWeight: 700 }} href={`/tools/collections/${c.slug}`}>
                  {c.title}
                </Link>
                <div className="text-muted" style={{ fontSize: "0.875rem", marginTop: 10 }}>
                  {c.description}
                </div>
                <div className="mt-4">
                  <Link className="btn btn--secondary btn--sm" href={`/tools/collections/${c.slug}`}>
                    Open
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

