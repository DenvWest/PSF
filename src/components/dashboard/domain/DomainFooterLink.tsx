"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import * as Icons from "@/components/app/icons";

type DomainFooterLinkProps = {
  href: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
};

export default function DomainFooterLink({ href, icon, label, onClick }: DomainFooterLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-[18px] py-4 no-underline text-inherit transition hover:border-white/20"
    >
      {icon}
      <span className="flex-1 font-serif text-[16px] text-[#F1EFE8]">{label}</span>
      <Icons.ChevronRight s={18} style={{ color: "#9FB0A6", flexShrink: 0 }} />
    </Link>
  );
}
