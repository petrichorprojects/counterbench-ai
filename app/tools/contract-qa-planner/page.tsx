import { ContractQaPlanner } from "@/components/ContractQaPlanner";
import { getContractQaBySection, getContractQaDefaults, getContractQaResources } from "@/lib/contract-qa-bot";

export const metadata = {
  title: "Contract QA Stack Planner"
};

export default function ContractQaPlannerPage() {
  const resources = getContractQaResources();
  const sections = getContractQaBySection(resources);
  const defaults = getContractQaDefaults();

  return (
    <main>
      <section className="section" style={{ paddingTop: 108, paddingBottom: "4rem" }}>
        <div className="container">
          <div className="label">Free tool</div>
          <h1 className="max-w-900">Plan your contract Q&A stack from real RAG defaults.</h1>
          <p className="max-w-820 mt-4" style={{ fontSize: "1.125rem" }}>
            Convert the Legal Contract Q&A Bot architecture into an implementation roadmap with tunable chunking, retrieval, and governance settings.
          </p>

          <ContractQaPlanner
            defaults={defaults}
            components={sections.components}
            dependencies={sections.dependencies}
            tasks={sections.tasks}
          />
        </div>
      </section>
    </main>
  );
}
