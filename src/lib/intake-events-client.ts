import type { DomainEventType } from "@/lib/events";

type ClientEmitType = Extract<
  DomainEventType,
  | "dashboard.first_checkin_started"
  | "dashboard.vitality_scored"
  | "dashboard.cta_to_hub"
  | "intake.theme_revealed"
  | "intake.cta_to_pillar"
  | "intake.cta_to_nutrition_log"
  | "intake.cta_to_primary_checkin"
  | "focus.viewed"
  | "plan.viewed"
  | "plan.action_clicked"
  | "plan.tier_action_clicked"
  | "plan.evidence_clicked"
  | "plan.theme_switched"
  | "plan.step_state_changed"
  | "plan.step_link_clicked"
  | "measurement.protein_cta_clicked"
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
