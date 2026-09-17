"use client";

import Link from "next/link";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";
import { clarityTag } from "@/lib/clarity";

type NutritionGapVoedingCheckLinkProps = {
  locatie: string;
  className: string;
  children: string;
};

export default function NutritionGapVoedingCheckLink({
  locatie,
  className,
  children,
}: NutritionGapVoedingCheckLinkProps) {
  return (
    <Link
      href="/intake/voeding"
      className={className}
      onClick={() => {
        trackEvent(GA4_EVENTS.VOEDING_CHECK_CLICKED, { locatie });
        clarityTag("voeding_check", locatie);
      }}
    >
      {children}
    </Link>
  );
}
