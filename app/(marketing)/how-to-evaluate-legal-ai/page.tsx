import Link from "next/link";
import { faqPageJsonLd } from "@/lib/seo";

export const metadata = {
  // Root layout applies the "%s | Counterbench.AI" title template, so the
  // brand suffix is deliberately omitted here to avoid doubling it.
  title: "How to Evaluate Legal AI Tools: A 6-Axis Framework",
  description:
    "A vendor-neutral scoring framework for PI firms buying legal AI. Six axes: omission behavior, reproducibility, privilege handling, supervision fit, operability, and exit cost.",
  alternates: { canonical: "https://counterbench.ai/how-to-evaluate-legal-ai" },
  openGraph: {
    title: "How to Evaluate Legal AI Tools: A 6-Axis Framework | Counterbench.AI",
    description:
      "Score legal AI on liability surface and operability, not features. Six axes, the test to run for each, and the red flag that should stop the deal.",
    type: "website",
    url: "https://counterbench.ai/how-to-evaluate-legal-ai"
  }
};

const whyFeaturesFail = [
  {
    title: "Per-page pricing is collapsing",
    body: "Records retrieval has been quoted under $0.40 per page. A feature that costs cents to deliver stops being a reason to pick a vendor."
  },
  {
    title: "Agent costs dropped roughly 39x",
    body: "The compute floor under most legal AI features fell hard in 2026. What one vendor ships this quarter, 3 more ship next quarter."
  },
  {
    title: "Foundation model vendors are going vertical",
    body: "The companies supplying the models are building legal products directly. Feature parity arrives from above, on their schedule, not yours."
  }
];

const axes = [
  {
    number: "01",
    name: "Omission behavior",
    kind: "Liability axis",
    claim:
      "Most eval guides test whether a tool invents facts. In legal work the expensive failure is the clause or precedent it fails to mention, because a missing thing trips no alarm.",
    test:
      "Hand it a document with a known material clause removed. Does it flag the absence, or answer confidently around the hole?",
    redFlag: "The vendor publishes accuracy numbers and never publishes recall."
  },
  {
    number: "02",
    name: "Reproducibility and versioning",
    kind: "Liability axis",
    claim:
      "The practitioner version of this question is blunt: can you reproduce, under oath, the output this tool gave you 6 months ago?",
    test:
      "Ask which model version served a given output, whether that version is pinned to your account, and whether you get notice before it changes.",
    redFlag:
      "\"We're always on the latest model.\" That's a non-answer, and it's a hole in your malpractice defense."
  },
  {
    number: "03",
    name: "Privilege and data handling",
    kind: "Liability axis",
    claim:
      "Local and private execution is table stakes now. Firms building their own stacks in 2026 are blocked on privilege questions rather than on model quality.",
    test:
      "Ask where the document sits at rest, in transit, and in the training pipeline. Get the subprocessor list. Get the retention window in writing.",
    redFlag: "Training on your data by default, with an opt-out buried in a settings pane."
  },
  {
    number: "04",
    name: "Supervision fit",
    kind: "Liability axis",
    claim:
      "You're squeezed from both sides. There's pressure to adopt AI and pressure not to file unreviewed output or leak client data. A tool either helps you supervise or it quietly makes supervision harder.",
    test:
      "Does the tool make human review structurally easy through citations to source, diffs, and surfaced confidence? Or does it emit a finished-looking artifact that invites a rubber stamp?",
    redFlag: "Polished output with no provenance trail. Polish is a supervision hazard."
  },
  {
    number: "05",
    name: "Operability without a systems person",
    kind: "Cost axis",
    claim:
      "Rank every tool by whether a 4-attorney firm can run it without hiring an engineer. The gap for smaller firms is affordability and operability together, and operability is the half vendors ignore.",
    test: "Ask who owns it when it breaks on a Friday, and walk the actual setup path end to end.",
    redFlag: "Enterprise pricing paired with enterprise assumptions about your IT staff."
  },
  {
    number: "06",
    name: "Exit cost",
    kind: "Cost axis",
    claim:
      "The tool layer is commoditizing, so you will switch. Price the switch now, while you're still the one holding the signature.",
    test: "Ask to export your matters, prompts, and history, then open the export and check what survived.",
    redFlag: "No export, or an export that loses the structure of the work product."
  }
];

const scoring = [
  {
    score: "0",
    label: "Absent",
    body: "The vendor cannot answer the question, or answers it with marketing copy."
  },
  {
    score: "1",
    label: "Asserted",
    body: "They claim it verbally. Nothing in the contract, docs, or product confirms it."
  },
  {
    score: "2",
    label: "Documented",
    body: "It's written down in docs or the agreement, and you could hold them to it."
  },
  {
    score: "3",
    label: "Demonstrated",
    body: "You ran the test yourself on your own matter and watched it hold."
  }
];

const faqs = [
  {
    q: "Why score liability and operability instead of features?",
    a: "Features are converging fast. Records retrieval has been quoted under $0.40 per page, agent compute costs fell roughly 39x, and foundation model vendors are shipping legal products directly. The axes that predict whether a tool survives contact with a real matter are liability surface and operability, so those are what this framework scores."
  },
  {
    q: "What does a disqualifying score look like?",
    a: "Score each axis 0 to 3. Any 0 on axes 1 through 4 disqualifies the tool regardless of its total, because those 4 are liability axes rather than preference axes. Axes 5 and 6 are cost axes, so a low score there is a budget conversation instead of a stop."
  },
  {
    q: "Isn't hallucination the main risk?",
    a: "Invented facts get caught because they look wrong. The missing clause, the precedent that never surfaced, the exhibit that was never requested: those read as clean output. That's why omission behavior is axis 1 and why you should test it with a document you've deliberately damaged."
  },
  {
    q: "How do I test reproducibility before I buy?",
    a: "Ask which model version served a specific output, whether that version is pinned to your account, and what notice you get before it changes. If the answer is that they're always on the latest model, you cannot reproduce a 6-month-old output, which matters the day someone asks you to explain how a filing was produced."
  },
  {
    q: "Does this framework rank specific vendors?",
    a: "No. This page teaches the scoring method and stays vendor-neutral on purpose. Our tool directory is where individual tools get listed and compared."
  },
  {
    q: "What if a tool scores well but we still can't supervise it?",
    a: "That's a staffing constraint rather than a software one. A tool that scores 3 on supervision fit still assumes someone at the firm has the hours to do the review. If the review capacity isn't there, the tool transfers risk to you rather than reducing it."
  }
];

export default function EvaluateLegalAiPage() {
  return (
    <main>
      {/* Hero */}
      <section className="section" style={{ paddingTop: 120, paddingBottom: "4rem" }}>
        <div className="container">
          <div className="label" style={{ display: "inline-block" }}>Buyer framework</div>
          <h1 className="max-w-900 mt-2">How to evaluate legal AI without grading it on features.</h1>
          <p className="max-w-700 mt-3" style={{ fontSize: "1.1875rem", lineHeight: 1.6 }}>
            A feature checklist tells you what a tool does on a good day. This framework tells you what it costs you on a bad one.
          </p>
          <p className="max-w-700 mt-3" style={{ fontSize: "1.0625rem", color: "var(--text-muted)", lineHeight: 1.65 }}>
            6 axes, scored 0 to 3, with the specific test to run and the red flag that should stop the deal. Vendor-neutral. No gate, no email wall.
          </p>
          <div className="mt-4" style={{ borderTop: "1px solid var(--border)", paddingTop: "1.25rem" }}>
            <div className="grid grid--4 grid--gap-2" style={{ maxWidth: 900 }}>
              {[
                "Built for PI firms of 1 to 10 attorneys",
                "Scores liability surface and operability",
                "Every axis has a test you can run",
                "No vendors named or ranked"
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

      {/* Why features fail as a filter */}
      <section className="section" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="container">
          <div className="label" style={{ display: "inline-block" }}>The diagnosis</div>
          <h2 className="mt-2" style={{ maxWidth: 620 }}>Features are commoditizing to zero.</h2>
          <p className="max-w-700 mt-3" style={{ fontSize: "1.0625rem", color: "var(--text-muted)", lineHeight: 1.65 }}>
            Three things happened in 2026 that broke the feature checklist as a buying tool.
          </p>
          <div className="grid grid--3 grid--gap-2 mt-4">
            {whyFeaturesFail.map((item) => (
              <div key={item.title} style={{ borderLeft: "2px solid var(--accent)", paddingLeft: "1.25rem" }}>
                <div style={{ fontWeight: 600, fontSize: "1rem" }}>{item.title}</div>
                <p className="mt-2" style={{ fontSize: "0.9375rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{item.body}</p>
              </div>
            ))}
          </div>
          <p className="max-w-700 mt-4" style={{ fontSize: "1.0625rem", lineHeight: 1.65 }}>
            What survives commoditization is the part you carry: the malpractice exposure, the bar complaint, the discovery deadline you missed because a tool summarized around a gap. Score that.
          </p>
        </div>
      </section>

      {/* The 6 axes */}
      <section className="section" id="axes" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="container">
          <div className="label" style={{ display: "inline-block" }}>The framework</div>
          <h2 className="mt-2" style={{ maxWidth: 620 }}>6 axes. Score each 0 to 3.</h2>
          <div className="mt-4" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {axes.map((axis) => (
              <div
                key={axis.number}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: "2rem"
                }}
              >
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--accent)", letterSpacing: "0.04em" }}>
                    {axis.number}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: "1.125rem" }}>{axis.name}</span>
                  <span className="label" style={{ display: "inline-block" }}>{axis.kind}</span>
                </div>
                <p className="max-w-700 mt-2" style={{ fontSize: "1rem", lineHeight: 1.65 }}>{axis.claim}</p>
                <div className="grid grid--2 grid--gap-2 mt-3">
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: "0.75rem" }}>
                    <div style={{ fontWeight: 600, fontSize: "0.8125rem" }}>Test to run</div>
                    <p className="mt-1" style={{ fontSize: "0.9375rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{axis.test}</p>
                  </div>
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: "0.75rem" }}>
                    <div style={{ fontWeight: 600, fontSize: "0.8125rem" }}>Red flag</div>
                    <p className="mt-1" style={{ fontSize: "0.9375rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{axis.redFlag}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scoring */}
      <section className="section" id="scoring" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="container">
          <div className="label" style={{ display: "inline-block" }}>Scoring</div>
          <h2 className="mt-2" style={{ maxWidth: 620 }}>What each number means.</h2>
          <div className="grid grid--4 grid--gap-2 mt-4">
            {scoring.map((s) => (
              <div key={s.score} style={{ borderTop: "1px solid var(--border)", paddingTop: "0.75rem" }}>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "baseline" }}>
                  <span style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em" }}>{s.score}</span>
                  <span style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{s.label}</span>
                </div>
                <p className="mt-1" style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{s.body}</p>
              </div>
            ))}
          </div>
          <div
            className="mt-4 max-w-700"
            style={{
              border: "1px solid var(--accent)",
              borderRadius: 12,
              padding: "1.5rem",
              background: "var(--bg-alt)"
            }}
          >
            <div style={{ fontWeight: 600, fontSize: "1rem" }}>The disqualifying rule</div>
            <p className="mt-2" style={{ fontSize: "0.9375rem", lineHeight: 1.65 }}>
              A 0 on any of axes 1 through 4 disqualifies the tool regardless of its total. Those 4 are liability axes, and a high total elsewhere doesn&apos;t buy back a hole in your defense.
            </p>
            <p className="mt-2" style={{ fontSize: "0.9375rem", lineHeight: 1.65 }}>
              Axes 5 and 6 are cost axes. A low score there opens a budget conversation rather than stopping the deal.
            </p>
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

      {/* Soft CTA */}
      <section className="section" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="container">
          <div className="label" style={{ display: "inline-block" }}>Where to go next</div>
          <h2 className="mt-2" style={{ maxWidth: 560 }}>Run the framework on real tools.</h2>
          <p className="max-w-700 mt-3" style={{ fontSize: "1.0625rem", color: "var(--text-muted)", lineHeight: 1.65 }}>
            Our directory lists legal AI tools with vendor links, so you can score candidates against these 6 axes yourself.
          </p>
          <p className="max-w-700 mt-2" style={{ fontSize: "1.0625rem", color: "var(--text-muted)", lineHeight: 1.65 }}>
            If axis 4 is where your firm keeps landing, the constraint is review hours rather than software. We run dedicated paralegal pods for PI firms, and the team comes with the tools.
          </p>
          <div className="mt-4" style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link className="btn btn--secondary btn--arrow" href="/tools">
              Browse the legal AI tool directory
            </Link>
            <Link className="btn btn--secondary btn--arrow" href="/paralegals">
              See how paralegal pods work
            </Link>
          </div>
        </div>
      </section>

      {/* Structured data. Restates only the FAQ copy rendered above; no new claims. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd(faqs)) }}
      />
    </main>
  );
}
