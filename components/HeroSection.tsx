import { FeatureGrid } from "@/components/FeatureGrid";
import { MetricsStrip } from "@/components/MetricsStrip";
import { PrimaryButton } from "@/components/PrimaryButton";

export function HeroSection() {
  return (
    <section className="section cb-piHero" aria-labelledby="cb-piHero-title">
      <div className="container">
        <div className="cb-piHero__grid">
          <div className="cb-piHero__left">
            <div className="cb-eyebrow">FOR LEGAL PROFESSIONALS</div>
            <h2 id="cb-piHero-title" className="cb-piHero__title">
              The AI toolkit built
              <br />
              for <span className="cb-nowrap">legal work.</span>
            </h2>
            <p className="cb-piHero__body">
              Curated AI tools, ready-to-use prompts, workflow skills, and playbooks — vetted for legal professionals who need to work faster without guessing which tools actually work.
            </p>

            <div className="cb-piHero__ctaRow">
              <PrimaryButton href="/search">Explore Legal AI Tools →</PrimaryButton>
            </div>
            <p className="cb-piHero__trust" aria-label="Trust statement">
              Every tool reviewed. Every prompt tested. Built by legal professionals, for legal professionals.
            </p>
          </div>

          <div className="cb-piHero__right" aria-label="Feature proof">
            <FeatureGrid
              features={[
                {
                  title: "AI TOOL DIRECTORY",
                  description: "Find the right legal AI tool for your workflow.",
                  meta: "Covers: document review, research, drafting, discovery, billing."
                },
                {
                  title: "PROMPT LIBRARY",
                  description: "Ready-to-use prompts built for legal tasks.",
                  meta: "For: contract analysis, case research, deposition prep, motions."
                },
                {
                  title: "WORKFLOW SKILLS",
                  description: "Step-by-step AI workflows for common legal tasks.",
                  meta: "Skills: intake, discovery management, brief drafting, timekeeping."
                },
                {
                  title: "PLAYBOOKS & GUIDES",
                  description: "Practical guides to adopting AI in your practice.",
                  meta: "Topics: getting started, ethical use, client communication, ROI."
                }
              ]}
            />
          </div>
        </div>
      </div>

      <MetricsStrip
        metrics={[
          { value: "275+", label: "legal AI tools reviewed" },
          { value: "800+", label: "ready-to-use prompts" },
          { value: "30+", label: "workflow skills" },
          { value: "10+", label: "practice playbooks" }
        ]}
      />
    </section>
  );
}
