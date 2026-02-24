import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/design-system/Badge";
import { NewsletterCapture } from "@/components/NewsletterCapture";
import { PlaybookActions } from "@/components/playbooks/PlaybookActions";
import { getAllPlaybooks, getAllPrompts, getAllSkills, getAllTools, getPlaybookBySlug } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";
import { buildPlaybookMarkdown, coerceAnswers, pickToolsForPlaybook, selectPlaybook } from "@/lib/playbooks";

export async function generateStaticParams() {
  return getAllPlaybooks().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getPlaybookBySlug(slug);
  if (!p) return {};
  return {
    title: p.seo?.title ?? p.title,
    description: p.seo?.description ?? p.description
  };
}

type SearchParams = Record<string, string | string[] | undefined>;

function labelForMatter(m: string): string {
  const map: Record<string, string> = {
    contracts: "Contracts",
    litigation: "Litigation",
    employment: "Employment",
    ip: "IP + Patents",
    privacy: "Privacy + Compliance",
    ediscovery: "eDiscovery",
    corporate: "Corporate / Ops",
    real_estate: "Real estate",
    research: "Legal research",
    general: "General"
  };
  return map[m] ?? m;
}

function labelForStage(s: string): string {
  const map: Record<string, string> = {
    intake: "Intake / Triage",
    draft: "Draft",
    review: "Review",
    research: "Research",
    manage: "File management",
    negotiation: "Negotiation",
    compliance: "Compliance",
    trial_prep: "Trial prep"
  };
  return map[s] ?? s;
}

export default async function PlaybookPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const sp = (await searchParams) ?? {};

  const template = getPlaybookBySlug(slug);
  if (!template) notFound();

  const answers = coerceAnswers(sp);

  const allPlaybooks = getAllPlaybooks();
  const recommended = selectPlaybook(allPlaybooks, answers);
  const playbook = template;

  const tools = getAllTools();
  const selectedTools = pickToolsForPlaybook(playbook, answers, tools);

  const promptsAll = getAllPrompts();
  const skillsAll = getAllSkills();
  const prompts = playbook.prompt_slugs
    .map((s) => promptsAll.find((p) => p.slug === s))
    .filter(Boolean)
    .map((p) => ({ slug: p!.slug, title: p!.frontmatter.title, description: p!.frontmatter.description }));
  const skills = playbook.skill_slugs
    .map((s) => skillsAll.find((x) => x.slug === s))
    .filter(Boolean)
    .map((x) => ({ slug: x!.slug, title: x!.frontmatter.title, description: x!.frontmatter.description }));

  const shareUrl = absoluteUrl(
    `/playbooks/${playbook.slug}?matter=${encodeURIComponent(answers.matter)}&stage=${encodeURIComponent(answers.stage)}&sens=${encodeURIComponent(
      answers.sensitivity
    )}&budget=${encodeURIComponent(answers.budget)}&platform=${encodeURIComponent(answers.platform)}`
  );

  const markdown = buildPlaybookMarkdown({
    playbook,
    answers,
    tools: selectedTools,
    prompts,
    skills
  });

  const advisoryAction =
    process.env.NEXT_PUBLIC_ADVISORY_FORM_ACTION_URL ||
    process.env.NEXT_PUBLIC_NEWSLETTER_FORM_ACTION_URL ||
    "";

  return (
    <main>
      <section className="section" style={{ paddingTop: 120, paddingBottom: "4rem" }}>
        <div className="container">
          <div className="label">Playbook</div>
          <h1 className="max-w-900">{playbook.title}</h1>
          <p className="max-w-800 mt-4" style={{ fontSize: "1.125rem" }}>
            {playbook.description}
          </p>

          <div className="flex flex--gap-1 mt-4" style={{ flexWrap: "wrap" }}>
            <Badge tone="neutral">{labelForMatter(answers.matter)}</Badge>
            <Badge tone="neutral">{labelForStage(answers.stage)}</Badge>
            <Badge tone="neutral">Sensitivity: {answers.sensitivity}</Badge>
            <Badge tone="neutral">Budget: {answers.budget === "free_only" ? "Free only" : "Free or paid"}</Badge>
            <Badge tone="neutral">Platform: {answers.platform}</Badge>
          </div>

          <div className="mt-5">
            <PlaybookActions shareUrl={shareUrl} markdown={markdown} />
          </div>

          {recommended.slug !== playbook.slug && (
            <div className="mt-5 card" style={{ borderRadius: 12, padding: "1.25rem" }}>
              <div className="label">Recommendation</div>
              <div className="text-white" style={{ fontSize: "1rem", fontWeight: 650 }}>
                Based on your answers, we’d start with: {recommended.title}
              </div>
              <p className="mt-3" style={{ fontSize: "0.9375rem" }}>
                Your current page is a template. The recommendation below is the closest match for your matter type and workflow stage.
              </p>
              <div className="mt-4 flex flex--gap-2 flex--resp-col">
                <Link
                  className="btn btn--primary btn--sm"
                  href={`/playbooks/${recommended.slug}?matter=${encodeURIComponent(answers.matter)}&stage=${encodeURIComponent(
                    answers.stage
                  )}&sens=${encodeURIComponent(answers.sensitivity)}&budget=${encodeURIComponent(answers.budget)}&platform=${encodeURIComponent(
                    answers.platform
                  )}&from=reco`}
                >
                  View recommended playbook
                </Link>
                <Link className="btn btn--secondary btn--sm" href="/playbooks/triage">
                  Rerun triage
                </Link>
              </div>
            </div>
          )}

          <div className="mt-6 grid grid--2 grid--gap-2" style={{ gap: "1rem" }}>
            <div className="card" style={{ padding: "1.5rem", borderRadius: 12 }}>
              <div className="label">Recommended Stack</div>
              <p className="text-muted" style={{ fontSize: "0.875rem", marginTop: 10 }}>
                Start with 3–5 tools. Add more only if you can maintain the workflow.
              </p>
              <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
                {selectedTools.map((st) => (
                  <div key={st.tool.slug} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "12px 12px" }}>
                    <div className="flex flex--between flex--center flex--gap-2" style={{ alignItems: "flex-start" }}>
                      <div style={{ minWidth: 0 }}>
                        <Link href={`/tools/${st.tool.slug}`} className="text-white" style={{ fontSize: "0.95rem", fontWeight: 650 }}>
                          {st.tool.name}
                        </Link>
                        <div className="text-muted" style={{ fontSize: "0.875rem", marginTop: 8, lineHeight: 1.5 }}>
                          {st.tool.description}
                        </div>
                      </div>
                      <div className="flex flex--gap-1" style={{ flexWrap: "wrap", justifyContent: "flex-end" }}>
                        {st.tool.verified && <Badge tone="success">Verified</Badge>}
                        {st.tool.pricing !== "unknown" && <Badge tone="neutral">{st.tool.pricing}</Badge>}
                      </div>
                    </div>
                    {st.why.length > 0 && (
                      <ul style={{ marginTop: 10, display: "grid", gap: 6 }}>
                        {st.why.slice(0, 3).map((w) => (
                          <li key={w} className="text-muted" style={{ fontSize: "0.875rem" }}>
                            {w}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-3 flex flex--gap-2 flex--resp-col">
                      <a className="btn btn--ghost btn--sm" href={st.tool.affiliate_url ?? st.tool.url} target="_blank" rel="noreferrer">
                        Visit
                      </a>
                      <Link className="btn btn--secondary btn--sm" href={`/tools/${st.tool.slug}`}>
                        Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gap: "1rem" }}>
              <div className="card" style={{ padding: "1.5rem", borderRadius: 12 }}>
                <div className="label">Checklist</div>
                <ul style={{ marginTop: 10, display: "grid", gap: 10 }}>
                  {playbook.checklist.map((c) => (
                    <li key={c} className="text-muted" style={{ fontSize: "0.9375rem" }}>
                      <span className="text-white" style={{ fontWeight: 650 }}>
                        [ ]
                      </span>{" "}
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card" style={{ padding: "1.5rem", borderRadius: 12 }}>
                <div className="label">Risk Notes</div>
                <ul style={{ marginTop: 10, display: "grid", gap: 10 }}>
                  {playbook.risk_notes.map((n) => (
                    <li key={n} className="text-muted" style={{ fontSize: "0.9375rem" }}>
                      {n}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {(prompts.length > 0 || skills.length > 0) && (
            <div className="mt-6 grid grid--2 grid--gap-2" style={{ gap: "1rem" }}>
              <div className="card" style={{ padding: "1.5rem", borderRadius: 12 }}>
                <div className="label">Prompts</div>
                {prompts.length === 0 ? (
                  <p className="text-muted" style={{ fontSize: "0.875rem", marginTop: 10 }}>
                    Coming soon.
                  </p>
                ) : (
                  <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
                    {prompts.map((p) => (
                      <div key={p.slug} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "12px 12px" }}>
                        <Link href={`/prompts/${p.slug}`} className="text-white" style={{ fontSize: "0.95rem", fontWeight: 650 }}>
                          {p.title}
                        </Link>
                        <div className="text-muted" style={{ fontSize: "0.875rem", marginTop: 8 }}>
                          {p.description}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card" style={{ padding: "1.5rem", borderRadius: 12 }}>
                <div className="label">Skill templates</div>
                {skills.length === 0 ? (
                  <p className="text-muted" style={{ fontSize: "0.875rem", marginTop: 10 }}>
                    Coming soon.
                  </p>
                ) : (
                  <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
                    {skills.map((s) => (
                      <div key={s.slug} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "12px 12px" }}>
                        <Link href={`/skills/${s.slug}`} className="text-white" style={{ fontSize: "0.95rem", fontWeight: 650 }}>
                          {s.title}
                        </Link>
                        <div className="text-muted" style={{ fontSize: "0.875rem", marginTop: 8 }}>
                          {s.description}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 card" style={{ borderRadius: 12, padding: "1.75rem" }}>
            <div className="label">Advisory</div>
            <div className="text-white" style={{ fontSize: "1.25rem", fontWeight: 650 }}>
              Want a vendor-agnostic plan for your team?
            </div>
            <p className="mt-3">
              We can help turn this playbook into a defensible workflow with governance, rollout, and change management.
            </p>

            {advisoryAction ? (
              <form method="post" action={advisoryAction} style={{ marginTop: 12, maxWidth: 640 }}>
                <input type="hidden" name="type" value="advisory" />
                <input type="hidden" name="source" value={`playbook:${playbook.slug}`} />
                <input type="hidden" name="playbook_url" value={shareUrl} />
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
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: 999,
                        border: "1px solid var(--border)",
                        background: "rgba(255,255,255,0.04)",
                        color: "var(--fg)"
                      }}
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="goal">
                      What are you trying to accomplish?
                    </label>
                    <input
                      id="goal"
                      name="goal"
                      placeholder="e.g. contract review workflow, privacy audit, intake..."
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: 999,
                        border: "1px solid var(--border)",
                        background: "rgba(255,255,255,0.04)",
                        color: "var(--fg)"
                      }}
                    />
                  </div>
                </div>
                <div className="mt-4 flex flex--gap-2 flex--resp-col">
                  <button className="btn btn--primary btn--arrow" type="submit">
                    Request Advisory Briefing
                  </button>
                  <Link className="btn btn--secondary" href="/advisory">
                    Learn more
                  </Link>
                </div>
                <p className="mt-3 text-muted" style={{ fontSize: "0.875rem" }}>
                  Don’t include confidential details.
                </p>
              </form>
            ) : (
              <div className="mt-4 flex flex--gap-2 flex--resp-col">
                <Link className="btn btn--primary btn--arrow" href="/advisory">
                  Request Advisory Briefing
                </Link>
                <p className="text-muted" style={{ fontSize: "0.875rem" }}>
                  (Form action not configured yet.)
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 card" style={{ borderRadius: 12, padding: "1.75rem" }}>
            <div className="label">Newsletter</div>
            <div className="text-white" style={{ fontSize: "1.25rem", fontWeight: 650 }}>
              Get weekly updates when tools change.
            </div>
            <p className="mt-3">Short updates for legal teams. No spam.</p>
            <div style={{ maxWidth: 520 }}>
              <NewsletterCapture source={`playbook:${playbook.slug}`} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
