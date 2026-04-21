import { slaapThema } from "@/data/thema/slaap";

export const THEMA_DATA: Record<string, typeof slaapThema> = {
  slaap: slaapThema,
};

export const THEMA_SLUGS = Object.keys(THEMA_DATA);
