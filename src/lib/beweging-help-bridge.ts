import { resolveActionKey } from "@/lib/day-model";
import { findMovementStepTitle } from "@/lib/movement-today-choices";
import { programLabelFor } from "@/lib/beweging-advies-treden";
import type { WeekDaySlot } from "@/lib/agenda-week-preview";
import type { DashboardModel } from "@/types/dashboard";

/**
 * De dunne #b-ingang (Pad A, slice 3): geen catalogus, alleen een statusstrip
 * die leest wat al bestaat. "Leefstijlprofiel" staat vast op `now` — er is nog geen
 * opslag (slice 4) — en "Beste" vast op `toekomstig`: er is geen signaal dat
 * iemand daar al is aangekomen.
 */
export type HelpBridgeStatus = "done" | "wacht" | "now" | "toekomstig";

export type HelpBridgePointId = "check" | "advies" | "favorieten" | "beste";

export type HelpBridgePoint = {
  id: HelpBridgePointId;
  label: string;
  status: HelpBridgeStatus;
};

export type BewegingHelpBridge = {
  stepTitle: string | null;
  programLabel: string | null;
  points: HelpBridgePoint[];
};

export function buildBewegingHelpBridge(
  model: DashboardModel,
  slot: WeekDaySlot | null,
  nutritionLogCompleted: boolean,
): BewegingHelpBridge {
  const stepTitle = slot ? findMovementStepTitle(resolveActionKey(model, slot)) : null;
  const programLabel = programLabelFor(model.movementPrefs.startPattern);

  return {
    stepTitle,
    programLabel,
    points: [
      // De sheet is alleen bereikbaar via de dagstap-poort — de check staat dus al.
      { id: "check", label: "Check", status: "done" },
      {
        id: "advies",
        label: "Advies",
        status: nutritionLogCompleted ? "done" : "wacht",
      },
      { id: "favorieten", label: "Leefstijlprofiel", status: "now" },
      { id: "beste", label: "Beste", status: "toekomstig" },
    ],
  };
}
