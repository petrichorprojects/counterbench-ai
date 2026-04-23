import Link from "next/link";
import { HomeSuggest } from "@/components/HomeSuggest";
import { HeroSection } from "@/components/HeroSection";
import { NewsletterCapture } from "@/components/NewsletterCapture";

export const metadata = {
  title: "Counterbench.AI — The Right AI Tool for Your Legal Task",
  description:
    "Match legal tasks to verified AI tools in seconds. 275+ tools, 780 prompts, 24 guides, and curated skill packs for US litigation, discovery, and compliance teams.",
  openGraph: {
    title: "Counterbench.AI — The Right AI Tool for Your Legal Task",
    description:
      "Match legal tasks to verified AI tools in seconds. 275+ tools, 780 prompts, and curated guides for US legal professionals."
  }
};

export default function HomePage() {
  return (
    <main>
      <section
        className="section homeHero"
        id="hero"
        // Avoid vertical-centering the entire hero block; it causes below-the-fold clipping on common laptop viewports.
        style={{ paddingTop: 88, paddingBottom: "3.25rem" }}
      >
        <div className="container">
          <div style={{ textAlign: "center" }}>
            <div className="label" style={{ display: "inline-block" }}>
              Stop guessing. Start matching.
            </div>
            <h1 className="max-w-900 homeHero__title" style={{ marginLeft: "auto", marginRight: "auto" }}>
              The right AI tool for your legal task — <em>in seconds</em>.
            </h1>
          </div>

          <HomeSuggest align="center" variant="hero" />

          <p className="max-w-800 mt-3 homeHero__subhead" style={{ marginLeft: "auto", marginRight: "auto", textAlign: "center" }}>
            Legal teams that use AI to win don&apos;t browse five platforms — they match.
          </p>

          <div
            className="grid grid--3 grid--gap-2 mt-4"
            style={{ borderTop: "1px solid var(--border)", paddingTop: "1.25rem", maxWidth: 980, marginLeft: "auto", marginRight: "auto" }}
          >
            <div style={{ textAlign: "left" }}>
              <div className="text-white" style={{ fontSize: "0.9375rem", fontWeight: 600 }}>
                Verified listings
              </div>
              <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>Verified badge and last-checked dates where available.</p>
            </div>
            <div style={{ textAlign: "left" }}>
              <div className="text-white" style={{ fontSize: "0.9375rem", fontWeight: 600 }}>
                Comparison view
              </div>
              <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>Compare pricing, platform, tags, and status side by side.</p>
            </div>
            <div style={{ textAlign: "left" }}>
              <div className="text-white" style={{ fontSize: "0.9375rem", fontWeight: 600 }}>
                Collections and packs
              </div>
              <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>Curated collections, prompt packs, and skill templates.</p>
            </div>
          </div>

          <div className="mt-4" style={{ textAlign: "center" }}>
            <Link className="btn btn--secondary btn--arrow" href="/tools">
              Browse the full directory
            </Link>
          </div>
        </div>
      </section>

      <HeroSection />

      <section className="section" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "2rem", flexWrap: "wrap" }}>
            <div style={{ maxWidth: 600 }}>
              <div className="label" style={{ display: "inline-block" }}>For PI firms</div>
              <h2 className="mt-2" style={{ fontSize: "1.75rem", lineHeight: 1.2 }}>
                Need a team to run the tools?
              </h2>
              <p className="mt-3" style={{ fontSize: "1.0625rem", color: "var(--text-muted)" }}>
                Dedicated paralegal pods handle your intake, records, med chronologies, and client communication — with AI already built into how they work. Live in 2-3 weeks. No hiring. No turnover.
              </p>
            </div>
            <div style={{ flexShrink: 0 }}>
              <Link className="btn btn--primary btn--arrow" href="/paralegals">
                See paralegal teams
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <div className="label" style={{ display: "inline-block" }}>Stay current</div>
          <h2 className="max-w-700" style={{ marginLeft: "auto", marginRight: "auto" }}>
            New tools, changed tools, and prompt packs — weekly.
          </h2>
          <p className="max-w-600 mt-3" style={{ marginLeft: "auto", marginRight: "auto", fontSize: "1.0625rem" }}>
            One email per week. No fluff. Unsubscribe anytime.
          </p>
          <div className="mt-4" style={{ maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
            <NewsletterCapture source="homepage" />
          </div>
        </div>
      </section>
    </main>
  );
}
