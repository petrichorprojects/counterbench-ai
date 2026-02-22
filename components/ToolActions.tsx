"use client";

import { useEffect, useMemo, useState } from "react";

function readCompare(): string[] {
  try {
    const raw = localStorage.getItem("cb_compare");
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    if (Array.isArray(arr)) return arr.filter((x) => typeof x === "string");
  } catch {
    // ignore
  }
  return [];
}

function writeCompare(slugs: string[]) {
  localStorage.setItem("cb_compare", JSON.stringify(slugs.slice(0, 12)));
}

export function ToolActions({ slug, url }: { slug: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const [inCompare, setInCompare] = useState(false);

  useEffect(() => {
    const list = readCompare();
    setInCompare(list.includes(slug));
  }, [slug]);

  const canCopy = useMemo(() => typeof navigator !== "undefined" && Boolean(navigator.clipboard), []);

  return (
    <div className="flex flex--gap-2">
      <button
        className="btn btn--secondary btn--sm"
        type="button"
        disabled={!canCopy}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1200);
          } catch {
            // ignore
          }
        }}
      >
        {copied ? "Copied" : "Copy link"}
      </button>
      <button
        className="btn btn--ghost btn--sm"
        type="button"
        onClick={() => {
          const list = readCompare();
          const next = list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug];
          writeCompare(next);
          setInCompare(next.includes(slug));
        }}
      >
        {inCompare ? "Remove from compare" : "Add to compare"}
      </button>
      <a className="btn btn--secondary btn--sm" href={`/tools/compare?tools=${encodeURIComponent(slug)}`}>
        Compare now
      </a>
    </div>
  );
}
