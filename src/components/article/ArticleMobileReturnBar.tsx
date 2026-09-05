import Link from "next/link";
import type { ReactNode } from "react";
import type { ArticleSidebarBackLink } from "@/components/article/ArticleSidebarHeader";

interface ArticleMobileReturnBarProps {
  back: ArticleSidebarBackLink;
  sectionLabel: string;
  sectionHref?: string;
  sectionIcon?: ReactNode;
}

/**
 * Terugweg op mobiel en iPad, waar de zijbalk niet bestaat. Staat boven de
 * inhoudsopgave zodat de lezer tijdens het lezen altijd één tik van de
 * bibliotheek en van het onderwerp af zit.
 */
export default function ArticleMobileReturnBar({
  back,
  sectionLabel,
  sectionHref,
  sectionIcon,
}: ArticleMobileReturnBarProps) {
  return (
    <nav
      aria-label="Terug naar de bibliotheek"
      className="mb-4 flex items-center gap-2 lg:hidden"
    >
      <Link
        href={back.href}
        className="group inline-flex min-h-10 flex-1 items-center gap-1.5 rounded-lg border border-stone-200/80 bg-white/90 px-3 text-[0.8125rem] font-medium text-stone-600 outline-none transition-colors hover:border-stone-300 hover:text-ps-green focus-visible:ring-2 focus-visible:ring-stone-300/60"
      >
        <span
          aria-hidden
          className="inline-flex text-stone-400 transition-transform duration-200 ease-out motion-safe:group-hover:-translate-x-0.5"
        >
          ←
        </span>
        <span className="min-w-0 truncate">{back.label}</span>
      </Link>

      {sectionHref ? (
        <Link
          href={sectionHref}
          className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg border border-stone-200/80 bg-white/90 px-3 text-[0.8125rem] font-medium text-stone-600 outline-none transition-colors hover:border-stone-300 hover:text-ps-green focus-visible:ring-2 focus-visible:ring-stone-300/60"
        >
          {sectionIcon ? (
            <span className="shrink-0 text-stone-400" aria-hidden>
              {sectionIcon}
            </span>
          ) : null}
          <span className="min-w-0 truncate">{sectionLabel}</span>
        </Link>
      ) : null}
    </nav>
  );
}
