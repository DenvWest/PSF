"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import * as Icons from "@/components/app/icons";
import { PREMIUM_BEGELEIDING_HREF } from "@/components/dashboard/KompasBegeleidingLink";
import { clarityTag } from "@/lib/clarity";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { trackEvent } from "@/lib/ga4";
import type { PillarId } from "@/types/dashboard";

type DomainMeetModuleProps = {
  domain: PillarId;
  title: string;
  description: string;
  bullets: string[];
  note?: string;
  teaser?: string;
};

/**
 * Laag 1 — Meten (T1). Soft-paywall: zichtbaar maar op slot; de preview-klik is
 * het intent-meetpunt. Copy blijft binnen inname-inschatting — geen statusclaims.
 */
export default function DomainMeetModule({
  domain,
  title,
  description,
  bullets,
  note,
  teaser,
}: DomainMeetModuleProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const clickedRef = useRef(false);

  const togglePreview = () => {
    setPreviewOpen((current) => !current);
    if (clickedRef.current) {
      return;
    }
    clickedRef.current = true;
    trackEvent("domain_tool_tier_preview_click", { domain, target_tier: 1 });
    emitAccountClientEvent("domain_tool.tier_preview_clicked", { domain, target_tier: 1 });
    clarityTag("domain_tool_tier_preview", `${domain}_t1`);
  };

  return (
    <div
      aria-label={title}
      className="rounded-2xl border border-[#C8956C]/35 bg-black/20 p-4"
    >
      <div className="flex flex-col gap-3">
        <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#C8956C]">
          <Icons.Lock s={14} /> Premium · meten
        </div>
        <div className="font-serif text-[21px] leading-[1.2] text-[#F1EFE8]">{title}</div>
        <p className="text-[14px] leading-relaxed text-[#CDD7D0] text-pretty">{description}</p>

        {previewOpen ? (
          <div className="flex flex-col gap-2">
            {teaser ? (
              <div className="font-serif text-[17px] text-[#F1EFE8]">{teaser}</div>
            ) : null}
            {bullets.map((bullet) => (
              <div key={bullet} className="flex items-start gap-2">
                <Icons.Check s={14} style={{ color: "#5A8F6A", flexShrink: 0, marginTop: 3 }} />
                <span className="text-[13.5px] leading-relaxed text-[#CDD7D0] text-pretty">
                  {bullet}
                </span>
              </div>
            ))}
            {note ? (
              <p className="mt-1 text-[12.5px] leading-relaxed text-[#9FB0A6] text-pretty">
                {note}
              </p>
            ) : null}
            <Link
              href={PREMIUM_BEGELEIDING_HREF}
              onClick={() => {
                trackEvent("dashboard_kompas_begeleiding_link_click", {
                  surface: `meetmodule_${domain}`,
                });
                clarityTag("dashboard_kompas_begeleiding", `meetmodule_${domain}`);
              }}
              className="self-start text-[13.5px] font-semibold text-[#5A8F6A] no-underline"
            >
              Zet me op de wachtlijst →
            </Link>
          </div>
        ) : null}

        <button
          type="button"
          onClick={togglePreview}
          className="inline-flex cursor-pointer items-center gap-1 self-start border-none bg-transparent p-0 text-[13.5px] font-semibold text-[#5A8F6A]"
        >
          {previewOpen ? "Verberg voorbeeld" : "Bekijk wat je straks meet"}
          <Icons.ChevronRight
            s={15}
            style={{
              transform: previewOpen ? "rotate(-90deg)" : "rotate(90deg)",
              transition: "transform .2s",
            }}
          />
        </button>

        <span className="inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full border border-[#C8956C]/40 px-[11px] py-1 text-[11px] font-bold tracking-[0.04em] text-[#C8956C]">
          <Icons.Spark s={12} /> Binnenkort in premium
        </span>
      </div>
    </div>
  );
}
