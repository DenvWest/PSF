/** Onder lg: bottom sheet (mobiel) of zij-drawer (tablet). Vanaf lg: vaste sidebar (iPad landscape + desktop). */
export const COCKPIT_CONTEXT_SIDEBAR_MQ = "(min-width: 1024px)";
export const COCKPIT_CONTEXT_SHEET_MQ = "(max-width: 639px)";

export type CockpitContextPresentation = "sheet" | "drawer" | "sidebar";

export function resolveCockpitContextPresentation(
  isSidebar: boolean,
  isSheet: boolean,
): CockpitContextPresentation {
  if (isSidebar) {
    return "sidebar";
  }
  if (isSheet) {
    return "sheet";
  }
  return "drawer";
}

/** Wat de context-knop in de header doet, gegeven presentatie + inklap-stand. */
export type CockpitContextTriggerAction = "open" | "expand" | "focus";

export function resolveCockpitContextTriggerAction(
  presentation: CockpitContextPresentation,
  collapsed: boolean,
): CockpitContextTriggerAction {
  if (presentation !== "sidebar") {
    return "open";
  }
  return collapsed ? "expand" : "focus";
}
