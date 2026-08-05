import { IntakeLeakCalculator } from "@/components/IntakeLeakCalculator";

export const metadata = {
  title: "Intake Leak Calculator",
  description:
    "Enter your monthly intake call volume, cost per call, and the share that never convert to see the dollars and paralegal hours your PI firm burns on tire-kicker calls each month."
};

export default function IntakeLeakCalculatorPage() {
  return (
    <main>
      <section className="section" style={{ paddingTop: 108, paddingBottom: "4rem" }}>
        <div className="container">
          <div className="label">Free tool</div>
          <h1 className="max-w-900">How much is your intake leaking?</h1>
          <p className="max-w-800 mt-4" style={{ fontSize: "1.125rem" }}>
            Most small firms treat intake as a phone problem and never count what the leak costs. Enter a few numbers
            and see the dollars and paralegal hours you lose each month to calls that were never going to hire, then
            unlock the full report.
          </p>

          <IntakeLeakCalculator />
        </div>
      </section>
    </main>
  );
}
