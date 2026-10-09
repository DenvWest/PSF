import { IntakeCtaLink } from "@/components/common/IntakeCtaLink";
import { CHECK_CTA } from "@/lib/check-facts";
import type { VoedingBrug } from "@/data/kennisbank-voedingsbrug";

interface KennisbankVoedingBrugProps {
  termSlug: string;
  brug: VoedingBrug;
}

const TITEL: Record<VoedingBrug["groep"], string> = {
  A: "Wat eet jij hiervan?",
  B: "Zit het al in je eten?",
};

export default function KennisbankVoedingBrug({
  termSlug,
  brug,
}: KennisbankVoedingBrugProps) {
  return (
    <aside
      aria-label={TITEL[brug.groep]}
      className="my-10 max-w-[72ch] rounded-xl border border-ps-green/30 bg-ps-green-light/40 px-6 py-7 md:my-12 md:px-8"
    >
      <p className="font-display text-lg font-semibold leading-snug text-stone-900 md:text-xl">
        {TITEL[brug.groep]}
      </p>
      <p className="mt-3 text-[1.0625rem] leading-[1.7] text-stone-700">{brug.hook}</p>
      {brug.bronnen && brug.bronnen.length > 0 ? (
        <p className="mt-2 text-[0.875rem] leading-relaxed text-stone-500">
          Denk aan: {brug.bronnen.join(", ")}.
        </p>
      ) : null}
      <IntakeCtaLink
        locatie={`kennisbank_brug_${termSlug}`}
        className="group mt-6 inline-flex min-h-12 items-center justify-center gap-1.5 rounded-xl bg-ps-green px-7 text-[0.875rem] font-semibold text-white shadow-[0_2px_8px_rgba(90,143,106,0.28)] transition-[background-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-px hover:bg-ps-green-hover hover:shadow-[0_6px_18px_rgba(90,143,106,0.36)] active:translate-y-0"
      >
        {CHECK_CTA.discoverButtonShort}
        <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
          →
        </span>
      </IntakeCtaLink>
    </aside>
  );
}
