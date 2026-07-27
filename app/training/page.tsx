import type { Metadata } from "next";
import { TrainingTrack } from "./TrainingTrack";

export const metadata: Metadata = {
  title: "AI Proficiency Track",
  description:
    "10 modules. Real legal tasks. Learn to get consistent, high-quality output from AI tools — in 3 hours.",
};

export default function TrainingPage() {
  return (
    <main>
      <section className="section" style={{ paddingTop: 120, paddingBottom: "4rem" }}>
        <div className="container">
          <div className="label">Training</div>
          <h1 className="max-w-900">AI Proficiency Track</h1>
          <p className="max-w-700 mt-4" style={{ fontSize: "1.125rem" }}>
            10 modules. Real legal tasks. The 10-skill framework that separates legal professionals
            who get consistent AI output from those who get lucky.
          </p>

          <div className="mt-5 flex flex--gap-2 flex--resp-col">
            <a className="btn btn--primary btn--arrow" href="#track">
              Start Module 1 — free
            </a>
            <a className="btn btn--secondary" href="#unlock">
              Unlock full track — $97
            </a>
          </div>

          <div
            className="mt-6 flex flex--gap-3"
            style={{ flexWrap: "wrap", fontSize: "0.875rem", color: "var(--text-muted)" }}
          >
            <span>No account needed for Modules 1-3</span>
            <span>Works with Claude, ChatGPT, or any LLM</span>
            <span>Built for paralegals and solo attorneys</span>
          </div>
        </div>
      </section>

      <TrainingTrack />
    </main>
  );
}
