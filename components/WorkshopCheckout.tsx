"use client";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function WorkshopCheckout({
  tierName,
  price,
  eventCity,
  eventDate,
  featured
}: {
  tierName: string;
  price: number;
  eventCity: string;
  eventDate: string;
  featured?: boolean;
}) {
  const handleClick = () => {
    // Push GTM event for tracking
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({
        event: "workshop_registration",
        workshop_tier: tierName,
        workshop_price: price,
        workshop_city: eventCity,
        workshop_date: eventDate
      });
    }

    // Stripe checkout URL — configured via env vars.
    // When Stripe is set up, replace this with actual checkout links or Stripe.js integration.
    const stripeUrl = process.env.NEXT_PUBLIC_STRIPE_WORKSHOP_CHECKOUT_URL;
    if (stripeUrl) {
      const url = new URL(stripeUrl);
      url.searchParams.set("tier", tierName.toLowerCase().replace(/\s+/g, "-"));
      url.searchParams.set("city", eventCity.toLowerCase());
      url.searchParams.set("date", eventDate);
      window.location.href = url.toString();
    } else {
      // Fallback: scroll to a contact/waitlist section or alert
      alert(
        `Registration for ${tierName} ($${price}) — ${eventCity}, ${eventDate}.\n\nStripe checkout is not yet configured. Contact us to register.`
      );
    }
  };

  return (
    <button
      type="button"
      className={`btn ${featured ? "btn--primary btn--arrow" : "btn--secondary"} btn--full`}
      onClick={handleClick}
      data-track={`Register ${tierName}`}
      data-location="workshop-pricing"
    >
      Register — ${price.toLocaleString()}
    </button>
  );
}
