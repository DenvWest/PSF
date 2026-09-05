import type { ProfilePageData } from "@/types/profile-page";
import { stressdragerProfile } from "./stressdrager";
import { lageEnergieProfile } from "./lage-energie";
import { onrustigeSlaper } from "./onrustige-slaper";
import { overtrainerProfile } from "./overtrainer";

export const PROFILE_PAGES: Record<string, ProfilePageData> = {
  stressdrager: stressdragerProfile,
  "lage-energie": lageEnergieProfile,
  "onrustige-slaper": onrustigeSlaper,
  overtrainer: overtrainerProfile,
};

export const PROFILE_SLUGS = Object.keys(PROFILE_PAGES);

/** Profiellabel uit de engine → de profielpagina die erbij hoort. */
export const PROFILE_SLUG_BY_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(PROFILE_PAGES).map(([slug, page]) => [page.label, slug]),
);
