import { IntakeCtaLink } from "@/components/common/IntakeCtaLink";
import { CHECK_CTA } from "@/lib/check-facts";
import type { ReactNode } from "react";
import Container from "@/components/layout/Container";
import type { SupplementCategory } from "@/types/supplement";


const CHOOSER_LABEL: Record<SupplementCategory, string> = {
  magnesium: "magnesium",
  "omega-3": "omega-3 supplement",
  ashwagandha: "ashwagandha",
  zink: "zink",
  creatine: "creatine",
  "vitamine-d": "vitamine D",
  melatonine: "melatonine",
  eiwitpoeder: "eiwitpoeder",
};

export function ComparisonChooserIntro({
  category,
  children,
}: {
  category: SupplementCategory;
  children: ReactNode;
}) {
  const label = CHOOSER_LABEL[category];

  return (
    <section
      aria-labelledby="vergelijking-kiezen-heading"
      className="mx-auto mt-8 w-full max-w-7xl px-6 lg:px-8"
    >
      <h2
        id="vergelijking-kiezen-heading"
        className="font-display mb-4 text-xl font-semibold tracking-tight text-stone-900"
      >
        Klaar om de beste {label} voor jou te kiezen?
      </h2>
      <p className="mb-6 text-stone-600">
        Hier zijn de best beoordeelde opties — onafhankelijk vergeleken op dezelfde criteria als in
        onze methodologie:
      </p>
      {children}
    </section>
  );
}

export function ComparisonIntakeFallbackCta({
  category,
}: {
  category: SupplementCategory;
}) {
  return (
    <Container>
      <section
        aria-label="Wat mis je?"
        className="my-16 rounded-lg border border-stone-200 bg-stone-50 p-8"
      >
        <h2 className="font-display mb-2 text-lg text-stone-900">
          Niet zeker waar jij zou moeten beginnen?
        </h2>
        <p className="mb-6 text-stone-600">
          {CHECK_CTA.subline} Zo weet je of je dit eerst met eten oplost, of dat een supplement
          past.
        </p>
        <IntakeCtaLink
          locatie={`vergelijking_fallback_${category}`}
          className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-ps-green px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-ps-green-hover"
        >
          {CHECK_CTA.discoverButton}
        </IntakeCtaLink>
      </section>
    </Container>
  );
}
