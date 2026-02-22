import Link from "next/link";

export const metadata = { title: "Privacy" };

const LAST_UPDATED = "2026-02-21";

export default function PrivacyPage() {
  return (
    <main>
      <section className="section" style={{ paddingTop: 120, paddingBottom: "4rem" }}>
        <div className="container">
          <div className="label">Privacy</div>
          <h1 className="max-w-900">Privacy policy</h1>
          <p className="max-w-700 mt-4 lead">Last updated: {LAST_UPDATED}</p>

          <div className="mt-6" style={{ maxWidth: 920 }}>
            <h2>Summary</h2>
            <ul className="list mt-4">
              <li>We collect information you submit (for example, your email for the newsletter).</li>
              <li>We use that information to operate Counterbench.AI and communicate with you.</li>
              <li>We do not sell personal information.</li>
              <li>We use service providers (for example, Formspree for form submissions and Vercel for hosting).</li>
            </ul>

            <h2 className="mt-6">Scope</h2>
            <p className="mt-3">This Privacy Policy applies to the Counterbench.AI website and related pages we operate (the "Site").</p>

            <h2 className="mt-6">Information we collect</h2>

            <h3 className="mt-4">Information you provide</h3>
            <ul className="list mt-3">
              <li>Newsletter signups: email address and any fields you submit.</li>
              <li>Contact or advisory inquiries: name, email, and message content you send us.</li>
            </ul>

            <h3 className="mt-4">Information collected automatically</h3>
            <ul className="list mt-3">
              <li>
                Basic usage and log data: IP address, device/browser info, referring pages, and timestamps (typical server
                logs).
              </li>
              <li>
                Cookies/local storage: we may use limited browser storage for site functionality (for example, compare
                lists).
              </li>
            </ul>

            <h2 className="mt-6">How we use information</h2>
            <ul className="list mt-3">
              <li>Provide and improve the Site and its directory features.</li>
              <li>Send newsletters and operational emails you request.</li>
              <li>Prevent abuse, debug issues, and maintain security.</li>
              <li>Respond to support, contact, or advisory inquiries.</li>
            </ul>

            <h2 className="mt-6">Service providers</h2>
            <p className="mt-3">
              We use third-party services to operate parts of the Site. These providers process data on our behalf under
              their own terms and privacy policies.
            </p>
            <ul className="list mt-3">
              <li>
                Form submissions: Formspree (newsletter and contact form processing). See their policy: {" "}
                <a href="https://formspree.io/legal/privacy-policy" target="_blank" rel="noreferrer">
                  Formspree Privacy Policy
                </a>
                .
              </li>
              <li>
                Hosting/edge delivery: Vercel (Site hosting and delivery). See their policy: {" "}
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer">
                  Vercel Privacy Policy
                </a>
                .
              </li>
            </ul>

            <h2 className="mt-6">Sharing</h2>
            <p className="mt-3">
              We share personal information only as needed to operate the Site, comply with law, or protect our rights.
              We do not sell personal information.
            </p>

            <h2 className="mt-6">Data retention</h2>
            <p className="mt-3">
              We retain information as long as needed for the purposes described above, unless a longer retention period
              is required or permitted by law.
            </p>

            <h2 className="mt-6">Your choices</h2>
            <ul className="list mt-3">
              <li>You can unsubscribe from the newsletter using the link in any email.</li>
              <li>
                You can request access, correction, or deletion by contacting us through the {" "}
                <Link href="/contact">contact page</Link>.
              </li>
            </ul>

            <h2 className="mt-6">Security</h2>
            <p className="mt-3">
              We use reasonable safeguards to protect information. No method of transmission or storage is completely
              secure.
            </p>

            <h2 className="mt-6">Children</h2>
            <p className="mt-3">The Site is not intended for children under 13 and we do not knowingly collect their information.</p>

            <h2 className="mt-6">Changes</h2>
            <p className="mt-3">We may update this policy from time to time. We will revise the "Last updated" date above.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
