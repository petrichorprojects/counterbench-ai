"use client";

import { useState } from "react";
import { MODULES } from "./modules";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="btn btn--ghost btn--sm"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? "Copied!" : "Copy prompt"}
    </button>
  );
}

function ModuleCard({ mod }: { mod: (typeof MODULES)[number] }) {
  const [open, setOpen] = useState(mod.number === 1);
  const [showExample, setShowExample] = useState(false);

  if (mod.locked) {
    return (
      <div
        className="card"
        style={{
          padding: "1.5rem",
          borderRadius: 12,
          opacity: 0.55,
          display: "flex",
          alignItems: "flex-start",
          gap: "1rem",
        }}
      >
        <div
          style={{
            minWidth: 36,
            height: 36,
            borderRadius: "50%",
            border: "1.5px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.8rem",
            fontWeight: 700,
            color: "var(--text-muted)",
          }}
        >
          {mod.number}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 650, fontSize: "0.9375rem", color: "var(--fg)" }}>
            {mod.skill}
          </div>
          <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: 4 }}>
            {mod.exercise}
          </div>
          <div
            style={{
              marginTop: 10,
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Unlock with Practitioner
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="card"
      style={{
        borderRadius: 12,
        overflow: "hidden",
        border: open ? "1px solid var(--accent, #4f6ef7)" : undefined,
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          padding: "1.5rem",
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "flex-start",
          gap: "1rem",
          textAlign: "left",
        }}
      >
        <div
          style={{
            minWidth: 36,
            height: 36,
            borderRadius: "50%",
            background: "var(--accent, #4f6ef7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.8rem",
            fontWeight: 700,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {mod.number}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--fg)" }}>
            {mod.skill}
          </div>
          <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: 4 }}>
            {mod.exercise}
          </div>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          style={{
            flexShrink: 0,
            marginTop: 8,
            transform: open ? "rotate(180deg)" : undefined,
            transition: "transform 0.2s",
            color: "var(--text-muted)",
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div style={{ padding: "0 1.5rem 1.5rem" }}>
          <div
            style={{
              paddingTop: "1.25rem",
              borderTop: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                fontSize: "0.9375rem",
                lineHeight: 1.65,
                color: "var(--fg)",
                marginBottom: "1.5rem",
              }}
            >
              {mod.concept}
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--text-muted)",
                  marginBottom: 8,
                }}
              >
                Without role / constraints
              </div>
              <div
                style={{
                  background: "var(--surface-2, rgba(255,255,255,0.04))",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "0.875rem 1rem",
                  fontSize: "0.875rem",
                  fontFamily: "monospace",
                  whiteSpace: "pre-wrap",
                  color: "var(--text-muted)",
                  lineHeight: 1.6,
                }}
              >
                {mod.starterPrompt}
              </div>
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--text-muted)",
                  marginBottom: 8,
                }}
              >
                Power user prompt
              </div>
              <div
                style={{
                  background: "var(--surface-2, rgba(255,255,255,0.04))",
                  border: "1px solid var(--accent, #4f6ef7)",
                  borderRadius: 8,
                  padding: "0.875rem 1rem",
                  fontSize: "0.875rem",
                  fontFamily: "monospace",
                  whiteSpace: "pre-wrap",
                  color: "var(--fg)",
                  lineHeight: 1.6,
                }}
              >
                {mod.improvedPrompt}
              </div>
              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                <CopyButton text={mod.improvedPrompt} />
                <button
                  className="btn btn--ghost btn--sm"
                  onClick={() => setShowExample((v) => !v)}
                >
                  {showExample ? "Hide example" : "See example output"}
                </button>
              </div>
            </div>

            {showExample && (
              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--text-muted)",
                    marginBottom: 8,
                  }}
                >
                  Example output
                </div>
                <div
                  style={{
                    background: "var(--surface-2, rgba(255,255,255,0.04))",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "0.875rem 1rem",
                    fontSize: "0.875rem",
                    whiteSpace: "pre-wrap",
                    color: "var(--fg)",
                    lineHeight: 1.65,
                  }}
                >
                  {mod.exampleOutput}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function TrainingTrack() {
  return (
    <section id="track" className="section section--alt section--border-t" style={{ paddingTop: "4rem", paddingBottom: "6rem" }}>
      <div className="container" style={{ maxWidth: 760 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {MODULES.map((mod) => (
            <ModuleCard key={mod.number} mod={mod} />
          ))}
        </div>

        <div
          id="unlock"
          style={{
            marginTop: "3rem",
            padding: "2rem",
            borderRadius: 16,
            border: "1px solid var(--border)",
            background: "var(--surface-2, rgba(255,255,255,0.03))",
            textAlign: "center",
          }}
        >
          <div className="label" style={{ marginBottom: 12 }}>
            Practitioner — $97
          </div>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>
            Unlock all 10 modules
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9375rem", marginBottom: "1.5rem", maxWidth: 480, margin: "0 auto 1.5rem" }}>
            Full track + prompt cheatsheet PDF + 3 downloadable skill files for Claude Projects.
            Works with Claude, ChatGPT, or any LLM.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              className="btn btn--primary btn--arrow"
              href="https://buy.stripe.com/training-practitioner"
              target="_blank"
              rel="noopener noreferrer"
            >
              Buy now — $97
            </a>
            <a className="btn btn--secondary" href="/advisory">
              Need team training?
            </a>
          </div>
          <div style={{ marginTop: "1.25rem", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            30-day money-back guarantee. Instant access after purchase.
          </div>
        </div>
      </div>
    </section>
  );
}
