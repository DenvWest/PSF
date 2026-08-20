"use client";

import { useState } from "react";
import * as Icons from "@/components/app/icons";
import AgendaScheduleFields from "@/components/dashboard/agenda/AgendaScheduleFields";
import { deriveDefaultScheduledTime } from "@/lib/account-priority-pref";
import { addAgendaDays, todayInAgendaTimezone } from "@/lib/agenda-week-preview";
import { clarityTag } from "@/lib/clarity";
import { buildDashboardAgendaHref } from "@/lib/dashboard-url";
import { trackEvent } from "@/lib/ga4";
import {
  formatMomentDay,
  formatMomentLabel,
  isLadderMomentDomain,
  LADDER_MOMENT_DEFAULT_MINUTES,
  LADDER_MOMENT_WINDOW_DAYS,
  resolveQuickLadderMoment,
  type LadderMomentDraft,
} from "@/lib/ladder-moments";
import { useLadderMoments } from "@/lib/ladder-moments-context";
import type { PillarId } from "@/types/dashboard";

type LadderMomentButtonProps = {
  domain: PillarId;
  /** De actietekst. Is tegelijk de titel van het agenda-blok. */
  title: string;
  surface: string;
  /** De laag waar de actie vandaan komt — gaat alleen de meting in. */
  layer?: number;
};

const CHIP =
  "inline-flex min-h-9 cursor-pointer items-center justify-center rounded-full border px-3 text-[12px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";
const CHIP_ON = `${CHIP} border-[#5A8F6A]/55 bg-[#5A8F6A]/20 text-[#F1EFE8]`;
const CHIP_OFF = `${CHIP} border-white/10 bg-white/[0.03] text-[#9FB0A6] hover:border-white/25`;

/**
 * "Zet op Mijn Dag" met een moment eronder.
 *
 * Tot 20 augustus zette deze knop niets: op de prebuild verwisselde hij een
 * label, in React hield hij sessie-state vast die bij de volgende render weg
 * was. Er was geen datum, geen tijd, en niets dat je dag ooit bereikte. Nu
 * schrijft hij een echt blok in je agenda — één datum, één tijdstip — en
 * leest hij dat blok terug als je het scherm opnieuw opent.
 *
 * Geen herhaling: `agenda_blocks` kent er geen, en een reeks suggereren die
 * er niet is, is precies het soort belofte dat we niet doen. Het wekelijkse
 * ritme woont in je programma.
 */
export default function LadderMomentButton({
  domain,
  title,
  surface,
  layer,
}: LadderMomentButtonProps) {
  const moments = useLadderMoments();
  const today = todayInAgendaTimezone();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(today);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [durationMinutes, setDurationMinutes] = useState(LADDER_MOMENT_DEFAULT_MINUTES);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buiten de provider (of op een domein zonder agenda-categorie) is er geen
  // dag om iets op te zetten. Dan verdwijnt de knop stil.
  if (!moments || !isLadderMomentDomain(domain)) {
    return null;
  }

  const block = moments.momentFor(domain, title);
  const resolvedStart = startTime ?? deriveDefaultScheduledTime("ochtend");
  // Het voorstel achter één klik. Pas tonen als de provider geladen is: vóór
  // die tijd rendert de server "vandaag" en de client mogelijk "morgen".
  const quick = resolveQuickLadderMoment(new Date(), today);

  function openPicker() {
    if (block) {
      setDate(block.date);
      setStartTime(block.startTime);
    } else {
      setDate(today);
      setStartTime(null);
    }
    setError(null);
    setOpen(true);
  }

  async function planQuick() {
    if (!moments || !isLadderMomentDomain(domain)) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await moments.plan(domain, title, quick);
      trackEvent("ladder_moment_gepland", {
        domain,
        ...(layer != null ? { layer } : {}),
        surface,
        date: quick.date,
        quick: true,
      });
      clarityTag("ladder_moment", domain);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Kon het moment niet opslaan.");
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    if (!moments || !isLadderMomentDomain(domain)) {
      return;
    }
    const draft: LadderMomentDraft = { date, startTime: resolvedStart, durationMinutes };
    setBusy(true);
    setError(null);
    try {
      if (block) {
        await moments.move(block.id, draft);
        trackEvent("ladder_moment_verplaatst", {
          domain,
          ...(layer != null ? { layer } : {}),
          surface,
          date: draft.date,
        });
      } else {
        await moments.plan(domain, title, draft);
        trackEvent("ladder_moment_gepland", {
          domain,
          ...(layer != null ? { layer } : {}),
          surface,
          date: draft.date,
        });
        clarityTag("ladder_moment", domain);
      }
      setOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Kon het moment niet opslaan.");
    } finally {
      setBusy(false);
    }
  }

  async function removeMoment() {
    if (!moments || !block) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await moments.cancel(block.id);
      trackEvent("ladder_moment_weggehaald", {
        domain,
        ...(layer != null ? { layer } : {}),
        surface,
      });
      setOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Kon het moment niet weghalen.");
    } finally {
      setBusy(false);
    }
  }

  const picker = open ? (
    <div className="mt-2.5 w-full rounded-[12px] border border-white/10 bg-black/25 p-3">
      <p className="mb-2 text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#7E8C82]">
        Welke dag?
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => setDate(today)}
          aria-pressed={date === today}
          className={date === today ? CHIP_ON : CHIP_OFF}
        >
          Vandaag
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => setDate(addAgendaDays(today, 1))}
          aria-pressed={date === addAgendaDays(today, 1)}
          className={date === addAgendaDays(today, 1) ? CHIP_ON : CHIP_OFF}
        >
          Morgen
        </button>
        <label className="flex min-h-9 items-center gap-2 text-[12px] text-[#9FB0A6]">
          <span className="sr-only">Andere datum</span>
          <input
            type="date"
            value={date}
            min={today}
            max={addAgendaDays(today, LADDER_MOMENT_WINDOW_DAYS)}
            disabled={busy}
            onChange={(event) => setDate(event.target.value)}
            className="min-h-9 rounded-[10px] border border-white/10 bg-black/25 px-2.5 text-[13px] tabular-nums text-[#F1EFE8]"
          />
        </label>
      </div>

      <div className="mt-3">
        <AgendaScheduleFields
          startTime={startTime}
          onStartTimeChange={setStartTime}
          defaultBucket="ochtend"
          durationMinutes={durationMinutes}
          onDurationChange={setDurationMinutes}
          showDuration
          busy={busy}
          variant="compact-dark"
        />
      </div>

      {error ? (
        <p role="status" className="mt-2 text-[11.5px] leading-relaxed text-[#C8956C]">
          {error}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void submit()}
          className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full border border-[#5A8F6A]/55 bg-[#5A8F6A]/20 px-3.5 text-[12.5px] font-semibold text-[#F1EFE8] disabled:opacity-60"
        >
          <Icons.Check s={13} />
          {block ? "Verplaats" : "Zet klaar"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => setOpen(false)}
          className="min-h-9 cursor-pointer border-none bg-transparent px-1 text-[12.5px] text-[#9FB0A6]"
        >
          Annuleer
        </button>
        {block ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void removeMoment()}
            className="min-h-9 cursor-pointer border-none bg-transparent px-1 text-[12.5px] text-[#7E8C82] underline"
          >
            Haal van mijn dag
          </button>
        ) : null}
      </div>
      <p className="mt-2.5 text-[11px] leading-relaxed text-[#7E8C82]">
        Eén moment op je agenda. Verzetten kan altijd — een ritme staat in je programma, niet hier.
      </p>
    </div>
  ) : null;

  if (block) {
    return (
      <div className="w-full">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {/* Het moment is de ingang naar Mijn Dag, niet alleen een mededeling:
              wat je hier plant staat dáár, op die dag, tussen de rest. Binnen
              /dashboard verschuift alleen de queryparam, dus pushState +
              popstate zoals de rest van het dashboard — een router.push zou er
              een volledige RSC-render van maken (zie PrebuildFrame). */}
          <button
            type="button"
            onClick={() => {
              trackEvent("ladder_moment_geopend_op_mijn_dag", {
                domain,
                ...(layer != null ? { layer } : {}),
                surface,
              });
              const href = buildDashboardAgendaHref(block.date);
              if (window.location.pathname === "/dashboard") {
                window.history.pushState(null, "", href);
                window.dispatchEvent(new PopStateEvent("popstate"));
                return;
              }
              window.location.assign(href);
            }}
            className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-[#5A8F6A]/40 bg-[#5A8F6A]/[0.14] px-2.5 text-[11.5px] font-semibold text-[#9CC5A9]"
          >
            <Icons.Check s={13} />
            Staat op Mijn Dag · {formatMomentLabel(block.date, block.startTime, today)}
            <Icons.ChevronRight s={12} />
          </button>
          <button
            type="button"
            onClick={() => (open ? setOpen(false) : openPicker())}
            aria-expanded={open}
            className="cursor-pointer border-none bg-transparent p-0 text-[12px] font-semibold text-[#9FB0A6] underline"
          >
            Verplaatsen
          </button>
        </div>
        {picker}
      </div>
    );
  }

  // Eén klik plant hem op het eerstvolgende dagdeel dat nog past. De
  // bestemming staat in het opschrift, dus er wordt niets voor je besloten
  // wat je niet ziet — en verzetten of weghalen kan daarna in dezelfde rij.
  return (
    <div className="w-full">
      <button
        type="button"
        disabled={busy}
        onClick={() => void planQuick()}
        className="inline-flex min-h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-[#5A8F6A]/40 bg-[#5A8F6A]/[0.14] px-2.5 text-[11.5px] font-semibold text-[#9CC5A9] disabled:opacity-60"
      >
        <Icons.Calendar s={13} />
        Zet op Mijn Dag
        {moments.hydrated ? (
          <span className="font-normal text-[#7E8C82]">
            &rsaquo; {formatMomentDay(quick.date, today)}
          </span>
        ) : null}
      </button>
      {error ? (
        <p role="status" className="mt-1.5 text-[11.5px] leading-relaxed text-[#C8956C]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
