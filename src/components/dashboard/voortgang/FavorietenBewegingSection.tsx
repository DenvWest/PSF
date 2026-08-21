"use client";

import Link from "next/link";
import * as Icons from "@/components/app/icons";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import DomainSupplementStance from "@/components/dashboard/voortgang/DomainSupplementStance";
import MovementSchapBasisCard from "@/components/dashboard/beweging/MovementSchapBasisCard";
import VoortgangClosedDoor from "@/components/dashboard/voortgang/VoortgangClosedDoor";
import VoortgangSectionHeader from "@/components/dashboard/voortgang/VoortgangSectionHeader";
import { SCHAP_BASIS_CARDS } from "@/data/movement/schap-basis-cards";
import {
  MOVEMENT_PRIORITY_LAYERS,
  type MovementPriorityId,
} from "@/data/movement/lifestyle-priorities";
import { useVoortgangFavorites } from "@/lib/voortgang-favorites-context";
import { buildRecommendationsEligibility } from "@/lib/supplement-eligibility";
import {
  buildMovementProgramPreview,
  parseMovementPlanProfile,
} from "@/lib/movement-plan-profile";
import FavoriteSaveButton from "@/components/dashboard/voortgang/FavoriteSaveButton";
import type { DashboardData, DashboardModel, LeefstijlprofielView, PillarId } from "@/types/dashboard";

type FavorietenBewegingSectionProps = {
  model: DashboardModel;
  data?: DashboardData;
  view?: LeefstijlprofielView;
  domain?: PillarId;
};

export default function FavorietenBewegingSection({
  model,
  data,
  view = "aanbevolen",
  domain = "beweging",
}: FavorietenBewegingSectionProps) {
  const { isSaved, save } = useVoortgangFavorites();
  const movementReadout = data?.movementCheckinSnapshot ?? null;
  const movementPlanProfile = parseMovementPlanProfile(model.answers ?? {});
  const programPreview = movementPlanProfile
    ? buildMovementProgramPreview(
        movementPlanProfile.weeklyFrequency,
        movementPlanProfile.trainingLocation,
        movementPlanProfile.trainingGuidance,
      )
    : null;

  const eligibility = buildRecommendationsEligibility(data?.nutritionIntake);
  const nutritionLogCompleted = eligibility.nutritionLogCompleted === true;

  const focusLayer = movementReadout?.ladder.focus ?? null;
  const recommendedLayers = resolveRecommendedLayers(focusLayer);

  if (view === "mijn_keuze") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <section aria-label="Mijn keuze beweging">
          <VoortgangSectionHeader eyebrow="Mijn keuze" title="Wat je nu doet" />
          <p
            style={{
              margin: "0 0 12px",
              fontSize: 12.5,
              color: "var(--text-subtle)",
              lineHeight: 1.55,
              textWrap: "pretty",
            }}
          >
            Wat je uit het schap koos. Afvinken doe je op Mijn Dag.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {SCHAP_BASIS_CARDS.map((card) => (
              <MovementSchapBasisCard
                key={card.id}
                card={card}
                saved={isSaved(card.id)}
                onSave={() =>
                  save({
                    id: card.id,
                    title: card.title,
                    kind: "activiteit",
                    domain,
                    source: "mijn_keuze",
                  })
                }
              />
            ))}
          </div>
          <div style={{ marginTop: 10 }}>
            <DomainSupplementStance
              domain="movement"
              verdicts={data?.supplementVerdicts ?? []}
              nutritionLogCompleted={nutritionLogCompleted}
              surface="leefstijlprofiel_beweging"
              openByDefault
            />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <section aria-label="Aanbevolen beweging">
        <VoortgangSectionHeader eyebrow="Aanbevolen" title="Wat past bij je check" />
        <p
          style={{
            margin: "0 0 12px",
            fontSize: 12.5,
            color: "var(--text-subtle)",
            lineHeight: 1.55,
            textWrap: "pretty",
          }}
        >
          Afgeleid uit je check — hier verdienen we niets aan.
        </p>

        {movementReadout ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {programPreview ? (
              <CockpitTile>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "var(--text-subtle)",
                        marginBottom: 6,
                      }}
                    >
                      Jouw programma
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--f-serif)",
                        fontSize: 17,
                        color: "var(--text)",
                        lineHeight: 1.3,
                      }}
                    >
                      {programPreview}
                    </div>
                  </div>
                  <FavoriteSaveButton
                    compact
                    surface="leefstijlprofiel_beweging"
                    item={{
                      id: `programma-${movementPlanProfile?.weeklyFrequency ?? "default"}`,
                      title: programPreview,
                      kind: "activiteit",
                      domain,
                      source: "aanbevolen",
                    }}
                  />
                </div>
              </CockpitTile>
            ) : null}

            {recommendedLayers.map((layer) => (
              <CockpitTile key={layer.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div
                      style={{
                        fontFamily: "var(--f-serif)",
                        fontSize: 17,
                        color: "var(--text)",
                        lineHeight: 1.25,
                        marginBottom: 4,
                      }}
                    >
                      {layer.name}
                    </div>
                    <div
                      style={{
                        fontSize: 12.5,
                        color: "var(--text-muted)",
                        marginBottom: layer.actions.length ? 10 : 0,
                        lineHeight: 1.45,
                        textWrap: "pretty",
                      }}
                    >
                      {layer.summary}
                    </div>
                    {layer.actions.length > 0 ? (
                      <ul
                        style={{
                          margin: 0,
                          padding: 0,
                          listStyle: "none",
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        {layer.actions.map((action) => (
                          <li
                            key={action}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 8,
                              fontSize: 13.5,
                              color: "var(--text-muted)",
                              lineHeight: 1.5,
                              textWrap: "pretty",
                            }}
                          >
                            <Icons.Check
                              s={14}
                              style={{ color: "var(--sage)", flexShrink: 0, marginTop: 3 }}
                            />
                            <span className="min-w-0 flex-1">{action}</span>
                            <FavoriteSaveButton
                              compact
                              surface="leefstijlprofiel_beweging"
                              item={{
                                id: `actie-${layer.id}-${action.slice(0, 48)}`,
                                title: action,
                                kind: "activiteit",
                                domain,
                                source: "aanbevolen",
                              }}
                            />
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
              </CockpitTile>
            ))}
          </div>
        ) : (
          <CockpitTile>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                color: "var(--text-muted)",
                lineHeight: 1.55,
                textWrap: "pretty",
              }}
            >
              Doe je beweegcheck om te zien welke prioriteiten en acties bij jou passen.
            </p>
            <Link
              href="/intake/beweging?from=dashboard&kompas=beweging"
              className="mt-3 inline-flex items-center gap-1 text-[13.5px] font-semibold text-[var(--sage)] no-underline"
            >
              Start beweegcheck <Icons.ChevronRight s={15} />
            </Link>
          </CockpitTile>
        )}
      </section>

      <section aria-label="Aanvullen beweging">
        <VoortgangSectionHeader eyebrow="Aanvullen" title="Supplementen en wearables" />
        <VoortgangClosedDoor
          title="Deze deur staat dicht"
          body={
            nutritionLogCompleted
              ? "Eerst voedingscheck en hertest, dan pas aanvullen. Creatine, eiwit en wearables zijn optimalisatie ná leefstijl — geen vervanging van je basis."
              : "Eerst voedingscheck en hertest, dan pas aanvullen. Supplementen en wearables komen pas aan bod als je leefstijl-basis staat."
          }
          footnote="Geen kaarten, geen teaser. Een dichte deur die toch iets laat zien is geen dichte deur."
        />
      </section>
    </div>
  );
}

/** Ook gebruikt door LeefstijlprofielDomeinView (Aanbeveling-sectie op Leefstijlprofiel). */
export function resolveRecommendedLayers(focusLayer: MovementPriorityId | null) {
  if (focusLayer == null) {
    return MOVEMENT_PRIORITY_LAYERS.filter((layer) => layer.id <= 2 && layer.actions.length > 0);
  }

  const ids = [focusLayer, Math.min(focusLayer + 1, 4) as MovementPriorityId];
  const uniqueIds = [...new Set(ids)];

  return uniqueIds
    .map((id) => MOVEMENT_PRIORITY_LAYERS.find((layer) => layer.id === id))
    .filter((layer): layer is (typeof MOVEMENT_PRIORITY_LAYERS)[number] => layer != null);
}
