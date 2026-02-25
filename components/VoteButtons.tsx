"use client";

import { useEffect, useState } from "react";
import type { LegalPadItemType, VoteValue } from "@/components/legalpad/storage";
import { getVote, setVote } from "@/components/legalpad/storage";

function nextValue(current: VoteValue, intended: VoteValue): VoteValue {
  // Clicking the same vote toggles back to 0.
  if (current === intended) return 0;
  return intended;
}

export function VoteButtons(props: { type: LegalPadItemType; slug: string; compact?: boolean }) {
  const { type, slug, compact } = props;
  const [value, setValueState] = useState<VoteValue>(0);

  useEffect(() => {
    const sync = () => setValueState(getVote(type, slug));
    sync();

    const on = () => sync();
    window.addEventListener("cb:votes", on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener("cb:votes", on);
      window.removeEventListener("storage", on);
    };
  }, [type, slug]);

  const scoreLabel = compact ? `${value}` : `Your vote: ${value}`;

  return (
    <div className="flex flex--gap-1" style={{ alignItems: "center" }} aria-label="Vote">
      <button
        type="button"
        className={`btn btn--secondary btn--sm ${value === -1 ? "is-active" : ""}`}
        aria-pressed={value === -1}
        aria-label="Downvote (local)"
        title="Downvote (saved locally on this device)"
        onClick={() => {
          const next = nextValue(value, -1);
          setVote(type, slug, next);
          setValueState(next);
        }}
        style={{ paddingInline: 12 }}
      >
        -
      </button>
      <span
        className="label label--pill"
        title="This vote is local-only until shared counters are enabled."
        style={{ margin: 0, padding: "6px 10px", minWidth: 64, textAlign: "center" }}
      >
        {scoreLabel}
      </span>
      <button
        type="button"
        className={`btn btn--secondary btn--sm ${value === 1 ? "is-active" : ""}`}
        aria-pressed={value === 1}
        aria-label="Upvote (local)"
        title="Upvote (saved locally on this device)"
        onClick={() => {
          const next = nextValue(value, 1);
          setVote(type, slug, next);
          setValueState(next);
        }}
        style={{ paddingInline: 12 }}
      >
        +
      </button>
    </div>
  );
}
