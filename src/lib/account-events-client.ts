import type { DomainEventType } from "@/lib/events";

type ClientEmitType = Extract<
  DomainEventType,
  | "domain_tool.snapshot_viewed"
  | "domain_tool.tier_preview_clicked"
  | "focus.viewed"
  | "wearable.interest_clicked"
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
