import type { OrgScopedClient } from "@/lib/db/scoped";
import {
  computeProteinTarget,
  type ProteinTargetRange,
} from "@/lib/protein-target";

/**
 * Eigen voedingsdoelen: gewicht, trainingsbelasting en een eventueel
 * overschreven eiwitdoel.
 *
 * ## Waarom dit naast de intake staat en hem niet vervangt
 *
 * `intake_sessions` draagt `weight_kg` en de antwoorden waaruit de
 * trainingsbelasting volgt. Dat is de goede plek voor "wat zei je tijdens die
 * check" — en de verkeerde voor "wat geldt er nu". Hermeting rekent tegen
 * eerdere sessies, dus een kolom daar bijwerken verandert met terugwerkende
 * kracht wat een eerdere meting beweerde.
 *
 * Deze module leest dus zijn eigen tabel en valt terug op de check waar niets
 * is ingevuld. Wie niets instelt merkt geen verschil; wie wel iets instelt,
 * overschrijft alleen wat vooruit kijkt.
 *
 * ## Waarom het eiwitdoel een overschrijving is en geen opgeslagen getal
 *
 * De range komt uit {@link computeProteinTarget}, dat met gewicht, belasting
 * en leeftijd rekent. Zou je het resultaat opslaan, dan verouderde het
 * stilletjes zodra iemand zijn gewicht bijwerkt — een doel dat niet meer bij
 * de persoon hoort maar er wel officieel uitziet.
 *
 * `eiwitDoelG` is daarom geen cache maar een uitzondering: null betekent
 * "gebruik de afleiding", een getal betekent "deze persoon weet iets wat de
 * formule niet weet". De afleiding blijft de standaard en blijft meebewegen.
 */

export type Voedingsdoelen = {
  gewichtKg: number | null;
  trainingsbelasting: number | null;
  /** Handmatig eiwitdoel in gram; null = gebruik de afleiding. */
  eiwitDoelG: number | null;
};

export const LEGE_VOEDINGSDOELEN: Voedingsdoelen = {
  gewichtKg: null,
  trainingsbelasting: null,
  eiwitDoelG: null,
};

/** Gelijk aan MIN_WEIGHT_KG/MAX_WEIGHT_KG in `protein-target.ts`. */
const GEWICHT_MIN = 40;
const GEWICHT_MAX = 250;
const EIWIT_MIN = 20;
const EIWIT_MAX = 400;

/**
 * Of een ingevoerd gewicht bruikbaar is.
 *
 * Dezelfde grenzen als de formule, want daarbuiten geeft
 * `computeProteinTarget` null terug: een waarde die wij accepteren maar de
 * formule weigert, levert een doel dat nergens verschijnt.
 */
export function isGeldigGewicht(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= GEWICHT_MIN &&
    value <= GEWICHT_MAX
  );
}

export function isGeldigeTrainingsbelasting(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 4
  );
}

export function isGeldigEiwitDoel(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= EIWIT_MIN &&
    value <= EIWIT_MAX
  );
}

type Rij = {
  gewicht_kg: number | string | null;
  trainingsbelasting: number | null;
  eiwit_doel_g: number | null;
};

/**
 * Postgres levert `numeric` als string terug via PostgREST — zonder deze stap
 * komt "82.5" als tekst binnen en faalt elke rekensom er stil op.
 */
function leesGetal(value: number | string | null): number | null {
  if (value === null) return null;
  const nummer = typeof value === "string" ? Number.parseFloat(value) : value;
  return Number.isFinite(nummer) ? nummer : null;
}

export async function getVoedingsdoelen(
  supabase: OrgScopedClient,
  accountId: string,
): Promise<Voedingsdoelen> {
  const { data, error } = await supabase
    .from("account_voedingsdoelen")
    .select("gewicht_kg,trainingsbelasting,eiwit_doel_g")
    .eq("account_id", accountId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    return LEGE_VOEDINGSDOELEN;
  }

  const rij = data as unknown as Rij;
  return {
    gewichtKg: leesGetal(rij.gewicht_kg),
    trainingsbelasting: rij.trainingsbelasting ?? null,
    eiwitDoelG: rij.eiwit_doel_g ?? null,
  };
}

/**
 * Schrijft de doelen weg. Elk veld mag expliciet op null — dat is "wissen",
 * en betekent voor gewicht en belasting "val terug op de check" en voor het
 * eiwitdoel "gebruik de afleiding weer".
 */
export async function setVoedingsdoelen(
  supabase: OrgScopedClient,
  accountId: string,
  doelen: Voedingsdoelen,
): Promise<void> {
  const { error } = await supabase.from("account_voedingsdoelen").upsert(
    {
      account_id: accountId,
      gewicht_kg: doelen.gewichtKg,
      trainingsbelasting: doelen.trainingsbelasting,
      eiwit_doel_g: doelen.eiwitDoelG,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "account_id" },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export type EiwitDoel = {
  /** De range uit de formule, of null wanneer er geen bruikbaar gewicht is. */
  range: ProteinTargetRange | null;
  /** Het handmatige doel, als dat er is. */
  handmatigG: number | null;
  /** Waar het gewicht vandaan kwam — de UI legt dat uit. */
  gewichtBron: "eigen" | "check" | "geen";
};

/**
 * Het eiwitdoel zoals het scherm het moet tonen: de afleiding, het eventuele
 * handmatige getal, en waar het gewicht vandaan kwam.
 *
 * Geeft beide terug in plaats van één "definitief" getal, omdat de UI het
 * verschil moet kunnen laten zien: wie een eigen doel zette, hoort te zien
 * waar de richtlijn lag — anders is een overschrijving een blinde keuze.
 */
export function bepaalEiwitDoel(input: {
  doelen: Voedingsdoelen;
  checkGewichtKg: number | null;
  checkTrainingLoad: number | undefined;
  ageRange: string | null;
}): EiwitDoel {
  const { doelen, checkGewichtKg, checkTrainingLoad, ageRange } = input;

  const eigenGewicht = isGeldigGewicht(doelen.gewichtKg) ? doelen.gewichtKg : null;
  const checkGewicht = isGeldigGewicht(checkGewichtKg) ? checkGewichtKg : null;
  const gewicht = eigenGewicht ?? checkGewicht;

  const belasting = isGeldigeTrainingsbelasting(doelen.trainingsbelasting)
    ? doelen.trainingsbelasting
    : checkTrainingLoad;

  const range =
    gewicht === null
      ? null
      : computeProteinTarget({
          weightKg: gewicht,
          ...(belasting === undefined ? {} : { trainingLoad: belasting }),
          ...(ageRange ? { ageRange } : {}),
        });

  return {
    range: range && { gramsLow: range.gramsLow, gramsHigh: range.gramsHigh },
    handmatigG: isGeldigEiwitDoel(doelen.eiwitDoelG) ? doelen.eiwitDoelG : null,
    gewichtBron: eigenGewicht !== null ? "eigen" : checkGewicht !== null ? "check" : "geen",
  };
}

/**
 * Wat de instellingenkaart mag zien.
 *
 * Bewust géén ruw gewicht uit de check: `DashboardData` draagt dat ook niet
 * naar de client ("Nooit het ruwe gewicht — alleen de afgeleide range bereikt
 * de client", zie `types/dashboard.ts`). Die grens geldt hier net zo goed.
 *
 * Het eigen gewicht dat je zelf in dit scherm zette is een ander geval: dat
 * typte je er zelf in, en zonder terugkoppeling kun je het niet corrigeren.
 * Wat hier dus niet in staat is het gewicht uit je check — alleen of het er
 * is, zodat de kaart kan uitleggen waar de richtlijn vandaan komt.
 */
export type VoedingsdoelenWeergave = {
  doelen: Voedingsdoelen;
  /** De richtlijn zoals hij nu geldt, server-side gerekend. */
  richtlijn: ProteinTargetRange | null;
  gewichtBron: EiwitDoel["gewichtBron"];
  /** Of de check een bruikbaar gewicht draagt — voor de uitleg, zonder het getal. */
  checkHeeftGewicht: boolean;
};
