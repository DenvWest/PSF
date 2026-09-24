"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { clarityTag } from "@/lib/clarity";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";

type IntakeCtaLinkProps = {
  locatie: string;
  className?: string;
  children: ReactNode;
};

export function IntakeCtaLink({
  locatie,
  className,
  children,
}: IntakeCtaLinkProps) {
  return (
    <Link
      href="/intake"
      onClick={() => {
        trackEvent(GA4_EVENTS.INTAKE_CTA_CLICKED, { locatie });
        clarityTag("intake_cta", locatie);
      }}
      className={className}
    >
      {children}
    </Link>
  );
}
