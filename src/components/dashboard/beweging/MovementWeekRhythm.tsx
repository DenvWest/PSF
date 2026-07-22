"use client";

import { useEffect, useState } from "react";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import {
  buildWeekRhythm,
  type WeekRhythmChip,
} from "@/lib/movement-week-rhythm";

type WeekLogApiState = { keys: string[] };

function WeekRhythmSkeleton() {
  return (
    <CockpitTile eyebrow="Deze week" ariaLabel="Deze week">
      <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-white/10" />
    </CockpitTile>
  );
}

function WeekRhythmContent({ chips }: { chips: WeekRhythmChip[] }) {
  if (chips.length === 0) {
    return (
      <p className="mt-2 text-[13px] leading-relaxed text-[#9FB0A6] text-pretty">
        Nog niets deze week — je eerste moment telt al mee.
      </p>
    );
  }

  if (chips.length === 1 && chips[0].tag === "herstel") {
    return (
      <p className="mt-2 text-[13px] leading-relaxed text-[#9FB0A6] text-pretty">
        Vooral herstel deze week — dat is óók bouwen.
      </p>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
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
    <CockpitTile eyebrow="Deze week" ariaLabel="Deze week">
      <WeekRhythmContent chips={chips} />
    </CockpitTile>
  );
}
