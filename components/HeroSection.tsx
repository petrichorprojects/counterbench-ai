import { FeatureGrid } from "@/components/FeatureGrid";
import { MetricsStrip } from "@/components/MetricsStrip";
import { PrimaryButton } from "@/components/PrimaryButton";

export function HeroSection() {
  return (
    <section className="section cb-piHero" aria-labelledby="cb-piHero-title">
      <div className="container">
        <div className="cb-piHero__grid">
          <div className="cb-piHero__left">
            <div className="cb-eyebrow">FOR PLAINTIFF ATTORNEYS</div>
            <h2 id="cb-piHero-title" className="cb-piHero__title">
              Find the defense strategy
              <br />
              before they <span className="cb-nowrap">file it.</span>
            </h2>
            <p className="cb-piHero__body">
              Counterbench reveals how insurers, defense firms, and expert witnesses behave in real litigation.
            </p>

            <div className="cb-piHero__ctaRow">
              <PrimaryButton href="/search">Search Litigation Intelligence →</PrimaryButton>
            </div>
            <p className="cb-piHero__trust" aria-label="Trust statement">
              Built for litigation workflows. Evidence-first results. Fast enough to use between calls.
            </p>
          </div>

          <div className="cb-piHero__right" aria-label="Feature proof">
            <FeatureGrid
              features={[
                {
                  title: "INSURER INTELLIGENCE",
                  description: "Track how specific insurance carriers defend injury claims.",
                  meta: "Signals: recurring defenses, settlement posture, delay patterns."
                },
                {
                  title: "EXPERT HISTORY",
                  description: "Review expert witness testimony across prior cases.",
                  meta: "Signals: prior themes, impeachment flags, credibility notes."
                },
                {
                  title: "DEFENSE PATTERNS",
                  description: "See which arguments defense firms rely on most.",
                  meta: "Signals: motion language, causation angles, damages attacks."
                },
                {
                  title: "CASE RESEARCH",
                  description: "Search litigation records in seconds.",
                  meta: "Find: similar fact patterns, motions, experts, outcomes."
                }
              ]}
            />
          </div>
        </div>
      </div>

      <MetricsStrip
        metrics={[
          { value: "48,000+", label: "litigation records indexed" },
          { value: "1,200", label: "defense firms tracked" },
          { value: "17,000", label: "expert witnesses analyzed" },
          { value: "200ms", label: "average search speed" }
        ]}
      />
    </section>
  );
}
