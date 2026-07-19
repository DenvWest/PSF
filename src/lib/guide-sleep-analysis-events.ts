import { trackEvent } from "@/lib/ga4";
import { clarityTag } from "@/lib/clarity";

const GUIDE_SLEEP_EVENTS = new Set([
  "guide.sleep_analysis.started",
  "guide.sleep_analysis.completed",
  "dashboard.cta.clicked",
]);

export function emitGuideSleepAnalysisEvent(
  eventType: string,
  payload: Record<string, string | number | boolean> = {},
): void {
  if (eventType === "guide.sleep_analysis.started") {
    trackEvent("guide_sleep_analysis_started", payload);
    clarityTag("guide_sleep_analysis", "started");
  } else if (eventType === "guide.sleep_analysis.completed") {
    trackEvent("guide_sleep_analysis_completed", payload);
    clarityTag("guide_sleep_analysis", "completed");
  } else if (eventType === "dashboard.cta.clicked") {
    trackEvent("dashboard_cta_clicked", payload);
    clarityTag("sleep_dashboard_cta", "sleep_analysis");
  }

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
