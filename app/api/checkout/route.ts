import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { WORKSHOP_TIERS } from "@/lib/stripe/workshop-products";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    tierKey?: string;
    earlyBird?: boolean;
  } | null;

  if (!body?.tierKey) {
    return NextResponse.json(
      { error: "Missing tierKey" },
      { status: 400 }
    );
  }

  const tier = WORKSHOP_TIERS.find((t) => t.key === body.tierKey);
  if (!tier) {
    return NextResponse.json(
      { error: "Invalid tier" },
      { status: 400 }
    );
  }

  const priceId = body.earlyBird ? tier.earlyBirdPriceId : tier.priceId;
  if (!priceId) {
    return NextResponse.json(
      { error: "Stripe prices not configured yet. Run the setup script first." },
      { status: 500 }
    );
  }

  try {
    const stripe = getStripe();

    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://counterbench.ai";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/workshop/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/workshop?canceled=true`,
      metadata: {
        workshop_tier: tier.key,
        price_variant: body.earlyBird ? "early_bird" : "full",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[checkout] Stripe session creation failed:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
