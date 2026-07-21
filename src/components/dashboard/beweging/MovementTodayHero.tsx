"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as Icons from "@/components/app/icons";
import { PILLAR } from "@/data/dashboard";
import { clarityTag } from "@/lib/clarity";
import { isPlanStepHidden, resolveActionKey } from "@/lib/day-model";
import { trackEvent, trackOnderbouwingLinkClick } from "@/lib/ga4";
import {
  buildMovementRecoveryHint,
  buildMovementRecoveryInput,
} from "@/lib/movement-recovery-hint";
import { useDailyActionLog } from "@/lib/use-daily-action-log";
import {
  buildVandaagFollowUp,
  getVandaagContextLine,
} from "@/lib/vandaag-card-links";
import type { WeekDaySlot } from "@/lib/agenda-week-preview";
import type { DashboardModel } from "@/types/dashboard";

const SURFACE = "kompas_beweging";

type MovementTodayHeroProps = {
  model: DashboardModel;
  slot: WeekDaySlot | null;
  onGoAgenda: () => void;
  onMakePriority: () => void;
  makePriorityBusy: boolean;
};

export default function MovementTodayHero({
  model,
  slot,
  onGoAgenda,
  onMakePriority,
  makePriorityBusy,
}: MovementTodayHeroProps) {
  const shownRef = useRef(false);
  const [noTimeOpen, setNoTimeOpen] = useState(false);

  const isOwnStep = Boolean(slot && slot.isToday && slot.domain === "beweging");
  const hidden = slot ? isPlanStepHidden(model, slot) : true;
  const active = isOwnStep && !hidden && slot != null;
  const actionKey = active && slot ? resolveActionKey(model, slot) : null;

  const recovery = buildMovementRecoveryHint(
    buildMovementRecoveryInput(model.domainScores, model.answers ?? {}),
  );
  const recoveryNote =
    recovery && (recovery.level === "rest" || recovery.level === "medical")
      ? recovery.body
      : null;

  const { done, loaded, busy, toggle } = useDailyActionLog({
    domain: "beweging",
    actionKey,
    enabled: active,
    surface: SURFACE,
    clarityScope: "kompas_beweging_hero",
  });

  useEffect(() => {
    if (shownRef.current) {
      return;
    }
    shownRef.current = true;
    trackEvent("dashboard_vandaag_card_shown", {
      has_active_habit: Boolean(model.activeHabit),
      priority: model.priority.id,
      surface: SURFACE,
      user_chosen: model.priorityIsUserChosen,
    });
    clarityTag("dashboard_kompas_beweging", "hero_shown");
  }, [model.activeHabit, model.priority.id, model.priorityIsUserChosen]);

  const followUp = buildVandaagFollowUp("beweging");
  const supportingLine =
    slot?.rationale ?? getVandaagContextLine(PILLAR.beweging, model.activeHabit);

  // Doorverwijs-modus: beweging is vandaag niet je dagstap → geen tweede afvink,
  // wel de "maak dit je prioriteit"-CTA (day-model blijft de ene dag-waarheid).
  if (!active) {
    const otherLabel = slot ? PILLAR[slot.domain].label.toLowerCase() : null;
    return (
      <section
        aria-label="Vandaag — beweging"
        className="rounded-2xl border border-[color:var(--ac)]/40 bg-black/25 p-5"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--ac)]">
          Vandaag
        </p>
        <h3 className="mt-2 font-serif text-[21px] leading-snug text-[#F1EFE8] text-pretty">
          {otherLabel
            ? `Vandaag ligt je stap bij ${otherLabel}.`
            : "Nog geen stap gepland voor vandaag."}
        </h3>
        <p className="mt-2 text-[14px] leading-relaxed text-[#9FB0A6] text-pretty">
          Wil je dat beweging je dagelijkse stap wordt? Dan zetten we ’m bovenaan
          in je Mijn Dag — één actie per dag, geen zeven lijstjes.
        </p>
        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            disabled={makePriorityBusy}
            onClick={onMakePriority}
            className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-none bg-[color:var(--ac)] px-4 text-[14px] font-semibold text-[#0f1c10] transition-opacity disabled:opacity-60"
          >
            Maak beweging mijn prioriteit
          </button>
          <button
            type="button"
            onClick={onGoAgenda}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-transparent px-4 text-[14px] font-semibold text-[#E7EDE8]"
          >
            Open Mijn Dag <Icons.ArrowRight s={15} />
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Vandaag — beweging"
      className="relative overflow-hidden rounded-2xl border border-[color:var(--ac)]/45 bg-black/25 p-5"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full opacity-30 blur-[80px]"
        style={{ background: "var(--ac)" }}
      />
      <div className="relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--ac)]">
          Vandaag{slot?.title ? " · je stap" : ""}
        </p>
        <h3 className="mt-2 font-serif text-[22px] leading-snug text-[#F1EFE8] text-pretty">
          {slot?.title}
        </h3>
        {supportingLine ? (
          <p className="mt-2 text-[14px] leading-relaxed text-[#CDD7D0] text-pretty">
            {supportingLine}
          </p>
        ) : null}

        {recoveryNote ? (
          <p className="mt-3 rounded-xl border border-white/10 bg-black/25 px-3.5 py-2.5 text-[13px] leading-relaxed text-[#E7EDE8] text-pretty">
            {recoveryNote}
          </p>
        ) : null}

        <button
          type="button"
          aria-label={done ? "Actie afgevinkt voor vandaag" : "Markeer als gedaan vandaag"}
          aria-pressed={done}
          disabled={!loaded || busy}
          onClick={() => void toggle()}
          className="mt-4 flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-none px-4 text-[15px] font-semibold transition-opacity disabled:opacity-60"
          style={{
            background: done ? "rgba(90,143,106,0.22)" : "var(--ac)",
            color: done ? "#E7EDE8" : "#0f1c10",
          }}
        >
          {done ? (
            <>
              <Icons.Check s={16} /> Gedaan
            </>
          ) : (
            "Markeer als gedaan"
          )}
        </button>

        {done ? (
          <p className="mt-3 text-center text-[13px] text-[#9FB0A6]">
            Morgen staat hier je volgende stap.
          </p>
        ) : (
          <button
            type="button"
            onClick={() => setNoTimeOpen((open) => !open)}
            aria-expanded={noTimeOpen}
            className="mt-3 w-full cursor-pointer border-none bg-transparent p-0 text-center text-[13px] font-medium text-[#9FB0A6]"
          >
            Geen tijd vandaag?
          </button>
        )}

        {noTimeOpen && !done ? (
          <p className="mt-2 rounded-xl border border-white/10 bg-black/25 px-3.5 py-2.5 text-[13px] leading-relaxed text-[#CDD7D0] text-pretty">
            Drukke dag? Doe alleen de eerste set — dat telt volledig mee. Of
            verplaats ’m naar vanavond via{" "}
            <button
              type="button"
              onClick={onGoAgenda}
              className="cursor-pointer border-none bg-transparent p-0 font-semibold text-[color:var(--ac)] underline underline-offset-2"
            >
              Mijn Dag
            </button>
            .
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          {slot ? (
            <Link
              href={slot.evidenceHref}
              onClick={() => {
                trackOnderbouwingLinkClick({ surface: "kompas_home", domain: "beweging" });
                clarityTag("onderbouwing_link", "kompas_beweging");
              }}
              className="inline-flex items-center gap-1 text-[13px] font-medium text-[#9FB0A6] no-underline"
            >
              Waarom? <Icons.ArrowRight s={13} />
            </Link>
          ) : null}
          {done ? (
            <Link
              href={followUp.href}
              className="inline-flex items-center gap-1 text-[13px] font-medium text-[color:var(--ac)] no-underline"
            >
              {followUp.label} <Icons.ArrowRight s={13} />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
