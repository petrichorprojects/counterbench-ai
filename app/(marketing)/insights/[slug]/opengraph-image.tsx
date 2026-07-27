import { ImageResponse } from "next/og";
import { getInsightBySlug } from "@/lib/insights";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getInsightBySlug(slug);

  const title = post?.frontmatter.title ?? "Insight";
  const subtitle = post?.frontmatter.description ?? "Notes on defensible legal AI workflows.";
  const date = post?.frontmatter.date ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "radial-gradient(1200px 600px at 15% 15%, rgba(90,116,160,0.24), rgba(0,0,0,0) 60%), linear-gradient(135deg, #070B14 0%, #0B1220 45%, #0A1326 100%)",
          color: "#F8FAFC"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <svg width="30" height="30" viewBox="0 0 96 96">
            <path d="M30 69V30H60" fill="none" stroke="#aab9d1" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M66 27V66H36" fill="none" stroke="#e06a80" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <div style={{ fontSize: 24, letterSpacing: -1, fontWeight: 800 }}>counterbench</div>
            <div style={{ fontSize: 24, letterSpacing: -1, fontWeight: 800, color: "#e06a80" }}>.ai</div>
          </div>
          <div
            style={{
              marginLeft: 14,
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.25)",
              background: "rgba(2,6,23,0.35)",
              color: "rgba(226,232,240,0.9)",
              fontSize: 14,
              letterSpacing: 1.2,
              textTransform: "uppercase"
            }}
          >
            Insight
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 60, lineHeight: 1.05, fontWeight: 900, letterSpacing: -1.5 }}>{title}</div>
          <div style={{ fontSize: 26, lineHeight: 1.3, color: "rgba(226,232,240,0.88)", maxWidth: 980 }}>{subtitle}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 999,
                border: "1px solid rgba(148,163,184,0.25)",
                background: "rgba(2,6,23,0.35)",
                color: "rgba(226,232,240,0.9)",
                fontSize: 16
              }}
            >
              Defensible workflows • Templates • Checklists
            </div>
            {date ? (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 999,
                  border: "1px solid rgba(148,163,184,0.25)",
                  background: "rgba(2,6,23,0.35)",
                  color: "rgba(226,232,240,0.9)",
                  fontSize: 16
                }}
              >
                {date}
              </div>
            ) : null}
          </div>

          <div style={{ fontSize: 18, color: "rgba(148,163,184,0.95)" }}>counterbench.ai/insights</div>
        </div>
      </div>
    ),
    { width: size.width, height: size.height }
  );
}

