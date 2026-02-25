"use client";

import { useEffect, useMemo, useState } from "react";
import type { LegalPadItem, LegalPadItemType } from "@/components/legalpad/storage";
import { isSaved, toggleSaved } from "@/components/legalpad/storage";

export function LegalPadButton(props: {
  type: LegalPadItemType;
  slug: string;
  title: string;
  description?: string;
  compact?: boolean;
}) {
  const { type, slug, title, description, compact } = props;
  const [saved, setSaved] = useState(false);

  const item = useMemo<Omit<LegalPadItem, "savedAtIso">>(() => ({ type, slug, title, description }), [type, slug, title, description]);

  useEffect(() => {
    const sync = () => setSaved(isSaved(type, slug));
    sync();

    const on = () => sync();
    window.addEventListener("cb:legalpad", on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener("cb:legalpad", on);
      window.removeEventListener("storage", on);
    };
  }, [type, slug]);

  return (
    <button
      type="button"
      className={`btn btn--ghost btn--sm ${saved ? "is-active" : ""}`}
      aria-pressed={saved}
      aria-label={saved ? "Remove from Legal Pad" : "Save to Legal Pad"}
      title={saved ? "Saved to your Legal Pad (click to remove)" : "Save to your Legal Pad"}
      onClick={() => {
        const next = toggleSaved(item);
        setSaved(next);
      }}
    >
      {compact ? (saved ? "Saved" : "Save") : saved ? "Saved to Legal Pad" : "Save to Legal Pad"}
    </button>
  );
}
