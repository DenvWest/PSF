import type { ProfilePageData } from "@/types/profile-page";
import { stressdragerProfile } from "./stressdrager";
import { lageBatterijProfile } from "./lage-batterij";
import { onrustigeSlaper } from "./onrustige-slaper";
import { stilleSlijter } from "./stille-slijter";
import { stilleTekorten } from "./stille-tekorten";
import { overtrainer } from "./overtrainer";

export const PROFILE_PAGES: Record<string, ProfilePageData> = {
  stressdrager: stressdragerProfile,
  "lage-batterij": lageBatterijProfile,
  "onrustige-slaper": onrustigeSlaper,
  "stille-slijter": stilleSlijter,
  "stille-tekorten": stilleTekorten,
  overtrainer: overtrainer,
};

export const PROFILE_SLUGS = Object.keys(PROFILE_PAGES);
