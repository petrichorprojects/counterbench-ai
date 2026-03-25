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

  // Validate city — default to boston if missing
  const cityKey = (body.city && body.city in WORKSHOP_CITIES)
    ? (body.city as CityKey)
    : "boston";
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
      // Collect registrant details via Stripe Checkout custom fields
      // See: https://docs.stripe.com/payments/checkout/customization/custom-fields
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
              { label: "1-5 attorneys", value: "1-5" },
              { label: "6-15 attorneys", value: "6-15" },
              { label: "16-50 attorneys", value: "16-50" },
              { label: "50+ attorneys", value: "50+" },
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
              { label: "Office Manager", value: "office_manager" },
              { label: "Partner", value: "partner" },
              { label: "Other", value: "other" },
            ],
          },
        },
        {
          key: "ai_challenge",
          label: { type: "custom", custom: "Biggest AI Challenge (optional)" },
          type: "text",
          optional: true,
        },
      ],
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
