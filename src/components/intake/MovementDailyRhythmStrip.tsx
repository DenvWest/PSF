"use client";

import MovementDailyRhythmContent from "@/components/intake/MovementDailyRhythmContent";
import type { MovementDailyRhythm } from "@/lib/movement-daily-rhythm";

/** @deprecated Use MovementDailyRhythmContent embedded in MovementWeekCategoryPanel. */
type MovementDailyRhythmStripProps = {
  rhythm: MovementDailyRhythm;
  domain: string;
  templateVersion: string;
};

export default function MovementDailyRhythmStrip({
  rhythm,
  domain,
  templateVersion,
}: MovementDailyRhythmStripProps) {
  return (
    <section
      aria-labelledby="daily-rhythm-heading"
      className="mb-5 rounded-2xl border border-intake-card-border bg-intake-bg-elevated/50 px-4 py-4"
    >
      <h3 id="daily-rhythm-heading" className="text-sm font-semibold text-intake-ink">
        Dagelijks ritme
      </h3>
      <MovementDailyRhythmContent
        rhythm={rhythm}
        domain={domain}
        templateVersion={templateVersion}
      />
    </section>
  );
}
