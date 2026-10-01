import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/admin-auth";
import { DeskShell } from "@/components/partnerdesk/DeskShell";

export default async function DeskLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  return <DeskShell>{children}</DeskShell>;
}
