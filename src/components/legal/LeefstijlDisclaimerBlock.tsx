import Link from "next/link";
import { LEEFSTIJL_DISCLAIMER } from "@/data/leefstijl-disclaimer";

type LeefstijlDisclaimerBlockProps = {
  className?: string;
  showMedischeLink?: boolean;
  variant?: "default" | "compact";
};

export default function LeefstijlDisclaimerBlock({
  className,
  showMedischeLink = true,
  variant = "default",
}: LeefstijlDisclaimerBlockProps) {
  if (variant === "compact") {
    return (
      <details
        className={`group rounded-xl border border-stone-200/80 bg-white/60 text-sm ${className ?? ""}`}
      >
        <summary className="cursor-pointer list-none px-4 py-3 font-medium text-stone-600 select-none [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between gap-2">
            Leefstijlcoach, geen arts — wat dit wel en niet is
            <span
              className="shrink-0 text-stone-400 motion-safe:transition-transform motion-safe:duration-150 group-open:rotate-180"
              aria-hidden="true"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M4 6 L8 10 L12 6"
                  stroke="currentColor"
                  strokeWidth="1.35"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </span>
        </summary>
        <div
          role="note"
          aria-label="Leefstijlcoach-positionering"
          className="border-t border-stone-100 px-4 py-3 leading-relaxed text-stone-500"
        >
          <p>{LEEFSTIJL_DISCLAIMER}</p>
          {showMedischeLink ? (
            <p className="mt-3">
              <Link
                href="/medische-disclaimer"
                className="font-medium text-stone-500 underline decoration-stone-300 underline-offset-[3px] transition hover:text-stone-700"
              >
                Medische disclaimer →
              </Link>
            </p>
          ) : null}
        </div>
      </details>
    );
  }

  return (
    <aside
      role="note"
      aria-label="Leefstijlcoach-positionering"
      className={`rounded-lg border border-stone-200/90 bg-stone-50/80 px-5 py-4 text-sm leading-relaxed text-stone-600 ${className ?? ""}`}
    >
      <p>{LEEFSTIJL_DISCLAIMER}</p>
      {showMedischeLink ? (
        <p className="mt-3">
          <Link
            href="/medische-disclaimer"
            className="font-medium text-stone-500 underline decoration-stone-300 underline-offset-[3px] transition hover:text-stone-700"
          >
            Medische disclaimer →
          </Link>
        </p>
      ) : null}
    </aside>
  );
}
