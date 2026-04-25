import type { ThemaPageData } from "@/types/thema";
import { slaapThema } from "@/data/thema/slaap";
import { stressThema } from "@/data/thema/stress";
import { energieThema } from "@/data/thema/energie";
import { herstelThema } from "@/data/thema/herstel";

export const THEMA_DATA: Record<string, ThemaPageData> = {
  slaap: slaapThema,
  stress: stressThema,
  energie: energieThema,
  herstel: herstelThema,
};

export const THEMA_SLUGS = Object.keys(THEMA_DATA);
