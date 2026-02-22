import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPacks, getPackBySlug, getPromptBySlug } from "@/lib/content";

export function generateStaticParams() {
  return getAllPacks().map((p) => ({ slug: p.slug }));
}

export default async function PromptPackPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pack = getPackBySlug(slug);
  if (!pack) notFound();

  const prompts = pack.prompt_slugs
    .map((s) => getPromptBySlug(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <main>
      <section className="section" style={{ paddingTop: 120, paddingBottom: "4rem" }}>
        <div className="container">
          <div className="label">Prompt pack</div>
          <h1 className="max-w-900">{pack.title}</h1>
          <p className="max-w-800 mt-4" style={{ fontSize: "1.125rem" }}>
            {pack.description}
          </p>

          <div className="grid grid--3 grid--gap-2 mt-6" style={{ gap: "1rem" }}>
            {prompts.map((p) => (
              <div key={p.slug} className="card" style={{ padding: "1.5rem", borderRadius: 12 }}>
                <Link className="text-white" style={{ fontSize: "1.05rem", fontWeight: 700 }} href={`/prompts/${p.slug}`}>
                  {p.frontmatter.title}
                </Link>
                <div className="text-muted" style={{ fontSize: "0.875rem", marginTop: 10 }}>
                  {p.frontmatter.description}
                </div>
                <div className="mt-4">
                  <Link className="btn btn--secondary btn--sm" href={`/prompts/${p.slug}`}>
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
