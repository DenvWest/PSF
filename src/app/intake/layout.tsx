import type { ReactNode } from "react";
import ExitButton from "@/components/app/ExitButton";

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
        <ExitButton href="/" />
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}
