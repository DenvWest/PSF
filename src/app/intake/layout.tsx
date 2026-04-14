import type { ReactNode } from "react";
import Link from "next/link";

export default function IntakeLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#1a2e1a",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 24px 12px",
          maxWidth: 480,
          width: "100%",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        <span
          style={{
            fontFamily: '"DM Serif Display", Georgia, serif',
            fontSize: 15,
            color: "rgba(255,255,255,0.85)",
            letterSpacing: "0.01em",
            fontWeight: 400,
          }}
        >
          PerfectSupplement
        </span>
        <Link
          href="/"
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: 13,
            textDecoration: "none",
            letterSpacing: "0.01em",
            padding: "4px 0",
          }}
        >
          ✕ Sluiten
        </Link>
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}
