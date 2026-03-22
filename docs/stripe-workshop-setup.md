# Stripe Workshop Ticket Setup

## Overview

Three workshop tiers with early-bird pricing ($100 off for first 10 registrants per tier).

| Tier         | Full Price | Early Bird | Early Bird Cap |
|-------------|-----------|------------|----------------|
| Standard    | $597      | $497       | 10             |
| Premium     | $897      | $797       | 10             |
| Firm Package| $2,497    | $2,397     | 10             |

## Setup Steps

### 1. Run the setup script (creates products + prices in Stripe test mode)

```bash
STRIPE_SECRET_KEY=sk_test_YOUR_KEY npx tsx scripts/stripe-setup-workshop.ts
```

The script will:
- Create 3 Stripe products (one per tier)
- Create 2 prices per product (full + early-bird)
- Output the price IDs

The script is idempotent — safe to re-run.

### 2. Copy the price IDs

Take the output from the script and update `lib/stripe/workshop-products.ts` with the real `productId`, `priceId`, and `earlyBirdPriceId` values.

### 3. Set environment variables

```env
# Stripe test mode keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Optional: webhook secret (for order fulfillment later)
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4. Test the checkout flow

POST to `/api/checkout`:
```json
{
  "tierKey": "standard",
  "earlyBird": true
}
```

Returns `{ "url": "https://checkout.stripe.com/..." }` — redirect the user there.

## What's Created in Stripe

### Products (3)
Each product has metadata `workshop_tier` and `type: workshop_ticket`.

- **CounterbenchAI Workshop — Standard**
- **CounterbenchAI Workshop — Premium**
- **CounterbenchAI Workshop — Firm Package**

### Prices (6 total — 2 per product)
Each price is one-time (not recurring), USD, with metadata `variant` (full/early_bird) and `workshop_tier`.

## Early Bird Logic

Early-bird tracking is not yet automated in code. Options:
1. **Manual**: Track registrations per tier, switch `earlyBird: false` on the landing page after 10 sold
2. **Automated**: Add a counter (database or Stripe metadata query) that checks purchase count before selecting the price — implement when the landing page is built

## Going Live

1. Re-run the setup script with your **live** Stripe key (`sk_live_...`) — the script will refuse non-test keys, so remove the safety check first
2. Update env vars to live keys
3. Set up a Stripe webhook for `checkout.session.completed` to handle order fulfillment (email confirmation, access provisioning)

## File Map

| File | Purpose |
|------|---------|
| `lib/stripe/client.ts` | Server-side Stripe client singleton |
| `lib/stripe/workshop-products.ts` | Tier config (prices, features, IDs) |
| `scripts/stripe-setup-workshop.ts` | One-time Stripe product/price creation |
| `app/api/checkout/route.ts` | Checkout session API endpoint |
