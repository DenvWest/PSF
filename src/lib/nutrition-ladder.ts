import {
  NUTRITION_CLUSTERS,
  type NutritionClusterId,
} from "@/data/nutrition/lifestyle-pyramid";
import {
  nutritionSliderQuestion,
  type SliderQuestion,
} from "@/data/nutrition/lifescore-questions";
import { getSkipReason } from "@/lib/nutrition-diet-skip";
import type { LadderEvidenceRow, LadderEvidenceStatus } from "@/lib/domain-ladder-readout";
import type { LeefstijlLayerState } from "@/lib/leefstijl-ladder";

/**
 * Wat de voedingscheck over je eetbasis-ladder zegt.
 *
 * Voeding had als enige domein met een echte meting geen readout: de elf
 * sliders voedden wel de vijf nutriëntbanden op het dashboard, maar de zes
 * lagen van `NUTRITION_PRIORITY_LAYERS` stonden er zonder oordeel bij. De
 * clusters uit `lifestyle-pyramid.ts` (C1-C5, met hun `sliderIds` en `layer`)
 * beschreven die koppeling al — ze werden alleen nooit uitgelezen.
 *
 * Dit bestand is die uitlezing, en het is voor voeding wat `movement-ladder.ts`
 * voor beweging is: van ruwe antwoorden naar feitenrijen per laag, en van
 * feitenrijen naar winst/ok/watch/wacht.
 *
 * Drie regels uit BESLUIT_VOEDING_PIRAMIDE_V1 §D die hier hard in zitten:
 *
 * 1. **Plant-equivalentie (§D3).** `vegetables`, `fruit` en `berries` meten
 *    alle drie een deel van dezelfde ≥400 g. Drie losse `below`-rijen tonen
 *    drie gaten waar er één is, dus ze worden één samengestelde rij.
 * 2. **Opt-out is geen nul (§H, wijziging 4).** Wie geen vis eet krijgt op de
 *    visrij nooit `below` — dat is niet zijn meetlat. In `raw_inputs` staat
 *    een opt-out als slider 0, ononderscheidbaar van "wel, maar nooit"; de
 *    `preference` en `allergies` die er óók in staan maken hem alsnog
 *    afleidbaar. Zie {@link resolveNutritionOptOut}.
 * 3. **Geen norm is geen oordeel.** Rijen zonder `benchmarkKind` krijgen
 *    status `own`: jouw antwoord ís het ijkpunt. Nooit een badge die
 *    suggereert dat er een grens was die je miste.
 */

export type NutritionLadderLayerId = 1 | 2 | 3 | 4 | 5 | 6;

/** Slider-indices uit `raw_inputs.sliders`, plus de dieetcontext ernaast. */
export type NutritionLadderReport = {
  sliders: Record<string, number>;
  preference: string;
  allergies: string[];
};

/**
 * De laag waarop een cluster zijn feiten aflevert.
 *
 * Dit wijkt bewust af van `NutritionCluster.layer` voor C3. Die staat in de
 * data op 3 ("Verhoudingen"), en dat klopt voor de *naam* van het cluster —
 * eiwit per maaltijd is een verhouding. Maar §D2 van het besluit legt de
 * dragende eiwitrijen op laag 1: een eiwitbron die er niet is, is een gat in
 * je eetbasis, niet in je finetuning. De splitsing loopt daarom per rij en
 * niet per cluster, en staat hier zodat er één plek is waar hij te lezen is.
 */
const ROW_LAYER: Record<string, NutritionLadderLayerId> = {
  plantbasis: 1,
  eiwitbronnen: 1,
  vezelbasis: 2,
  visbron: 2,
  minderen: 2,
  eiwitritme: 3,
};

/** Volgorde binnen een laag: wat het zwaarst weegt staat boven. */
const ROW_ORDER = [
  "plantbasis",
  "eiwitbronnen",
  "vezelbasis",
  "visbron",
  "minderen",
  "eiwitritme",
] as const;

export type NutritionFactRowKey = (typeof ROW_ORDER)[number];

/** Waarom een rij geen meetlat heeft. Bepaalt de copy, niet de status. */
export type NutritionRowExemption = "geen-norm" | "opt-out" | "niet-gemeten";

export type NutritionFactRow = LadderEvidenceRow & {
  key: NutritionFactRowKey;
  layer: NutritionLadderLayerId;
  cluster: NutritionClusterId;
  exemption: NutritionRowExemption | null;
};

function stopLabel(question: SliderQuestion | undefined, index: number | undefined): string | null {
  if (!question || index === undefined || !Number.isFinite(index)) {
    return null;
  }
  const clamped = Math.min(Math.max(Math.trunc(index), 0), question.stops.length - 1);
  return question.stops[clamped]?.label ?? null;
}

function sliderIndex(report: NutritionLadderReport, id: string): number | undefined {
  const value = report.sliders[id];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

/**
 * Eet hij deze bron helemaal niet, of eet hij hem alleen zelden?
 *
 * Een 0 op `oilyFish` betekent twee heel verschillende dingen, en het verschil
 * bepaalt of we een richtlijn naast zijn antwoord mogen leggen. De opslag kent
 * het onderscheid niet, maar `preference` en `allergies` staan wél in dezelfde
 * `raw_inputs` — en die dragen precies de gevallen waarin de check de slider
 * zelf op 0 zette (zie `syncDietContext`). Een handmatig aangevinkte opt-out
 * zonder dieetreden blijft onzichtbaar; die leest als "nooit", en dat is de
 * eerlijkste van de twee fouten die we hier kunnen maken.
 */
export function resolveNutritionOptOut(
  sliderId: "oilyFish" | "meatLegumes" | "dairy" | "nutsSeedsLegumes" | "wholegrain",
  report: NutritionLadderReport,
): boolean {
  const ctx = { preference: report.preference, allergies: report.allergies };

  if (sliderId === "oilyFish") {
    // Vegetarisch en veganistisch eten sluit vis uit; de check stelt de vraag
    // dan nog wel, maar het antwoord kan nooit een tekort betekenen.
    if (ctx.preference === "vegetarian" || ctx.preference === "vegan") return true;
    return getSkipReason("oilyFish", ctx) !== null;
  }
  if (sliderId === "meatLegumes") {
    return ctx.preference === "vegan";
  }
  if (sliderId === "dairy" || sliderId === "nutsSeedsLegumes" || sliderId === "wholegrain") {
    return getSkipReason(sliderId, ctx) !== null;
  }
  return false;
}

/**
 * Plantporties per dag (§D3): groente telt vol, fruit telt vol, bessen tellen
 * mee als variatie en zijn daarom gekapt op 1. De frequentieschaal wordt
 * omgerekend naar een dagequivalent — een weekfrequentie deelt door zeven, de
 * twee dagstops tellen als 1 en 2.
 */
const FREQUENCY_PER_DAY = [0, 1 / 30, 1 / 7, 2 / 7, 3.5 / 7, 5.5 / 7, 1, 2];

function frequencyPerDay(index: number | undefined): number {
  if (index === undefined) return 0;
  const clamped = Math.min(Math.max(Math.trunc(index), 0), FREQUENCY_PER_DAY.length - 1);
  return FREQUENCY_PER_DAY[clamped];
}

export function resolvePlantPortionsPerDay(report: NutritionLadderReport): number | null {
  const vegetables = sliderIndex(report, "vegetables");
  if (vegetables === undefined) {
    return null;
  }
  const fruit = frequencyPerDay(sliderIndex(report, "fruit"));
  const berries = Math.min(frequencyPerDay(sliderIndex(report, "berries")), 1);
  return Math.min(Math.max(Math.trunc(vegetables), 0), 4) + fruit + berries;
}

function joinAnswers(parts: (string | null)[]): string {
  return parts.filter((part): part is string => Boolean(part)).join(" · ");
}

type RowSpec = {
  key: NutritionFactRowKey;
  cluster: NutritionClusterId;
  label: string;
  whyLine: string;
  build: (report: NutritionLadderReport) => {
    answerLabel: string;
    status: LadderEvidenceStatus;
    exemption: NutritionRowExemption | null;
    benchmarkLabel?: string | null;
    benchmarkSource?: string | null;
    footnote?: string | null;
  } | null;
};

/** Benchmarkregels komen uit de vraag zelf — één bron, geen tweede formulering. */
function benchmarkOf(sliderId: string): { label: string | null; source: string | null } {
  const help = nutritionSliderQuestion(sliderId)?.help;
  if (!help || help.benchmarkKind === null) {
    return { label: null, source: null };
  }
  return { label: help.benchmarkLabel, source: help.source };
}

const ROW_SPECS: readonly RowSpec[] = [
  {
    key: "plantbasis",
    cluster: "C4",
    label: "Plantbasis",
    whyLine: "Vezels, kalium en magnesium komen hier in één keer vandaan.",
    build: (report) => {
      const portions = resolvePlantPortionsPerDay(report);
      if (portions === null) return null;
      const answerLabel = joinAnswers([
        stopLabel(nutritionSliderQuestion("vegetables"), sliderIndex(report, "vegetables")),
        stopLabel(nutritionSliderQuestion("fruit"), sliderIndex(report, "fruit")),
        stopLabel(nutritionSliderQuestion("berries"), sliderIndex(report, "berries")),
      ]);
      const benchmark = benchmarkOf("vegetables");
      return {
        answerLabel,
        // WHO ≥400 g ≈ vier porties van ~100 g.
        status: portions >= 4 ? "meets" : portions >= 2 ? "near" : "below",
        exemption: null,
        benchmarkLabel: benchmark.label,
        benchmarkSource: benchmark.source,
        footnote: "Groente, fruit en bessen tellen samen — de richtlijn telt ze ook op.",
      };
    },
  },
  {
    key: "eiwitbronnen",
    cluster: "C3",
    label: "Eiwitbronnen",
    whyLine: "De dragende eiwit- en zinkbronnen in de meeste eetpatronen.",
    build: (report) => {
      const parts = (["meatLegumes", "dairy", "nutsSeedsLegumes"] as const)
        .filter((id) => !resolveNutritionOptOut(id, report))
        .map((id) => stopLabel(nutritionSliderQuestion(id), sliderIndex(report, id)));
      const answerLabel = joinAnswers(parts);
      if (!answerLabel) {
        return {
          answerLabel: "Geen van deze bronnen",
          status: "own",
          exemption: "opt-out",
        };
      }
      // Geen van deze drie vragen heeft een norm — dit is zijn eigen ijkpunt.
      return { answerLabel, status: "own", exemption: "geen-norm" };
    },
  },
  {
    key: "vezelbasis",
    cluster: "C4",
    label: "Vezelbasis",
    whyLine: "De grootste vezelknop in een Nederlands eetpatroon.",
    build: (report) => {
      if (resolveNutritionOptOut("wholegrain", report)) {
        return {
          answerLabel: "Je eet geen granen met gluten",
          status: "own",
          exemption: "opt-out",
        };
      }
      const index = sliderIndex(report, "wholegrain");
      const answerLabel = stopLabel(nutritionSliderQuestion("wholegrain"), index);
      if (index === undefined || !answerLabel) return null;
      const benchmark = benchmarkOf("wholegrain");
      return {
        answerLabel,
        // 0-25% below · 50% near · 75-100% meets.
        status: index >= 3 ? "meets" : index === 2 ? "near" : "below",
        exemption: null,
        benchmarkLabel: benchmark.label,
        benchmarkSource: benchmark.source,
      };
    },
  },
  {
    key: "visbron",
    cluster: "C3",
    label: "Visbron",
    whyLine: "De enige gewone voedingsbron van EPA en DHA.",
    build: (report) => {
      if (resolveNutritionOptOut("oilyFish", report)) {
        return {
          answerLabel: "Je eet geen vis",
          status: "own",
          exemption: "opt-out",
          footnote: "Dan is dit niet jouw meetlat — je omega-3 loopt via een andere route.",
        };
      }
      const index = sliderIndex(report, "oilyFish");
      const answerLabel = stopLabel(nutritionSliderQuestion("oilyFish"), index);
      if (index === undefined || !answerLabel) return null;
      const benchmark = benchmarkOf("oilyFish");
      return {
        answerLabel,
        status: index >= 1 ? "meets" : "below",
        exemption: null,
        benchmarkLabel: benchmark.label,
        benchmarkSource: benchmark.source,
      };
    },
  },
  {
    key: "minderen",
    cluster: "C5",
    label: "Wat je mindert",
    whyLine: "Frequentie voorspelt hier meer dan hoeveelheid per keer.",
    build: (report) => {
      const index = sliderIndex(report, "sugaryDrinks");
      const answerLabel = stopLabel(nutritionSliderQuestion("sugaryDrinks"), index);
      if (index === undefined || !answerLabel) return null;
      const benchmark = benchmarkOf("sugaryDrinks");
      return {
        answerLabel,
        // Nooit t/m 1×/wk meets · 2×/wk t/m 3-4×/wk near · daarboven below.
        status: index <= 2 ? "meets" : index <= 4 ? "near" : "below",
        exemption: null,
        benchmarkLabel: benchmark.label,
        benchmarkSource: benchmark.source,
      };
    },
  },
  {
    key: "eiwitritme",
    cluster: "C3",
    label: "Eiwitritme",
    whyLine: "Verdeling over de dag doet boven de veertig meer dan het totaal.",
    build: (report) => {
      const index = sliderIndex(report, "proteinMeals");
      const answerLabel = stopLabel(nutritionSliderQuestion("proteinMeals"), index);
      if (index === undefined || !answerLabel) return null;
      const benchmark = benchmarkOf("proteinMeals");
      return {
        answerLabel,
        status: index >= 3 ? "meets" : index === 2 ? "near" : "below",
        exemption: null,
        benchmarkLabel: benchmark.label,
        benchmarkSource: benchmark.source,
      };
    },
  },
];

export function buildNutritionFactRows(report: NutritionLadderReport): NutritionFactRow[] {
  const rows: NutritionFactRow[] = [];
  for (const key of ROW_ORDER) {
    const spec = ROW_SPECS.find((entry) => entry.key === key);
    if (!spec) continue;
    const built = spec.build(report);
    if (!built) continue;
    rows.push({
      key: spec.key,
      label: spec.label,
      layer: ROW_LAYER[spec.key],
      cluster: spec.cluster,
      whyLine: spec.whyLine,
      answerLabel: built.answerLabel,
      status: built.status,
      exemption: built.exemption,
      ...(built.benchmarkLabel ? { benchmarkLabel: built.benchmarkLabel } : {}),
      ...(built.benchmarkSource ? { benchmarkSource: built.benchmarkSource } : {}),
      ...(built.footnote ? { footnote: built.footnote } : {}),
    });
  }
  return rows;
}

export function nutritionRowsForLayer(
  layer: NutritionLadderLayerId,
  rows: readonly NutritionFactRow[],
): NutritionFactRow[] {
  return rows.filter((row) => row.layer === layer);
}

/**
 * De laag waar de winst zit: de laagste laag met een rij onder zijn richtlijn.
 *
 * "Laagst" is hier letterlijk de noordster — eerst structureel goed eten, dan
 * pas perfect eten. Staat er nergens een `below`, dan valt hij terug op de
 * laagste laag met een `near`: nog geen gat, wel de eerstvolgende winst. Staat
 * alles, dan is er geen winst-laag en zegt het scherm dat ook.
 */
export function resolveNutritionFocusLayer(
  rows: readonly NutritionFactRow[],
): NutritionLadderLayerId | null {
  for (const status of ["below", "near"] as const) {
    const match = rows
      .filter((row) => row.status === status)
      .sort((a, b) => a.layer - b.layer)[0];
    if (match) return match.layer;
  }
  return null;
}

/**
 * Laag 4 (Op jouw situatie) is read-only en laag 5 (Meten & timing) is bewust
 * dicht — die krijgen nooit een oordeel. Laag 6 volgt de poort en niet de
 * meting; zie {@link resolveNutritionGate}.
 */
export function resolveNutritionLayerStates(
  rows: readonly NutritionFactRow[],
): Record<NutritionLadderLayerId, LeefstijlLayerState> {
  const focus = resolveNutritionFocusLayer(rows);
  const states = {} as Record<NutritionLadderLayerId, LeefstijlLayerState>;

  for (let id = 1 as NutritionLadderLayerId; id <= 6; id = (id + 1) as NutritionLadderLayerId) {
    if (id === focus) {
      states[id] = "winst";
      continue;
    }
    if (id >= 4) {
      states[id] = "wacht";
      continue;
    }
    const layerRows = nutritionRowsForLayer(id, rows);
    const judged = layerRows.filter((row) => row.status !== "own");
    if (judged.length === 0) {
      states[id] = "wacht";
      continue;
    }
    if (judged.some((row) => row.status === "below")) {
      // Onder de winst-laag telt een gat nog mee; erboven kan het wachten.
      states[id] = focus != null && id < focus ? "watch" : "wacht";
      continue;
    }
    if (judged.some((row) => row.status === "near")) {
      states[id] = "watch";
      continue;
    }
    states[id] = "ok";
  }

  return states;
}

export const NUTRITION_LAYER_STATE_LABEL: Record<LeefstijlLayerState, string> = {
  winst: "Grootste winst",
  ok: "Op orde",
  watch: "Houd in de gaten",
  wacht: "Nog niet nu",
};

const WHY_WAIT: Partial<Record<NutritionLadderLayerId, string>> = {
  2: "Kwaliteit kiezen loont pas als je eetbasis staat.",
  3: "Verhoudingen finetunen heeft geen zin zolang er nog een bron ontbreekt.",
  4: "Je situatie kleurt je stappen, hij verandert je volgorde niet.",
  5: "Tellen en timen zijn gereedschappen, geen fundament. We openen dit niet eerder.",
  6: "Eerst je tafel, dan het potje.",
};

export function nutritionLayerWhyWait(
  layer: NutritionLadderLayerId,
  focus: NutritionLadderLayerId | null,
): string | null {
  if (focus == null) return null;
  if (layer <= focus) return null;
  return WHY_WAIT[layer] ?? "Deze prioriteit kan wachten tot de laag erboven staat.";
}

/**
 * De poort op laag 6 (§E, derde voorwaarde).
 *
 * Open vereist méér dan "check gedaan en er is een signaal": er mag geen
 * enkele `below` meer openstaan op laag 1. Dat is de enige formulering die
 * "eerst de tafel, dan het potje" letterlijk waarmaakt — de poort gaat pas
 * open als het overgebleven signaal er één is die je bord niet meer dicht kán
 * maken, omdat de rest op zijn richtlijn ligt of omdat een opt-out de
 * voedingsroute afsluit.
 */
export type NutritionGate = {
  open: boolean;
  /** Waarom hij dicht is — leeg wanneer hij open staat. */
  reason: string | null;
};

export function resolveNutritionGate(rows: readonly NutritionFactRow[]): NutritionGate {
  if (rows.length === 0) {
    return { open: false, reason: "Zonder voedingscheck weten we niet of er iets aan te vullen valt." };
  }

  // §E schrijft laag 1 voor, maar de noordster is breder: elk gat dat je mét
  // eten kunt dichten hoort met eten gedicht te worden. Vezels en vis staan op
  // laag 2 en zijn precies zulke gaten — die overslaan zou de poort openen op
  // het moment dat het bord nog werk heeft, en dat is de omkering die de gate
  // moet voorkomen. Laag 3 telt niet mee: een eiwitritme verschuiven is een
  // verdeling, geen ontbrekende bron.
  const eatableGaps = rows.filter((row) => row.layer <= 2 && row.status === "below");
  if (eatableGaps.length > 0) {
    // Eén rij krijgt zijn eigen naam, meerdere een telling: "je vezelbasis,
    // visbron, wat je mindert ligt" leest als een opsomming die zijn werkwoord
    // kwijt is. Bij drie gaten is welk gat het is bovendien niet meer het
    // punt — dat hij eerst zijn bord heeft, is het punt.
    const reason =
      eatableGaps.length === 1
        ? `Je ${eatableGaps[0].label.toLowerCase()} ligt nog onder de richtlijn. Dat dicht je met je bord, niet met een potje.`
        : `${eatableGaps.length} van je antwoorden liggen nog onder hun richtlijn. Die dicht je met je bord, niet met een potje.`;
    return { open: false, reason };
  }

  // Een opt-out is het schoolvoorbeeld van een gat dat het bord niet dicht
  // maakt: wie geen vis eet komt niet aan EPA/DHA hoeveel groente hij ook eet.
  const optOut = rows.some((row) => row.exemption === "opt-out");
  const remaining = rows.some((row) => row.status === "below" || row.status === "near");
  if (!optOut && !remaining) {
    return {
      open: false,
      reason: "Je check laat geen enkel signaal zien dat er iets aan te vullen valt — dan houden we deze dicht.",
    };
  }

  return { open: true, reason: null };
}

/**
 * Hoeveel van de lagen die de check kán beoordelen er staan.
 *
 * Noemer is drie, niet zes: laag 4 tot en met 6 hebben geen meting. Die als
 * "niet voldaan" meetellen zou van ongemeten een tekort maken. Zelfde regel
 * als `resolveMovementLadderCoverage`.
 */
export function resolveNutritionLadderCoverage(rows: readonly NutritionFactRow[]): {
  measured: NutritionLadderLayerId[];
  onOrder: NutritionLadderLayerId[];
  percentage: number | null;
} {
  const measured: NutritionLadderLayerId[] = [];
  const onOrder: NutritionLadderLayerId[] = [];

  for (const id of [1, 2, 3] as const) {
    const judged = nutritionRowsForLayer(id, rows).filter((row) => row.status !== "own");
    if (judged.length === 0) continue;
    measured.push(id);
    if (judged.every((row) => row.status === "meets")) {
      onOrder.push(id);
    }
  }

  return {
    measured,
    onOrder,
    percentage:
      measured.length === 0 ? null : Math.round((onOrder.length / measured.length) * 100),
  };
}

/** De clusters die deze rijenset daadwerkelijk beoordeelt — voor het meetpunt. */
export function nutritionClustersInPlay(
  rows: readonly NutritionFactRow[],
): NutritionClusterId[] {
  const seen = new Set<NutritionClusterId>();
  for (const row of rows) {
    if (NUTRITION_CLUSTERS.some((cluster) => cluster.id === row.cluster)) {
      seen.add(row.cluster);
    }
  }
  return [...seen];
}
