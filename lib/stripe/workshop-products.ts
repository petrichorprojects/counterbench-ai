/**
 * Workshop ticket product & price configuration.
 *
 * Online-first: 2 tiers (Standard + Premium). Firm Package available for in-person events later.
 *
 * After running `scripts/stripe-setup-workshop.ts`, replace the placeholder
 * `priceId` / `earlyBirdPriceId` values with the real Stripe price IDs it outputs.
 */

export interface WorkshopTier {
  key: string;
  name: string;
  /** Stripe product ID — populated after setup script runs */
  productId: string;
  /** Full-price Stripe price ID */
  priceId: string;
  /** Early-bird Stripe price ID ($100 off) */
  earlyBirdPriceId: string;
  /** Standard price in cents */
  priceInCents: number;
  /** Early-bird price in cents */
  earlyBirdPriceInCents: number;
  /** Max early-bird registrations before reverting to full price */
  earlyBirdCap: number;
  description: string;
  features: string[];
}

export const WORKSHOP_TIERS: WorkshopTier[] = [
  {
    key: "standard",
    name: "Standard",
    productId: "prod_UDPcAxtRQ2EkcI",
    priceId: "price_1TEyn22KjfdZWqhLzcaG93B4",
    earlyBirdPriceId: "price_1TEyn22KjfdZWqhLLfABrax4",
    priceInCents: 29700,
    earlyBirdPriceInCents: 19700,
    earlyBirdCap: 10,
    description: "Full workshop access",
    features: [
      "Full-day live workshop (6 hours)",
      "Digital workshop materials",
      "Prompt template library",
      "Certificate of completion",
      "Workshop recording access (30 days)",
    ],
  },
  {
    key: "premium",
    name: "Premium",
    productId: "prod_UDPcoXyk7vGfXd",
    priceId: "price_1TEyn32KjfdZWqhLswCYFryB",
    earlyBirdPriceId: "price_1TEyn32KjfdZWqhL0n4G2TMR",
    priceInCents: 49700,
    earlyBirdPriceInCents: 39700,
    earlyBirdCap: 10,
    description: "Workshop + 1-on-1 follow-up",
    features: [
      "Everything in Standard",
      "1-on-1 follow-up session (30 min)",
      "Priority Q&A access during workshop",
      "Recording access (90 days)",
      "Bonus resource pack",
    ],
  },
];

/** Format cents to display price string */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
