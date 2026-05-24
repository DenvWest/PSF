import type { ReactNode } from "react";
import Link from "next/link";

export default function IntakeLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--intake-bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        className="intake-layout-header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "20px 24px 12px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <Link
          href="/"
          style={{
            color: "var(--intake-ink-subtle)",
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
