import Link from "next/link";

type Crumb = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" className="text-muted" style={{ fontSize: "0.8125rem", marginBottom: "0.75rem" }}>
      <ol style={{ display: "flex", flexWrap: "wrap", gap: 8, listStyle: "none", padding: 0, margin: 0, alignItems: "center" }}>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={`${item.label}-${idx}`} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              {item.href && !isLast ? (
                <Link href={item.href} className="text-white" style={{ textDecoration: "none" }}>
                  {item.label}
                </Link>
              ) : (
                <span>{item.label}</span>
              )}
              {!isLast && <span aria-hidden="true">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
