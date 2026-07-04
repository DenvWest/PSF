"use client";

import Link from "next/link";
import * as Icons from "@/components/app/icons";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";

type KompasBegeleidingLinkProps = {
  surface: string;
};

export default function KompasBegeleidingLink({ surface }: KompasBegeleidingLinkProps) {
  return (
    <Link
      href="/dashboard?tab=voortgang"
      onClick={() => {
        trackEvent("dashboard_kompas_begeleiding_link_click", { surface });
        clarityTag("dashboard_kompas_begeleiding", surface);
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 14,
        fontWeight: 600,
        color: "var(--sage)",
        textDecoration: "none",
      }}
    >
      Meer over begeleiding
      <Icons.ChevronRight s={16} />
    </Link>
  );
}
