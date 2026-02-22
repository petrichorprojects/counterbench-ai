import Link from "next/link";
import { Badge } from "@/design-system/Badge";
import { CompareManager } from "@/components/compare/CompareManager";
import { getToolBySlug } from "@/lib/content";

export const metadata = { title: "Compare" };

type SearchParams = Record<string, string | string[] | undefined>;

function parseToolsParam(input: string | string[] | undefined): string[] {
  const v = Array.isArray(input) ? input[0] : input;
  if (!v) return [];
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);
}

export default async function ToolsComparePage({
  searchParams
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const slugs = parseToolsParam(sp.tools);
  const tools = slugs
    .map((s) => getToolBySlug(s))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <main>
      <section className="section" style={{ paddingTop: 120, paddingBottom: "4rem" }}>
        <div className="container">
          <div className="label">Compare</div>
          <h1 className="max-w-900">Compare tools</h1>
          <p className="max-w-700 mt-4" style={{ fontSize: "1.125rem" }}>
            Use query params for shareable compares, plus local storage for persistence.
          </p>

          <div className="mt-5">
            <CompareManager initialSlugs={slugs} />
          </div>

          {tools.length === 0 ? (
            <div className="mt-6 card" style={{ borderRadius: 12, padding: "1.75rem" }}>
              <div className="text-white" style={{ fontSize: "1.1rem", fontWeight: 600 }}>
                Add tools to compare
              </div>
              <p className="mt-3">Start on the directory and use “Add to compare”, or add tool slugs here.</p>
              <Link className="btn btn--secondary btn--sm" href="/tools">
                Browse tools
              </Link>
            </div>
          ) : (
            <div className="mt-6" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 10px", minWidth: 840 }}>
                <thead>
                  <tr className="text-muted" style={{ fontSize: "0.875rem" }}>
                    <th style={{ textAlign: "left", padding: "0 12px" }}>Tool</th>
                    <th style={{ textAlign: "left", padding: "0 12px" }}>Pricing</th>
                    <th style={{ textAlign: "left", padding: "0 12px" }}>Platform</th>
                    <th style={{ textAlign: "left", padding: "0 12px" }}>Categories</th>
                    <th style={{ textAlign: "left", padding: "0 12px" }}>Verified</th>
                    <th style={{ textAlign: "left", padding: "0 12px" }}>Link</th>
                  </tr>
                </thead>
                <tbody>
                  {tools.map((t) => (
                    <tr key={t.slug}>
                      <td style={{ padding: "12px 12px" }}>
                        <div className="text-white" style={{ fontWeight: 700 }}>
                          {t.name}
                        </div>
                        <div className="text-muted" style={{ fontSize: "0.875rem", marginTop: 6 }}>
                          {t.description.slice(0, 120)}
                          {t.description.length > 120 ? "…" : ""}
                        </div>
                      </td>
                      <td style={{ padding: "12px 12px" }}>
                        <Badge tone="neutral">{t.pricing}</Badge>
                      </td>
                      <td style={{ padding: "12px 12px" }}>
                        <div className="flex flex--gap-1" style={{ flexWrap: "wrap" }}>
                          {t.platform.map((p) => (
                            <Badge key={p} tone="neutral">
                              {p}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: "12px 12px" }}>
                        <div className="flex flex--gap-1" style={{ flexWrap: "wrap" }}>
                          {t.categories.slice(0, 3).map((c) => (
                            <Badge key={c} tone="neutral">
                              {c}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: "12px 12px" }}>
                        {t.last_verified ? <Badge tone="success">Yes</Badge> : <Badge tone="warn">No</Badge>}
                      </td>
                      <td style={{ padding: "12px 12px" }}>
                        <a className="btn btn--ghost btn--sm" href={t.affiliate_url ?? t.url} target="_blank" rel="noreferrer">
                          Visit
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
