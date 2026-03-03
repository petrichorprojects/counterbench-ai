import Link from "next/link";
import { HomeSuggest } from "@/components/HomeSuggest";
import { HeroSection } from "@/components/HeroSection";

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
    </main>
  );
}
