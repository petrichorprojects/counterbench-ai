import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { PreviewBanner } from "@/components/PreviewBanner";
import { siteUrl } from "@/lib/seo";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-RSECPPZQ56";

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
  const gtmScript = GTM_ID
    ? `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`
    : null;
  return (
    <html lang="en">
      <head>
        {gtmScript && <script dangerouslySetInnerHTML={{ __html: gtmScript }} />}
        {/* GA4 direct tag — runs independently of GTM */}
        {GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
            <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');` }} />
          </>
        )}
        {/* Keep legacy stylesheet classes for migrated marketing pages */}
        <link rel="stylesheet" href={`/css/style.css?v=${cssVersion}`} />
        {/* Prefer PNG icons (simple + reliable on Vercel). Browsers may still probe /favicon.ico. */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        <SiteHeader />
        <PreviewBanner />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
