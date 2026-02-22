export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <main>
      <section className="section" style={{ paddingTop: 120 }}>
        <div className="container">
          <div className="label">About</div>
          <h1 className="max-w-900">A pragmatic index of legal AI.</h1>
          <p className="max-w-700 mt-4" style={{ fontSize: "1.125rem" }}>
            Counterbench.AI is a Git-backed directory of legal AI tools, prompts, and skills built for speed, legibility, and low operational cost.
          </p>
        </div>
      </section>
    </main>
  );
}

