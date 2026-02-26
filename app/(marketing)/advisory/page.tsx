export const metadata = { title: "Advisory" };

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

  return (
    <main>
      <section className="section" style={{ paddingTop: 120 }}>
        <div className="container">
          <div className="label">Advisory</div>
          <h1 className="max-w-900">Vendor-agnostic AI strategy for legal teams.</h1>
          <p className="max-w-700 mt-4" style={{ fontSize: "1.125rem" }}>
            If you need help choosing tools, designing governance, and building defensible workflows, we can help.
          </p>

          <div className="mt-6 card" style={{ borderRadius: 12, padding: "1.75rem" }}>
            <div className="label">Request</div>
            <div className="text-white" style={{ fontSize: "1.25rem", fontWeight: 650 }}>
              Request a private briefing.
            </div>
            <p className="mt-3">Share your goal and constraints. We’ll reply with next steps.</p>

            {action ? (
              <form method="post" action={action} style={{ marginTop: 12, maxWidth: 760 }}>
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
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: 999,
                        border: "1px solid var(--border)",
                        background: "var(--input-bg)",
                        color: "var(--fg)"
                      }}
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="role">
                      Role
                    </label>
                    <input
                      id="role"
                      name="role"
                      placeholder="Paralegal, attorney, legal ops..."
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: 999,
                        border: "1px solid var(--border)",
                        background: "var(--input-bg)",
                        color: "var(--fg)"
                      }}
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
                    placeholder="Briefly describe the workflow, tools, or governance you need help with."
                    rows={5}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 16,
                      border: "1px solid var(--border)",
                      background: "var(--input-bg)",
                      color: "var(--fg)",
                      resize: "vertical"
                    }}
                  />
                </div>

                <div className="mt-4 flex flex--gap-2 flex--resp-col">
                  <button className="btn btn--primary btn--arrow" type="submit">
                    Request Advisory Briefing
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
              <p className="mt-4 text-muted" style={{ fontSize: "0.875rem" }}>
                Advisory form action not configured yet.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
