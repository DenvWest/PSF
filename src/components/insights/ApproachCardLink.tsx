"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { trackEvent } from "@/lib/ga4";

type ApproachCardLinkProps = {
  href: string;
  destination: string;
  pillar?: string;
  className?: string;
  children: ReactNode;
};

export default function ApproachCardLink({
  href,
  destination,
  pillar = "aanpak",
  className,
  children,
}: ApproachCardLinkProps) {
  return (
    <Link
      href={href}
      onClick={() => trackEvent("focus_area_click", { pillar, destination })}
      className={className}
    >
      {children}
    </Link>
  );
}
