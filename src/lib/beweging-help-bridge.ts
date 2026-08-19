import { resolveActionKey } from "@/lib/day-model";
import { findMovementStepTitle } from "@/lib/movement-today-choices";
import { programLabelFor } from "@/lib/beweging-advies-treden";
import type { WeekDaySlot } from "@/lib/agenda-week-preview";
import type { DashboardModel } from "@/types/dashboard";

/**
 * De dunne #b-ingang (Pad A, slice 3): geen catalogus, alleen een statusstrip
 * die dezelfde keten toont als het schap zelf (FavorietenSchapView
 * ketenStrip: Check → Onderbouwing → Schap → Vergelijking). "Schap" staat
 * vast op `now` — dat is de stap waar deze brug naartoe leidt — en
 * "Vergelijking" vast op `toekomstig`: er is geen signaal dat iemand daar al
 * is aangekomen.
 */
export type HelpBridgeStatus = "done" | "wacht" | "now" | "toekomstig";

export type HelpBridgePointId = "check" | "onderbouwing" | "schap" | "vergelijking";

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
        id: "onderbouwing",
        label: "Onderbouwing",
        status: nutritionLogCompleted ? "done" : "wacht",
      },
      { id: "schap", label: "Schap", status: "now" },
      { id: "vergelijking", label: "Vergelijking", status: "toekomstig" },
    ],
  };
}
