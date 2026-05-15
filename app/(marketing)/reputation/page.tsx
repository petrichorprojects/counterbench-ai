import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Google Review Responses for PI Firms | CounterbenchAI",
  description:
    "Bar-compliant Google review responses written and posted within 24 hours. Active weekly monitoring. $175/month. No contract.",
  alternates: { canonical: "https://counterbench.ai/reputation" },
  openGraph: {
    title: "Google Review Responses for PI Firms | CounterbenchAI",
    description:
      "Bar-compliant review responses for PI firms. Written in your voice, posted within 24 hours. $175/month. No contract.",
    type: "website",
    url: "https://counterbench.ai/reputation",
  },
};

const steps = [
  {
    number: "01",
    title: "We watch your profile",
    body: "Weekly monitoring of your Google listing. New review lands, we flag it within 24 hours.",
  },
  {
    number: "02",
    title: "We write the response",
    body: "Bar-compliant draft in your firm's voice. No confirmation of attorney-client relationship. No disclosure of client identity. No admission of facts.",
  },
  {
    number: "03",
    title: "We post it",
    body: "You never touch Google. Response is live within 24 hours of the review appearing.",
  },
];

const CALENDLY_URL = "https://calendly.com/phil-counterbench/30min";

export default function ReputationPage() {
  return (
    <main>
      {/* Hero */}
      <section
        className="section"
        style={{ paddingTop: "7.5rem", paddingBottom: "4rem" }}
        aria-labelledby="hero-heading"
      >
        <div className="container">
          <div className="label" style={{ display: "inline-block" }}>
            Google Review Management for PI Firms
          </div>
          <h1 id="hero-heading" className="max-w-900 mt-2">
            You saw the gap.<br />We close it.
          </h1>
          <p className="max-w-700 mt-3" style={{ fontSize: "1.1875rem", lineHeight: 1.6 }}>
            Bar-compliant responses written in your firm&apos;s voice, posted within 24 hours.
            We monitor your profile weekly so nothing slips through.
          </p>
          <div className="mt-4" style={{ borderTop: "1px solid var(--border)", paddingTop: "1.25rem" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "0.5rem 2rem",
                maxWidth: 440,
              }}
            >
              {["$175/month", "Posted within 24 hours", "Active weekly monitoring", "No contract"].map(
                (point) => (
                  <div
                    key={point}
                    style={{ fontSize: "0.9375rem", display: "flex", gap: "0.5rem", alignItems: "flex-start" }}
                  >
                    <span style={{ color: "var(--teal)", flexShrink: 0 }}>✓</span>
                    <span>{point}</span>
                  </div>
                )
              )}
            </div>
            <div className="mt-4" style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "flex-start" }}>
              <a href={CALENDLY_URL} className="cb-primaryBtn">
                Book a 15-minute call →
              </a>
              <span style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
                Not ready to call?{" "}
                <a
                  href="mailto:phil@counterbench.ai"
                  style={{ color: "var(--teal)" }}
                >
                  Reply to the email you received.
                </a>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Origin Story */}
      <section
        className="section"
        style={{ borderTop: "1px solid var(--border)" }}
        aria-labelledby="origin-heading"
      >
        <div className="container">
          <div id="origin-heading" className="label" style={{ display: "inline-block" }}>
            Why this exists
          </div>
          <div style={{ maxWidth: 680, marginTop: "1.5rem" }}>
            <p style={{ fontSize: "1.0625rem", lineHeight: 1.75, marginBottom: "1rem" }}>
              I grew up watching two plaintiff&apos;s attorneys build their practices in Buffalo.
              Reputation wasn&apos;t abstract — it was the difference between getting the case or
              losing it to the firm across the street.
            </p>
            <p style={{ fontSize: "1.0625rem", lineHeight: 1.75, marginBottom: "1rem" }}>
              When I came back during COVID, I started working with solo lawyers and small PI firms.
              The same problem kept coming up: Google reviews sitting unanswered for months. Not
              because the attorneys didn&apos;t care — because they were buried. And every unanswered
              review was quietly telling potential clients nobody was home.
            </p>
            <p style={{ fontSize: "1.0625rem", lineHeight: 1.75, marginBottom: "1.5rem" }}>
              The big virtual services weren&apos;t touching it. Bar compliance made it complicated.
              So I built this.
            </p>
            <p style={{ fontSize: "0.9375rem", color: "var(--muted)" }}>
              — Phil Rimmler, CounterbenchAI
            </p>
          </div>
        </div>
      </section>

      {/* What you're getting */}
      <section
        className="section"
        style={{ borderTop: "1px solid var(--border)" }}
        aria-labelledby="service-heading"
      >
        <div className="container">
          <div id="service-heading" className="label" style={{ display: "inline-block" }}>
            What you&apos;re getting
          </div>
          <h2 className="mt-2" style={{ maxWidth: 480 }}>
            Three steps. You&apos;re involved in none of them.
          </h2>
          <div className="grid grid--3 grid--gap-2 mt-4">
            {steps.map((s) => (
              <div
                key={s.number}
                style={{ borderLeft: "2px solid var(--border)", paddingLeft: "1.25rem" }}
              >
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--muted)",
                    letterSpacing: "0.08em",
                    marginBottom: "0.5rem",
                  }}
                >
                  {s.number}
                </div>
                <div style={{ fontWeight: 600, fontSize: "1rem" }}>{s.title}</div>
                <p className="mt-2" style={{ fontSize: "0.9375rem", color: "var(--muted)" }}>
                  {s.body}
                </p>
              </div>
            ))}
          </div>
          <p
            className="mt-4"
            style={{ fontSize: "0.9375rem", color: "var(--muted)", fontStyle: "italic" }}
          >
            You don&apos;t send us anything. We&apos;re already watching.
          </p>
        </div>
      </section>

      {/* Bar Compliance */}
      <section
        className="section"
        style={{ borderTop: "1px solid var(--border)" }}
        aria-labelledby="compliance-heading"
      >
        <div className="container">
          <div
            style={{
              background: "var(--bg3)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "2rem 2.5rem",
              maxWidth: 720,
            }}
          >
            <div
              id="compliance-heading"
              className="label"
              style={{ display: "inline-block", marginBottom: "1rem" }}
            >
              Bar compliance
            </div>
            <p style={{ fontSize: "1.0625rem", lineHeight: 1.7, marginBottom: "1rem" }}>
              Every response is written to Rule 7.1 standards — no confirmation of
              attorney-client relationship, no disclosure of client identity, no admission of
              facts. Responses acknowledge. They don&apos;t argue.
            </p>
            <p style={{ fontSize: "0.9375rem", color: "var(--muted)", lineHeight: 1.65 }}>
              I&apos;ve watched what happens when someone responds to a bad review the wrong way.
              A 1-star doesn&apos;t have to become a grievance. That&apos;s the line we hold on
              every response.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing + CTA */}
      <section
        className="section"
        style={{ borderTop: "1px solid var(--border)" }}
        aria-labelledby="pricing-heading"
      >
        <div className="container" style={{ maxWidth: 720 }}>
          <div
            id="pricing-heading"
            style={{
              fontFamily: "var(--serif)",
              fontSize: "2.5rem",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1,
              marginBottom: "0.5rem",
            }}
          >
            $175
            <span style={{ fontSize: "1rem", fontWeight: 400, color: "var(--muted)", fontFamily: "inherit" }}>
              /month
            </span>
          </div>
          <div style={{ fontSize: "0.9375rem", color: "var(--muted)", marginBottom: "1.5rem" }}>
            No contract. Cancel anytime.
          </div>
          <p style={{ fontSize: "1.0625rem", lineHeight: 1.65, marginBottom: "0.75rem" }}>
            Most firms are live within a week. The call is 15 minutes.
          </p>
          <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: "1.5rem" }}>
            Serving PI firms in MA, NY, CT, and PA.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "flex-start" }}>
            <a href={CALENDLY_URL} className="cb-primaryBtn">
              Book a 15-minute call →
            </a>
            <span style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
              Or{" "}
              <a
                href="mailto:phil@counterbench.ai"
                style={{ color: "var(--teal)" }}
              >
                reply to the email you received
              </a>
              .
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
