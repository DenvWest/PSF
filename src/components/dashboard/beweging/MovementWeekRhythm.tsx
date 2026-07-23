"use client";

import { useEffect, useState } from "react";
import {
  buildWeekRhythm,
  type WeekRhythmChip,
} from "@/lib/movement-week-rhythm";

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

function WeekRhythmContent({ chips }: { chips: WeekRhythmChip[] }) {
  if (chips.length === 0) {
    return (
      <p className="text-[12.5px] leading-relaxed text-[#9FB0A6] text-pretty">
        Nog niets deze week — je eerste moment telt al mee.
      </p>
    );
  }

  if (chips.length === 1 && chips[0].tag === "herstel") {
    return (
      <p className="text-[12.5px] leading-relaxed text-[#9FB0A6] text-pretty">
        Vooral herstel deze week — dat is óók bouwen.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <span
          key={chip.tag}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[10.5px] text-[#F1EFE8]"
        >
          {chip.label} {chip.count}×
        </span>
      ))}
    </div>
  );
}

export default function MovementWeekRhythm() {
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

  return (
    <div className={CARD_CLASS} aria-label="Deze week">
      <span className={KICKER_CLASS}>Deze week</span>
      <WeekRhythmContent chips={chips} />
    </div>
  );
}
