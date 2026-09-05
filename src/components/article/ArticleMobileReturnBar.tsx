import Link from "next/link";
import type { ReactNode } from "react";
import ArticleBackLink, {
  type ArticleSidebarBackLink,
} from "@/components/article/ArticleBackLink";

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
      className="mb-6 flex items-stretch gap-2 lg:hidden"
    >
      <ArticleBackLink back={back} className="flex-1" />

      {sectionHref ? (
        <Link
          href={sectionHref}
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl border border-stone-200/90 bg-white px-3 text-[0.8125rem] font-medium text-stone-600 shadow-[0_1px_0_rgba(28,25,23,0.04)] outline-none transition-colors hover:border-ps-green/40 hover:text-ps-green focus-visible:ring-2 focus-visible:ring-stone-300/70"
        >
          {sectionIcon ? (
            <span className="shrink-0 text-stone-400" aria-hidden>
              {sectionIcon}
            </span>
          ) : null}
          <span className="min-w-0">{sectionLabel}</span>
        </Link>
      ) : null}
    </nav>
  );
}
