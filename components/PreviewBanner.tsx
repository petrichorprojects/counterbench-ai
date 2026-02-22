export function PreviewBanner() {
  const root = process.env.CB_CONTENT_ROOT?.trim() || "content";
  const isPreview = root !== "content";
  if (!isPreview) return null;

  return (
    <div
      role="status"
      aria-label="Preview mode"
      style={{
        position: "sticky",
        top: 72,
        zIndex: 90,
        background: "rgba(245,158,11,0.12)",
        borderBottom: "1px solid rgba(245,158,11,0.35)"
      }}
    >
      <div className="container" style={{ paddingTop: 10, paddingBottom: 10 }}>
        <div className="text-white" style={{ fontSize: "0.875rem", fontWeight: 700 }}>
          Preview content mode
        </div>
        <div className="text-muted" style={{ fontSize: "0.8125rem", marginTop: 2 }}>
          Using `CB_CONTENT_ROOT={root}`. This is intended for QA before promoting to production content.
        </div>
      </div>
    </div>
  );
}

