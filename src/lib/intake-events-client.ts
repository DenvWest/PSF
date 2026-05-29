import type { DomainEventType } from "@/lib/events";

type ClientEmitType = Extract<
  DomainEventType,
  "intake.theme_revealed" | "plan.action_clicked"
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
