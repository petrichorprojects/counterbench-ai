import Link from "next/link";
import { Badge } from "@/design-system/Badge";
import type { Tool } from "@/lib/schemas";
import { CompareQuickAdd } from "@/components/compare/CompareQuickAdd";

export function ToolCard({ tool }: { tool: Tool }) {
  const verified = Boolean(tool.verified);
  return (
    <div className="card" style={{ padding: "1.5rem", borderRadius: 12 }}>
      <div className="flex flex--between flex--center flex--gap-2" style={{ alignItems: "flex-start" }}>
        <div style={{ minWidth: 0 }}>
          <Link href={`/tools/${tool.slug}`} className="text-white" style={{ fontSize: "1.05rem", fontWeight: 600 }}>
            {tool.name}
          </Link>
          <div className="text-muted" style={{ fontSize: "0.875rem", marginTop: 8 }}>
            {tool.description}
          </div>
        </div>
        <div className="flex flex--gap-1" style={{ flexWrap: "wrap", justifyContent: "flex-end" }}>
          {verified && <Badge tone="success">Verified</Badge>}
          <Badge tone="neutral">{tool.pricing}</Badge>
          {tool.status !== "unknown" && <Badge tone={tool.status === "active" ? "info" : "warn"}>{tool.status}</Badge>}
        </div>
      </div>
      <div className="flex flex--gap-1 mt-4" style={{ flexWrap: "wrap" }}>
        {tool.categories.slice(0, 3).map((c) => (
          <Badge key={c} tone="neutral">
            {c}
          </Badge>
        ))}
        {tool.platform.slice(0, 3).map((p) => (
          <Badge key={p} tone="neutral">
            {p}
          </Badge>
        ))}
      </div>
      <div className="mt-4 flex flex--gap-2 flex--resp-col">
        <Link className="btn btn--secondary btn--sm" href={`/tools/${tool.slug}`}>
          Details
        </Link>
        <a className="btn btn--ghost btn--sm" href={tool.affiliate_url ?? tool.url} target="_blank" rel="noreferrer">
          Visit tool
        </a>
        <CompareQuickAdd slug={tool.slug} />
      </div>
    </div>
  );
}
