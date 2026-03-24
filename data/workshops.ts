export type WorkshopTier = {
  name: string;
  price: number;
  earlyBirdPrice: number;
  stripePriceId: string;
  earlyBirdStripePriceId: string;
  includes: string[];
  featured?: boolean;
};

export type WorkshopEvent = {
  city: string;
  citySlug: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  venue: string;
  venueAddress: string;
  spotsTotal: number;
  spotsSold: number;
  earlyBirdSpotsTotal: number;
  earlyBirdSpotsSold: number;
};

export type CityInfo = {
  name: string;
  slug: string;
  state: string;
  tagline: string;
  description: string;
};

export const CITIES: CityInfo[] = [
  {
    name: "Boston",
    slug: "boston",
    state: "MA",
    tagline: "Fridays in Boston",
    description:
      "Join legal professionals across the Greater Boston area for a hands-on, full-day AI workshop. Held on Fridays so your firm can invest in your professional development."
  },
  {
    name: "Buffalo",
    slug: "buffalo",
    state: "NY",
    tagline: "Saturdays in Buffalo",
    description:
      "Western New York's only in-person AI workshop built for legal professionals. Small classes, real exercises, no fluff. Saturdays so you can learn on your own schedule."
  }
];

export const TIERS: WorkshopTier[] = [
  {
    name: "Standard",
    price: 597,
    earlyBirdPrice: 497,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID || "",
    earlyBirdStripePriceId: process.env.NEXT_PUBLIC_STRIPE_STANDARD_EB_PRICE_ID || "",
    includes: [
      "Full-day workshop (8 hours)",
      "Printed quick-reference card",
      "Digital workbook with all exercises",
      "30-day free CounterbenchAI access",
      "Recording of all demos"
    ]
  },
  {
    name: "Premium",
    price: 897,
    earlyBirdPrice: 797,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID || "",
    earlyBirdStripePriceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_EB_PRICE_ID || "",
    includes: [
      "Everything in Standard",
      "1-on-1 follow-up call (30 min)",
      "90-day free CounterbenchAI access",
      "Priority seating"
    ],
    featured: true
  },
  {
    name: "Firm Package",
    price: 2497,
    earlyBirdPrice: 2397,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_FIRM_PRICE_ID || "",
    earlyBirdStripePriceId: process.env.NEXT_PUBLIC_STRIPE_FIRM_EB_PRICE_ID || "",
    includes: [
      "4 seats (Standard tier)",
      "Private 1-hour firm-specific session",
      "Annual CounterbenchAI access for all attendees",
      "Dedicated point of contact"
    ]
  }
];

export const EVENTS: WorkshopEvent[] = [
  {
    city: "Boston",
    citySlug: "boston",
    date: "2026-04-24",
    dayOfWeek: "Friday",
    venue: "TBD — Back Bay / Financial District",
    venueAddress: "Boston, MA",
    spotsTotal: 25,
    spotsSold: 0,
    earlyBirdSpotsTotal: 10,
    earlyBirdSpotsSold: 0
  },
  {
    city: "Buffalo",
    citySlug: "buffalo",
    date: "2026-05-02",
    dayOfWeek: "Saturday",
    venue: "TBD — Downtown Buffalo",
    venueAddress: "Buffalo, NY",
    spotsTotal: 20,
    spotsSold: 0,
    earlyBirdSpotsTotal: 10,
    earlyBirdSpotsSold: 0
  }
];

export function getEventsForCity(citySlug: string): WorkshopEvent[] {
  return EVENTS.filter((e) => e.citySlug === citySlug);
}

export function getEvent(citySlug: string, date: string): WorkshopEvent | undefined {
  return EVENTS.find((e) => e.citySlug === citySlug && e.date === date);
}

export function getCityInfo(citySlug: string): CityInfo | undefined {
  return CITIES.find((c) => c.slug === citySlug);
}

export function hasEarlyBird(event: WorkshopEvent): boolean {
  return event.earlyBirdSpotsSold < event.earlyBirdSpotsTotal;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}
