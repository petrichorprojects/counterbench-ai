import { MlebShortlistBuilder } from "@/components/MlebShortlistBuilder";
import { getMlebModelSummaries } from "@/lib/mleb";

export const metadata = {
  title: "MLEB Model Shortlist Builder"
};

export default function MlebShortlistPage() {
  const models = getMlebModelSummaries();

  return (
    <main>
      <section className="section" style={{ paddingTop: 108, paddingBottom: "4rem" }}>
        <div className="container">
          <div className="label">Free tool</div>
          <h1 className="max-w-900">Shortlist legal embedding models with real benchmark data.</h1>
          <p className="max-w-820 mt-4" style={{ fontSize: "1.125rem" }}>
            Convert MLEB benchmark results into a practical shortlist for retrieval and legal-research workflows.
          </p>

          <MlebShortlistBuilder models={models} />
        </div>
      </section>
    </main>
  );
}
