"use client";

import { useMemo, useState } from "react";

export function PlaybookActions({ shareUrl, markdown }: { shareUrl: string; markdown: string }) {
  const [copied, setCopied] = useState<string | null>(null);
  const canCopy = useMemo(() => typeof navigator !== "undefined" && Boolean(navigator.clipboard), []);

  async function copy(label: string, text: string) {
    if (!canCopy) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      window.setTimeout(() => setCopied(null), 1200);
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex flex--gap-2 flex--resp-col" aria-label="Playbook actions">
      <button className="btn btn--secondary btn--sm" type="button" disabled={!canCopy} onClick={() => void copy("Link", shareUrl)}>
        {copied === "Link" ? "Copied link" : "Copy link"}
      </button>
      <button className="btn btn--ghost btn--sm" type="button" disabled={!canCopy} onClick={() => void copy("Markdown", markdown)}>
        {copied === "Markdown" ? "Copied markdown" : "Copy markdown"}
      </button>
      <button className="btn btn--secondary btn--sm" type="button" onClick={() => window.print()}>
        Print
      </button>
    </div>
  );
}

