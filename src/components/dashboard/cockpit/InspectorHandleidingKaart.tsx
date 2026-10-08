"use client";

import Link from "next/link";
import * as Icons from "@/components/app/icons";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";

export default function InspectorHandleidingKaart({ href }: { href: string }) {
  return (
    <div className="rounded-[14px] border border-white/10 bg-black/20 p-4">
      <span className="mb-2 inline-flex items-center text-[10px] font-bold uppercase tracking-[0.1em] text-[#9FB0A6]">
        Handleiding
      </span>
      <p className="mb-2.5 text-[12px] leading-relaxed text-[#9FB0A6]">
        Waarom je dagstap bij je past en hoe je hem uitvoert.
      </p>
      <Link
        href={href}
        onClick={() => {
          trackEvent("dashboard_agenda_plan_click", { surface: "context_vandaag" });
          clarityTag("dashboard_agenda", "plan_link");
        }}
        className="inline-flex min-h-11 items-center gap-1.5 text-[13px] font-medium text-[#CDD7D0] no-underline transition-colors hover:text-[#F1EFE8]"
      >
        Open de handleiding
        <Icons.ArrowRight s={12} />
      </Link>
    </div>
  );
}
