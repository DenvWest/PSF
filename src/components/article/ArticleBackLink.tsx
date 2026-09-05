import Link from "next/link";

export interface ArticleSidebarBackLink {
  label: string;
  href: string;
}

interface ArticleBackLinkProps {
  back: ArticleSidebarBackLink;
  className?: string;
}

function BackArrowIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className="h-3.5 w-3.5"
    >
      <path
        d="M9.75 3.25 5.5 8l4.25 4.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Terugweg naar blog of kennisbank. Volle kolombreedte, label mag wrappen.
 */
export default function ArticleBackLink({
  back,
  className = "",
}: ArticleBackLinkProps) {
  return (
    <Link
      href={back.href}
      className={`group flex w-full items-start gap-2.5 rounded-xl border border-stone-200/90 bg-white px-3 py-2.5 text-left shadow-[0_1px_0_rgba(28,25,23,0.04)] outline-none transition-[border-color,color,background-color] duration-200 hover:border-ps-green/40 hover:text-ps-green focus-visible:ring-2 focus-visible:ring-stone-300/70 ${className}`}
    >
      <span
        aria-hidden
        className="mt-px flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-stone-200/90 bg-stone-50 text-stone-500 transition-transform duration-200 ease-out motion-safe:group-hover:-translate-x-0.5 group-hover:border-ps-green/35 group-hover:text-ps-green"
      >
        <BackArrowIcon />
      </span>
      <span className="min-w-0 pt-1 text-[0.8125rem] font-medium leading-snug text-stone-700 transition-colors group-hover:text-ps-green">
        {back.label}
      </span>
    </Link>
  );
}
