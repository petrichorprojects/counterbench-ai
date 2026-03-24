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
            "radial-gradient(1200px 600px at 15% 15%, rgba(99,102,241,0.28), rgba(0,0,0,0) 60%), linear-gradient(135deg, #070B14 0%, #0B1220 45%, #0A1326 100%)",
          color: "#F8FAFC"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 5,
              background:
                "linear-gradient(180deg, #A78BFA 0%, #6366F1 60%, #22D3EE 100%)"
            }}
          />
          <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
            <div style={{ fontSize: 26, letterSpacing: 3, fontWeight: 800 }}>
              COUNTERBENCH
            </div>
            <div
              style={{
                fontSize: 26,
                letterSpacing: 3,
                fontWeight: 800,
                opacity: 0.85
              }}
            >
              AI
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
