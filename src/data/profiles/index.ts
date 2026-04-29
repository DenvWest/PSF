import type { ProfilePageData } from "@/types/profile-page";
import { stressdragerProfile } from "./stressdrager";
import { lageBatterijProfile } from "./lage-batterij";

export const PROFILE_PAGES: Record<string, ProfilePageData> = {
  stressdrager: stressdragerProfile,
  "lage-batterij": lageBatterijProfile,
};

export const PROFILE_SLUGS = Object.keys(PROFILE_PAGES);
