import Link from "next/link";
import ContentCard from "@/components/insights/ContentCard";
import { PILLAR } from "@/data/dashboard";
import { buildInsightFilterHref, filterInsights } from "@/data/insights";
import type { PillarId } from "@/types/dashboard";

interface DomainInsightsTeaserProps {
  pillarId: PillarId;
}

export default function DomainInsightsTeaser({
  pillarId,
}: DomainInsightsTeaserProps) {
  const items = filterInsights({ pijler: pillarId }).slice(0, 3);
  if (items.length === 0) return null;

  const label = PILLAR[pillarId].label;

  return (
    <section
      aria-label={`Verder lezen over ${label}`}
      className="mt-12 border-t border-stone-200/80 pt-12"
    >
      <h2 className="font-serif text-2xl font-bold tracking-tight text-stone-900 md:text-3xl">
        Verder lezen over {label}
      </h2>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ContentCard key={`${item.source}-${item.slug}`} item={item} />
        ))}
      </div>

      <Link
        href={buildInsightFilterHref({ pijler: pillarId })}
        className="mt-8 inline-flex min-h-[44px] items-center text-sm font-medium text-stone-800 underline decoration-stone-300 decoration-1 underline-offset-[3px] transition hover:text-stone-950 hover:decoration-stone-500"
      >
        Alles over {label} →
      </Link>
    </section>
  );
}
