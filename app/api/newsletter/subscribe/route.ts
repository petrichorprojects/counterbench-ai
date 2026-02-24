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

function getProvider(): string {
  return (process.env.NEWSLETTER_PROVIDER || process.env.NEXT_PUBLIC_NEWSLETTER_PROVIDER || "beehiiv").toLowerCase();
}

function getConfigStatus() {
  const provider = getProvider();
  const publicationIdRaw = (process.env.BEEHIIV_PUBLICATION_ID || "").trim();
  const apiKey = (process.env.BEEHIIV_API_KEY || "").trim();
  const sendWelcome = (process.env.BEEHIIV_SEND_WELCOME_EMAIL || "true").toLowerCase() !== "false";

  return {
    provider,
    beehiiv: {
      configured: provider === "beehiiv" && Boolean(publicationIdRaw) && Boolean(apiKey),
      hasPublicationId: Boolean(publicationIdRaw),
      publicationIdLooksV2: publicationIdRaw.startsWith("pub_") || publicationIdRaw.length === 36,
      hasApiKey: Boolean(apiKey),
      sendWelcome
    }
  };
}

export async function GET() {
  // Safe status endpoint (no secrets) to debug env wiring without creating a subscription.
  return NextResponse.json({ ok: true, ...getConfigStatus() });
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

  const provider = getProvider();

  if (provider !== "beehiiv") {
    return NextResponse.json({ ok: false, message: "Newsletter provider is not configured for server signup." }, { status: 400 });
  }

  const apiKey = (process.env.BEEHIIV_API_KEY || "").trim();
  const publicationIdRaw = (process.env.BEEHIIV_PUBLICATION_ID || "").trim();
  const sendWelcome = (process.env.BEEHIIV_SEND_WELCOME_EMAIL || "true").toLowerCase() !== "false";

  if (!apiKey || !publicationIdRaw) {
    return NextResponse.json({ ok: false, message: "Beehiiv is not configured on the server." }, { status: 500 });
  }

  // Beehiiv v2 uses publication IDs like `pub_...`. Accept either `pub_...` or the raw UUID.
  const normalizedPublicationId = publicationIdRaw.startsWith("pub_")
    ? publicationIdRaw.replace(/^pub_pub_/, "pub_")
    : `pub_${publicationIdRaw}`;

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

  if (!res) {
    console.warn("[newsletter] Beehiiv request failed: no response");
    return NextResponse.json({ ok: false, message: "Subscription failed. Try again in a moment." }, { status: 502 });
  }

  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");

    // Treat common "already subscribed" responses as success to avoid user confusion.
    if (res.status === 409 || /already\s+(subscribed|exists)/i.test(bodyText)) {
      return NextResponse.json({ ok: true });
    }

    console.warn("[newsletter] Beehiiv subscribe failed", {
      status: res.status,
      body: bodyText.slice(0, 500)
    });

    return NextResponse.json({ ok: false, message: "Subscription failed. Try again in a moment." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
