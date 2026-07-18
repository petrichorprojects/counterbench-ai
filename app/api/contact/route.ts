import { NextResponse } from "next/server";
import { Resend } from "resend";

// Force dynamic — prevents build-time evaluation of this module.
// Without this, missing RESEND_API_KEY at build breaks `next build`
// during page-data collection.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// In-memory rate limiter: 5 POSTs per IP per hour.
// Entries auto-expire so the map doesn't grow unbounded.
// ---------------------------------------------------------------------------
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

const ipHits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (ipHits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (timestamps.length >= RATE_LIMIT_MAX) {
    ipHits.set(ip, timestamps);
    return true;
  }

  timestamps.push(now);
  ipHits.set(ip, timestamps);
  return false;
}

// Periodic cleanup every 10 minutes to prevent unbounded growth.
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of ipHits) {
    const valid = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (valid.length === 0) {
      ipHits.delete(ip);
    } else {
      ipHits.set(ip, valid);
    }
  }
}, 10 * 60 * 1000).unref();

function getClientIp(req: Request): string {
  // Vercel sets x-forwarded-for; fall back to x-real-ip.
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0];
    return first ? first.trim() : "unknown";
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TOPICS = ["Partnership", "Tool listing", "Advisory", "Other"] as const;

const MAX_NAME = 120;
const MAX_FIRM = 160;
const MAX_MESSAGE = 5000;

function isValidEmail(email: string): boolean {
  if (!email) return false;
  const e = email.trim();
  if (e.length < 5 || e.length > 254) return false;
  // Lightweight validation; the mail provider will validate further.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

type ContactBody = {
  name: string;
  email: string;
  firm: string;
  topic: string;
  message: string;
  source: string;
  hp: string;
};

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

/**
 * Forward the lead to n8n (which posts it to Slack).
 *
 * This MUST be awaited. On serverless the runtime is frozen as soon as the
 * handler returns, so a fire-and-forget fetch is silently dropped and the
 * lead never arrives. Bounded by a timeout and never throws, so a slow or
 * down n8n cannot fail the visitor's submission.
 */
async function forwardToN8n(payload: Record<string, unknown>): Promise<void> {
  const url = process.env.N8N_LEAD_WEBHOOK_URL;
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3000)
    });
  } catch (err) {
    console.error({ event: "contact_n8n_forward_failed", err });
  }
}

async function readBody(req: Request): Promise<ContactBody> {
  const ct = req.headers.get("content-type") || "";

  if (ct.includes("application/json")) {
    const j = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    return {
      name: str(j.name),
      email: str(j.email),
      firm: str(j.firm),
      topic: str(j.topic),
      message: str(j.message),
      source: str(j.source),
      hp: str(j.hp)
    };
  }

  const fd = await req.formData().catch(() => null);
  if (!fd) {
    return { name: "", email: "", firm: "", topic: "", message: "", source: "", hp: "" };
  }
  return {
    name: str(fd.get("name")),
    email: str(fd.get("email")),
    firm: str(fd.get("firm")),
    topic: str(fd.get("topic")),
    message: str(fd.get("message")),
    source: str(fd.get("source")),
    hp: str(fd.get("company")) // honeypot
  };
}

export async function POST(req: Request) {
  // --- Rate limit check (before parsing body) ---
  const clientIp = getClientIp(req);
  if (isRateLimited(clientIp)) {
    return NextResponse.json(
      { ok: false, message: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const body = await readBody(req);

  // Honeypot: pretend success for bots.
  if (body.hp.trim()) {
    return NextResponse.json({ ok: true });
  }

  const name = body.name.trim().slice(0, MAX_NAME);
  const email = body.email.trim();
  const firm = body.firm.trim().slice(0, MAX_FIRM);
  const message = body.message.trim().slice(0, MAX_MESSAGE);
  const topic = (TOPICS as readonly string[]).includes(body.topic) ? body.topic : "Other";
  const source = body.source.trim().slice(0, 120);

  if (!name) {
    return NextResponse.json({ ok: false, message: "Enter your name." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false, message: "Enter a valid email." }, { status: 400 });
  }
  if (message.length < 10) {
    return NextResponse.json(
      { ok: false, message: "Tell us a bit more about what you need." },
      { status: 400 }
    );
  }

  // Notify Slack via n8n BEFORE sending mail. A contact request is a lead —
  // it must surface even if Resend is unconfigured or erroring, which is the
  // failure mode that would otherwise lose it silently.
  await forwardToN8n({
    business: "CounterbenchAI",
    cta: `Contact — ${topic}`,
    name,
    email,
    message,
    ...(firm ? { firm } : {}),
    ...(source ? { source } : {})
  });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error({ event: "contact_no_resend_key" });
    // Slack already has the lead; don't fail the visitor's submission.
    return NextResponse.json({ ok: true });
  }

  const submittedAt = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: process.env.RESEND_FROM || "noreply@counterbench.ai",
      to: process.env.CONTACT_TO || "hello@counterbench.ai",
      replyTo: email,
      subject: `Contact — ${topic} | ${name}`,
      text: [
        `New contact request from counterbench.ai`,
        ``,
        `Name: ${name}`,
        `Email: ${email}`,
        firm ? `Firm: ${firm}` : null,
        `Topic: ${topic}`,
        source ? `Source: ${source}` : null,
        `Received: ${submittedAt} ET`,
        ``,
        `Message:`,
        message
      ]
        .filter((line) => line !== null)
        .join("\n")
    });
  } catch (err) {
    console.error({ event: "contact_email_error", err });
    // Slack already has the lead; don't fail the visitor's submission.
  }

  return NextResponse.json({ ok: true });
}
