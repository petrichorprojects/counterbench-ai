import Link from "next/link";
import { NewsletterCapture } from "@/components/NewsletterCapture";
import { getAiNativeByCategory, getAiNativeMeta, getAiNativeStats } from "@/lib/ai-native";

export const metadata = {
  title: "AI-Native Services Companies Map 2026",
  description:
    "A directory of AI-native service companies replacing traditional outsourced work across legal, finance, tax, insurance, healthcare, HR, and BPO. End-to-end AI service firms, not SaaS tools.",
  openGraph: {
    title: "AI-Native Services Companies Map 2026 | Counterbench.AI",
    description:
      "Software ate the world. Now AI is eating services. A directory of end-to-end AI-native service companies by sector."
  }
};

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function AiNativeServicesMapPage() {
  const groups = getAiNativeByCategory();
  const stats = getAiNativeStats();
  const meta = getAiNativeMeta();

  const statCard = (label: string, value: string | number, sub?: string) => (
    <div className="card" style={{ borderRadius: 12, padding: "0.9rem" }}>
      <div className="label" style={{ margin: 0 }}>
        {label}
      </div>
      <div className="text-white" style={{ fontSize: "1.65rem", fontWeight: 850 }}>
        {value}
      </div>
      {sub ? (
        <div className="text-muted" style={{ fontSize: "0.76rem" }}>
          {sub}
        </div>
      ) : null}
    </div>
  );

  return (
    <main>
      <section className="section" style={{ paddingTop: 112 }}>
        <div className="container">
          <div
            className="card"
            style={{
              borderRadius: 20,
              padding: "2rem",
              background:
                "radial-gradient(1200px 340px at 12% 0%, color-mix(in srgb, #0ea5e9 26%, transparent), transparent 65%), linear-gradient(145deg, #071325 0%, #0b1022 55%, #09090b 100%)"
            }}
          >
            <div className="label">Market Map</div>
            <h1
              style={{
                marginTop: 8,
                marginBottom: 8,
                fontSize: "clamp(2rem, 4.2vw, 3.5rem)",
                lineHeight: 1,
                letterSpacing: "-0.035em"
              }}
            >
              AI-Native Services Companies 2026
            </h1>
            <p className="text-muted" style={{ maxWidth: 820, fontSize: "1.04rem", lineHeight: 1.55 }}>
              Software ate the world. Now AI is eating services. This is a directory of end-to-end AI-native
              service companies - firms that deliver the work, not just the software - across {stats.categories} sectors.
            </p>

            <div
              style={{
                marginTop: 18,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 10
              }}
            >
              {statCard("Companies", stats.total)}
              {statCard("Sectors", stats.categories)}
              {statCard("Verified", stats.verified, `${stats.uncertain} pending verification`)}
              {statCard("Countries", `${stats.countries}+`)}
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          {groups.map((group) => (
            <div key={group.category} style={{ marginBottom: "2.5rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: 12,
                  marginBottom: "1rem"
                }}
              >
                <h2 style={{ margin: 0, fontSize: "1.4rem", letterSpacing: "-0.02em" }}>{group.category}</h2>
                <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                  {group.companies.length}
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "1rem"
                }}
              >
                {group.companies.map((c) => {
                  const inner = (
                    <>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8
                        }}
                      >
                        <span
                          className="text-white"
                          style={{ fontSize: "1.05rem", fontWeight: 800, letterSpacing: "-0.01em" }}
                        >
                          {c.name}
                        </span>
                        {c.hq ? (
                          <span className="text-muted" style={{ fontSize: "0.72rem", whiteSpace: "nowrap" }}>
                            {c.hq}
                          </span>
                        ) : null}
                      </div>

                      {c.description ? (
                        <div className="text-muted" style={{ marginTop: 8, fontSize: "0.88rem", lineHeight: 1.45 }}>
                          {c.description}
                        </div>
                      ) : (
                        <div
                          className="text-muted"
                          style={{ marginTop: 8, fontSize: "0.82rem", fontStyle: "italic", opacity: 0.7 }}
                        >
                          Details pending verification.
                        </div>
                      )}

                      <div
                        style={{
                          marginTop: 10,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          fontSize: "0.74rem"
                        }}
                      >
                        {c.website ? (
                          <span style={{ color: "#38bdf8" }}>{hostname(c.website)}</span>
                        ) : (
                          <span className="text-muted" style={{ opacity: 0.6 }}>
                            no public site found
                          </span>
                        )}
                        {c.uncertain ? (
                          <span
                            style={{
                              marginLeft: "auto",
                              padding: "2px 8px",
                              borderRadius: 999,
                              border: "1px solid var(--border)",
                              color: "var(--muted)",
                              fontSize: "0.66rem"
                            }}
                          >
                            unverified
                          </span>
                        ) : null}
                      </div>
                    </>
                  );

                  return c.website ? (
                    <a
                      key={c.name}
                      href={c.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card"
                      style={{ borderRadius: 14, padding: "1.1rem", textDecoration: "none", display: "block" }}
                    >
                      {inner}
                    </a>
                  ) : (
                    <div
                      key={c.name}
                      className="card"
                      style={{ borderRadius: 14, padding: "1.1rem" }}
                    >
                      {inner}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <p className="text-muted" style={{ fontSize: "0.78rem", marginTop: "1rem", lineHeight: 1.5 }}>
            Source: {meta.source}. {meta.note} Compiled {meta.compiled}. This directory tracks service
            companies, distinct from the{" "}
            <Link href="/tools" style={{ color: "#38bdf8" }}>
              AI tools directory
            </Link>
            .
          </p>

          <div style={{ marginTop: "2rem" }}>
            <NewsletterCapture source="ai-native-services-map" />
          </div>
        </div>
      </section>
    </main>
  );
}
