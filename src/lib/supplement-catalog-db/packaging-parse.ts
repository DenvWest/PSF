export interface ParsedPackaging {
  containerSize: number | null;
  containerUnit: string | null;
  servingsPerContainer: number | null;
  servingSize: number | null;
  servingUnit: string | null;
}

const UNIT_ALIASES: Record<string, string> = {
  tablet: "tabletten",
  tabletten: "tabletten",
  capsule: "capsules",
  capsules: "capsules",
  vegicap: "vegicaps",
  vegicaps: "vegicaps",
  softgel: "softgels",
  softgels: "softgels",
  ml: "ml",
  g: "g",
  kg: "kg",
};

function normalizeUnit(raw: string): string {
  const key = raw.toLowerCase();
  return UNIT_ALIASES[key] ?? key;
}

/**
 * Best-effort parse van de vrije-tekst "Inhoud"-spec uit de statische
 * productdata (bijv. "120 tabletten (60 dagen)", "25 ml (~166 dagen bij 3
 * druppels)", "500 g (100 doseringen à 5 g)") naar gestructureerde
 * verpakkingsvelden. Geeft null terug voor wat niet met voldoende
 * zekerheid te herleiden is — nooit een gegokte waarde.
 */
export function parseContainerSpec(value: string): Pick<ParsedPackaging, "containerSize" | "containerUnit" | "servingsPerContainer"> {
  const empty = { containerSize: null, containerUnit: null, servingsPerContainer: null };

  const sizeMatch = /^([\d.,]+)\s*(ml|g|kg|tabletten?|capsules?|vegicaps?|softgels?)\b/i.exec(value.trim());
  if (!sizeMatch) return empty;

  const containerSize = Number(sizeMatch[1].replace(",", "."));
  if (!Number.isFinite(containerSize) || containerSize <= 0) return empty;
  const containerUnit = normalizeUnit(sizeMatch[2]);

  // "100 doseringen à 5 g" / "60 dagen" tellen alleen als servingsPerContainer
  // mee als het om stuksgoed gaat (tabletten/capsules = 1 stuk per portie).
  let servingsPerContainer: number | null = null;
  if (["tabletten", "capsules", "vegicaps", "softgels"].includes(containerUnit)) {
    servingsPerContainer = Math.round(containerSize);
  } else {
    const dosesMatch = /\((\d+)\s*doseringen/i.exec(value);
    if (dosesMatch) servingsPerContainer = Number(dosesMatch[1]);
  }

  return { containerSize, containerUnit, servingsPerContainer };
}

/**
 * Best-effort parse van de "Portie"-spec (alleen eiwitpoeder gebruikt dit
 * label op dit moment, bijv. "30 g (ca. 25 g eiwit) — whey isolaat...").
 */
export function parseServingSpec(value: string): Pick<ParsedPackaging, "servingSize" | "servingUnit"> {
  const match = /^([\d.,]+)\s*(ml|g|kg)\b/i.exec(value.trim());
  if (!match) return { servingSize: null, servingUnit: null };
  const servingSize = Number(match[1].replace(",", "."));
  if (!Number.isFinite(servingSize) || servingSize <= 0) return { servingSize: null, servingUnit: null };
  return { servingSize, servingUnit: normalizeUnit(match[2]) };
}
