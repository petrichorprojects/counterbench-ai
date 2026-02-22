export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <main>
      <section className="section" style={{ paddingTop: 120 }}>
        <div className="container">
          <div className="label">Contact</div>
          <h1 className="max-w-900">Get in touch.</h1>
          <p className="max-w-700 mt-4" style={{ fontSize: "1.125rem" }}>
            For partnerships, listings, or advisory requests, email{" "}
            <a href="mailto:hello@counterbench.ai">hello@counterbench.ai</a>.
          </p>
        </div>
      </section>
    </main>
  );
}

