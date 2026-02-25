import type { Metadata } from "next";
import { LegalPadClient } from "./LegalPadClient";

export const metadata: Metadata = {
  title: "Legal Pad",
  robots: {
    index: false,
    follow: false
  }
};

export default function LegalPadPage() {
  return (
    <main>
      <section className="section" style={{ paddingTop: 120, paddingBottom: "4rem" }}>
        <div className="container">
          <div className="label">Legal Pad</div>
          <h1 className="max-w-900">Your saved tools, prompts, and skills.</h1>
          <p className="max-w-800 mt-4" style={{ fontSize: "1.125rem" }}>
            This list is saved locally in your browser (no account required).
          </p>

          <div className="card mt-6" style={{ padding: "1.25rem", borderRadius: 12 }}>
            <div className="label">Important</div>
            <div className="text-muted" style={{ marginTop: 8, lineHeight: 1.45 }}>
              Like a paper legal pad, this lives on this device in this browser. If you clear site data, use private
              browsing, or switch devices, you can lose it. Use the <strong>Copy</strong> button to back it up.
            </div>
          </div>

          <LegalPadClient />
        </div>
      </section>
    </main>
  );
}
