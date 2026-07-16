import { clarityTag } from "@/lib/clarity";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";

export type IntakeFunnelPhase =
  | "intro"
  | "symptoms"
  | "questions"
  | "consent"
  | "calculating";

export function trackIntakeStarted(): void {
  emitIntakeClientEvent("intake.started", { source: "intake" });
  trackEvent(GA4_EVENTS.QUIZ_GESTART, { source: "intake" });
}

export function trackIntakePhaseCompleted(phase: IntakeFunnelPhase): void {
  emitIntakeClientEvent("intake.phase_completed", { phase });
  trackEvent("intake_phase_completed", { phase });
  clarityTag("intake_phase", phase);
}

export function trackIntakeStartFromIntro(): void {
  trackIntakeStarted();
  trackIntakePhaseCompleted("intro");
}
