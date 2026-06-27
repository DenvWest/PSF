import type { ReactNode } from "react";
import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="ps-dark ps-account-root"
      style={{
        minHeight: "100dvh",
        background: "#1a2e1a",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
    </div>
  );
}
