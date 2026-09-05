"use client";

import { useEffect, useMemo } from "react";
import * as Icons from "@/components/app/icons";
import DomainCockpitShell from "@/components/dashboard/domain/DomainCockpitShell";
import DomainFreeActionsTile from "@/components/dashboard/domain/DomainFreeActionsTile";
import DomainKompasHead from "@/components/dashboard/domain/DomainKompasHead";
import DomainLifestyleLadder from "@/components/dashboard/domain/DomainLifestyleLadder";
import { PILLAR } from "@/data/dashboard";
import { clarityTag } from "@/lib/clarity";
import { DOMAIN_KOMPAS_COPY, isDomainKompasDomain } from "@/lib/domain-kompas-copy";
import NutritionKompasTweeluik from "@/components/dashboard/domain/NutritionKompasTweeluik";
import NutritionPrioriteiten from "@/components/dashboard/domain/NutritionPrioriteiten";
import { buildNutritionKompasSamenvatting } from "@/lib/nutrition-kompas-samenvatting";
import { buildNutritionPriorities } from "@/lib/nutrition-prioriteiten";
import { resolveDomainLadderReadout } from "@/lib/domain-ladder-readout";
import { useDomainLadderFocus } from "@/lib/domain-ladder-focus-context";
import { trackEvent } from "@/lib/ga4";
import { getLeefstijlLadder } from "@/lib/leefstijl-ladder";
import { buildLeefstijllijnRows } from "@/lib/leefstijllijn";
import { getScoreBandShortLabel } from "@/lib/score-bands";
import { useVoortgangFavorites } from "@/lib/voortgang-favorites-context";
import { isKlikbaarVoortgangDomein } from "@/lib/zichtbare-domeinen";
import type { DashboardData, DashboardModel, PillarId } from "@/types/dashboard";

type DomainKompasScreenProps = {
  domain: PillarId;
  model: DashboardModel;
  data?: DashboardData;
  onGoAgenda: () => void;
  onGoVoortgangDomein: () => void;
  /**
   * Naar het volle logboek op het schap (`deel=logboek`). Alleen voeding heeft
   * er een; zonder deze prop valt de tweeluik-kaart terug op Voortgang.
   */
  onGoLogboek?: () => void;
};

/**
 * Kompas › domein: je stand, je prioriteiten, en wat je op de laag die je
 * aanklikt gratis kunt doen — in één beeld.
 *
 * De vorm is `renderE` uit de beweging-prebuild v3.6, die op zijn beurt de
 * vorm van slaap v2 `renderK` overneemt: één domeinkaart met ring en kop, de
 * ladder erin, één blok gratis opties eronder, en een CTA-stapel.
 *
 * Dit bestand heette tot 20 augustus `BewegingKompasScreen` en kende maar één
 * domein. Slaap kreeg daardoor een prebuild-iframe terwijl het al alles had om
 * hetzelfde scherm te dragen — staten per laag, een winst-laag, feitenrijen —
 * en de knoppen die naar `account_favorites` en `agenda_blocks` schrijven
 * halen de iframe-grens niet. Eén scherm voor beide houdt ze gelijk zonder dat
 * iemand het hoeft bij te houden; wat per domein verschilt is copy en staat in
 * {@link DOMAIN_KOMPAS_COPY}.
 *
 * Wat er sinds 20 augustus níét op staat is de dagkaart ("Vandaag · kracht"):
 * een uitgelezen meting met een afvinkknop, midden op een scherm dat over je
 * stand en je keuze gaat. Afvinken hoort op Mijn Dag, waar je dag staat — de
 * knop onderaan brengt je erheen. Ook de deur naar het schap ("Maak een
 * keuze") staat er niet als sluitregel op: dat was een tweede weg naar
 * dezelfde bestemming als de deur op de Kompas-home (N1).
 *
 * Sinds 1 september geldt diezelfde regel voor het voedingslogboek. Dat stond
 * hier een tijd als volledig blok — vijf stoffen met chiprij, uitklapbare
 * dossiers en drie knoppen per stof — en maakte van dit scherm een dossier in
 * plaats van een kompas. Wat ervoor in de plaats kwam is
 * {@link NutritionKompasTweeluik}: de stand van dat logboek in twee tellingen,
 * met een deur naar Voortgang (je voedingsbeeld) en een naar het schap (het
 * volle logboek). Hetzelfde principe als de dagkaart en de schap-deur — één
 * plek per vraag, en Kompas draagt de vraag *waar sta ik en wat pak ik nu*.
 */
export default function DomainKompasScreen({
  domain,
  model,
  data,
  onGoAgenda,
  onGoVoortgangDomein,
  onGoLogboek,
}: DomainKompasScreenProps) {
  // De laagkeuze woont in de context, niet in dit scherm: de contextkolom kiest
  // met dezelfde `selectLayer` (roadmap §7.2). Wat hier nog wél lokaal is, is de
  // afleiding — keuze als die er is, anders de winst-laag uit de check.
  const { setFocus, selected, selectLayer } = useDomainLadderFocus();

  const ladder = getLeefstijlLadder(domain);
  const readout = resolveDomainLadderReadout(domain, data);
  const copy = isDomainKompasDomain(domain) ? DOMAIN_KOMPAS_COPY[domain] : null;

  const focusLayerId = readout?.focusLayer ?? null;
  // Beginstand is de aanbeveling; kiezen wijkt daar tijdelijk van af. Zonder
  // eigen domeincheck is er geen winst-laag om op te beginnen — dan opent de
  // ladder op prioriteit 1. Dat claimt niets, maar het scherm is wel meteen
  // bruikbaar.
  const selectedLayerId = selected && selected.domain === domain ? selected.layerId : null;
  const activeLayerId = selectedLayerId ?? focusLayerId ?? 1;

  // De open-telling weegt je bewaarde routekeuzes mee, dus hij hangt aan de
  // favorieten. Vóór hydratatie zou hij te hoog staan en daarna omlaag
  // springen; `hydrated` houdt de kaart dan op zijn neutrale regel.
  const { items: favoriteItems, hydrated: favoritesHydrated } = useVoortgangFavorites();
  const nutritionSamenvatting = useMemo(
    () =>
      domain === "voeding"
        ? buildNutritionKompasSamenvatting(data?.nutritionCheckinReadout, favoriteItems)
        : null,
    [domain, data?.nutritionCheckinReadout, favoriteItems],
  );

  // Waarheen, náást hoever. Draait op dezelfde feitenrijen als de ladder —
  // geen tweede meting, dus het Kompas kan nooit iets anders zeggen dan
  // Voortgang.
  const nutritionFactRows = data?.nutritionCheckinReadout?.factRows;
  const nutritionPrioriteiten = useMemo(
    () =>
      domain === "voeding" && nutritionFactRows
        ? buildNutritionPriorities(nutritionFactRows)
        : null,
    [domain, nutritionFactRows],
  );

  const score = model.scores[domain] ?? 0;
  const daysAgo = data?.domainCheckDaysAgo?.[domain];
  const leefstijllijnRow = useMemo(
    () => buildLeefstijllijnRows(model).find((row) => row.pillarId === domain) ?? null,
    [model, domain],
  );

  // De contextkolom leest dezelfde laag; dit scherm publiceert hem.
  useEffect(() => {
    setFocus({ domain, layerId: activeLayerId });
  }, [domain, activeLayerId, setFocus]);

  // Opruimen alleen bij verlaten, anders blijft er context van dit domein staan
  // op een scherm dat er niet meer over gaat. Bewust een eigen effect met
  // stabiele deps: in het effect hierboven zou de cleanup bij elke laagwissel
  // de zojuist gemaakte keuze weer wissen.
  useEffect(
    () => () => {
      setFocus(null);
      selectLayer(null);
    },
    [setFocus, selectLayer],
  );

  if (!ladder || !copy) {
    return null;
  }

  const activeLayer = ladder.layers.find((layer) => layer.id === activeLayerId) ?? null;
  // Zonder schap-deur is Voortgang de eerlijkste bestemming: daar staat de
  // ladder mét feitenrijen, en dat is nog steeds een antwoord op de vraag.
  const handleGoLogboek = onGoLogboek ?? onGoVoortgangDomein;
  const measuredLine =
    daysAgo == null
      ? `nog geen ${copy.checkNoun}`
      : daysAgo === 0
        ? "gemeten vandaag"
        : `gemeten ${daysAgo} ${daysAgo === 1 ? "dag" : "dagen"} geleden`;

  return (
    <DomainCockpitShell accent="#5A8F6A" ariaLabel={PILLAR[domain].label}>
      <DomainKompasHead
        label={PILLAR[domain].label}
        score={score}
        bandLabel={getScoreBandShortLabel(score)}
        measuredLine={measuredLine}
        delta={leefstijllijnRow?.delta ?? null}
        statusLine={readout?.headline ?? copy.noCheckStatusLine}
      >
        {/* De ladder staat er altijd. Wat de check wél of niet oplevert bepaalt
            alleen of er staten naast de lagen staan — niet óf je je
            prioriteiten kunt lezen en aanklikken. */}
        <div className="mt-3 border-t border-white/[0.06] pt-3">
          <p className="mb-2 text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#7E8C82]">
            {readout
              ? "Waar je winst nu zit · tik een prioriteit aan"
              : `${copy.ladderEyebrowWithoutCheck} · tik een prioriteit aan`}
          </p>
          <DomainLifestyleLadder
            layers={ladder.layers}
            {...(readout
              ? { layerStates: readout.layerStates, stateLabels: readout.stateLabels }
              : {})}
            selectedLayer={activeLayerId}
            onSelectLayer={(layerId) => selectLayer({ domain, layerId })}
            whyWait={readout?.whyWait}
            domain={domain}
            columns={2}
            surface={copy.surface}
          />
          {activeLayer ? (
            <p className="mt-3 max-w-[58ch] text-[12.5px] leading-relaxed text-[#CDD7D0] text-pretty">
              {activeLayer.summary}
            </p>
          ) : null}
          {/* De prioriteitsknop staat direct onder de ladder en niet meer als
              losse zin verderop: wie afdwaalt van zijn winst-laag moet dat zien
              op de plek waar hij afdwaalde, niet twee blokken lager. Hij toont
              ook wat hij ís als je er wél op staat — anders leest het scherm
              alsof er geen aanbeveling was. */}
          {focusLayerId != null ? (
            activeLayerId === focusLayerId ? (
              <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-[rgba(90,143,106,0.35)] bg-[rgba(90,143,106,0.14)] px-2.5 py-1 text-[11.5px] font-semibold text-[#9CC5A9]">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#9CC5A9]" />
                Jouw prioriteit — hier zit je winst
              </p>
            ) : (
              <button
                type="button"
                onClick={() => {
                  trackEvent(`dashboard_${domain}_prioriteit_terug`, {
                    surface: copy.surface,
                    from_layer: activeLayerId,
                    to_layer: focusLayerId,
                  });
                  selectLayer({ domain, layerId: focusLayerId });
                }}
                className="mt-2.5 inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-full border border-white/15 bg-transparent px-2.5 text-[11.5px] font-semibold text-[#9CC5A9] transition hover:border-[rgba(90,143,106,0.5)]"
              >
                <Icons.ChevronLeft s={13} />
                Terug naar jouw prioriteit {focusLayerId}
              </button>
            )
          ) : null}
        </div>
      </DomainKompasHead>

      {/* Voeding kreeg op Kompas het volledige logboek: vijf stoffen met
          chiprij, uitklapbare dossiers, bronnen en drie knoppen per stof. Dat
          blok is niet fout — het is alleen niet van dit scherm. Kompas is waar
          je leest waar je staat en welke prioriteit je pakt; je keuze uitwerken
          doe je op het schap, waar hetzelfde blok uitgeklapt en met zoekveld
          staat, en je meetreeks lees je op Voortgang.

          Wat hier blijft is de *stand* van het logboek: twee tellingen, twee
          deuren. Zie `buildNutritionKompasSamenvatting` voor waarom die twee
          tellingen niet dezelfde vraag beantwoorden. */}
      {/* Waarheen staat boven hoever: de eerste vraag is welke stap je zet,
          niet hoe ver je bent. De tellingen eronder blijven — ze beantwoorden
          een andere vraag, en een stand lees je pas met interesse als je weet
          waar hij over gaat. */}
      {nutritionPrioriteiten ? (
        <NutritionPrioriteiten
          prioriteiten={nutritionPrioriteiten}
          surface={copy.surface}
          onOpenLayer={(layerId) => selectLayer({ domain, layerId })}
        />
      ) : null}

      {nutritionSamenvatting ? (
        <NutritionKompasTweeluik
          samenvatting={nutritionSamenvatting}
          keuzesGeladen={favoritesHydrated}
          surface={copy.surface}
          onGoVoortgang={onGoVoortgangDomein}
          onGoLogboek={handleGoLogboek}
        />
      ) : null}

      {/* De opties op de laag die je aanklikte. Staat er niets klaar, dan legt
          het blok uit waarom, in plaats van te verdwijnen onder je vinger. */}
      {activeLayer ? (
        <DomainFreeActionsTile
          domain={domain}
          layerId={activeLayer.id}
          layerName={activeLayer.name}
          actions={activeLayer.actions}
          isRecommended={activeLayer.id === focusLayerId}
          maxActions={2}
          emptyLine={
            copy.emptyLine?.(activeLayer.id) ??
            readout?.whyWait(activeLayer.id) ??
            activeLayer.summary
          }
          surface={copy.surface}
        />
      ) : null}

      {/* Wat je koos staat niet meer op dit scherm: de contextkolom draagt het
          voor de laag die je leest, en Favorieten draagt het archief over alle
          lagen en domeinen (roadmap §7, R1). Eén plek per vraag. */}

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 @[560px]:flex-row">
          {isKlikbaarVoortgangDomein(domain) ? (
            <button
              type="button"
              onClick={() => {
                trackEvent(`dashboard_${domain}_voortgang_click`, {
                  surface: copy.surface,
                  state: "klaar",
                });
                clarityTag(`dashboard_${domain}_brug`, "klaar");
                onGoVoortgangDomein();
              }}
              className="flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-2xl border-none bg-[#5A8F6A] px-4 text-[14px] font-semibold text-[#0E1810]"
            >
              {copy.voortgangLabel} <Icons.ChevronRight s={15} />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              trackEvent(`dashboard_${domain}_mijn_dag_click`, { surface: copy.surface });
              onGoAgenda();
            }}
            className="flex min-h-12 flex-1 cursor-pointer items-center justify-center rounded-2xl border border-white/15 bg-transparent px-4 text-[14px] font-semibold text-[#E7EDE8]"
          >
            {copy.agendaLabel}
          </button>
        </div>
        <p className="text-[11px] leading-relaxed text-[#7E8C82]">
          Zelfrapportage, geen diagnose. Afvinken doe je op Mijn Dag, waar je dag staat.
          {data?.remeasure?.daysUntil != null
            ? data.remeasure.daysUntil <= 0
              ? " Je korte hertest kan nu."
              : ` Je korte hertest kan over ${data.remeasure.daysUntil} ${
                  data.remeasure.daysUntil === 1 ? "dag" : "dagen"
                }.`
            : ""}
        </p>
      </div>
    </DomainCockpitShell>
  );
}
