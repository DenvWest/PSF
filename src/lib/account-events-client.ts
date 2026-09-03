import type { DomainEventType } from "@/lib/events";

type ClientEmitType = Extract<
  DomainEventType,
  | "dashboard.domain_check_cta_clicked"
  | "domain_tool.snapshot_viewed"
  | "domain_tool.tier_preview_clicked"
  | "focus.viewed"
  | "wearable.interest_clicked"
  | "movement.location_selected"
  | "movement.target_set"
  | "movement.sport_selected"
  | "movement.gap_shown"
  | "dashboard.beweging_programma_open"
  | "choice.shelf_opened"
  | "dashboard.schap_tab_selected"
  | "nutrition.basis_category_viewed"
  | "nutrition.kompas_priorities_viewed"
  | "nutrition.kompas_priority_clicked"
  | "nutrition.reflectie_shown"
  | "nutrition.reflectie_answered"
  | "nutrition.dagboek_opened"
  | "nutrition.dagboek_day_saved"
  | "nutrition.dagboek_completed"
  | "nutrition.basis_category_expanded"
  | "nutrition.roadmap_step_opened"
  | "nutrition.sufficiency_viewed"
  | "nutrition.tijdlaag_viewed"
  | "cprofile.step_completed"
  | "cprofile.highlight_clicked"
>;

export function emitAccountClientEvent(
  eventType: ClientEmitType,
  payload: Record<string, unknown> = {},
): void {
  void fetch("/api/account/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    keepalive: true,
    body: JSON.stringify({
      event_type: eventType,
      payload,
    }),
  }).catch(() => {
    /* non-blocking */
  });
}
