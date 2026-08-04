import { ParalegalCapacityCalculator } from "@/components/ParalegalCapacityCalculator";

export const metadata = {
  title: "Paralegal Capacity Calculator",
  description:
    "Enter attorney count, paralegal count, active cases, and monthly intake to see whether your PI firm's paralegal function is over capacity, and by how much."
};

export default function ParalegalCapacityCalculatorPage() {
  return (
    <main>
      <section className="section" style={{ paddingTop: 108, paddingBottom: "4rem" }}>
        <div className="container">
          <div className="label">Free tool</div>
          <h1 className="max-w-900">Is your paralegal team over capacity?</h1>
          <p className="max-w-800 mt-4" style={{ fontSize: "1.125rem" }}>
            Enter a few numbers from your firm and see where paralegal capacity stands against an industry rule of
            thumb, then unlock the full gap report.
          </p>

          <ParalegalCapacityCalculator />
        </div>
      </section>
    </main>
  );
}
