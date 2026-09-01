"use client";

import * as Icons from "@/components/app/icons";
import CockpitTile from "@/components/dashboard/cockpit/CockpitTile";
import DomainSupplementStance from "@/components/dashboard/voortgang/DomainSupplementStance";
import KeuzeSpiegel from "@/components/dashboard/voortgang/KeuzeSpiegel";
import MovementSchapBasisCard from "@/components/dashboard/beweging/MovementSchapBasisCard";
import FavoriteReminderControl from "@/components/dashboard/voortgang/FavoriteReminderControl";
import FavoriteSaveButton from "@/components/dashboard/voortgang/FavoriteSaveButton";
import type { VerdictPanelSurface } from "@/components/dashboard/SupplementVerdictPanel";
import { PILLAR } from "@/data/dashboard";
import { SCHAP_DIENST_CARDS } from "@/data/movement/schap-diensten";
import { getDomainProductStance } from "@/data/domain-product-stance";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { clarityTag } from "@/lib/clarity";
import { buildKeuzeSpiegel } from "@/lib/keuze-spiegel";
import { parseLadderFavoriteLayer, resolveLadderLayerName } from "@/lib/leefstijl-ladder";
import { resolveDefaultSchapTab, resolveSchapTabs } from "@/lib/schap-tabs";
import VoortgangTerugLink from "@/components/dashboard/voortgang/VoortgangTerugLink";
import { toProductStanceDomain } from "@/lib/schap-availability";
import { buildKeuzeRailDomains } from "@/lib/context-rail";
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
  /**
   * De terugweg naar Voortgang › Overzicht. Ontbreekt op de Keuze-tab: dat is
   * een eigen bestemming in de hoofdnavigatie, geen scherm ónder iets anders,
   * en een "Overzicht ‹"-link die je naar een ander tabblad schiet leest als
   * een fout.
   */
  onBack?: () => void;
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
 * voeding. Producten (supplementen), Diensten (activiteiten), Favorieten
 * (snelle beheer van bewaarde items).
 *
 * **Heet naar buiten "Keuze" (27 aug).** Sinds het schap een eigen tab in de
 * hoofdnavigatie is, draagt het die naam in alle copy. In code houdt het zijn
 * eigen naam: durable events (`choice.shelf_opened`) en surface-strings
 * (`schap_slaap`) dragen meetreeksen die niet mogen breken omdat een label
 * verandert.
 *
 * **Aanbod en favorieten, geen leefstijl-werkplek.** Tot 23 augustus stond hier
 * een vierde tab met de volledige `PrioriteitenLadder` — dezelfde lagen,
 * dezelfde knop en dezelfde favoriet-sleutel als het Kompas-domeinscherm en
 * het leefstijlprofiel. Dat was gate W4a uit de zijbalk-roadmap §7.1: de enige
 * echte doublure van het schap. De ladder woont nu op twee plekken die er
 * allebei een eigen vraag mee beantwoorden — Kompas kiest, Voortgang verklaart
 * — en het schap beantwoordt de zijne: wat is er te koop of uit te besteden,
 * en wat koos ik daarvan.
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
/** Dezelfde vijf domeinen als de linker rail — één bron, twee dragers. */
const KEUZE_CHIP_DOMAINS = buildKeuzeRailDomains();

export default function SchapView({
  data,
  domain,
  activeTab,
  onTabChange,
  onBack,
  onSwitchDomain,
  onOpenLeefstijlprofiel,
}: SchapViewProps) {
  const { items, isSaved, save } = useVoortgangFavorites();
  const pillar = PILLAR[domain];
  const tabs = resolveSchapTabs(domain);
  const fallbackTab = resolveDefaultSchapTab(domain);
  const currentTab =
    activeTab && tabs.some((tab) => tab.id === activeTab) ? activeTab : fallbackTab;

  const stanceDomain = toProductStanceDomain(domain);

  const domainFavorites = items.filter((item) => item.domain === domain);

  const nutritionLogCompleted =
    buildRecommendationsEligibility(data?.nutritionIntake).nutritionLogCompleted === true;

  // De spiegel toont het aanbod van dít domein, dus dezelfde filter als de
  // stance eronder — anders staan er rechts stoffen die het schap zelf niet
  // draagt.
  const stance = stanceDomain ? getDomainProductStance(stanceDomain) : null;
  const domainVerdicts =
    stance?.kind === "candidates"
      ? (data?.supplementVerdicts ?? []).filter((row) => stance.slugs.has(row.ingredientKey))
      : [];

  const spiegel = buildKeuzeSpiegel({
    domain,
    verdicts: domainVerdicts,
    nutritionLogCompleted,
  });

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
    <section aria-label={`Keuze — ${pillar.label}`} className="pt-4">
      <div className="mb-4">
        {onBack ? <VoortgangTerugLink onBack={onBack} /> : null}
        <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-[var(--text-subtle)]">
          Keuze
        </p>
        <h2 className="mt-1 font-[family-name:var(--f-serif)] text-[22px] font-normal leading-tight text-[var(--text)]">
          {pillar.label}
        </h2>
      </div>

      {/* Onder md is dit de domeinschakelaar; vanaf md neemt de linker rail hem
          over en zou een chiprij dezelfde keuze twee keer aanbieden.
          Alle vijf domeinen staan erin, óók de twee zonder aanbod — die dicht,
          met de reden. Weglaten maakt de poort onzichtbaar, en dan leest een
          ontbrekend domein als een gat in plaats van als een oordeel. */}
      {onSwitchDomain ? (
        <nav
          aria-label="Kiezen op een ander domein"
          className="mb-3 flex flex-wrap gap-2 md:hidden"
        >
          {KEUZE_CHIP_DOMAINS.map(({ id, label, color, disabledHint }) => {
            const active = id === domain;

            if (disabledHint) {
              return (
                <span
                  key={id}
                  aria-disabled
                  title={disabledHint}
                  className="inline-flex min-h-[36px] shrink-0 cursor-not-allowed items-center gap-1.5 rounded-full border border-[var(--divider)] bg-transparent px-3 text-[12.5px] font-semibold text-[var(--text-subtle)]"
                >
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 shrink-0 rounded-full opacity-50"
                    style={{ background: color }}
                  />
                  {label}
                  <Icons.Lock s={11} style={{ color: "var(--text-subtle)" }} />
                </span>
              );
            }

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
                  style={{ background: color }}
                />
                {label}
              </button>
            );
          })}
        </nav>
      ) : null}

      {/* Dezelfde rol als de keuzekolom-kop op /supplementen: eerst wat de
          meetlat is, dan pas de lijst. Daaronder de terugweg naar het profiel
          dat dit aanbod verantwoordt — tot 21 augustus liep die naad maar één
          kant op, waardoor het aanbod losraakte van zijn onderbouwing zodra je
          er eenmaal stond. */}
      <div className="mb-4 rounded-2xl border border-[var(--divider)] bg-black/20 px-3.5 py-3.5">
        <p className="max-w-[62ch] text-[12.5px] leading-relaxed text-[var(--text-muted)] text-pretty">
          Hier staat het aanbod, en alleen hier. Vandaag en Mijn Dag dragen de deur.
          Elk oordeel hieronder komt uit je leefstijl- en voedingscheck, langs
          dezelfde vier feiten: signaal, zekerheid, bloedwaarde en EU-claim.
        </p>
        {onOpenLeefstijlprofiel ? (
          <button
            type="button"
            onClick={handleOpenLeefstijlprofiel}
            className="mt-2.5 inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-left text-[12.5px] font-semibold text-[var(--sage)]"
          >
            Waarom dit aanbod open of dicht staat — Leefstijlprofiel · {pillar.label}
            <Icons.ChevronRight s={13} />
          </button>
        ) : null}
      </div>

      {spiegel ? (
        <KeuzeSpiegel
          spiegel={spiegel}
          verdicts={domainVerdicts}
          onOpenLeefstijlprofiel={onOpenLeefstijlprofiel}
        />
      ) : null}

      <nav
        role="tablist"
        aria-label="Onderdelen van je keuze"
        className="mb-4 inline-flex flex-wrap gap-1 rounded-xl border border-white/10 bg-black/20 p-1"
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
              className={`flex min-h-[38px] cursor-pointer items-center rounded-lg px-3.5 text-[13px] transition-colors ${
                selected
                  ? "bg-[rgba(90,143,106,0.18)] font-semibold text-[#9CC5A9]"
                  : "font-medium text-[var(--text-muted)] hover:text-[var(--text)]"
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
        {currentTab === "producten" && stanceDomain ? (
          <DomainSupplementStance
            domain={stanceDomain}
            verdicts={data?.supplementVerdicts ?? []}
            nutritionLogCompleted={nutritionLogCompleted}
            surface={SCHAP_SURFACE[domain] ?? "favorieten_schap_producten"}
            ladderDomain={domain}
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
                        {laag != null ? (
                          <div className="mt-2.5 border-t border-white/[0.06] pt-2.5">
                            <FavoriteReminderControl
                              item={item}
                              surface={`schap_favorieten_${domain}`}
                              compact
                            />
                          </div>
                        ) : null}
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
