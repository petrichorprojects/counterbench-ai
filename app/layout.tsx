import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { PreviewBanner } from "@/components/PreviewBanner";
import { siteUrl } from "@/lib/seo";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    default: "Counterbench.AI",
    template: "%s | Counterbench.AI"
  },
  description: "A curated directory of legal AI tools, prompts, and skills for legal professionals.",
  // Use SITE_URL if set; otherwise fall back to Vercel preview URL (VERCEL_URL) to avoid incorrect canonicals.
  metadataBase: new URL(siteUrl())
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // /css/style.css is not content-hashed, so never rely on immutable caching.
  // We version the URL per deploy to force a refresh when CSS changes (fixes stale dropdown styling).
  const cssVersion = process.env.VERCEL_DEPLOYMENT_ID ?? process.env.VERCEL_GIT_COMMIT_SHA ?? "dev";
  // Set theme early to avoid a flash on first paint.
  const themeInit = `
(function(){
  try {
    var t = localStorage.getItem('cb_theme');
    if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
  } catch (e) {}
})();`;
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`}>
      <head>
        {/* Keep legacy stylesheet classes for migrated marketing pages */}
        <link rel="stylesheet" href={`/css/style.css?v=${cssVersion}`} />
        <link rel="icon" href="/favicon.ico" />
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <SiteHeader />
        <PreviewBanner />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
