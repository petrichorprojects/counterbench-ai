import Link from "next/link";
import { NewsletterCapture } from "@/components/NewsletterCapture";
import { getAllPacks } from "@/lib/content";

export const metadata = { title: "Prompt Packs" };

export default function PromptPacksIndexPage() {
  const packs = getAllPacks().sort((a, b) => a.title.localeCompare(b.title));

  return (
    <main>
      <section className="section" style={{ paddingTop: 120, paddingBottom: "4rem" }}>
        <div className="container">
          <div className="label">Prompt packs</div>
          <h1 className="max-w-900">Workflow-oriented prompt packs</h1>
          <p className="max-w-700 mt-4" style={{ fontSize: "1.125rem" }}>
            Bundles of prompts designed for specific roles and stages.
          </p>

          <div className="grid grid--3 grid--gap-2 mt-6" style={{ gap: "1rem" }}>
            {packs.map((p) => (
              <div key={p.slug} className="card" style={{ padding: "1.5rem", borderRadius: 12 }}>
                <Link className="text-white" style={{ fontSize: "1.05rem", fontWeight: 700 }} href={`/prompts/packs/${p.slug}`}>
                  {p.title}
                </Link>
                <div className="text-muted" style={{ fontSize: "0.875rem", marginTop: 10 }}>
                  {p.description}
                </div>
                <div className="mt-4">
                  <Link className="btn btn--secondary btn--sm" href={`/prompts/packs/${p.slug}`}>
                    Open
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 card" style={{ borderRadius: 12, padding: "1.75rem" }}>
            <div className="label">Newsletter</div>
            <div className="text-white" style={{ fontSize: "1.25rem", fontWeight: 600 }}>
              Get new packs as they ship.
            </div>
            <p className="mt-3">Short weekly updates for legal teams.</p>
            <div style={{ maxWidth: 520 }}>
              <NewsletterCapture source="prompt-packs" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

