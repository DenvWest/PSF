import type { ReactNode } from "react";

import type { BlogCalloutVariant } from "@/types/blog";

interface InsightBlockProps {
  variant: BlogCalloutVariant;
  children: ReactNode;
}

const VARIANT_CONFIG: Record<
  BlogCalloutVariant,
  { label: string; wrapperClass: string; labelClass: string; barClass?: string }
> = {
  kerninzicht: {
    label: "Kerninzicht",
    wrapperClass:
      "border border-emerald-200/70 bg-emerald-50/60 pl-5 border-l-[3px] border-l-ps-green",
    labelClass: "text-ps-green",
  },
  letop: {
    label: "Let op",
    wrapperClass: "border border-amber-200/70 bg-amber-50/70",
    labelClass: "text-amber-700",
  },
  tip: {
    label: "Praktische tip",
    wrapperClass: "border border-stone-200/70 bg-stone-50/80 border-l-[2px] border-l-ps-green",
    labelClass: "text-ps-green",
  },
};

export default function InsightBlock({ variant, children }: InsightBlockProps) {
  const { label, wrapperClass, labelClass } = VARIANT_CONFIG[variant];

  return (
    <div
      role="note"
      className={`max-w-[70ch] rounded-xl px-5 py-4 ${wrapperClass}`}
    >
      <p
        className={`mb-1.5 text-[0.6875rem] font-semibold uppercase tracking-widest ${labelClass}`}
      >
        {variant === "letop" && (
          <span className="mr-1" aria-hidden>
            !
          </span>
        )}
        {label}
      </p>
      <div className="text-[1rem] leading-[1.75] text-stone-700">{children}</div>
    </div>
  );
}
