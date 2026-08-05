import type { Metadata } from "next";
import { LawFirmStackCostCalculator } from "@/components/LawFirmStackCostCalculator";
import { STACK_COST_FAQ } from "@/lib/law-firm-stack-cost";
import { absoluteUrl, faqPageJsonLd } from "@/lib/seo";

const TITLE = "Law firm tech stack cost calculator";
const DESCRIPTION =
  "Calculate the true annual cost of your law firm's software stack, including licenses, setup, maintenance, attorney time, and disruptions. Free, instant, and no signup required.";
const URL = absoluteUrl("/tools/law-firm-stack-cost-calculator");

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    title: `${TITLE} | Counterbench.AI`,
    description: DESCRIPTION,
    url: URL,
    type: "website",
  },
};

function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: TITLE,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: DESCRIPTION,
    url: URL,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    isAccessibleForFree: true,
  };
}

export default function LawFirmStackCostCalculatorPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd(STACK_COST_FAQ)) }}
      />

      <section className="section" style={{ paddingTop: 108, paddingBottom: "4rem" }}>
        <div className="container">
          <div className="label">Free tool</div>
          <h1 className="max-w-900">What is your law firm tech stack actually costing?</h1>
          <p className="max-w-820 mt-4" style={{ fontSize: "1.125rem" }}>
            Add the licenses, setup time, maintenance, and attorney hours. See the true annual cost of running the stack
            yourself, plus the clearest next move: keep it, simplify it, replace the weak link, or hand off the operation.
          </p>

          <div className="scc-proof-row mt-5" aria-label="Tool details">
            <span>Free</span>
            <span>About two minutes</span>
            <span>No client data</span>
            <span>Result shown before email</span>
          </div>

          <LawFirmStackCostCalculator />
        </div>
      </section>

      <section className="section section--alt section--border-t" style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
        <div className="container">
          <div className="grid grid--2 grid--gap-3">
            <div>
              <div className="label">How the calculation works</div>
              <h2 className="max-w-700">The invoice is only the visible cost</h2>
              <p className="max-w-700 mt-4">
                Software spend is annualized. The calculator then values build time, routine maintenance, and time lost
                to disruptions using the hourly value you enter. Setup appears in year one. Maintenance, licenses, and
                disruptions repeat each year.
              </p>
              <p className="max-w-700">
                The recommendation follows the dominant cost pattern. It doesn&apos;t assume that buying, building, or
                outsourcing is always the right answer.
              </p>
            </div>
            <div className="card card--no-hover">
              <div className="label">Formula</div>
              <dl className="scc-formula mt-4">
                <div>
                  <dt>Annual licenses</dt>
                  <dd>Monthly software spend × 12</dd>
                </div>
                <div>
                  <dt>Setup labor</dt>
                  <dd>Build and migration hours × hourly value</dd>
                </div>
                <div>
                  <dt>Maintenance labor</dt>
                  <dd>Monthly maintenance hours × 12 × hourly value</dd>
                </div>
                <div>
                  <dt>Disruption cost</dt>
                  <dd>Quarterly disruptions × 4 × team hours lost × hourly value</dd>
                </div>
              </dl>
            </div>
          </div>

          <h2 className="mt-6">Questions</h2>
          <dl className="max-w-820 mt-4">
            {STACK_COST_FAQ.map((faq) => (
              <div key={faq.q} style={{ marginBottom: "1.25rem" }}>
                <dt>
                  <strong>{faq.q}</strong>
                </dt>
                <dd className="text-muted" style={{ margin: "0.35rem 0 0" }}>
                  {faq.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </main>
  );
}
