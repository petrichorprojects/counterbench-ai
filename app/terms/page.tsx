import Link from "next/link";

export const metadata = { title: "Terms" };

const LAST_UPDATED = "2026-02-21";

export default function TermsPage() {
  return (
    <main>
      <section className="section" style={{ paddingTop: 120, paddingBottom: "4rem" }}>
        <div className="container">
          <div className="label">Terms</div>
          <h1 className="max-w-900">Terms of use</h1>
          <p className="max-w-800 mt-4 lead">Last updated: {LAST_UPDATED}</p>

          <div className="mt-6" style={{ maxWidth: 920 }}>
            <h2>Important note</h2>
            <p className="mt-3">
              Counterbench.AI provides a directory of third-party tools and educational resources (including prompt packs
              and skill templates). The Site is not a law firm, does not provide legal services, and nothing on the Site is
              legal advice. Use of the Site does not create an attorney-client relationship.
            </p>

            <h2 className="mt-6">1. Acceptance</h2>
            <p className="mt-3">
              By accessing or using the Site, you agree to these Terms. If you do not agree, do not use the Site.
            </p>

            <h2 className="mt-6">2. Changes</h2>
            <p className="mt-3">
              We may update these Terms. The "Last updated" date indicates when changes were last made.
            </p>

            <h2 className="mt-6">3. The directory and third-party tools</h2>
            <ul className="list mt-3">
              <li>Tool listings may change without notice, and availability is not guaranteed.</li>
              <li>We do not control third-party websites, products, or services linked from the Site.</li>
              <li>
                Your use of third-party tools is governed by those providers' terms and privacy policies.
              </li>
            </ul>

            <h2 className="mt-6">4. Verified and last checked</h2>
            <p className="mt-3">
              "Verified" and "Last checked" indicators reflect a best-effort review at a point in time. They are not a
              guarantee of accuracy, security, suitability, or continued availability.
            </p>

            <h2 className="mt-6">5. Your responsibilities</h2>
            <ul className="list mt-3">
              <li>You are responsible for evaluating tools for your use case, jurisdiction, and risk profile.</li>
              <li>You should not input confidential or privileged information into third-party tools without appropriate safeguards.</li>
              <li>You agree not to misuse the Site (for example, to scrape excessively, disrupt service, or attempt unauthorized access).</li>
            </ul>

            <h2 className="mt-6">6. Intellectual property</h2>
            <p className="mt-3">
              The Site and its contents (excluding third-party marks and content) are owned by us or our licensors and are
              protected by applicable laws. You may not copy, modify, distribute, or create derivative works except as
              expressly permitted.
            </p>
            <p className="mt-3">
              Prompt packs and skill templates may be subject to additional licensing terms. See the {" "}
              <Link href="/eula">EULA</Link>.
            </p>

            <h2 className="mt-6">7. Advisory services</h2>
            <p className="mt-3">
              If you engage AI Advisory, the scope, deliverables, and fees will be governed by a separate agreement. Any
              guidance provided is informational and operational in nature and should be reviewed for your specific situation.
            </p>

            <h2 className="mt-6">8. Disclaimers</h2>
            <p className="mt-3">
              THE SITE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED,
              INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>

            <h2 className="mt-6">9. Limitation of liability</h2>
            <p className="mt-3">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
              CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR GOODWILL, ARISING OUT OF OR
              RELATING TO YOUR USE OF THE SITE.
            </p>

            <h2 className="mt-6">10. Contact</h2>
            <p className="mt-3">
              Questions about these Terms? Contact us via {" "}
              <Link href="/contact">/contact</Link>.
            </p>

            <h2 className="mt-6">11. Privacy</h2>
            <p className="mt-3">
              Please review our {" "}
              <Link href="/privacy">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
