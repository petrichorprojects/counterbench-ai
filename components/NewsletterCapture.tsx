"use client";

import { useMemo, useState } from "react";

export function NewsletterCapture({ source }: { source: string }) {
  const action = useMemo(() => process.env.NEXT_PUBLIC_NEWSLETTER_FORM_ACTION_URL ?? "", []);
  const provider = useMemo(() => process.env.NEXT_PUBLIC_NEWSLETTER_PROVIDER ?? "generic", []);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  // Provider-agnostic: simple POST form to an external URL.
  // For Formspree, we POST via fetch to keep users on-page.
  // When not configured, keep the UI but don't submit anywhere.
  return (
    <form
      className="newsletter-form"
      data-source={source}
      action={action || undefined}
      method={action ? "post" : undefined}
      onSubmit={async (e) => {
        if (!action) {
          e.preventDefault();
          setStatus("error");
          setMessage("Newsletter form is not configured yet.");
          return;
        }

        if (provider.toLowerCase() !== "formspree") {
          // Let the browser submit normally for other providers.
          return;
        }

        e.preventDefault();
        setStatus("loading");
        setMessage("");

        try {
          const form = e.currentTarget;
          const fd = new FormData(form);
          // Helpful metadata for Formspree inbox filtering.
          fd.set("source", source);

          const res = await fetch(action, {
            method: "POST",
            headers: { Accept: "application/json" },
            body: fd
          });

          if (!res.ok) {
            setStatus("error");
            setMessage("Something went wrong. Try again in a moment.");
            return;
          }

          setStatus("ok");
          setMessage("Subscribed. Check your inbox if confirmation is required.");
          form.reset();
        } catch {
          setStatus("error");
          setMessage("Network error. Please try again.");
        }
      }}
    >
      <label className="sr-only" htmlFor={`email-${source}`}>
        Email
      </label>
      <div className="flex flex--gap-2 flex--resp-col">
        <input
          id={`email-${source}`}
          name="email"
          type="email"
          required
          placeholder="you@firm.com"
          aria-invalid={status === "error" ? true : undefined}
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 999,
            border: "1px solid var(--border)",
            background: "var(--bg2)",
            color: "var(--fg)"
          }}
        />
        <button className="btn btn--primary btn--sm" type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Submitting…" : "Subscribe"}
        </button>
      </div>
      <div
        className="text-muted"
        style={{ fontSize: "0.8125rem", marginTop: "0.75rem" }}
        aria-live="polite"
      >
        {message ? message : `Provider: ${provider}. ${action ? "Configured." : "Not configured."}`}
      </div>
    </form>
  );
}
