import type { Metadata } from "next";
import type { ReactNode } from "react";
import { adminSans, adminSerif } from "@/lib/admin-fonts";

export const metadata: Metadata = {
  title: "Admin | PerfectSupplement",
  robots: { index: false, follow: false },
};

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
