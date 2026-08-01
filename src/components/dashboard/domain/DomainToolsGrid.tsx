"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import * as Icons from "@/components/app/icons";

export type DomainTool = {
  icon: string;
  label: string;
  href: string | null;
  slug: string;
};

type DomainToolsGridProps = {
  tools: DomainTool[];
  note: string;
  onToolClick: (tool: DomainTool) => void;
};

export default function DomainToolsGrid({ tools, note, onToolClick }: DomainToolsGridProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-2.5">
        {tools.map((tool) => {
          const inner: ReactNode = (
            <>
              <span className="text-[22px]" aria-hidden>
                {tool.icon}
              </span>
              <span className="text-[14.5px] text-[#F1EFE8]">{tool.label}</span>
            </>
          );
          const boxClass =
            "flex items-center gap-2.5 rounded-[14px] border border-white/10 bg-black/20 px-3.5 py-3 no-underline text-inherit";

          if (tool.href) {
            return (
              <Link
                key={tool.slug}
                href={tool.href}
                onClick={() => onToolClick(tool)}
                className={boxClass}
              >
                {inner}
              </Link>
            );
          }
          return (
            <div key={tool.slug} className={boxClass}>
              {inner}
            </div>
          );
        })}
      </div>
      <div className="mt-3.5 flex items-center gap-2">
        <Icons.Shield s={13} style={{ color: "#5A8F6A" }} />
        <span className="text-[12.5px] leading-relaxed text-[#9FB0A6]">{note}</span>
      </div>
    </>
  );
}
