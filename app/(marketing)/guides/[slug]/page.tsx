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
  const ogImage = absoluteUrl(`/guides/${guide.slug}/opengraph-image`);
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: url },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url,
      type: "article",
      images: [{ url: ogImage, width: 1200, height: 630, alt: guide.title }]
    },
    twitter: {
      card: "summary_large_image",
      title: guide.title,
      description: guide.description,
      images: [ogImage]
    }
  };
}

function formatIso(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().slice(0, 10);
}

function toolDisplayName(name: string): string {
  const trimmed = name.trim();
  const m = trimmed.match(/^(.*?)(?:\s+\d[\d,]*)$/);
  if (m && m[1] && m[1].trim().length >= 3) return m[1].trim();
  return trimmed;
}

function toolDescriptionForDisplay(description: string): string | null {
  const d = description.trim();
  if (!d) return null;
  if (/pending verification/i.test(d)) return null;
  return d;
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
    ranked: rankedTools.map((x) => ({
      position: x.position,
      name: toolDisplayName(x.tool.name),
      url: absoluteUrl(`/tools/${x.tool.slug}`)
    })),
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

  const tocItems = [
    { id: "quick-answer", label: "Quick answer", show: Boolean(guide.direct_answer) },
    { id: "tldr", label: "TL;DR", show: true },
    { id: "download-kit", label: "Download kit", show: guide.downloads.length > 0 },
    { id: "common-questions", label: "Common questions", show: guide.answer_intents.length > 0 },
    { id: "worked-example", label: "Worked example", show: guide.worked_examples.length > 0 },
    { id: "ranked-shortlist", label: "Ranked shortlist", show: rankedTools.length > 0 },
    { id: "workflow-fit", label: "Workflow fit", show: guide.workflow_tool_comparison.length > 0 },
    { id: "comparison-table", label: "Comparison table", show: rankedTools.length > 0 },
    { id: "how-to-choose", label: "How to choose", show: guide.how_to_choose.length > 0 },
    { id: "implementation-risks", label: "Implementation risks", show: guide.implementation_risks.length > 0 },
    { id: "operator-playbook", label: "Operator playbook", show: guide.operator_playbook.length > 0 },
    { id: "recommended-packs", label: "Recommended packs", show: recommendedPacks.length > 0 },
    { id: "faq", label: "FAQ", show: guide.faq.length > 0 },
    { id: "citations", label: "Citations", show: guide.citations.length > 0 },
    { id: "newsletter", label: "Newsletter", show: true },
    { id: "changelog", label: "Changelog", show: guide.changelog.length > 0 }
  ].filter((x) => x.show);

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
            <Badge tone="neutral">Updated: {formatIso(guide.last_updated) ?? guide.last_updated}</Badge>
            <Link className="btn btn--ghost btn--sm" href="/guides">
              All guides
            </Link>
          </div>

          <div className="mt-6 grid grid--2 grid--gap-2" style={{ gap: "1.25rem", alignItems: "start" }}>
            <div>
              {guide.direct_answer && (
                <div id="quick-answer" className="card" style={{ borderRadius: 12, padding: "1.75rem" }}>
                  <div className="label">Quick answer</div>
                  <div className="text-white" style={{ fontSize: "1.05rem", lineHeight: 1.6 }}>
                    {guide.direct_answer}
                  </div>
                </div>
              )}

              <div id="tldr" className={`${guide.direct_answer ? "mt-6 " : ""}card`} style={{ borderRadius: 12, padding: "1.75rem" }}>
                <div className="label">TL;DR</div>
                <div className="text-white" style={{ fontSize: "1.05rem", lineHeight: 1.6 }}>
                  {guide.tldr}
                </div>
              </div>

          {guide.downloads.length > 0 && (
            <div id="download-kit" className="mt-6 card" style={{ borderRadius: 12, padding: "1.75rem" }}>
              <div className="label">Download the kit</div>
              <div className="text-muted" style={{ marginTop: 8 }}>
                Templates you can reuse across matters. Keep them in your matter folder and log changes.
              </div>
              <div className="mt-4 flex flex--gap-2" style={{ flexWrap: "wrap" }}>
                {guide.downloads.map((d) => (
                  <a key={d.url} className="btn btn--secondary btn--sm" href={d.url}>
                    {d.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          {guide.answer_intents.length > 0 && (
            <div id="common-questions" className="mt-6 card" style={{ borderRadius: 12, padding: "1.75rem" }}>
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

          {guide.worked_examples.length > 0 && (
            <div id="worked-example" className="mt-6 card" style={{ borderRadius: 12, padding: "1.75rem" }}>
              <div className="label">Worked example</div>
              <div className="text-muted" style={{ marginTop: 8 }}>
                A sanitized, workflow-first example. Treat as an operating pattern, not legal advice.
              </div>
              <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                {guide.worked_examples.slice(0, 2).map((ex) => (
                  <details key={ex.title} className="card" style={{ padding: "1rem", borderRadius: 12 }}>
                    <summary className="text-white" style={{ fontWeight: 800, cursor: "pointer" }}>
                      {ex.title} <span className="text-muted" style={{ fontWeight: 600 }}>({ex.time_box})</span>
                    </summary>
                    <div className="text-muted" style={{ marginTop: 10, lineHeight: 1.55 }}>
                      <div className="text-white" style={{ fontWeight: 800, marginTop: 6 }}>
                        Scenario
                      </div>
                      <div style={{ marginTop: 6 }}>{ex.scenario}</div>

                      <div className="text-white" style={{ fontWeight: 800, marginTop: 14 }}>
                        Inputs
                      </div>
                      <ul style={{ marginTop: 8, display: "grid", gap: 6 }}>
                        {ex.inputs.map((x) => (
                          <li key={x}>{x}</li>
                        ))}
                      </ul>

                      <div className="text-white" style={{ fontWeight: 800, marginTop: 14 }}>
                        Process
                      </div>
                      <ul style={{ marginTop: 8, display: "grid", gap: 6 }}>
                        {ex.process.map((x) => (
                          <li key={x}>{x}</li>
                        ))}
                      </ul>

                      <div className="text-white" style={{ fontWeight: 800, marginTop: 14 }}>
                        Outputs
                      </div>
                      <ul style={{ marginTop: 8, display: "grid", gap: 6 }}>
                        {ex.outputs.map((x) => (
                          <li key={x}>{x}</li>
                        ))}
                      </ul>

                      {ex.qa_findings.length > 0 && (
                        <>
                          <div className="text-white" style={{ fontWeight: 800, marginTop: 14 }}>
                            QA findings
                          </div>
                          <ul style={{ marginTop: 8, display: "grid", gap: 6 }}>
                            {ex.qa_findings.map((x) => (
                              <li key={x}>{x}</li>
                            ))}
                          </ul>
                        </>
                      )}

                      {ex.adjustments_made.length > 0 && (
                        <>
                          <div className="text-white" style={{ fontWeight: 800, marginTop: 14 }}>
                            Adjustments made
                          </div>
                          <ul style={{ marginTop: 8, display: "grid", gap: 6 }}>
                            {ex.adjustments_made.map((x) => (
                              <li key={x}>{x}</li>
                            ))}
                          </ul>
                        </>
                      )}

                      <div className="text-white" style={{ fontWeight: 800, marginTop: 14 }}>
                        Key takeaway
                      </div>
                      <div style={{ marginTop: 6 }}>{ex.key_takeaway}</div>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}

          <div id="ranked-shortlist" className="mt-6">
            <div className="label">Ranked Shortlist</div>
            <div className="grid grid--2 grid--gap-2" style={{ gap: "1rem" }}>
              {rankedTools.map((x) => (
                <div key={x.tool.slug} className="card" style={{ padding: "1.5rem", borderRadius: 12 }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                    <Link className="text-white" style={{ fontSize: "1.05rem", fontWeight: 800 }} href={`/tools/${x.tool.slug}`}>
                      {x.position}. {toolDisplayName(x.tool.name)}
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

          {guide.workflow_tool_comparison.length > 0 && (
            <div id="workflow-fit" className="mt-6 card" style={{ borderRadius: 12, padding: "1.75rem" }}>
              <div className="label">Workflow fit (comparison)</div>
              <div className="text-muted" style={{ marginTop: 8 }}>
                A workflow-first comparison. Treat as directional and verify with your team’s requirements and vendor docs.
              </div>
              <div className="text-muted" style={{ marginTop: 8, fontSize: "0.875rem" }}>
                Tip: swipe horizontally to see all columns.
              </div>
              <div style={{ overflowX: "auto", marginTop: 12 }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Tool</th>
                      <th style={thStyle}>Best for</th>
                      <th style={thStyle}>Workflow fit</th>
                      <th style={thStyle}>Auditability</th>
                      <th style={thStyle}>QA support</th>
                      <th style={thStyle}>Privilege controls</th>
                      <th style={thStyle}>Exports/logs</th>
                      <th style={thStyle}>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guide.workflow_tool_comparison.map((row) => {
                      const tool = getToolBySlug(row.tool_slug);
                      if (!tool) return null;
                      const desc = toolDescriptionForDisplay(tool.description);
                      return (
                        <tr key={row.tool_slug}>
                          <td style={tdStyle}>
                            <div className="text-white" style={{ fontWeight: 800 }}>
                              <Link href={`/tools/${tool.slug}`}>{toolDisplayName(tool.name)}</Link>
                            </div>
                            {desc && (
                              <div className="text-muted" style={{ marginTop: 6, lineHeight: 1.35, fontSize: "0.85rem" }}>
                                {desc}
                              </div>
                            )}
                          </td>
                          <td style={tdStyle}>{row.best_for}</td>
                          <td style={tdStyle}>{row.workflow_fit.join(", ") || "—"}</td>
                          <td style={tdStyle}>{row.auditability}</td>
                          <td style={tdStyle}>{row.qa_support}</td>
                          <td style={tdStyle}>{row.privilege_controls}</td>
                          <td style={tdStyle}>{row.exports_logs}</td>
                          <td style={tdStyle}>{row.notes}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div id="comparison-table" className="mt-6 card" style={{ borderRadius: 12, padding: "1.75rem" }}>
            <div className="label">Comparison Table</div>
            <div className="text-muted" style={{ marginTop: 8 }}>
              Use this to shortlist quickly. Treat pricing/platform as directional and verify on the vendor site.
            </div>
            <div className="text-muted" style={{ marginTop: 8, fontSize: "0.875rem" }}>
              Tip: swipe horizontally to see all columns.
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
                          {toolDisplayName(x.tool.name)}
                        </div>
                        {toolDescriptionForDisplay(x.tool.description) && (
                          <div className="text-muted" style={{ marginTop: 6, lineHeight: 1.35, fontSize: "0.85rem" }}>
                            {toolDescriptionForDisplay(x.tool.description)}
                          </div>
                        )}
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
            <div id="how-to-choose" className="card" style={{ borderRadius: 12, padding: "1.75rem" }}>
              <div className="label">How to choose</div>
              <ul style={{ marginTop: 12, display: "grid", gap: 10 }}>
                {guide.how_to_choose.slice(0, 8).map((b) => (
                  <li key={b} className="text-muted" style={{ fontSize: "0.95rem", lineHeight: 1.45 }}>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div id="implementation-risks" className="card" style={{ borderRadius: 12, padding: "1.75rem" }}>
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

          {guide.operator_playbook.length > 0 && (
            <div id="operator-playbook" className="mt-6 card" style={{ borderRadius: 12, padding: "1.75rem" }}>
              <div className="label">Operator playbook</div>
              <div className="text-muted" style={{ marginTop: 8 }}>
                Copy/pasteable workflow steps you can standardize across matters. Keep it consistent and log changes.
              </div>
              <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
                {guide.operator_playbook.map((s) => (
                  <div key={s.title} className="card" style={{ padding: "1.25rem", borderRadius: 12 }}>
                    <div className="text-white" style={{ fontWeight: 800 }}>
                      {s.title}
                    </div>
                    <ul style={{ marginTop: 10, display: "grid", gap: 8 }}>
                      {s.bullets.map((b) => (
                        <li key={b} className="text-muted" style={{ fontSize: "0.95rem", lineHeight: 1.45 }}>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recommendedPacks.length > 0 && (
            <div id="recommended-packs" className="mt-6 card" style={{ borderRadius: 12, padding: "1.75rem" }}>
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
            <div id="faq" className="mt-6 card" style={{ borderRadius: 12, padding: "1.75rem" }}>
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
            <div id="citations" className="mt-6 card" style={{ borderRadius: 12, padding: "1.75rem" }}>
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

          <div id="newsletter" className="mt-6 card" style={{ borderRadius: 12, padding: "1.75rem" }}>
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

          {guide.changelog.length > 0 && (
            <div id="changelog" className="mt-6 card" style={{ borderRadius: 12, padding: "1.75rem" }}>
              <div className="label">Changelog</div>
              <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
                {guide.changelog.slice(0, 8).map((c) => (
                  <div key={`${c.date}:${c.changes[0]}`} className="card" style={{ padding: "1rem", borderRadius: 12 }}>
                    <div className="text-white" style={{ fontWeight: 800 }}>
                      {c.date}
                    </div>
                    <ul style={{ marginTop: 8, display: "grid", gap: 6 }}>
                      {c.changes.map((x) => (
                        <li key={x} className="text-muted" style={{ fontSize: "0.95rem", lineHeight: 1.45 }}>
                          {x}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {jsonLd.map((obj) => (
            <script key={`${guide.slug}:${(obj as { ["@type"]?: string })["@type"] ?? "jsonld"}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }} />
          ))}
            </div>

            <aside style={{ position: "sticky", top: 110, alignSelf: "start" }}>
              {guide.downloads.length > 0 && (
                <div className="card" style={{ borderRadius: 12, padding: "1.25rem" }}>
                  <div className="label">Download kit</div>
                  <div className="text-muted" style={{ marginTop: 6, fontSize: "0.875rem", lineHeight: 1.45 }}>
                    Keep this open while you work.
                  </div>
                  <div className="mt-4 flex flex--gap-2" style={{ flexWrap: "wrap" }}>
                    {guide.downloads.map((d) => (
                      <a key={d.url} className="btn btn--secondary btn--sm" href={d.url}>
                        {d.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className={`${guide.downloads.length > 0 ? "mt-6 " : ""}card`} style={{ borderRadius: 12, padding: "1.25rem" }}>
                <div className="label">On this page</div>
                <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                  {tocItems.map((t) => (
                    <a key={t.id} href={`#${t.id}`} className="text-white" style={{ fontWeight: 700, textDecoration: "none" }}>
                      {t.label}
                    </a>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
