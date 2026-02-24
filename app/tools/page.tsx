import { NewsletterCapture } from "@/components/NewsletterCapture";
import { Pagination } from "@/components/Pagination";
import { ToolCard } from "@/components/ToolCard";
import { getAllTools } from "@/lib/content";
import { searchTools } from "@/lib/search";
import type { Tool } from "@/lib/schemas";
import Link from "next/link";

export const metadata = { title: "Tools" };

type SearchParams = Record<string, string | string[] | undefined>;

function toInt(value: string | string[] | undefined, fallback: number): number {
  const v = Array.isArray(value) ? value[0] : value;
  const n = v ? Number.parseInt(v, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function normalize(value: string | string[] | undefined): string {
  const v = Array.isArray(value) ? value[0] : value;
  return (v ?? "").trim();
}

function uniq<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

function filterTools(tools: Tool[], params: { q: string; category: string; pricing: string; platform: string; tags: string[] }) {
  let filtered = tools;

  if (params.q) {
    const slugs = searchTools(params.q);
    if (slugs.length) {
      const set = new Set(slugs);
      filtered = filtered.filter((t) => set.has(t.slug));
    } else {
      const q = params.q.toLowerCase();
      filtered = filtered.filter((t) => {
        const hay = `${t.name} ${t.description} ${t.tags.join(" ")} ${t.categories.join(" ")}`.toLowerCase();
        return hay.includes(q);
      });
    }
  }

  if (params.category) {
    filtered = filtered.filter((t) => t.categories.some((c) => c.toLowerCase() === params.category.toLowerCase()));
  }
  if (params.pricing) {
    filtered = filtered.filter((t) => t.pricing === params.pricing);
  }
  if (params.platform) {
    filtered = filtered.filter((t) => t.platform.some((p) => p.toLowerCase() === params.platform.toLowerCase()));
  }
  if (params.tags.length) {
    const tagSet = new Set(params.tags.map((t) => t.toLowerCase()));
    filtered = filtered.filter((t) => t.tags.some((tag) => tagSet.has(tag.toLowerCase())));
  }

  return filtered;
}

export default async function ToolsIndexPage({
  searchParams
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};

  const all = getAllTools();
  const q = normalize(sp.q);
  const category = normalize(sp.category);
  const pricing = normalize(sp.pricing);
  const platform = normalize(sp.platform);
  const sortParam = normalize(sp.sort);
  const sort = sortParam || (q ? "relevance" : "name");
  const page = toInt(sp.page, 1);
  const tags = uniq(
    normalize(sp.tags)
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
  );

  const featured = all.filter((t) => t.featured);
  let filtered = filterTools(all, { q, category, pricing, platform, tags });

  if (sort === "name") filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  if (sort === "verified") filtered = [...filtered].sort((a, b) => Number(Boolean(b.last_verified)) - Number(Boolean(a.last_verified)));

  const perPage = 24;
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const clampedPage = Math.min(page, totalPages);
  const start = (clampedPage - 1) * perPage;
  const items = filtered.slice(start, start + perPage);

  const allCategories = uniq(all.flatMap((t) => t.categories)).sort((a, b) => a.localeCompare(b));
  const allPlatforms = uniq(all.flatMap((t) => t.platform)).sort((a, b) => a.localeCompare(b));

  return (
    <main>
      <section className="section" style={{ paddingTop: 120, paddingBottom: "4rem" }}>
        <div className="container">
          <div className="label">Tools</div>
          <h1 className="max-w-900">Legal AI tools directory</h1>
          <p className="max-w-700 mt-4" style={{ fontSize: "1.125rem" }}>
            Filter by category, pricing, and platform. Includes compliance, contracts, intake, eDiscovery, research, and document automation. Compare tools side-by-side.
          </p>

          <form method="get" className="mt-5">
            <div className="grid grid--3 grid--gap-2" style={{ gap: "1rem" }}>
              <div>
                <label className="label" htmlFor="q">
                  Search
                </label>
                <input
                  id="q"
                  name="q"
                  defaultValue={q}
                  placeholder="e.g. contracts, compliance, intake"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 999,
                    border: "1px solid var(--border)",
                    background: "rgba(255,255,255,0.04)",
                    color: "var(--fg)"
                  }}
                />
              </div>
              <div>
                <label className="label" htmlFor="category">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  defaultValue={category}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 999,
                    border: "1px solid var(--border)",
                    background: "rgba(255,255,255,0.04)",
                    color: "var(--fg)"
                  }}
                >
                  <option value="">All</option>
                  {allCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="pricing">
                  Pricing
                </label>
                <select
                  id="pricing"
                  name="pricing"
                  defaultValue={pricing}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 999,
                    border: "1px solid var(--border)",
                    background: "rgba(255,255,255,0.04)",
                    color: "var(--fg)"
                  }}
                >
                  <option value="">All</option>
                  <option value="free">Free</option>
                  <option value="freemium">Freemium</option>
                  <option value="trial">Trial</option>
                  <option value="paid">Paid</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="platform">
                  Platform
                </label>
                <select
                  id="platform"
                  name="platform"
                  defaultValue={platform}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 999,
                    border: "1px solid var(--border)",
                    background: "rgba(255,255,255,0.04)",
                    color: "var(--fg)"
                  }}
                >
                  <option value="">All</option>
                  {allPlatforms.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="sort">
                  Sort
                </label>
                <select
                  id="sort"
                  name="sort"
                  defaultValue={sort}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 999,
                    border: "1px solid var(--border)",
                    background: "rgba(255,255,255,0.04)",
                    color: "var(--fg)"
                  }}
                >
                  <option value="relevance">Relevance</option>
                  <option value="name">Name</option>
                  <option value="verified">Verified</option>
                </select>
              </div>
              <div className="flex flex--gap-2 flex--center" style={{ alignItems: "flex-end" }}>
                <button className="btn btn--primary btn--sm" type="submit">
                  Apply
                </button>
                <Link className="btn btn--secondary btn--sm" href="/tools">
                  Reset
                </Link>
              </div>
            </div>
          </form>

          {featured.length > 0 && !q && !category && !pricing && !platform && clampedPage === 1 && (
            <div className="mt-6">
              <div className="label">Featured</div>
              <div className="grid grid--3 grid--gap-2" style={{ gap: "1rem" }}>
                {featured.slice(0, 6).map((t) => (
                  <ToolCard key={t.slug} tool={t} />
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex--between flex--center">
            <div className="text-muted" style={{ fontSize: "0.875rem" }}>
              {total} tools
            </div>
            <Link className="btn btn--ghost btn--sm" href="/tools/compare">
              Compare
            </Link>
          </div>

          <div className="grid grid--3 grid--gap-2 mt-4" style={{ gap: "1rem" }}>
            {items.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </div>

          {clampedPage === 1 && total > 12 && (
            <div className="mt-6 card" style={{ borderRadius: 12, padding: "1.75rem" }}>
              <div className="label">Newsletter</div>
              <div className="text-white" style={{ fontSize: "1.25rem", fontWeight: 600 }}>
                Get tool changes and new packs.
              </div>
              <p className="mt-3">Short weekly updates for legal teams. No spam.</p>
              <div style={{ maxWidth: 520 }}>
                <NewsletterCapture source="tools-directory" />
              </div>
            </div>
          )}

          <Pagination
            basePath="/tools"
            page={clampedPage}
            totalPages={totalPages}
            query={{ q, category, pricing, platform, sort, tags: tags.join(",") || undefined }}
          />
        </div>
      </section>
    </main>
  );
}
