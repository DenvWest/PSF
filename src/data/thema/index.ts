import type { ThemaPageData } from "@/types/thema";
import { slaapThema } from "@/data/thema/slaap";
import { stressThema } from "@/data/thema/stress";
import { energieThema } from "@/data/thema/energie";

export const THEMA_DATA: Record<string, ThemaPageData> = {
  slaap: slaapThema,
  stress: stressThema,
  energie: energieThema,
};

export const THEMA_SLUGS = Object.keys(THEMA_DATA);
