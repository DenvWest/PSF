import type { CategorieKaart } from "@/lib/nutrition-voedselgroepen";
import { rowKeysVoorGroepen } from "@/lib/nutrition-voedselgroepen";
import type { DomainMeasurement } from "@/types/dashboard";

/**
 * Wat er per categorie verschoof tussen je metingen.
 *
 * **Wat deze tabel wél en niet kan.** De meetmomenten van voeding dragen per
 * vraag het antwoord dat je gaf ("2× per dag"), maar bewust géén positie:
 * `buildNutritionMeasurementValues` zet `level: null` met de reden "dit is wat
 * hij koos, niet waar dat staat". Er is dus geen getal om een verschil mee uit
 * te rekenen, en een pijl omhoog zou hier verzonnen zijn.
 *
 * Wat er wél is, is precies wat je wilt zien: je eigen antwoorden per
 * meetmoment naast elkaar. "3–4× per week → 1× per dag" zegt meer dan een
 * groene pijl, want het noemt de verandering in je eigen woorden. De tabel
 * toont die antwoorden per categorie, met de datum van elk moment erboven.
 *
 * **Waarom de datum boven de kolom staat en niet in een voetnoot.** Een
 * verschuiving zonder tijdvak is niet te wegen: drie weken en zeven maanden
 * zeggen iets heel anders over hetzelfde verschil.
 */

export type VerschuivingCel = {
  /** Het antwoord van dat moment, of null als die vraag toen niet gesteld werd. */
  answerLabel: string | null;
};

export type VerschuivingRij = {
  categorieId: string;
  label: string;
  /** Even lang als `momenten`, nieuwste eerst. */
  cellen: VerschuivingCel[];
  /** Of er tussen het nieuwste en het oudste gevulde moment iets veranderde. */
  veranderd: boolean;
};

export type VerschuivingMoment = {
  dateLabel: string;
  daysAgo: number;
};

export type Verschuiving = {
  momenten: VerschuivingMoment[];
  rijen: VerschuivingRij[];
  /** Hoeveel categorieën een ander antwoord kregen. */
  veranderd: number;
};

/** Hoogstens vier kolommen: daarboven is de tabel op mobiel niet te lezen. */
const MAX_MOMENTEN = 4;

/**
 * De verschuivingstabel uit de meetmomenten van voeding.
 *
 * `moments` komt nieuwste-eerst binnen (zoals `Meetreeks` ze levert) en die
 * richting blijft: waar je nú staat is het antwoord dat telt, en dat hoort waar
 * je begint te lezen.
 *
 * Categorieën waarvan geen enkel moment een antwoord draagt vallen weg. Een rij
 * met alleen streepjes vertelt niets en maakt de tabel alleen langer.
 */
export function bouwVerschuiving({
  kaarten,
  moments,
}: {
  kaarten: readonly CategorieKaart[];
  moments: readonly DomainMeasurement[];
}): Verschuiving {
  const gebruikt = moments.slice(0, MAX_MOMENTEN);
  if (gebruikt.length < 2) {
    // Eén meting is geen verschuiving. Liever een lege tabel dan een kolom die
    // doet alsof er een vergelijking is.
    return { momenten: [], rijen: [], veranderd: 0 };
  }

  const rijen: VerschuivingRij[] = [];

  for (const kaart of kaarten) {
    const keys = rowKeysVoorGroepen([kaart.id]);
    if (!keys) {
      continue;
    }
    const cellen = gebruikt.map<VerschuivingCel>((moment) => {
      // De eerste vraag van deze groep die dit moment mat. Groepen die meerdere
      // vragen bundelen (vlees & vis) tonen hun dragende vraag, niet alle drie:
      // de tabel gaat over de beweging, niet over de volledige check.
      const hit = moment.values.find((value) =>
        keys.has(value.key as Parameters<typeof keys.has>[0]),
      );
      return { answerLabel: hit?.answerLabel ?? null };
    });

    const gevuld = cellen.filter((cel) => cel.answerLabel != null);
    if (gevuld.length === 0) {
      continue;
    }

    const nieuwste = gevuld[0]?.answerLabel ?? null;
    const oudste = gevuld[gevuld.length - 1]?.answerLabel ?? null;
    rijen.push({
      categorieId: kaart.id,
      label: kaart.label,
      cellen,
      veranderd: gevuld.length > 1 && nieuwste !== oudste,
    });
  }

  return {
    momenten: gebruikt.map((moment) => ({
      dateLabel: moment.dateLabel,
      daysAgo: moment.daysAgo,
    })),
    rijen,
    veranderd: rijen.filter((rij) => rij.veranderd).length,
  };
}

/** De regel boven de tabel: waarover gaat deze vergelijking. */
export function verschuivingBronregel(verschuiving: Verschuiving): string | null {
  if (verschuiving.momenten.length < 2) {
    return null;
  }
  const oudste = verschuiving.momenten[verschuiving.momenten.length - 1];
  const spanne = oudste?.daysAgo != null ? ` over ${oudste.daysAgo} dagen` : "";
  if (verschuiving.veranderd === 0) {
    return `Je antwoorden${spanne} zijn gelijk gebleven`;
  }
  return `${verschuiving.veranderd} van ${verschuiving.rijen.length} categorieën veranderden${spanne}`;
}
