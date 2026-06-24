import type { ReactNode } from "react";
import { Suspense } from "react";
import IntakeLayoutHeader from "@/components/intake/IntakeLayoutHeader";

function IntakeLayoutHeaderFallback() {
  return (
    <div
      className="intake-layout-header flex w-full items-center justify-end px-6 pb-3 pt-5"
      style={{ boxSizing: "border-box" }}
      aria-hidden
    />
  );
}

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
      <Suspense fallback={<IntakeLayoutHeaderFallback />}>
        <IntakeLayoutHeader />
      </Suspense>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}
