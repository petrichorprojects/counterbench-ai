"use client";

import { useState } from "react";
import Link from "next/link";

const TOPICS = ["Partnership", "Tool listing", "Advisory", "Other"] as const;

const fieldStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--bg2)",
  color: "var(--fg)"
} as const;

export function ContactForm({ source = "contact-page" }: { source?: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  if (status === "ok") {
    return (
      <div aria-live="polite" style={{ marginTop: "1.5rem" }}>
        <p style={{ fontSize: "1.125rem" }}>Thanks — we got it.</p>
        <p className="text-muted" style={{ fontSize: "0.9375rem" }}>
          We reply to most requests within one business day.
        </p>
      </div>
    );
  }

  return (
    <form
      style={{ marginTop: "1.5rem", maxWidth: 640 }}
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);

        // Bot honeypot — pretend success.
        const hp = String(fd.get("company") || "");
        if (hp.trim()) {
          setStatus("ok");
          return;
        }

        setStatus("loading");
        setMessage("");

        try {
          const res = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({
              name: String(fd.get("name") || "").trim(),
              email: String(fd.get("email") || "").trim(),
              firm: String(fd.get("firm") || "").trim(),
              topic: String(fd.get("topic") || "Other"),
              message: String(fd.get("message") || "").trim(),
              source,
              hp
            })
          });

          const data = (await res.json().catch(() => ({}))) as { message?: string };

          if (!res.ok) {
            setStatus("error");
            setMessage(data.message || "Something went wrong. Try again in a moment.");
            return;
          }

          setStatus("ok");
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({ event: "contact_submit", contact_source: source });
          form.reset();
        } catch {
          setStatus("error");
          setMessage("Network error. Please try again.");
        }
      }}
    >
      {/* Honeypot — hidden from humans, tempting to bots. */}
      <input
        tabIndex={-1}
        autoComplete="off"
        name="company"
        aria-hidden="true"
        style={{
          position: "absolute",
          left: -10000,
          top: "auto",
          width: 1,
          height: 1,
          overflow: "hidden"
        }}
      />

      <div className="flex flex--gap-2 flex--resp-col" style={{ marginBottom: "0.75rem" }}>
        <div style={{ width: "100%" }}>
          <label htmlFor="contact-name" style={{ display: "block", marginBottom: 6 }}>
            Name
          </label>
          <input id="contact-name" name="name" type="text" required maxLength={120} style={fieldStyle} />
        </div>
        <div style={{ width: "100%" }}>
          <label htmlFor="contact-email" style={{ display: "block", marginBottom: 6 }}>
            Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="you@firm.com"
            style={fieldStyle}
          />
        </div>
      </div>

      <div className="flex flex--gap-2 flex--resp-col" style={{ marginBottom: "0.75rem" }}>
        <div style={{ width: "100%" }}>
          <label htmlFor="contact-firm" style={{ display: "block", marginBottom: 6 }}>
            Firm <span className="text-muted">(optional)</span>
          </label>
          <input id="contact-firm" name="firm" type="text" maxLength={160} style={fieldStyle} />
        </div>
        <div style={{ width: "100%" }}>
          <label htmlFor="contact-topic" style={{ display: "block", marginBottom: 6 }}>
            Reason
          </label>
          <select id="contact-topic" name="topic" defaultValue="Advisory" style={fieldStyle}>
            {TOPICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="contact-message" style={{ display: "block", marginBottom: 6 }}>
          What do you need?
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          maxLength={5000}
          placeholder="A few sentences is plenty."
          style={{ ...fieldStyle, resize: "vertical" }}
        />
      </div>

      <button className="btn btn--primary" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Sending…" : "Send"}
      </button>

      <div
        className="text-muted"
        style={{ fontSize: "0.8125rem", marginTop: "0.75rem" }}
        aria-live="polite"
      >
        {message ? (
          message
        ) : (
          <>
            We&rsquo;ll only use this to reply.{" "}
            <Link href="/privacy" className="text-muted" style={{ textDecoration: "underline" }}>
              Privacy
            </Link>
            .
          </>
        )}
      </div>
    </form>
  );
}
