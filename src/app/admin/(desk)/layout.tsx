import type { ReactNode } from "react";
import { DeskShell } from "@/components/partnerdesk/DeskShell";

export default function DeskLayout({ children }: { children: ReactNode }) {
  return <DeskShell>{children}</DeskShell>;
}
