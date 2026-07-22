"use client";

import * as Icons from "@/components/app/icons";

type CockpitProfileRailProps = {
  firstName?: string | null;
  anchorLabel?: string | null;
  statusDone: boolean;
  onCheckin?: () => void;
};

const ZONEFLAG =
  "text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#7E8C82]";

function StatusDot({ statusDone }: { statusDone: boolean }) {
  return (
    <span
      aria-label={statusDone ? "Gedaan" : "Nog te doen"}
      className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border ${
        statusDone
          ? "border-[#5A8F6A] bg-[#5A8F6A] text-[#0f1c10]"
          : "border-[#7E8C82] text-transparent"
      }`}
    >
      {statusDone ? <Icons.Check s={11} /> : null}
    </span>
  );
}

export default function CockpitProfileRail({
  firstName,
  anchorLabel,
  statusDone,
  onCheckin,
}: CockpitProfileRailProps) {
  const name = firstName?.trim() || "Je profiel";

  return (
    <>
      <aside
        aria-label="Profiel"
        className="flex items-center gap-2.5 border-b border-white/10 px-4 py-2.5 md:hidden"
      >
        <span
          aria-hidden
          className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-[#C8956C] to-[#9c6a44]"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate font-serif text-[15px] leading-tight text-[#F1EFE8]">
            {name}
          </div>
          {anchorLabel ? (
            <div className="truncate text-[11px] text-[#9FB0A6]">
              voor: {anchorLabel}
            </div>
          ) : null}
        </div>
        <StatusDot statusDone={statusDone} />
        {onCheckin ? (
          <button
            type="button"
            onClick={onCheckin}
            className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-[#9FB0A6] transition hover:border-white/20 hover:text-[#F1EFE8]"
          >
            Check-in
          </button>
        ) : null}
      </aside>

      <aside
        aria-label="Profiel"
        className="hidden flex-col gap-4 border-b border-white/10 p-4 md:flex md:border-b-0 md:border-r"
      >
        <span className={ZONEFLAG}>Wie ben ik</span>

        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-[#C8956C] to-[#9c6a44]"
          />
          <div className="min-w-0">
            <div className="font-serif text-[17px] leading-tight text-[#F1EFE8]">
              {name}
            </div>
            {anchorLabel ? (
              <div className="truncate text-[11.5px] text-[#9FB0A6]">
                voor: {anchorLabel}
              </div>
            ) : null}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.08em] text-[#7E8C82]">
              Vandaag
            </span>
            <StatusDot statusDone={statusDone} />
          </div>
          <p className="mt-2 text-[12px] leading-snug text-[#9FB0A6]">
            {statusDone
              ? "Gedaan — je stap van vandaag is afgevinkt."
              : "Je dagstap staat klaar — nog niet afgevinkt."}
          </p>
        </div>

        {onCheckin ? (
          <button
            type="button"
            onClick={onCheckin}
            className="rounded-[14px] border border-dashed border-white/10 p-3 text-left transition hover:border-white/20"
          >
            <span className="text-[13.5px] font-medium text-[#F1EFE8]">
              Hoe voel je je vandaag?
            </span>
            <span className="mt-1 flex items-center gap-1.5 text-[12px] text-[#9FB0A6]">
              Korte check-in <Icons.ArrowRight s={13} />
            </span>
          </button>
        ) : null}
      </aside>
    </>
  );
}
