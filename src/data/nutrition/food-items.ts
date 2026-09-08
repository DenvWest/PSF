/**
 * Voedingsmiddelen met hun micronutriënt-gehalte per 100 g.
 *
 * ## Waarom deze tabel naast `food-sources.ts` staat
 *
 * `food-sources.ts` is **nutriënt-eerst**: per stof een lijst bronnen, om te
 * kunnen kiezen tussen bronnen. Dat is de vorm die de nutriëntroutes en het
 * schap nodig hebben, en die tabel blijft daar de waarheid.
 *
 * Deze tabel is **voedingsmiddel-eerst**: per product wat het levert. Dat is de
 * vorm die het dagboek nodig heeft — je vult in wat je at, en het scherm laat
 * zien welke stoffen daarmee langskwamen. Dezelfde data omdraaien in code kan
 * niet: `food-sources.ts` kent per stof andere producten, met per stof een
 * andere portie, en een product dat bij drie stoffen voorkomt heeft daar drie
 * los gekozen portiegroottes. Eén portie per product is precies wat een
 * dagboekregel nodig heeft.
 *
 * De twee tabellen spreken elkaar niet tegen: waar ze hetzelfde product kennen
 * gaat het over hetzelfde gehalte per 100 g. Ze beantwoorden alleen een andere
 * vraag, en `nutrition-micronutrient-index.ts` leidt uit déze tabel af wat
 * "alle bronnen van magnesium" is — dus zonder tweede handmatige lijst.
 *
 * ## De harde leesregel — ongewijzigd
 *
 * Deze getallen tellen **niet** op tot een dagtotaal dat je tegen een ADH legt.
 * Alle waarden zijn indicatief (`verified: false`), de porties zijn
 * standaardporties en niet jouw portie, en bij magnesium, zink en ijzer bepaalt
 * fytaat mede hoeveel je er werkelijk uit haalt. Wat het dagboek toont is
 * **dekking**: welke stoffen kwamen langs, uit welke bron, en waar zit de
 * ruimte. Zie `nutrition-dagdekking.ts` voor hoe dat gerekend wordt en waarom
 * het geen milligrammen zijn.
 *
 * ## Herkomst
 *
 * De gehaltes zijn orde-van-grootte-waarden uit de gangbare
 * voedingsmiddelentabellen (NEVO/USDA-niveau). Ze staan hier allemaal op
 * `verified: false` met `bron: "literatuur"`, precies zoals `food-sources.ts`
 * dat deed bij zijn eigen startstand: pas als een rij naast het echte
 * NEVO-bestand is gelegd, mag hij een code en `verified: true` dragen. Dat veld
 * bestaat om het verschil zichtbaar te houden, niet om het te vergeten.
 *
 * TODO leg de rijen naast NEVO-online 2025/9.0 en zet per rij `bron` +
 *      `nevoCode` + `verified` goed. Tot die tijd toont de UI "indicatief".
 */

import type { MicronutrientId } from "@/data/nutrition/micronutrients";
import type { VoedselgroepId } from "@/lib/nutrition-voedselgroepen";

export type VoedingsmiddelBron = "nevo" | "usda" | "voedingscentrum" | "literatuur";

export interface Voedingsmiddel {
  /** Stabiel, kebab-case. Uniek over de hele tabel; sleutel in de opslag. */
  key: string;
  labelNl: string;
  /** De dagboekgroep waar dit product onder valt — de brug naar `portions`. */
  groep: VoedselgroepId;
  /** Eén portie, zoals getoond: "100 g (grote hand)". */
  portieLabel: string;
  /**
   * Gram per portie. De enige plek waar van 100 g naar een portie wordt
   * gerekend; het resultaat is onze afgeleide waarde, geen brondcijfer.
   */
  portieGram: number;
  /** Gehaltes per 100 g eetbaar gedeelte. Ontbrekende stof = niet noemenswaard. */
  per100g: Partial<Record<MicronutrientId, number>>;
  /** Nederlands seizoen als [startmaand, eindmaand], 1-based en inclusief. */
  seizoenMaanden?: readonly [number, number];
  /** Wat je moet weten om het getal goed te lezen. Geen claim. */
  noteNl?: string;
  /** Zoektermen naast het label — merknamen, synoniemen, spreektaal. */
  synoniemen?: readonly string[];
  bron: VoedingsmiddelBron;
  /** Of het gehalte daadwerkelijk naast de brondataset is gelegd. */
  verified: boolean;
}

/** Fytaat remt magnesium, zink en ijzer uit planten — één formulering. */
const FYTAAT =
  "Fytaat in volkoren, peulvruchten, noten en zaden bindt magnesium, zink en ijzer — de mineralen zijn er, je haalt er minder uit.";

/** ALA is geen EPA/DHA: de omzetting is enkele procenten. */
const ALA =
  "Plantaardige omega-3 (ALA). Je lichaam zet daar maar enkele procenten van om naar EPA/DHA — dit vervangt vette vis niet.";

/** Vitamine C verdwijnt deels in kookwater; rauw of kort gestoomd houdt meer over. */
const KOOKVERLIES =
  "Vitamine C en foliumzuur lopen deels weg in het kookwater. Kort stomen houdt meer over dan lang koken.";

function item(
  key: string,
  labelNl: string,
  groep: VoedselgroepId,
  portieLabel: string,
  portieGram: number,
  per100g: Partial<Record<MicronutrientId, number>>,
  extra: Partial<Pick<Voedingsmiddel, "noteNl" | "synoniemen" | "seizoenMaanden">> = {},
): Voedingsmiddel {
  return {
    key,
    labelNl,
    groep,
    portieLabel,
    portieGram,
    per100g,
    bron: "literatuur",
    verified: false,
    ...extra,
  };
}

/**
 * Groente eerst, en met afstand het langst.
 *
 * Dat is geen alfabetische toevalligheid maar het argument van dit hele
 * scherm: de stoffen waar mensen een potje voor kopen — magnesium, kalium,
 * foliumzuur, vitamine K, vitamine C — komen hier vandaan, in hoeveelheden
 * waar geen supplement tegenop hoeft. Wie het overzicht opent en bovenaan
 * dertig groenten ziet staan, leest dat argument voordat hij één regel tekst
 * heeft gelezen.
 */
const GROENTE: readonly Voedingsmiddel[] = [
  item("spinazie", "Spinazie", "groente", "100 g rauw · grote hand", 100, {
    magnesium: 79, kalium: 558, calcium: 99, ijzer: 2.7, vitamine_c: 28,
    foliumzuur: 194, vitamine_k: 483, vitamine_a: 469, vezels: 2.2, eiwit: 2.9,
  }, { noteNl: "Oxaalzuur in spinazie remt de opname van het calcium en ijzer dat erin zit." }),
  item("boerenkool", "Boerenkool", "groente", "100 g", 100, {
    magnesium: 33, kalium: 348, calcium: 150, ijzer: 1.5, vitamine_c: 120,
    foliumzuur: 141, vitamine_k: 390, vitamine_a: 500, vezels: 3.6, eiwit: 4.3,
  }, { seizoenMaanden: [10, 3] }),
  item("broccoli", "Broccoli", "groente", "100 g gekookt", 100, {
    magnesium: 21, kalium: 316, calcium: 47, ijzer: 0.7, vitamine_c: 65,
    foliumzuur: 63, vitamine_k: 141, vitamine_a: 77, vezels: 3.3, eiwit: 2.4,
  }, { noteNl: KOOKVERLIES }),
  item("spruitjes", "Spruitjes", "groente", "100 g gekookt", 100, {
    magnesium: 23, kalium: 389, calcium: 42, ijzer: 1.4, vitamine_c: 85,
    foliumzuur: 61, vitamine_k: 177, vezels: 3.8, eiwit: 3.4,
  }, { seizoenMaanden: [9, 2] }),
  item("bloemkool", "Bloemkool", "groente", "100 g gekookt", 100, {
    magnesium: 15, kalium: 299, calcium: 22, ijzer: 0.4, vitamine_c: 48,
    foliumzuur: 57, vitamine_k: 15, vezels: 2, eiwit: 1.9,
  }),
  item("witte-kool", "Witte kool", "groente", "100 g", 100, {
    magnesium: 12, kalium: 170, calcium: 40, ijzer: 0.5, vitamine_c: 37,
    foliumzuur: 43, vitamine_k: 76, vezels: 2.5, eiwit: 1.3,
  }),
  item("rodekool", "Rodekool", "groente", "100 g", 100, {
    magnesium: 16, kalium: 243, calcium: 45, ijzer: 0.8, vitamine_c: 57,
    foliumzuur: 18, vitamine_k: 38, vezels: 2.1, eiwit: 1.4,
  }),
  item("andijvie", "Andijvie", "groente", "100 g", 100, {
    magnesium: 15, kalium: 314, calcium: 52, ijzer: 0.8, vitamine_c: 6.5,
    foliumzuur: 142, vitamine_k: 231, vitamine_a: 108, vezels: 3.1, eiwit: 1.2,
  }),
  item("kropsla", "Sla", "groente", "50 g · flinke hand", 50, {
    magnesium: 13, kalium: 194, calcium: 36, ijzer: 0.9, vitamine_c: 9,
    foliumzuur: 38, vitamine_k: 126, vitamine_a: 166, vezels: 1.3, eiwit: 1.4,
  }, { synoniemen: ["kropsla", "ijsbergsla", "salade"] }),
  item("rucola", "Rucola", "groente", "30 g · hand", 30, {
    magnesium: 47, kalium: 369, calcium: 160, ijzer: 1.5, vitamine_c: 15,
    foliumzuur: 97, vitamine_k: 109, vitamine_a: 119, vezels: 1.6, eiwit: 2.6,
  }),
  item("paksoi", "Paksoi", "groente", "100 g", 100, {
    magnesium: 19, kalium: 252, calcium: 105, ijzer: 0.8, vitamine_c: 45,
    foliumzuur: 66, vitamine_k: 46, vitamine_a: 223, vezels: 1, eiwit: 1.5,
  }),
  item("snijbiet", "Snijbiet", "groente", "100 g", 100, {
    magnesium: 81, kalium: 379, calcium: 51, ijzer: 1.8, vitamine_c: 30,
    foliumzuur: 14, vitamine_k: 830, vitamine_a: 306, vezels: 1.6, eiwit: 1.8,
  }),
  item("wortel", "Wortel", "groente", "100 g · 2 kleine", 100, {
    magnesium: 12, kalium: 320, calcium: 33, ijzer: 0.3, vitamine_c: 5.9,
    foliumzuur: 19, vitamine_k: 13, vitamine_a: 835, vezels: 2.8, eiwit: 0.9,
  }, { noteNl: "De vitamine A zit als bèta-caroteen in de wortel; een beetje vet erbij helpt de opname." }),
  item("pompoen", "Pompoen", "groente", "150 g", 150, {
    magnesium: 12, kalium: 340, calcium: 21, ijzer: 0.8, vitamine_c: 9,
    foliumzuur: 16, vitamine_a: 426, vezels: 1.1, eiwit: 1,
  }, { seizoenMaanden: [9, 12] }),
  item("paprika-rood", "Paprika, rood", "groente", "100 g · halve", 100, {
    magnesium: 12, kalium: 211, calcium: 7, ijzer: 0.4, vitamine_c: 128,
    foliumzuur: 46, vitamine_a: 157, vezels: 2.1, eiwit: 1,
  }, { noteNl: "Meer vitamine C per portie dan een sinaasappel." }),
  item("tomaat", "Tomaat", "groente", "100 g · 1 middelgrote", 100, {
    magnesium: 11, kalium: 237, calcium: 10, ijzer: 0.3, vitamine_c: 14,
    foliumzuur: 15, vitamine_k: 7.9, vitamine_a: 42, vezels: 1.2, eiwit: 0.9,
  }),
  item("komkommer", "Komkommer", "groente", "100 g · kwart", 100, {
    magnesium: 13, kalium: 147, calcium: 16, ijzer: 0.3, vitamine_c: 2.8,
    foliumzuur: 7, vitamine_k: 16, vezels: 0.5, eiwit: 0.7,
  }),
  item("courgette", "Courgette", "groente", "150 g · halve", 150, {
    magnesium: 18, kalium: 261, calcium: 16, ijzer: 0.4, vitamine_c: 18,
    foliumzuur: 24, vitamine_k: 4.3, vezels: 1, eiwit: 1.2,
  }),
  item("aubergine", "Aubergine", "groente", "150 g", 150, {
    magnesium: 14, kalium: 229, calcium: 9, ijzer: 0.2, vitamine_c: 2.2,
    foliumzuur: 22, vezels: 3, eiwit: 1,
  }),
  item("prei", "Prei", "groente", "100 g", 100, {
    magnesium: 28, kalium: 180, calcium: 59, ijzer: 2.1, vitamine_c: 12,
    foliumzuur: 64, vitamine_k: 47, vezels: 1.8, eiwit: 1.5,
  }),
  item("ui", "Ui", "groente", "80 g · 1 middelgrote", 80, {
    magnesium: 10, kalium: 146, calcium: 23, ijzer: 0.2, vitamine_c: 7.4,
    foliumzuur: 19, vezels: 1.7, eiwit: 1.1,
  }),
  item("knoflook", "Knoflook", "groente", "6 g · 2 tenen", 6, {
    magnesium: 25, kalium: 401, calcium: 181, ijzer: 1.7, vitamine_c: 31,
    vitamine_b6: 1.2, vezels: 2.1, eiwit: 6.4,
  }, { noteNl: "Per portie klein — twee tenen zijn 6 gram, niet 100." }),
  item("champignons", "Champignons", "groente", "100 g", 100, {
    magnesium: 9, kalium: 318, calcium: 3, ijzer: 0.5, vitamine_c: 2.1,
    foliumzuur: 17, selenium: 9.3, vitamine_b6: 0.1, vezels: 1, eiwit: 3.1,
  }, { noteNl: "Champignons die onder uv-licht groeiden bevatten vitamine D; gewone kweekchampignons vrijwel niet." }),
  item("doperwten", "Doperwten", "groente", "100 g", 100, {
    magnesium: 33, kalium: 244, calcium: 25, ijzer: 1.5, vitamine_c: 40,
    foliumzuur: 65, vitamine_k: 25, vezels: 5.1, eiwit: 5.4,
  }),
  item("sperziebonen", "Sperziebonen", "groente", "100 g", 100, {
    magnesium: 25, kalium: 211, calcium: 37, ijzer: 1, vitamine_c: 12,
    foliumzuur: 33, vitamine_k: 43, vezels: 3.4, eiwit: 1.8,
  }),
  item("bleekselderij", "Bleekselderij", "groente", "80 g · 2 stengels", 80, {
    magnesium: 11, kalium: 260, calcium: 40, ijzer: 0.2, vitamine_c: 3.1,
    foliumzuur: 36, vitamine_k: 29, vezels: 1.6, eiwit: 0.7,
  }),
  item("venkel", "Venkel", "groente", "100 g", 100, {
    magnesium: 17, kalium: 414, calcium: 49, ijzer: 0.7, vitamine_c: 12,
    foliumzuur: 27, vezels: 3.1, eiwit: 1.2,
  }),
  item("asperge", "Asperges", "groente", "100 g", 100, {
    magnesium: 14, kalium: 202, calcium: 24, ijzer: 2.1, vitamine_c: 5.6,
    foliumzuur: 52, vitamine_k: 42, vezels: 2.1, eiwit: 2.2,
  }, { seizoenMaanden: [4, 6] }),
  item("rode-biet", "Rode biet", "groente", "100 g", 100, {
    magnesium: 23, kalium: 325, calcium: 16, ijzer: 0.8, vitamine_c: 4.9,
    foliumzuur: 109, vezels: 2.8, eiwit: 1.6,
  }),
  item("radijs", "Radijs", "groente", "50 g · bosje", 50, {
    magnesium: 10, kalium: 233, calcium: 25, ijzer: 0.3, vitamine_c: 15,
    foliumzuur: 25, vezels: 1.6, eiwit: 0.7,
  }),
  item("zuurkool", "Zuurkool", "groente", "100 g", 100, {
    magnesium: 13, kalium: 170, calcium: 30, ijzer: 1.5, vitamine_c: 15,
    foliumzuur: 24, vitamine_k: 13, vezels: 2.9, eiwit: 0.9,
  }),
  item("bosui", "Bosui", "groente", "25 g", 25, {
    magnesium: 20, kalium: 276, calcium: 72, ijzer: 1.5, vitamine_c: 19,
    foliumzuur: 64, vitamine_k: 207, vitamine_a: 50, vezels: 2.6, eiwit: 1.8,
  }),
  item("waterkers", "Waterkers", "groente", "30 g", 30, {
    magnesium: 21, kalium: 330, calcium: 120, ijzer: 0.2, vitamine_c: 43,
    foliumzuur: 9, vitamine_k: 250, vitamine_a: 346, vezels: 0.5, eiwit: 2.3,
  }),
  item("chinese-kool", "Chinese kool", "groente", "100 g", 100, {
    magnesium: 13, kalium: 238, calcium: 77, ijzer: 0.3, vitamine_c: 27,
    foliumzuur: 79, vitamine_k: 43, vezels: 1.2, eiwit: 1.2,
  }),
];

/** Fruit: hier zitten kalium en vitamine C, en bij gedroogd fruit ook ijzer. */
const FRUIT: readonly Voedingsmiddel[] = [
  item("banaan", "Banaan", "fruit", "120 g · 1 stuk", 120, {
    magnesium: 27, kalium: 358, calcium: 5, ijzer: 0.3, vitamine_c: 8.7,
    foliumzuur: 20, vitamine_b6: 0.37, vezels: 2.6, eiwit: 1.1,
  }),
  item("appel", "Appel", "fruit", "130 g · 1 stuk", 130, {
    magnesium: 5, kalium: 107, calcium: 6, ijzer: 0.1, vitamine_c: 4.6,
    foliumzuur: 3, vezels: 2.4, eiwit: 0.3,
  }),
  item("sinaasappel", "Sinaasappel", "fruit", "130 g · 1 stuk", 130, {
    magnesium: 10, kalium: 181, calcium: 40, ijzer: 0.1, vitamine_c: 53,
    foliumzuur: 30, vezels: 2.4, eiwit: 0.9,
  }),
  item("kiwi", "Kiwi", "fruit", "75 g · 1 stuk", 75, {
    magnesium: 17, kalium: 312, calcium: 34, ijzer: 0.3, vitamine_c: 93,
    foliumzuur: 25, vitamine_k: 40, vezels: 3, eiwit: 1.1,
  }),
  item("aardbei", "Aardbeien", "fruit", "150 g · schaaltje", 150, {
    magnesium: 13, kalium: 153, calcium: 16, ijzer: 0.4, vitamine_c: 59,
    foliumzuur: 24, vezels: 2, eiwit: 0.7,
  }, { seizoenMaanden: [5, 9] }),
  item("blauwe-bes", "Blauwe bessen", "fruit", "100 g · bakje", 100, {
    magnesium: 6, kalium: 77, calcium: 6, ijzer: 0.3, vitamine_c: 9.7,
    foliumzuur: 6, vitamine_k: 19, vezels: 2.4, eiwit: 0.7,
  }),
  item("framboos", "Frambozen", "fruit", "100 g · bakje", 100, {
    magnesium: 22, kalium: 151, calcium: 25, ijzer: 0.7, vitamine_c: 26,
    foliumzuur: 21, vitamine_k: 7.8, vezels: 6.5, eiwit: 1.2,
  }),
  item("mango", "Mango", "fruit", "150 g · halve", 150, {
    magnesium: 10, kalium: 168, calcium: 11, ijzer: 0.2, vitamine_c: 36,
    foliumzuur: 43, vitamine_a: 54, vezels: 1.6, eiwit: 0.8,
  }),
  item("peer", "Peer", "fruit", "150 g · 1 stuk", 150, {
    magnesium: 7, kalium: 116, calcium: 9, ijzer: 0.2, vitamine_c: 4.3,
    foliumzuur: 7, vezels: 3.1, eiwit: 0.4,
  }),
  item("druiven", "Druiven", "fruit", "100 g · trosje", 100, {
    magnesium: 7, kalium: 191, calcium: 10, ijzer: 0.4, vitamine_c: 3.2,
    vitamine_k: 15, vezels: 0.9, eiwit: 0.7,
  }),
  item("ananas", "Ananas", "fruit", "125 g · 2 schijven", 125, {
    magnesium: 12, kalium: 109, calcium: 13, ijzer: 0.3, vitamine_c: 48,
    foliumzuur: 18, vezels: 1.4, eiwit: 0.5,
  }),
  item("watermeloen", "Watermeloen", "fruit", "200 g · punt", 200, {
    magnesium: 10, kalium: 112, calcium: 7, ijzer: 0.2, vitamine_c: 8.1,
    vitamine_a: 28, vezels: 0.4, eiwit: 0.6,
  }),
  item("abrikoos-gedroogd", "Gedroogde abrikozen", "fruit", "40 g · handvol", 40, {
    magnesium: 32, kalium: 1162, calcium: 55, ijzer: 2.7, vitamine_c: 1,
    foliumzuur: 10, vitamine_a: 180, vezels: 7.3, eiwit: 3.4,
  }, { noteNl: "Gedroogd fruit is geconcentreerd: dezelfde stoffen, maar ook dezelfde suikers in een kleiner volume." }),
  item("dadel", "Dadels", "fruit", "40 g · 3 stuks", 40, {
    magnesium: 54, kalium: 696, calcium: 64, ijzer: 1, vitamine_b6: 0.25,
    vezels: 8, eiwit: 2.5,
  }),
  item("rozijnen", "Rozijnen", "fruit", "30 g · handvol", 30, {
    magnesium: 32, kalium: 749, calcium: 50, ijzer: 1.9, vitamine_c: 2.3,
    vezels: 3.7, eiwit: 3.1,
  }),
  item("avocado", "Avocado", "fruit", "100 g · halve", 100, {
    magnesium: 29, kalium: 485, calcium: 12, ijzer: 0.6, vitamine_c: 10,
    foliumzuur: 81, vitamine_k: 21, vitamine_e: 2.1, vezels: 6.7, eiwit: 2,
  }),
  item("grapefruit", "Grapefruit", "fruit", "150 g · halve", 150, {
    magnesium: 9, kalium: 135, calcium: 22, ijzer: 0.1, vitamine_c: 34,
    foliumzuur: 13, vezels: 1.6, eiwit: 0.8,
  }),
  item("bramen", "Bramen", "fruit", "100 g · bakje", 100, {
    magnesium: 20, kalium: 162, calcium: 29, ijzer: 0.6, vitamine_c: 21,
    foliumzuur: 25, vitamine_k: 19.8, vezels: 5.3, eiwit: 1.4,
  }),
];

/** Peulvruchten: de plantaardige kant van eiwit, ijzer, zink en foliumzuur. */
const PEULVRUCHTEN: readonly Voedingsmiddel[] = [
  item("bruine-bonen", "Bruine bonen", "peulvruchten", "150 g gekookt", 150, {
    magnesium: 43, kalium: 405, calcium: 41, ijzer: 2.1, zink: 1,
    foliumzuur: 130, vezels: 7.4, eiwit: 8.2,
  }, { noteNl: FYTAAT }),
  item("kikkererwten", "Kikkererwten", "peulvruchten", "150 g gekookt", 150, {
    magnesium: 48, kalium: 291, calcium: 49, ijzer: 2.9, zink: 1.5,
    foliumzuur: 172, vezels: 7.6, eiwit: 8.9,
  }, { noteNl: FYTAAT }),
  item("linzen", "Linzen", "peulvruchten", "150 g gekookt", 150, {
    magnesium: 36, kalium: 369, calcium: 19, ijzer: 3.3, zink: 1.3,
    foliumzuur: 181, vezels: 7.9, eiwit: 9,
  }, { noteNl: "Vitamine C erbij — paprika, tomaat, citroen — verbetert de opname van het ijzer uit peulvruchten." }),
  item("kidneybonen", "Kidneybonen", "peulvruchten", "150 g gekookt", 150, {
    magnesium: 45, kalium: 405, calcium: 28, ijzer: 2.2, zink: 1,
    foliumzuur: 130, vezels: 7.4, eiwit: 8.7,
  }),
  item("witte-bonen", "Witte bonen", "peulvruchten", "150 g gekookt", 150, {
    magnesium: 53, kalium: 561, calcium: 90, ijzer: 3.7, zink: 1,
    foliumzuur: 81, vezels: 6.3, eiwit: 9.7,
  }),
  item("tuinbonen", "Tuinbonen", "peulvruchten", "150 g gekookt", 150, {
    magnesium: 43, kalium: 268, calcium: 36, ijzer: 1.5, zink: 1,
    foliumzuur: 104, vezels: 5.4, eiwit: 7.6,
  }),
  item("edamame", "Edamame (sojabonen)", "peulvruchten", "100 g", 100, {
    magnesium: 64, kalium: 436, calcium: 63, ijzer: 2.3, zink: 1.3,
    foliumzuur: 311, vitamine_k: 26, vezels: 5.2, eiwit: 11.9,
  }),
  item("tofu", "Tofu", "peulvruchten", "100 g", 100, {
    magnesium: 58, kalium: 121, calcium: 350, ijzer: 5.4, zink: 0.8,
    foliumzuur: 15, vezels: 0.9, eiwit: 8.1,
  }, { noteNl: "Met calciumsulfaat gestremde tofu is een van de weinige plantaardige calciumbronnen van formaat." }),
  item("tempeh", "Tempeh", "peulvruchten", "100 g", 100, {
    magnesium: 81, kalium: 412, calcium: 111, ijzer: 2.7, zink: 1.1,
    vezels: 4, eiwit: 19,
  }),
  item("hummus", "Hummus", "peulvruchten", "50 g · 2 el", 50, {
    magnesium: 71, kalium: 228, calcium: 38, ijzer: 2.4, zink: 1.6,
    foliumzuur: 83, vezels: 6, eiwit: 7.9,
  }),
];

/** Noten & zaden: per gram de dichtste magnesium-, zink- en vitamine E-bronnen. */
const NOTEN: readonly Voedingsmiddel[] = [
  item("amandelen", "Amandelen", "noten", "25 g · handvol", 25, {
    magnesium: 270, kalium: 733, calcium: 269, ijzer: 3.7, zink: 3.1,
    vitamine_e: 25.6, vezels: 12.5, eiwit: 21.2,
  }, { noteNl: FYTAAT }),
  item("walnoten", "Walnoten", "noten", "25 g · handvol", 25, {
    magnesium: 158, kalium: 441, calcium: 98, ijzer: 2.9, zink: 3.1,
    vitamine_e: 0.7, vezels: 6.7, eiwit: 15.2,
  }, { noteNl: ALA }),
  item("cashewnoten", "Cashewnoten", "noten", "25 g · handvol", 25, {
    magnesium: 292, kalium: 660, calcium: 37, ijzer: 6.7, zink: 5.8,
    vezels: 3.3, eiwit: 18.2,
  }),
  item("paranoten", "Paranoten", "noten", "10 g · 2 stuks", 10, {
    magnesium: 376, kalium: 659, calcium: 160, ijzer: 2.4, zink: 4.1,
    selenium: 1917, vezels: 7.5, eiwit: 14.3,
  }, { noteNl: "Twee paranoten dekken je selenium ruim. Meer dan een paar per dag is niet nodig — selenium heeft een smalle marge." }),
  item("hazelnoten", "Hazelnoten", "noten", "25 g · handvol", 25, {
    magnesium: 163, kalium: 680, calcium: 114, ijzer: 4.7, zink: 2.5,
    vitamine_e: 15, foliumzuur: 113, vezels: 9.7, eiwit: 15,
  }),
  item("pinda", "Pinda's, ongezouten", "noten", "25 g · handvol", 25, {
    magnesium: 168, kalium: 705, calcium: 92, ijzer: 4.6, zink: 3.3,
    foliumzuur: 240, vitamine_e: 8.3, vezels: 8.5, eiwit: 25.8,
  }),
  item("pindakaas", "Pindakaas", "noten", "30 g · 2 el", 30, {
    magnesium: 154, kalium: 649, calcium: 43, ijzer: 1.9, zink: 2.5,
    vitamine_e: 9.1, vezels: 6, eiwit: 25,
  }, { noteNl: "Kies 100% pinda: varianten met toegevoegde suiker en palmvet leveren dezelfde mineralen met meer eromheen." }),
  item("zonnebloempitten", "Zonnebloempitten", "noten", "20 g · 2 el", 20, {
    magnesium: 325, kalium: 645, calcium: 78, ijzer: 5.3, zink: 5,
    vitamine_e: 35, foliumzuur: 227, vezels: 8.6, eiwit: 20.8,
  }),
  item("pompoenpitten", "Pompoenpitten", "noten", "20 g · 2 el", 20, {
    magnesium: 592, kalium: 809, calcium: 46, ijzer: 8.8, zink: 7.8,
    vezels: 6, eiwit: 30.2,
  }, { noteNl: "De dichtste magnesiumbron in deze tabel — en met fytaat erbij, dus de opname is lager dan het getal." }),
  item("lijnzaad", "Lijnzaad, gebroken", "noten", "15 g · el", 15, {
    magnesium: 392, kalium: 813, calcium: 255, ijzer: 5.7, zink: 4.3,
    vezels: 27.3, eiwit: 18.3,
  }, { noteNl: ALA }),
  item("chiazaad", "Chiazaad", "noten", "15 g · el", 15, {
    magnesium: 335, kalium: 407, calcium: 631, ijzer: 7.7, zink: 4.6,
    vezels: 34.4, eiwit: 16.5,
  }, { noteNl: ALA }),
  item("tahin", "Tahin (sesampasta)", "noten", "20 g · el", 20, {
    magnesium: 351, kalium: 468, calcium: 426, ijzer: 8.9, zink: 4.6,
    vezels: 9.3, eiwit: 17,
  }),
  item("pistache", "Pistachenoten", "noten", "25 g · handvol", 25, {
    magnesium: 121, kalium: 1025, calcium: 105, ijzer: 3.9, zink: 2.2,
    vitamine_b6: 1.7, vezels: 10.6, eiwit: 20.2,
  }),
];

/** Granen: vezels, magnesium — en via het bakkerszout de jodium in Nederland. */
const GRANEN: readonly Voedingsmiddel[] = [
  item("havermout", "Havermout", "granen", "50 g droog · schaal pap", 50, {
    magnesium: 177, kalium: 429, calcium: 54, ijzer: 4.7, zink: 4,
    foliumzuur: 56, vitamine_b6: 0.1, vezels: 10.6, eiwit: 13.2,
  }, { synoniemen: ["haverpap", "oatmeal", "porridge"] }),
  item("volkorenbrood", "Volkorenbrood", "granen", "70 g · 2 sneetjes", 70, {
    magnesium: 82, kalium: 254, calcium: 107, ijzer: 2.5, zink: 1.8,
    jodium: 90, foliumzuur: 42, vezels: 7, eiwit: 9,
  }, { noteNl: "Brood met bakkerszout is in Nederland de grootste jodiumbron van het bord." }),
  item("wit-brood", "Wit brood", "granen", "70 g · 2 sneetjes", 70, {
    magnesium: 23, kalium: 115, calcium: 150, ijzer: 1.5, zink: 0.7,
    jodium: 85, foliumzuur: 30, vezels: 2.7, eiwit: 8,
  }),
  item("roggebrood", "Roggebrood", "granen", "60 g · 2 plakken", 60, {
    magnesium: 40, kalium: 190, calcium: 30, ijzer: 1.9, zink: 1.4,
    jodium: 80, vezels: 6.5, eiwit: 5.5,
  }),
  item("zilvervliesrijst", "Zilvervliesrijst", "granen", "150 g gekookt", 150, {
    magnesium: 43, kalium: 86, calcium: 10, ijzer: 0.6, zink: 0.6,
    vezels: 1.8, eiwit: 2.6,
  }),
  item("volkoren-pasta", "Volkoren pasta", "granen", "180 g gekookt", 180, {
    magnesium: 30, kalium: 62, calcium: 15, ijzer: 1.1, zink: 1.1,
    vezels: 3.9, eiwit: 5.3,
  }),
  item("quinoa", "Quinoa", "granen", "150 g gekookt", 150, {
    magnesium: 64, kalium: 172, calcium: 17, ijzer: 1.5, zink: 1.1,
    foliumzuur: 42, vezels: 2.8, eiwit: 4.4,
  }),
  item("boekweit", "Boekweit", "granen", "150 g gekookt", 150, {
    magnesium: 51, kalium: 88, calcium: 7, ijzer: 0.8, zink: 0.6,
    vezels: 2.7, eiwit: 3.4,
  }),
  item("muesli", "Muesli, ongezoet", "granen", "50 g", 50, {
    magnesium: 100, kalium: 390, calcium: 60, ijzer: 3.5, zink: 2.2,
    vezels: 7.5, eiwit: 10,
  }),
  item("crackers-volkoren", "Volkoren crackers", "granen", "20 g · 2 stuks", 20, {
    magnesium: 90, kalium: 280, calcium: 40, ijzer: 3, zink: 1.9,
    vezels: 11, eiwit: 10,
  }),
];

/** Vis: EPA/DHA, jodium, selenium en vitamine D — vier stoffen die elders schaars zijn. */
const VIS: readonly Voedingsmiddel[] = [
  item("zalm", "Zalm", "vis", "125 g", 125, {
    magnesium: 29, kalium: 363, calcium: 12, ijzer: 0.3, zink: 0.4,
    selenium: 36, jodium: 14, vitamine_d: 11, vitamine_b12: 3.2,
    omega3: 2200, eiwit: 20.4,
  }, { noteNl: "Wild en gekweekt verschillen fors in vetzuurprofiel en vitamine D — het getal is een middenwaarde." }),
  item("makreel", "Makreel", "vis", "125 g", 125, {
    magnesium: 76, kalium: 314, calcium: 12, ijzer: 1.6, zink: 0.6,
    selenium: 44, vitamine_d: 8.2, vitamine_b12: 8.7, omega3: 2600, eiwit: 18.6,
  }),
  item("haring", "Haring", "vis", "100 g · 1 stuk", 100, {
    magnesium: 32, kalium: 327, calcium: 57, ijzer: 1.1, zink: 1,
    selenium: 36, jodium: 30, vitamine_d: 19, vitamine_b12: 13.7,
    omega3: 2000, eiwit: 18,
  }),
  item("sardines", "Sardines uit blik", "vis", "100 g uitgelekt", 100, {
    magnesium: 39, kalium: 397, calcium: 382, ijzer: 2.9, zink: 1.3,
    selenium: 53, vitamine_d: 4.8, vitamine_b12: 8.9, omega3: 1480, eiwit: 25,
  }, { noteNl: "Met graat: dat is waar het calcium vandaan komt." }),
  item("tonijn-blik", "Tonijn uit blik, op water", "vis", "100 g uitgelekt", 100, {
    magnesium: 27, kalium: 237, calcium: 11, ijzer: 1, zink: 0.7,
    selenium: 65, vitamine_d: 1.7, vitamine_b12: 2.2, omega3: 270, eiwit: 24.9,
  }, { noteNl: "Veel eiwit, weinig EPA/DHA — voor omega-3 is dit niet je vis." }),
  item("kabeljauw", "Kabeljauw", "vis", "125 g", 125, {
    magnesium: 32, kalium: 413, calcium: 16, ijzer: 0.4, zink: 0.5,
    selenium: 33, jodium: 110, vitamine_d: 1, vitamine_b12: 0.9,
    omega3: 200, eiwit: 17.8,
  }, { noteNl: "Magere vis: sterk in jodium en selenium, zwak in omega-3." }),
  item("garnalen", "Garnalen", "vis", "100 g", 100, {
    magnesium: 39, kalium: 264, calcium: 70, ijzer: 0.5, zink: 1.3,
    selenium: 38, jodium: 40, vitamine_b12: 1.1, omega3: 300, eiwit: 20.1,
  }),
  item("mosselen", "Mosselen", "vis", "150 g", 150, {
    magnesium: 34, kalium: 320, calcium: 26, ijzer: 4, zink: 1.6,
    selenium: 45, jodium: 130, vitamine_b12: 12, omega3: 440, eiwit: 11.9,
  }),
  item("forel", "Forel", "vis", "125 g", 125, {
    magnesium: 31, kalium: 361, calcium: 43, ijzer: 0.3, zink: 0.7,
    selenium: 12.6, vitamine_d: 13.6, vitamine_b12: 4.5, omega3: 1000, eiwit: 20.8,
  }),
  item("ansjovis", "Ansjovis", "vis", "30 g", 30, {
    magnesium: 41, kalium: 383, calcium: 232, ijzer: 3.3, zink: 1.7,
    selenium: 68, vitamine_d: 1.7, vitamine_b12: 0.9, omega3: 2100, eiwit: 28.9,
  }),
];

/** Vlees: zink, ijzer, B12 en selenium in een vorm die het lichaam goed opneemt. */
const VLEES: readonly Voedingsmiddel[] = [
  item("kipfilet", "Kipfilet", "vlees", "100 g", 100, {
    magnesium: 29, kalium: 334, calcium: 5, ijzer: 0.4, zink: 0.8,
    selenium: 22, vitamine_b6: 0.6, vitamine_b12: 0.3, eiwit: 23.3,
  }),
  item("rundvlees-mager", "Rundvlees, mager", "vlees", "100 g", 100, {
    magnesium: 21, kalium: 330, calcium: 5, ijzer: 2.1, zink: 4.5,
    selenium: 17, vitamine_b12: 2.1, eiwit: 22.6,
  }, { noteNl: "Heemijzer uit vlees wordt beter opgenomen dan het ijzer uit planten." }),
  item("varkenshaas", "Varkenshaas", "vlees", "100 g", 100, {
    magnesium: 24, kalium: 399, calcium: 5, ijzer: 0.9, zink: 1.9,
    selenium: 30, vitamine_b6: 0.7, vitamine_b12: 0.5, eiwit: 21.1,
  }),
  item("rundergehakt", "Rundergehakt", "vlees", "100 g", 100, {
    magnesium: 19, kalium: 270, calcium: 12, ijzer: 2.2, zink: 4.2,
    selenium: 15, vitamine_b12: 2.2, eiwit: 18.6,
  }),
  item("runderlever", "Runderlever", "vlees", "80 g", 80, {
    magnesium: 18, kalium: 313, calcium: 5, ijzer: 4.9, zink: 4,
    selenium: 40, vitamine_a: 4970, vitamine_b12: 59.3, foliumzuur: 290, eiwit: 20.4,
  }, { noteNl: "Extreem rijk aan vitamine A — daarom niet wekelijks, en niet tijdens een zwangerschap." }),
  item("kalkoenfilet", "Kalkoenfilet", "vlees", "100 g", 100, {
    magnesium: 28, kalium: 302, calcium: 12, ijzer: 0.7, zink: 1.7,
    selenium: 25, vitamine_b6: 0.7, vitamine_b12: 1, eiwit: 24,
  }),
  item("lamsvlees", "Lamsvlees", "vlees", "100 g", 100, {
    magnesium: 23, kalium: 310, calcium: 9, ijzer: 1.8, zink: 3.4,
    selenium: 18, vitamine_b12: 2.6, eiwit: 20.3,
  }),
  item("kipdrumstick", "Kippenpoot met vel", "vlees", "120 g", 120, {
    magnesium: 21, kalium: 240, calcium: 11, ijzer: 1.1, zink: 1.9,
    selenium: 17, vitamine_b12: 0.4, eiwit: 18.4,
  }),
];

const EIEREN: readonly Voedingsmiddel[] = [
  item("ei", "Ei", "eieren", "55 g · 1 stuk", 55, {
    magnesium: 12, kalium: 138, calcium: 56, ijzer: 1.8, zink: 1.3,
    selenium: 30, jodium: 20, vitamine_a: 160, vitamine_d: 2,
    vitamine_b12: 1.1, foliumzuur: 47, eiwit: 12.6,
  }, { noteNl: "Vrijwel alle micronutriënten van een ei zitten in de dooier." }),
];

/** Zuivel: calcium, jodium en B12 — en bij magere varianten veel eiwit per portie. */
const ZUIVEL: readonly Voedingsmiddel[] = [
  item("melk-halfvol", "Halfvolle melk", "zuivel", "200 ml · glas", 200, {
    magnesium: 11, kalium: 150, calcium: 120, zink: 0.4, jodium: 15,
    vitamine_a: 20, vitamine_b12: 0.4, eiwit: 3.5,
  }),
  item("magere-kwark", "Magere kwark", "zuivel", "150 g · schaal", 150, {
    magnesium: 11, kalium: 130, calcium: 85, zink: 0.5, jodium: 15,
    vitamine_b12: 0.6, eiwit: 10.5,
  }),
  item("skyr", "Skyr", "zuivel", "150 g · bakje", 150, {
    magnesium: 11, kalium: 150, calcium: 120, zink: 0.5,
    vitamine_b12: 0.5, eiwit: 11,
  }),
  item("yoghurt-naturel", "Yoghurt, naturel", "zuivel", "150 g · schaal", 150, {
    magnesium: 12, kalium: 155, calcium: 120, zink: 0.5, jodium: 15,
    vitamine_b12: 0.4, eiwit: 3.8,
  }),
  item("griekse-yoghurt", "Griekse yoghurt 0%", "zuivel", "150 g · schaal", 150, {
    magnesium: 11, kalium: 141, calcium: 110, zink: 0.5,
    vitamine_b12: 0.5, eiwit: 10,
  }),
  item("kaas-48", "Goudse kaas 48+", "zuivel", "40 g · 2 plakken", 40, {
    magnesium: 28, kalium: 100, calcium: 810, ijzer: 0.2, zink: 3.9,
    jodium: 30, vitamine_a: 280, vitamine_b12: 1.5, eiwit: 25,
  }),
  item("huttenkase", "Hüttenkäse", "zuivel", "100 g", 100, {
    magnesium: 8, kalium: 104, calcium: 83, zink: 0.4,
    vitamine_b12: 0.4, eiwit: 11.1,
  }),
  item("karnemelk", "Karnemelk", "zuivel", "200 ml · glas", 200, {
    magnesium: 10, kalium: 140, calcium: 115, zink: 0.4,
    vitamine_b12: 0.3, eiwit: 3.4,
  }),
  item("sojadrink-verrijkt", "Sojadrink, verrijkt", "zuivel", "200 ml · glas", 200, {
    magnesium: 25, kalium: 120, calcium: 120, ijzer: 0.4, zink: 0.3,
    vitamine_d: 0.75, vitamine_b12: 0.4, eiwit: 3.3,
  }, { noteNl: "Alleen de verrijkte varianten leveren calcium, B12 en vitamine D; de onverrijkte niet." }),
  item("mozzarella", "Mozzarella", "zuivel", "50 g", 50, {
    magnesium: 20, kalium: 76, calcium: 505, zink: 2.9,
    vitamine_a: 179, vitamine_b12: 2.3, eiwit: 22,
  }),
];

/** Zetmeel: het volume op het bord, met kalium en vitamine C uit de aardappel. */
const ZETMEEL: readonly Voedingsmiddel[] = [
  item("aardappel", "Aardappelen, gekookt", "zetmeel", "200 g · 3 stuks", 200, {
    magnesium: 20, kalium: 407, calcium: 5, ijzer: 0.3, vitamine_c: 13,
    vitamine_b6: 0.3, vezels: 1.8, eiwit: 2,
  }, { noteNl: "Onderschatte kaliumbron: een normale portie levert meer dan een banaan." }),
  item("zoete-aardappel", "Zoete aardappel", "zetmeel", "200 g", 200, {
    magnesium: 25, kalium: 337, calcium: 30, ijzer: 0.6, vitamine_c: 2.4,
    vitamine_a: 709, vitamine_b6: 0.2, vezels: 3, eiwit: 1.6,
  }),
  item("witte-rijst", "Witte rijst", "zetmeel", "150 g gekookt", 150, {
    magnesium: 12, kalium: 35, calcium: 10, ijzer: 0.2, zink: 0.5,
    vezels: 0.4, eiwit: 2.7,
  }),
  item("pasta-wit", "Pasta, wit", "zetmeel", "180 g gekookt", 180, {
    magnesium: 18, kalium: 44, calcium: 7, ijzer: 0.5, zink: 0.5,
    vezels: 1.8, eiwit: 5.8,
  }),
  item("couscous", "Couscous", "zetmeel", "150 g gekookt", 150, {
    magnesium: 8, kalium: 58, calcium: 8, ijzer: 0.4, zink: 0.3,
    vezels: 1.4, eiwit: 3.8,
  }),
  item("friet", "Friet", "zetmeel", "150 g", 150, {
    magnesium: 22, kalium: 570, ijzer: 0.7, vitamine_c: 8,
    vezels: 3.2, eiwit: 3.4,
  }),
];

/** Vetten: vooral vitamine E en K, en bij margarine de toegevoegde vitamine D. */
const VETTEN: readonly Voedingsmiddel[] = [
  item("olijfolie", "Olijfolie", "vetten", "10 g · el", 10, {
    vitamine_e: 14.4, vitamine_k: 60,
  }),
  item("roomboter", "Roomboter", "vetten", "10 g", 10, {
    vitamine_a: 684, vitamine_d: 1.5, vitamine_e: 2.3,
  }),
  item("margarine", "Margarine, verrijkt", "vetten", "10 g", 10, {
    vitamine_a: 800, vitamine_d: 7.5, vitamine_e: 15,
  }, { noteNl: "In Nederland wordt vitamine A en D aan margarine toegevoegd; roomboter heeft dat niet." }),
  item("koolzaadolie", "Koolzaadolie", "vetten", "10 g · el", 10, {
    vitamine_e: 17.5, vitamine_k: 71,
  }, { noteNl: ALA }),
  item("kokosolie", "Kokosolie", "vetten", "10 g · el", 10, {
    vitamine_e: 0.1,
  }),
];

/** Dranken: klein qua gehalte, groot qua frequentie — daarom staan ze erin. */
const DRANKEN: readonly Voedingsmiddel[] = [
  item("koffie", "Koffie, zwart", "dranken", "125 ml · kop", 125, {
    magnesium: 3, kalium: 49,
  }, { noteNl: "Koffie bij de maaltijd remt de opname van ijzer uit planten; een uur ertussen lost dat op." }),
  item("groene-thee", "Groene thee", "dranken", "200 ml · kop", 200, {
    magnesium: 1, kalium: 8,
  }),
  item("sinaasappelsap", "Sinaasappelsap", "dranken", "200 ml · glas", 200, {
    magnesium: 11, kalium: 200, calcium: 11, vitamine_c: 50,
    foliumzuur: 30, vezels: 0.2,
  }, { noteNl: "Dezelfde vitamine C als de vrucht, zonder de vezels — en sneller gedronken dan gegeten." }),
  item("bier", "Bier", "dranken", "250 ml · glas", 250, {
    magnesium: 6, kalium: 27,
  }, { noteNl: "Alcohol remt het herstel en de slaapdiepte; wat er aan mineralen in zit weegt daar niet tegenop." }),
  item("frisdrank", "Frisdrank", "dranken", "250 ml · glas", 250, {}),
];

/** Suiker & bewerkt: staan erin omdat je ze eet, niet omdat ze iets leveren. */
const SUIKER_BEWERKT: readonly Voedingsmiddel[] = [
  item("pure-chocolade", "Pure chocolade 85%", "suiker", "20 g · 2 blokjes", 20, {
    magnesium: 228, kalium: 715, ijzer: 11.9, zink: 3.3, vezels: 10.9, eiwit: 7.8,
  }, { noteNl: "Werkelijk een magnesiumbron — maar de portie is klein, en de rest is vet en suiker." }),
  item("melkchocolade", "Melkchocolade", "suiker", "25 g", 25, {
    magnesium: 63, kalium: 372, calcium: 189, ijzer: 2.4, zink: 2.3,
    vezels: 3.4, eiwit: 7.6,
  }),
  item("chips", "Chips", "suiker", "30 g · handvol", 30, {
    magnesium: 60, kalium: 1200, ijzer: 1.5, vitamine_c: 20, vezels: 4.4, eiwit: 6.6,
  }),
  item("koek", "Koek", "suiker", "25 g · 1 stuk", 25, {
    magnesium: 15, kalium: 90, calcium: 30, ijzer: 1, vezels: 1.5, eiwit: 5,
  }),
  item("pizza", "Pizza", "suiker", "150 g · halve", 150, {
    magnesium: 25, kalium: 180, calcium: 190, ijzer: 2, zink: 1.5,
    jodium: 15, vezels: 2.3, eiwit: 11,
  }),
  item("ijs", "Roomijs", "suiker", "75 g · bolletje", 75, {
    magnesium: 14, kalium: 199, calcium: 128, vitamine_a: 118,
    vitamine_b12: 0.4, eiwit: 3.5,
  }),
];

/**
 * Alle voedingsmiddelen, in de volgorde waarin het overzicht ze toont.
 *
 * Eén platte lijst en geen map per groep: de zoeker leest hem lineair, de
 * groepering gebeurt bij weergave (`voedingsmiddelenPerGroep`). Een map zou de
 * volgorde binnen een groep laten afhangen van de sleutelvolgorde, en die is
 * geen ontwerpbeslissing.
 */
export const VOEDINGSMIDDELEN: readonly Voedingsmiddel[] = [
  ...GROENTE,
  ...FRUIT,
  ...PEULVRUCHTEN,
  ...NOTEN,
  ...GRANEN,
  ...VIS,
  ...VLEES,
  ...EIEREN,
  ...ZUIVEL,
  ...ZETMEEL,
  ...VETTEN,
  ...DRANKEN,
  ...SUIKER_BEWERKT,
];

const BY_KEY = new Map<string, Voedingsmiddel>(
  VOEDINGSMIDDELEN.map((product) => [product.key, product]),
);

export function getVoedingsmiddel(key: string): Voedingsmiddel | undefined {
  return BY_KEY.get(key);
}

export function isVoedingsmiddelKey(value: string): boolean {
  return BY_KEY.has(value);
}
