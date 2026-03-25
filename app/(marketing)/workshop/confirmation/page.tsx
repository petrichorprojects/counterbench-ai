"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { WORKSHOP_CITIES, type CityKey } from "@/lib/stripe/workshop-cities";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  // We don't have server-side session retrieval yet, so show a generic
  // confirmation. When Stripe webhooks are wired, this can fetch session
  // details via /api/checkout/session?id=... and show tier/city specifics.

  return (
    <main>
      {/* Hero */}
      <section className="section" style={{ paddingTop: 140, paddingBottom: "4rem" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(34, 197, 94, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 2rem",
              fontSize: "2.5rem",
            }}
            aria-hidden="true"
          >
            &#10003;
          </div>

          <div className="label anim-hero anim-hero--1">Registration Confirmed</div>
          <h1 className="max-w-700 anim-hero anim-hero--2" style={{ margin: "0 auto" }}>
            You&rsquo;re in.
          </h1>
          <p
            className="max-w-600 mt-4 anim-hero anim-hero--3"
            style={{ fontSize: "1.125rem", margin: "1rem auto 0" }}
          >
            Your spot is reserved. Check your email for your receipt and
            confirmation details.
          </p>
        </div>
      </section>

      {/* Workshop details recap */}
      <section className="section section--alt section--border-t section--border-b">
        <div className="container">
          <div className="label">Workshop Details</div>
          <h2 className="max-w-700">What to know before the day.</h2>

          <div
            className="mt-6"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {(Object.keys(WORKSHOP_CITIES) as CityKey[]).map((key) => {
              const city = WORKSHOP_CITIES[key];
              return (
                <div
                  key={key}
                  className="card"
                  style={{ padding: "2rem", borderRadius: 16 }}
                >
                  <h3 style={{ marginBottom: "0.75rem" }}>{city.name}</h3>
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      fontSize: "0.9375rem",
                    }}
                  >
                    <li>
                      <span className="text-white" style={{ fontWeight: 600 }}>
                        Date:
                      </span>{" "}
                      {city.date}
                    </li>
                    <li>
                      <span className="text-white" style={{ fontWeight: 600 }}>
                        Venue:
                      </span>{" "}
                      {city.venue}
                    </li>
                    <li>
                      <span className="text-white" style={{ fontWeight: 600 }}>
                        Time:
                      </span>{" "}
                      9:00 AM &ndash; 4:00 PM (lunch included)
                    </li>
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="card mt-5" style={{ padding: "2rem", borderRadius: 16 }}>
            <h3 style={{ marginBottom: "0.75rem" }}>What to bring</h3>
            <ul className="list">
              <li>A laptop with a web browser (fully charged or bring your charger)</li>
              <li>Any AI tools you currently use or want to explore (we will provide accounts for exercises)</li>
              <li>A list of 2-3 real tasks from your practice you want to apply AI to</li>
              <li>A notebook or note-taking app for your action plan</li>
            </ul>
          </div>
        </div>
      </section>

      {/* What happens next */}
      <section className="section section--border-b">
        <div className="container">
          <div className="label">What Happens Next</div>
          <h2 className="max-w-700">Three emails. Then we get to work.</h2>

          <div className="engagement-bar mt-6">
            <div className="engagement-phase">
              <div className="engagement-phase-num">01</div>
              <div className="engagement-phase-title">Confirmation Email</div>
              <div className="engagement-phase-weeks">Today</div>
              <p style={{ fontSize: "0.875rem", marginBottom: 0 }}>
                Your receipt and registration details. Check your inbox (and
                spam folder) within the next few minutes.
              </p>
            </div>

            <div className="engagement-phase">
              <div className="engagement-phase-num">02</div>
              <div className="engagement-phase-title">Pre-Workshop Prep</div>
              <div className="engagement-phase-weeks">1 week before</div>
              <p style={{ fontSize: "0.875rem", marginBottom: 0 }}>
                A short prep guide with what to install, what to think about,
                and how to get the most out of the day.
              </p>
            </div>

            <div className="engagement-phase">
              <div className="engagement-phase-num">03</div>
              <div className="engagement-phase-title">Day-Of Details</div>
              <div className="engagement-phase-weeks">2 days before</div>
              <p style={{ fontSize: "0.875rem", marginBottom: 0 }}>
                Final venue details, parking info, Wi-Fi instructions, and your
                personalized schedule.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container" style={{ textAlign: "center" }}>
          <h2 className="max-w-600 mx-auto">Questions before the workshop?</h2>
          <p className="max-w-600 mx-auto mt-3">
            Reply to your confirmation email or reach out to us directly. We are
            here to help you get the most out of the day.
          </p>
          <div
            className="mt-5"
            style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}
          >
            <Link className="btn btn--primary btn--arrow" href="/">
              Back to CounterbenchAI
            </Link>
            <Link className="btn btn--secondary" href="/workshop/curriculum">
              View Full Curriculum
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function WorkshopConfirmationPage() {
  return (
    <Suspense
      fallback={
        <main>
          <section className="section" style={{ paddingTop: 140, paddingBottom: "4rem" }}>
            <div className="container" style={{ textAlign: "center" }}>
              <p style={{ fontSize: "1.125rem" }}>Loading confirmation...</p>
            </div>
          </section>
        </main>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
