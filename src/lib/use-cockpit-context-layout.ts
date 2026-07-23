"use client";

import {
  COCKPIT_CONTEXT_SHEET_MQ,
  COCKPIT_CONTEXT_SIDEBAR_MQ,
  resolveCockpitContextPresentation,
  type CockpitContextPresentation,
} from "@/lib/cockpit-context-layout";
import { useMediaQuery } from "@/lib/use-media-query";

export function useCockpitContextLayout(): CockpitContextPresentation {
  const isSidebar = useMediaQuery(COCKPIT_CONTEXT_SIDEBAR_MQ);
  const isSheet = useMediaQuery(COCKPIT_CONTEXT_SHEET_MQ);
  return resolveCockpitContextPresentation(isSidebar, isSheet);
}

export function useCockpitContextDrawerMode(): boolean {
  const presentation = useCockpitContextLayout();
  return presentation !== "sidebar";
}
