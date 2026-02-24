"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

function normalizeProvider(p: string): "formspree" | "beehiiv" | "generic" {
  const v = (p || "").trim().toLowerCase();
  if (v === "formspree") return "formspree";
  if (v === "beehiiv") return "beehiiv";
  return "generic";
}

export function NewsletterCapture({ source }: { source: string }) {
  const action = useMemo(() => process.env.NEXT_PUBLIC_NEWSLETTER_FORM_ACTION_URL ?? "", []);
  const provider = useMemo(() => normalizeProvider(process.env.NEXT_PUBLIC_NEWSLETTER_PROVIDER ?? "generic"), []);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  // Provider-agnostic: simple POST form to an external URL.
  // For Formspree, we POST via fetch to keep users on-page.
  // For Beehiiv, we POST to an internal API route (keeps keys server-side).
  return (
    <form
      className="newsletter-form"
      data-source={source}
      action={action || undefined}
      method={action ? "post" : undefined}
      onSubmit={async (e) => {
        const form = e.currentTarget;

        // Always keep users on-page for the common providers.
        e.preventDefault();
        setStatus("loading");
        setMessage("");

        const fd = new FormData(form);
        fd.set("source", source);

        // Bot honeypot.
        const hp = String(fd.get("company") || "");
        if (hp.trim()) {
          setStatus("ok");
          setMessage("Subscribed.");
          form.reset();
          return;
        }

        try {
          if (provider === "beehiiv") {
            const email = String(fd.get("email") || "").trim();
            const res = await fetch("/api/newsletter/subscribe", {
              method: "POST",
              headers: { "Content-Type": "application/json", Accept: "application/json" },
              body: JSON.stringify({ email, source, hp })
            });

            if (!res.ok) {
              setStatus("error");
              setMessage("Subscription failed. Try again in a moment.");
              return;
            }

            setStatus("ok");
            setMessage("Subscribed. Check your inbox if confirmation is required.");
            form.reset();
            return;
          }

          if (provider === "formspree") {
            if (!action) {
              setStatus("error");
              setMessage("Newsletter signup is temporarily unavailable.");
              return;
            }

            const res = await fetch(action, {
              method: "POST",
              headers: { Accept: "application/json" },
              body: fd
            });

            if (!res.ok) {
              setStatus("error");
              setMessage("Subscription failed. Try again in a moment.");
              return;
            }

            setStatus("ok");
            setMessage("Subscribed. Check your inbox if confirmation is required.");
            form.reset();
            return;
          }

          // Generic provider: fall back to a normal POST if configured.
          if (!action) {
            setStatus("error");
            setMessage("Newsletter signup is temporarily unavailable.");
            return;
          }
          form.submit();
        } catch {
          setStatus("error");
          setMessage("Network error. Please try again.");
        }
      }}
    >
      <label className="sr-only" htmlFor={`email-${source}`}>
        Email
      </label>
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
      <div className="flex flex--gap-2 flex--resp-col">
        <input
          id={`email-${source}`}
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
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
        {message ? (
          message
        ) : (
          <>
            Weekly updates. Unsubscribe anytime.{" "}
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
