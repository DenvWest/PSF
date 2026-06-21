"use client";

import Link from "next/link";
import { PILLAR } from "@/data/dashboard";
import { trackEvent } from "@/lib/ga4";
import type { PillarId } from "@/types/dashboard";

interface DomainHubConnectorProps {
  pillarId: PillarId;
}

const PILLAR_DOT_CLASS: Record<PillarId, string> = {
  slaap: "bg-[#5B6EAE]",
  energie: "bg-[#C4873B]",
  stress: "bg-[#8B6E99]",
  voeding: "bg-[#5A8F6A]",
  beweging: "bg-[#C26E4B]",
  herstel: "bg-[#4A8A99]",
};

export default function DomainHubConnector({ pillarId }: DomainHubConnectorProps) {
  const pillar = PILLAR[pillarId];

  return (
    <aside
      aria-label={`${pillar.label} hub`}
      className="mt-12 rounded-2xl border border-stone-200/80 bg-white px-6 py-8 shadow-sm shadow-stone-900/[0.03] md:px-8 md:py-10"
    >
      <div className="flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${PILLAR_DOT_CLASS[pillarId]}`}
          aria-hidden="true"
        />
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-600">
          {pillar.label}
        </p>
      </div>

      <p className="mt-4 max-w-[65ch] text-[0.9375rem] leading-relaxed text-stone-700">
        {pillar.lever}
      </p>

      <section className="mt-6 rounded-xl border border-stone-200/90 bg-stone-50/70 px-5 py-5 md:px-6 md:py-6">
        <h3 className="font-serif text-lg font-bold text-stone-900 md:text-xl">
          {pillar.quickWin.title}
        </h3>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-stone-600">
          {pillar.quickWin.detail}
        </p>
      </section>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
        <Link
          href="/intake"
          onClick={() =>
            trackEvent("hub_connector_click", { pillar: pillarId, target: "intake" })
          }
          className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-ps-green px-6 py-3 text-sm font-semibold text-white transition hover:bg-ps-green-hover"
        >
          Doe de leefstijlcheck — zie waar jij staat op {pillar.label}
        </Link>
        <Link
          href={`/inzichten?pijler=${pillarId}`}
          onClick={() =>
            trackEvent("hub_connector_click", { pillar: pillarId, target: "inzichten" })
          }
          className="inline-flex min-h-[44px] items-center text-sm font-medium text-stone-800 underline decoration-stone-300 decoration-1 underline-offset-[3px] transition hover:text-stone-950 hover:decoration-stone-500"
        >
          Lees alles over {pillar.label} →
        </Link>
      </div>
    </aside>
  );
}
