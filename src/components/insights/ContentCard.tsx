import Link from "next/link";
import { PILLAR } from "@/data/dashboard";
import type { InsightItem, InsightType } from "@/types/insight";

export const INSIGHT_TYPE_LABELS: Record<InsightType, string> = {
  artikel: "Artikel",
  deepdive: "Deep dive",
  begrip: "Begrip",
};

export const INSIGHT_TYPE_DOT: Record<InsightType, string> = {
  artikel: "#A8A29E",
  deepdive: "#284E3E",
  begrip: "#5A8F6A",
};

function MetaDot() {
  return (
    <span
      className="h-[3px] w-[3px] rounded-full bg-stone-300"
      aria-hidden
    />
  );
}

export default function ContentCard({ item }: { item: InsightItem }) {
  const pijlerLabel = PILLAR[item.pijler].label;
  const typeLabel = INSIGHT_TYPE_LABELS[item.type];

  return (
    <article className="flex min-h-[218px] flex-col rounded-[18px] border border-[#E7E5E4] bg-white p-[22px] transition duration-300 hover:-translate-y-[3px] hover:border-stone-300 hover:shadow-[0_14px_30px_-14px_rgba(28,25,23,0.18)]">
      <Link href={item.href} className="group flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex items-center gap-2">
          <span
            className="h-[7px] w-[7px] shrink-0 rounded-full"
            style={{ backgroundColor: INSIGHT_TYPE_DOT[item.type] }}
            aria-hidden
          />
          <span className="text-[11.5px] font-semibold uppercase tracking-[0.05em] text-stone-600">
            {typeLabel}
          </span>
          <span className="ml-auto text-xs text-stone-400">{pijlerLabel}</span>
        </div>

        <h3 className="font-display text-[21px] font-normal leading-[1.25] text-stone-900 transition group-hover:text-stone-700">
          {item.title}
        </h3>

        <p className="line-clamp-2 text-sm leading-relaxed text-stone-600">
          {item.excerpt}
        </p>

        <div className="mt-auto flex items-center gap-3 pt-1.5 text-[12.5px] text-stone-500">
          {item.readingTime ? (
            <>
              <span>{item.readingTime}</span>
              <MetaDot />
            </>
          ) : null}
          <span>{item.niveau}</span>
        </div>
      </Link>
    </article>
  );
}
