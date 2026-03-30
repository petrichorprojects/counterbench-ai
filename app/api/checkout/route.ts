import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { WORKSHOP_TIERS } from "@/lib/stripe/workshop-products";
import { WORKSHOP_CITIES } from "@/lib/stripe/workshop-cities";
import type { CityKey } from "@/lib/stripe/workshop-cities";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    tierKey?: string;
    earlyBird?: boolean;
    city?: string;
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

  // Validate city — default to "online" (the only current event type)
  const cityKey = (body.city && body.city in WORKSHOP_CITIES)
    ? (body.city as CityKey)
    : "online";
  const cityInfo = WORKSHOP_CITIES[cityKey];

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
        workshop_city: cityKey,
        workshop_city_name: cityInfo.name,
        price_variant: body.earlyBird ? "early_bird" : "full",
      },
      custom_fields: [
        {
          key: "firm_name",
          label: { type: "custom", custom: "Firm Name" },
          type: "text",
        },
        {
          key: "firm_size",
          label: { type: "custom", custom: "Firm Size" },
          type: "dropdown",
          dropdown: {
            options: [
              { label: "1-5 attorneys", value: "small" },
              { label: "6-15 attorneys", value: "midsize" },
              { label: "16-50 attorneys", value: "large" },
              { label: "50+ attorneys", value: "enterprise" },
            ],
          },
        },
        {
          key: "role",
          label: { type: "custom", custom: "Your Role" },
          type: "dropdown",
          dropdown: {
            options: [
              { label: "Paralegal", value: "paralegal" },
              { label: "Associate", value: "associate" },
              { label: "Office Manager", value: "officemanager" },
              { label: "Partner", value: "partner" },
              { label: "Other", value: "other" },
            ],
          },
        },
      ],
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[checkout] Stripe session creation failed:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
