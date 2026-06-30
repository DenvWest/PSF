import { trackEvent } from "@/lib/ga4";

export const REVEAL_STEP_IDS = {
  start: "reveal-step-start",
  save: "reveal-step-save",
} as const;

export type RevealScrollTarget = keyof typeof REVEAL_STEP_IDS;

export function scrollToRevealStep(target: RevealScrollTarget): void {
  trackEvent("reveal_scroll_to_step", { target });
  document.getElementById(REVEAL_STEP_IDS[target])?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}
