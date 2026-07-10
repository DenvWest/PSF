"use client";

import Link from "next/link";
import * as Icons from "@/components/app/icons";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";

export const PREMIUM_BEGELEIDING_HREF =
  "/dashboard?tab=voortgang#premium-begeleiding";

type KompasBegeleidingLinkProps = {
  surface: string;
  showHint?: boolean;
};

export default function KompasBegeleidingLink({
  surface,
  showHint = true,
}: KompasBegeleidingLinkProps) {
  return (
    <div style={{ padding: "4px 2px 0" }}>
      <Link
        href={PREMIUM_BEGELEIDING_HREF}
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
      {showHint ? (
        <p
          style={{
            margin: "8px 0 0",
            fontSize: 12.5,
            color: "var(--text-muted)",
            lineHeight: 1.5,
            textWrap: "pretty",
          }}
        >
          Gratis: na 30 dagen je hermeting onder het tabblad Hermeting. Premium:
          wekelijks iemand die met je meekijkt — wachtlijst op Voortgang.
        </p>
      ) : null}
    </div>
  );
}
