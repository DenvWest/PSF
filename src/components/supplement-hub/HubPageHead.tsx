import Link from "next/link";
import Container from "@/components/layout/Container";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { VoortgangReturnBanner } from "@/components/dashboard/VoortgangReturnBanner";
import { PS_SCORE_MODEL_VERSION } from "@/data/supplement-hub/score-model";

type HubPageHeadProps = {
  productCount: number;
  categoryCount: number;
};

const BEWIJS = [
  "Berekend, niet ingetypt",
  "Prijs telt niet mee in de score",
  "Geen betaalde plaatsing",
];

/**
 * De kop boven de catalogus. Bewust geen hero: de producten moeten direct
 * onder de vouw beginnen. Wat de hero droeg — de belofte en de CTA — staat nu
 * in de zijbalk (permanent zichtbaar) en in het afsluitblok onderaan.
 */
export default function HubPageHead({
  productCount,
  categoryCount,
}: HubPageHeadProps) {
  return (
    <section
      className="border-b border-stone-200/70 bg-[#FAF8F4]"
      aria-label="Supplementen"
    >
      <Container className="pt-5 pb-6 md:pt-6 md:pb-7">
        <VoortgangReturnBanner surface="supplementen" />
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Supplementen" }]}
        />

        <div className="mt-4 gap-6 lg:flex lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="font-display text-2xl font-bold leading-tight tracking-tight text-stone-900 md:text-4xl">
              Welk supplement past bij jou?
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-stone-600 md:text-base">
              {productCount} producten uit {categoryCount} categorieën langs
              dezelfde meetlat: dosering, vorm, etiket en EU-claimvoorwaarde,
              samen een PS-Score van 0 tot 100. De prijs per claim-conforme dag
              staat er los naast.
            </p>
          </div>

          <ul
            className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-stone-500 lg:mt-0 lg:max-w-[16rem] lg:flex-col lg:items-end lg:gap-y-1 lg:text-right"
            role="list"
          >
            {BEWIJS.map((punt) => (
              <li key={punt} className="flex items-center gap-1.5">
                <span aria-hidden className="text-[#5A8F6A]">
                  ✓
                </span>
                {punt}
              </li>
            ))}
            <li>
              <Link
                href="/ps-score"
                className="font-medium text-ps-green transition-colors hover:text-ps-green-hover"
              >
                Model {PS_SCORE_MODEL_VERSION} — lees de methode →
              </Link>
            </li>
          </ul>
        </div>
      </Container>
    </section>
  );
}
