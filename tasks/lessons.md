# Lessons Learned

## 2026-03-29: Stripe custom_fields dropdown values must be alphanumeric only

**Failure mode**: Used values like `"1-5"`, `"6-15"`, `"office_manager"` in Stripe checkout `custom_fields` dropdown options. Stripe rejects any value containing hyphens, underscores, or plus signs with a 400 error that surfaces as an opaque 500 to the client.

**Detection signal**: Checkout returns "Failed to create checkout session" with Stripe error mentioning "alphanumeric characters only for custom_fields[][dropdown][options][value]".

**Prevention rule**: Stripe dropdown values must match `[a-zA-Z0-9]+`. Use semantic words (`small`, `midsize`, `large`, `enterprise`) instead of numeric ranges. Labels shown to customers can be anything.

---

## 2026-03-29: Stripe max 3 custom_fields per checkout session

**Failure mode**: Added 4 custom_fields (firm_name, firm_size, role, ai_challenge). Stripe's limit is 3.

**Detection signal**: Stripe error "Array custom_fields exceeded maximum 3".

**Prevention rule**: Stripe checkout sessions allow maximum 3 `custom_fields`. Prioritize the most important ones; drop the rest.

---

## 2026-03-19: Aspirational product claims destroy credibility with legal audiences

**Failure mode**: HeroSection shipped with fabricated metrics ("48,000+ litigation records indexed") for a product that's actually a tool/prompt directory. Legal professionals are trained to spot unsupported claims — this is the fastest way to kill trust.

**Detection signal**: Any metric or claim on a marketing page that doesn't correspond to a real, queryable feature in the product.

**Prevention rule**: Before writing product marketing copy, verify what the product actually does by checking the data directory and feature set. Never use aspirational numbers. Use real counts from the actual database/content.
