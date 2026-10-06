import type { OrgScopedClient } from "@/lib/db/scoped";
import { VOEDINGSWAARDE_VELDEN, type VoedingswaardeVeld } from "@/lib/nutrition-voedingswaarde";
import type { SupermarktVeld } from "@/lib/nutrition-supermarkt-items";

/**
 * Welke informatieve voedingsstoffen iemand naast de vijf kernstoffen volgt
 * (`BESLUIT_DOELEN_VERBONDEN_2026-10.md`).
 *
 * Dit is de enige lijst van "wat is volgbaar" en de enige opslag van "wat volg
 * ik". Je doelen, de "+" in Je patroon en het dagboek gebruiken allemaal deze
 * module, zodat ze niet uit elkaar kunnen lopen.
 *
 * Kernstoffen staan hier niet in: die staan altijd in krans en patroon, met
 * een norm en een oordeel. Energie en macro's ook niet: die hebben het
 * tabblad Macro's. Wat overblijft is informatief — geen ✓, geen `/beste/*`.
 */

const VOLGBAAR = new Set<SupermarktVeld>([
  "fiberG",
  "saturatedFatG",
  "transFatG",
  "sugarsG",
  "sodiumMg",
  "potassiumMg",
  "calciumMg",
  "ironMg",
  "vitaminB12µg",
  "vitaminCMg",
]);

export const VOLGBARE_VELDEN: readonly VoedingswaardeVeld[] = VOEDINGSWAARDE_VELDEN.filter((veld) =>
  VOLGBAAR.has(veld.veld),
);

export function isVolgbaarVeld(waarde: unknown): waarde is SupermarktVeld {
  return typeof waarde === "string" && VOLGBAAR.has(waarde as SupermarktVeld);
}

/** Alleen volgbare velden, zonder dubbelen, in de gegeven volgorde. */
export function schoonGevolgdeStoffen(waarden: readonly unknown[]): SupermarktVeld[] {
  return [...new Set(waarden.filter(isVolgbaarVeld))];
}

/** Postgres "relation does not exist": de migratie is nog niet gedraaid. */
function tabelOntbreekt(error: { code?: string } | null): boolean {
  return error?.code === "42P01";
}

/**
 * De gevolgde stoffen van dit account. Een ontbrekende tabel levert een lege
 * lijst op, zodat de rest van het scherm werkt vóór de migratie gedraaid is.
 */
export async function getGevolgdeStoffen(
  supabase: OrgScopedClient,
  accountId: string,
): Promise<SupermarktVeld[]> {
  const { data, error } = await supabase
    .from("account_gevolgde_stoffen")
    .select("stoffen")
    .eq("account_id", accountId)
    .maybeSingle();

  if (tabelOntbreekt(error)) return [];
  if (error) throw new Error(error.message);
  const stoffen = (data as { stoffen?: unknown } | null)?.stoffen;
  return Array.isArray(stoffen) ? schoonGevolgdeStoffen(stoffen) : [];
}

export class GevolgdeStoffenNietBeschikbaar extends Error {}

export async function setGevolgdeStoffen(
  supabase: OrgScopedClient,
  accountId: string,
  stoffen: readonly SupermarktVeld[],
): Promise<void> {
  const { error } = await supabase.from("account_gevolgde_stoffen").upsert(
    {
      account_id: accountId,
      stoffen: [...stoffen],
      updated_at: new Date().toISOString(),
    },
    { onConflict: "account_id" },
  );

  if (tabelOntbreekt(error)) throw new GevolgdeStoffenNietBeschikbaar();
  if (error) throw new Error(error.message);
}
