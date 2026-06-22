import Link from "next/link";
import Container from "@/components/layout/Container";
import {
  INSIGHT_TYPE_LABELS,
} from "@/components/insights/ContentCard";
import InzichtenFilterSupplementsLink from "@/components/insights/InzichtenFilterSupplementsLink";
import { PILLARS } from "@/data/dashboard";
import { buildInsightFilterHref, INSIGHT_TYPES_IN_DATA } from "@/data/insights";
import type { PillarId } from "@/types/dashboard";
import type { InsightType } from "@/types/insight";

type InzichtenFilterBarProps = {
  activePijler?: PillarId;
  activeType?: InsightType;
  count: number;
};

function feedHref(pijler?: PillarId, type?: InsightType): string {
  const href = buildInsightFilterHref({ pijler, type });
  return href === "/inzichten" ? "/inzichten?alles=1" : href;
}

function pijlerChipClass(active: boolean): string {
  return active
    ? "border-[#0E1A14] bg-[#0E1A14] text-[#F7F5F0]"
    : "border-[#E7E5E4] bg-white text-stone-700 hover:border-stone-400";
}

function typeChipClass(active: boolean): string {
  return active
    ? "bg-[#5A8F6A] text-white"
    : "text-stone-600 hover:bg-stone-100";
}

export default function InzichtenFilterBar({
  activePijler,
  activeType,
  count,
}: InzichtenFilterBarProps) {
  return (
    <div className="sticky top-[68px] z-30 border-b border-[#E7E5E4] bg-[#F7F5F0]/90 backdrop-blur-md">
      <Container className="py-4">
        <div className="flex flex-wrap items-center gap-2.5 pb-3.5">
          <span className="mr-1 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-stone-400">
            Leefstijl
          </span>
          <div className="-mx-6 flex min-w-0 flex-1 items-center gap-2 overflow-x-auto px-6 md:mx-0 md:px-0">
            <Link
              href={feedHref(undefined, activeType)}
              className={`shrink-0 rounded-full border px-[17px] py-2 text-[13.5px] font-semibold transition ${pijlerChipClass(!activePijler)}`}
            >
              Alles
            </Link>
            {PILLARS.map((pillar) => (
              <Link
                key={pillar.id}
                href={feedHref(pillar.id, activeType)}
                className={`shrink-0 rounded-full border px-[17px] py-2 text-[13.5px] font-medium transition ${pijlerChipClass(activePijler === pillar.id)}`}
              >
                {pillar.label}
              </Link>
            ))}
          </div>
          <div className="hidden border-l border-[#E7E5E4] pl-3.5 md:block">
            <InzichtenFilterSupplementsLink />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3.5">
          <span className="mr-1 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-stone-400">
            Type
          </span>
          <div className="inline-flex gap-0.5 rounded-xl border border-[#E7E5E4] bg-white p-1">
            <Link
              href={feedHref(activePijler, undefined)}
              className={`rounded-[9px] px-[15px] py-2 text-[13px] font-semibold transition ${typeChipClass(!activeType)}`}
            >
              Alles
            </Link>
            {INSIGHT_TYPES_IN_DATA.map((type) => (
              <Link
                key={type}
                href={feedHref(activePijler, type)}
                className={`rounded-[9px] px-[15px] py-2 text-[13px] font-medium transition ${typeChipClass(activeType === type)}`}
              >
                {INSIGHT_TYPE_LABELS[type]}
              </Link>
            ))}
          </div>
          <span className="ml-auto text-[13px] text-stone-400">
            {count} {count === 1 ? "inzicht" : "inzichten"}
          </span>
        </div>
        <div className="mt-3 border-t border-[#E7E5E4] pt-3 md:hidden">
          <InzichtenFilterSupplementsLink />
        </div>
      </Container>
    </div>
  );
}
