import Link from "next/link";
import { methodologyBodySmClass } from "@/components/methodology/methodology-typography";
import {
  METHODOLOGY_AFFILIATE_FOOTNOTE,
  METHODOLOGY_CRITERIA,
  METHODOLOGY_SUPPLEMENTEN,
} from "@/data/methodology";

const linkClass =
  "font-medium text-ps-green underline decoration-ps-green/35 underline-offset-[3px] transition hover:decoration-ps-green";

const WEIGHT_COLORS = ["#5A8F6A", "#4A7F5A", "#6B9B78", "#8FB59A"] as const;

export default function MethodologyScoring() {
  return (
    <div className="mt-10 space-y-8">
      <div>
        <p className="mb-3 font-display text-xs font-medium uppercase tracking-[0.12em] text-stone-500">
          Gewogen beoordeling
        </p>
        <div className="flex h-3 overflow-hidden rounded-full bg-stone-100">
          {METHODOLOGY_CRITERIA.map((item, index) => (
            <div
              key={item.title}
              className="h-full"
              style={{
                width: `${item.weight}%`,
                backgroundColor: WEIGHT_COLORS[index % WEIGHT_COLORS.length],
              }}
              title={`${item.title} ${item.pct}`}
            />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          {METHODOLOGY_CRITERIA.map((item, index) => (
            <span key={item.title} className="text-xs text-stone-600">
              <span
                className="mr-1.5 inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: WEIGHT_COLORS[index % WEIGHT_COLORS.length] }}
                aria-hidden="true"
              />
              {item.title} {item.pct}
            </span>
          ))}
        </div>
      </div>

      <ul className="divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white">
        {METHODOLOGY_CRITERIA.map((item) => (
          <li key={item.title} className="px-5 py-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-base font-semibold text-stone-900">
                {item.title}
              </h3>
              <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600">
                {item.pct}
              </span>
            </div>
            <p className={`mt-2 ${methodologyBodySmClass}`}>
              {item.inlineLink ? (
                <>
                  {item.inlineLink.before}
                  <Link href={item.inlineLink.href} className={linkClass}>
                    {item.inlineLink.linkLabel}
                  </Link>
                  {item.inlineLink.after}
                </>
              ) : (
                item.description
              )}
            </p>
          </li>
        ))}
      </ul>

      <p className="text-sm leading-relaxed text-stone-500">
        Zie een{" "}
        <Link href={METHODOLOGY_SUPPLEMENTEN.exampleLink.href} className={linkClass}>
          {METHODOLOGY_SUPPLEMENTEN.exampleLink.label}
        </Link>{" "}
        als voorbeeld. {METHODOLOGY_AFFILIATE_FOOTNOTE.body}{" "}
        <Link href={METHODOLOGY_AFFILIATE_FOOTNOTE.disclosureLink.href} className={linkClass}>
          {METHODOLOGY_AFFILIATE_FOOTNOTE.disclosureLink.label}
        </Link>
        .
      </p>
    </div>
  );
}
