import Link from "next/link";
import type { ReactNode } from "react";

export interface ArticleSidebarBackLink {
  label: string;
  href: string;
}

interface ArticleSidebarHeaderProps {
  back: ArticleSidebarBackLink;
  sectionLabel: string;
  sectionIcon?: ReactNode;
}

/**
 * Kop van de leeszijbalk: de terugweg naar de bibliotheek plus het onderwerp
 * waar dit artikel onder valt. Zelfde vormtaal als de keuzekolom op de hub
 * (wit vlak, stone-ring, ps-green als enige accent).
 */
export default function ArticleSidebarHeader({
  back,
  sectionLabel,
  sectionIcon,
}: ArticleSidebarHeaderProps) {
  return (
    <div className="mb-5 border-b border-stone-200/70 pb-4">
      <Link
        href={back.href}
        className="group -ml-1 inline-flex min-h-9 items-center gap-1.5 rounded-lg px-1 text-[0.8125rem] font-medium text-stone-500 outline-none transition-colors hover:text-ps-green focus-visible:ring-1 focus-visible:ring-stone-300"
      >
        <span
          aria-hidden
          className="inline-flex text-stone-400 transition-transform duration-200 ease-out motion-safe:group-hover:-translate-x-0.5 group-hover:text-ps-green"
        >
          ←
        </span>
        <span className="min-w-0 truncate">{back.label}</span>
      </Link>

      <p className="mt-3 flex items-center gap-2 text-[0.8125rem] font-semibold text-stone-900">
        {sectionIcon ? (
          <span className="shrink-0 text-stone-400" aria-hidden>
            {sectionIcon}
          </span>
        ) : null}
        <span className="min-w-0 truncate">{sectionLabel}</span>
      </p>
    </div>
  );
}
