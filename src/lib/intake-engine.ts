import {
  DOMAIN_IDS,
  MAX_OPTION_VALUE,
  QUESTIONS,
  type DomainId,
} from "@/data/intake-questions";

export type { DomainId };

/** Gezondheid per domein: 0 = zwak, 100 = sterk (laag 2 uitkomst). */
export type DomainScores = Record<DomainId, number>;

export type UrgencyLevel = "critical" | "moderate" | "mild" | "healthy";

export interface UrgencyResult {
  level: UrgencyLevel;
  label: string;
  color: string;
}

export interface ProfileLabelResult {
  name: string;
  domain: DomainId;
  /** Gezondheidsscore van het zwakste domein (de bottleneck). */
  score: number;
}

export interface SupplementAdvice {
  name: string;
  reason: string;
  link: string;
}

export interface AdviceResult {
  quickWins: string[];
  supplements: SupplementAdvice[];
  longTerm: string[];
}

const PROFILE_BY_DOMAIN: Record<DomainId, string> = {
  slaap: "Onrustige Slaper",
  energie: "Lage Batterij",
  stress: "Stressdrager",
  basis: "Basis Mist",
  beweging: "Stilzitter",
  stille_belasting: "Stille Slijter",
};

/**
 * Laag 2 — domeinscore 0–100:
 * per vraag genormaliseerde belasting r = value / MAX_OPTION_VALUE,
 * gemiddelde belasting B over beantwoorde vragen in het domein,
 * gezondheid G = 100 × (1 − B), afgerond en begrensd op [0, 100].
 * Ontbrekende antwoorden tellen niet mee in de noemer; domein zonder data → 50.
 */
export function calcDomainScores(answers: Record<string, number>): DomainScores {
  const byDomain = groupQuestionIdsByDomain();
  const out = {} as DomainScores;

  for (const domain of DOMAIN_IDS) {
    const ids = byDomain[domain];
    let sumB = 0;
    let n = 0;
    for (const qid of ids) {
      const raw = answers[qid];
      if (raw === undefined || Number.isNaN(raw)) continue;
      const v = clamp(raw, 0, MAX_OPTION_VALUE);
      sumB += v / MAX_OPTION_VALUE;
      n += 1;
    }
    const g = n === 0 ? 50 : 100 * (1 - sumB / n);
    out[domain] = clamp(Math.round(g), 0, 100);
  }

  return out;
}

/**
 * Laag 3 — urgentie op basis van het zwakste domein (minimale gezondheidsscore).
 */
export function getUrgency(scores: DomainScores): UrgencyResult {
  const minH = minDomainScore(scores);

  if (minH < 30) {
    return {
      level: "critical",
      label: "Hoog: meerdere hefbomen vragen directe aandacht",
      color: "#dc2626",
    };
  }
  if (minH < 50) {
    return {
      level: "moderate",
      label: "Middel: gerichte stappen maken merkbaar verschil",
      color: "#ea580c",
    };
  }
  if (minH < 70) {
    return {
      level: "mild",
      label: "Licht: kleine aanpassingen geven extra ruimte",
      color: "#ca8a04",
    };
  }
  return {
    level: "healthy",
    label: "Sterk: behoud en verfijn wat al werkt",
    color: "#16a34a",
  };
}

/** Profiel = domein met de laagste gezondheidsscore (zwakste schakel). Bij gelijke score wint het eerst genoemde domein in DOMAIN_IDS. */
export function getProfileLabel(scores: DomainScores): ProfileLabelResult {
  const lowest = Math.min(...DOMAIN_IDS.map((d) => scores[d]));
  const bestDomain = DOMAIN_IDS.find((d) => scores[d] === lowest)!;

  return {
    name: PROFILE_BY_DOMAIN[bestDomain],
    domain: bestDomain,
    score: lowest,
  };
}

/**
 * Laag 4 — advies: zes beslisregels (één per domein-profiel), maximaal drie items per categorie.
 * Optioneel: primaire symptoomselectie (`symptoms`) geeft één extra quick win als die nog niet in de lijst staat.
 */
export function getAdvice(
  scores: DomainScores,
  answers: Record<string, number>,
  symptoms: string[],
): AdviceResult {
  const profile = getProfileLabel(scores);
  const base = adviceForDomain(profile.domain);

  const quick = uniqueFirst(
    maybePrependSymptomQuickWin(symptoms, profile.domain, base.quickWins),
    3,
  );
  const supp = uniqueFirst(base.supplements, 3);
  const long = uniqueFirst(
    refineLongTermWithAnswers(profile.domain, answers, base.longTerm),
    3,
  );

  return {
    quickWins: quick,
    supplements: supp,
    longTerm: long,
  };
}

// ——— Interne helpers ———

function groupQuestionIdsByDomain(): Record<DomainId, string[]> {
  const map = {} as Record<DomainId, string[]>;
  for (const d of DOMAIN_IDS) map[d] = [];
  for (const q of QUESTIONS) {
    map[q.category].push(q.id);
  }
  return map;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function minDomainScore(scores: DomainScores): number {
  let m = Infinity;
  for (const d of DOMAIN_IDS) m = Math.min(m, scores[d]);
  return m;
}

function uniqueFirst<T>(items: T[], max: number): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const key = typeof item === "string" ? item : JSON.stringify(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
    if (out.length >= max) break;
  }
  return out;
}

/** Verfijnt vaste domeinadviezen op basis van concrete antwoorden (zelfde zes domeinregels, wel persoonlijker). */
function refineLongTermWithAnswers(
  domain: DomainId,
  answers: Record<string, number>,
  longTerm: string[],
): string[] {
  const lt = [...longTerm];
  if (domain === "beweging" && (answers["intake-beweging-zitten"] ?? 0) >= 2) {
    lt[0] =
      "Zet elke 45 minuten een timer: 2 minuten lopen — dat telt al mee voor je totale beweging.";
  }
  if (domain === "stille_belasting" && (answers["intake-stille-alcohol"] ?? 0) >= 2) {
    lt[0] =
      "Leg een tijdelijk alcoholplafond vast (bijv. max 2 glazen per week) en evalueer na 14 dagen hoe je je voelt.";
  }
  return lt;
}

function maybePrependSymptomQuickWin(
  symptoms: string[],
  primary: DomainId,
  wins: string[],
): string[] {
  const map: Record<string, string> = {
    slaap:
      "Kies één vast bedtijdvenster deze week — ook in het weekend niet meer dan 45 minuten verschuiven.",
    energie:
      "Plan morgen 10 minuten wandelen vóór je eerste koffie: licht + beweging geven je ritme een duw.",
    stress:
      "Zet vandaag twee korte pauzes van 3 minuten in je agenda vóór de drukste momenten.",
  };
  for (const s of symptoms) {
    if (s === primary && map[s]) {
      return [map[s], ...wins];
    }
  }
  return wins;
}

interface DomainAdviceTemplate {
  quickWins: string[];
  supplements: SupplementAdvice[];
  longTerm: string[];
}

/** Zes beslisregels: zwakste domein bepaalt het adviespakket. */
function adviceForDomain(domain: DomainId): DomainAdviceTemplate {
  const templates: Record<DomainId, DomainAdviceTemplate> = {
    slaap: {
      quickWins: [
        "Vaste opsta-/bedtijd, maximaal 30–45 min schuiven in het weekend.",
        "Geen schermen of zwaar nieuws de laatste 60 minuten voor slapen.",
        "Koele, donkere slaapkamer; eventueel oordopjes of masker.",
      ],
      supplements: [
        {
          name: "Magnesium (bisglycinaat)",
          reason: "Ondersteunt ontspanning van spieren en zenuwstelsel rond slaap.",
          link: "/supplementen/magnesium",
        },
        {
          name: "Melatonine",
          reason: "Kan inslapen helpen bij verschoven ritme; kort en doelgericht gebruiken.",
          link: "/supplementen/melatonine",
        },
        {
          name: "Vitamine D",
          reason: "Speelt mee in hormoon- en energieregulatie die met slaap samenhangt.",
          link: "/supplementen/vitamine-d",
        },
      ],
      longTerm: [
        "Breng lichtexpositie ’s ochtends (buiten 10 minuten) om je circadiaanse klok te verankeren.",
        "Beperk cafeïne na 14:00 en alcohol in de laatste uren voor bed.",
        "Overweeg slaap-dagboek twee weken om patronen zichtbaar te maken.",
      ],
    },
    energie: {
      quickWins: [
        "Eiwit en vezels bij lunch om de middagdip te dempen.",
        "Korte wandeling na de lunch (10 minuten) in plaats van extra cafeïne.",
        "Grote glas water direct na opstaan.",
      ],
      supplements: [
        {
          name: "Vitamine D",
          reason: "Tekort gaat vaak samen met vermoeidheid en winterdip.",
          link: "/supplementen/vitamine-d",
        },
        {
          name: "Magnesium",
          reason: "Draagt bij aan energiestofwisseling en spierfunctie.",
          link: "/supplementen/magnesium",
        },
        {
          name: "Omega-3",
          reason: "Ondersteunt hersenen en algemene veerkracht bij langdurige belasting.",
          link: "/supplementen/omega-3",
        },
      ],
      longTerm: [
        "Laat bloedwaarden en schildklier bij aanhoudende vermoeidheid met je arts bespreken.",
        "Bouw progressief conditie op: 2× per week duur + 2× kracht.",
        "Evalueer alcohol en slaapkwaliteit — die bepalen vaak meer dan je denkt.",
      ],
    },
    stress: {
      quickWins: [
        "4-7-8 ademhaling 3 rondes bij aankomende spanning.",
        "Schrijf ’s avonds drie zinnen: wat liep vast, wat was wél oké.",
        "Één vaste plek voor telefoon die niet op je nachtkastje ligt.",
      ],
      supplements: [
        {
          name: "Ashwagandha",
          reason: "Traditioneel gebruikt om stressbelasting en gespannenheid te verzachten.",
          link: "/supplementen/ashwagandha",
        },
        {
          name: "Magnesium",
          reason: "Ondersteunt het zenuwstelsel bij herstel na prikkels.",
          link: "/supplementen/magnesium",
        },
        {
          name: "Omega-3",
          reason: "Meegewogen bij stemming en stressrespons op de lange termijn.",
          link: "/supplementen/omega-3",
        },
      ],
      longTerm: [
        "Maak grenzen op werk bespreekbaar met concrete voorbeelden en voorstellen.",
        "Overweeg mindfulness of CBT-elementen met begeleiding bij aanhoudende angst.",
        "Combineer sociale steun met vaste beweging — beide verlagen baseline-spanning.",
      ],
    },
    basis: {
      quickWins: [
        "Vul half je bord met groente bij de warme maaltijd.",
        "Zet een kan water op je werkplek met een dagstreef (bijv. 1,5–2 L).",
        "Eet binnen een uur na opstaan iets met eiwit + vezel.",
      ],
      supplements: [
        {
          name: "Magnesium",
          reason: "Komt vaak tekort bij eenzijdige voeding en veel stress.",
          link: "/supplementen/magnesium",
        },
        {
          name: "Vitamine D",
          reason: "Structureel aanvullen als blootstelling aan zon laag is.",
          link: "/supplementen/vitamine-d",
        },
        {
          name: "Omega-3",
          reason: "Vetzuren die je uit voeding niet altijd genoeg binnenkrijgt.",
          link: "/supplementen/omega-3",
        },
      ],
      longTerm: [
        "Werk toe naar een voedingspatroon dat je vol kunt houden, niet naar perfectie.",
        "Plan wekelijkse meal prep voor de drukste dagen.",
        "Laat periodiek vitamine D en ijzer bespreken als vermoeidheid aanhoudt.",
      ],
    },
    beweging: {
      quickWins: [
        "Elk uur 2 minuten opstaan en schouders losrollen.",
        "Vervang één korte autorit per week door fiets of wandelen.",
        "Start met 20 minuten stevig wandelen, 3× per week — vast in agenda.",
      ],
      supplements: [
        {
          name: "Magnesium",
          reason: "Spierherstel en ontspanning na inspanning.",
          link: "/supplementen/magnesium",
        },
        {
          name: "Vitamine D",
          reason: "Belangrijk voor spierfunctie en botondersteuning bij meer bewegen.",
          link: "/supplementen/vitamine-d",
        },
        {
          name: "Omega-3",
          reason: "Ondersteunt herstel en gewrichtscomfort bij opbouw van training.",
          link: "/supplementen/omega-3",
        },
      ],
      longTerm: [
        "Bouw krachttraining op (grote spiergroepen 2× per week).",
        "Meet voortgang met stappen of duur, niet alleen met het gewicht op de weegschaal.",
        "Zoek een activiteit die je volhoudt — consistentie wint van intensiteit.",
      ],
    },
    stille_belasting: {
      quickWins: [
        "Alcoholvrije dagen vastleggen in je weekschema (minimaal 3).",
        "Kleinere maaltijden, langzamer eten, en na het avondeten geen zware snacks.",
        "Noteer 5 dagen lang maaltijden + opgeblazen gevoel om patronen te zien.",
      ],
      supplements: [
        {
          name: "Omega-3",
          reason: "Ondersteunt een evenwichtige ontstanningsbalans bij stille belasting.",
          link: "/supplementen/omega-3",
        },
        {
          name: "Magnesium",
          reason: "Draagt bij aan ontspanning van spijsvertering en zenuwstelsel.",
          link: "/supplementen/magnesium",
        },
        {
          name: "Vitamine D",
          reason: "Algemene reserve die vaak samen met leefstijl wordt bijgesteld.",
          link: "/supplementen/vitamine-d",
        },
      ],
      longTerm: [
        "Laat bij aanhoudende klachten spijsvertering met een arts bespreken (o.a. intoleranties).",
        "Verlaag ultrabewerkte voeding en suikers stapsgewijs.",
        "Combineer minder alcohol met betere slaap — dat versterkt elkaar.",
      ],
    },
  };

  return templates[domain];
}
