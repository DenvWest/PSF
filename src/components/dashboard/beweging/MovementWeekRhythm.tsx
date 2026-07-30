"use client";

import { useEffect, useState } from "react";
import {
  buildWeekFocusSentence,
  buildWeekRhythm,
} from "@/lib/movement-week-rhythm";
import type { WeekCategory } from "@/lib/movement-week-categories";

type WeekLogApiState = { keys: string[] };

/** Zelfde kaart-look als CockpitInspector's tekstkaarten, zodat dit als
 * inspector-inhoud leest i.p.v. een los, dikker blok (CockpitTile). */
const CARD_CLASS = "rounded-[14px] border border-white/10 bg-black/20 p-4";
const KICKER_CLASS =
  "mb-2 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#9FB0A6]";

function WeekRhythmSkeleton() {
  return (
    <div className={CARD_CLASS} aria-label="Deze week">
      <span className={KICKER_CLASS}>Deze week</span>
      <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
    </div>
  );
}

export default function MovementWeekRhythm({
  startPattern = null,
}: {
  startPattern?: WeekCategory | null;
}) {
  const [keys, setKeys] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch(
          "/api/account/daily-log?range=7&domain=beweging",
          { credentials: "include" },
        );
        if (!response.ok || cancelled) {
          return;
        }
        const state = (await response.json()) as WeekLogApiState;
        if (cancelled) {
          return;
        }
        setKeys(state.keys);
      } finally {
        if (!cancelled) {
          setLoaded(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!loaded) {
    return <WeekRhythmSkeleton />;
  }

  const chips = buildWeekRhythm(keys);
  const sentence = buildWeekFocusSentence(chips, startPattern);

  return (
    <div className={CARD_CLASS} aria-label="Deze week">
      <span className={KICKER_CLASS}>Deze week</span>
      <p className="text-[12.5px] leading-relaxed text-[#9FB0A6] text-pretty">{sentence}</p>
    </div>
  );
}
