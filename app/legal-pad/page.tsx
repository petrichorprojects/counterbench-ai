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

          <LegalPadClient />
        </div>
      </section>
    </main>
  );
}
