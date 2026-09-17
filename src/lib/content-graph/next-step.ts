import { CONTENT_CHECKS, type ContentCheckId } from "@/data/content-graph/checks";
import { INTAKE_DOMAINS_LABEL } from "@/lib/intake-facts";
import { metadataForNode } from "@/data/content-graph/node-metadata";
import { nutrientRoute } from "@/data/nutrition/nutrient-routes";
import type { ContentMetadata } from "@/data/insight-metadata";
import type { GraphNode } from "@/lib/content-graph/node";
import {
  resolveCheck,
  resolveSecondaryCheck,
} from "@/lib/content-graph/resolve-check";

/**
 * De vervolgstap onder een contentpagina: wat is hier de logische volgende zet?
 *
 * ## Waarom dit één blok is en geen vier
 *
 * Onder een artikel stonden tot vier CTA-blokken onder elkaar — `BlogIntakeCTA`,
 * `BlogSupplementCTA`, `BlogCornerstoneLink` en `BlogSupplementenHubLink` —
 * allemaal handmatig per artikel gevuld, allemaal tegelijk gerenderd. Vier
 * keuzes naast elkaar is geen keuze; het is ruis waar een lezer doorheen scrolt.
 *
 * Deze module kiest er één, met één regel eronder. De onderliggende velden
 * blijven bestaan en blijven gevuld: dit is een presentatiebeslissing, geen
 * datamigratie, en hij staat achter een vlag.
 *
 * ## De volgorde die hier hard in zit
 *
 * De primaire stap is nooit een `/beste/`-pad zolang iemand niets gemeten
 * heeft. Dat is de volgorde *begrijpen → controleren → verbeteren → aanvullen →
 * vergelijken*, en het is een invariant met een test, geen richtlijn. De
 * vergelijking blijft altijd bereikbaar via de bestaande links in de tekst —
 * de monetisatie blijft intact, ze staat alleen niet vóór de meting.
 *
 * Uitzondering: `/beste/*` en `/product/*` zelf. Daar ís vergelijken de pagina.
 */

export type NextStepKind = "check";

export interface NextStepAction {
  kind: NextStepKind;
  href: string;
  /** De tekst op de knop of de link. */
  label: string;
  /** Eén zin die zegt waaróm dit de volgende stap is. */
  reasonNl: string;
  /** Machineleesbaar doel, voor de events. */
  target: string;
}

export interface NextStep {
  primary: NextStepAction;
  secondary: NextStepAction | null;
}

/**
 * De belofte die de voedingscheck per stof waar kan maken.
 *
 * `nutrient-routes.ts` gradeert hoe hard de drempel is: `populatierichtlijn`
 * (gepubliceerde norm), `vuistregel` (de onze, herleidbaar) of `proxy` (de
 * vraag meet de stof niet).
 *
 * Magnesium en zink staan op `proxy`, en magnesium is het grootste cluster van
 * de site. Daar "kijk of je een tekort hebt" zeggen claimt een precisie die het
 * instrument niet heeft: `intake-reference.ts` geeft magnesium vertrouwen 1 van
 * 4, omdat de band uit een groente-en-fruit-telling komt terwijl noten,
 * volkoren en peulvruchten de sterkere bronnen zijn.
 *
 * Wat een proxy-route wél mag zeggen: liggen de bronnen op je bord.
 */
function voedingReason(meta: ContentMetadata): string {
  const nutrients = meta.nutrients ?? [];
  if (nutrients.length === 0) {
    return "Kijk in een minuut wat je voeding hierin al doet.";
  }

  const heeftProxy = nutrients.some(
    (nutrient) => nutrientRoute(nutrient).thresholdKind === "proxy",
  );

  return heeftProxy
    ? "Kijk in een minuut of de bronnen waar dit in zit op je bord liggen."
    : "Kijk in een minuut of je hieraan komt uit je eten.";
}

const CHECK_REASON: Record<Exclude<ContentCheckId, "voeding">, string> = {
  // Het aantal domeinen komt uit `intake-facts.ts` en niet uit deze zin: de
  // check meet er vijf zichtbare (verbinding staat in VERBORGEN_DOMEINEN), en
  // een bestaande invariant-test bewaakt dat geen enkele copy er een ander
  // getal van maakt.
  leefstijl: `Zie in drie minuten waar je staat op ${INTAKE_DOMAINS_LABEL} — en wat er bij jou het eerst toe doet.`,
  slaap: "Meet in een minuut waar je nacht nu staat.",
  stress: "Kijk in een minuut hoe je spanning zich opbouwt.",
  beweging: "Meet in een minuut wat je week aan beweging doet.",
};

function checkAction(id: ContentCheckId, meta: ContentMetadata): NextStepAction {
  const check = CONTENT_CHECKS[id];
  return {
    kind: "check",
    href: check.href,
    label: `Doe de ${check.label} (${check.duurLabel})`,
    reasonNl: id === "voeding" ? voedingReason(meta) : CHECK_REASON[id],
    target: id,
  };
}

/** De vervolgstap voor een stuk content, op basis van zijn metadata. */
export function nextStepForMetadata(meta: ContentMetadata): NextStep {
  const secondary = resolveSecondaryCheck(meta);
  return {
    primary: checkAction(resolveCheck(meta), meta),
    secondary: secondary ? checkAction(secondary, meta) : null,
  };
}

export function resolveNextStep(node: GraphNode): NextStep {
  return nextStepForMetadata(metadataForNode(node));
}
