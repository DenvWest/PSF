"use client";

import Link from "next/link";
import * as Icons from "@/components/app/icons";

type DomainListItemProps = {
  title: string;
  body: string;
  href?: string;
  linkLabel?: string;
  onClick?: () => void;
};

export default function DomainListItem({
  title,
  body,
  href,
  linkLabel,
  onClick,
}: DomainListItemProps) {
  return (
    <div className="rounded-[14px] border border-white/10 bg-black/20 px-3.5 py-3">
      <div className="font-serif text-[16px] text-[#F1EFE8]">{title}</div>
      <div className="mt-1 text-[13px] leading-relaxed text-[#9FB0A6] text-pretty">{body}</div>
      {href && linkLabel ? (
        <Link
          href={href}
          onClick={onClick}
          className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#5A8F6A] no-underline"
        >
          {linkLabel} <Icons.ChevronRight s={14} />
        </Link>
      ) : null}
    </div>
  );
}
