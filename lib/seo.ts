import type { Metadata } from "next";
import type { Tool } from "./schemas";

export function siteUrl(): string {
  const explicit = process.env.SITE_URL;
  if (explicit) return explicit;

  // Vercel provides this for Preview/Production deploys (hostname only, no protocol).
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;

  return "https://counterbench.ai";
}

export function absoluteUrl(pathname: string): string {
  const base = siteUrl().replace(/\/+$/, "");
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${path}`;
}

export function toolMetadata(tool: Tool): Metadata {
  const title = tool.name;
  const description = tool.description;
  const url = absoluteUrl(`/tools/${tool.slug}`);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website"
    }
  };
}

// Sitewide Organization schema — AEO fix (tasks/AEO-AUDIT-TODO.md, Fix 2).
// Reuses only facts already public elsewhere in the codebase (site metadata,
// public contact address). Does not introduce new claims.
export function organizationJsonLd() {
  const url = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Counterbench.AI",
    // legalName intentionally omitted. In schema.org it means the registered
    // legal name of this specific entity, which is a corporate fact, not a
    // brand string. Setting it to the brand name asserts something unverified.
    // Add it only once the registered entity name is confirmed.
    alternateName: ["CounterbenchAI", "Counterbench"],
    url,
    // Organization logo guidance wants at least 112px on the shortest side.
    // favicon-32.png is 32px and gets ignored.
    logo: `${url}/apple-touch-icon.png`,
    description:
      "A curated directory of legal AI tools, prompts, and skills for US legal professionals, paired with dedicated paralegal teams for personal injury law firms.",
    areaServed: "US",
    knowsAbout: [
      "Personal injury law",
      "Legal AI tools",
      "Paralegal services",
      "Legal document review",
      "Law firm operations"
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "phil@counterbench.ai",
      contactType: "sales"
    }
  };
}

// Generic FAQPage schema — AEO fix. Pass the same { q, a } list already
// rendered on the page so structured data and visible copy never drift.
export function faqPageJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a
      }
    }))
  };
}

// Service schema for a priced offering (e.g. a Paralegal Teams tier).
// priceString should be the exact string already shown to users (e.g. "$3,750").
export function serviceJsonLd(params: {
  name: string;
  description: string;
  priceString: string;
  url: string;
}) {
  const price = params.priceString.replace(/[^0-9.]/g, "");
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: params.name,
    name: `Counterbench.AI Paralegal Teams — ${params.name}`,
    description: params.description,
    provider: { "@type": "Organization", name: "Counterbench.AI", url: siteUrl() },
    areaServed: "US",
    url: params.url,
    ...(price
      ? {
          offers: {
            "@type": "Offer",
            price,
            priceCurrency: "USD",
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price,
              priceCurrency: "USD",
              unitText: "MONTH"
            }
          }
        }
      : {})
  };
}

export function toolJsonLd(tool: Tool) {
  const canonical = absoluteUrl(`/tools/${tool.slug}`);
  const offers =
    tool.pricing === "free"
      ? { "@type": "Offer", price: "0", priceCurrency: "USD" }
      : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    applicationCategory: "BusinessApplication",
    operatingSystem: tool.platform.join(", ") || "Web",
    url: canonical,
    sameAs: tool.url,
    publisher: { "@type": "Organization", name: "Counterbench.AI", url: siteUrl() },
    ...(offers ? { offers } : {})
  };
}
