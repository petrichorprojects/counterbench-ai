export const metadata = { title: "Insights" };

export default function InsightsPage() {
  return (
    <main>
      <section className="section" style={{ paddingTop: 120 }}>
        <div className="container">
          <div className="label">Insights</div>
          <h1 className="max-w-900">Notes on legal AI workflows.</h1>
          <p className="max-w-700 mt-4" style={{ fontSize: "1.125rem" }}>
            Short, actionable writeups on tools, prompts, and operational patterns.
          </p>
        </div>
      </section>
    </main>
  );
}

