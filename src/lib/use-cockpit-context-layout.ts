"use client";

import {
  COCKPIT_CONTEXT_SHEET_MQ,
  resolveCockpitContextPresentation,
  resolveCockpitContextSidebarMq,
  type CockpitContextPresentation,
} from "@/lib/cockpit-context-layout";
import { useMediaQuery } from "@/lib/use-media-query";

type CockpitContextLayoutOptions = {
  /** Mijn Dag: sidebar pas vanaf xl; daaronder drawer over agenda. */
  overlayUntilXl?: boolean;
};

export function useCockpitContextLayout(
  options: CockpitContextLayoutOptions = {},
): CockpitContextPresentation {
  const sidebarMq = resolveCockpitContextSidebarMq(
    options.overlayUntilXl ?? false,
  );
  const isSidebar = useMediaQuery(sidebarMq);
  const isSheet = useMediaQuery(COCKPIT_CONTEXT_SHEET_MQ);
  return resolveCockpitContextPresentation(isSidebar, isSheet);
}

export function useCockpitContextDrawerMode(
  options: CockpitContextLayoutOptions = {},
): boolean {
  const presentation = useCockpitContextLayout(options);
  return presentation !== "sidebar";
}
