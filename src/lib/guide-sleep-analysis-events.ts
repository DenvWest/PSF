const GUIDE_SLEEP_EVENTS = new Set([
  "guide.sleep_analysis.started",
  "guide.sleep_analysis.completed",
  "dashboard.cta.clicked",
]);

export function emitGuideSleepAnalysisEvent(
  eventType: string,
  payload: Record<string, string | number | boolean> = {},
): void {
  if (!GUIDE_SLEEP_EVENTS.has(eventType)) {
    return;
  }

  void fetch("/api/gids/sleep-analysis/event", {
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
