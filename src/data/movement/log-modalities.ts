/**
 * SSOT voor loggbare bewegingsmodaliteiten (`modality_id`).
 * Gebruikt door de gedaan-log (validatie in `movement-session-log.ts`) én de chip-scroll op
 * BewegingScreen. De content-href is secundair (verdieping), niet de log-actie.
 * "Rustmoment" (active_recovery) is bewust losgekoppeld van de readout-pijler "herstel".
 */
export type MovementModalityId =
  | "krachttraining"
  | "wandelen"
  | "zone2"
  | "active_recovery";

export type MovementLogModality = {
  id: MovementModalityId;
  label: string;
  icon: string;
  href: string | null;
};

export const MOVEMENT_LOG_MODALITIES: MovementLogModality[] = [
  { id: "krachttraining", label: "Krachttraining", icon: "💪", href: "/blog/krachttraining-na-40" },
  { id: "wandelen", label: "Stevig wandelen", icon: "🚶", href: "/beweging-na-40" },
  { id: "zone2", label: "Zone 2 cardio", icon: "❤️", href: "/onderbouwing#MOV_CARD" },
  { id: "active_recovery", label: "Rustmoment", icon: "🛌", href: "/herstel-verbeteren-na-40" },
];

const MODALITY_ID_SET = new Set<string>(
  MOVEMENT_LOG_MODALITIES.map((modality) => modality.id),
);

export function isMovementModalityId(value: string): value is MovementModalityId {
  return MODALITY_ID_SET.has(value);
}

export function getMovementModalityLabel(id: MovementModalityId): string {
  return (
    MOVEMENT_LOG_MODALITIES.find((modality) => modality.id === id)?.label ?? id
  );
}
