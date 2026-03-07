"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

export function StickyCta({
  showAfterPx = 520,
  text,
  ctaLabel,
  ctaHref
}: {
  showAfterPx?: number;
  text: ReactNode;
  ctaLabel: string;
  ctaHref: string;
}) {
  const [visible, setVisible] = useState(false);

  const threshold = useMemo(() => Math.max(0, Math.floor(showAfterPx)), [showAfterPx]);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setVisible(window.scrollY >= threshold);
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [threshold]);

  return (
    <div className={`sticky-cta${visible ? " visible" : ""}`} role="region" aria-label="Quick action">
      <div className="sticky-cta__inner">
        <div className="sticky-cta__text">{text}</div>
        <a className="btn btn--primary btn--sm" href={ctaHref}>
          {ctaLabel}
        </a>
      </div>
    </div>
  );
}
