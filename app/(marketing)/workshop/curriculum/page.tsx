import Link from "next/link";

export const metadata = {
  title: "AI Workshop Curriculum | Counterbench.AI",
  description:
    "6-hour AI literacy workshop for legal professionals. Five modules covering AI fundamentals, prompting, workflow integration, agents, and action planning.",
  alternates: { canonical: "https://counterbench.ai/workshop/curriculum" },
  openGraph: {
    title: "AI Workshop Curriculum | Counterbench.AI",
    description:
      "6-hour AI literacy workshop for legal professionals. Five modules: AI Fundamentals, Prompting That Works, AI for Your Workflow, Agents & Automation, and Action Plan.",
    type: "website",
    url: "https://counterbench.ai/workshop/curriculum"
  }
};

const modules = [
  {
    num: "01",
    title: "AI Fundamentals",
    duration: "90 min",
    subtitle: "What AI actually is — and isn\u2019t — for legal work.",
    topics: [
      "How large language models work (no math, real intuition)",
      "What \u201Challucination\u201D actually means and when it matters",
      "Supervised vs. generative AI in legal tools you already use",
      "Where AI is reliable today vs. where it\u2019s not",
      "Ethical and confidentiality guardrails for client work"
    ],
    outcome:
      "Walk away with a mental model for evaluating any AI claim from a vendor or colleague."
  },
  {
    num: "02",
    title: "Prompting That Works",
    duration: "90 min",
    subtitle: "From vague questions to reliable, repeatable outputs.",
    topics: [
      "Anatomy of a good prompt: role, context, constraint, format",
      "Prompt patterns for legal research, drafting, and summarization",
      "Chain-of-thought prompting for complex legal reasoning",
      "Building a reusable prompt library for your practice area",
      "Live exercise: draft and refine prompts for real tasks"
    ],
    outcome:
      "Leave with 5+ tested prompts you can use in your practice tomorrow."
  },
  {
    num: "03",
    title: "AI for Your Workflow",
    duration: "90 min",
    subtitle: "Mapping AI to the work you actually do every day.",
    topics: [
      "Intake triage: scoring and routing leads faster",
      "Document review and summarization at scale",
      "Demand package drafting with human-quality output",
      "Client communication templates that don\u2019t sound robotic",
      "Identifying your firm\u2019s three highest-leverage AI opportunities"
    ],
    outcome:
      "A prioritized list of workflows where AI saves your firm real time this quarter."
  },
  {
    num: "04",
    title: "Agents and Automation",
    duration: "60 min",
    subtitle: "What\u2019s coming next — and what\u2019s hype.",
    topics: [
      "AI agents vs. chatbots: what\u2019s actually different",
      "Automation patterns: triggers, chains, and human-in-the-loop",
      "Real examples of agent workflows in legal operations",
      "Risk assessment: what to automate and what to keep manual",
      "Evaluating vendor \u201Cagent\u201D claims with a clear framework"
    ],
    outcome:
      "A realistic understanding of where automation is headed and how to prepare."
  },
  {
    num: "05",
    title: "Action Plan",
    duration: "30 min",
    subtitle: "Leave with a concrete plan, not just inspiration.",
    topics: [
      "Personal AI adoption roadmap (30/60/90 days)",
      "Quick wins you can implement this week",
      "Team rollout strategy and change management basics",
      "Measurement: how to know if AI is actually helping",
      "Resources and next steps for continued learning"
    ],
    outcome:
      "A written 90-day action plan tailored to your role and firm size."
  }
];

const totalMinutes = modules.reduce((sum, m) => {
  const n = parseInt(m.duration, 10);
  return sum + (isNaN(n) ? 0 : n);
}, 0);
const totalHours = totalMinutes / 60;

export default function CurriculumPage() {
  return (
    <main>
      {/* Hero */}
      <section className="section" style={{ paddingTop: 140, paddingBottom: "4rem" }}>
        <div className="container">
          <div className="label anim-hero anim-hero--1">Workshop Curriculum</div>
          <h1 className="max-w-900 anim-hero anim-hero--2">
            AI literacy for legal
            <br />
            professionals.
            <br />
            <em>Built for practitioners,
            <br />
            not technologists.</em>
          </h1>
          <p className="max-w-700 mt-4 anim-hero anim-hero--3" style={{ fontSize: "1.125rem" }}>
            {modules.length} modules. {totalHours} hours. Everything your team needs to evaluate, adopt, and
            operationalize AI — without the jargon.
          </p>

          <div className="grid grid--3 grid--gap-2 mt-6 anim-hero anim-hero--4" style={{ borderTop: "1px solid var(--border)", paddingTop: "2rem" }}>
            <div>
              <div className="text-white" style={{ fontSize: "0.9375rem", fontWeight: 600 }}>{totalHours} hours total</div>
              <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>Half-day format. No filler. Every minute earns its place.</p>
            </div>
            <div>
              <div className="text-white" style={{ fontSize: "0.9375rem", fontWeight: 600 }}>Hands-on exercises</div>
              <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>Live prompting, workflow mapping, and action planning — not just slides.</p>
            </div>
            <div>
              <div className="text-white" style={{ fontSize: "0.9375rem", fontWeight: 600 }}>Legal-specific</div>
              <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>Every example, exercise, and framework is built for legal workflows.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Module overview bar */}
      <section className="section section--alt section--border-t section--border-b">
        <div className="container">
          <div className="label">At a glance</div>
          <h2 className="max-w-700">{modules.length} modules designed to build on each other.</h2>
          <p className="max-w-600 mt-3">
            From foundations to action plan. Each module ends with a concrete takeaway your team keeps.
          </p>

          <div className="engagement-bar">
            {modules.map((m) => (
              <div className="engagement-phase" key={m.num}>
                <div className="engagement-phase-num">Module {m.num}</div>
                <div className="engagement-phase-title">{m.title}</div>
                <div className="engagement-phase-weeks">{m.duration}</div>
                <p style={{ fontSize: "0.875rem", marginBottom: 0 }}>{m.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed modules */}
      <section className="section section--border-b">
        <div className="container">
          <div className="label">Curriculum detail</div>
          <h2 className="max-w-700">What each module covers.</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "2rem", marginTop: "2.5rem" }}>
            {modules.map((m) => (
              <div key={m.num} className="card" style={{ padding: "2rem", borderRadius: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div>
                    <div className="label">Module {m.num}</div>
                    <h3 style={{ marginTop: "0.25rem" }}>{m.title}</h3>
                  </div>
                  <div className="label" style={{ fontSize: "0.8125rem", opacity: 0.7 }}>{m.duration}</div>
                </div>
                <p className="mt-3" style={{ fontSize: "0.9375rem" }}>{m.subtitle}</p>
                <ul className="list mt-4">
                  {m.topics.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
                <div className="mt-4" style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
                  <div className="text-white" style={{ fontSize: "0.875rem", fontWeight: 600 }}>Outcome</div>
                  <p style={{ fontSize: "0.875rem", marginTop: "0.25rem", marginBottom: 0 }}>{m.outcome}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="section section--alt section--border-b">
        <div className="container">
          <div className="label">Audience</div>
          <h2 className="max-w-700">Who this workshop is for.</h2>

          <div className="fit-row mt-6">
            <div className="fit-col fit-col--yes">
              <div className="fit-heading">Ideal participants</div>
              <div className="fit-item"><span className="fit-item-marker">&#10003;</span>Paralegals and legal assistants exploring AI tools</div>
              <div className="fit-item"><span className="fit-item-marker">&#10003;</span>Associates and attorneys evaluating AI for their practice</div>
              <div className="fit-item"><span className="fit-item-marker">&#10003;</span>Firm administrators and ops managers planning adoption</div>
              <div className="fit-item"><span className="fit-item-marker">&#10003;</span>Managing partners who need to make informed AI decisions</div>
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

      {/* CTA */}
      <section className="section section--border-b">
        <div className="container">
          <div className="label">Next step</div>
          <h2 className="max-w-600">Bring this workshop to your firm.</h2>
          <p className="max-w-600 mt-3">
            Available as a half-day on-site session or virtual delivery. Custom modules available for firms
            with specific workflow needs.
          </p>
          <div className="flex flex--gap-3 mt-5 flex--resp-col">
            <Link className="btn btn--primary btn--arrow" href="/advisory#briefing">
              Request a Briefing
            </Link>
            <Link className="btn btn--secondary" href="/advisory">
              Learn About Advisory
            </Link>
          </div>
          <p className="mt-4 text-muted" style={{ fontSize: "0.8125rem" }}>
            No software sales. No vendor commissions. Just structured AI education for legal teams.
          </p>
        </div>
      </section>
    </main>
  );
}
