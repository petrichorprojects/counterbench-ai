import Link from "next/link";
import { HomeSuggest } from "@/components/HomeSuggest";

export default function HomePage() {
  return (
    <main>
      <section
        className="section"
        id="hero"
        // Avoid vertical-centering the entire hero block; it causes below-the-fold clipping on common laptop viewports.
        style={{ paddingTop: 120, paddingBottom: "4.5rem" }}
      >
        <div className="container">
          <div className="label">Counterbench.AI</div>
          <h1 className="max-w-900">Describe what you need. Get a recommendation.</h1>
          <p className="max-w-800 mt-4" style={{ fontSize: "1.125rem" }}>
            Tell us the task. We’ll suggest the most relevant <span className="text-white">tools</span>, <span className="text-white">prompts</span>,
            and <span className="text-white">skills</span> from the library.
          </p>

          <HomeSuggest />

          <div className="grid grid--3 grid--gap-2 mt-5" style={{ borderTop: "1px solid var(--border)", paddingTop: "1.75rem" }}>
            <div>
              <div className="text-white" style={{ fontSize: "0.9375rem", fontWeight: 600 }}>
                Verified listings
              </div>
              <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>Verified badge and last-checked dates where available.</p>
            </div>
            <div>
              <div className="text-white" style={{ fontSize: "0.9375rem", fontWeight: 600 }}>
                Comparison view
              </div>
              <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>Compare pricing, platform, tags, and status side by side.</p>
            </div>
            <div>
              <div className="text-white" style={{ fontSize: "0.9375rem", fontWeight: 600 }}>
                Collections and packs
              </div>
              <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>Curated collections, prompt packs, and skill templates.</p>
            </div>
          </div>

          <div className="mt-5">
            <Link className="btn btn--secondary btn--arrow" href="/tools">
              Browse the full directory
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--alt section--border-t" id="shift">
        <div className="container">
          <div className="grid grid--2 grid--gap-3">
            <div>
              <div className="label">Designed for scanning</div>
              <h2 className="max-w-600">Fast, legible, and built for real work.</h2>
            </div>
            <div>
              <p className="lead max-w-600">
                Minimal JavaScript. Accessible keyboard navigation. Filters that intersect cleanly. Static generation wherever possible.
              </p>
              <p className="mt-4 max-w-600">
                Counterbench.AI keeps running costs low: content in Git, a prebuilt search index, and no database required.
              </p>
              <div className="mt-5">
                <Link className="btn btn--secondary btn--arrow" href="/advisory">
                  Talk to Advisory
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
