import Link from "next/link";

export const metadata = { title: "EULA" };

const LAST_UPDATED = "2026-02-21";

export default function EulaPage() {
  return (
    <main>
      <section className="section" style={{ paddingTop: 120, paddingBottom: "4rem" }}>
        <div className="container">
          <div className="label">EULA</div>
          <h1 className="max-w-900">End User License Agreement</h1>
          <p className="max-w-800 mt-4 lead">Last updated: {LAST_UPDATED}</p>

          <div className="mt-6" style={{ maxWidth: 920 }}>
            <h2>Scope</h2>
	            <p className="mt-3">
	              This EULA applies to Counterbench.AI-owned content made available through the Site, including prompt packs,
	              prompt templates, skill templates, and any downloadable or copyable text we provide (the &quot;Licensed Content&quot;).
	            </p>

            <h2 className="mt-6">1. License grant</h2>
            <p className="mt-3">
              Subject to these terms, we grant you a limited, non-exclusive, non-transferable, revocable license to access
              and use the Licensed Content for your internal business purposes.
            </p>

            <h2 className="mt-6">2. Restrictions</h2>
            <ul className="list mt-3">
              <li>You may not resell, sublicense, or redistribute the Licensed Content as a standalone product.</li>
              <li>You may not remove proprietary notices.</li>
              <li>You may not use the Licensed Content to train or fine-tune models for redistribution without permission.</li>
              <li>You may not represent the Licensed Content as legal advice.</li>
            </ul>

            <h2 className="mt-6">3. Ownership</h2>
            <p className="mt-3">
              We retain all rights, title, and interest in the Licensed Content. This EULA does not grant you ownership.
            </p>

            <h2 className="mt-6">4. Third-party content</h2>
            <p className="mt-3">
              Tool listings may link to third-party content or marks. Those are owned by their respective parties and are
              governed by their terms.
            </p>

            <h2 className="mt-6">5. Disclaimers</h2>
	            <p className="mt-3">
	              THE LICENSED CONTENT IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND. YOU ARE RESPONSIBLE FOR REVIEWING
	              OUTPUTS FOR ACCURACY, COMPLIANCE, AND FITNESS FOR YOUR USE CASE AND JURISDICTION.
	            </p>

            <h2 className="mt-6">6. Termination</h2>
            <p className="mt-3">
              We may terminate this license if you materially breach this EULA. Upon termination, you must stop using the
              Licensed Content.
            </p>

            <h2 className="mt-6">7. Relationship to Terms and Privacy</h2>
            <p className="mt-3">
              Your use of the Site is also governed by the {" "}
              <Link href="/terms">Terms of Use</Link> and {" "}
              <Link href="/privacy">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
