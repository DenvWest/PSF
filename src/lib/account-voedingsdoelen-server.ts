import { DEFAULT_ORG_ID } from "@/config/org";
import {
  bepaalEiwitDoel,
  getVoedingsdoelen,
  isGeldigGewicht,
  LEGE_VOEDINGSDOELEN,
  type Voedingsdoelen,
  type VoedingsdoelenWeergave,
} from "@/lib/account-voedingsdoelen";
import { orgScoped } from "@/lib/db/scoped";
import { deriveTrainingLoadFromAnswers } from "@/lib/training-load";

/**
 * De doelenkaart samenstellen zonder het check-gewicht naar de client te laten
 * lekken.
 *
 * `DashboardData` houdt zich aan de regel "nooit het ruwe gewicht — alleen de
 * afgeleide range bereikt de client" (zie `types/dashboard.ts` bij
 * `proteinTarget`). Een instellingenscherm is geen reden om die grens los te
 * laten: het gewicht uit je check hoort in de berekening thuis, niet in de
 * props van een client-component.
 *
 * Daarom rekent deze module server-side en geeft alleen het resultaat terug.
 * Het gewicht dat je zélf in dit scherm zette komt wél mee — dat typte je er
 * in, en zonder terugkoppeling kun je het niet corrigeren.
 */

type CheckRij = {
  weight_kg: number | null;
  age_range: string | null;
  answers: unknown;
};

function leesAntwoorden(waarde: unknown): Record<string, number> {
  if (!waarde || typeof waarde !== "object") return {};
  const uit: Record<string, number> = {};
  for (const [sleutel, ruw] of Object.entries(waarde as Record<string, unknown>)) {
    if (typeof ruw === "number" && Number.isFinite(ruw)) uit[sleutel] = ruw;
  }
  return uit;
}

/**
 * De laatste check van dit account, voor zover die de doelen raakt.
 *
 * Eigen query in plaats van `loadAccountDashboardData`: dat laadt het hele
 * dashboard (logs, routes, trends) voor drie velden, en het geeft het gewicht
 * bewust niet terug.
 */
async function leesCheck(accountId: string): Promise<{
  gewichtKg: number | null;
  trainingLoad: number | undefined;
  ageRange: string | null;
}> {
  const admin = orgScoped(DEFAULT_ORG_ID);
  if (!admin.raw) {
    return { gewichtKg: null, trainingLoad: undefined, ageRange: null };
  }

  const { data, error } = await admin
    .from("intake_sessions")
    .select("weight_kg,age_range,answers")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return { gewichtKg: null, trainingLoad: undefined, ageRange: null };
  }

  const rij = data as unknown as CheckRij;
  return {
    gewichtKg: typeof rij.weight_kg === "number" ? rij.weight_kg : null,
    trainingLoad: deriveTrainingLoadFromAnswers(leesAntwoorden(rij.answers)),
    ageRange: typeof rij.age_range === "string" ? rij.age_range : null,
  };
}

export async function laadVoedingsdoelenWeergave(
  accountId: string,
): Promise<VoedingsdoelenWeergave> {
  const check = await leesCheck(accountId);

  let doelen: Voedingsdoelen = LEGE_VOEDINGSDOELEN;
  const admin = orgScoped(DEFAULT_ORG_ID);
  if (admin.raw) {
    try {
      doelen = await getVoedingsdoelen(admin, accountId);
    } catch {
      // Een lege kaart is beter dan een kapotte accountpagina: de rest van
      // het scherm (e-mail, focus, verwijderen) hoort bereikbaar te blijven.
      doelen = LEGE_VOEDINGSDOELEN;
    }
  }

  const eiwit = bepaalEiwitDoel({
    doelen,
    checkGewichtKg: check.gewichtKg,
    checkTrainingLoad: check.trainingLoad,
    ageRange: check.ageRange,
  });

  return {
    doelen,
    richtlijn: eiwit.range,
    gewichtBron: eiwit.gewichtBron,
    checkHeeftGewicht: isGeldigGewicht(check.gewichtKg),
  };
}
