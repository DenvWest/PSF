"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import * as Icons from "@/components/app/icons";
import DomainTodayStrip from "@/components/dashboard/DomainTodayStrip";
import { PILLAR } from "@/data/dashboard";
import { buildWeekSchedulePreview } from "@/lib/agenda-week-preview";
import { clarityTag } from "@/lib/clarity";
import {
  BEWEGING_SUPPLEMENT_ANCHOR,
  buildKompasDomainActions,
  type KompasDomainAction,
} from "@/lib/kompas-domain-actions";
import { trackEvent } from "@/lib/ga4";
import type { DashboardModel, PillarId } from "@/types/dashboard";

type KompasVandaagPanelProps = {
  model: DashboardModel;
  profileLabel?: string | null;
  nutritionLogCompleted: boolean;
  hasNutritionIntake: boolean;
  hasStressCheckin: boolean;
  onOpenDomain: (domain: PillarId) => void;
  onGoAgenda: (date: string) => void;
};

function resolveIcon(name: string, size = 16) {
  const Icon = (Icons as Record<string, ComponentType<{ s?: number }>>)[name];
  return Icon ? <Icon s={size} /> : null;
}

function DomainActionRow({
  action,
  onOpenDomain,
}: {
  action: KompasDomainAction;
  onOpenDomain: (domain: PillarId) => void;
}) {
  const trackClick = () => {
    trackEvent("dashboard_kompas_domain_action_click", {
      surface: "kompas_home",
      domain: action.domain,
      action_kind: action.actionKind,
    });
    clarityTag("dashboard_kompas_home", `action_${action.domain}_${action.actionKind}`);
  };

  const handleInternalClick = () => {
    trackClick();
    if (action.internalAction === "open_supplements") {
      onOpenDomain("beweging");
      if (typeof window !== "undefined") {
        window.requestAnimationFrame(() => {
          document.getElementById(BEWEGING_SUPPLEMENT_ANCHOR)?.scrollIntoView({ behavior: "smooth" });
        });
      }
      return;
    }
    onOpenDomain(action.domain);
  };

  const sharedClass =
    "flex min-h-[40px] w-full cursor-pointer items-center gap-2.5 rounded-lg border border-white/8 bg-black/15 px-2.5 py-2 text-left transition hover:border-white/14 hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-45";

  const content = (
    <>
      <span
        aria-hidden
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 text-[#CDD7D0]"
        style={{ color: action.color, borderColor: `${action.color}44`, background: `${action.color}12` }}
      >
        {resolveIcon(action.icon, 15)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-serif text-[13px] text-[#F1EFE8]">{action.domainLabel}</span>
        <span className="block truncate text-[11px] text-[#9FB0A6]">{action.actionLabel}</span>
      </span>
      <Icons.ChevronRight s={13} style={{ color: "#7E8C82", flexShrink: 0 }} />
    </>
  );

  if (action.disabled) {
    return (
      <button
        type="button"
        disabled
        title={action.disabledHint}
        className={sharedClass}
        style={{ fontFamily: "var(--f-sans)" }}
      >
        {content}
      </button>
    );
  }

  if (action.href) {
    return (
      <Link
        href={action.href}
        onClick={trackClick}
        className={sharedClass}
        style={{ fontFamily: "var(--f-sans)", textDecoration: "none", color: "inherit" }}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleInternalClick}
      className={sharedClass}
      style={{ fontFamily: "var(--f-sans)" }}
    >
      {content}
    </button>
  );
}

export function KompasLogboekSection({
  model,
  onGoVoortgang,
}: {
  model: DashboardModel;
  onGoVoortgang: () => void;
}) {
  const entries = model.history.slice(0, -1).reverse().slice(0, 5);

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-white/8 bg-black/15 px-3 py-3">
        <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7E8C82]">
          Logboek
        </p>
        <p className="mt-2 text-[12px] leading-relaxed text-[#9FB0A6] text-pretty">
          Elke check verschijnt hier — met je prioriteit van dat moment.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/8 bg-black/15 px-3 py-3">
      <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7E8C82]">
        Logboek
      </p>
      <ul className="mt-2.5 m-0 list-none space-y-0 p-0">
        {entries.map((entry) => {
          const priority = PILLAR[entry.priority];
          return (
            <li
              key={`${entry.seq}-${entry.date}`}
              className="flex items-center gap-2 border-t border-white/8 py-2 first:border-t-0 first:pt-0"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[12.5px] text-[#CDD7D0]">{entry.date}</span>
                <span className="mt-0.5 inline-flex items-center gap-1.5 text-[10.5px] text-[#9FB0A6]">
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: priority.color }}
                  />
                  {priority.label.toLowerCase()}
                </span>
              </span>
              <span
                className="font-serif text-[15px] tabular-nums text-[#F1EFE8]"
                style={{ fontFamily: "var(--f-serif)" }}
              >
                {entry.vitality}
              </span>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={() => {
          trackEvent("dashboard_kompas_logboek_link_click", { surface: "kompas_home" });
          clarityTag("dashboard_kompas_home", "logboek_link");
          onGoVoortgang();
        }}
        className="mt-2 inline-flex min-h-9 cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-[12px] font-semibold text-[#5A8F6A]"
        style={{ fontFamily: "var(--f-sans)" }}
      >
        Bekijk alles
        <Icons.ArrowRight s={13} />
      </button>
    </div>
  );
}

export default function KompasVandaagPanel({
  model,
  profileLabel = null,
  nutritionLogCompleted,
  hasNutritionIntake,
  hasStressCheckin,
  onOpenDomain,
  onGoAgenda,
}: KompasVandaagPanelProps) {
  const todaySlot = buildWeekSchedulePreview(model).find((slot) => slot.isToday) ?? null;
  const actions = buildKompasDomainActions({
    model,
    nutritionLogCompleted,
    hasNutritionIntake,
    hasStressCheckin,
  });
  const priorityAction =
    actions.find((action) => action.domain === model.priority.id) ?? actions[0] ?? null;
  const hasMoreDomains = actions.length > 1;

  const scrollToDomains = () => {
    trackEvent("dashboard_kompas_all_domains_click", { surface: "kompas_home" });
    clarityTag("dashboard_kompas_home", "all_domains");
    document.querySelector('[aria-label="Je leefstijl"]')?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {priorityAction ? (
        <div>
          <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9FB0A6]">
            Vandaag
          </p>
          <div className="mt-3 flex flex-col gap-1.5">
            <DomainActionRow action={priorityAction} onOpenDomain={onOpenDomain} />
            {hasMoreDomains ? (
              <button
                type="button"
                onClick={scrollToDomains}
                className="inline-flex min-h-8 cursor-pointer items-center gap-1 border-none bg-transparent px-0.5 text-[12px] font-semibold text-[#5A8F6A]"
                style={{ fontFamily: "var(--f-sans)" }}
              >
                Alle domeinen
                <Icons.ArrowRight s={12} />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {todaySlot ? (
        <DomainTodayStrip
          model={model}
          domain={todaySlot.domain}
          readOnly
          tone="dark"
          profileLabel={profileLabel}
          surface="kompas_home"
          onGoAgenda={() => onGoAgenda(todaySlot.date)}
        />
      ) : null}
    </div>
  );
}
