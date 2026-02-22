import { NewsletterCapture } from "@/components/NewsletterCapture";

export const metadata = { title: "Newsletter" };

export default function NewsletterPage() {
  return (
    <main>
      <section className="section" style={{ paddingTop: 120 }}>
        <div className="container">
          <div className="label">Newsletter</div>
          <h1 className="max-w-900">Weekly legal AI roundup.</h1>
          <p className="max-w-700 mt-4" style={{ fontSize: "1.125rem" }}>
            New tools, changed tools, prompt packs, and skill templates. Low volume. High signal.
          </p>
          <div className="mt-5" style={{ maxWidth: 520 }}>
            <NewsletterCapture source="newsletter-page" />
          </div>
        </div>
      </section>
    </main>
  );
}

