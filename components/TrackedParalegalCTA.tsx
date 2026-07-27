"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef, MouseEvent, ReactNode } from "react";
import { trackParalegalInquiry } from "@/lib/analytics";

type LinkProps = ComponentPropsWithoutRef<typeof Link>;

/**
 * Internal-link wrapper that fires `paralegal_inquiry_start` when a user
 * clicks any "Book a discovery call" or "Get started" CTA on /paralegals.
 *
 * Renders via next/link for proper client-side routing. Accepts all props
 * that next/link accepts (including className, style, etc.).
 */
export function TrackedParalegalCTA({
  href,
  children,
  onClick,
  ...rest
}: LinkProps & { children: ReactNode }) {
  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    trackParalegalInquiry("start");
    onClick?.(e);
  }

  return (
    <Link href={href} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
