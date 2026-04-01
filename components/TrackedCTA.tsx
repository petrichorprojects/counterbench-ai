"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";

/**
 * CTA wrapper that pushes `cta_click` to the dataLayer on click.
 * Replaces raw `<a data-track>` elements on Next.js pages so GTM
 * can pick up the event (the static `public/js/main.js` listener
 * never runs inside the React app).
 *
 * For internal links use `href="/..."` — rendered via next/link.
 * For anchors (`#section`) or external URLs, rendered as plain `<a>`.
 */
export function TrackedCTA({
  href,
  trackLabel,
  trackLocation,
  children,
  ...rest
}: {
  href: string;
  trackLabel: string;
  trackLocation: string;
  children: ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "cta_click",
      cta_text: trackLabel,
      cta_location: trackLocation,
      page: window.location.pathname,
    });
    // Don't preventDefault — let navigation proceed.
    rest.onClick?.(e);
  }

  const isInternal = href.startsWith("/") && !href.startsWith("#");

  if (isInternal) {
    return (
      <Link href={href} {...rest} onClick={handleClick}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} {...rest} onClick={handleClick}>
      {children}
    </a>
  );
}
