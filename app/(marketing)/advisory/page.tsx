import Link from "next/link";

import { StickyCta } from "@/components/StickyCta";

export const metadata = {
  title: "Strategic Advisory | Counterbench Advisory",
  description:
    "Retained AI strategy advisory for plaintiff trial firms. Vendor evaluation, workflow architecture, and implementation sequencing. No software. No commissions. From $3,500/mo.",
  alternates: { canonical: "https://counterbench.ai/advisory" },
  openGraph: {
    title: "Strategic Advisory | Counterbench Advisory",
    description:
      "Retained AI advisory for plaintiff firms. Vendor evaluation, implementation roadmaps, and strategic guidance. No software. No commissions. Just strategy.",
    type: "website",
    url: "https://counterbench.ai/advisory"
  }
};

type SearchParams = Record<string, string | string[] | undefined>;

function normalize(value: string | string[] | undefined): string {
  const v = Array.isArray(value) ? value[0] : value;
  return (v ?? "").trim();
}

export default async function AdvisoryPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const sp = (await searchParams) ?? {};
  const playbookUrl = normalize(sp.playbook_url);
  const goal = normalize(sp.goal);
  const from = normalize(sp.from);

  const action =
    process.env.NEXT_PUBLIC_ADVISORY_FORM_ACTION_URL ||
    process.env.NEXT_PUBLIC_NEWSLETTER_FORM_ACTION_URL ||
    "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Counterbench Strategic Advisory",
    provider: { "@type": "Organization", name: "Counterbench Advisory" },
    description:
      "Retained AI strategy advisory for plaintiff trial firms. Vendor evaluation, implementation sequencing, and operational playbooks.",
    areaServed: "US",
    audience: { "@type": "Audience", name: "Plaintiff Personal Injury Law Firms" }
  };

  return (
    <main className="page-advisory">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="section" style={{ paddingTop: 140, paddingBottom: "8rem" }}>
        <div className="container">
          <div className="label anim-hero anim-hero--1">Advisory</div>
          <h1 className="max-w-900 anim-hero anim-hero--2">
            AI will restructure
            <br />
            litigation operations.
            <br />
            <em>
              We design how
              <br />
              your firm adapts.
            </em>
          </h1>
          <p className="max-w-600 mt-4 anim-hero anim-hero--3" style={{ fontSize: "1.125rem" }}>
            Retained strategic advisory for plaintiff trial firms. Vendor evaluation, workflow architecture, and
            implementation sequencing, built for outcomes, not demos.
          </p>
          <div className="flex flex--gap-3 mt-5 flex--resp-col anim-hero anim-hero--4">
            <a className="btn btn--primary btn--arrow" href="#briefing" data-location="advisory-hero">
              Request Private Briefing
            </a>
            <Link className="btn btn--secondary" href="/diagnostic" data-location="advisory-hero">
              See the Diagnostic
            </Link>
          </div>

          <div
            className="grid grid--3 grid--gap-2 mt-6 anim-hero anim-hero--5"
            style={{ borderTop: "1px solid var(--border)", paddingTop: "2.5rem" }}
          >
            <div>
              <div className="text-white" style={{ fontSize: "0.9375rem", fontWeight: 600 }}>
                Vendor-agnostic
              </div>
              <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>No software commissions. No preferred vendors.</p>
            </div>
            <div>
              <div className="text-white" style={{ fontSize: "0.9375rem", fontWeight: 600 }}>
                Limited capacity
              </div>
              <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
                We work with a small number of firms at a time. Depth over volume.
              </p>
            </div>
            <div>
              <div className="text-white" style={{ fontSize: "0.9375rem", fontWeight: 600 }}>
                Plaintiff-only
              </div>
              <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>No carrier work. No defense. Your interests.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--alt section--border-t section--border-b">
        <div className="container">
          <div className="grid grid--2 grid--gap-3">
            <div>
              <div className="label">The problem</div>
              <h2 className="max-w-600">
                Tools won&apos;t save you.
                <br />
                Systems will.
              </h2>
              <p className="mt-4 max-w-600">
                Most firms are buying AI tools in isolation, without redesigning the workflows those tools are supposed to
                improve. The result is shelfware and skepticism.
              </p>
              <p className="max-w-600">
                The winning firms aren&apos;t the ones with the most subscriptions. They&apos;re the ones who built a clean
                operating system: disciplined inputs, defensible outputs, and adoption that survives a busy trial month.
              </p>
            </div>
            <div>
              <div className="card card--no-hover" style={{ height: "100%" }}>
                <div className="label">What actually breaks</div>
                <ul className="list mt-4">
                  <li>Intake bottlenecks that no AI tool gets upstream of</li>
                  <li>Demand packages that look AI-generated and invite lowball offers</li>
                  <li>Paralegals adopting new tools without guardrails or accountability</li>
                  <li>Partners making vendor decisions without a selection framework</li>
                  <li>Workflows that work in demos but collapse under real volume</li>
                </ul>
                <div className="mt-5 pull-quote">
                  <div className="pull-quote__text">&quot;Most AI initiatives fail at adoption, not implementation.&quot;</div>
                  <div className="pull-quote__attr">— Phil, Counterbench Advisory</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--border-b">
        <div className="container">
          <div className="label">Focus areas</div>
          <h2 className="max-w-700">Four levers that move the needle in plaintiff PI firms.</h2>
          <div className="grid grid--2 grid--gap-2 mt-6">
            <div className="card">
              <div className="label">01</div>
              <h3>Intake Intelligence</h3>
              <p className="mt-3">
                Speed-to-contact and triage accuracy are the two most important intake variables. We build systems that
                capture, score, and route leads before the first human touches them, without sacrificing warmth.
              </p>
            </div>
            <div className="card">
              <div className="label">02</div>
              <h3>Demand Package Quality</h3>
              <p className="mt-3">
                Insurers know when a demand was generated by AI. We architect prompting systems and review workflows
                that produce demands that read like your best senior attorney wrote them, at half the time cost.
              </p>
            </div>
            <div className="card">
              <div className="label">03</div>
              <h3>Negotiation Leverage</h3>
              <p className="mt-3">
                Information asymmetry wins negotiations. We identify where AI can surface comparable verdicts,
                treatment cost benchmarks, and carrier adjuster patterns, before you make the first call.
              </p>
            </div>
            <div className="card">
              <div className="label">04</div>
              <h3>Operational Adoption</h3>
              <p className="mt-3">
                The last mile is the hardest. We build role-based SOPs, accountability checkpoints, and measurement
                frameworks so staff uses the systems you pay for, every day.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--alt section--border-t section--border-b">
        <div className="container">
          <div className="label">How it works</div>
          <h2 className="max-w-700">A structured 90-day engagement with clear deliverables at every phase.</h2>

          <div className="engagement-bar">
            <div className="engagement-phase">
              <div className="engagement-phase-num">Phase 01</div>
              <div className="engagement-phase-title">Diagnostic</div>
              <div className="engagement-phase-weeks">Weeks 1–2</div>
              <p style={{ fontSize: "0.875rem", marginBottom: 0 }}>
                Map your current stack, workflows, and adoption gaps. Identify the three highest-leverage intervention
                points.
              </p>
            </div>
            <div className="engagement-phase">
              <div className="engagement-phase-num">Phase 02</div>
              <div className="engagement-phase-title">Architecture</div>
              <div className="engagement-phase-weeks">Weeks 3–6</div>
              <p style={{ fontSize: "0.875rem", marginBottom: 0 }}>
                Design the operating system: vendor decisions, workflow redesigns, role-based SOPs, and implementation
                sequence.
              </p>
            </div>
            <div className="engagement-phase">
              <div className="engagement-phase-num">Phase 03</div>
              <div className="engagement-phase-title">Implementation</div>
              <div className="engagement-phase-weeks">Weeks 7–12</div>
              <p style={{ fontSize: "0.875rem", marginBottom: 0 }}>
                Deploy, instrument, and iterate. Train your team. Measure outputs. Fix what isn&apos;t sticking before the
                engagement closes.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="label">What you walk away with</div>
            <div className="grid grid--3 grid--gap-2 mt-4">
              <div className="process-step" style={{ paddingTop: "1.5rem" }}>
                <div className="process-num">01</div>
                <div className="process-body">
                  <h3 style={{ fontSize: "1rem" }}>AI Readiness Scorecard</h3>
                  <p style={{ fontSize: "0.875rem" }}>
                    An honest assessment of where your firm stands across intake, case management, demand, and
                    negotiation.
                  </p>
                </div>
              </div>
              <div className="process-step" style={{ paddingTop: "1.5rem" }}>
                <div className="process-num">02</div>
                <div className="process-body">
                  <h3 style={{ fontSize: "1rem" }}>Vendor Evaluation Matrix</h3>
                  <p style={{ fontSize: "0.875rem" }}>
                    A scored comparison of every relevant tool in your workflow category, with a clear buy/pass
                    recommendation.
                  </p>
                </div>
              </div>
              <div className="process-step" style={{ paddingTop: "1.5rem" }}>
                <div className="process-num">03</div>
                <div className="process-body">
                  <h3 style={{ fontSize: "1rem" }}>Implementation Roadmap</h3>
                  <p style={{ fontSize: "0.875rem" }}>
                    A sequenced 90-day plan your partners can follow, with milestones, owners, and rollback criteria.
                  </p>
                </div>
              </div>
              <div className="process-step" style={{ paddingTop: "1.5rem" }}>
                <div className="process-num">04</div>
                <div className="process-body">
                  <h3 style={{ fontSize: "1rem" }}>Role-Based SOPs</h3>
                  <p style={{ fontSize: "0.875rem" }}>
                    Documented workflows for intake coordinators, paralegals, case managers, and attorneys.
                  </p>
                </div>
              </div>
              <div className="process-step" style={{ paddingTop: "1.5rem" }}>
                <div className="process-num">05</div>
                <div className="process-body">
                  <h3 style={{ fontSize: "1rem" }}>Prompt Library</h3>
                  <p style={{ fontSize: "0.875rem" }}>
                    A curated library of prompts for common tasks: demands, mediation briefs, client updates, and
                    research.
                  </p>
                </div>
              </div>
              <div className="process-step" style={{ paddingTop: "1.5rem" }}>
                <div className="process-num">06</div>
                <div className="process-body">
                  <h3 style={{ fontSize: "1rem" }}>Measurement Framework</h3>
                  <p style={{ fontSize: "0.875rem" }}>
                    The three metrics that tell you if your AI adoption is working, tracked from week one.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--border-b" id="pricing">
        <div className="container">
          <div className="label">Pricing</div>
          <h2 className="max-w-700">Transparent. Retainer-based. No surprises.</h2>
          <p className="max-w-600 mt-3">
            All engagements are month-to-month after the initial 90-day engagement. No annual contracts. No upsells to
            software we get paid to recommend.
          </p>

          <div className="pricing-grid mt-6">
            <div className="pricing-col">
              <div className="pricing-name">Orientation</div>
              <div className="pricing-price">
                $1,500<span>/ mo</span>
              </div>
              <p className="pricing-desc">
                For smaller firms beginning their AI journey. Strategic clarity and a prioritized roadmap without full
                implementation support.
              </p>
              <a className="btn btn--secondary btn--full" href="#briefing">
                Get Started
              </a>
              <div className="pricing-divider" />
              <div className="pricing-feature-item">Monthly strategy session (90 min)</div>
              <div className="pricing-feature-item">AI readiness assessment</div>
              <div className="pricing-feature-item">Vendor landscape briefing</div>
              <div className="pricing-feature-item">Prioritized action list</div>
              <div className="pricing-feature-item" style={{ color: "var(--muted-2)", textDecoration: "line-through", opacity: 0.5 }}>
                Implementation support
              </div>
              <div className="pricing-feature-item" style={{ color: "var(--muted-2)", textDecoration: "line-through", opacity: 0.5 }}>
                Custom SOPs
              </div>
              <div className="pricing-feature-item" style={{ color: "var(--muted-2)", textDecoration: "line-through", opacity: 0.5 }}>
                Prompt library
              </div>
            </div>

            <div className="pricing-col pricing-col--featured">
              <div className="pricing-name">Full Advisory</div>
              <div className="pricing-price">
                $3,500<span>/ mo</span>
              </div>
              <p className="pricing-desc">
                The core engagement. Diagnostic, architecture design, implementation sequencing, and ongoing strategic
                support.
              </p>
              <a className="btn btn--primary btn--full btn--arrow" href="#briefing">
                Request Briefing
              </a>
              <div className="pricing-divider" />
              <div className="pricing-feature-item pricing-feature-item--highlight">Everything in Orientation</div>
              <div className="pricing-feature-item pricing-feature-item--highlight">90-day engagement roadmap</div>
              <div className="pricing-feature-item pricing-feature-item--highlight">Custom role-based SOPs</div>
              <div className="pricing-feature-item pricing-feature-item--highlight">Vendor evaluation matrix</div>
              <div className="pricing-feature-item pricing-feature-item--highlight">Prompt library (50+ prompts)</div>
              <div className="pricing-feature-item pricing-feature-item--highlight">Bi-weekly strategy sessions</div>
              <div className="pricing-feature-item" style={{ color: "var(--muted-2)", textDecoration: "line-through", opacity: 0.5 }}>
                Partner-level retainer access
              </div>
            </div>

            <div className="pricing-col">
              <div className="pricing-name">Strategic Partner</div>
              <div className="pricing-price">
                $7,500<span>/ mo</span>
              </div>
              <p className="pricing-desc">
                For multi-location or high-volume firms that need embedded, ongoing partnership, not a consulting cycle.
              </p>
              <a className="btn btn--secondary btn--full" href="#briefing">
                Inquire
              </a>
              <div className="pricing-divider" />
              <div className="pricing-feature-item pricing-feature-item--highlight">Everything in Full Advisory</div>
              <div className="pricing-feature-item pricing-feature-item--highlight">Unlimited async access</div>
              <div className="pricing-feature-item pricing-feature-item--highlight">Staff training sessions</div>
              <div className="pricing-feature-item pricing-feature-item--highlight">Quarterly firm review</div>
              <div className="pricing-feature-item pricing-feature-item--highlight">Priority response (&lt;4 hrs)</div>
              <div className="pricing-feature-item pricing-feature-item--highlight">Competitive intelligence briefings</div>
              <div className="pricing-feature-item pricing-feature-item--highlight">Partner-level retainer access</div>
            </div>
          </div>

          <p className="mt-4 text-muted" style={{ fontSize: "0.8125rem" }}>
            All engagements begin with a no-cost 30-minute private briefing. 90-day minimum on Full Advisory and Strategic
            Partner tiers.
          </p>

          <div className="mt-6" style={{ overflowX: "auto" }}>
            <table className="compare-table">
              <thead>
                <tr>
                  <th style={{ width: "40%" }}>What&apos;s included</th>
                  <th>Orientation</th>
                  <th className="col-highlight">Full Advisory</th>
                  <th>Strategic Partner</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Monthly strategy sessions</td>
                  <td>1 × 90 min</td>
                  <td className="col-highlight">2 × 60 min</td>
                  <td>Weekly</td>
                </tr>
                <tr>
                  <td>AI readiness assessment</td>
                  <td>
                    <span className="compare-check">✓</span>
                  </td>
                  <td className="col-highlight">
                    <span className="compare-check">✓</span>
                  </td>
                  <td>
                    <span className="compare-check">✓</span>
                  </td>
                </tr>
                <tr>
                  <td>Vendor evaluation matrix</td>
                  <td>
                    <span className="compare-x">—</span>
                  </td>
                  <td className="col-highlight">
                    <span className="compare-check">✓</span>
                  </td>
                  <td>
                    <span className="compare-check">✓</span>
                  </td>
                </tr>
                <tr>
                  <td>Custom role-based SOPs</td>
                  <td>
                    <span className="compare-x">—</span>
                  </td>
                  <td className="col-highlight">
                    <span className="compare-check">✓</span>
                  </td>
                  <td>
                    <span className="compare-check">✓</span>
                  </td>
                </tr>
                <tr>
                  <td>Prompt library</td>
                  <td>
                    <span className="compare-x">—</span>
                  </td>
                  <td className="col-highlight">50+ prompts</td>
                  <td>100+ prompts</td>
                </tr>
                <tr>
                  <td>Staff training sessions</td>
                  <td>
                    <span className="compare-x">—</span>
                  </td>
                  <td className="col-highlight">
                    <span className="compare-x">—</span>
                  </td>
                  <td>
                    <span className="compare-check">✓</span>
                  </td>
                </tr>
                <tr>
                  <td>Async access</td>
                  <td>
                    <span className="compare-x">—</span>
                  </td>
                  <td className="col-highlight">
                    <span className="compare-x">—</span>
                  </td>
                  <td>Unlimited</td>
                </tr>
                <tr>
                  <td>Competitive intelligence briefings</td>
                  <td>
                    <span className="compare-x">—</span>
                  </td>
                  <td className="col-highlight">
                    <span className="compare-x">—</span>
                  </td>
                  <td>Quarterly</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section section--alt section--border-b">
        <div className="container">
          <div className="label">Fit</div>
          <h2 className="max-w-700">We work well with some firms, and not others.</h2>
          <p className="max-w-600 mt-3">
            This isn&apos;t a product you purchase and figure out on your own. It&apos;s a partnership. Here&apos;s an honest
            breakdown of who gets the most from it.
          </p>

          <div className="fit-row mt-6">
            <div className="fit-col fit-col--yes">
              <div className="fit-heading">Good fit</div>
              <div className="fit-item">
                <span className="fit-item-marker">✓</span>PI or mass tort firm with 3–30 attorneys
              </div>
              <div className="fit-item">
                <span className="fit-item-marker">✓</span>Marketing works but operations are behind it
              </div>
              <div className="fit-item">
                <span className="fit-item-marker">✓</span>Partners willing to invest 2–3 hours/month in strategic work
              </div>
              <div className="fit-item">
                <span className="fit-item-marker">✓</span>Skeptical of vendor pitches and want independent guidance
              </div>
              <div className="fit-item">
                <span className="fit-item-marker">✓</span>Tired of buying tools that never get adopted
              </div>
              <div className="fit-item">
                <span className="fit-item-marker">✓</span>Growth-oriented but operationally cautious
              </div>
            </div>
            <div className="fit-col fit-col--no">
              <div className="fit-heading">Not a fit</div>
              <div className="fit-item">
                <span className="fit-item-marker">—</span>Defense or carrier-side firms
              </div>
              <div className="fit-item">
                <span className="fit-item-marker">—</span>Looking for a software vendor to implement tools
              </div>
              <div className="fit-item">
                <span className="fit-item-marker">—</span>Want a one-time report with no implementation support
              </div>
              <div className="fit-item">
                <span className="fit-item-marker">—</span>Not willing to involve the team in the process
              </div>
              <div className="fit-item">
                <span className="fit-item-marker">—</span>Expecting AI to replace judgment, not augment it
              </div>
              <div className="fit-item">
                <span className="fit-item-marker">—</span>Firms under significant financial stress
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--border-b">
        <div className="container">
          <div className="label">FAQ</div>
          <h2 className="max-w-600">Common questions.</h2>

          <div className="faq-grid mt-6">
            <details className="faq-item" open>
              <summary className="faq-q">What does the first 30 days look like?</summary>
              <div className="faq-a">
                <p>
                  We start with a 90-minute diagnostic session covering your current stack, top three workflows, and
                  where cases are slowing down or leaking value. Then we deliver a written readiness assessment and a
                  proposed engagement roadmap before month one is over.
                </p>
              </div>
            </details>
            <details className="faq-item" open>
              <summary className="faq-q">Do I need technical staff to make this work?</summary>
              <div className="faq-a">
                <p>
                  No. We design everything for attorneys and paralegals, not developers. The SOPs, prompts, and
                  workflows we deliver are built for real use inside your existing case management system.
                </p>
              </div>
            </details>
            <details className="faq-item" open>
              <summary className="faq-q">Are you affiliated with any AI vendors?</summary>
              <div className="faq-a">
                <p>
                  No. We accept no commissions, referral fees, or compensation from software vendors. When we recommend a
                  tool, it&apos;s because it&apos;s right for the workflow, not because someone paid us to say so.
                </p>
              </div>
            </details>
            <details className="faq-item">
              <summary className="faq-q">What&apos;s the minimum commitment?</summary>
              <div className="faq-a">
                <p>
                  Full Advisory and Strategic Partner engagements have a 90-day minimum. It&apos;s the time needed to move
                  from diagnostic to implementation to measurable results. Orientation is month-to-month from day one.
                </p>
              </div>
            </details>
            <details className="faq-item">
              <summary className="faq-q">Can we start with the Diagnostic before committing to a retainer?</summary>
              <div className="faq-a">
                <p>
                  Yes. The standalone Case Diagnostic is designed as a proof-of-concept: you get a leverage map of one
                  active matter, then decide whether to move into a retainer.
                </p>
              </div>
            </details>
            <details className="faq-item">
              <summary className="faq-q">How is this different from hiring an AI consultant?</summary>
              <div className="faq-a">
                <p>
                  Most consultants are generalists who apply the same playbook across industries. Counterbench is built
                  for plaintiff PI litigation: intake, demand, negotiation, and trial prep. That depth is the
                  difference.
                </p>
              </div>
            </details>
            <details className="faq-item">
              <summary className="faq-q">Do you work with mass tort or med-mal firms?</summary>
              <div className="faq-a">
                <p>
                  Yes. Many operational challenges map closely: intake volume, demand quality, documentation, and
                  negotiation leverage. We adapt the advisory accordingly.
                </p>
              </div>
            </details>
          </div>
        </div>
      </section>

      <section className="section section--alt section--border-b">
        <div className="container">
          <div className="grid grid--2 grid--gap-3">
            <div>
              <div className="label">Next step</div>
              <h2 className="max-w-600">Start with a private briefing.</h2>
              <p className="max-w-600 mt-4">
                A 30-minute call with no sales pressure. We&apos;ll tell you honestly whether we can help, and if we can&apos;t,
                we&apos;ll point you in the right direction.
              </p>
              <p className="max-w-600">Limited to a small number of new engagements per quarter.</p>
              <div className="mt-5">
                <a className="btn btn--primary btn--arrow" href="#briefing">
                  Request Private Briefing
                </a>
              </div>
              <p className="mt-4 text-muted" style={{ fontSize: "0.8125rem" }}>
                No commissions · No software · Vendor-agnostic · Plaintiff-only
              </p>
            </div>

            <div className="card card--no-hover" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div className="label">Also available</div>
              <h3 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>Not ready for a retainer?</h3>
              <p style={{ fontSize: "0.9375rem" }}>
                Start with the standalone Case Diagnostic, a matter-specific leverage discovery session that delivers a
                concrete leverage map in 48 hours.
              </p>
              <div className="mt-4">
                <Link className="btn btn--secondary btn--arrow" href="/diagnostic">
                  See the Diagnostic
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--border-b" id="briefing">
        <div className="container">
          <div className="label">Request</div>
          <h2 className="max-w-700">Request a private briefing.</h2>
          <p className="max-w-700 mt-3">Share your goal and constraints. We’ll reply with next steps.</p>

          <div className="mt-5 card" style={{ borderRadius: 12, padding: "1.75rem", maxWidth: 860 }}>
            {action ? (
              <form method="post" action={action}>
                <input type="hidden" name="type" value="advisory" />
                <input type="hidden" name="source" value={from ? `advisory:${from}` : "advisory:site"} />
                {playbookUrl && <input type="hidden" name="playbook_url" value={playbookUrl} />}

                <div className="grid grid--2 grid--gap-2" style={{ gap: "1rem" }}>
                  <div>
                    <label className="label" htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      required
                      placeholder="you@firm.com"
                      className="input"
                      style={{ borderRadius: 999 }}
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="role">
                      Role
                    </label>
                    <input
                      id="role"
                      name="role"
                      placeholder="Managing partner, attorney, ops..."
                      className="input"
                      style={{ borderRadius: 999 }}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="label" htmlFor="goal">
                    What are you trying to accomplish?
                  </label>
                  <textarea
                    id="goal"
                    name="goal"
                    defaultValue={goal}
                    placeholder="Briefly describe the workflow(s) you need to improve and any constraints."
                    rows={6}
                    className="input"
                    style={{ borderRadius: 16, padding: "12px 14px", resize: "vertical", minHeight: 140 }}
                  />
                </div>

                <div className="mt-4 flex flex--gap-2 flex--resp-col">
                  <button className="btn btn--primary btn--arrow" type="submit">
                    Request Private Briefing
                  </button>
                  {playbookUrl && (
                    <a className="btn btn--secondary" href={playbookUrl} target="_blank" rel="noreferrer">
                      View playbook
                    </a>
                  )}
                </div>

                <p className="mt-3 text-muted" style={{ fontSize: "0.875rem" }}>
                  Don’t include confidential details.
                </p>
              </form>
            ) : (
              <p className="text-muted" style={{ fontSize: "0.875rem" }}>
                Advisory form action not configured yet.
              </p>
            )}
          </div>
        </div>
      </section>

      <StickyCta
        text={
          <>
            <strong>Plaintiff-only. Vendor-agnostic.</strong> Strategy that holds up in real cases.
          </>
        }
        ctaLabel="Request Briefing"
        ctaHref="#briefing"
      />
    </main>
  );
}
