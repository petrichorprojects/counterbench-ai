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
