import type { ReactNode } from "react";
import AppShellClient from "@/components/layout/AppShellClient";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

export default async function AppShell({ children }: { children: ReactNode }) {
  return (
    <AppShellClient header={<Header />} footer={<Footer />}>
      {children}
    </AppShellClient>
  );
}
