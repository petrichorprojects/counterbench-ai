import Link from "next/link";

export const metadata = {
  title: "Paralegal Teams for PI Firms | Counterbench.AI",
  description:
    "Dedicated paralegal pods for personal injury firms. Intake, records, med chronologies, and client communication — with AI built in. Live in 2-3 weeks. From $3,750/mo.",
  alternates: { canonical: "https://counterbench.ai/paralegals" },
  openGraph: {
    title: "Paralegal Teams for PI Firms | Counterbench.AI",
    description:
      "Dedicated paralegal pods for PI firms. Intake, records, med chronologies — AI-enabled, no hiring, no turnover. From $3,750/mo.",
    type: "website",
    url: "https://counterbench.ai/paralegals"
  }
};

const tiers = [
  {
    name: "Core",
    bestFor: "Solo practitioners and 2-4 attorney firms handling 20-40 cases/month",
    price: "$3,750",
    capacity: "Up to 80-120 hours/month",
    features: [
      "Dedicated paralegal pod",
      "Intake and client communication management",
      "Record requests and tracking",
      "Medical chronology preparation",
      "Case status reporting and updates",
      "Weekly quality assurance",
    ],
    replaces: "½–¾ of a full-time paralegal. Salary + benefits: $55K–65K. Recruiting timeline: 3–6 months.",
    highlighted: false,
  },
  {
    name: "Scale",
    bestFor: "4-10 attorney firms with high-volume caseloads",
    price: "$6,500",
    priceNote: "Custom pricing starting at",
    capacity: "120-160+ hours/month",
    features: [
      "Everything in Core",
      "Litigation document drafting and support",
      "Demand packet assembly and indexing",
      "Priority request handling and expedited turnaround",
      "Legal research and case analysis support",
      "Dedicated account manager",
      "Advanced reporting and analytics",
      "Custom workflow integration",
    ],
    replaces: "1–2 full-time paralegals. Annual costs: $110K–170K (salary + benefits + recruiting).",
    highlighted: true,
  },
];

const addOns = [
  { name: "Extra 20-hour block", price: "$850", description: "One-time add for additional capacity beyond your plan." },
  { name: "Rush / same-day request", price: "$250", description: "Expedited turnaround on urgent intake, records, or drafting." },
  { name: "Medical chronology (flat fee)", price: "$750", description: "Complete medical chronology assembly from records and imaging." },
  { name: "Demand package assembly (flat fee)", price: "$500", description: "Complete demand packet, indexed and formatted." },
  { name: "After-hours coverage", price: "$400/mo", description: "Evening and weekend support." },
];

const faqs = [
  {
    q: "What happens if I need more capacity mid-month?",
    a: "Add extra 20-hour blocks ($850 each) anytime. If you're consistently exceeding capacity, we'll upgrade you to the next tier and prorate the difference — no penalties.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Month-to-month only. No long-term contracts, no lock-ins. Cancel with 30 days' notice and we'll do a graceful transition.",
  },
  {
    q: "Who are the paralegals on my pod? Can I meet them?",
    a: "Your pod is managed by a core paralegal team overseen by a pod manager. We introduce them during onboarding and you'll have direct Slack/email access. Scale customers get a dedicated account manager.",
  },
  {
    q: "What case management systems do you work with?",
    a: "We integrate with most PI case management systems — Clio, CaseWare, Centerbase, MyCase, and others. We also work via email, Slack, Google Drive, and OneDrive. During discovery, we'll map your specific workflow.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. SOC 2 Type II certified, US-hosted, encrypted at rest and in transit. All team members sign NDAs. Compliance is baseline, not an add-on.",
  },
  {
    q: "How quickly can I go live?",
    a: "Typically 2-3 weeks from signed agreement to first active pod. We handle onboarding, system access, and workflow mapping during that window.",
  },
];

export default function ParalegalsPage() {
  return (
    <main>
      {/* Hero */}
      <section className="section" style={{ paddingTop: 120, paddingBottom: "4rem" }}>
        <div className="container">
          <div className="label" style={{ display: "inline-block" }}>For PI firms</div>
          <h1 className="max-w-900 mt-2">
            Stop drowning in intake and records requests. Start closing more cases.
          </h1>
          <p className="max-w-700 mt-3" style={{ fontSize: "1.1875rem", lineHeight: 1.6 }}>
            Dedicated paralegal pods handle your intake, records, med chronologies, and client communication — with AI already built into how they work. No hiring. No training. No turnover.
          </p>
          <div className="mt-4" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
            <Link className="btn btn--primary btn--arrow" href="/contact">
              Book a discovery call
            </Link>
            <a className="btn btn--secondary" href="#pricing">
              See pricing
            </a>
          </div>
          <div className="mt-4" style={{ borderTop: "1px solid var(--border)", paddingTop: "1.25rem" }}>
            <div className="grid grid--4 grid--gap-2" style={{ maxWidth: 900 }}>
              {[
                "Trusted by firms handling 50+ active cases",
                "US-hosted, SOC 2-certified",
                "Live in 2-3 weeks",
                "Cancel anytime",
              ].map((point) => (
                <div key={point} style={{ fontSize: "0.875rem", display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                  <span style={{ color: "var(--accent)", flexShrink: 0 }}>✓</span>
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What we handle */}
      <section className="section" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="container">
          <div className="label" style={{ display: "inline-block" }}>What we handle</div>
          <h2 className="mt-2" style={{ maxWidth: 560 }}>The work that quietly breaks your week.</h2>
          <div className="grid grid--3 grid--gap-2 mt-4">
            {[
              {
                title: "Intake + client comms",
                body: "Calls, follow-ups, pipeline hygiene, appointment scheduling. Nothing falls through.",
              },
              {
                title: "Records + demands",
                body: "Requesting, tracking, indexing, summaries, demand packet assembly, and consistent status reporting.",
              },
              {
                title: "Drafting + overflow",
                body: "Litigation support and drafting under your supervision — clean, structured, on template.",
              },
            ].map((s) => (
              <div key={s.title} style={{ borderLeft: "2px solid var(--accent)", paddingLeft: "1.25rem" }}>
                <div style={{ fontWeight: 600, fontSize: "1rem" }}>{s.title}</div>
                <p className="mt-2" style={{ fontSize: "0.9375rem", color: "var(--text-muted)" }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="container">
          <div className="grid grid--4 grid--gap-2">
            {[
              { label: "Avg response time", value: "4.2 hrs" },
              { label: "Coverage", value: "24/5" },
              { label: "Weekly QA accuracy", value: "98.2%" },
              { label: "Active pods deployed", value: "40+" },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: "2.5rem", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>{s.value}</div>
                <div className="mt-2" style={{ fontSize: "0.8125rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="section" id="pricing" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="container">
          <div className="label" style={{ display: "inline-block" }}>Pricing</div>
          <h2 className="mt-2">Straightforward. Month-to-month. No lock-ins.</h2>
          <div className="grid grid--2 grid--gap-2 mt-4">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                style={{
                  border: `1px solid ${tier.highlighted ? "var(--accent)" : "var(--border)"}`,
                  borderRadius: 12,
                  padding: "2rem",
                  background: tier.highlighted ? "var(--card-bg, var(--bg-alt))" : "transparent",
                }}
              >
                {tier.highlighted && (
                  <div className="label" style={{ display: "inline-block", marginBottom: "1rem" }}>Most popular</div>
                )}
                <div style={{ fontWeight: 700, fontSize: "1.125rem" }}>{tier.name}</div>
                <div style={{ marginTop: "0.5rem" }}>
                  {tier.priceNote && <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{tier.priceNote} </span>}
                  <span style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em" }}>{tier.price}</span>
                  <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>/mo</span>
                </div>
                <div className="mt-1" style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>{tier.capacity}</div>
                <div className="mt-1" style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{tier.bestFor}</div>
                <ul className="mt-3" style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {tier.features.map((f) => (
                    <li key={f} style={{ display: "flex", gap: "0.5rem", fontSize: "0.9375rem", alignItems: "flex-start" }}>
                      <span style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-3" style={{ fontSize: "0.8125rem", color: "var(--text-muted)", borderTop: "1px solid var(--border)", paddingTop: "0.75rem" }}>
                  Replaces: {tier.replaces}
                </div>
                <div className="mt-3">
                  <Link className="btn btn--primary btn--arrow" href="/contact">
                    Get started
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Add-ons */}
          <div className="mt-4">
            <div style={{ fontWeight: 600, fontSize: "0.9375rem", marginBottom: "1rem" }}>Add-ons</div>
            <div className="grid grid--3 grid--gap-2">
              {addOns.map((a) => (
                <div key={a.name} style={{ borderTop: "1px solid var(--border)", paddingTop: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{a.name}</span>
                    <span style={{ fontWeight: 700, fontSize: "0.9375rem", flexShrink: 0 }}>{a.price}</span>
                  </div>
                  <p className="mt-1" style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{a.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="container">
          <div className="label" style={{ display: "inline-block" }}>FAQ</div>
          <h2 className="mt-2" style={{ maxWidth: 480 }}>Common questions.</h2>
          <div className="mt-4" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: 720 }}>
            {faqs.map((faq) => (
              <div key={faq.q} style={{ borderTop: "1px solid var(--border)", paddingTop: "1.25rem" }}>
                <div style={{ fontWeight: 600, fontSize: "1rem" }}>{faq.q}</div>
                <p className="mt-2" style={{ fontSize: "0.9375rem", color: "var(--text-muted)", lineHeight: 1.65 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <div className="label" style={{ display: "inline-block" }}>Get started</div>
          <h2 className="max-w-600 mt-2" style={{ marginLeft: "auto", marginRight: "auto" }}>
            Ready to scale your firm?
          </h2>
          <p className="max-w-500 mt-3" style={{ marginLeft: "auto", marginRight: "auto", fontSize: "1.0625rem", color: "var(--text-muted)" }}>
            Book a 30-minute discovery call. We map your workflow, propose the right pod structure, and give you pricing and a launch timeline.
          </p>
          <div className="mt-4" style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link className="btn btn--primary btn--arrow" href="/contact">
              Book a discovery call
            </Link>
            <a className="btn btn--secondary" href="#pricing">
              See pricing
            </a>
          </div>
          <div className="mt-4" style={{ display: "flex", gap: "2rem", justifyContent: "center", flexWrap: "wrap", fontSize: "0.875rem", color: "var(--text-muted)" }}>
            {["No long-term contracts", "Cancel anytime", "Live in 2-3 weeks"].map((p) => (
              <span key={p} style={{ display: "flex", gap: "0.375rem", alignItems: "center" }}>
                <span style={{ color: "var(--accent)" }}>✓</span> {p}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
