import type { DomainEventType } from "@/lib/events";

type ClientEmitType = Extract<
  DomainEventType,
  | "dashboard.first_checkin_started"
  | "dashboard.vitality_scored"
  | "dashboard.cta_to_hub"
  | "dashboard.cta.clicked"
  | "dashboard.aanrader_clicked"
  | "dashboard.schap_vergelijking_click"
  | "dashboard.schap_getoond"
  | "dashboard.advies_gate_passed"
  | "dashboard.afleiding_opened"
  | "intake.started"
  | "intake.phase_completed"
  | "intake.theme_revealed"
  | "intake.cta_to_pillar"
  | "intake.cta_to_primary_checkin"
  | "intake.cta_to_comparison"
  | "intake.track_chosen"
  | "focus.viewed"
  | "plan.viewed"
  | "plan.action_clicked"
  | "plan.tier_action_clicked"
  | "plan.evidence_clicked"
  | "plan.theme_switched"
  | "plan.step_state_changed"
  | "plan.step_link_clicked"
  | "plan.phase_expanded"
  | "plan.phase_opened"
  | "plan.daily_rhythm_clicked"
  | "plan.week_category_selected"
  | "measurement.protein_cta_clicked"
  | "nutrition.schap_bronnen_getoond"
  | "nutrition.schap_bron_clicked"
  | "nutrition.schap_categorie_gefilterd"
>;

export function emitIntakeClientEvent(
  eventType: ClientEmitType,
  payload: Record<string, unknown> = {},
): void {
  void fetch("/api/intake/events", {
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
