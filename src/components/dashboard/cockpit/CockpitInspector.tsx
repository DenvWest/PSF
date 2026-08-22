"use client";

import { useEffect, type ComponentType, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import * as Icons from "@/components/app/icons";
import InspectorLayerChips from "@/components/dashboard/cockpit/InspectorLayerChips";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { clarityTag } from "@/lib/clarity";
import {
  INSPECTOR_EVIDENCE_STATUS_LABEL,
  type InspectorCard,
  type InspectorEvidenceStatus,
} from "@/lib/cockpit-inspector";
import { useDomainLadderFocus } from "@/lib/domain-ladder-focus-context";
import { trackEvent } from "@/lib/ga4";

type IconComp = ComponentType<{ s?: number; style?: CSSProperties }>;

type CockpitInspectorProps = {
  cards: InspectorCard[];
  /** Maakt de "meet"-kaart actionable (universeel, niet domein-gebonden). */
  remeasureAction?: { due: boolean; onClick: () => void };
  /** Actie onder de Future You-kaart (bv. stille anker-herkeuze). */
  doelFooter?: ReactNode;
  /** Actie onder de ijkpunt-kaart (DomeinDoelZetten, geen nieuwe flow). */
  ijkpuntAction?: { label: string; onClick: () => void };
  /** Domein-specifieke compacte widget (bv. week-ritme) — zelfde kaart-look
   * als hierboven, zodat het écht als inspector-inhoud leest i.p.v. een los
   * blok. Eén stuk, telt mee voor de rustige, beperkte totaalindruk. */
  extra?: ReactNode;
  /** Koppelt aria-labelledby op de context-drawer. */
  titleId?: string;
  /** Sluitknop in drawer-modus; niet getoond in vaste sidebar. */
  onClose?: () => void;
  /** Inklapknop in sidebar-modus; geeft de midden-zone de vrijgekomen ruimte. */
  onCollapse?: () => void;
  /** Compactere typografie/spacing in bottom sheet (mobiel). */
  compact?: boolean;
  /** P1–P6-chips: alleen sheet/drawer, waar de midden-ladder weg is. */
  showLayerChips?: boolean;
};

const ACCENT: Record<
  InspectorCard["accent"],
  { border: string; kicker: string; icon: string }
> = {
  sage: { border: "border-white/10", kicker: "text-[#9FB0A6]", icon: "#5A8F6A" },
  terra: {
    border: "border-[rgba(200,149,108,0.4)]",
    kicker: "text-[#C8956C]",
    icon: "#C8956C",
  },
  neutral: { border: "border-white/10", kicker: "text-[#9FB0A6]", icon: "#9FB0A6" },
};

const ICON_BY_KIND: Record<InspectorCard["kind"], keyof typeof Icons> = {
  why: "Target",
  tip: "Check",
  meet: "Refresh",
  doel: "Spark",
  laag: "RouteMap",
  keuze: "Heart",
  evidence: "Activity",
  ijkpunt: "Target",
};

const EVIDENCE_STATUS_STYLE: Record<InspectorEvidenceStatus, string> = {
  below: "border-[#C26E4B]/50 text-[#C26E4B]",
  near: "border-[#C8956C]/45 text-[#C8956C]",
  meets: "border-[#5A8F6A]/50 text-[#9CC5A9]",
  own: "border-white/10 text-[#7E8C82]",
};

export default function CockpitInspector({
  cards,
  remeasureAction,
  doelFooter,
  ijkpuntAction,
  extra,
  titleId,
  onClose,
  onCollapse,
  compact = false,
  showLayerChips = false,
}: CockpitInspectorProps) {
  const { focus } = useDomainLadderFocus();

  useEffect(() => {
    const laag = cards.find((card) => card.kind === "laag");
    if (!laag || !focus) {
      return;
    }
    const evidenceCard = cards.find((card) => card.kind === "evidence");
    const ijkpuntCard = cards.find((card) => card.kind === "ijkpunt");
    const hasEvidence = Boolean(evidenceCard?.evidence && evidenceCard.evidence.length > 0);
    const hasGoal = Boolean(ijkpuntCard?.hasGoal);
    const payload = {
      domain: focus.domain,
      layer_id: focus.layerId,
      has_evidence: hasEvidence,
      has_goal: hasGoal,
    };
    emitAccountClientEvent("dashboard.ladder_evidence_viewed", payload);
    trackEvent("dashboard_ladder_evidence_viewed", payload);
    clarityTag("dashboard_ladder_evidence", `${focus.domain}_p${focus.layerId}`);
  }, [cards, focus]);

  return (
    <div className={`flex flex-col ${compact ? "gap-2.5" : "gap-3"}`}>
      <div className="flex items-center justify-between gap-3">
        <span
          id={titleId}
          className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#7E8C82]"
        >
          Context bij vandaag
        </span>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Sluit context"
            className="inline-flex min-h-9 shrink-0 cursor-pointer items-center rounded-lg border-none bg-transparent px-2 text-[18px] leading-none text-[#9FB0A6] transition hover:text-[#F1EFE8]"
          >
            ✕
          </button>
        ) : null}
        {onCollapse ? (
          <button
            type="button"
            onClick={onCollapse}
            aria-label="Klap context in"
            title="Klap context in"
            className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[#9FB0A6] transition hover:border-white/20 hover:text-[#F1EFE8]"
          >
            <Icons.ChevronRight s={15} />
          </button>
        ) : null}
      </div>

      {showLayerChips ? <InspectorLayerChips compact={compact} /> : null}

      {cards.map((card, index) => {
        const accent = ACCENT[card.accent];
        const Icon = Icons[ICON_BY_KIND[card.kind]] as IconComp;
        const showRemeasureAction = card.kind === "meet" && remeasureAction;
        const showDoelFooter = card.kind === "doel" && doelFooter;
        const showIjkpuntAction = card.kind === "ijkpunt" && ijkpuntAction;
        return (
          <div
            key={`${card.kind}-${index}`}
            className={`rounded-[14px] border ${accent.border} bg-black/20 ${compact ? "p-3" : "p-4"}`}
          >
            <span
              className={`mb-2 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] ${accent.kicker}`}
            >
              <Icon s={13} style={{ color: accent.icon }} /> {card.kicker}
            </span>
            <h3
              className={`mb-2 font-serif leading-tight text-[#F1EFE8] ${compact ? "text-[15px]" : "text-[16px]"}`}
            >
              {card.title}
            </h3>
            {card.body ? (
              <p
                className={`leading-relaxed text-[#9FB0A6] text-pretty ${compact ? "text-[12px]" : "text-[12.5px]"}`}
              >
                {card.body}
              </p>
            ) : null}
            {card.evidence && card.evidence.length > 0 ? (
              <ul className="mt-2 m-0 flex list-none flex-col gap-0 p-0">
                {card.evidence.map((row) => (
                  <li
                    key={row.key}
                    className="border-t border-white/[0.06] py-2.5 first:border-t-0 first:pt-0"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="m-0 text-[12px] font-semibold text-[#F1EFE8]">{row.label}</p>
                      {row.status ? (
                        <span
                          className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] ${EVIDENCE_STATUS_STYLE[row.status]}`}
                        >
                          {INSPECTOR_EVIDENCE_STATUS_LABEL[row.status]}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 m-0 text-[13px] font-medium leading-snug text-[#F1EFE8]">
                      {row.answerLabel}
                    </p>
                    {row.benchmarkLabel ? (
                      <p className="mt-1 m-0 text-[11.5px] leading-relaxed text-[#9FB0A6]">
                        {row.benchmarkLabel}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
            {card.href && card.hrefLabel ? (
              <Link
                href={card.href}
                className="mt-3 inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg border-none bg-[#5A8F6A] px-3 text-[13px] font-semibold text-[#0f1c10] no-underline"
              >
                {card.hrefLabel} <Icons.ArrowRight s={13} />
              </Link>
            ) : null}
            {showIjkpuntAction ? (
              <button
                type="button"
                onClick={ijkpuntAction.onClick}
                className="mt-3 inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg border-none bg-[#5A8F6A] px-3 text-[13px] font-semibold text-[#0f1c10]"
              >
                {ijkpuntAction.label} <Icons.ArrowRight s={13} />
              </button>
            ) : null}
            {showDoelFooter ? doelFooter : null}
            {showRemeasureAction ? (
              remeasureAction.due ? (
                <button
                  type="button"
                  onClick={remeasureAction.onClick}
                  className="mt-3 inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg border-none bg-[#5A8F6A] px-3 text-[13px] font-semibold text-[#0f1c10]"
                >
                  Doe de hermeting <Icons.ArrowRight s={13} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={remeasureAction.onClick}
                  className="mt-2 inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-[12.5px] font-semibold text-[#C8956C]"
                >
                  Alvast je hermeting doen <Icons.ArrowRight s={12} />
                </button>
              )
            ) : null}
          </div>
        );
      })}

      {extra ? (
        <div className="flex flex-col gap-3 border-t border-white/10 pt-3">{extra}</div>
      ) : null}
    </div>
  );
}
