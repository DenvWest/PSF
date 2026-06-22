import Link from "next/link";
import { INSIGHT_TYPE_LABELS } from "@/components/insights/ContentCard";
import { PILLAR } from "@/data/dashboard";
import type { InsightItem, InsightType } from "@/types/insight";

const INSIGHT_TYPE_DOT: Record<InsightType, string> = {
  artikel: "#A8A29E",
  deepdive: "#284E3E",
  begrip: "#5A8F6A",
};

export default function FeaturedInsightCard({ item }: { item: InsightItem }) {
  const pijlerLabel = PILLAR[item.pijler].label;
  const typeLabel = INSIGHT_TYPE_LABELS[item.type];
  const c = PILLAR[item.pijler].color;

  return (
    <article
      className="overflow-hidden rounded-2xl border border-stone-200/60 border-l-2 bg-[var(--ps-surface)] shadow-sm shadow-stone-900/[0.04] transition duration-300 hover:border-stone-300 hover:shadow-md"
      style={{ borderLeftColor: c }}
    >
      <Link
        href={item.href}
        className="group grid min-w-0 gap-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]"
      >
        <div
          className="flex min-w-0 flex-col justify-center gap-4 p-6 md:p-8"
          style={{ backgroundColor: `${c}1A` }}
        >
          <span className="self-start rounded-full bg-stone-900 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
            Uitgelicht
          </span>
          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
            <span
              className="rounded-full px-2.5 py-0.5 font-medium"
              style={{ color: c, backgroundColor: `${c}26` }}
            >
              {pijlerLabel}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-0.5 font-medium text-stone-600">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: INSIGHT_TYPE_DOT[item.type] }}
              />
              {typeLabel}
            </span>
            {item.readingTime ? (
              <span>{item.readingTime} leestijd</span>
            ) : null}
          </div>
        </div>

        <div className="flex min-w-0 flex-col p-6 md:p-8">
          <h2 className="font-serif text-2xl font-semibold leading-snug tracking-tight text-stone-900 transition group-hover:text-stone-700 md:text-3xl">
            {item.title}
          </h2>

          <p className="mt-4 line-clamp-3 text-base leading-relaxed text-stone-500">
            {item.excerpt}
          </p>

          <p className="mt-auto pt-6 text-sm text-stone-500 transition group-hover:text-stone-700">
            Lees artikel →
          </p>
        </div>
      </Link>
    </article>
  );
}
