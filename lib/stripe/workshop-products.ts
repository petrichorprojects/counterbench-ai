/**
 * Workshop ticket product & price configuration.
 *
 * Prices are one-time (not subscriptions).
 * Early-bird discount: $100 off for the first 10 registrants per tier.
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
    productId: "", // TODO: populate after Stripe setup
    priceId: "", // TODO: populate after Stripe setup
    earlyBirdPriceId: "", // TODO: populate after Stripe setup
    priceInCents: 59700,
    earlyBirdPriceInCents: 49700,
    earlyBirdCap: 10,
    description: "Full workshop access",
    features: [
      "Full-day workshop access",
      "Workshop materials & templates",
      "Certificate of completion",
    ],
  },
  {
    key: "premium",
    name: "Premium",
    productId: "", // TODO: populate after Stripe setup
    priceId: "", // TODO: populate after Stripe setup
    earlyBirdPriceId: "", // TODO: populate after Stripe setup
    priceInCents: 89700,
    earlyBirdPriceInCents: 79700,
    earlyBirdCap: 10,
    description: "Workshop + extras",
    features: [
      "Everything in Standard",
      "1-on-1 follow-up session",
      "Priority Q&A access",
      "Bonus resource pack",
    ],
  },
  {
    key: "firm",
    name: "Firm Package",
    productId: "", // TODO: populate after Stripe setup
    priceId: "", // TODO: populate after Stripe setup
    earlyBirdPriceId: "", // TODO: populate after Stripe setup
    priceInCents: 249700,
    earlyBirdPriceInCents: 239700,
    earlyBirdCap: 10,
    description: "Team access for your firm",
    features: [
      "Everything in Premium",
      "Up to 5 team members",
      "Firm-specific implementation plan",
      "Dedicated support channel",
      "Post-workshop consulting session",
    ],
  },
];

/** Format cents to display price string */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
