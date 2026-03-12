import { LegalDataSourceFinder } from "@/components/LegalDataSourceFinder";
import { getFinderOptionSets } from "@/lib/legal-data-core";
import { getAwesomeLegalDataResources } from "@/lib/legal-data";

export const metadata = {
  title: "US Legal Data Source Finder",
  description:
    "Build a matter-specific US legal data source stack by task and source type. Filter by jurisdiction, API readiness, and access level. Export in one click.",
  openGraph: {
    title: "US Legal Data Source Finder | Counterbench.AI",
    description:
      "Build a defensible US legal data source pack by task, source type, and API readiness. Free tool for legal AI teams."
  }
};

export default function SourceFinderPage() {
  const sources = getAwesomeLegalDataResources();
  const { jurisdictions, sourceTypes } = getFinderOptionSets(sources);

  return (
    <main>
      <section className="section" style={{ paddingTop: 108, paddingBottom: "4rem" }}>
        <div className="container">
          <div className="label">Free tool</div>
          <h1 className="max-w-900">Find defensible US legal data sources fast.</h1>
          <p className="max-w-800 mt-4" style={{ fontSize: "1.125rem" }}>
            Build a US matter-specific source stack by task and source type. Export in one click to feed playbooks, prompts, and QA workflows.
          </p>

          <LegalDataSourceFinder sources={sources} jurisdictions={jurisdictions} sourceTypes={sourceTypes} />
        </div>
      </section>
    </main>
  );
}
