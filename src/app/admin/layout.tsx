import type { ReactNode } from "react";
import { adminSans, adminSerif } from "@/lib/admin-fonts";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${adminSans.variable} ${adminSerif.variable} min-h-screen antialiased`}
      style={{
        fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
      }}
    >
      {children}
    </div>
  );
}
