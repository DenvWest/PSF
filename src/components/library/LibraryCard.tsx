import Link from "next/link";
import type { LibraryItem } from "@/lib/library/library-item";
import type { ContentAudience } from "@/lib/content-audience";
import { audienceBand, audienceTagLabel } from "@/lib/content-audience";
import {
  LIB_CARD,
  LIB_CHIP,
  LIB_META,
  LIB_RAIL,
} from "@/components/library/library-tokens";

type LibraryCardProps = {
  item: LibraryItem;
  audience: ContentAudience;
  /** "lijst" = één per rij met de meta rechts; "raster" = twee naast elkaar. */
  weergave: "lijst" | "raster";
  onOpen?: () => void;
};

export default function LibraryCard({
  item,
  audience,
  weergave,
  onOpen,
}: LibraryCardProps) {
  const band = audienceBand(item.audience, audience);
  const isLijst = weergave === "lijst";

  return (
    <article className={`${LIB_CARD} ${band === "andere-fysiologie" ? "opacity-[0.82]" : ""}`}>
      <span className={`${LIB_RAIL} ${item.accentClass}`} aria-hidden />

      <Link
        href={item.href}
        onClick={onOpen}
        className={`flex flex-1 gap-4 pl-5 pr-4 py-4 outline-none focus-visible:ring-2 focus-visible:ring-ps-green focus-visible:ring-offset-2 lg:pl-6 lg:pr-5 ${
          isLijst ? "flex-col sm:flex-row sm:items-start" : "flex-col"
        }`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`${LIB_CHIP} bg-stone-100 text-stone-600`}>
              {item.groupLabel}
            </span>
            {item.badge ? (
              <span className={`${LIB_CHIP} bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200/70`}>
                {item.badge}
              </span>
            ) : null}
            {item.audience ? (
              <span
                className={`${LIB_CHIP} ${
                  band === "voor-jou"
                    ? "bg-ps-green-light text-[#3B6A4B] ring-1 ring-inset ring-ps-green/25"
                    : "bg-stone-50 text-stone-500 ring-1 ring-inset ring-stone-200"
                }`}
              >
                {audienceTagLabel(item.audience)}
              </span>
            ) : null}
          </div>

          <h3 className="mt-2.5 font-display text-[1.0625rem] font-semibold leading-snug tracking-tight text-stone-900 transition-colors [@media(hover:hover)]:group-hover:text-ps-green md:text-[1.125rem]">
            {item.title}
          </h3>

          <p className="mt-1.5 line-clamp-2 text-[0.875rem] leading-relaxed text-stone-500">
            {item.summary}
          </p>
        </div>

        <div
          className={
            isLijst
              ? "flex shrink-0 items-center gap-3 sm:mt-1 sm:w-[9.5rem] sm:flex-col sm:items-end sm:gap-1.5"
              : "mt-3 flex items-center gap-3"
          }
        >
          {item.metaLabel ? (
            <span className={LIB_META}>{item.metaLabel}</span>
          ) : null}
          {typeof item.sourceCount === "number" && item.sourceCount > 0 ? (
            <span className={LIB_META}>
              {item.sourceCount} {item.sourceCount === 1 ? "bron" : "bronnen"}
            </span>
          ) : null}
          <span
            aria-hidden
            className="ml-auto text-sm text-stone-300 transition-transform duration-200 sm:ml-0 [@media(hover:hover)]:group-hover:translate-x-0.5 [@media(hover:hover)]:group-hover:text-ps-green"
          >
            →
          </span>
        </div>
      </Link>
    </article>
  );
}
