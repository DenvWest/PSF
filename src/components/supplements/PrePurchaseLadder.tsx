import { PrePurchaseLadderCta } from "@/components/supplements/PrePurchaseLadderCta";
import type { PrePurchaseLadder as LadderData } from "@/data/supplements/pre-purchase-ladder";
import type { SupplementCategory } from "@/types/supplement";

type PrePurchaseLadderProps = {
  ladder: LadderData;
  category: SupplementCategory;
};

export function PrePurchaseLadder({ ladder, category }: PrePurchaseLadderProps) {
  return (
    <section
      aria-labelledby="voor-je-koopt-heading"
      className="mx-auto mt-12 w-full max-w-7xl px-6 lg:px-8"
    >
      <div className="rounded-2xl border border-stone-200 bg-[#FDFCFA] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-ps-green">
          Leefstijl eerst
        </p>
        <h2
          id="voor-je-koopt-heading"
          className="font-display mt-2 text-2xl tracking-tight text-stone-900 sm:text-3xl"
        >
          {ladder.heading}
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stone-600 sm:text-base">
          {ladder.intro}
        </p>

        <ol className="mt-8 space-y-5">
          {ladder.steps.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span
                aria-hidden
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold tabular-nums text-stone-500 ring-1 ring-stone-200"
              >
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-stone-900">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-stone-600">{step.why}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 border-t border-stone-200 pt-6">
          <p className="max-w-2xl text-sm leading-relaxed text-stone-700">
            <span className="font-semibold text-stone-900">Staan ze alle drie? </span>
            {ladder.openLine}
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-700">
            <span className="font-semibold text-stone-900">Nog niet? </span>
            {ladder.closedLine}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <PrePurchaseLadderCta
              href="#producten"
              label="Bekijk de vergelijking"
              gate="open"
              category={category}
              variant="primary"
            />
            <PrePurchaseLadderCta
              href="/intake"
              label={`Check eerst je ${ladder.domainLabel}`}
              gate="closed"
              category={category}
              variant="secondary"
            />
          </div>

          <p className="mt-6 max-w-2xl text-xs leading-relaxed text-stone-500">
            {ladder.claimNote}
          </p>
        </div>
      </div>
    </section>
  );
}
