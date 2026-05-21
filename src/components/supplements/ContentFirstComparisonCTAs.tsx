import Link from "next/link";
import type { ReactNode } from "react";
import Container from "@/components/layout/Container";
import { IntakeCtaMicro } from "@/components/common/IntakeCtaMicro";
import { INTAKE_PROMO } from "@/data/homepage";
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

export function ComparisonIntakeFallbackCta() {
  return (
    <Container>
      <section
        aria-label="Leefstijlcheck"
        className="my-16 rounded-lg border border-stone-200 bg-stone-50 p-8"
      >
        <h2 className="font-display mb-2 text-lg text-stone-900">
          Niet zeker welk supplement bij jóu past?
        </h2>
        <p className="mb-2 text-stone-600">
          Je situatie is uniek. Ontdek welke supplementen bij jouw profiel horen — de Leefstijlcheck
          geeft je dat inzicht in {INTAKE_PROMO.durationLabel}.
        </p>
        <IntakeCtaMicro className="mb-4 text-sm text-stone-500" />
        <Link
          href="/intake"
          className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-ps-green px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-ps-green-hover"
        >
          Ontdek jouw herstelprofiel — gratis
          <span aria-hidden="true">→</span>
        </Link>
      </section>
    </Container>
  );
}
