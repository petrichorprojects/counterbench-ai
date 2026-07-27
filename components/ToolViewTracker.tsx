"use client";

import { useEffect } from "react";
import { trackToolView } from "@/lib/analytics";

/**
 * Invisible client component that fires the `tool_view` GTM event exactly
 * once when the tool detail page mounts in the browser.
 *
 * The tool detail page itself is a React Server Component, so browser APIs
 * are not available there. This component is the minimal client boundary
 * needed to call `trackToolView` on render.
 *
 * Usage: drop `<ToolViewTracker slug={tool.slug} />` anywhere inside the
 * server page — it renders nothing.
 */
export function ToolViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    trackToolView(slug);
  }, [slug]);

  return null;
}
