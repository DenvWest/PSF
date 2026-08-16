/**
 * Canonical /beste/* paths — single source for intake-engine and supplement-routes.
 * Eén sleutel per live vergelijking in `src/data/supplements/index.ts`; een pad hier
 * betekent dat de route bereikbaar is, niet dat de engine hem mag aanbevelen
 * (ashwagandha blijft on-hold, zie COMPLIANCE.md).
 */
export const COMPARISON_PATHS = {
  magnesium: "/beste/magnesium",
  "omega-3-supplement": "/beste/omega-3-supplement",
  zink: "/beste/zink",
  creatine: "/beste/creatine",
  "vitamine-d": "/beste/vitamine-d",
  eiwitpoeder: "/beste/eiwitpoeder",
  ashwagandha: "/beste/ashwagandha",
} as const;
