import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/design-system/Badge";
import { StickyCta } from "@/components/StickyCta";
import { MDX } from "@/components/mdx/MDX";
import { absoluteUrl } from "@/lib/seo";
import { extractToc, getAllInsights, getInsightBySlug } from "@/lib/insights";

export function generateStaticParams() {
  return getAllInsights().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getInsightBySlug(slug);
  if (!post) return {};
  const url = absoluteUrl(`/insights/${post.slug}`);
  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      url,
      type: "article"
    },
    twitter: {
      card: "summary_large_image",
      title: post.frontmatter.title,
      description: post.frontmatter.description
    }
  };
}

function articleJsonLd(args: { title: string; description: string; url: string; datePublished: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: args.title,
    description: args.description,
    mainEntityOfPage: args.url,
    datePublished: args.datePublished,
    author: {
      "@type": "Organization",
      name: "Counterbench.AI",
      url: "https://counterbench.ai"
    },
    publisher: {
      "@type": "Organization",
      name: "Counterbench.AI",
      url: "https://counterbench.ai"
    }
  };
}

export default async function InsightDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getInsightBySlug(slug);
  if (!post) notFound();

  const toc = extractToc(post.content);
  const nowUrl = absoluteUrl(`/insights/${post.slug}`);
  const jsonLd = articleJsonLd({
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    url: nowUrl,
    datePublished: post.frontmatter.date
  });

  return (
    <main>
      <section className="section" style={{ paddingTop: 120, paddingBottom: "4rem" }}>
        <div className="container">
          <div className="label">Insight</div>
          <h1 className="max-w-900">{post.frontmatter.title}</h1>
          <p className="max-w-800 mt-4" style={{ fontSize: "1.125rem" }}>
            {post.frontmatter.description}
          </p>

          <div className="flex flex--gap-1 mt-4" style={{ flexWrap: "wrap" }}>
            <Badge tone="neutral">Published: {post.frontmatter.date}</Badge>
            <Link className="btn btn--ghost btn--sm" href="/insights">
              All insights
            </Link>
            {post.frontmatter.guideUrl ? (
              <a className="btn btn--secondary btn--sm" href={post.frontmatter.guideUrl}>
                {post.frontmatter.kitLabel ?? "Download kit"}
              </a>
            ) : null}
          </div>

          {toc.length > 0 && (
            <details className="card mt-4" style={{ borderRadius: 12, padding: "1rem", maxWidth: 860 }}>
              <summary className="text-white" style={{ fontWeight: 800, cursor: "pointer" }}>
                On this page <span className="text-muted" style={{ fontWeight: 600 }}>(jump)</span>
              </summary>
              <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                {toc.map((t) => (
                  <a key={t.id} href={`#${t.id}`} className="text-white" style={{ fontWeight: 700, textDecoration: "none" }}>
                    {t.label}
                  </a>
                ))}
              </div>
            </details>
          )}

          <div className="mt-6 grid grid--2 grid--gap-2" style={{ gap: "1.25rem", alignItems: "start" }}>
            <div>
              <div className="card" style={{ borderRadius: 12, padding: "1.75rem" }}>
                <MDX source={post.content} />
              </div>

              <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            </div>

            <aside className="guide-sidebar" style={{ position: "sticky", top: 110, alignSelf: "start" }}>
              {post.frontmatter.guideUrl && (
                <div className="card" style={{ borderRadius: 12, padding: "1.25rem" }}>
                  <div className="label">Download kit</div>
                  <div className="text-muted" style={{ marginTop: 6, fontSize: "0.875rem", lineHeight: 1.45 }}>
                    Templates + checklists for this workflow.
                  </div>
                  <div className="mt-4">
                    <a className="btn btn--secondary btn--sm" href={post.frontmatter.guideUrl}>
                      {post.frontmatter.kitLabel ?? "Download kit"}
                    </a>
                  </div>
                </div>
              )}

              {toc.length > 0 && (
                <div className={`${post.frontmatter.guideUrl ? "mt-6 " : ""}card`} style={{ borderRadius: 12, padding: "1.25rem" }}>
                  <div className="label">On this page</div>
                  <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                    {toc.map((t) => (
                      <a key={t.id} href={`#${t.id}`} className="text-white" style={{ fontWeight: 700, textDecoration: "none" }}>
                        {t.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      {post.frontmatter.guideUrl && (
        <StickyCta
          text={
            <>
              <strong>Templates included.</strong> Download the kit for this workflow.
            </>
          }
          ctaLabel={post.frontmatter.kitLabel ?? "Download kit"}
          ctaHref={post.frontmatter.guideUrl}
        />
      )}
    </main>
  );
}

