import type { ReactNode } from "react";
import { headers } from "next/headers";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

export default async function AppShell({ children }: { children: ReactNode }) {
  const requestHeaders = await headers();
  const pathname = requestHeaders.get("x-pathname") ?? "/";
  const hideSiteChrome =
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/intake" ||
    pathname.startsWith("/intake/") ||
    pathname === "/account" ||
    pathname.startsWith("/account/") ||
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/");

  if (hideSiteChrome) {
    return <>{children}</>;
  }

  const isHomePage = pathname === "/";

  return (
    <>
      <Header />
      <main
        className={
          isHomePage
            ? "pb-16 md:pb-20"
            : "min-h-screen"
        }
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
