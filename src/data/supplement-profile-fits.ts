import type { SupplementCategory } from "@/types/supplement";

export type SupplementProfileFit = {
  slug: string;
  label: string;
  snippet: string;
};

export const SUPPLEMENT_PROFILE_FITS: Record<
  SupplementCategory,
  SupplementProfileFit[]
> = {
  magnesium: [
    {
      slug: "onrustige-slaper",
      label: "Onrustige Slaper",
      snippet:
        "Slecht slapen na 40? Magnesium draagt bij tot normale psychologische functie en vermindering van vermoeidheid — start bij herkenning.",
    },
    {
      slug: "stressdrager",
      label: "Stressdrager",
      snippet:
        "Veel prikkels en weinig rust in je lijf? Magnesium draagt bij tot de normale werking van het zenuwstelsel.",
    },
    {
      slug: "overtrainer",
      label: "Overtrainer",
      snippet:
        "Veel trainen, weinig landen? Magnesium past vaak in het herstelplaatje naast rust en slaap.",
    },
  ],
  melatonine: [
    {
      slug: "onrustige-slaper",
      label: "Onrustige Slaper",
      snippet:
        "Wakker om 3 uur, niet terug in slaap? Melatonine is vooral een timing-signaal — geen klassiek slaapmiddel.",
    },
  ],
  ashwagandha: [
    {
      slug: "stressdrager",
      label: "Stressdrager",
      snippet:
        "Sta je continu \"aan\"? Herken je langdurige spanning en oppervlakkige slaap — leefstijl eerst, supplementen daarna.",
    },
    {
      slug: "onrustige-slaper",
      label: "Onrustige Slaper",
      snippet:
        "Lang wakker liggen door prikkels? Combineer slaaphygiëne met zorgvuldig gekozen supplementen — EU-claims voor ashwagandha zijn nog niet definitief.",
    },
  ],
  "omega-3": [
    {
      slug: "overtrainer",
      label: "Overtrainer",
      snippet:
        "Veel belasting en traag herstel? EPA/DHA passen vaak in het bredere herstelplaatje naast rust en slaap.",
    },
    {
      slug: "lage-batterij",
      label: "Lage Batterij",
      snippet:
        "Weinig vette vis en structurele vermoeidheid? Omega-3 ondersteunt hart- en hersenclaims (EFSA) in de juiste context.",
    },
  ],
  "vitamine-d": [
    {
      slug: "lage-batterij",
      label: "Lage Batterij",
      snippet:
        "Lage energie en weinig zon in de winter? Vitamine D hoort bij bot/spier/immuun — meet waar nodig.",
    },
    {
      slug: "overtrainer",
      label: "Overtrainer",
      snippet:
        "Veel binnen trainen? Vitamine D draagt bij tot normale spierwerking — geen vervanging voor rustdagen.",
    },
  ],
  creatine: [
    {
      slug: "overtrainer",
      label: "Overtrainer",
      snippet:
        "Veel trainen maar weinig buffer? Creatine ondersteunt korte piekbelasting — herstel vraagt ook volume terugschroeven.",
    },
  ],
  zink: [
    {
      slug: "stressdrager",
      label: "Stressdrager",
      snippet:
        "Langdurige stress en weinig herstel? Zink draagt bij tot normaal immuunsysteem — geen hormoon-quickfix.",
    },
    {
      slug: "overtrainer",
      label: "Overtrainer",
      snippet:
        "Veel zweetverlies en training? Zink speelt mee bij eiwitsynthese en immuunfunctie — hou dosering binnen ADH.",
    },
  ],
  eiwitpoeder: [
    {
      slug: "overtrainer",
      label: "Overtrainer",
      snippet:
        "Veel trainen zonder voldoende eiwit? Herstel begint op het bord — poeder is ondersteuning, geen shortcut.",
    },
    {
      slug: "lage-batterij",
      label: "Lage Batterij",
      snippet:
        "Te weinig eiwit bij ontbijt en lunch? Stabielere energie begint vaak met 25–30 g eiwit per maaltijd.",
    },
  ],
};

export function getProfileFitsForCategory(
  category: SupplementCategory,
): SupplementProfileFit[] {
  return SUPPLEMENT_PROFILE_FITS[category] ?? [];
}
