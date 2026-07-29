"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { PILLAR, PILLARS } from "@/data/dashboard";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import DomeinDoelZetten, {
  type DomeinDoelZettenExistingGoal,
} from "@/components/dashboard/voortgang/DomeinDoelZetten";
import { DeltaBadge, Sparkline } from "@/components/app/primitives";
import { clarityTag } from "@/lib/clarity";
import {
  getSituationLabel,
  isDomainGoalDomain,
  type DomainGoalDomain,
  type SituationId,
} from "@/lib/domain-goal";
import { isInterventionDomain, isReadoutDomain } from "@/lib/domain-role";
import { trackEvent } from "@/lib/ga4";
import type { MovementAnchor } from "@/lib/movement-prefs";
import { getScoreBandShortLabel } from "@/lib/score-bands";
import type { DashboardData, DashboardModel, PillarId } from "@/types/dashboard";

type DomainGoalSummary = {
  situationId: SituationId;
  ownWords: string | null;
  latestScore: number | null;
};

type DomainGoalMap = Partial<Record<DomainGoalDomain, DomainGoalSummary>>;

type VoortgangDomeinRingProps = {
  model: DashboardModel;
  data?: DashboardData;
  onOpenDomain: (domain: PillarId) => void;
};

function buildCoverageLine(
  domainCheckDaysAgo: DashboardData["domainCheckDaysAgo"] | undefined,
): string | null {
  if (domainCheckDaysAgo == null) {
    return null;
  }

  const measured = PILLARS.filter((pillar) => domainCheckDaysAgo[pillar.id] != null);
  const n = measured.length;

  if (n === 7) {
    return "Je hebt 7 van de 7 domeinen apart gemeten.";
  }

  const missing = PILLARS.filter((pillar) => domainCheckDaysAgo[pillar.id] == null).map(
    (pillar) => pillar.label.toLowerCase(),
  );

  let namesSuffix = "";
  if (missing.length > 0) {
    const shown = missing.slice(0, 3);
    const rest = missing.length - shown.length;
    namesSuffix =
      rest > 0
        ? ` ${shown.join(", ")} en meer nog niet.`
        : ` ${shown.join(", ")} nog niet.`;
  }

  return `Je hebt ${n} van de 7 domeinen apart gemeten.${namesSuffix}`;
}

function DomainRow({
  pillarId,
  model,
  domainCheckDaysAgo,
  goal,
  onOpenDomain,
  onOpenGoal,
}: {
  pillarId: PillarId;
  model: DashboardModel;
  domainCheckDaysAgo: DashboardData["domainCheckDaysAgo"] | undefined;
  /** undefined = doelen nog niet geladen (render niets), null = geladen zonder actief doel. */
  goal?: DomainGoalSummary | null;
  onOpenDomain: (domain: PillarId) => void;
  onOpenGoal?: (domain: DomainGoalDomain) => void;
}) {
  const pillar = PILLAR[pillarId];
  const trend = model.trend[pillarId];
  const score = model.scores[pillarId];
  const daysAgo = domainCheckDaysAgo?.[pillarId];

  const metaLine =
    daysAgo != null
      ? `${trend.length} meting${trend.length === 1 ? "" : "en"} · ${daysAgo === 0 ? "vandaag" : `${daysAgo} dagen geleden`}`
      : `${trend.length} meting${trend.length === 1 ? "" : "en"} · nog niet apart gemeten`;

  const handleClick = () => {
    clarityTag("dashboard_voortgang", `domeinring_${pillarId}`);
    trackEvent("dashboard_voortgang_domein_click", { domain: pillarId });
    onOpenDomain(pillarId);
  };

  const goalDomain = isDomainGoalDomain(pillarId) ? pillarId : null;

  const handleOpenGoal = (event: MouseEvent) => {
    event.stopPropagation();
    if (!goalDomain || !onOpenGoal) {
      return;
    }
    trackEvent("dashboard_voortgang_doel_click", {
      domain: goalDomain,
      entry: goal ? "rescore" : "set",
    });
    onOpenGoal(goalDomain);
  };

  return (
    <li>
      <button
        type="button"
        onClick={handleClick}
        className="w-full cursor-pointer border-none bg-transparent p-0 text-left"
        style={{ fontFamily: "var(--f-sans)" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 72px minmax(0, auto)",
            alignItems: "center",
            gap: 10,
            minWidth: 0,
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              minWidth: 0,
            }}
          >
            <span
              aria-hidden
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: pillar.color,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 14,
                color: "var(--text)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {pillar.label}
            </span>
          </span>
          <div style={{ width: 72, flexShrink: 0 }}>
            <Sparkline data={trend} color={pillar.color} w={72} h={24} />
          </div>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 6,
              minWidth: 0,
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                whiteSpace: "nowrap",
              }}
            >
              {getScoreBandShortLabel(score)}
            </span>
            <DeltaBadge delta={model.deltaOf(pillarId)} />
          </span>
        </div>
        <p
          style={{
            margin: "4px 0 0",
            paddingLeft: 16,
            fontSize: 11,
            color: "var(--text-subtle)",
            lineHeight: 1.4,
            textWrap: "pretty",
          }}
        >
          {metaLine}
        </p>
      </button>
      {goalDomain && onOpenGoal && goal !== undefined ? (
        <button
          type="button"
          onClick={handleOpenGoal}
          className="mt-1.5 flex w-full cursor-pointer items-center justify-between gap-2 border-none bg-transparent p-0 pl-4 text-left"
          style={{ fontFamily: "var(--f-sans)" }}
        >
          <span
            style={{
              minWidth: 0,
              flex: 1,
              fontSize: 11.5,
              color: goal ? "var(--text-muted)" : "var(--sage)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {goal
              ? `${goal.ownWords || getSituationLabel(goalDomain, goal.situationId)}${
                  goal.latestScore != null ? ` · nu ${goal.latestScore}` : ""
                }`
              : "Zet je eigen doel"}
          </span>
          <span
            style={{
              flexShrink: 0,
              fontSize: 11,
              fontWeight: 600,
              color: "var(--sage)",
              whiteSpace: "nowrap",
            }}
          >
            {goal ? "Bijwerken" : "Zetten"} →
          </span>
        </button>
      ) : null}
    </li>
  );
}

export default function VoortgangDomeinRing({
  model,
  data,
  onOpenDomain,
}: VoortgangDomeinRingProps) {
  const domainCheckDaysAgo = data?.domainCheckDaysAgo;
  const coverageLine = buildCoverageLine(domainCheckDaysAgo);
  const interventionPillars = PILLARS.filter((pillar) => isInterventionDomain(pillar.id));
  const readoutPillars = PILLARS.filter((pillar) => isReadoutDomain(pillar.id));

  const [goals, setGoals] = useState<DomainGoalMap | null>(null);
  const [anchor, setAnchor] = useState<MovementAnchor | null>(null);
  const [openGoalDomain, setOpenGoalDomain] = useState<DomainGoalDomain | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/account/domain-goal", {
          credentials: "include",
        });
        if (!response.ok || cancelled) {
          return;
        }
        const json = (await response.json()) as {
          goals: {
            domain: DomainGoalDomain;
            situationId: SituationId;
            ownWords: string | null;
            scores: { score: number }[];
          }[];
        };
        const map: DomainGoalMap = {};
        for (const entry of json.goals) {
          map[entry.domain] = {
            situationId: entry.situationId,
            ownWords: entry.ownWords,
            latestScore: entry.scores[entry.scores.length - 1]?.score ?? null,
          };
        }
        setGoals(map);
      } catch {
        // stil falen: de doel-affordance is opt-in, geen kritiek pad
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/account/movement-prefs", {
          credentials: "include",
        });
        if (!response.ok || cancelled) {
          return;
        }
        const json = (await response.json()) as { anchor: MovementAnchor | null };
        setAnchor(json.anchor ?? null);
      } catch {
        // stil falen: anker is alleen ordening, geen blokkade
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openGoal = openGoalDomain ? (goals?.[openGoalDomain] ?? null) : null;
  const openGoalExisting: DomeinDoelZettenExistingGoal | null = openGoal
    ? { situationId: openGoal.situationId, ownWords: openGoal.ownWords }
    : null;

  return (
    <CockpitTile eyebrow="Je metingen" className="mb-3.5">
      <h3
        style={{
          margin: "8px 0 0",
          fontFamily: "var(--f-serif)",
          fontSize: 18,
          fontWeight: 400,
          color: "var(--text)",
          lineHeight: 1.3,
        }}
      >
        Wat je van jezelf weet
      </h3>
      {coverageLine ? (
        <p
          style={{
            margin: "8px 0 0",
            fontSize: 13,
            color: "var(--text-muted)",
            lineHeight: 1.5,
            textWrap: "pretty",
          }}
        >
          {coverageLine}
        </p>
      ) : null}
      <ul
        style={{
          margin: coverageLine ? "14px 0 0" : "12px 0 0",
          padding: 0,
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {interventionPillars.map((pillar) => (
          <DomainRow
            key={pillar.id}
            pillarId={pillar.id}
            model={model}
            domainCheckDaysAgo={domainCheckDaysAgo}
            goal={
              isDomainGoalDomain(pillar.id)
                ? goals
                  ? (goals[pillar.id] ?? null)
                  : undefined
                : undefined
            }
            onOpenDomain={onOpenDomain}
            onOpenGoal={setOpenGoalDomain}
          />
        ))}
        <li
          aria-hidden
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: 10,
            marginTop: 2,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--text-subtle)",
            }}
          >
            Volgt uit de rest
          </p>
        </li>
        {readoutPillars.map((pillar) => (
          <DomainRow
            key={pillar.id}
            pillarId={pillar.id}
            model={model}
            domainCheckDaysAgo={domainCheckDaysAgo}
            onOpenDomain={onOpenDomain}
          />
        ))}
      </ul>
      {openGoalDomain ? (
        <DomeinDoelZetten
          key={openGoalDomain}
          open
          domain={openGoalDomain}
          domainLabel={PILLAR[openGoalDomain].label}
          anchor={anchor}
          existingGoal={openGoalExisting}
          onClose={() => setOpenGoalDomain(null)}
          onSaved={(result) => {
            setGoals((current) => ({
              ...current,
              [openGoalDomain]: {
                situationId: result.situationId,
                ownWords: result.ownWords,
                latestScore: result.score,
              },
            }));
          }}
        />
      ) : null}
    </CockpitTile>
  );
}
