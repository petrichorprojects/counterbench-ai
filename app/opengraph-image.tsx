import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
          background:
            "radial-gradient(1100px 560px at 12% 12%, rgba(90,116,160,0.30), rgba(0,0,0,0) 62%), linear-gradient(135deg, #0B1220 0%, #141d30 50%, #1b2740 100%)",
          color: "#F8FAFC"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="42" height="42" viewBox="0 0 96 96">
            <path d="M30 69V30H60" fill="none" stroke="#aab9d1" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M66 27V66H36" fill="none" stroke="#e06a80" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <div style={{ fontSize: 30, letterSpacing: -1, fontWeight: 800 }}>
              counterbench
            </div>
            <div style={{ fontSize: 30, letterSpacing: -1, fontWeight: 800, color: "#e06a80" }}>
              .ai
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 72,
              lineHeight: 1.04,
              fontWeight: 900,
              letterSpacing: -2
            }}
          >
            Legal AI Tools, Prompts
          </div>
          <div
            style={{
              fontSize: 72,
              lineHeight: 1.04,
              fontWeight: 900,
              letterSpacing: -2
            }}
          >
            & Workflows
          </div>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.3,
              color: "rgba(226,232,240,0.88)",
              maxWidth: 900
            }}
          >
            A curated directory of AI tools, prompts, and skills for US legal
            professionals.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end"
          }}
        >
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
              275 Tools
            </div>
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
              780 Prompts
            </div>
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
              24 Guides
            </div>
          </div>

          <div style={{ fontSize: 18, color: "rgba(148,163,184,0.95)" }}>
            counterbench.ai
          </div>
        </div>
      </div>
    ),
    { width: size.width, height: size.height }
  );
}
