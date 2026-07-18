"use client";

import Link from "next/link";
import * as Icons from "@/components/app/icons";
import { KompasLooseCard } from "@/components/dashboard/agenda/KompasLooseCard";
import { PILLAR } from "@/data/dashboard";
import { clarityTag } from "@/lib/clarity";
import { trackOnderbouwingLinkClick } from "@/lib/ga4";
import type { WeekDaySlot } from "@/lib/agenda-week-preview";

type AgendaDayPreviewProps = {
  slot: WeekDaySlot;
};

export default function AgendaDayPreview({ slot }: AgendaDayPreviewProps) {
  const pillar = PILLAR[slot.domain];
  const dateLabel = slot.isToday
    ? "Vandaag"
    : new Intl.DateTimeFormat("nl-NL", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: "Europe/Amsterdam",
      }).format(new Date(`${slot.date}T12:00:00.000Z`));

  return (
    <KompasLooseCard>
      <div className="mb-1 flex items-center gap-2">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: pillar.color }}
          aria-hidden
        />
        <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#78716c]">
          {pillar.label}
        </span>
      </div>

      <p className="text-[13px] text-[#78716c] capitalize">{dateLabel}</p>

      <p
        className="mt-3 text-[16px] font-semibold leading-snug text-[#1c1917] text-pretty"
        style={{ fontFamily: "var(--f-serif)" }}
      >
        {slot.title}
      </p>

      {slot.rationale ? (
        <p className="mt-2 text-[13.5px] leading-normal text-[#78716c] text-pretty">
          {slot.rationale}
        </p>
      ) : slot.detail ? (
        <p className="mt-2 text-[13.5px] leading-normal text-[#78716c] text-pretty">
          {slot.detail}
        </p>
      ) : null}

      <Link
        href={slot.evidenceHref}
        onClick={() => {
          trackOnderbouwingLinkClick({
            surface: "agenda_preview",
            domain: slot.domain,
          });
          clarityTag("onderbouwing_link", "agenda_preview");
        }}
        className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium no-underline"
        style={{ color: "var(--sage)" }}
      >
        Waarom deze stap?
        <Icons.ArrowRight s={14} />
      </Link>

      {slot.planLink ? (
        <Link
          href={slot.planLink.href}
          className="mt-2 inline-flex items-center gap-1.5 text-[13px] no-underline"
          style={{ color: "var(--sage)" }}
        >
          {slot.planLink.label}
          <Icons.ArrowRight s={14} />
        </Link>
      ) : null}

      {!slot.isToday ? (
        <p className="mt-4 text-[12.5px] leading-normal text-[#78716c] text-pretty">
          Vooruitkijken — je kunt deze stap afvinken zodra het zover is.
        </p>
      ) : null}
    </KompasLooseCard>
  );
}
