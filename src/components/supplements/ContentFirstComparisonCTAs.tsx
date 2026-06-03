import Link from "next/link";
import type { ReactNode } from "react";
import Container from "@/components/layout/Container";
import type { SupplementCategory } from "@/types/supplement";

const LEEFSTIJLCHECK_CTA_BUTTON = "Doe de Leefstijlcheck — gratis →";

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
          Niet zeker waar jij zou moeten beginnen?
        </h2>
        <p className="mb-6 text-stone-600">
          De Leefstijlcheck geeft je in 3 min inzicht op 6 leefstijl-domeinen — zodat je weet waar
          je aandacht het meeste oplevert.
        </p>
        <Link
          href="/intake"
          className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-ps-green px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-ps-green-hover"
        >
          {LEEFSTIJLCHECK_CTA_BUTTON}
        </Link>
      </section>
    </Container>
  );
}
