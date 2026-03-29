"use client";

import { useState } from "react";
import type { FormEvent } from "react";

const FIRM_SIZE_OPTIONS = ["1-5", "6-15", "16-50", "50+"] as const;

const ROLE_OPTIONS = [
  "Paralegal",
  "Associate",
  "Office Manager",
  "Partner/Owner",
  "Other",
] as const;

const ATTRIBUTION_OPTIONS = [
  "Google search",
  "LinkedIn",
  "Reddit",
  "Referral / word of mouth",
  "Newsletter",
  "Counterbench.ai website",
  "Other",
] as const;

export function WorkshopRegistrationForm({ action }: { action: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const form = e.currentTarget;
    const fd = new FormData(form);

    // Honeypot
    if (String(fd.get("company_url") || "").trim()) {
      setStatus("ok");
      setMessage("You're registered! Check your inbox for confirmation.");
      form.reset();
      return;
    }

    try {
      const res = await fetch(action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: fd,
      });

      if (!res.ok) {
        setStatus("error");
        setMessage("Registration failed. Please try again.");
        return;
      }

      setStatus("ok");
      setMessage("You're registered! Check your inbox for confirmation details.");

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "workshop_register",
        workshop_source: "workshops-landing",
        firm_size: String(fd.get("firm_size") || ""),
        role: String(fd.get("role") || ""),
        attribution: String(fd.get("attribution") || ""),
      });

      form.reset();
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Honeypot */}
      <input
        tabIndex={-1}
        autoComplete="off"
        name="company_url"
        aria-hidden="true"
        style={{
          position: "absolute",
          left: -10000,
          top: "auto",
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
      />
      <input type="hidden" name="type" value="workshop_registration" />

      {/* Row 1: Name + Email */}
      <div className="grid grid--2 grid--gap-2" style={{ gap: "1rem" }}>
        <div>
          <label className="label" htmlFor="wr-name">
            Name
          </label>
          <input
            id="wr-name"
            name="name"
            required
            placeholder="Jane Smith"
            autoComplete="name"
            className="input"
            style={{ borderRadius: 999 }}
          />
        </div>
        <div>
          <label className="label" htmlFor="wr-email">
            Email
          </label>
          <input
            id="wr-email"
            name="email"
            type="email"
            required
            placeholder="you@firm.com"
            autoComplete="email"
            className="input"
            style={{ borderRadius: 999 }}
          />
        </div>
      </div>

      {/* Row 2: Firm name + Firm size */}
      <div className="grid grid--2 grid--gap-2 mt-4" style={{ gap: "1rem" }}>
        <div>
          <label className="label" htmlFor="wr-firm-name">
            Firm name
          </label>
          <input
            id="wr-firm-name"
            name="firm_name"
            required
            placeholder="Smith & Associates"
            autoComplete="organization"
            className="input"
            style={{ borderRadius: 999 }}
          />
        </div>
        <div>
          <label className="label" htmlFor="wr-firm-size">
            Firm size
          </label>
          <select
            id="wr-firm-size"
            name="firm_size"
            required
            className="input"
            defaultValue=""
            style={{ borderRadius: 999 }}
          >
            <option value="" disabled>
              Select size...
            </option>
            {FIRM_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size} people
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 3: Role + Attribution */}
      <div className="grid grid--2 grid--gap-2 mt-4" style={{ gap: "1rem" }}>
        <div>
          <label className="label" htmlFor="wr-role">
            Role
          </label>
          <select
            id="wr-role"
            name="role"
            required
            className="input"
            defaultValue=""
            style={{ borderRadius: 999 }}
          >
            <option value="" disabled>
              Select role...
            </option>
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="wr-attribution">
            How did you hear about us?
          </label>
          <select
            id="wr-attribution"
            name="attribution"
            required
            className="input"
            defaultValue=""
            style={{ borderRadius: 999 }}
          >
            <option value="" disabled>
              Select...
            </option>
            {ATTRIBUTION_OPTIONS.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 4: Biggest AI challenge (optional) */}
      <div className="mt-4">
        <label className="label" htmlFor="wr-challenge">
          Biggest AI challenge{" "}
          <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optional)</span>
        </label>
        <textarea
          id="wr-challenge"
          name="ai_challenge"
          placeholder="What's the biggest challenge your firm faces with AI adoption?"
          rows={3}
          className="input"
          style={{
            borderRadius: 16,
            padding: "12px 14px",
            resize: "vertical",
            minHeight: 80,
          }}
        />
      </div>

      {/* Submit */}
      <div className="mt-4">
        <button
          className="btn btn--primary btn--arrow"
          type="submit"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Registering..." : "Register for Workshop"}
        </button>
      </div>

      {/* Status message */}
      <div
        className="text-muted"
        style={{ fontSize: "0.875rem", marginTop: "0.75rem" }}
        aria-live="polite"
      >
        {message || "Free to attend. No sales pitch. Actionable content only."}
      </div>
    </form>
  );
}
