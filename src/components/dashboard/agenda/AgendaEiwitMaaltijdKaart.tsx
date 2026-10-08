"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Icons from "@/components/app/icons";
import { clarityTag } from "@/lib/clarity";
import { buildDashboardVandaagHref } from "@/lib/dashboard-url";
import { trackEvent } from "@/lib/ga4";
import type { EiwitMaaltijd } from "@/lib/agenda-eiwit-per-maaltijd";

export type EiwitKaartData = {
  title: string;
  maaltijden: readonly EiwitMaaltijd[];
};

export default function AgendaEiwitMaaltijdKaart({ title, maaltijden }: EiwitKaartData) {
  const gehaald = maaltijden.filter((maaltijd) => maaltijd.stand === "gehaald").length;

  useEffect(() => {
    trackEvent("agenda_eiwit_maaltijd_kaart_shown", { gehaald, maaltijden: maaltijden.length });
  }, [gehaald, maaltijden.length]);

  return (
    <li className="rounded-[10px] border border-white/10 bg-black/15 px-2.5 py-2">
      <span className="block text-[12.5px] leading-relaxed text-[#CDD7D0] text-pretty">{title}</span>
      <ul className="m-0 mt-2 flex list-none gap-1.5 p-0">
        {maaltijden.map((maaltijd) => (
          <li
            key={maaltijd.id}
            className="flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg border border-white/10 bg-white/[0.03] px-1.5 py-1.5"
          >
            <span className="text-[10.5px] text-[#9FB0A6]">{maaltijd.label}</span>
            <span className="flex h-5 items-center gap-1 text-[12px] font-semibold text-[#CDD7D0]">
              {maaltijd.stand === "gehaald" ? (
                <Icons.Check s={12} style={{ color: "#7FB28E" }} />
              ) : null}
              {maaltijd.gram !== null ? `${maaltijd.gram} g` : "—"}
            </span>
            <span className="sr-only">
              {maaltijd.stand === "gehaald"
                ? "minimaal 20 gram eiwit"
                : maaltijd.stand === "open"
                  ? "nog niet aangetoond"
                  : "niet ingevuld"}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] leading-relaxed text-[#7E8C82]">
        Een vinkje staat er pas als je dagboek het laat zien. Een leeg vakje betekent niet dat je het
        gemist hebt.
      </p>
      <Link
        href={buildDashboardVandaagHref()}
        onClick={() => {
          trackEvent("agenda_eiwit_maaltijd_dagboek_click", { gehaald });
          clarityTag("agenda_eiwit_maaltijd", "dagboek_click");
        }}
        className="mt-1.5 inline-flex min-h-11 items-center gap-1.5 text-[12.5px] font-medium text-[#CDD7D0] no-underline transition-colors hover:text-[#F1EFE8]"
      >
        Naar je dagboek
        <Icons.ArrowRight s={12} />
      </Link>
    </li>
  );
}
