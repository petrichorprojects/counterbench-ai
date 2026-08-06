import type { Metadata } from "next";
import { IntakeLeakCalculator } from "@/components/IntakeLeakCalculator";
import { absoluteUrl, faqPageJsonLd } from "@/lib/seo";
import styles from "./intake-leak-calculator.module.css";

const TITLE = "Google LSA Intake Leak Calculator";
const DESCRIPTION =
  "Calculate the Google LSA spend and paralegal hours your law firm loses to calls that never become serious inquiries. Free, instant, and no signup.";
const URL = absoluteUrl("/tools/intake-leak-calculator");

const FAQ = [
  {
    q: "What does the Intake Leak Calculator measure?",
    a: "It estimates the monthly Google LSA spend attached to non-serious calls, then adds the loaded paralegal cost of handling those calls. It also shows the staff hours absorbed and the annualized total.",
  },
  {
    q: "What counts as a serious inquiry?",
    a: "Use your firm's own definition: a caller with a matter your firm would genuinely consider working. The calculator does not predict signed clients or case value.",
  },
  {
    q: "Why include both automation and a paralegal team?",
    a: "Automation can screen obvious mismatches quickly. A trained paralegal is better suited to ambiguous, urgent, or poorly explained inquiries where judgment changes the outcome.",
  },
];

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

export default function IntakeLeakCalculatorPage() {
  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd(FAQ)) }}
      />

      <section className={styles.hero}>
        <div className={styles.heroKicker}>
          <span>Intake ops</span>
          <span>Free firm tool</span>
        </div>
        <h1>Your phones are busy.<br /><em>Your pipeline might not be.</em></h1>
        <div className={styles.heroBottom}>
          <p>Put a dollar and time cost on Google LSA calls that never become serious inquiries.</p>
          <div className={styles.caseNote} aria-hidden="true">
            <span>Monthly intake review</span>
            <strong>LSA / TRIAGE</strong>
          </div>
        </div>
      </section>

      <IntakeLeakCalculator />

      <section className={styles.methodNote}>
        <strong>What this estimate means</strong>
        <p>
          “Non-serious” is defined by the rate you enter. The calculator does not predict signed cases or promise
          recoverable spend. It shows where your current media budget and staff capacity are going so you can decide
          what to screen, what to staff, and what to keep human.
        </p>
      </section>

      <section className={styles.faqSection} aria-labelledby="intake-faq-heading">
        <p className={styles.overline}>Method notes</p>
        <h2 id="intake-faq-heading">Questions firms ask before changing intake</h2>
        <dl>
          {FAQ.map((item) => (
            <div key={item.q}>
              <dt>{item.q}</dt>
              <dd>{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
