import Link from "next/link";
import { getAllPlaybooks } from "@/lib/content";

export const metadata = { title: "Playbooks" };

export default function PlaybooksIndexPage() {
  const playbooks = getAllPlaybooks();

  return (
    <main>
      <section className="section" style={{ paddingTop: 120, paddingBottom: "4rem" }}>
        <div className="container">
          <div className="label">Playbooks</div>
          <h1 className="max-w-900">Workflows you can actually use.</h1>
          <p className="max-w-700 mt-4" style={{ fontSize: "1.125rem" }}>
            Answer a few questions and get a practical plan: recommended tools, prompts, skill templates, a checklist, and risk notes.
          </p>

          <div className="mt-5 flex flex--gap-2 flex--resp-col">
            <Link className="btn btn--primary btn--arrow" href="/playbooks/triage">
              Start triage
            </Link>
            <Link className="btn btn--secondary" href="/tools">
              Browse tools instead
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--alt section--border-t" style={{ paddingTop: "4rem", paddingBottom: "6rem" }}>
        <div className="container">
          <div className="grid grid--3 grid--gap-2" style={{ gap: "1rem" }}>
            {playbooks.map((p) => (
              <div key={p.slug} className="card" style={{ padding: "1.5rem", borderRadius: 12 }}>
                <div className="text-white" style={{ fontSize: "1.05rem", fontWeight: 650, letterSpacing: "-0.01em" }}>
                  {p.title}
                </div>
                <div className="text-muted" style={{ fontSize: "0.9375rem", marginTop: 10, lineHeight: 1.55 }}>
                  {p.description}
                </div>
                <div className="mt-4 flex flex--gap-2 flex--resp-col">
                  <Link className="btn btn--secondary btn--sm" href={`/playbooks/${p.slug}`}>
                    View playbook
                  </Link>
                  <Link className="btn btn--ghost btn--sm" href={`/playbooks/${p.slug}?from=index`}>
                    Use this template
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

