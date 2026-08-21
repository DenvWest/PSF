"use client";

import * as Icons from "@/components/app/icons";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import DomainSupplementStance from "@/components/dashboard/voortgang/DomainSupplementStance";
import MovementSchapBasisCard from "@/components/dashboard/beweging/MovementSchapBasisCard";
import type { VerdictPanelSurface } from "@/components/dashboard/SupplementVerdictPanel";
import { PILLAR } from "@/data/dashboard";
import { SCHAP_DIENST_CARDS } from "@/data/movement/schap-diensten";
import { getLeefstijlLadder, parseLadderFavoriteLayer } from "@/lib/leefstijl-ladder";
import { resolveDefaultSchapTab, resolveSchapTabs } from "@/lib/schap-tabs";
import { toProductStanceDomain } from "@/lib/schap-availability";
import { buildRecommendationsEligibility } from "@/lib/supplement-eligibility";
import { useVoortgangFavorites } from "@/lib/voortgang-favorites-context";
import type { DashboardData, DashboardModel, PillarId, SchapTabId } from "@/types/dashboard";

type SchapViewProps = {
  /** Doorgegeven voor de panelen die er straks op leunen; het schap zelf leest data. */
  model: DashboardModel;
  data?: DashboardData;
  domain: PillarId;
  activeTab: SchapTabId | null;
  onTabChange: (tab: SchapTabId) => void;
  onBack: () => void;
  onOpenLeefstijlprofiel: (domain: PillarId) => void;
};

const SCHAP_SURFACE: Partial<Record<PillarId, VerdictPanelSurface>> = {
  beweging: "schap_beweging",
  slaap: "schap_slaap",
  voeding: "schap_voeding",
};

/**
 * Het schap — het aanbod van één domein, generiek over beweging, slaap en
 * voeding. Niet Favorieten: dat is wat jij bewaarde, domein-overstijgend, op
 * `screen=favorieten`. Ze deelden tot 20 augustus één naam en één
 * `screen`-waarde, met als gevolg dat dezelfde knop je nu eens hier en dan
 * eens op je bewaarde lijst zette.
 *
 * De enige plek met aanbod (BESLUIT_DASHBOARD_SUPPLEMENTROUTE_V1 §A). Vandaag
 * en Mijn Dag dragen alleen de deur; de ladder op Voortgang draagt de
 * onderbouwing. Eén tab tegelijk zichtbaar, en een tab zonder inhoud rendert
 * niet — die regel woont in `resolveSchapTabs`.
 */
export default function SchapView({
  data,
  domain,
  activeTab,
  onTabChange,
  onBack,
  onOpenLeefstijlprofiel,
}: SchapViewProps) {
  const { items, isSaved, save } = useVoortgangFavorites();
  const pillar = PILLAR[domain];
  const tabs = resolveSchapTabs(domain);
  const fallbackTab = resolveDefaultSchapTab(domain);
  const currentTab =
    activeTab && tabs.some((tab) => tab.id === activeTab) ? activeTab : fallbackTab;

  const stanceDomain = toProductStanceDomain(domain);
  const ladder = getLeefstijlLadder(domain);
  const layerCounts = new Map<number, number>();
  const ladderPrefix = `laag-${domain}-p`;
  for (const item of items) {
    if (!item.id.startsWith(ladderPrefix)) {
      continue;
    }
    const layer = parseLadderFavoriteLayer(item.id);
    if (layer != null) {
      layerCounts.set(layer, (layerCounts.get(layer) ?? 0) + 1);
    }
  }

  return (
    <section aria-label={`Schap — ${pillar.label}`} className="pt-4">
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Terug"
          className="flex h-[38px] w-[38px] shrink-0 cursor-pointer items-center justify-center rounded-[11px] border border-[var(--panel-border)] bg-white/[0.04] text-[var(--text-muted)]"
        >
          <Icons.ArrowRight s={18} style={{ transform: "rotate(180deg)" }} />
        </button>
        <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--text)]">
          Schap · {pillar.label}
        </div>
      </div>

      <p className="mb-4 max-w-[62ch] text-[13px] leading-relaxed text-[var(--text-muted)] text-pretty">
        Hier staat het aanbod, en alleen hier. Vandaag en Mijn Dag dragen de deur; je
        leefstijlprofiel legt uit waarom hij open of dicht staat.
      </p>

      <nav
        role="tablist"
        aria-label="Onderdelen van het schap"
        className="mb-4 flex flex-wrap gap-2"
      >
        {tabs.map((tab) => {
          const selected = tab.id === currentTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`schap-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`schap-paneel-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`flex min-h-[44px] cursor-pointer items-center rounded-xl border px-4 text-[13.5px] font-semibold ${
                selected
                  ? "border-[#5A8F6A]/45 bg-[#5A8F6A]/[0.16] text-[#9CC5A9]"
                  : "border-white/10 bg-white/[0.03] text-[var(--text-muted)]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div
        role="tabpanel"
        id={`schap-paneel-${currentTab}`}
        aria-labelledby={`schap-tab-${currentTab}`}
      >
        {currentTab === "leefstijl" ? (
          <div className="flex flex-col gap-3.5">
            <CockpitTile eyebrow="Wat je koos" ariaLabel="Je keuzes per laag">
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                {(ladder?.layers ?? []).map((layer) => {
                  const count = layerCounts.get(layer.id) ?? 0;
                  return (
                    <li
                      key={layer.id}
                      className="flex items-baseline justify-between gap-3 text-[13.5px] leading-relaxed"
                    >
                      <span className="min-w-0 flex-1 text-[var(--text)] text-pretty">
                        {layer.name}
                      </span>
                      <span className="shrink-0 text-[12.5px] text-[var(--text-subtle)]">
                        {count === 0
                          ? "niets gekozen"
                          : count === 1
                            ? "1 gekozen"
                            : `${count} gekozen`}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <button
                type="button"
                onClick={() => onOpenLeefstijlprofiel(domain)}
                className="mt-3.5 cursor-pointer border-none bg-transparent p-0 text-[13px] font-semibold text-[var(--sage)]"
              >
                Je leefstijlprofiel →
              </button>
            </CockpitTile>
            <p className="m-0 max-w-[62ch] text-[12.5px] leading-relaxed text-[var(--text-subtle)] text-pretty">
              Alleen een spiegel. Wat de check aanbeveelt en wat je koos staat op je
              leefstijlprofiel — daar is de werkplek, hier alleen de stand en de weg terug.
            </p>
          </div>
        ) : null}

        {currentTab === "producten" && stanceDomain ? (
          <DomainSupplementStance
            domain={stanceDomain}
            verdicts={data?.supplementVerdicts ?? []}
            nutritionLogCompleted={
              buildRecommendationsEligibility(data?.nutritionIntake).nutritionLogCompleted === true
            }
            surface={SCHAP_SURFACE[domain] ?? "favorieten_schap_producten"}
            openByDefault
            showFavoriteSave
            favoriteSource="aanbevolen"
          />
        ) : null}

        {currentTab === "diensten" ? (
          <div className="flex flex-col gap-2.5">
            <p className="m-0 max-w-[62ch] text-[12.5px] leading-relaxed text-[var(--text-subtle)] text-pretty">
              Categorieën, geen specifieke aanbieders. We beoordelen de aanpak.
            </p>
            {SCHAP_DIENST_CARDS.map((card) => (
              <MovementSchapBasisCard
                key={card.id}
                card={card}
                saved={isSaved(card.id)}
                onSave={() =>
                  save({
                    id: card.id,
                    title: card.title,
                    kind: "dienst",
                    domain,
                    source: "mijn_keuze",
                  })
                }
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
