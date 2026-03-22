import Stripe from "stripe";

let _stripe: Stripe | null = null;

/**
 * Server-side Stripe client singleton.
 * Requires STRIPE_SECRET_KEY in environment.
 */
export function getStripe(): Stripe {
  if (_stripe) return _stripe;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }

  _stripe = new Stripe(key, {
    apiVersion: "2026-02-25.clover",
  });

  return _stripe;
}
