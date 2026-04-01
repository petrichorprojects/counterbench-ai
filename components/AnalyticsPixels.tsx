"use client";

/**
 * Third-party tracking pixels loaded via GTM in production.
 * This component adds the base snippets for platforms that need
 * a page-level script to initialise before GTM fires tags:
 *
 * - Meta Pixel (Facebook)   — base fbq('init') + PageView
 * - LinkedIn Insight Tag     — base _linkedin_partner_id snippet
 *
 * IDs are read from env vars so they stay out of source control.
 * When the env var is absent the snippet is simply not rendered —
 * no errors, no empty network requests.
 *
 * NOTE: Once GTM is fully configured, these base snippets can
 * optionally be moved *into* GTM as Custom HTML tags. Keeping them
 * here as well is harmless (fbq/li deduplicates) and gives a
 * fallback if GTM is slow or blocked.
 */

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
const LINKEDIN_PARTNER_ID = process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID ?? "";

export function MetaPixel() {
  if (!META_PIXEL_ID) return null;

  const initScript = `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: initScript }} />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

export function LinkedInInsightTag() {
  if (!LINKEDIN_PARTNER_ID) return null;

  const initScript = `
_linkedin_partner_id = "${LINKEDIN_PARTNER_ID}";
window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
window._linkedin_data_partner_ids.push(_linkedin_partner_id);
(function(l) {
if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
window.lintrk.q=[]}
var s = document.getElementsByTagName("script")[0];
var b = document.createElement("script");
b.type = "text/javascript";b.async = true;
b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
s.parentNode.insertBefore(b, s);})(window.lintrk);`;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: initScript }} />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://px.ads.linkedin.com/collect/?pid=${LINKEDIN_PARTNER_ID}&fmt=gif`}
        />
      </noscript>
    </>
  );
}
