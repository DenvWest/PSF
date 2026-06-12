import {
  STRESS_QUESTIONS,
  STRESS_STATEMENTS,
  STRESS_CHOICES,
  STRESS_DEEPEN,
  type StressBand,
  type StressDimensionKey,
} from "@/data/stress-checkin";

export type StressSelfReport = { STR_FREQ?: number; STR_RCV?: number };

export type StressDimensionResult = {
  dimension: StressDimensionKey;
  band: StressBand;
  statement: string;
  choices: string[];
  deepen: string | null;
};

function bandFor(value: number): StressBand {
  if (value <= 2) return "aandacht";
  if (value === 3) return "redelijk";
  return "sterk";
}

export function assessStress(report: StressSelfReport): StressDimensionResult[] {
  const results: StressDimensionResult[] = [];
  for (const q of STRESS_QUESTIONS) {
    const value = report[q.field];
    if (typeof value !== "number") continue;
    const band = bandFor(value);
    const showChoice = band !== "sterk";
    results.push({
      dimension: q.dimension,
      band,
      statement: STRESS_STATEMENTS[q.dimension][band],
      choices: showChoice ? STRESS_CHOICES[q.dimension] : [],
      deepen: showChoice ? STRESS_DEEPEN[q.dimension] : null,
    });
  }
  return results;
}
