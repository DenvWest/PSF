import Link from "next/link";
import type { SupplementCategory } from "@/types/supplement";

type Props = {
  criteria: string[];
  category: SupplementCategory;
};

const CATEGORY_LABEL: Record<SupplementCategory, string> = {
  "omega-3": "omega-3 supplement",
  magnesium: "magnesiumvorm",
};

const OMEGA3_EXPLANATIONS: Record<string, string> = {
  "EPA/DHA per portie":
    "EPA (eicosapentaeenzuur) ondersteunt hart en ontstekingsbalans; DHA (docosahexaeenzuur) is essentieel voor hersenfunctie en het netvlies. Kijk altijd naar de werkzame hoeveelheid per portie — niet naar het totale visoliegewicht. Een goede omega-3 bevat minimaal 250 mg EPA+DHA per dag.",
  Transparantie:
    "Een transparant merk publiceert de exacte EPA- en DHA-waarden, de herkomst van de grondstof en idealiter onafhankelijke testresultaten (IFOS of vergelijkbaar). Zonder die informatie op het etiket is het onmogelijk om producten eerlijk te vergelijken.",
  Gebruiksgemak:
    "Consistent gebruik is belangrijker dan de perfecte dosis. Een product dat je niet volhoudt werkt niet. Kies een vorm — vloeibaar, gummies of capsules — die past bij jouw dagelijkse routine.",
  "Prijs/kwaliteit":
    "Een hogere prijs garandeert geen betere kwaliteit. Vergelijk altijd de kosten per gram EPA+DHA, niet de prijs van de verpakking. Vloeibare vormen zijn doorgaans goedkoper per gram dan gummies.",
};

const MAGNESIUM_EXPLANATIONS: Record<string, string> = {
  Opneembaarheid:
    "Niet alle magnesiumvormen worden even goed opgenomen. Bisglycinaat en tauraat scoren het hoogst; oxide het laagst. Check altijd het elementaire magnesiumgehalte per portie.",
  Slaapondersteuning:
    "Bisglycinaat is de favoriete keuze voor slaap vanwege de combinatie met glycine, een aminozuur dat ontspanning bevordert. Tauraat biedt vergelijkbare ondersteuning via een ander mechanisme.",
  Maagvriendelijkheid:
    "Magnesiumoxide en citraat kunnen bij hogere doseringen laxerend werken. Bisglycinaat en tauraat zijn doorgaans maagvriendelijker.",
  "Prijs/kwaliteit":
    "Citraat is de betaalbare optie met goede opneembaarheid. Bisglycinaat is duurder maar levert meer waarde voor slaap en ontspanning.",
};

function getExplanation(
  criterium: string,
  category: SupplementCategory,
): string {
  if (category === "omega-3") {
    return (
      OMEGA3_EXPLANATIONS[criterium] ??
      "Zie onze methodologie voor de volledige uitleg van dit criterium."
    );
  }
  return (
    MAGNESIUM_EXPLANATIONS[criterium] ??
    "Zie onze methodologie voor de volledige uitleg van dit criterium."
  );
}

export function BuyingGuide({ criteria, category }: Props) {
  const categoryLabel = CATEGORY_LABEL[category];

  return (
    <section className="mx-auto max-w-4xl px-4">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
        Hoe kies je de juiste {categoryLabel}?
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Geen marketing — dit zijn de criteria die er echt toe doen.
      </p>

      <div className="mt-6 space-y-6">
        {criteria.map((criterium) => (
          <div key={criterium}>
            <h3 className="text-base font-semibold text-slate-900">
              {criterium}
            </h3>
            <p className="mt-1.5 text-sm leading-7 text-slate-600">
              {getExplanation(criterium, category)}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-6 text-sm text-slate-500">
        Benieuwd hoe we beoordelen?{" "}
        <Link
          href="/methodologie"
          className="font-medium text-slate-700 underline-offset-2 hover:underline"
        >
          Lees onze methodologie
        </Link>
        .
      </p>
    </section>
  );
}
