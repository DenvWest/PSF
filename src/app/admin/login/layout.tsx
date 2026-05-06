import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Admin — Inloggen — PerfectSupplement",
  description: "Beveiligde inlogpagina voor het PerfectSupplement administratie-dashboard.",
  robots: { index: false, follow: false },
};

export default function AdminLoginLayout({ children }: { children: ReactNode }) {
  return children;
}
