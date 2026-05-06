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

function hasSleepPillar(category: SupplementCategory): boolean {
  return category === "magnesium";
}

export function ComparisonEducationalLead({
  category,
}: {
  category: SupplementCategory;
}) {
  if (hasSleepPillar(category)) {
    return (
      <section
        aria-label="Eerst begrijpen"
        className="mx-auto mt-12 w-full max-w-7xl px-6 lg:px-8"
      >
        <div className="rounded-lg bg-stone-50 p-8">
          <h2 className="font-display mb-2 text-2xl text-stone-900">
            Wil je eerst begrijpen waarom magnesium helpt?
          </h2>
          <p className="mb-4 text-stone-600">
            Veel mensen kopen zomaar een supplement. Maar als je eerst begrijpt wat er aan de hand
            is, kies je slimmer.
          </p>
          <Link
            href="/slaap-verbeteren-na-40"
            className="inline-block font-medium text-[#5A8F6A] underline decoration-[#5A8F6A]/35 underline-offset-[3px]"
          >
            Lees: Slaap verbeteren na 40 — complete gids →
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Eerst zicht op jouw situatie"
      className="mx-auto mt-12 w-full max-w-7xl px-6 lg:px-8"
    >
      <div className="rounded-lg bg-stone-50 p-8">
        <h2 className="font-display mb-2 text-2xl text-stone-900">
          Wil je eerst begrijpen wat bij jou past?
        </h2>
        <p className="mb-4 text-stone-600">
          Veel mensen kopen zomaar een supplement. De Leefstijlcheck geeft in ongeveer 3 minuten
          zicht op jouw profiel — zodat je daarna gerichter kunt kiezen.
        </p>
        <Link
          href="/intake"
          className="inline-block font-medium text-[#5A8F6A] underline decoration-[#5A8F6A]/35 underline-offset-[3px]"
        >
          Start de Leefstijlcheck →
        </Link>
      </div>
    </section>
  );
}

export function ComparisonChooserIntro({
  category,
  children,
}: {
  category: SupplementCategory;
  children: ReactNode;
}) {
  const label = CHOOSER_LABEL[category];
  const pillar = hasSleepPillar(category);

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
        {pillar
          ? "Nu je begrijpt hoe magnesium werkt, hier zijn de best beoordeelde opties:"
          : "Hier zijn de best beoordeelde opties — onafhankelijk vergeleken op dezelfde criteria als in onze methodologie:"}
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
        className="my-16 rounded-lg bg-stone-100 p-8"
      >
        <h2 className="font-display mb-2 text-lg text-stone-900">
          Niet zeker welk supplement bij jóu past?
        </h2>
        <p className="mb-4 text-stone-600">
          Je situatie is uniek. De Leefstijlcheck bepaalt jouw profiel in 3 minuten — en zegt
          precies welke supplementen voor jou relevant zijn.
        </p>
        <Link
          href="/intake"
          className="inline-block rounded bg-[#3C7A56] px-4 py-2 font-medium text-white hover:bg-[#4A7F5A]"
        >
          Start de Leefstijlcheck →
        </Link>
      </section>
    </Container>
  );
}
