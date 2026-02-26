import Link from "next/link";
import { LegalPadButton } from "@/components/LegalPadButton";
import { VoteButtons } from "@/components/VoteButtons";
import { getAllPrompts } from "@/lib/content";

export const metadata = { title: "AI Prompts" };

type SearchParams = Record<string, string | string[] | undefined>;

export default async function PromptsIndexPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const sp = (await searchParams) ?? {};
  const tag = typeof sp.tag === "string" ? sp.tag : "";
  const q = typeof sp.q === "string" ? sp.q : "";

  let prompts = getAllPrompts();
  if (tag) prompts = prompts.filter((p) => p.frontmatter.tags.some((t) => t.toLowerCase() === tag.toLowerCase()));
  if (q) {
    const needle = q.toLowerCase();
    prompts = prompts.filter((p) => `${p.frontmatter.title} ${p.frontmatter.description}`.toLowerCase().includes(needle));
  }

  const allTags = [...new Set(getAllPrompts().flatMap((p) => p.frontmatter.tags))].sort((a, b) => a.localeCompare(b));

  return (
    <main>
      <section className="section" style={{ paddingTop: 120, paddingBottom: "4rem" }}>
        <div className="container">
          <div className="label">COUNTERBENCH FOR LEGAL TEAMS</div>
          <h1 className="max-w-900">AI Prompts Built for How Lawyers Actually Work</h1>
          <p className="max-w-800 mt-4" style={{ fontSize: "1.125rem" }}>
            Search 200+ vetted prompts, tools, and skills across litigation, contracts, research, and compliance — each one
            version-controlled and structured for reliable output.
          </p>

          <div className="mt-5 flex flex--gap-2" style={{ flexWrap: "wrap" }}>
            <Link className="btn btn--secondary btn--sm" href="/tools">
              Browse tools
            </Link>
            <Link className="btn btn--secondary btn--sm" href="/skills">
              Browse skills
            </Link>
            <Link className="btn btn--ghost btn--sm" href="/prompts/packs">
              Explore prompt packs
            </Link>
          </div>

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
                  placeholder="e.g. intake, research, contracts"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 999,
                    border: "1px solid var(--border)",
                    background: "var(--input-bg)",
                    color: "var(--fg)"
                  }}
                />
              </div>
              <div>
                <label className="label" htmlFor="tag">
                  Tag
                </label>
                <select
                  id="tag"
                  name="tag"
                  defaultValue={tag}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 999,
                    border: "1px solid var(--border)",
                    background: "var(--input-bg)",
                    color: "var(--fg)"
                  }}
                >
                  <option value="">All</option>
                  {allTags.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex--gap-2 flex--center" style={{ alignItems: "flex-end" }}>
                <button className="btn btn--primary btn--sm" type="submit">
                  Apply
                </button>
                <Link className="btn btn--secondary btn--sm" href="/prompts">
                  Reset
                </Link>
              </div>
            </div>
          </form>

          <div className="grid grid--3 grid--gap-2 mt-6" style={{ gap: "1rem" }}>
            {prompts.map((p) => (
              <div key={p.slug} className="card" style={{ padding: "1.5rem", borderRadius: 12 }}>
                <Link className="text-white" style={{ fontSize: "1.05rem", fontWeight: 700 }} href={`/prompts/${p.slug}`}>
                  {p.frontmatter.title}
                </Link>
                <div className="text-muted" style={{ fontSize: "0.875rem", marginTop: 10 }}>
                  {p.frontmatter.description}
                </div>

                <div className="mt-4 flex flex--between flex--gap-2" style={{ alignItems: "center", flexWrap: "wrap" }}>
                  <Link className="btn btn--secondary btn--sm" href={`/prompts/${p.slug}`}>
                    Open
                  </Link>
                  <div className="flex flex--gap-1" style={{ alignItems: "center", flexWrap: "wrap" }}>
                    <VoteButtons type="prompt" slug={p.slug} compact />
                    <LegalPadButton type="prompt" slug={p.slug} title={p.frontmatter.title} description={p.frontmatter.description} compact />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
