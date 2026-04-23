import Link from "next/link";
import type { CatalogEntry } from "@/data/supplementen-hub/catalog";

const ICON_BG_MAP: Record<string, string> = {
  magnesium: "bg-emerald-100",
  ashwagandha: "bg-amber-100",
  "omega-3": "bg-sky-100",
  "vitamine-d": "bg-yellow-100",
  creatine: "bg-violet-100",
  zink: "bg-slate-100",
};

type SupplementCatalogCardProps = {
  entry: CatalogEntry;
};

export default function SupplementCatalogCard({
  entry,
}: SupplementCatalogCardProps) {
  const iconBg = ICON_BG_MAP[entry.slug] ?? "bg-stone-50";

  return (
    <div data-themas={entry.themas.join(" ")} aria-disabled={entry.comingSoon ? "true" : undefined}>
      <div
        className={`bg-white rounded-xl border border-stone-200 p-5 flex gap-4 h-full transition-all duration-200 ${
          entry.comingSoon
            ? "opacity-40 cursor-not-allowed"
            : "hover:border-[#5A8F6A]/40 hover:shadow-md hover:-translate-y-0.5"
        }`}
      >
        {/* Icon */}
        <div className="flex-shrink-0">
          <span
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${iconBg}`}
            aria-hidden="true"
          >
            {entry.icon}
          </span>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start gap-2">
            <span className="font-semibold text-stone-900 text-sm leading-snug">
              {entry.name}
            </span>
            {entry.comingSoon && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-400 border border-stone-200 leading-none flex-shrink-0">
                Binnenkort
              </span>
            )}
            {!entry.comingSoon && entry.topScore !== null && (
              <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-1 leading-none flex-shrink-0">
                Score: {entry.topScore.toFixed(1)}
              </span>
            )}
          </div>

          <p className="text-sm text-stone-500 mt-1 leading-relaxed">
            {entry.wiifm}
          </p>

          {!entry.comingSoon && (
            <div className="mt-3 flex flex-wrap gap-3">
              <Link
                href={entry.guideHref}
                className="text-sm font-semibold text-[#5A8F6A] hover:text-[#4A7F5A] transition-colors"
              >
                Lees de gids →
              </Link>
              {entry.comparisonHref && entry.comparisonHref !== entry.guideHref && (
                <Link
                  href={entry.comparisonHref}
                  className="text-sm font-semibold text-[#5A8F6A] hover:text-[#4A7F5A] transition-colors"
                >
                  Vergelijk →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
