"use client";

import { useState } from "react";
import * as Icons from "@/components/app/icons";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import DomainSupplementStance from "@/components/dashboard/voortgang/DomainSupplementStance";
import MovementSchapBasisCard from "@/components/dashboard/beweging/MovementSchapBasisCard";
import PrioriteitenLadder from "@/components/dashboard/voortgang/PrioriteitenLadder";
import FavoriteSaveButton from "@/components/dashboard/voortgang/FavoriteSaveButton";
import type { VerdictPanelSurface } from "@/components/dashboard/SupplementVerdictPanel";
import { PILLAR } from "@/data/dashboard";
import { SCHAP_DIENST_CARDS } from "@/data/movement/schap-diensten";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { clarityTag } from "@/lib/clarity";
import { getLeefstijlLadder, parseLadderFavoriteLayer, resolveLadderLayerName } from "@/lib/leefstijl-ladder";
import { resolveDefaultSchapTab, resolveSchapTabs } from "@/lib/schap-tabs";
import { SCHAP_DOMAINS, toProductStanceDomain } from "@/lib/schap-availability";
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
  /** Afvinken hoort op Mijn Dag — ladder-voetregel wijst daarheen. */
  onGoAgenda?: () => void;
  /**
   * Naar het schap van een ander domein. Zonder deze prop staat de
   * domeinschakelaar er niet — een chip die nergens heen gaat is erger dan
   * geen chip.
   */
  onSwitchDomain?: (domain: PillarId) => void;
  /** De terugweg: het leefstijlprofiel dat dit aanbod verantwoordt. */
  onOpenLeefstijlprofiel?: (domain: PillarId) => void;
};

const SCHAP_SURFACE: Partial<Record<PillarId, VerdictPanelSurface>> = {
  beweging: "schap_beweging",
  slaap: "schap_slaap",
  voeding: "schap_voeding",
};

/**
 * Het schap — het aanbod van één domein, generiek over beweging, slaap en
 * voeding. Vijf tabs: Leefstijl (ladder + keuze), Producten (supplementen),
 * Diensten (activiteiten), Favorieten (snelle beheer van bewaarde items).
 *
 * Leefstijl-tab is nu werkplek (niet spiegel): je kiest hier via de ladder,
 * met Aanbevolen + Mijn keuze per laag, en "Zet op Mijn Dag" knop.
 * Favorieten-tab toont je bewaarde items op dit domein, met snelle CTA's.
 *
 * Eén tab tegelijk zichtbaar. Tabs zonder inhoud renderen niet — die regel
 * woont in `resolveSchapTabs`.
 *
 * Twee navigatie-rijen boven de tabs, en ze doen bewust iets anders:
 * de domeinschakelaar (chips, rond) wisselt van scháp, de tabs (blokken)
 * wisselen van onderdeel bínnen dit schap. Daaronder de terugweg naar het
 * leefstijlprofiel — tot 21 augustus liep die naad maar één kant op ("Open je
 * schap ›" op het profiel), waardoor het aanbod losraakte van zijn
 * verantwoording zodra je er eenmaal stond.
 */
export default function SchapView({
  data,
  domain,
  activeTab,
  onTabChange,
  onBack,
  onGoAgenda,
  onSwitchDomain,
  onOpenLeefstijlprofiel,
}: SchapViewProps) {
  const [openLadderLayer, setOpenLadderLayer] = useState<number | null>(null);
  const { items, isSaved, save } = useVoortgangFavorites();
  const pillar = PILLAR[domain];
  const tabs = resolveSchapTabs(domain);
  const fallbackTab = resolveDefaultSchapTab(domain);
  const currentTab =
    activeTab && tabs.some((tab) => tab.id === activeTab) ? activeTab : fallbackTab;

  const stanceDomain = toProductStanceDomain(domain);
  const ladder = getLeefstijlLadder(domain);

  const domainFavorites = items.filter((item) => item.domain === domain);

  function handleSwitchDomain(target: PillarId) {
    if (target === domain) {
      return;
    }
    // Dezelfde durable gebeurtenis als elke andere ingang naar het schap, met
    // de herkomst erbij — zo is af te lezen hoe vaak iemand van schap naar
    // schap springt in plaats van via de hub opnieuw binnen te komen.
    emitAccountClientEvent("choice.shelf_opened", {
      domain: target,
      from_state: "schap",
      surface: `schap_${domain}`,
    });
    clarityTag("schap_domein_wissel", `${domain}:${target}`);
    onSwitchDomain?.(target);
  }

  function handleOpenLeefstijlprofiel() {
    clarityTag("schap_naar_leefstijlprofiel", domain);
    onOpenLeefstijlprofiel?.(domain);
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

      {onSwitchDomain && SCHAP_DOMAINS.length > 1 ? (
        <nav aria-label="Schap van een ander domein" className="mb-3 flex flex-wrap gap-2">
          {SCHAP_DOMAINS.map((id) => {
            const active = id === domain;
            const chipPillar = PILLAR[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleSwitchDomain(id)}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-[36px] shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-[12.5px] font-semibold ${
                  active
                    ? "border-[var(--sage)] bg-[rgba(90,143,106,0.14)] text-[var(--sage)]"
                    : "border-[var(--divider)] bg-transparent text-[var(--text-muted)]"
                }`}
              >
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: chipPillar.color }}
                />
                {chipPillar.label}
              </button>
            );
          })}
        </nav>
      ) : null}

      <p className="mb-2 max-w-[62ch] text-[13px] leading-relaxed text-[var(--text-muted)] text-pretty">
        Hier staat het aanbod, en alleen hier. Vandaag en Mijn Dag dragen de deur.
      </p>

      {onOpenLeefstijlprofiel ? (
        <button
          type="button"
          onClick={handleOpenLeefstijlprofiel}
          className="mb-4 inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-left text-[13px] font-semibold text-[var(--sage)]"
        >
          Waarom dit aanbod open of dicht staat — Leefstijlprofiel · {pillar.label}
          <Icons.ChevronRight s={13} />
        </button>
      ) : (
        <div className="mb-4" />
      )}

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
        {currentTab === "leefstijl" && ladder ? (
          <div className="flex flex-col gap-4">
            <PrioriteitenLadder
              layers={ladder.layers}
              intro={ladder.intro}
              domain={domain}
              surface={`schap_${domain}`}
              openLayer={openLadderLayer}
              onOpenLayerChange={setOpenLadderLayer}
              onGoAgenda={onGoAgenda}
            />
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

        {currentTab === "favorieten" ? (
          <div className="flex flex-col gap-3.5">
            {domainFavorites.length === 0 ? (
              <CockpitTile>
                <p className="m-0 text-[14px] leading-relaxed text-[var(--text-subtle)] text-pretty">
                  Je hebt hier nog niets bewaard. Kies iets op een van de andere tabs.
                </p>
              </CockpitTile>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  {domainFavorites.map((item) => {
                    const laag = parseLadderFavoriteLayer(item.id);
                    const laagNaam =
                      laag != null ? resolveLadderLayerName(domain, laag) : null;
                    return (
                      <CockpitTile key={item.id}>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                          <span className="min-w-0 flex-1">
                            <span className="block text-[14px] text-[var(--text)] text-pretty">
                              {item.title}
                            </span>
                            {laagNaam ? (
                              <span className="mt-1 block text-[11.5px] text-[var(--text-subtle)]">
                                Laag {laag} · {laagNaam}
                              </span>
                            ) : null}
                            {item.kind && item.kind !== "activiteit" ? (
                              <span className="mt-1 block text-[11.5px] text-[var(--text-subtle)] capitalize">
                                {item.kind}
                              </span>
                            ) : null}
                          </span>
                          <FavoriteSaveButton
                            item={item}
                            surface={`schap_favorieten_${domain}`}
                            compact
                            labels={{ save: "Bewaar", saved: "Bewaard" }}
                          />
                        </div>
                      </CockpitTile>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
