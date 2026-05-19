import Link from "next/link";
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
          Je situatie is uniek. De Leefstijlcheck bepaalt jouw profiel in 3 minuten — en zegt
          precies welke supplementen voor jou relevant zijn.
        </p>
        <p className="mb-4 text-sm text-stone-500">
          Geen medische test — wel inzicht in 6 leefstijldomeinen.
        </p>
        <Link
          href="/intake"
          className="inline-flex font-medium text-ps-green underline decoration-ps-green/35 underline-offset-[3px] transition hover:text-ps-green-hover"
        >
          Ontdek jouw herstelprofiel — gratis →
        </Link>
      </section>
    </Container>
  );
}
