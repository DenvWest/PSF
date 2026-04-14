"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideSiteChrome =
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/intake" ||
    pathname.startsWith("/intake/");

  if (hideSiteChrome) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
