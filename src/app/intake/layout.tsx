import type { ReactNode } from "react";
import IntakeLayoutHeader from "@/components/intake/IntakeLayoutHeader";

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
      <IntakeLayoutHeader />
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}
