"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import * as Icons from "@/components/app/icons";
import DomainSupplementStance from "@/components/dashboard/voortgang/DomainSupplementStance";
import KeuzeSpiegel from "@/components/dashboard/voortgang/KeuzeSpiegel";
import KeuzeVergelijken from "@/components/dashboard/keuze/KeuzeVergelijken";
import MovementSchapBasisCard from "@/components/dashboard/beweging/MovementSchapBasisCard";
import FavoriteReminderControl from "@/components/dashboard/voortgang/FavoriteReminderControl";
import FavoriteSaveButton from "@/components/dashboard/voortgang/FavoriteSaveButton";
import type { VerdictPanelSurface } from "@/components/dashboard/SupplementVerdictPanel";
import { PILLAR } from "@/data/dashboard";
import { SCHAP_DIENST_CARDS } from "@/data/movement/schap-diensten";
import { getDomainProductStance } from "@/data/domain-product-stance";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { clarityTag } from "@/lib/clarity";
import { todayInAgendaTimezone } from "@/lib/agenda-week-preview";
import { useTekortVoorstellen } from "@/lib/use-tekort-voorstellen";
import { buildKeuzeSpiegel } from "@/lib/keuze-spiegel";
import { parseLadderFavoriteLayer, resolveLadderLayerName } from "@/lib/leefstijl-ladder";
import { resolveDefaultSchapTab, resolveSchapTabs } from "@/lib/schap-tabs";
import VoortgangTerugLink from "@/components/dashboard/voortgang/VoortgangTerugLink";
import { toProductStanceDomain } from "@/lib/schap-availability";
import { buildKeuzeRailDomains } from "@/lib/context-rail";
import { buildRecommendationsEligibility } from "@/lib/supplement-eligibility";
import {
  nutritionSourceFavoriteContext,
  nutritionSourceFavoriteStatus,
} from "@/lib/nutrition-favorite-source";
import {
  ROUTE_STATUS_COLOR,
  routeChoiceFavoriteContext,
} from "@/lib/nutrition-route-choice";
import { useVoortgangFavorites } from "@/lib/voortgang-favorites-context";
import { trackEvent } from "@/lib/ga4";
import MijnKeuzes from "@/components/dashboard/keuze/MijnKeuzes";
import {
  isStofKeuzeFavoriet,
  metKeuzeHerkomst,
  parseProductKeuze,
  productKeuzeContext,
  productKeuzeHref,
} from "@/lib/keuze-product-keuze";
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
 * Eén navigatie-rij boven de tabs: de domeinschakelaar (chips, rond) wisselt
 * van scháp, de tabs (blokken) wisselen van onderdeel bínnen dit schap. Tot
 * 23 september droeg dit blok ook de terugweg naar het leefstijlprofiel — de
 * domeinhub die is opgeheven toen voeding het enige domein werd.
 */
/** Een bewaarde keuze, in dezelfde tegelvorm als de stofkaarten van Vergelijken. */
function KeuzeTegel({ children }: { children: ReactNode }) {
  return (
    <article className="rounded-[13px] border border-[var(--vd-line)] bg-[var(--vd-surface)] px-3.5 py-3">
      {children}
    </article>
  );
}

/** Dezelfde vijf domeinen als de linker rail — één bron, twee dragers. */
const KEUZE_CHIP_DOMAINS = buildKeuzeRailDomains();

export default function SchapView({
  data,
  domain,
  activeTab,
  onTabChange,
  onBack,
  onSwitchDomain,
}: SchapViewProps) {
  const { items, isSaved, save } = useVoortgangFavorites();
  const vandaag = todayInAgendaTimezone();
  const { reeksen, dagen: dagboekDagen } = useTekortVoorstellen(vandaag);
  const pillar = PILLAR[domain];
  const tabs = resolveSchapTabs(domain);
  const fallbackTab = resolveDefaultSchapTab(domain);
  const currentTab =
    activeTab && tabs.some((tab) => tab.id === activeTab) ? activeTab : fallbackTab;

  const stanceDomain = toProductStanceDomain(domain);

  const domainFavorites = items.filter((item) => item.domain === domain);

  // Dezelfde routes die Kompas en het routepaneel lezen — één bron, drie
  // dragers. Buiten voeding leeg: daar bestaan geen nutriëntroutes.
  const nutritionRoutes =
    domain === "voeding" ? (data?.nutritionCheckinReadout?.routes ?? []) : [];

  const mijnKeuzesActief = domain === "voeding" && nutritionRoutes.length > 0;
  const losseFavorieten = mijnKeuzesActief
    ? domainFavorites.filter((item) => !isStofKeuzeFavoriet(item.id))
    : domainFavorites;

  /** Van Mijn keuzes naar Vergelijken, met die stof open (leest `?stof=` bij binnenkomst). */
  function naarVergelijken(nutrient: string | null) {
    if (nutrient && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("stof", nutrient);
      window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    }
    onTabChange("logboek");
  }

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

  return (
    <section aria-label={`Keuze — ${pillar.label}`} className="vd-root pt-4">
      <div className="mb-4">
        {onBack ? <VoortgangTerugLink onBack={onBack} /> : null}
        <p className="vd-eyebrow m-0">Keuze</p>
        <h2 className="mt-1 text-[1.375rem] leading-tight text-[var(--vd-ink)]">{pillar.label}</h2>
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
                  className="inline-flex min-h-[36px] shrink-0 cursor-not-allowed items-center gap-1.5 rounded-full border border-[var(--vd-line)] bg-transparent px-3 text-[12.5px] font-semibold text-[var(--vd-ink-3)]"
                >
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 shrink-0 rounded-full opacity-50"
                    style={{ background: color }}
                  />
                  {label}
                  <Icons.Lock s={11} style={{ color: "var(--vd-ink-3)" }} />
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
                    ? "border-[var(--vd-sage)] bg-[var(--vd-sage-fill)] text-[var(--vd-sage-2)]"
                    : "border-[var(--vd-line)] bg-transparent text-[var(--vd-ink-2)]"
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
          meetlat is, dan pas de lijst. */}
      {/* Op voeding draagt Vergelijken zijn eigen kop, uit je dagboek. De
          intro en de spiegel ("gratis laag 1–5" tegenover kopen) kwamen uit
          de check-ladder en zijn daar vervallen
          (`BESLUIT_KEUZE_VERGELIJKEN_2026-10.md`, herziening 6 okt). */}
      {domain !== "voeding" ? (
        <>
          <div className="mb-4 rounded-2xl border border-[var(--vd-line)] bg-[var(--vd-surface)] px-3.5 py-3.5">
            <p className="max-w-[62ch] text-[12.5px] leading-relaxed text-[var(--vd-ink-2)] text-pretty">
              Hier staat het aanbod, en alleen hier. Vandaag en Mijn Dag dragen de deur.
              Elk oordeel hieronder komt uit je leefstijl- en voedingscheck, langs
              dezelfde feiten: signaal, zekerheid en EU-claim.
            </p>
          </div>

          {spiegel ? <KeuzeSpiegel spiegel={spiegel} verdicts={domainVerdicts} /> : null}
        </>
      ) : null}

      <nav
        role="tablist"
        aria-label="Onderdelen van je keuze"
        className="mb-4 inline-flex flex-wrap gap-1 rounded-xl border border-[var(--vd-line)] bg-[var(--vd-surface)] p-1"
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
                  ? "bg-[var(--vd-sage-fill)] font-semibold text-[var(--vd-sage-2)]"
                  : "font-medium text-[var(--vd-ink-3)] hover:text-[var(--vd-ink)]"
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
            <p className="m-0 max-w-[62ch] text-[12.5px] leading-relaxed text-[var(--vd-ink-3)] text-pretty">
              Categorieën, geen specifieke aanbieders. We beoordelen de aanpak.
            </p>
            <p className="m-0 max-w-[62ch] text-[12.5px] leading-relaxed text-[var(--vd-ink-3)] text-pretty">
              Partneraanbod volgt — deze categorieën zijn alvast zichtbaar, nog niet te bewaren.
            </p>
            {SCHAP_DIENST_CARDS.map((card) => {
              const comingSoon = card.availability === "binnenkort";
              return (
                <MovementSchapBasisCard
                  key={card.id}
                  card={card}
                  saved={isSaved(card.id)}
                  onSave={
                    comingSoon
                      ? undefined
                      : () =>
                          save({
                            id: card.id,
                            title: card.title,
                            kind: "dienst",
                            domain,
                            source: "mijn_keuze",
                          })
                  }
                />
              );
            })}
          </div>
        ) : null}

        {/* Het voedingslogboek als eigen tab, niet meer als vast blok bovenaan.
            Het verantwoordt nog steeds wat er op Producten staat — welke stof
            je uit je eten haalt bepaalt of dat aanbod iets voor je is — maar
            die verantwoording hoort náást het aanbod te staan en niet ervoor,
            waar het alles wat je kwam doen een scherm naar beneden duwde.

            Hier staat hij uitgeklapt en met zoekveld: dit is het scherm waar je
            je keuze uitwerkt, niet even aantikt. De poort blijft dezelfde —
            staat je voedingsbasis niet, dan blijven de supplement-knoppen dicht met
            hun reden erbij. */}
        {currentTab === "logboek" && nutritionRoutes.length > 0 ? (
          <KeuzeVergelijken
            statuses={nutritionRoutes}
            reeksen={reeksen}
            dagen={dagboekDagen}
            vandaag={vandaag}
            surface={SCHAP_SURFACE[domain] ?? "favorieten_schap_producten"}
            verdicts={data?.supplementVerdicts ?? []}
            products={data?.keuzeProducten}
          />
        ) : null}

        {/* Het oordeel per supplement uit je check staat sinds 7 oktober in de
            stofkaart zelf, als context bij de stand uit je dagboek
            (`BESLUIT_KEUZE_VERGELIJKEN_2026-10.md`, herziening 7 okt). Alleen
            zonder voedingscheck — dan zijn er geen stofkaarten — staat het hier
            nog los, met zijn dichte poort en reden, zodat dit tabblad nooit
            leeg is. */}
        {currentTab === "logboek" && stanceDomain && nutritionRoutes.length === 0 ? (
          <div>
            <p className="vd-eyebrow mb-2">Oordeel per supplement · uit je check</p>
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
          </div>
        ) : null}

        {/* Op voeding: Mijn keuzes per stof (`BESLUIT_KEUZE_VERGELIJKEN_2026-10.md`,
            zesde ronde). Wat niet bij een stofkeuze hoort — een supplement met
            een ster uit Je patroon, een ladderkeuze — staat eronder onder
            "Ook bewaard", zodat niets verdwijnt. */}
        {currentTab === "favorieten" && mijnKeuzesActief ? (
          <MijnKeuzes
            statuses={nutritionRoutes}
            reeksen={reeksen}
            products={data?.keuzeProducten}
            onNaarVergelijken={naarVergelijken}
          />
        ) : null}

        {currentTab === "favorieten" && (!mijnKeuzesActief || losseFavorieten.length > 0) ? (
          <div className={`flex flex-col gap-3.5 ${mijnKeuzesActief ? "mt-6" : ""}`}>
            {mijnKeuzesActief ? <p className="vd-eyebrow m-0">Ook bewaard</p> : null}
            {losseFavorieten.length === 0 ? (
              <KeuzeTegel>
                <p className="m-0 text-[14px] leading-relaxed text-[var(--vd-ink-3)] text-pretty">
                  Je hebt hier nog niets bewaard. Kies iets op een van de andere tabs.
                </p>
              </KeuzeTegel>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  {losseFavorieten.map((item) => {
                    const laag = parseLadderFavoriteLayer(item.id);
                    const laagNaam =
                      laag != null ? resolveLadderLayerName(domain, laag) : null;
                    // Bronnen uit het voedingsroutepaneel horen niet bij een
                    // laag maar bij een stof; zonder deze regel staat er over
                    // twee weken alleen "Pompoenzaden" zonder waarom.
                    // Idem voor een bewaarde routekeuze: "Eiwit: uit mijn
                    // eten" zegt zonder deze regel niet waarop die keuze rust.
                    const bronContext =
                      nutritionSourceFavoriteContext(item.id) ??
                      routeChoiceFavoriteContext(item.id) ??
                      productKeuzeContext(item.id);
                    const productKeuze = parseProductKeuze(item.id);
                    const productHref = productKeuze
                      ? metKeuzeHerkomst(productKeuzeHref(item.id) ?? "", productKeuze.nutrient)
                      : null;
                    // Waar hij staat op die route. Bewust geen hoeveelheid —
                    // zie `nutritionSourceFavoriteStatus`.
                    const bronStatus = nutritionSourceFavoriteStatus(
                      item.id,
                      nutritionRoutes,
                    );
                    return (
                      <KeuzeTegel key={item.id}>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                          <span className="min-w-0 flex-1">
                            <span className="block text-[14px] text-[var(--vd-ink)] text-pretty">
                              {item.title}
                            </span>
                            {laagNaam ? (
                              <span className="mt-1 block text-[11.5px] text-[var(--vd-ink-3)]">
                                Prioriteit {laag} · {laagNaam}
                              </span>
                            ) : null}
                            {bronContext ? (
                              <span className="mt-1 block text-[11.5px] text-[var(--vd-ink-3)] text-pretty">
                                {bronContext}
                              </span>
                            ) : null}
                            {bronStatus ? (
                              <span
                                className="mt-1 block text-[11.5px] font-semibold"
                                style={{ color: ROUTE_STATUS_COLOR[bronStatus.status] }}
                              >
                                {bronStatus.label}
                                {bronStatus.answerLabel
                                  ? ` · jij: ${bronStatus.answerLabel}`
                                  : ""}
                              </span>
                            ) : null}
                            {productHref ? (
                              <Link
                                href={productHref}
                                onClick={() =>
                                  trackEvent("keuze_vergelijken_ps_score_click", {
                                    surface: `schap_favorieten_${domain}`,
                                    nutrient: productKeuze?.nutrient ?? "",
                                    doel: "productpagina",
                                  })
                                }
                                className="mt-1 inline-block text-[11.5px] font-semibold text-[var(--vd-accent-2)] no-underline hover:underline"
                              >
                                Naar de productpagina →
                              </Link>
                            ) : null}
                            {item.kind && item.kind !== "activiteit" ? (
                              <span className="mt-1 block text-[11.5px] text-[var(--vd-ink-3)] capitalize">
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
                          <div className="mt-2.5 border-t border-[var(--vd-line)] pt-2.5">
                            <FavoriteReminderControl
                              item={item}
                              surface={`schap_favorieten_${domain}`}
                              compact
                            />
                          </div>
                        ) : null}
                      </KeuzeTegel>
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
