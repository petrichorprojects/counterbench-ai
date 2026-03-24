import Link from "next/link";
import { notFound } from "next/navigation";
import { EVENTS, TIERS, getCityInfo, getEvent, formatDate, hasEarlyBird } from "@/data/workshops";
import { WorkshopCheckout } from "@/components/WorkshopCheckout";

export function generateStaticParams() {
  return EVENTS.map((e) => ({ city: e.citySlug, date: e.date }));
}

type Params = { city: string; date: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { city: citySlug, date } = await params;
  const city = getCityInfo(citySlug);
  const event = getEvent(citySlug, date);
  if (!city || !event) return {};
  const fmtDate = formatDate(date);
  return {
    title: `AI Workshop — ${city.name} ${fmtDate} | Counterbench.AI`,
    description: `Register for the ${fmtDate} AI workshop for legal professionals in ${city.name}, ${city.state}. From $597. Early bird $100 off.`,
    alternates: { canonical: `https://counterbench.ai/workshops/${citySlug}/${date}` },
    openGraph: {
      title: `AI Workshop — ${city.name}, ${fmtDate}`,
      description: `Hands-on AI training for legal professionals in ${city.name}. From $597.`,
      type: "website",
      url: `https://counterbench.ai/workshops/${citySlug}/${date}`
    }
  };
}

export default async function EventPage({ params }: { params: Promise<Params> }) {
  const { city: citySlug, date } = await params;
  const city = getCityInfo(citySlug);
  const event = getEvent(citySlug, date);
  if (!city || !event) notFound();

  const earlyBird = hasEarlyBird(event);
  const fmtDate = formatDate(date);
  const spotsLeft = event.spotsTotal - event.spotsSold;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationEvent",
    name: `AI for Legal Professionals — ${city.name}`,
    description: "Full-day, hands-on AI workshop for paralegals, associates, and firm managers.",
    startDate: event.date,
    endDate: event.date,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: event.venue,
      address: {
        "@type": "PostalAddress",
        addressLocality: city.name,
        addressRegion: city.state,
        addressCountry: "US"
      }
    },
    organizer: {
      "@type": "Organization",
      name: "CounterbenchAI",
      url: "https://counterbench.ai"
    },
    offers: TIERS.map((t) => ({
      "@type": "Offer",
      name: t.name,
      price: earlyBird ? t.earlyBirdPrice : t.price,
      priceCurrency: "USD",
      availability: spotsLeft > 0 ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
      validFrom: "2026-03-24"
    }))
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="section" style={{ paddingTop: 140, paddingBottom: "4rem" }}>
        <div className="container">
          <div className="label anim-hero anim-hero--1">
            <Link href="/workshops" style={{ color: "inherit", textDecoration: "none" }}>
              Workshops
            </Link>{" "}
            /{" "}
            <Link href={`/workshops/${citySlug}`} style={{ color: "inherit", textDecoration: "none" }}>
              {city.name}
            </Link>{" "}
            / {fmtDate}
          </div>
          <h1 className="max-w-900 anim-hero anim-hero--2">
            AI for Legal Professionals
            <br />
            <em>{fmtDate}</em>
          </h1>
          <p className="max-w-600 mt-3 anim-hero anim-hero--3" style={{ fontSize: "1.0625rem", color: "var(--muted)" }}>
            {event.venue} · {event.venueAddress}
          </p>

          <div className="flex flex--gap-3 mt-4 anim-hero anim-hero--4" style={{ flexWrap: "wrap", gap: "1rem" }}>
            {earlyBird && (
              <div style={{ background: "rgba(245, 158, 11, 0.12)", padding: "0.5rem 1rem", borderRadius: 8, fontSize: "0.875rem", color: "var(--amber)", fontWeight: 600 }}>
                Early bird: $100 off — {event.earlyBirdSpotsTotal - event.earlyBirdSpotsSold} of {event.earlyBirdSpotsTotal} spots left
              </div>
            )}
            <div style={{ background: "rgba(34, 197, 94, 0.1)", padding: "0.5rem 1rem", borderRadius: 8, fontSize: "0.875rem", color: "var(--green)" }}>
              {spotsLeft} spots remaining
            </div>
          </div>

          <div className="mt-5 anim-hero anim-hero--5">
            <a className="btn btn--primary btn--arrow" href="#register">
              Register Now
            </a>
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="section section--alt section--border-t section--border-b">
        <div className="container">
          <div className="label">Schedule</div>
          <h2 className="max-w-700">Full-day agenda</h2>

          <div className="mt-6" style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: 700 }}>
            {[
              { time: "8:30 AM", label: "Check-in & coffee" },
              { time: "9:00 AM", label: "Module 1: AI Fundamentals", duration: "90 min" },
              { time: "10:30 AM", label: "Break" },
              { time: "10:45 AM", label: "Module 2: Prompting That Works", duration: "90 min" },
              { time: "12:15 PM", label: "Lunch (provided)" },
              { time: "1:15 PM", label: "Module 3: AI for Your Workflow", duration: "90 min" },
              { time: "2:45 PM", label: "Break" },
              { time: "3:00 PM", label: "Module 4: Agents and Automation", duration: "60 min" },
              { time: "4:00 PM", label: "Module 5: Your AI Action Plan", duration: "30 min" },
              { time: "4:30 PM", label: "Wrap-up & networking" }
            ].map((item) => (
              <div
                key={item.time}
                style={{
                  display: "flex",
                  gap: "1.5rem",
                  alignItems: "baseline",
                  padding: "0.75rem 0",
                  borderBottom: "1px solid var(--border)"
                }}
              >
                <div style={{ width: 90, fontSize: "0.8125rem", color: "var(--muted)", fontWeight: 600, flexShrink: 0 }}>
                  {item.time}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{item.label}</div>
                  {item.duration && (
                    <div style={{ fontSize: "0.8125rem", color: "var(--muted-2)", marginTop: "0.125rem" }}>
                      {item.duration}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Register / Pricing */}
      <section className="section section--border-b" id="register">
        <div className="container">
          <div className="label">Register</div>
          <h2 className="max-w-700">
            {city.name} — {fmtDate}
          </h2>
          {earlyBird && (
            <p className="mt-3" style={{ color: "var(--amber)", fontWeight: 600 }}>
              Early bird pricing active — $100 off all tiers.
            </p>
          )}

          <div className="pricing-grid mt-6">
            {TIERS.map((tier) => {
              const price = earlyBird ? tier.earlyBirdPrice : tier.price;
              return (
                <div key={tier.name} className={`pricing-col${tier.featured ? " pricing-col--featured" : ""}`}>
                  <div className="pricing-name">{tier.name}</div>
                  <div className="pricing-price">
                    ${price.toLocaleString()}
                    {earlyBird && (
                      <span style={{ fontSize: "0.875rem", color: "var(--muted-2)", textDecoration: "line-through", marginLeft: "0.5rem" }}>
                        ${tier.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="pricing-desc">{tier.includes.join(". ")}.</p>
                  <WorkshopCheckout
                    tierName={tier.name}
                    price={price}
                    eventCity={city.name}
                    eventDate={event.date}
                    featured={tier.featured}
                  />
                  <div className="pricing-divider" />
                  {tier.includes.map((item) => (
                    <div key={item} className={`pricing-feature-item${tier.featured ? " pricing-feature-item--highlight" : ""}`}>
                      {item}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-muted" style={{ fontSize: "0.8125rem" }}>
            Full refund up to 7 days before the event. Transfer to a different date anytime. Firm-pays and self-pays: same price.
          </p>
        </div>
      </section>

      {/* Venue info */}
      <section className="section section--alt section--border-b">
        <div className="container">
          <div className="grid grid--2 grid--gap-3">
            <div>
              <div className="label">Venue</div>
              <h2 className="max-w-600">{event.venue}</h2>
              <p className="mt-4" style={{ color: "var(--muted)" }}>{event.venueAddress}</p>
              <p className="mt-3">
                Exact venue details and directions will be emailed to registered attendees 1 week before the event.
              </p>
            </div>
            <div>
              <div className="card card--no-hover" style={{ height: "100%" }}>
                <div className="label">What to bring</div>
                <ul className="list mt-4">
                  <li>Laptop with internet access</li>
                  <li>A real work task (anonymized) for exercises</li>
                  <li>Questions — lots of them</li>
                </ul>
                <div className="label mt-5">What we provide</div>
                <ul className="list mt-4">
                  <li>Printed quick-reference card</li>
                  <li>Coffee, lunch, and afternoon snacks</li>
                  <li>WiFi access</li>
                  <li>All digital materials post-workshop</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA bottom */}
      <section className="section section--border-b">
        <div className="container" style={{ textAlign: "center" }}>
          <div className="label">Ready?</div>
          <h2 className="max-w-700" style={{ marginLeft: "auto", marginRight: "auto" }}>
            AI won&apos;t replace paralegals.
            <br />
            <em>Paralegals who use AI will replace those who don&apos;t.</em>
          </h2>
          <div className="mt-5">
            <a className="btn btn--primary btn--arrow" href="#register">
              Register Now
            </a>
          </div>
          <p className="mt-3 text-muted" style={{ fontSize: "0.8125rem" }}>
            {fmtDate} · {city.name}, {city.state} · From ${earlyBird ? (TIERS[0]?.earlyBirdPrice ?? 497) : (TIERS[0]?.price ?? 597)}
          </p>
        </div>
      </section>
    </main>
  );
}
