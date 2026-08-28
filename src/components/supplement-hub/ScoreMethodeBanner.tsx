"use client";

import Link from "next/link";
import {
  PS_SCORE_MODEL_VERSION,
  SCORE_COMPONENT_LABELS,
  SCORE_WEIGHTS,
} from "@/data/supplement-hub/score-model";
import { GA4_EVENTS, trackEvent } from "@/lib/ga4";
import type { ScoreComponentId } from "@/types/supplement-score";

type ScoreMethodeBannerProps = {
  className?: string;
};

export default function ScoreMethodeBanner({
  className = "",
}: ScoreMethodeBannerProps) {
  const componenten = Object.keys(SCORE_WEIGHTS) as ScoreComponentId[];

  return (
    <aside
      className={`rounded-2xl border border-stone-200 bg-white px-6 py-5 ${className}`}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h3 className="font-display text-base font-semibold text-stone-900">
            De PS-Score rekenen we uit, we typen hem niet in
          </h3>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {componenten.map((id) => (
              <li key={id} className="text-xs text-stone-500">
                {SCORE_COMPONENT_LABELS[id]}{" "}
                <span className="font-medium text-stone-700">
                  {Math.round(SCORE_WEIGHTS[id] * 100)}%
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-stone-400">
            Model {PS_SCORE_MODEL_VERSION} · prijs zit bewust niet in de score
          </p>
        </div>

        <Link
          href="/ps-score"
          className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl border border-ps-green px-5 py-2.5 text-sm font-semibold text-ps-green transition-all hover:bg-ps-green hover:text-white"
          onClick={() =>
            trackEvent(GA4_EVENTS.SUPPLEMENTEN_METHODIEK_GEOPEND, {
              bron: "banner",
              model_versie: PS_SCORE_MODEL_VERSION,
            })
          }
        >
          Hele methode →
        </Link>
      </div>
    </aside>
  );
}
