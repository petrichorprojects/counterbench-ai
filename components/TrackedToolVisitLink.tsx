"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { trackToolCTA } from "@/lib/analytics";

/**
 * Anchor wrapper that fires the `tool_click_cta` GTM event before navigating
 * to an external tool URL.
 *
 * Drop-in replacement for the plain `<a>` tags on:
 *   - app/tools/[slug]/page.tsx  ("Visit tool" primary CTA)
 *   - components/ToolCard.tsx    ("Visit tool" secondary CTA)
 *
 * Props mirror a standard `<a>` element. `href` and `slug` are required;
 * everything else (className, target, rel, …) is forwarded as-is.
 */
export function TrackedToolVisitLink({
  slug,
  href,
  children,
  ...rest
}: {
  slug: string;
  href: string;
  children: ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <a
      href={href}
      {...rest}
      onClick={(e) => {
        trackToolCTA(slug, href);
        rest.onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}
