"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";
import { clarityTag } from "@/lib/clarity";

type NutritionGapGuideLinkProps = {
  locatie: string;
  className: string;
  children: ReactNode;
};

export default function NutritionGapGuideLink({
  locatie,
  className,
  children,
}: NutritionGapGuideLinkProps) {
  return (
    <Link
      href="/voedingstekort"
      className={className}
      onClick={() => {
        trackEvent(GA4_EVENTS.VOEDINGSTEKORT_NAV, { locatie });
        clarityTag("voedingstekort_nav", locatie);
      }}
    >
      {children}
    </Link>
  );
}
