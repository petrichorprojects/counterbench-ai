import { ImageResponse } from "next/og";
import { getInsightBySlug } from "@/lib/insights";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function TwitterImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getInsightBySlug(slug);

  const title = post?.frontmatter.title ?? "Insight";
  const subtitle = post?.frontmatter.description ?? "Notes on defensible legal AI workflows.";

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
          background: "radial-gradient(1200px 600px at 15% 15%, rgba(34,211,238,0.18), rgba(0,0,0,0) 60%), linear-gradient(135deg, #070B14 0%, #0B1220 45%, #0A1326 100%)",
          color: "#F8FAFC"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 4,
              background: "linear-gradient(180deg, #A78BFA 0%, #6366F1 60%, #22D3EE 100%)"
            }}
          />
          <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
            <div style={{ fontSize: 22, letterSpacing: 3, fontWeight: 800 }}>COUNTERBENCH</div>
            <div style={{ fontSize: 22, letterSpacing: 3, fontWeight: 800, opacity: 0.85 }}>AI</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 60, lineHeight: 1.05, fontWeight: 900, letterSpacing: -1.5 }}>{title}</div>
          <div style={{ fontSize: 26, lineHeight: 1.3, color: "rgba(226,232,240,0.88)", maxWidth: 980 }}>{subtitle}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
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

          <div style={{ fontSize: 18, color: "rgba(148,163,184,0.95)" }}>counterbench.ai/insights</div>
        </div>
      </div>
    ),
    { width: size.width, height: size.height }
  );
}

