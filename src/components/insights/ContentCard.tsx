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

export default function ContentCard({ item }: { item: InsightItem }) {
  const pijlerLabel = PILLAR[item.pijler].label;
  const typeLabel = INSIGHT_TYPE_LABELS[item.type];
  const c = PILLAR[item.pijler].color;

  return (
    <article
      className="flex min-h-0 flex-col rounded-2xl border border-stone-200/60 border-l-2 bg-[var(--ps-surface)] p-7 shadow-sm shadow-stone-900/[0.04] transition duration-300 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md"
      style={{ borderLeftColor: c }}
    >
      <Link href={item.href} className="group flex min-h-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
          <span
            className="rounded-full px-2.5 py-0.5 font-medium"
            style={{ color: c, backgroundColor: `${c}1A` }}
          >
            {pijlerLabel}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-2.5 py-0.5 font-medium text-stone-600">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: INSIGHT_TYPE_DOT[item.type] }}
            />
            {typeLabel}
          </span>
          {item.readingTime ? (
            <span>{item.readingTime} leestijd</span>
          ) : null}
          <span>{item.niveau}</span>
        </div>

        <h3 className="mt-5 text-lg font-semibold leading-snug tracking-tight text-stone-900 transition group-hover:text-stone-700 md:text-xl">
          {item.title}
        </h3>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-stone-500">
          {item.excerpt}
        </p>

        <p className="mt-auto pt-6 text-sm text-stone-500 transition group-hover:text-stone-700">
          Lees →
        </p>
      </Link>
    </article>
  );
}
