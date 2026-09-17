/**
 * Feature-flags via env. `NEXT_PUBLIC_`-prefix zodat dezelfde vlag isomorf leesbaar is
 * (server-API én client-UI). Een boolean-vlag is niet gevoelig; de API dwingt de vlag
 * server-side alsnog af. Standaard uit (unset → false).
 */
export function isMovementLogEnabled(): boolean {
  return process.env.NEXT_PUBLIC_MOVEMENT_LOG_ENABLED === "true";
}

/**
 * Uitrolstand van het vervolgstap-blok onder content.
 *
 * Drie standen in plaats van aan/uit, omdat de wijziging 151 pagina's tegelijk
 * raakt en de stof-dragende stukken de scherpste hypothese zijn: daar is de
 * vervolgstap het meest specifiek ("haal je dit uit je eten?"), dus daar hoort
 * het effect het eerst zichtbaar te worden.
 *
 * - `off` (default) — de bestaande gestapelde CTA-blokken, byte-identiek.
 * - `nutrients` — alleen op content die een voedingsstof draagt.
 * - `all` — op alle content.
 */
export type ContentNextStepRollout = "off" | "nutrients" | "all";

export function getContentNextStepRollout(): ContentNextStepRollout {
  const raw = process.env.NEXT_PUBLIC_CONTENT_NEXT_STEP;
  return raw === "all" || raw === "nutrients" ? raw : "off";
}

/** Krijgt dit stuk het vervolgstap-blok, gegeven de uitrolstand? */
export function isContentNextStepEnabled(hasNutrients: boolean): boolean {
  const rollout = getContentNextStepRollout();
  if (rollout === "all") return true;
  if (rollout === "nutrients") return hasNutrients;
  return false;
}

/**
 * Uitrolstand van de automatische "verder lezen"-laag.
 *
 * Losse vlag van `NEXT_PUBLIC_CONTENT_NEXT_STEP`, want het zijn twee
 * onafhankelijke wijzigingen: de vervolgstap raakt de CTA onder een artikel, de
 * verwante-lijst raakt wat eronder staat. Ze samen schakelen zou betekenen dat
 * je achteraf niet weet welke van de twee het verschil maakte.
 */
export function isContentRelatedEnabled(hasNutrients: boolean): boolean {
  const raw = process.env.NEXT_PUBLIC_CONTENT_RELATED;
  if (raw === "all") return true;
  if (raw === "nutrients") return hasNutrients;
  return false;
}
