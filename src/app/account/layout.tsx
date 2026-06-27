import type { ReactNode } from "react";
import type { Viewport } from "next";
import AccountBodyLock from "@/components/account/AccountBodyLock";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="ps-dark ps-account-shell"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        backgroundColor: "#1a2e1a",
      }}
    >
      <AccountBodyLock />
      {children}
    </div>
  );
}
