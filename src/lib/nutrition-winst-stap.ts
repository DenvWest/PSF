import type { NutritionFactRowKey } from "@/lib/nutrition-ladder";

/**
 * De ene stap onder "Grootste winst" op voeding: wat je bij je volgende
 * maaltijd kunt doen, per feitenrij uit de check. Een prioriteit
 * (`nutrition-prioriteiten.ts`) is een richting; dit is de eerste beweging
 * binnen die richting, klein genoeg om vandaag te doen en te loggen.
 *
 * Geen hoeveelheden en geen claim: de richtlijn staat in de feitenrij zelf.
 */
export const NUTRITION_WINST_STAP: Record<NutritionFactRowKey, string> = {
  plantbasis: "Groente of fruit erbij bij je volgende maaltijd",
  eiwitbronnen: "Een eiwitbron erbij bij je volgende maaltijd",
  vezelbasis: "Volkoren of peulvruchten erbij bij je volgende maaltijd",
  visbron: "Vette vis op je menu zetten deze week",
  minderen: "Eén zoete drank vervangen door water",
  bewerkingsgraad: "Eén bewerkt product vervangen door iets vers",
  eiwitritme: "Eiwit toevoegen aan je ontbijt",
};

export function winstStapVoor(rowKey: string): string | null {
  return (NUTRITION_WINST_STAP as Record<string, string>)[rowKey] ?? null;
}
