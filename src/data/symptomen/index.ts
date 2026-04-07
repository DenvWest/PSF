import type { SymptoomData, OorzakenData, OplossingenData, SymptoomSlug } from "@/types/symptomen";
import { stressHub, stressOorzaken, stressOplossingen } from "./stress";
import { slaapHub, slaapOorzaken, slaapOplossingen } from "./slaap";
import { energieHub, energieOorzaken, energieOplossingen } from "./energie";

export const VALID_SLUGS = ["stress", "slaap", "energie"] as const satisfies readonly SymptoomSlug[];

const hubMap: Record<SymptoomSlug, SymptoomData> = {
  stress: stressHub,
  slaap: slaapHub,
  energie: energieHub,
};

const oorzakenMap: Record<SymptoomSlug, OorzakenData> = {
  stress: stressOorzaken,
  slaap: slaapOorzaken,
  energie: energieOorzaken,
};

const oplossingenMap: Record<SymptoomSlug, OplossingenData> = {
  stress: stressOplossingen,
  slaap: slaapOplossingen,
  energie: energieOplossingen,
};

export function isValidSlug(slug: string): slug is SymptoomSlug {
  return VALID_SLUGS.includes(slug as SymptoomSlug);
}

export function getSymptoomData(slug: SymptoomSlug): SymptoomData {
  return hubMap[slug];
}

export function getOorzakenData(slug: SymptoomSlug): OorzakenData {
  return oorzakenMap[slug];
}

export function getOplossingenData(slug: SymptoomSlug): OplossingenData {
  return oplossingenMap[slug];
}
