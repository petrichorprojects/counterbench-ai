import type { ReactNode } from "react";

type Tone = "neutral" | "success" | "warn" | "danger" | "info";

const toneStyles: Record<Tone, { bg: string; border: string; fg: string }> = {
  neutral: { bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.12)", fg: "var(--fg)" },
  success: { bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.35)", fg: "var(--fg)" },
  warn: { bg: "rgba(245,158,11,0.14)", border: "rgba(245,158,11,0.35)", fg: "var(--fg)" },
  danger: { bg: "rgba(239,68,68,0.14)", border: "rgba(239,68,68,0.35)", fg: "var(--fg)" },
  info: { bg: "rgba(59,130,246,0.14)", border: "rgba(59,130,246,0.35)", fg: "var(--fg)" }
};

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  const t = toneStyles[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 10px",
        borderRadius: 999,
        border: `1px solid ${t.border}`,
        background: t.bg,
        color: t.fg,
        fontSize: "0.75rem",
        fontWeight: 600,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap"
      }}
    >
      {children}
    </span>
  );
}

