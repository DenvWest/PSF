import type { DomainEventType } from "@/lib/events";

type ClientEmitType = Extract<
  DomainEventType,
  | "intake.theme_revealed"
  | "intake.cta_to_pillar"
  | "focus.viewed"
  | "plan.viewed"
  | "plan.action_clicked"
  | "plan.tier_action_clicked"
  | "plan.evidence_clicked"
  | "plan.theme_switched"
  | "plan.step_state_changed"
  | "plan.step_link_clicked"
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
