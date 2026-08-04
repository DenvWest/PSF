/** Onder xl: bottom sheet (mobiel) of zij-drawer (tablet/iPad landscape). Vanaf xl: vaste sidebar. */
export const COCKPIT_CONTEXT_SIDEBAR_MQ = "(min-width: 1280px)";
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
