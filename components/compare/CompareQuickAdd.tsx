"use client";

import { useEffect, useState } from "react";

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

export function CompareQuickAdd({ slug }: { slug: string }) {
  const [inCompare, setInCompare] = useState(false);

  useEffect(() => {
    const list = readCompare();
    setInCompare(list.includes(slug));
  }, [slug]);

  return (
    <button
      className="btn btn--secondary btn--sm"
      type="button"
      onClick={() => {
        const list = readCompare();
        const next = list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug];
        writeCompare(next);
        setInCompare(next.includes(slug));
      }}
    >
      {inCompare ? "In compare" : "Add to compare"}
    </button>
  );
}

