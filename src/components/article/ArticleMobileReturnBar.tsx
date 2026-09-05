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
          className="group inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl border border-stone-200/80 bg-gradient-to-b from-white to-stone-50/60 px-3.5 text-[0.8125rem] font-semibold text-stone-600 shadow-[0_1px_2px_rgba(28,25,23,0.03)] outline-none transition-[border-color,color,background-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-px hover:border-ps-green/45 hover:bg-ps-green-light/40 hover:text-ps-green hover:shadow-[0_4px_14px_rgba(90,143,106,0.16)] focus-visible:ring-2 focus-visible:ring-ps-green/40 active:translate-y-0"
        >
          {sectionIcon ? (
            <span className="shrink-0 text-stone-400 transition-colors duration-200 group-hover:text-ps-green" aria-hidden>
              {sectionIcon}
            </span>
          ) : null}
          <span className="min-w-0">{sectionLabel}</span>
        </Link>
      ) : null}
    </nav>
  );
}
