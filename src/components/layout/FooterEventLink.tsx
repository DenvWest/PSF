"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/ga4";

type FooterEventLinkProps = {
  href: string;
  label: string;
  /** GA4-event dat bij de klik hoort. */
  event: string;
  className?: string;
};

/** Footerlink met een meetpunt — voor bestemmingen die uit de hoofdnavigatie
 *  zijn gehaald en waarvan we willen weten of ze nog gevonden worden. */
export default function FooterEventLink({
  href,
  label,
  event,
  className = "",
}: FooterEventLinkProps) {
  return (
    <Link
      href={href}
      onClick={() => trackEvent(event, { source: "footer" })}
      className={className}
    >
      {label}
    </Link>
  );
}
