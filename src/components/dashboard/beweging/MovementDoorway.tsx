"use client";

import type { ReactNode } from "react";
import * as Icons from "@/components/app/icons";

export type MovementDoorwayProps = {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
};

export default function MovementDoorway({
  children,
  onClick,
  className = "",
}: MovementDoorwayProps) {
  const body = (
    <>
      <span className="min-w-0 flex-1 text-[13.5px] leading-snug text-[#F1EFE8]">
        {children}
      </span>
      <Icons.ChevronRight s={16} style={{ color: "#79B98C", flexShrink: 0 }} />
    </>
  );

  const classes = `mt-3 flex w-full cursor-pointer items-center justify-between gap-2.5 rounded-xl border border-[#79B98C]/32 bg-[#5A8F6A]/10 px-3.5 py-3 text-left transition hover:border-[#79B98C]/45 hover:bg-[#5A8F6A]/14 ${className}`;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${classes} font-[inherit]`}>
        {body}
      </button>
    );
  }

  return null;
}
