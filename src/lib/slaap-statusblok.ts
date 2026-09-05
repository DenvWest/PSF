import type { LadderEvidenceRow } from "@/lib/domain-ladder-readout";

/** Compacte statusrijen voor slaap P1–P3 (gelegenheid · ritme · gedrag). */
export type SlaapStatusRij = {
  key: string;
  label: string;
  answerLabel: string;
  whyLine: string;
};

const LAYER_LABEL: Record<1 | 2 | 3, string> = {
  1: "Gelegenheid",
  2: "Ritme",
  3: "Gedrag",
};

/**
 * Eén rij per laag 1–3 uit de check-evidence. Geen nieuwe engine — alleen
 * de eerste bewijsrij per laag, zodat het blok compact blijft.
 */
export function buildSlaapStatusRijen(
  evidenceByLayer: Partial<Record<number, readonly LadderEvidenceRow[]>> | null | undefined,
): SlaapStatusRij[] {
  if (!evidenceByLayer) return [];
  const rows: SlaapStatusRij[] = [];
  for (const layer of [1, 2, 3] as const) {
    const first = evidenceByLayer[layer]?.[0];
    if (!first) continue;
    rows.push({
      key: first.key,
      label: LAYER_LABEL[layer],
      answerLabel: first.answerLabel,
      whyLine: first.whyLine,
    });
  }
  return rows;
}
