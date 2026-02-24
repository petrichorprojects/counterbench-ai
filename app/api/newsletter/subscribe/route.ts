import { NextResponse } from "next/server";

function isValidEmail(email: string): boolean {
  if (!email) return false;
  const e = email.trim();
  if (e.length < 5 || e.length > 254) return false;
  // Lightweight validation; the provider will validate further.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

async function readBody(req: Request): Promise<{ email: string; source: string; hp: string }> {
  const ct = req.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const j = (await req.json().catch(() => ({}))) as { email?: unknown; source?: unknown; hp?: unknown };
    return {
      email: typeof j.email === "string" ? j.email : "",
      source: typeof j.source === "string" ? j.source : "",
      hp: typeof j.hp === "string" ? j.hp : ""
    };
  }

  const fd = await req.formData().catch(() => null);
  if (!fd) return { email: "", source: "", hp: "" };
  const email = fd.get("email");
  const source = fd.get("source");
  const hp = fd.get("company"); // honeypot
  return {
    email: typeof email === "string" ? email : "",
    source: typeof source === "string" ? source : "",
    hp: typeof hp === "string" ? hp : ""
  };
}

export async function POST(req: Request) {
  const { email, source, hp } = await readBody(req);

  // Honeypot: pretend success for bots.
  if (hp && hp.trim()) {
    return NextResponse.json({ ok: true });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false, message: "Enter a valid email." }, { status: 400 });
  }

  const provider = (process.env.NEWSLETTER_PROVIDER || process.env.NEXT_PUBLIC_NEWSLETTER_PROVIDER || "beehiiv").toLowerCase();

  if (provider !== "beehiiv") {
    return NextResponse.json({ ok: false, message: "Newsletter provider is not configured for server signup." }, { status: 400 });
  }

  const apiKey = process.env.BEEHIIV_API_KEY || "";
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID || "";
  const sendWelcome = (process.env.BEEHIIV_SEND_WELCOME_EMAIL || "true").toLowerCase() !== "false";

  if (!apiKey || !publicationId) {
    return NextResponse.json({ ok: false, message: "Beehiiv is not configured on the server." }, { status: 500 });
  }

  // Beehiiv v2 uses publication IDs like `pub_...`. Accept either `pub_...` or the raw UUID to reduce setup friction.
  const normalizedPublicationId = publicationId.startsWith("pub_") ? publicationId : `pub_${publicationId}`;

  const endpoint = `https://api.beehiiv.com/v2/publications/${encodeURIComponent(normalizedPublicationId)}/subscriptions`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      email: email.trim(),
      reactivate_existing: true,
      send_welcome_email: sendWelcome,
      utm_source: source || "counterbench",
      utm_medium: "site",
      utm_campaign: "newsletter"
    })
  }).catch(() => null);

  if (!res || !res.ok) {
    const details = res ? await res.text().catch(() => "") : "";
    // Avoid echoing provider errors directly (may contain internal info).
    return NextResponse.json(
      {
        ok: false,
        message: "Subscription failed. Try again in a moment.",
        // Useful for debugging in logs; not intended for UI display.
        _debug: details ? details.slice(0, 500) : undefined
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
