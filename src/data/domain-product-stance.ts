/**
 * Wat wij per domein van supplementen vinden. Een domein zonder kandidaten is
 * geen ontbrekende lijst maar een oordeel — dezelfde strekking als VerdictValue
 * "eerst_leefstijl" in src/types/verdict.ts: zichtbaar, met reden, zonder uitgang.
 *
 * Stress staat bewust op `lifestyle_first`: STR_FREQ en STR_RCV meten ervaren
 * belasting en herstelgedrag, niet inname. Een supplementvoorstel op dat antwoord
 * zou een claim doen die de check niet draagt. Magnesium hoort waar zijn signaal
 * wél woont — slaap (magnesiumSignal vereist een slaap-item) en voeding (waar
 * inname geschat wordt).
 */

export type DomainProductStance =
  | { kind: "candidates"; slugs: ReadonlySet<string> }
  | { kind: "lifestyle_first"; reason: string };

export const STRESS_LIFESTYLE_FIRST_REASON =
  "Bij stress is ons antwoord leefstijl. Deze check meet hoe vaak je aan blijft staan en hoe je herstelt — niet of je iets tekortkomt, en daar past geen goedgekeurde supplementclaim op. Zie je slaap of voeding, dan kan daar wél een voorstel staan.";

export const DOMAIN_PRODUCT_STANCE = {
  movement: {
    kind: "candidates",
    slugs: new Set(["creatine", "eiwitpoeder"]),
  },
  sleep: {
    kind: "candidates",
    slugs: new Set(["magnesium"]),
  },
  stress: {
    kind: "lifestyle_first",
    reason: STRESS_LIFESTYLE_FIRST_REASON,
  },
  // Alle vijf nutriënten die de voedingscheck schat — de plek waar inname
  // daadwerkelijk gemeten wordt, dus het bredere kandidatenveld dan sleep of
  // movement (die maar één signaal per stof hebben).
  nutrition: {
    kind: "candidates",
    slugs: new Set(["magnesium", "omega3", "vitamineD", "zink", "eiwitpoeder"]),
  },
} as const satisfies Record<string, DomainProductStance>;

export type ProductStanceDomain = keyof typeof DOMAIN_PRODUCT_STANCE;

export function getDomainProductStance(
  domain: ProductStanceDomain,
): DomainProductStance {
  return DOMAIN_PRODUCT_STANCE[domain];
}
