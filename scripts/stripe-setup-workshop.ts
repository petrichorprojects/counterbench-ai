#!/usr/bin/env tsx
/**
 * One-time setup script: creates Stripe products and prices for workshop tiers.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_... npx tsx scripts/stripe-setup-workshop.ts
 *
 * This script is idempotent — it checks for existing products by metadata
 * before creating new ones. Safe to re-run.
 *
 * After running, copy the output price IDs into lib/stripe/workshop-products.ts.
 */

import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  console.error("Error: Set STRIPE_SECRET_KEY environment variable.");
  console.error("  Use your TEST mode key (sk_test_...).");
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2026-02-25.clover",
});

interface TierSpec {
  key: string;
  name: string;
  description: string;
  priceInCents: number;
  earlyBirdPriceInCents: number;
}

/**
 * Must match lib/stripe/workshop-products.ts exactly.
 * 2 tiers: Standard ($297 / $197 early bird), Premium ($497 / $397 early bird).
 */
const TIERS: TierSpec[] = [
  {
    key: "standard",
    name: "CounterbenchAI Workshop — Standard",
    description: "Full-day workshop access with materials and certificate",
    priceInCents: 29700,
    earlyBirdPriceInCents: 19700,
  },
  {
    key: "premium",
    name: "CounterbenchAI Workshop — Premium",
    description:
      "Workshop access plus 1-on-1 follow-up, priority Q&A, and bonus resources",
    priceInCents: 49700,
    earlyBirdPriceInCents: 39700,
  },
];

async function findExistingProduct(
  key: string
): Promise<Stripe.Product | null> {
  const products = await stripe.products.search({
    query: `metadata["workshop_tier"]:"${key}"`,
  });
  return products.data[0] ?? null;
}

async function setupTier(spec: TierSpec) {
  console.log(`\n--- ${spec.name} ---`);

  // Check for existing product
  let product = await findExistingProduct(spec.key);

  if (product) {
    console.log(`  Product already exists: ${product.id}`);
  } else {
    product = await stripe.products.create({
      name: spec.name,
      description: spec.description,
      metadata: {
        workshop_tier: spec.key,
        type: "workshop_ticket",
      },
    });
    console.log(`  Created product: ${product.id}`);
  }

  // Find existing prices for this product
  const existingPrices = await stripe.prices.list({
    product: product.id,
    active: true,
  });

  let fullPrice = existingPrices.data.find(
    (p) => p.unit_amount === spec.priceInCents && p.metadata.variant === "full"
  );
  let earlyBirdPrice = existingPrices.data.find(
    (p) =>
      p.unit_amount === spec.earlyBirdPriceInCents &&
      p.metadata.variant === "early_bird"
  );

  // Create full price
  if (fullPrice) {
    console.log(`  Full price already exists: ${fullPrice.id}`);
  } else {
    fullPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: spec.priceInCents,
      currency: "usd",
      metadata: {
        variant: "full",
        workshop_tier: spec.key,
      },
    });
    console.log(`  Created full price: ${fullPrice.id}`);
  }

  // Create early-bird price
  if (earlyBirdPrice) {
    console.log(`  Early-bird price already exists: ${earlyBirdPrice.id}`);
  } else {
    earlyBirdPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: spec.earlyBirdPriceInCents,
      currency: "usd",
      metadata: {
        variant: "early_bird",
        workshop_tier: spec.key,
      },
    });
    console.log(`  Created early-bird price: ${earlyBirdPrice.id}`);
  }

  return {
    key: spec.key,
    productId: product.id,
    priceId: fullPrice.id,
    earlyBirdPriceId: earlyBirdPrice.id,
    priceInCents: spec.priceInCents,
    earlyBirdPriceInCents: spec.earlyBirdPriceInCents,
  };
}

async function main() {
  const isLive = STRIPE_SECRET_KEY!.startsWith("sk_live_");
  console.log(`Setting up Stripe workshop products (${isLive ? "LIVE" : "TEST"} MODE)...\n`);

  const results = [];
  for (const tier of TIERS) {
    results.push(await setupTier(tier));
  }

  console.log("\n\n========================================");
  console.log("SETUP COMPLETE — Copy these into lib/stripe/workshop-products.ts:");
  console.log("========================================\n");

  for (const r of results) {
    console.log(`// ${r.key}`);
    console.log(`productId: "${r.productId}",`);
    console.log(
      `priceId: "${r.priceId}",  // $${(r.priceInCents / 100).toFixed(0)}`
    );
    console.log(
      `earlyBirdPriceId: "${r.earlyBirdPriceId}",  // $${(r.earlyBirdPriceInCents / 100).toFixed(0)} (early bird)`
    );
    console.log();
  }

  console.log("\nEnvironment variables needed:");
  console.log("  STRIPE_SECRET_KEY=sk_test_...");
  console.log("  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...");
  console.log(
    "  STRIPE_WEBHOOK_SECRET=whsec_... (for webhook verification, set up later)"
  );
}

main().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
