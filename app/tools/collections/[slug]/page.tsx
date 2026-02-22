import { notFound } from "next/navigation";
import { ToolCard } from "@/components/ToolCard";
import { getAllCollections, getCollectionBySlug, getToolBySlug } from "@/lib/content";

export function generateStaticParams() {
  return getAllCollections().map((c) => ({ slug: c.slug }));
}

export default async function ToolsCollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  if (!collection) notFound();

  const tools = collection.tool_slugs
    .map((s) => getToolBySlug(s))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <main>
      <section className="section" style={{ paddingTop: 120, paddingBottom: "4rem" }}>
        <div className="container">
          <div className="label">Collection</div>
          <h1 className="max-w-900">{collection.title}</h1>
          <p className="max-w-800 mt-4" style={{ fontSize: "1.125rem" }}>
            {collection.description}
          </p>

          <div className="grid grid--3 grid--gap-2 mt-6" style={{ gap: "1rem" }}>
            {tools.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
