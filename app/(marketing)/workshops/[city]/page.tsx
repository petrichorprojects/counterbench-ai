import Link from "next/link";
import { notFound } from "next/navigation";
import { CITIES, getCityInfo, getEventsForCity, formatDate, hasEarlyBird, TIERS } from "@/data/workshops";
import { StickyCta } from "@/components/StickyCta";

export function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }) {
  const { city: citySlug } = await params;
  const city = getCityInfo(citySlug);
  if (!city) return {};
  return {
    title: `AI Workshops in ${city.name}, ${city.state} | Counterbench.AI`,
    description: `In-person AI training for legal professionals in ${city.name}. One full day, hands-on, built for paralegals and attorneys. From $597.`,
    alternates: { canonical: `https://counterbench.ai/workshops/${city.slug}` },
    openGraph: {
      title: `AI Workshops in ${city.name} — Counterbench.AI`,
      description: `Hands-on AI workshop for legal professionals in ${city.name}, ${city.state}. From $597.`,
      type: "website",
      url: `https://counterbench.ai/workshops/${city.slug}`
    }
  };
}

export default async function CityWorkshopsPage({ params }: { params: Promise<{ city: string }> }) {
  const { city: citySlug } = await params;
  const city = getCityInfo(citySlug);
  if (!city) notFound();

  const events = getEventsForCity(citySlug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `CounterbenchAI Workshops — ${city.name}`,
    itemListElement: events.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "EducationEvent",
        name: `AI for Legal Professionals — ${city.name}`,
        startDate: e.date,
        location: {
          "@type": "Place",
          name: e.venue,
          address: e.venueAddress
        },
        offers: TIERS.map((t) => ({
          "@type": "Offer",
          name: t.name,
          price: t.price,
          priceCurrency: "USD"
        }))
      }
    }))
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="section" style={{ paddingTop: 140, paddingBottom: "5rem" }}>
        <div className="container">
          <div className="label anim-hero anim-hero--1">
            <Link href="/workshops" style={{ color: "inherit", textDecoration: "none" }}>
              Workshops
            </Link>{" "}
            / {city.name}
          </div>
          <h1 className="max-w-900 anim-hero anim-hero--2">
            AI Workshops in{" "}
            <em>
              {city.name}, {city.state}
            </em>
          </h1>
          <p className="max-w-600 mt-4 anim-hero anim-hero--3" style={{ fontSize: "1.125rem" }}>
            {city.description}
          </p>
          <div className="flex flex--gap-3 mt-5 flex--resp-col anim-hero anim-hero--4">
            <a className="btn btn--primary btn--arrow" href="#events">
              See Upcoming Dates
            </a>
            <Link className="btn btn--secondary" href="/workshops#curriculum">
              View Curriculum
            </Link>
          </div>
        </div>
      </section>

      {/* Events list */}
      <section className="section section--alt section--border-t section--border-b" id="events">
        <div className="container">
          <div className="label">Upcoming dates</div>
          <h2 className="max-w-700">
            {city.name} workshops
          </h2>

          {events.length === 0 ? (
            <div className="card mt-6" style={{ maxWidth: 600 }}>
              <p>No upcoming workshops in {city.name} yet. Check back soon or join the newsletter for updates.</p>
              <div className="mt-4">
                <Link className="btn btn--secondary btn--arrow" href="/newsletter">
                  Get notified
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-6" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {events.map((event) => {
                const earlyBird = hasEarlyBird(event);
                const spotsLeft = event.spotsTotal - event.spotsSold;
                return (
                  <div key={event.date} className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                      <div>
                        <h3 style={{ fontSize: "1.25rem" }}>{formatDate(event.date)}</h3>
                        <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginTop: "0.25rem" }}>
                          {event.venue} · {event.venueAddress}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        {earlyBird && (
                          <div style={{ fontSize: "0.8125rem", color: "var(--amber)", fontWeight: 600, marginBottom: "0.25rem" }}>
                            Early bird: $100 off ({event.earlyBirdSpotsTotal - event.earlyBirdSpotsSold} spots left)
                          </div>
                        )}
                        <div style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>
                          {spotsLeft} of {event.spotsTotal} spots remaining
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                      <div style={{ fontSize: "0.875rem" }}>
                        From <strong style={{ color: "var(--fg)" }}>{earlyBird ? "$497" : "$597"}</strong>
                      </div>
                      <Link
                        className="btn btn--primary btn--arrow btn--sm"
                        href={`/workshops/${citySlug}/${event.date}`}
                      >
                        Register
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Quick pricing */}
      <section className="section section--border-b" id="pricing">
        <div className="container">
          <div className="label">Pricing</div>
          <h2 className="max-w-700">Three tiers. Pick what fits.</h2>

          <div className="pricing-grid mt-6">
            {TIERS.map((tier) => (
              <div key={tier.name} className={`pricing-col${tier.featured ? " pricing-col--featured" : ""}`}>
                <div className="pricing-name">{tier.name}</div>
                <div className="pricing-price">${tier.price.toLocaleString()}</div>
                <p className="pricing-desc">
                  {tier.includes[0]}.
                </p>
                {events[0] ? (
                  <Link
                    className={`btn ${tier.featured ? "btn--primary btn--arrow" : "btn--secondary"} btn--full`}
                    href={`/workshops/${citySlug}/${events[0].date}`}
                  >
                    Register
                  </Link>
                ) : (
                  <span className="btn btn--secondary btn--full" style={{ opacity: 0.5, pointerEvents: "none" }}>
                    Coming soon
                  </span>
                )}
                <div className="pricing-divider" />
                {tier.includes.map((item) => (
                  <div key={item} className={`pricing-feature-item${tier.featured ? " pricing-feature-item--highlight" : ""}`}>
                    {item}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <p className="mt-4 text-muted" style={{ fontSize: "0.8125rem" }}>
            Early bird ($100 off) applies to first 10 registrations per event, all tiers.
          </p>
        </div>
      </section>

      {/* Other city */}
      <section className="section section--alt section--border-b">
        <div className="container" style={{ textAlign: "center" }}>
          <div className="label">Also available</div>
          {CITIES.filter((c) => c.slug !== citySlug).map((other) => (
            <div key={other.slug}>
              <h2>
                Workshops in {other.name}, {other.state}
              </h2>
              <p className="max-w-600 mt-3" style={{ marginLeft: "auto", marginRight: "auto" }}>
                Same curriculum, different city. {other.tagline}.
              </p>
              <div className="mt-5">
                <Link className="btn btn--secondary btn--arrow" href={`/workshops/${other.slug}`}>
                  View {other.name} dates
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <StickyCta
        text={
          <>
            <strong>Workshops in {city.name}.</strong> From ${events[0] && hasEarlyBird(events[0]) ? "497" : "597"}.
          </>
        }
        ctaLabel="Register"
        ctaHref="#events"
      />
    </main>
  );
}
