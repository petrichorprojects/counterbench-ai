import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/design-system/Badge";
import { NewsletterCapture } from "@/components/NewsletterCapture";
import { getPackBySlug, getToolBySlug } from "@/lib/content";
import { getAllGuides, getGuideBySlug } from "@/lib/guides";
import { absoluteUrl } from "@/lib/seo";

export function generateStaticParams() {
  return getAllGuides().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return {};
  const url = absoluteUrl(`/guides/${guide.slug}`);
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: url },
    openGraph: { title: guide.title, description: guide.description, url, type: "article" }
  };
}

function formatIso(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().slice(0, 10);
}

function guideJsonLd(params: {
  title: string;
  description: string;
  url: string;
  year: number;
  ranked: Array<{ position: number; name: string; url: string }>;
  faq: Array<{ q: string; a: string }>;
}) {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: params.title,
    description: params.description,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    itemListElement: params.ranked.map((r) => ({
      "@type": "ListItem",
      position: r.position,
      name: r.name,
      url: r.url
    }))
  };

  const faqPage =
    params.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: params.faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a }
          }))
        }
      : null;

  return faqPage ? [itemList, faqPage] : [itemList];
}

export default async function GuideDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const rankedTools = guide.ranked_tools
    .map((rt, idx) => {
      const tool = getToolBySlug(rt.tool_slug);
      if (!tool) return null;
      return { position: idx + 1, tool, why: rt.why };
    })
    .filter(Boolean) as Array<{ position: number; tool: Exclude<ReturnType<typeof getToolBySlug>, null>; why: string }>;

  const recommendedPacks = guide.recommended_pack_slugs
    .map((ps) => getPackBySlug(ps))
    .filter(Boolean)
    .map((p) => p!);

  const nowUrl = absoluteUrl(`/guides/${guide.slug}`);
  const jsonLd = guideJsonLd({
    title: guide.title,
    description: guide.description,
    url: nowUrl,
    year: guide.year,
    ranked: rankedTools.map((x) => ({ position: x.position, name: x.tool.name, url: absoluteUrl(`/tools/${x.tool.slug}`) })),
    faq: guide.faq
  });

  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.9rem"
  };
  const thStyle: React.CSSProperties = {
    textAlign: "left",
    padding: "10px 12px",
    borderBottom: "1px solid var(--border)",
    color: "var(--muted)",
    fontWeight: 600,
    whiteSpace: "nowrap"
  };
  const tdStyle: React.CSSProperties = {
    padding: "12px",
    borderBottom: "1px solid var(--border)",
    verticalAlign: "top"
  };

  return (
    <main>
      <section className="section" style={{ paddingTop: 120, paddingBottom: "4rem" }}>
        <div className="container">
          <div className="label">Guide</div>
          <h1 className="max-w-900">{guide.title}</h1>
          <p className="max-w-800 mt-4" style={{ fontSize: "1.125rem" }}>
            {guide.description}
          </p>

          <div className="flex flex--gap-1 mt-4" style={{ flexWrap: "wrap" }}>
            <Badge tone="neutral">Year: {guide.year}</Badge>
            <Badge tone="neutral">Updated: {guide.last_updated}</Badge>
            <Link className="btn btn--ghost btn--sm" href="/guides">
              All guides
            </Link>
          </div>

          <div className="mt-6 card" style={{ borderRadius: 12, padding: "1.75rem" }}>
            <div className="label">TL;DR</div>
            <div className="text-white" style={{ fontSize: "1.05rem", lineHeight: 1.6 }}>
              {guide.tldr}
            </div>
          </div>

          {guide.answer_intents.length > 0 && (
            <div className="mt-6 card" style={{ borderRadius: 12, padding: "1.75rem" }}>
              <div className="label">Common Questions</div>
              <ul style={{ marginTop: 12, display: "grid", gap: 10 }}>
                {guide.answer_intents.slice(0, 10).map((q) => (
                  <li key={q} className="text-muted" style={{ fontSize: "0.95rem", lineHeight: 1.45 }}>
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6">
            <div className="label">Ranked Shortlist</div>
            <div className="grid grid--2 grid--gap-2" style={{ gap: "1rem" }}>
              {rankedTools.map((x) => (
                <div key={x.tool.slug} className="card" style={{ padding: "1.5rem", borderRadius: 12 }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                    <Link className="text-white" style={{ fontSize: "1.05rem", fontWeight: 800 }} href={`/tools/${x.tool.slug}`}>
                      {x.position}. {x.tool.name}
                    </Link>
                    <div className="label label--pill" style={{ margin: 0, padding: "6px 12px" }}>
                      {x.tool.pricing}
                    </div>
                  </div>
                  <div className="text-muted" style={{ marginTop: 10, lineHeight: 1.45 }}>
                    {x.why}
                  </div>
                  <div className="mt-4 flex flex--gap-2" style={{ flexWrap: "wrap" }}>
                    <Link className="btn btn--secondary btn--sm" href={`/tools/${x.tool.slug}`}>
                      Details
                    </Link>
                    <a className="btn btn--ghost btn--sm" href={x.tool.url} target="_blank" rel="noreferrer">
                      Vendor
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 card" style={{ borderRadius: 12, padding: "1.75rem" }}>
            <div className="label">Comparison Table</div>
            <div className="text-muted" style={{ marginTop: 8 }}>
              Use this to shortlist quickly. Treat pricing/platform as directional and verify on the vendor site.
            </div>
            <div style={{ overflowX: "auto", marginTop: 12 }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Tool</th>
                    <th style={thStyle}>Pricing</th>
                    <th style={thStyle}>Platform</th>
                    <th style={thStyle}>Verified</th>
                    <th style={thStyle}>Last checked</th>
                    <th style={thStyle}>Categories</th>
                    <th style={thStyle}>Links</th>
                  </tr>
                </thead>
                <tbody>
                  {rankedTools.map((x) => (
                    <tr key={x.tool.slug}>
                      <td style={tdStyle}>
                        <div className="text-white" style={{ fontWeight: 700 }}>
                          {x.tool.name}
                        </div>
                        <div className="text-muted" style={{ marginTop: 6, lineHeight: 1.35, fontSize: "0.85rem" }}>
                          {x.tool.description}
                        </div>
                      </td>
                      <td style={tdStyle}>{x.tool.pricing}</td>
                      <td style={tdStyle}>{x.tool.platform.join(", ") || "web"}</td>
                      <td style={tdStyle}>{x.tool.verified ? "Yes" : "No"}</td>
                      <td style={tdStyle}>{formatIso(x.tool.last_verified) ?? "—"}</td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {x.tool.categories.slice(0, 4).map((c) => (
                            <span key={c} className="label label--pill" style={{ margin: 0, padding: "6px 10px" }}>
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <div className="flex flex--gap-2" style={{ flexWrap: "wrap" }}>
                          <Link className="btn btn--secondary btn--sm" href={`/tools/${x.tool.slug}`}>
                            Counterbench
                          </Link>
                          <a className="btn btn--ghost btn--sm" href={x.tool.url} target="_blank" rel="noreferrer">
                            Vendor
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 grid grid--2 grid--gap-2" style={{ gap: "1rem" }}>
            <div className="card" style={{ borderRadius: 12, padding: "1.75rem" }}>
              <div className="label">How to choose</div>
              <ul style={{ marginTop: 12, display: "grid", gap: 10 }}>
                {guide.how_to_choose.slice(0, 8).map((b) => (
                  <li key={b} className="text-muted" style={{ fontSize: "0.95rem", lineHeight: 1.45 }}>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card" style={{ borderRadius: 12, padding: "1.75rem" }}>
              <div className="label">Implementation risks</div>
              <ul style={{ marginTop: 12, display: "grid", gap: 10 }}>
                {guide.implementation_risks.slice(0, 8).map((b) => (
                  <li key={b} className="text-muted" style={{ fontSize: "0.95rem", lineHeight: 1.45 }}>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {recommendedPacks.length > 0 && (
            <div className="mt-6 card" style={{ borderRadius: 12, padding: "1.75rem" }}>
              <div className="label">Recommended prompt packs</div>
              <div className="grid grid--3 grid--gap-2 mt-4" style={{ gap: "1rem" }}>
                {recommendedPacks.map((p) => (
                  <div key={p.slug} className="card" style={{ padding: "1.25rem", borderRadius: 12 }}>
                    <div className="text-white" style={{ fontWeight: 700 }}>
                      {p.title}
                    </div>
                    <div className="text-muted" style={{ fontSize: "0.875rem", marginTop: 8 }}>
                      {p.description}
                    </div>
                    <div className="mt-4">
                      <Link className="btn btn--secondary btn--sm" href={`/prompts/packs/${p.slug}`}>
                        Open pack
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {guide.faq.length > 0 && (
            <div className="mt-6 card" style={{ borderRadius: 12, padding: "1.75rem" }}>
              <div className="label">FAQ</div>
              <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                {guide.faq.slice(0, 10).map((f) => (
                  <details key={f.q} className="card" style={{ padding: "1rem", borderRadius: 12 }}>
                    <summary className="text-white" style={{ fontWeight: 700, cursor: "pointer" }}>
                      {f.q}
                    </summary>
                    <div className="text-muted" style={{ marginTop: 10, lineHeight: 1.55 }}>
                      {f.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}

          {guide.citations.length > 0 && (
            <div className="mt-6 card" style={{ borderRadius: 12, padding: "1.75rem" }}>
              <div className="label">Citations</div>
              <ul style={{ marginTop: 12, display: "grid", gap: 10 }}>
                {guide.citations.slice(0, 12).map((c) => (
                  <li key={c.url} className="text-muted" style={{ fontSize: "0.95rem", lineHeight: 1.45 }}>
                    <a href={c.url} target="_blank" rel="noreferrer" className="text-white" style={{ fontWeight: 600 }}>
                      {c.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 card" style={{ borderRadius: 12, padding: "1.75rem" }}>
            <div className="label">Newsletter</div>
            <div className="text-white" style={{ fontSize: "1.25rem", fontWeight: 600 }}>
              Get the weekly bench test.
            </div>
            <p className="mt-3">One issue per week: what to adopt, what to ignore, and implementation risks.</p>
            <div style={{ maxWidth: 520 }}>
              <NewsletterCapture source={`guide:${guide.slug}`} />
            </div>
          </div>

          <div className="mt-6 text-muted" style={{ fontSize: "0.875rem" }}>
            Not legal advice. Verify with primary sources and your firm’s policies.
          </div>

          {jsonLd.map((obj) => (
            <script key={`${guide.slug}:${(obj as { ["@type"]?: string })["@type"] ?? "jsonld"}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }} />
          ))}
        </div>
      </section>
    </main>
  );
}
