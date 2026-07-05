import Link from "next/link";
import { LEEFSTIJL_DISCLAIMER } from "@/data/leefstijl-disclaimer";

type LeefstijlDisclaimerBlockProps = {
  className?: string;
  showMedischeLink?: boolean;
};

export default function LeefstijlDisclaimerBlock({
  className,
  showMedischeLink = true,
}: LeefstijlDisclaimerBlockProps) {
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
