export const PRICE_MAX_AGE_DAYS = 30;
export const DATA_MAX_AGE_DAYS = 90;

export interface GateImage {
  source: string | null;
  license_note: string | null;
}

export interface GateActive {
  amount_per_serving: number | null;
  unit: string | null;
}

export interface GateClaim {
  efsa_claim_id: string;
  meets_condition: boolean;
}

export interface GateOffer {
  active: boolean;
  price_checked_at: string | null;
  affiliate_url?: string | null;
}

export interface GateInput {
  images: GateImage[];
  actives: GateActive[];
  claims: GateClaim[];
  offers: GateOffer[];
  sourceCount: number;
  score: { available: boolean; detail: string };
  today: string;
}

export interface GateCriterion {
  key: "images" | "actives" | "claims" | "offers" | "affiliate" | "sources" | "score";
  label: string;
  ok: boolean;
  detail: string;
}

function daysBetween(fromIso: string, toDay: string): number {
  const from = Date.parse(fromIso.slice(0, 10));
  const to = Date.parse(toDay);
  return Math.floor((to - from) / 86_400_000);
}

export function isValidAffiliateUrl(value: string | null | undefined): boolean {
  if (!value?.trim()) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" && url.hostname.includes(".");
  } catch {
    return false;
  }
}

export function isFreshPrice(checkedAt: string | null, today: string): boolean {
  return checkedAt !== null && daysBetween(checkedAt, today) <= PRICE_MAX_AGE_DAYS;
}

/**
 * Publiceerpoort (§F): een product mag alleen naar 'published' als alle zeven
 * criteria slagen. Vervangt de TypeScript-compile-check die verloren ging bij
 * de overstap van statische data naar de database.
 */
export function evaluatePublishGate(input: GateInput): GateCriterion[] {
  const licensedImages = input.images.filter(
    (i) => Boolean(i.source?.trim()) && Boolean(i.license_note?.trim()),
  );
  const incompleteActives = input.actives.filter(
    (a) => a.amount_per_serving === null || a.amount_per_serving <= 0 || !a.unit?.trim(),
  );
  const failedClaims = input.claims.filter((c) => !c.meets_condition);
  const freshOffers = input.offers.filter((o) => o.active && isFreshPrice(o.price_checked_at, input.today));

  const routableOffers = input.offers.filter((o) => o.active).filter((o) => isValidAffiliateUrl(o.affiliate_url));

  return [
    {
      key: "images",
      label: "Afbeelding met bron en licentie",
      ok: licensedImages.length > 0,
      detail:
        licensedImages.length > 0
          ? `${licensedImages.length} van ${input.images.length} met bron + licentie`
          : input.images.length === 0
            ? "Geen afbeeldingen"
            : "Geen afbeelding met zowel bron als licentie-notitie",
    },
    {
      key: "actives",
      label: "Werkzame stoffen volledig ingevuld",
      ok: input.actives.length > 0 && incompleteActives.length === 0,
      detail:
        input.actives.length === 0
          ? "Geen werkzame stoffen vastgelegd"
          : incompleteActives.length > 0
            ? `${incompleteActives.length} regel(s) zonder hoeveelheid of eenheid`
            : `${input.actives.length} werkzame stof(fen)`,
    },
    {
      key: "claims",
      label: "Gekoppelde claims halen hun drempel",
      ok: failedClaims.length === 0,
      detail:
        input.claims.length === 0
          ? "Geen gekoppelde claims"
          : failedClaims.length > 0
            ? `Drempel niet gehaald: ${failedClaims.map((c) => c.efsa_claim_id).join(", ")}`
            : `${input.claims.length} claim(s) voldoen`,
    },
    {
      key: "offers",
      label: `Actieve aanbieding met prijs jonger dan ${PRICE_MAX_AGE_DAYS} dagen`,
      ok: freshOffers.length > 0,
      detail:
        freshOffers.length > 0
          ? `${freshOffers.length} actieve aanbieding(en) met verse prijs`
          : input.offers.some((o) => o.active)
            ? "Alle actieve prijzen zijn te oud of nooit gecontroleerd"
            : "Geen actieve aanbieding",
    },
    {
      key: "affiliate",
      label: "Aanbieding met geldige affiliate-link (https)",
      ok: routableOffers.length > 0,
      detail:
        routableOffers.length > 0
          ? `${routableOffers.length} aanbieding(en) met bruikbare link`
          : input.offers.some((o) => o.active)
            ? "De actieve aanbiedingen hebben geen geldige https-affiliate-link"
            : "Geen actieve aanbieding om naar te linken",
    },
    {
      key: "sources",
      label: "Minstens één bron",
      ok: input.sourceCount > 0,
      detail: input.sourceCount > 0 ? `${input.sourceCount} bron(nen)` : "Geen bronnen",
    },
    {
      key: "score",
      label: "PS-Score te berekenen",
      ok: input.score.available,
      detail: input.score.detail,
    },
  ];
}

export function gateFailures(criteria: GateCriterion[]): GateCriterion[] {
  return criteria.filter((c) => !c.ok);
}

export type Freshness = "vers" | "verouderd" | "onbekend";

export interface FreshnessInput {
  dataCheckedAt: string | null;
  activeOffers: GateOffer[];
  today: string;
}

export interface ProductFreshness {
  state: Freshness;
  staleData: boolean;
  stalePrices: number;
}

export function productFreshness(input: FreshnessInput): ProductFreshness {
  const staleData =
    input.dataCheckedAt === null || daysBetween(input.dataCheckedAt, input.today) > DATA_MAX_AGE_DAYS;
  const stalePrices = input.activeOffers.filter(
    (o) => o.active && !isFreshPrice(o.price_checked_at, input.today),
  ).length;
  const state: Freshness =
    input.dataCheckedAt === null && input.activeOffers.length === 0
      ? "onbekend"
      : staleData || stalePrices > 0
        ? "verouderd"
        : "vers";
  return { state, staleData, stalePrices };
}

/** Onder deze dekking (bepaalde onderdelen / totaal) waarschuwt de admin; het blokkeert niet. Relatief, zodat een wijziging van het aantal scoreonderdelen niets breekt. */
export const SCORE_COVERAGE_ADVICE_BELOW = 0.75;

export function scoreCoverageAdvice(determinedCount: number, totalCount: number): string | null {
  if (totalCount <= 0 || determinedCount >= totalCount) return null;
  if (determinedCount / totalCount >= SCORE_COVERAGE_ADVICE_BELOW) return null;
  return `De score gaat over ${determinedCount} van de ${totalCount} onderdelen. Onderdelen die niet te bepalen zijn tellen niet mee, dus de score kan hoger uitvallen dan bij volledig beoordeelde producten. Vul waar mogelijk de score-invoer aan; publiceren mag.`;
}
