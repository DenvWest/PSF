import Link from "next/link";

export interface ArticleSidebarBackLink {
  label: string;
  href: string;
}

interface ArticleBackLinkProps {
  back: ArticleSidebarBackLink;
  className?: string;
  variant?: "full" | "icon";
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
 * Terugweg naar blog of kennisbank. `full` is de zijbalk-chip; `icon` is de
 * compacte knop in de sticky leesbalk op telefoon en iPad.
 */
export default function ArticleBackLink({
  back,
  className = "",
  variant = "full",
}: ArticleBackLinkProps) {
  if (variant === "icon") {
    return (
      <Link
        href={back.href}
        aria-label={back.label}
        className={`group inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-stone-200/90 bg-white text-stone-600 shadow-[0_1px_2px_rgba(28,25,23,0.04)] outline-none transition-[border-color,color,background-color,box-shadow,transform] duration-200 ease-out hover:border-ps-green/45 hover:bg-ps-green-light/50 hover:text-ps-green hover:shadow-[0_4px_14px_rgba(90,143,106,0.16)] focus-visible:ring-2 focus-visible:ring-ps-green/40 active:scale-[0.98] ${className}`}
      >
        <span
          aria-hidden
          className="inline-flex motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:-translate-x-0.5"
        >
          <BackArrowIcon />
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={back.href}
      className={`group flex w-full items-center gap-2.5 rounded-xl border border-stone-200/80 bg-gradient-to-b from-white to-stone-50/60 px-3 py-2.5 text-left shadow-[0_1px_2px_rgba(28,25,23,0.03)] outline-none transition-[border-color,color,background-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-px hover:border-ps-green/45 hover:bg-ps-green-light/40 hover:text-ps-green hover:shadow-[0_4px_14px_rgba(90,143,106,0.16)] focus-visible:ring-2 focus-visible:ring-ps-green/40 active:translate-y-0 ${className}`}
    >
      <span
        aria-hidden
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-stone-200/90 bg-white text-stone-500 shadow-[0_1px_1px_rgba(28,25,23,0.04)] transition-[transform,border-color,color,background-color] duration-200 ease-out motion-safe:group-hover:-translate-x-0.5 group-hover:border-ps-green/45 group-hover:bg-white group-hover:text-ps-green"
      >
        <BackArrowIcon />
      </span>
      <span className="min-w-0 text-[0.8125rem] font-semibold leading-snug text-stone-700 transition-colors group-hover:text-ps-green">
        {back.label}
      </span>
    </Link>
  );
}
