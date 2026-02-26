import Link from "next/link";
import { LegalPadButton } from "@/components/LegalPadButton";
import { VoteButtons } from "@/components/VoteButtons";
import { getAllSkills } from "@/lib/content";

export const metadata = { title: "Skills" };

type SearchParams = Record<string, string | string[] | undefined>;

export default async function SkillsIndexPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const sp = (await searchParams) ?? {};
  const q = typeof sp.q === "string" ? sp.q : "";
  let skills = getAllSkills();
  if (q) {
    const needle = q.toLowerCase();
    skills = skills.filter((s) => `${s.frontmatter.title} ${s.frontmatter.description}`.toLowerCase().includes(needle));
  }

  return (
    <main>
      <section className="section" style={{ paddingTop: 120, paddingBottom: "4rem" }}>
        <div className="container">
          <div className="label">Skills</div>
          <h1 className="max-w-900">Skill templates</h1>
          <p className="max-w-700 mt-4" style={{ fontSize: "1.125rem" }}>
            Git-backed MDX skills with examples and structured inputs.
          </p>

          <form method="get" className="mt-5">
            <div className="flex flex--gap-2 flex--resp-col">
              <input
                name="q"
                defaultValue={q}
                placeholder="Search skills…"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 999,
                  border: "1px solid var(--border)",
                  background: "var(--input-bg)",
                  color: "var(--fg)"
                }}
              />
              <button className="btn btn--primary btn--sm" type="submit">
                Search
              </button>
            </div>
          </form>

          <div className="grid grid--3 grid--gap-2 mt-6" style={{ gap: "1rem" }}>
            {skills.map((s) => (
              <div key={s.slug} className="card" style={{ padding: "1.5rem", borderRadius: 12 }}>
                <Link className="text-white" style={{ fontSize: "1.05rem", fontWeight: 700 }} href={`/skills/${s.slug}`}>
                  {s.frontmatter.title}
                </Link>
                <div className="text-muted" style={{ fontSize: "0.875rem", marginTop: 10 }}>
                  {s.frontmatter.description}
                </div>

                <div className="mt-4 flex flex--between flex--gap-2" style={{ alignItems: "center", flexWrap: "wrap" }}>
                  <Link className="btn btn--secondary btn--sm" href={`/skills/${s.slug}`}>
                    Open
                  </Link>
                  <div className="flex flex--gap-1" style={{ alignItems: "center", flexWrap: "wrap" }}>
                    <VoteButtons type="skill" slug={s.slug} compact />
                    <LegalPadButton type="skill" slug={s.slug} title={s.frontmatter.title} description={s.frontmatter.description} compact />
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
