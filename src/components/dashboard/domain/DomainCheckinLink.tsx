"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import * as Icons from "@/components/app/icons";

type DomainCheckinLinkProps = {
  href: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  caption?: string;
};

export default function DomainCheckinLink({
  href,
  icon,
  label,
  onClick,
  caption,
}: DomainCheckinLinkProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Link
        href={href}
        onClick={onClick}
        className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 no-underline text-inherit"
      >
        {icon}
        <span className="flex-1 text-[14.5px] font-semibold text-[#F1EFE8]">{label}</span>
        <Icons.ChevronRight s={18} style={{ color: "#9FB0A6", flexShrink: 0 }} />
      </Link>
      {caption ? (
        <p className="px-1 text-[12.5px] leading-relaxed text-[#9FB0A6]">{caption}</p>
      ) : null}
    </div>
  );
}
