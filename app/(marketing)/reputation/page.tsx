import type { Metadata } from "next";
import { Playfair_Display, Work_Sans } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
  variable: "--rep-serif",
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--rep-sans",
  display: "swap",
});

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

const CALENDLY_URL = "https://calendly.com/phil-counterbench/30min";

const steps = [
  {
    n: "01",
    title: "We watch your profile",
    body: "Weekly monitoring of your Google listing. New review lands, we flag it within 24 hours.",
  },
  {
    n: "02",
    title: "We write the response",
    body: "Bar-compliant draft in your firm's voice. No confirmation of attorney-client relationship. No disclosure of client identity. No admission of facts.",
  },
  {
    n: "03",
    title: "We post it",
    body: "You never touch Google. Response is live within 24 hours of the review appearing.",
  },
];

export default function ReputationPage() {
  return (
    <main
      className={`${playfair.variable} ${workSans.variable}`}
      style={{ fontFamily: "var(--rep-sans, var(--sans))" }}
    >
      {/* ── HERO ─────────────────────────────────────────── */}
      <section
        aria-labelledby="hero-heading"
        style={{
          position: "relative",
          paddingTop: "8rem",
          paddingBottom: "6rem",
          overflow: "hidden",
        }}
      >
        {/* Atmospheric teal bleed — top-left desk lamp */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse 80% 55% at -5% -15%, rgba(170,185,209,0.09), transparent 60%)",
          }}
        />

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          {/* Label row */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.625rem",
              marginBottom: "1.75rem",
            }}
          >
            <span
              style={{
                width: 24,
                height: 1,
                background: "var(--teal)",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--teal)",
              }}
            >
              Google Review Management for PI Firms
            </span>
          </div>

          {/* H1 */}
          <h1
            id="hero-heading"
            style={{
              fontFamily: "var(--rep-serif, var(--serif))",
              fontSize: "clamp(2.75rem, 6vw, 5rem)",
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "var(--fg)",
              marginBottom: "1.5rem",
              maxWidth: "14ch",
            }}
          >
            You saw the gap.
            <br />
            We close it.
          </h1>

          {/* Subhead */}
          <p
            style={{
              fontSize: "1.125rem",
              lineHeight: 1.65,
              color: "var(--muted)",
              maxWidth: "52ch",
              marginBottom: "2rem",
            }}
          >
            Bar-compliant responses written in your firm&apos;s voice, posted within
            24&nbsp;hours. We monitor your profile weekly so nothing slips through.
          </p>

          {/* Trust signals — horizontal strip */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.375rem 1.75rem",
              marginBottom: "2.5rem",
            }}
          >
            {[
              "$175/month",
              "Posted within 24 hours",
              "Active weekly monitoring",
              "No contract",
            ].map((point) => (
              <span
                key={point}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.875rem",
                  color: "var(--fg)",
                }}
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 11 11"
                  fill="none"
                  aria-hidden
                  style={{ flexShrink: 0 }}
                >
                  <path
                    d="M1.5 5.5L4.5 8.5L9.5 2.5"
                    stroke="var(--teal)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {point}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              alignItems: "flex-start",
            }}
          >
            <a href={CALENDLY_URL} className="cb-primaryBtn">
              Book a 15-minute call →
            </a>
            <span style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>
              Not ready?{" "}
              <a href="mailto:phil@counterbench.ai" style={{ color: "var(--teal)" }}>
                Reply to the email you received.
              </a>
            </span>
          </div>
        </div>
      </section>

      {/* ── ORIGIN STORY ─────────────────────────────────── */}
      <section
        aria-labelledby="origin-heading"
        style={{ borderTop: "1px solid var(--border)", padding: "5rem 0" }}
      >
        <div className="container">
          <div style={{ maxWidth: 700 }}>
            {/* Decorative opening quote */}
            <div
              aria-hidden
              style={{
                fontFamily: "var(--rep-serif, var(--serif))",
                fontSize: "7rem",
                lineHeight: 0.55,
                color: "var(--teal)",
                opacity: 0.25,
                marginBottom: "1.75rem",
                fontWeight: 900,
                userSelect: "none",
                letterSpacing: "-0.05em",
              }}
            >
              &ldquo;
            </div>

            {/* Pull-quote — the hook line */}
            <p
              id="origin-heading"
              style={{
                fontFamily: "var(--rep-serif, var(--serif))",
                fontSize: "clamp(1.25rem, 2.75vw, 1.625rem)",
                fontWeight: 400,
                fontStyle: "italic",
                lineHeight: 1.55,
                color: "var(--fg)",
                marginBottom: "2rem",
              }}
            >
              I grew up watching two plaintiff&apos;s attorneys build their practices in Buffalo.
              Reputation wasn&apos;t abstract — it was the difference between getting the case or
              losing it to the firm across the street.
            </p>

            {/* Narrative body */}
            <div
              style={{
                fontSize: "1rem",
                lineHeight: 1.8,
                color: "var(--muted)",
              }}
            >
              <p style={{ marginBottom: "1rem" }}>
                When I came back during COVID, I started working with solo lawyers and small PI firms.
                The same problem kept coming up: Google reviews sitting unanswered for months. Not
                because the attorneys didn&apos;t care — because they were buried. And every unanswered
                review was quietly telling potential clients nobody was home.
              </p>
              <p>
                The big virtual services weren&apos;t touching it. Bar compliance made it complicated.
                So I built this.
              </p>
            </div>

            {/* Attribution */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginTop: "2rem",
              }}
            >
              <span
                style={{ width: 28, height: 1, background: "var(--border)", display: "block" }}
                aria-hidden
              />
              <span
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--muted)",
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                }}
              >
                Phil Rimmler, CounterbenchAI
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── STEPS ────────────────────────────────────────── */}
      <section
        aria-labelledby="service-heading"
        style={{ borderTop: "1px solid var(--border)", padding: "5rem 0" }}
      >
        <div className="container">
          {/* Section header */}
          <div style={{ marginBottom: "3.5rem" }}>
            <span
              style={{
                display: "block",
                fontSize: "0.6875rem",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--teal)",
                marginBottom: "0.875rem",
              }}
            >
              What you&apos;re getting
            </span>
            <h2
              id="service-heading"
              style={{
                fontFamily: "var(--rep-serif, var(--serif))",
                fontSize: "clamp(1.625rem, 3.5vw, 2.25rem)",
                fontWeight: 700,
                lineHeight: 1.2,
                letterSpacing: "-0.025em",
                color: "var(--fg)",
                maxWidth: "30ch",
              }}
            >
              Three steps. You&apos;re involved in none of them.
            </h2>
          </div>

          {/* Steps grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "2.5rem",
            }}
          >
            {steps.map((s) => (
              <div key={s.n}>
                {/* Ghost step number */}
                <div
                  style={{
                    fontFamily: "var(--rep-serif, var(--serif))",
                    fontSize: "4.5rem",
                    fontWeight: 900,
                    lineHeight: 1,
                    letterSpacing: "-0.04em",
                    color: "var(--fg)",
                    opacity: 0.07,
                    marginBottom: "1rem",
                    userSelect: "none",
                  }}
                  aria-hidden
                >
                  {s.n}
                </div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "1rem",
                    color: "var(--fg)",
                    marginBottom: "0.5rem",
                  }}
                >
                  {s.title}
                </div>
                <p
                  style={{
                    fontSize: "0.9375rem",
                    lineHeight: 1.7,
                    color: "var(--muted)",
                  }}
                >
                  {s.body}
                </p>
              </div>
            ))}
          </div>

          <p
            style={{
              marginTop: "3rem",
              fontSize: "0.9375rem",
              color: "var(--muted)",
              fontStyle: "italic",
            }}
          >
            You don&apos;t send us anything. We&apos;re already watching.
          </p>
        </div>
      </section>

      {/* ── BAR COMPLIANCE ───────────────────────────────── */}
      <section
        aria-labelledby="compliance-heading"
        style={{ borderTop: "1px solid var(--border)", padding: "5rem 0" }}
      >
        <div className="container">
          <div
            style={{
              borderLeft: "2px solid var(--teal)",
              paddingLeft: "2rem",
              maxWidth: 660,
            }}
          >
            <span
              id="compliance-heading"
              style={{
                display: "block",
                fontSize: "0.6875rem",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--teal)",
                marginBottom: "1.25rem",
              }}
            >
              Bar compliance
            </span>
            <p
              style={{
                fontFamily: "var(--rep-serif, var(--serif))",
                fontSize: "clamp(1.125rem, 2.25vw, 1.3125rem)",
                fontWeight: 400,
                fontStyle: "italic",
                lineHeight: 1.7,
                color: "var(--fg)",
                marginBottom: "1.25rem",
              }}
            >
              Every response is written to Rule 7.1 standards — no confirmation of
              attorney-client relationship, no disclosure of client identity, no admission of
              facts. Responses acknowledge. They don&apos;t argue.
            </p>
            <p
              style={{
                fontSize: "0.9375rem",
                lineHeight: 1.7,
                color: "var(--muted)",
              }}
            >
              I&apos;ve watched what happens when someone responds to a bad review the wrong way.
              A 1-star doesn&apos;t have to become a grievance. That&apos;s the line we hold on
              every response.
            </p>
          </div>
        </div>
      </section>

      {/* ── PRICING + CTA ────────────────────────────────── */}
      <section
        aria-labelledby="pricing-heading"
        style={{ borderTop: "1px solid var(--border)", padding: "6rem 0" }}
      >
        <div className="container" style={{ maxWidth: 560 }}>
          {/* Price */}
          <div
            id="pricing-heading"
            style={{
              fontFamily: "var(--rep-serif, var(--serif))",
              fontSize: "clamp(3.5rem, 9vw, 5.5rem)",
              fontWeight: 900,
              letterSpacing: "-0.045em",
              lineHeight: 0.95,
              color: "var(--fg)",
              marginBottom: "0.5rem",
            }}
          >
            $175
            <span
              style={{
                fontSize: "1.125rem",
                fontWeight: 400,
                color: "var(--muted)",
                letterSpacing: "-0.01em",
                fontFamily: "var(--rep-sans, var(--sans))",
                marginLeft: "0.4rem",
              }}
            >
              / month
            </span>
          </div>

          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--muted)",
              marginBottom: "2rem",
              letterSpacing: "0.02em",
            }}
          >
            No contract. Cancel anytime.
          </p>

          <p
            style={{
              fontSize: "1.0625rem",
              lineHeight: 1.65,
              color: "var(--fg)",
              marginBottom: "0.625rem",
            }}
          >
            Most firms are live within a week. The call is 15 minutes.
          </p>

          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--muted)",
              marginBottom: "2.5rem",
            }}
          >
            Serving PI firms in MA, NY, CT, and PA.
          </p>

          {/* CTAs */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              alignItems: "flex-start",
            }}
          >
            <a href={CALENDLY_URL} className="cb-primaryBtn">
              Book a 15-minute call →
            </a>
            <span style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>
              Or{" "}
              <a href="mailto:phil@counterbench.ai" style={{ color: "var(--teal)" }}>
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
