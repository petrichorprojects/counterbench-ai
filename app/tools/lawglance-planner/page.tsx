import { LawGlancePlanner } from "@/components/LawGlancePlanner";
import { getLawglanceBySection, getLawglanceResources } from "@/lib/lawglance";

export const metadata = {
  title: "LawGlance Rollout Planner"
};

export default function LawglancePlannerPage() {
  const resources = getLawglanceResources();
  const sections = getLawglanceBySection(resources);

  return (
    <main>
      <section className="section" style={{ paddingTop: 108, paddingBottom: "4rem" }}>
        <div className="container">
          <div className="label">Free tool</div>
          <h1 className="max-w-900">Turn LawGlance into a practical rollout plan.</h1>
          <p className="max-w-820 mt-4" style={{ fontSize: "1.125rem" }}>
            Choose your audience, timeline, and capabilities. Get a structured implementation plan anchored to LawGlance’s published coverage, stack, and roadmap.
          </p>

          <LawGlancePlanner
            coverage={sections.coverage}
            stack={sections.stack}
            roadmap={sections.roadmap}
            developer={sections.developer}
          />
        </div>
      </section>
    </main>
  );
}
