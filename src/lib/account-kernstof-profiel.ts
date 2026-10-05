import type { KernstofMetNorm } from "@/data/nutrition/voedingsnormen";
import type { OrgScopedClient } from "@/lib/db/scoped";

/**
 * Eigen invloed op de kernstof-normen: welke norm geldt (geslacht, 70+), welke
 * voedingsbronnen we tonen (voedingswijze), en een eigen streefwaarde per
 * stof (`BESLUIT_PATROON_PER_MAALTIJD_2026-10.md`, plak 2).
 *
 * ## Streefwaarde ≠ norm
 *
 * De streefwaarde staat als tweede lijn naast de norm. "Gehaald" rekent
 * altijd tegen de norm: een zelf verlaagd doel mag geen ✓ geven die het
 * systeem niet kan onderbouwen (`BESLUIT_KERNSTOF_NORMEN_2026-10.md` §5,
 * herzien 5 okt).
 *
 * ## Bovengrens
 *
 * Een streefwaarde boven de veilige bovengrens van de EFSA wordt geweigerd:
 * wie 40 mg zink als doel invult, zou het scherm laten aanmoedigen wat de
 * EFSA afraadt. Magnesium heeft alleen een bovengrens voor supplementen
 * (250 mg); voor voeding plus supplement houden we 1000 mg als typfoutgrens.
 */

export type NormGeslacht = "man" | "vrouw";
export type Voedingswijze = "vegetarisch" | "veganistisch";

export type KernstofProfiel = {
  /** Null = het geslacht uit de check (dat de client nooit ziet). */
  geslacht: NormGeslacht | null;
  zeventigPlus: boolean;
  voedingswijze: Voedingswijze | null;
  streefwaarden: Partial<Record<KernstofMetNorm, number>>;
};

export const LEEG_KERNSTOF_PROFIEL: KernstofProfiel = {
  geslacht: null,
  zeventigPlus: false,
  voedingswijze: null,
  streefwaarden: {},
};

export const STREEFWAARDE_GRENS: Record<KernstofMetNorm, { max: number; unit: string; uitleg: string }> = {
  magnesium: { max: 1000, unit: "mg", uitleg: "Boven 1000 mg is bijna altijd een typfout." },
  zinc: { max: 25, unit: "mg", uitleg: "De EFSA zet de veilige bovengrens op 25 mg per dag." },
  omega3: {
    max: 5000,
    unit: "mg",
    uitleg: "Tot 5000 mg EPA+DHA per dag ziet de EFSA geen veiligheidsbezwaar.",
  },
  vitamin_d: { max: 100, unit: "µg", uitleg: "De EFSA zet de veilige bovengrens op 100 µg per dag." },
};

const KERNSTOFFEN = Object.keys(STREEFWAARDE_GRENS) as KernstofMetNorm[];

export function isKernstofMetNorm(waarde: unknown): waarde is KernstofMetNorm {
  return typeof waarde === "string" && (KERNSTOFFEN as string[]).includes(waarde);
}

export function isGeldigeStreefwaarde(stof: KernstofMetNorm, waarde: unknown): waarde is number {
  return typeof waarde === "number" && Number.isFinite(waarde) && waarde > 0 && waarde <= STREEFWAARDE_GRENS[stof].max;
}

function leesGeslacht(waarde: unknown): NormGeslacht | null {
  return waarde === "man" || waarde === "vrouw" ? waarde : null;
}

function leesVoedingswijze(waarde: unknown): Voedingswijze | null {
  return waarde === "vegetarisch" || waarde === "veganistisch" ? waarde : null;
}

function leesStreefwaarden(waarde: unknown): KernstofProfiel["streefwaarden"] {
  if (!waarde || typeof waarde !== "object" || Array.isArray(waarde)) return {};
  const uit: KernstofProfiel["streefwaarden"] = {};
  for (const [stof, getal] of Object.entries(waarde as Record<string, unknown>)) {
    if (isKernstofMetNorm(stof) && isGeldigeStreefwaarde(stof, getal)) uit[stof] = getal;
  }
  return uit;
}

/** Een databaserij (of iets wat erop lijkt) als geldig profiel; onbekende waarden vallen weg. */
export function leesKernstofProfiel(rij: unknown): KernstofProfiel {
  if (!rij || typeof rij !== "object") return LEEG_KERNSTOF_PROFIEL;
  const r = rij as Record<string, unknown>;
  return {
    geslacht: leesGeslacht(r.geslacht),
    zeventigPlus: r.zeventig_plus === true,
    voedingswijze: leesVoedingswijze(r.voedingswijze),
    streefwaarden: leesStreefwaarden(r.streefwaarden),
  };
}

/**
 * Past een patch van de client toe. Een weggelaten veld blijft staan, `null`
 * wist het (zelfde afspraak als `postVoedingsdoelen`). Streefwaarden gaan per
 * stof: `{ streefwaarden: { zinc: 9, magnesium: null } }`.
 */
export function pasKernstofPatchToe(
  huidig: KernstofProfiel,
  patch: unknown,
): { profiel: KernstofProfiel } | { fout: string } {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) return { fout: "Ongeldig verzoek." };
  const p = patch as Record<string, unknown>;
  const volgende: KernstofProfiel = { ...huidig, streefwaarden: { ...huidig.streefwaarden } };

  if ("geslacht" in p) {
    if (p.geslacht !== null && leesGeslacht(p.geslacht) === null) return { fout: "Onbekend geslacht." };
    volgende.geslacht = leesGeslacht(p.geslacht);
  }
  if ("zeventigPlus" in p) {
    if (typeof p.zeventigPlus !== "boolean") return { fout: "Ongeldige leeftijdskeuze." };
    volgende.zeventigPlus = p.zeventigPlus;
  }
  if ("voedingswijze" in p) {
    if (p.voedingswijze !== null && leesVoedingswijze(p.voedingswijze) === null) {
      return { fout: "Onbekende voedingswijze." };
    }
    volgende.voedingswijze = leesVoedingswijze(p.voedingswijze);
  }
  if ("streefwaarden" in p) {
    const ruw = p.streefwaarden;
    if (!ruw || typeof ruw !== "object" || Array.isArray(ruw)) return { fout: "Ongeldige streefwaarden." };
    for (const [stof, waarde] of Object.entries(ruw as Record<string, unknown>)) {
      if (!isKernstofMetNorm(stof)) return { fout: "Onbekende stof." };
      if (waarde === null) {
        delete volgende.streefwaarden[stof];
      } else if (isGeldigeStreefwaarde(stof, waarde)) {
        volgende.streefwaarden[stof] = waarde;
      } else {
        const grens = STREEFWAARDE_GRENS[stof];
        return { fout: `Vul een streefwaarde tussen 0 en ${grens.max} ${grens.unit} in. ${grens.uitleg}` };
      }
    }
  }
  return { profiel: volgende };
}

function tabelOntbreekt(error: { code?: string } | null): boolean {
  return error?.code === "42P01";
}

export async function getKernstofProfiel(supabase: OrgScopedClient, accountId: string): Promise<KernstofProfiel> {
  const { data, error } = await supabase
    .from("account_kernstof_profiel")
    .select("geslacht,zeventig_plus,voedingswijze,streefwaarden")
    .eq("account_id", accountId)
    .maybeSingle();

  if (tabelOntbreekt(error)) return LEEG_KERNSTOF_PROFIEL;
  if (error) throw new Error(error.message);
  return leesKernstofProfiel(data);
}

export class KernstofProfielNietBeschikbaar extends Error {}

export async function setKernstofProfiel(
  supabase: OrgScopedClient,
  accountId: string,
  profiel: KernstofProfiel,
): Promise<void> {
  const { error } = await supabase.from("account_kernstof_profiel").upsert(
    {
      account_id: accountId,
      geslacht: profiel.geslacht,
      zeventig_plus: profiel.zeventigPlus,
      voedingswijze: profiel.voedingswijze,
      streefwaarden: profiel.streefwaarden,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "account_id" },
  );

  if (tabelOntbreekt(error)) throw new KernstofProfielNietBeschikbaar();
  if (error) throw new Error(error.message);
}
