import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/design-system/Badge";
import { NewsletterCapture } from "@/components/NewsletterCapture";
import { ToolActions } from "@/components/ToolActions";
import { getAllTools, getToolBySlug } from "@/lib/content";
import { toolJsonLd, toolMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return getAllTools().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};
  return toolMetadata(tool);
}

function formatIsoDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().slice(0, 10);
}

export default async function ToolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const verifiedDate = formatIsoDate(tool.last_verified);
  const related = getAllTools()
    .filter((t) => t.slug !== tool.slug)
    .map((t) => {
      const shared = t.tags.filter((tag) => tool.tags.includes(tag)).length + t.categories.filter((c) => tool.categories.includes(c)).length;
      return { t, shared };
    })
    .filter((x) => x.shared > 0)
    .sort((a, b) => b.shared - a.shared)
    .slice(0, 6)
    .map((x) => x.t);

  return (
    <main>
      <section className="section" style={{ paddingTop: 120, paddingBottom: "4rem" }}>
        <div className="container">
          <div className="label">Tool</div>
          <h1 className="max-w-900">{tool.name}</h1>
          <p className="max-w-800 mt-4" style={{ fontSize: "1.125rem" }}>
            {tool.description}
          </p>

          <div className="flex flex--gap-1 mt-4" style={{ flexWrap: "wrap" }}>
            {tool.verified && <Badge tone="success">Verified</Badge>}
            <Badge tone="neutral">Pricing: {tool.pricing}</Badge>
            <Badge tone="neutral">Status: {tool.status}</Badge>
            {tool.platform.map((p) => (
              <Badge key={p} tone="neutral">
                {p}
              </Badge>
            ))}
          </div>

          <div className="mt-5 flex flex--gap-2 flex--resp-col">
            <a className="btn btn--primary btn--arrow" href={tool.affiliate_url ?? tool.url} target="_blank" rel="noreferrer">
              Visit tool
            </a>
            {tool.affiliate_url && (
              <a className="btn btn--secondary btn--sm" href={tool.url} target="_blank" rel="noreferrer">
                Non-affiliate link
              </a>
            )}
            <ToolActions slug={tool.slug} url={tool.affiliate_url ?? tool.url} />
          </div>

          <div className="mt-5 grid grid--2 grid--gap-2" style={{ gap: "1rem" }}>
            <div className="card" style={{ padding: "1.5rem", borderRadius: 12 }}>
              <div className="label">Categories</div>
              <div className="flex flex--gap-1" style={{ flexWrap: "wrap" }}>
                {tool.categories.map((c) => (
                  <Badge key={c} tone="neutral">
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding: "1.5rem", borderRadius: 12 }}>
              <div className="label">Tags</div>
              <div className="flex flex--gap-1" style={{ flexWrap: "wrap" }}>
                {tool.tags.slice(0, 24).map((t) => (
                  <Badge key={t} tone="neutral">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 card" style={{ borderRadius: 12, padding: "1.75rem" }}>
            <div className="label">Verification</div>
            <div className="text-white" style={{ fontSize: "1rem", fontWeight: 600 }}>
              {verifiedDate ? `Last checked: ${verifiedDate}` : "Not checked yet"}
            </div>
            <p className="mt-3">
              “Last checked” indicates the listing URL was reachable at that time. The “Verified” badge is reserved for entries that have been manually reviewed.
            </p>
          </div>

          {tool.change_log.length > 0 && (
            <div className="mt-6 card" style={{ borderRadius: 12, padding: "1.75rem" }}>
              <div className="label">Change log</div>
              <ul style={{ marginTop: 12, display: "grid", gap: 10 }}>
                {tool.change_log.map((e) => (
                  <li key={`${e.date}-${e.note}`} className="text-muted" style={{ fontSize: "0.9375rem" }}>
                    <span className="text-white" style={{ fontWeight: 600 }}>
                      {e.date}:
                    </span>{" "}
                    {e.note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 card" style={{ borderRadius: 12, padding: "1.75rem" }}>
            <div className="label">Newsletter</div>
            <div className="text-white" style={{ fontSize: "1.25rem", fontWeight: 600 }}>
              Get updates when tools change.
            </div>
            <p className="mt-3">Short weekly updates for legal teams.</p>
            <div style={{ maxWidth: 520 }}>
              <NewsletterCapture source={`tool:${tool.slug}`} />
            </div>
          </div>

          {related.length > 0 && (
            <div className="mt-6">
              <div className="label">Related</div>
              <div className="grid grid--3 grid--gap-2" style={{ gap: "1rem" }}>
                {related.map((t) => (
                  <div key={t.slug} className="card" style={{ padding: "1.25rem", borderRadius: 12 }}>
                    <Link href={`/tools/${t.slug}`} className="text-white" style={{ fontWeight: 600 }}>
                      {t.name}
                    </Link>
                    <div className="text-muted" style={{ fontSize: "0.875rem", marginTop: 8 }}>
                      {t.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toolJsonLd(tool)) }} />
        </div>
      </section>
    </main>
  );
}
