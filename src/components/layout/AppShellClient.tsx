"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

type AppShellClientProps = {
  children: ReactNode;
  header: ReactNode;
  footer: ReactNode;
};

export default function AppShellClient({
  children,
  header,
  footer,
}: AppShellClientProps) {
  const pathname = usePathname();
  const hideSiteChrome =
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/intake" ||
    pathname.startsWith("/intake/") ||
    pathname === "/account" ||
    pathname.startsWith("/account/") ||
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/hoe-werkt-dashboard";

  if (hideSiteChrome) {
    return <>{children}</>;
  }

  const isHomePage = pathname === "/";

  return (
    <>
      {header}
      <main className={isHomePage ? "pb-16 md:pb-20" : "min-h-screen"}>
        {children}
      </main>
      {footer}
    </>
  );
}
