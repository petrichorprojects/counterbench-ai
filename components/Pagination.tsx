import Link from "next/link";

export function Pagination({
  basePath,
  page,
  totalPages,
  query
}: {
  basePath: string;
  page: number;
  totalPages: number;
  query: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const mk = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v) params.set(k, v);
    }
    params.set("page", String(p));
    return `${basePath}?${params.toString()}`;
  };

  return (
    <nav aria-label="Pagination" className="mt-6">
      <div className="flex flex--gap-2 flex--center" style={{ justifyContent: "center" }}>
        <Link className="btn btn--secondary btn--sm" aria-disabled={page <= 1} href={mk(Math.max(1, page - 1))}>
          Prev
        </Link>
        <div className="text-muted" style={{ fontSize: "0.875rem" }}>
          Page {page} / {totalPages}
        </div>
        <Link
          className="btn btn--secondary btn--sm"
          aria-disabled={page >= totalPages}
          href={mk(Math.min(totalPages, page + 1))}
        >
          Next
        </Link>
      </div>
    </nav>
  );
}

