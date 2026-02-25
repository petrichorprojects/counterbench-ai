"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { LegalPadItem, LegalPadItemType } from "@/components/legalpad/storage";
import { clearLegalPad, loadLegalPad, toggleSaved } from "@/components/legalpad/storage";

function routeFor(item: LegalPadItem): string {
  if (item.type === "tool") return `/tools/${item.slug}`;
  if (item.type === "prompt") return `/prompts/${item.slug}`;
  return `/skills/${item.slug}`;
}

const TABS: Array<{ key: LegalPadItemType | "all"; label: string }> = [
  { key: "all", label: "All" },
  { key: "tool", label: "Tools" },
  { key: "prompt", label: "Prompts" },
  { key: "skill", label: "Skills" }
];

export function LegalPadClient() {
  const [items, setItems] = useState<LegalPadItem[]>([]);
  const [tab, setTab] = useState<LegalPadItemType | "all">("all");

  useEffect(() => {
    const sync = () => setItems(loadLegalPad());
    sync();

    const on = () => sync();
    window.addEventListener("cb:legalpad", on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener("cb:legalpad", on);
      window.removeEventListener("storage", on);
    };
  }, []);

  const filtered = useMemo(() => {
    if (tab === "all") return items;
    return items.filter((i) => i.type === tab);
  }, [items, tab]);

  return (
    <div className="mt-6">
      <div className="flex flex--between flex--gap-2 flex--resp-col" style={{ alignItems: "flex-end" }}>
        <div className="flex flex--gap-1" style={{ flexWrap: "wrap" }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`btn btn--secondary btn--sm ${tab === t.key ? "is-active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex--gap-2" style={{ flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => {
              const payload = JSON.stringify(items, null, 2);
              void navigator.clipboard.writeText(payload);
            }}
            disabled={items.length === 0}
            title="Copy your Legal Pad as JSON"
          >
            Copy
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => {
              clearLegalPad();
              setItems([]);
            }}
            disabled={items.length === 0}
            title="Clear all saved items"
          >
            Clear
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card mt-6" style={{ padding: "1.5rem", borderRadius: 12 }}>
          <div className="text-white" style={{ fontWeight: 700 }}>
            Nothing saved yet.
          </div>
          <div className="text-muted" style={{ marginTop: 8, lineHeight: 1.45 }}>
            Save tools, prompts, and skills anywhere on the site to build a working list.
          </div>
        </div>
      ) : (
        <div className="grid grid--2 grid--gap-2 mt-6" style={{ gap: "1rem" }}>
          {filtered.map((i) => (
            <div key={`${i.type}:${i.slug}`} className="card" style={{ padding: "1.5rem", borderRadius: 12 }}>
              <div className="flex flex--between flex--gap-2" style={{ alignItems: "flex-start" }}>
                <div style={{ minWidth: 0 }}>
                  <div className="label">{i.type.toUpperCase()}</div>
                  <Link className="text-white" style={{ fontSize: "1.05rem", fontWeight: 700 }} href={routeFor(i)}>
                    {i.title}
                  </Link>
                  {i.description ? (
                    <div className="text-muted" style={{ marginTop: 10, lineHeight: 1.45, fontSize: "0.875rem" }}>
                      {i.description}
                    </div>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  onClick={() => {
                    toggleSaved({ type: i.type, slug: i.slug, title: i.title, description: i.description });
                  }}
                  title="Remove from Legal Pad"
                >
                  Remove
                </button>
              </div>
              <div className="mt-4">
                <Link className="btn btn--ghost btn--sm" href={routeFor(i)}>
                  Open
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
