"use client";

import Link from "next/link";
import { useState } from "react";
import { WORKSHOP_TIERS, formatPrice } from "@/lib/stripe/workshop-products";
import { WORKSHOP_CITIES } from "@/lib/stripe/workshop-cities";
import { WorkshopRegistrationForm } from "@/components/WorkshopRegistrationForm";

const event = WORKSHOP_CITIES.online;

const modules = [
  { num: "01", title: "AI Fundamentals", duration: "90 min", description: "What AI actually is — and isn't — for legal work. No math, no jargon. Real intuition for evaluating AI claims." },
  { num: "02", title: "Prompting That Works", duration: "90 min", description: "From vague questions to reliable, repeatable outputs. Leave with 5+ tested prompts for your practice." },
  { num: "03", title: "AI for Your Workflow", duration: "90 min", description: "Map AI to the work you actually do. Intake, document review, drafting, client communication." },
  { num: "04", title: "Agents & Automation", duration: "60 min", description: "What's coming next — and what's hype. Evaluate vendor claims with a clear framework." },
  { num: "05", title: "Action Plan", duration: "30 min", description: "Leave with a written 90-day action plan tailored to your role and firm size." },
];

const faqs = [
  {
    q: "What's included in the ticket price?",
    a: "Full-day live workshop access (6 hours via Zoom), digital workshop materials, prompt templates, a certificate of completion, and recording access. Premium tickets include a 1-on-1 follow-up session.",
  },
  {
    q: "Who is this for?",
    a: "Legal professionals at any level — paralegals, associates, office managers, and partners. Whether you've never touched an AI tool or you've been experimenting but want structure, this workshop meets you where you are.",
  },
  {
    q: "Do I need technical experience?",
    a: "No. The workshop is designed for practitioners, not technologists. We start from the fundamentals and build up. If you can use email, you can follow this workshop.",
  },
  {
    q: "How does the online format work?",
    a: "Live on Zoom with interactive exercises, breakout rooms, and real-time Q&A. This is not a webinar — you'll be doing hands-on work throughout. Camera on is encouraged but not required.",
  },
  {
    q: "Will there be a recording?",
    a: "Yes. Standard tickets get 30-day recording access. Premium tickets get 90 days. But the live experience is where the value is — the exercises and Q&A don't translate the same on replay.",
  },
  {
    q: "Is this CLE accredited?",
    a: "CLE accreditation is in process. We'll update this page and notify registered attendees once approved. The curriculum is designed to meet CLE requirements for technology education.",
  },
  {
    q: "What if I can't attend after purchasing?",
    a: "Tickets are transferable to a colleague at no charge. If you need a refund, contact us at least 14 days before the event for a full refund, or 7 days for a 50% refund.",
  },
];

const testimonials = [
  {
    quote: "I went from being intimidated by AI to having a clear plan for my practice. The prompting module alone was worth the ticket.",
    name: "Sarah M.",
    role: "Paralegal",
  },
  {
    quote: "Finally, an AI workshop that speaks our language. No Silicon Valley hype — just practical skills I could use the next day.",
    name: "David K.",
    role: "Managing Partner",
  },
  {
    quote: "We sent three team members. Within a week, we had automated our intake triage and cut document review time by 40%.",
    name: "Rachel T.",
    role: "Office Manager",
  },
];

export default function WorkshopPage() {
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  async function handleCheckout(tierKey: string) {
    setCheckoutLoading(tierKey);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierKey, earlyBird: true, city: "online" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Checkout unavailable — Stripe is not configured yet. Check back soon.");
        setCheckoutLoading(null);
      }
    } catch {
      alert("Something went wrong. Please try again.");
      setCheckoutLoading(null);
    }
  }

  return (
    <main>
      {/* Hero */}
      <section className="section" style={{ paddingTop: 140, paddingBottom: "5rem" }}>
        <div className="container">
          <div className="label anim-hero anim-hero--1">Live Online Workshop</div>
          <h1 className="max-w-900 anim-hero anim-hero--2">
            AI Is Coming For Legal —
            <br />
            <em>Learn It Before It Learns You.</em>
          </h1>
          <p className="max-w-700 mt-4 anim-hero anim-hero--3" style={{ fontSize: "1.125rem" }}>
            A 6-hour, hands-on AI workshop built for legal professionals. No jargon. No vendor pitches.
            Just the skills your firm needs to adopt AI — starting the day after.
          </p>

          {/* Event details */}
          <div className="mt-5 anim-hero anim-hero--4" style={{ padding: "1.5rem 2rem", borderRadius: 16, background: "var(--card-bg, rgba(255,255,255,0.06))", border: "1px solid var(--border)" }}>
            <div className="ws-event-details">
              <div>
                <div className="text-white" style={{ fontSize: "0.9375rem", fontWeight: 600 }}>Format</div>
                <p style={{ fontSize: "0.875rem", marginTop: "0.25rem", marginBottom: 0 }}>{event.venue}</p>
              </div>
              <div>
                <div className="text-white" style={{ fontSize: "0.9375rem", fontWeight: 600 }}>Date</div>
                <p style={{ fontSize: "0.875rem", marginTop: "0.25rem", marginBottom: 0 }}>{event.date}</p>
              </div>
              <div>
                <div className="text-white" style={{ fontSize: "0.9375rem", fontWeight: 600 }}>Time</div>
                <p style={{ fontSize: "0.875rem", marginTop: "0.25rem", marginBottom: 0 }}>9 AM – 4 PM ET (includes breaks)</p>
              </div>
              <div>
                <div className="text-white" style={{ fontSize: "0.9375rem", fontWeight: 600 }}>Seats</div>
                <p style={{ fontSize: "0.875rem", marginTop: "0.25rem", marginBottom: 0 }}>Limited to {event.capacity} attendees</p>
              </div>
            </div>
          </div>

          {/* Early bird banner */}
          <div className="ws-earlybird mt-4">
            <span className="ws-earlybird__badge">Early Bird</span>
            <span>$100 off — first 10 registrations per tier. Lock in the lowest price before seats fill.</span>
          </div>

          <div className="mt-5">
            <a className="btn btn--primary btn--arrow" href="#pricing">
              Reserve Your Seat
            </a>
          </div>
        </div>
      </section>

      {/* Interest capture — for visitors not ready to buy */}
      <section className="section section--alt section--border-t section--border-b" id="interest">
        <div className="container" style={{ maxWidth: 640 }}>
          <div className="label">Stay in the loop</div>
          <h2 className="max-w-600">Not ready to register yet?</h2>
          <p className="max-w-600 mt-3">
            Drop your info and we'll notify you when new dates are confirmed. No spam — one email when seats open.
          </p>
          <div className="mt-5">
            <WorkshopRegistrationForm action="/api/newsletter/subscribe" />
          </div>
        </div>
      </section>

      {/* Curriculum overview */}
      <section className="section section--border-t section--border-b" id="curriculum">
        <div className="container">
          <div className="label">Curriculum</div>
          <h2 className="max-w-700">5 modules. 6 hours. Everything your team needs.</h2>
          <p className="max-w-600 mt-3">
            Each module builds on the last. Every one ends with a concrete takeaway your team keeps.
          </p>

          <div className="engagement-bar mt-6">
            {modules.map((m) => (
              <div className="engagement-phase" key={m.num}>
                <div className="engagement-phase-num">Module {m.num}</div>
                <div className="engagement-phase-title">{m.title}</div>
                <div className="engagement-phase-weeks">{m.duration}</div>
                <p style={{ fontSize: "0.875rem", marginBottom: 0 }}>{m.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-5" style={{ textAlign: "center" }}>
            <Link className="btn btn--secondary btn--arrow" href="/workshop/curriculum">
              View Full Curriculum
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="section section--border-b" id="pricing">
        <div className="container">
          <div className="label">Pricing</div>
          <h2 className="max-w-700">Choose your tier.</h2>
          <p className="max-w-600 mt-3">
            Every ticket includes full workshop access, materials, and a certificate. Premium adds follow-up support and extended recording access.
          </p>

          <div className="ws-pricing-grid mt-6">
            {WORKSHOP_TIERS.map((tier) => (
              <div
                key={tier.key}
                className={`card ws-pricing-card ${tier.key === "premium" ? "card--featured" : ""}`}
              >
                {tier.key === "premium" && (
                  <div className="ws-pricing-badge">Most Popular</div>
                )}
                <div className="ws-pricing-header">
                  <h3 style={{ marginBottom: "0.25rem" }}>{tier.name}</h3>
                  <p style={{ fontSize: "0.875rem", marginBottom: "1rem" }}>{tier.description}</p>
                </div>

                <div className="ws-pricing-price">
                  <div className="ws-pricing-earlybird">
                    <span className="ws-pricing-amount">{formatPrice(tier.earlyBirdPriceInCents)}</span>
                    <span className="ws-pricing-original">{formatPrice(tier.priceInCents)}</span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.25rem" }}>
                    Early bird — {tier.earlyBirdCap} spots at this price
                  </div>
                </div>

                <ul className="ws-pricing-features">
                  {tier.features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>

                <button
                  type="button"
                  className={`btn ${tier.key === "premium" ? "btn--primary" : "btn--ghost"} btn--full`}
                  onClick={() => handleCheckout(tier.key)}
                  disabled={checkoutLoading === tier.key}
                  style={{ marginTop: "auto" }}
                >
                  {checkoutLoading === tier.key ? "Loading..." : `Get ${tier.name} Ticket`}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="section section--alt section--border-b" id="testimonials">
        <div className="container">
          <div className="label">What attendees say</div>
          <h2 className="max-w-700">Legal professionals who took the leap.</h2>

          <div className="ws-testimonial-grid mt-6">
            {testimonials.map((t, i) => (
              <div key={i} className="card" style={{ padding: "2rem", borderRadius: 16, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <p style={{ fontSize: "1rem", lineHeight: 1.7, fontStyle: "italic", flex: 1, marginBottom: 0 }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <div className="text-white" style={{ fontSize: "0.9375rem", fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="section section--border-b">
        <div className="container">
          <div className="label">Audience</div>
          <h2 className="max-w-700">Who this workshop is for.</h2>

          <div className="fit-row mt-6">
            <div className="fit-col fit-col--yes">
              <div className="fit-heading">Ideal participants</div>
              <div className="fit-item"><span className="fit-item-marker">&#10003;</span>Paralegals and legal assistants exploring AI tools</div>
              <div className="fit-item"><span className="fit-item-marker">&#10003;</span>Associates and attorneys evaluating AI for their practice</div>
              <div className="fit-item"><span className="fit-item-marker">&#10003;</span>Firm administrators and ops managers planning adoption</div>
              <div className="fit-item"><span className="fit-item-marker">&#10003;</span>Managing partners making AI investment decisions</div>
              <div className="fit-item"><span className="fit-item-marker">&#10003;</span>Legal teams with zero prior AI experience</div>
            </div>
            <div className="fit-col fit-col--no">
              <div className="fit-heading">Not designed for</div>
              <div className="fit-item"><span className="fit-item-marker">&mdash;</span>Software engineers building AI products</div>
              <div className="fit-item"><span className="fit-item-marker">&mdash;</span>Data scientists or ML researchers</div>
              <div className="fit-item"><span className="fit-item-marker">&mdash;</span>Teams looking for vendor-specific tool training</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section section--alt section--border-b" id="faq">
        <div className="container">
          <div className="label">FAQ</div>
          <h2 className="max-w-700">Questions we hear most.</h2>

          <div className="ws-faq-list mt-6">
            {faqs.map((faq, i) => (
              <div key={i} className="ws-faq-item">
                <button
                  type="button"
                  className="ws-faq-question"
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  aria-expanded={expandedFaq === i}
                >
                  <span>{faq.q}</span>
                  <span className={`ws-faq-chevron ${expandedFaq === i ? "ws-faq-chevron--open" : ""}`} aria-hidden="true">+</span>
                </button>
                {expandedFaq === i && (
                  <div className="ws-faq-answer">
                    <p style={{ marginBottom: 0 }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section">
        <div className="container" style={{ textAlign: "center" }}>
          <div className="label">Limited seats</div>
          <h2 className="max-w-600 mx-auto">Your firm's AI advantage starts here.</h2>
          <p className="max-w-600 mx-auto mt-3">
            {event.capacity} seats. Early bird pricing won't last.
            Secure your spot before your competitors do.
          </p>
          <div className="mt-5">
            <a className="btn btn--primary btn--arrow" href="#pricing">
              Reserve Your Seat Now
            </a>
          </div>
          <p className="mt-4 text-muted" style={{ fontSize: "0.8125rem" }}>
            No vendor pitches. No software sales. Just structured AI education for legal professionals.
          </p>
        </div>
      </section>
    </main>
  );
}
