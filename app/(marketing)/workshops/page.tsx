import Link from "next/link";
import { CITIES, EVENTS, formatDateShort, hasEarlyBird } from "@/data/workshops";
import { StickyCta } from "@/components/StickyCta";

export const metadata = {
  title: "AI Workshops for Legal Professionals | Counterbench.AI",
  description:
    "In-person AI training for paralegals, associates, and firm managers. One full day. Hands-on exercises. Real legal workflows. Boston and Buffalo.",
  alternates: { canonical: "https://counterbench.ai/workshops" },
  openGraph: {
    title: "AI Is Coming For Legal — Learn It Before It Learns You",
    description:
      "In-person AI workshops for legal professionals. One full day. Hands-on exercises. Boston and Buffalo.",
    type: "website",
    url: "https://counterbench.ai/workshops"
  }
};

export default function WorkshopsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "CounterbenchAI Legal AI Workshops",
    description: "In-person AI training workshops for legal professionals",
    itemListElement: EVENTS.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "EducationEvent",
        name: `AI for Legal Professionals — ${e.city}`,
        startDate: e.date,
        location: {
          "@type": "Place",
          name: e.venue,
          address: e.venueAddress
        },
        organizer: {
          "@type": "Organization",
          name: "CounterbenchAI"
        }
      }
    }))
  };

  return (
    <main className="page-workshops">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="section" style={{ paddingTop: 140, paddingBottom: "5rem" }}>
        <div className="container">
          <div className="label anim-hero anim-hero--1">Live Workshops</div>
          <h1 className="max-w-900 anim-hero anim-hero--2">
            AI Is Coming For Legal —
            <br />
            <em>Learn It Before It Learns You.</em>
          </h1>
          <p className="max-w-600 mt-4 anim-hero anim-hero--3" style={{ fontSize: "1.125rem" }}>
            Your boss wants you using AI. Here&apos;s how to actually do it. One full day, hands-on,
            built for legal professionals who prefer learning from a person — not a YouTube tutorial.
          </p>
          <div className="flex flex--gap-3 mt-5 flex--resp-col anim-hero anim-hero--4">
            <a className="btn btn--primary btn--arrow" href="#cities">
              Choose Your City
            </a>
            <a className="btn btn--secondary" href="#curriculum">
              See the Curriculum
            </a>
          </div>

          <div
            className="grid grid--3 grid--gap-2 mt-6 anim-hero anim-hero--5"
            style={{ borderTop: "1px solid var(--border)", paddingTop: "2.5rem" }}
          >
            <div>
              <div className="text-white" style={{ fontSize: "0.9375rem", fontWeight: 600 }}>
                Hands-on, not lecture
              </div>
              <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
                Bring your real work. We&apos;ll prompt-engineer it live.
              </p>
            </div>
            <div>
              <div className="text-white" style={{ fontSize: "0.9375rem", fontWeight: 600 }}>
                Legal-specific
              </div>
              <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
                Not generic AI. Discovery, drafting, research, case timelines.
              </p>
            </div>
            <div>
              <div className="text-white" style={{ fontSize: "0.9375rem", fontWeight: 600 }}>
                Small class size
              </div>
              <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
                15–25 attendees. Enough room to ask questions without raising your hand.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="section section--alt section--border-t section--border-b">
        <div className="container">
          <div className="grid grid--2 grid--gap-3">
            <div>
              <div className="label">Who this is for</div>
              <h2 className="max-w-600">
                Built for legal professionals
                <br />
                <em>who didn&apos;t ask for this.</em>
              </h2>
              <p className="mt-4 max-w-600">
                Your firm just told you to &quot;figure out AI.&quot; No training, no budget for a consultant,
                no idea where to start. You&apos;re not alone — and a full day with us will change that.
              </p>
            </div>
            <div>
              <div className="card card--no-hover" style={{ height: "100%" }}>
                <div className="label">You&apos;ll get the most from this if you&apos;re a</div>
                <ul className="list mt-4">
                  <li>Paralegal or legal assistant at a small-to-mid firm</li>
                  <li>Associate asked to evaluate or implement AI tools</li>
                  <li>Office manager responsible for firm technology</li>
                  <li>Managing partner who wants to understand before buying</li>
                  <li>Legal professional who prefers in-person, hands-on learning</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="section section--border-b" id="curriculum">
        <div className="container">
          <div className="label">Curriculum</div>
          <h2 className="max-w-700">AI for Legal Professionals — From Zero to Productive.</h2>
          <p className="max-w-600 mt-3">
            8 hours. 5 modules. You leave with templates, a digital workbook, and an action plan
            you&apos;ll actually use on Monday.
          </p>

          <div className="grid grid--2 grid--gap-2 mt-6">
            <div className="card">
              <div className="label">Module 1 · 90 min</div>
              <h3>AI Fundamentals</h3>
              <p className="mt-3">
                What AI actually is (and isn&apos;t). ChatGPT vs Claude vs Copilot — when to use what. Live demo comparing
                all three on the same legal task. Privacy and confidentiality: what&apos;s safe to put in.
              </p>
            </div>
            <div className="card">
              <div className="label">Module 2 · 90 min</div>
              <h3>Prompting That Works</h3>
              <p className="mt-3">
                Why &quot;write me a brief&quot; fails. The CRAFT framework for non-technical users. Hands-on: bring your
                real tasks, we prompt-engineer them live. Templates for summarization, research, and drafting.
              </p>
            </div>
            <div className="card">
              <div className="label">Module 3 · 90 min</div>
              <h3>AI for Your Workflow</h3>
              <p className="mt-3">
                Document review and summarization. Legal research acceleration. Drafting and editing assistance.
                Case timeline construction. Exercises with real (anonymized) legal documents.
              </p>
            </div>
            <div className="card">
              <div className="label">Module 4 · 60 min</div>
              <h3>Agents and Automation</h3>
              <p className="mt-3">
                What AI agents are — practical, not theoretical. Build a simple workflow that saves 2 hours/week.
                What&apos;s coming in 6–12 months and how to stay ahead.
              </p>
            </div>
          </div>

          <div className="card mt-4" style={{ maxWidth: 540 }}>
            <div className="label">Module 5 · 30 min</div>
            <h3>Your AI Action Plan</h3>
            <p className="mt-3">
              Identify 3 tasks you&apos;ll automate this week. Buddy system for accountability.
              Access to private community for post-workshop support.
            </p>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="section section--alt section--border-b">
        <div className="container">
          <div className="label">Materials</div>
          <h2 className="max-w-700">What you walk away with.</h2>
          <div className="grid grid--3 grid--gap-2 mt-6">
            <div className="process-step" style={{ paddingTop: "1.5rem" }}>
              <div className="process-num">01</div>
              <div className="process-body">
                <h3 style={{ fontSize: "1rem" }}>Quick-Reference Card</h3>
                <p style={{ fontSize: "0.875rem" }}>Printed prompt templates for common legal tasks. Keep it on your desk.</p>
              </div>
            </div>
            <div className="process-step" style={{ paddingTop: "1.5rem" }}>
              <div className="process-num">02</div>
              <div className="process-body">
                <h3 style={{ fontSize: "1rem" }}>Digital Workbook</h3>
                <p style={{ fontSize: "0.875rem" }}>All exercises, frameworks, and examples from the workshop.</p>
              </div>
            </div>
            <div className="process-step" style={{ paddingTop: "1.5rem" }}>
              <div className="process-num">03</div>
              <div className="process-body">
                <h3 style={{ fontSize: "1rem" }}>CounterbenchAI Access</h3>
                <p style={{ fontSize: "0.875rem" }}>30–90 day free trial depending on your tier.</p>
              </div>
            </div>
            <div className="process-step" style={{ paddingTop: "1.5rem" }}>
              <div className="process-num">04</div>
              <div className="process-body">
                <h3 style={{ fontSize: "1rem" }}>Demo Recordings</h3>
                <p style={{ fontSize: "0.875rem" }}>Recordings of all live demos for reference.</p>
              </div>
            </div>
            <div className="process-step" style={{ paddingTop: "1.5rem" }}>
              <div className="process-num">05</div>
              <div className="process-body">
                <h3 style={{ fontSize: "1rem" }}>Community Access</h3>
                <p style={{ fontSize: "0.875rem" }}>Private community for Q&A and accountability.</p>
              </div>
            </div>
            <div className="process-step" style={{ paddingTop: "1.5rem" }}>
              <div className="process-num">06</div>
              <div className="process-body">
                <h3 style={{ fontSize: "1rem" }}>AI Action Plan</h3>
                <p style={{ fontSize: "0.875rem" }}>Your personalized 3-task automation plan.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* City selector */}
      <section className="section section--border-b" id="cities">
        <div className="container">
          <div className="label">Locations</div>
          <h2 className="max-w-700">Choose your city.</h2>
          <p className="max-w-600 mt-3">
            Same curriculum. Same instructor. Pick the location and date that works for you.
          </p>

          <div className="grid grid--2 grid--gap-2 mt-6">
            {CITIES.map((city) => {
              const cityEvents = EVENTS.filter((e) => e.citySlug === city.slug);
              const nextEvent = cityEvents[0];
              return (
                <Link
                  key={city.slug}
                  href={`/workshops/${city.slug}`}
                  className="card"
                  style={{ textDecoration: "none" }}
                >
                  <div className="label">
                    {city.name}, {city.state}
                  </div>
                  <h3 style={{ fontSize: "1.25rem", marginTop: "0.5rem" }}>{city.tagline}</h3>
                  <p className="mt-3" style={{ fontSize: "0.9375rem" }}>
                    {city.description}
                  </p>
                  {nextEvent && (
                    <div className="mt-4" style={{ fontSize: "0.875rem" }}>
                      <span style={{ color: "var(--green)", fontWeight: 600 }}>
                        Next: {formatDateShort(nextEvent.date)}
                      </span>
                      {hasEarlyBird(nextEvent) && (
                        <span className="ml-2" style={{ color: "var(--amber)", marginLeft: "0.75rem" }}>
                          Early bird available
                        </span>
                      )}
                    </div>
                  )}
                  <div className="mt-4">
                    <span className="btn btn--secondary btn--sm btn--arrow">View dates &amp; register</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing overview */}
      <section className="section section--alt section--border-b" id="pricing">
        <div className="container">
          <div className="label">Pricing</div>
          <h2 className="max-w-700">Three tiers. No hidden fees.</h2>
          <p className="max-w-600 mt-3">
            Early bird: $100 off for the first 10 registrations per event.
          </p>

          <div className="pricing-grid mt-6">
            <div className="pricing-col">
              <div className="pricing-name">Standard</div>
              <div className="pricing-price">
                $597
              </div>
              <p className="pricing-desc">
                Full workshop + materials + 30-day CounterbenchAI access.
              </p>
              <a className="btn btn--secondary btn--full" href="#cities">
                Choose City
              </a>
              <div className="pricing-divider" />
              <div className="pricing-feature-item">Full-day workshop (8 hours)</div>
              <div className="pricing-feature-item">Printed quick-reference card</div>
              <div className="pricing-feature-item">Digital workbook</div>
              <div className="pricing-feature-item">30-day CounterbenchAI access</div>
              <div className="pricing-feature-item">Demo recordings</div>
              <div className="pricing-feature-item" style={{ color: "var(--muted-2)", textDecoration: "line-through", opacity: 0.5 }}>
                1-on-1 follow-up call
              </div>
              <div className="pricing-feature-item" style={{ color: "var(--muted-2)", textDecoration: "line-through", opacity: 0.5 }}>
                Firm-specific session
              </div>
            </div>

            <div className="pricing-col pricing-col--featured">
              <div className="pricing-name">Premium</div>
              <div className="pricing-price">
                $897
              </div>
              <p className="pricing-desc">
                Standard + 1-on-1 follow-up call + 90-day CounterbenchAI access.
              </p>
              <a className="btn btn--primary btn--full btn--arrow" href="#cities">
                Choose City
              </a>
              <div className="pricing-divider" />
              <div className="pricing-feature-item pricing-feature-item--highlight">Everything in Standard</div>
              <div className="pricing-feature-item pricing-feature-item--highlight">1-on-1 follow-up call (30 min)</div>
              <div className="pricing-feature-item pricing-feature-item--highlight">90-day CounterbenchAI access</div>
              <div className="pricing-feature-item pricing-feature-item--highlight">Priority seating</div>
              <div className="pricing-feature-item" style={{ color: "var(--muted-2)", textDecoration: "line-through", opacity: 0.5 }}>
                Firm-specific session
              </div>
            </div>

            <div className="pricing-col">
              <div className="pricing-name">Firm Package</div>
              <div className="pricing-price">
                $2,497
              </div>
              <p className="pricing-desc">
                4 seats + private 1-hour firm-specific session + annual CounterbenchAI.
              </p>
              <a className="btn btn--secondary btn--full" href="#cities">
                Choose City
              </a>
              <div className="pricing-divider" />
              <div className="pricing-feature-item pricing-feature-item--highlight">4 seats (Standard tier)</div>
              <div className="pricing-feature-item pricing-feature-item--highlight">Private 1-hour firm session</div>
              <div className="pricing-feature-item pricing-feature-item--highlight">Annual CounterbenchAI access</div>
              <div className="pricing-feature-item pricing-feature-item--highlight">Dedicated point of contact</div>
            </div>
          </div>

          <p className="mt-4 text-muted" style={{ fontSize: "0.8125rem" }}>
            Early bird pricing ($100 off) applies to the first 10 registrations per event, all tiers. Firm-pays and self-pays: same price.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="section section--border-b">
        <div className="container">
          <div className="label">FAQ</div>
          <h2 className="max-w-600">Common questions.</h2>

          <div className="faq-grid mt-6">
            <details className="faq-item" open>
              <summary className="faq-q">Do I need to know anything about AI?</summary>
              <div className="faq-a">
                <p>
                  No. We start from zero. If you can use email and a web browser, you have enough technical
                  skill for this workshop.
                </p>
              </div>
            </details>
            <details className="faq-item" open>
              <summary className="faq-q">Will my firm reimburse this?</summary>
              <div className="faq-a">
                <p>
                  Most firms cover professional development. We provide a receipt and certificate of attendance.
                  Many attendees expense it as CLE or training.
                </p>
              </div>
            </details>
            <details className="faq-item" open>
              <summary className="faq-q">Is this CLE accredited?</summary>
              <div className="faq-a">
                <p>
                  We&apos;re applying for CLE accreditation with the MA Board of Bar Overseers and the NY CLE Board.
                  We&apos;ll update this page when approved. The first workshops run without CLE credit.
                </p>
              </div>
            </details>
            <details className="faq-item">
              <summary className="faq-q">What should I bring?</summary>
              <div className="faq-a">
                <p>
                  A laptop with internet access. We provide everything else. Bring a real work task
                  (anonymized) — we&apos;ll use it in the exercises.
                </p>
              </div>
            </details>
            <details className="faq-item">
              <summary className="faq-q">What if I can&apos;t make it after registering?</summary>
              <div className="faq-a">
                <p>
                  Full refund up to 7 days before the event. Transfer to a different date anytime.
                  Send a colleague in your place if needed.
                </p>
              </div>
            </details>
            <details className="faq-item">
              <summary className="faq-q">How is this different from an online course?</summary>
              <div className="faq-a">
                <p>
                  Online courses are passive. This is active: you work on your actual tasks, get feedback
                  in real time, and leave with muscle memory, not just bookmarks.
                </p>
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Cross-sell to Advisory */}
      <section className="section section--alt section--border-b">
        <div className="container">
          <div className="grid grid--2 grid--gap-3">
            <div>
              <div className="label">For firm leadership</div>
              <h2 className="max-w-600">
                Need more than a workshop?
              </h2>
              <p className="max-w-600 mt-4">
                If your firm needs a systematic AI strategy — not just training — our Advisory practice
                designs implementation roadmaps, vendor evaluations, and adoption frameworks for plaintiff firms.
              </p>
              <div className="mt-5">
                <Link className="btn btn--secondary btn--arrow" href="/advisory?from=workshops">
                  Learn about Advisory
                </Link>
              </div>
            </div>
            <div className="card card--no-hover" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div className="label">Also available</div>
              <h3 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>Free AI Diagnostic</h3>
              <p style={{ fontSize: "0.9375rem" }}>
                Not sure where to start? The Case Diagnostic gives your firm a matter-specific leverage map in 48 hours.
              </p>
              <div className="mt-4">
                <Link className="btn btn--secondary btn--arrow" href="/diagnostic?from=workshops">
                  See the Diagnostic
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <StickyCta
        text={
          <>
            <strong>$100 off early bird.</strong> First 10 seats per event.
          </>
        }
        ctaLabel="Register Now"
        ctaHref="#cities"
      />
    </main>
  );
}
