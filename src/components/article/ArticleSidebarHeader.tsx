import type { ReactNode } from "react";
import ArticleBackLink, {
  type ArticleSidebarBackLink,
} from "@/components/article/ArticleBackLink";

export type { ArticleSidebarBackLink };

interface ArticleSidebarHeaderProps {
  back: ArticleSidebarBackLink;
  sectionLabel: string;
  sectionIcon?: ReactNode;
}

/**
 * Kop van de leeszijbalk: de terugweg naar de bibliotheek plus het onderwerp
 * waar dit artikel onder valt.
 */
export default function ArticleSidebarHeader({
  back,
  sectionLabel,
  sectionIcon,
}: ArticleSidebarHeaderProps) {
  return (
    <div className="mb-5 border-b border-stone-200/70 pb-4">
      <ArticleBackLink back={back} />

      <p className="mt-3 flex items-center gap-2 text-[0.8125rem] font-semibold text-stone-900">
        {sectionIcon ? (
          <span className="shrink-0 text-stone-400" aria-hidden>
            {sectionIcon}
          </span>
        ) : null}
        <span className="min-w-0">{sectionLabel}</span>
      </p>
    </div>
  );
}
