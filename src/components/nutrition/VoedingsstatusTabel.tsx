"use client";

import { useEffect, useMemo, useState } from "react";
import * as Icons from "@/components/app/icons";
import CategorieDetailPaneel from "@/components/nutrition/CategorieDetailPaneel";
import VerschuivingTabel from "@/components/nutrition/VerschuivingTabel";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { clarityTag } from "@/lib/clarity";
import type { LadderEvidenceStatus } from "@/lib/domain-ladder-readout";
import { trackEvent } from "@/lib/ga4";
import { heeftDetail } from "@/lib/nutrition-categorie-detail";
import type { NutritionSelfReport } from "@/lib/nutrition-intake-estimate";
import type {
  NutritionFactRow,
  NutritionLadderReport,
} from "@/lib/nutrition-ladder";
import {
  bouwStatusFilters,
  bouwStatusRijen,
  filterStatusRijen,
  type StatusFilter,
  type StatusRij,
} from "@/lib/nutrition-statustabel";
import { surfaceStyles } from "@/lib/dashboard-surface";
import { bouwVerschuiving } from "@/lib/voedingsbasis-verschuiving";
import {
  categorieKaarten,
  GEEN_RICHTLIJN_LABEL_KORT,
} from "@/lib/nutrition-voedselgroepen";
import type { DomainMeasurement } from "@/types/dashboard";

/**
 * Voedingsstatus — je hele eetbeeld als één tabel.
 *
 * ## Wat hier veranderde, en waarom
 *
 * Dit scherm toonde drie blokken onder elkaar: zeven meetbanen voor de
 * voedselgroepen, daarna nog twee secties met dezelfde balkvorm voor de
 * kwaliteitsvragen, elk met een eigen inleidende alinea ertussen. Drie keer
 * dezelfde vorm met tekst ertussen leest niet als een overzicht maar als een
 * betoog — je moet het van boven naar beneden lézen om te weten waar je staat.
 *
 * Nu is het één tabel met vaste kolommen: **categorie · jij · balk · richtlijn ·
 * status**. Dezelfde gegevens, maar je scant een kolom in plaats van zinnen te
 * volgen. De balk is niet weg — hij is een kolom geworden, want het beeld "waar
 * zit de meeste ruimte" is precies wat een tabel met vijftien tekstcellen niet
 * geeft.
 *
 * ## Waarom de filters in de header staan
 *
 * De tabel wordt lang (zeven groepen plus de kwaliteitsvragen), en de vraag
 * waarmee je binnenkomt is meestal "waar heb ik ruimte". Dat is een filter, geen
 * scrollactie. De knoppen tonen alleen statussen die deze check daadwerkelijk
 * opleverde — zie `bouwStatusFilters` — en verdwijnen helemaal als er niets te
 * filteren valt.
 *
 * ## Wat de tabel niet doet
 *
 * Niet optellen. Zeven statussen worden geen kwaliteitscijfer: de check vraagt
 * niet wélke groente je eet, dus een samengesteld getal zou verzonnen zijn. De
 * kop telt alleen hoeveel rijen in welke staat staan — dat is een telling, geen
 * oordeel.
 */

const STATUS_KLEUR: Record<Exclude<LadderEvidenceStatus, "own">, string> = {
  below: "#C8956C",
  near: "#C99A3C",
  meets: "#5A8F6A",
};

const STATUS_LABEL: Record<LadderEvidenceStatus, string> = {
  below: "ruimte",
  near: "bijna",
  meets: "op orde",
  own: "eigen ijkpunt",
};

function statusKleur(status: LadderEvidenceStatus): string {
  return status === "own" ? "#7E8C82" : STATUS_KLEUR[status];
}

/**
 * De balkkolom.
 *
 * Gevulde breedte is de schaalpositie: waar je antwoord op de schaal van díé
 * vraag staat. Zonder positie blijft de baan leeg met alleen zijn kleur — dan
 * draagt de kleur het oordeel en belooft de baan geen precisie die er niet is.
 */
function Meetbaan({
  positie,
  status,
}: {
  positie: number | null;
  status: LadderEvidenceStatus;
}) {
  const kleur = statusKleur(status);
  return (
    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
      {positie != null ? (
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500"
          style={{
            width: `${Math.max(3, Math.round(positie * 100))}%`,
            background: `linear-gradient(90deg, ${kleur}55, ${kleur})`,
          }}
        />
      ) : (
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-full rounded-full opacity-25"
          style={{ background: kleur }}
        />
      )}
    </div>
  );
}

/**
 * Eén tabelrij.
 *
 * **Waarom dit geen `<table>` is.** De rij moet op 375px stapelen (vijf kolommen
 * naast elkaar geeft daar vijf stroken van 60px) en moet kunnen openklappen naar
 * een bronnenpaneel. Een echte tabel doet allebei slecht: `display: block` op
 * cellen sloopt de semantiek die je ervoor kwam, en een uitklappaneel in een
 * `<td colspan>` is niet toetsenbord-navigeerbaar te krijgen zonder de
 * rijstructuur te breken. Een lijst met een grid erin geeft dezelfde
 * kolomuitlijning, stapelt netjes, en houdt de uitklap een gewone knop.
 */
function StatusTabelRij({
  rij,
  open,
  onToggle,
  report,
  surface,
}: {
  rij: StatusRij;
  open: boolean;
  onToggle: () => void;
  report: NutritionSelfReport | null;
  surface: string;
}) {
  const uitklapbaar = rij.categorieId != null && heeftDetail(rij.categorieId);
  const paneelId = `voedingsstatus-detail-${rij.id}`;
  const kleur = statusKleur(rij.status);
  const richtlijn =
    rij.richtlijn ??
    (rij.exemption ? GEEN_RICHTLIJN_LABEL_KORT[rij.exemption] : null);

  const cellen = (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 px-3.5 py-2.5 @[44rem]:grid-cols-[minmax(7rem,1.1fr)_minmax(6rem,1fr)_minmax(4rem,0.9fr)_minmax(7rem,1.2fr)_minmax(4.5rem,auto)]">
      {/* Categorie */}
      <span className="flex min-w-0 items-center gap-1.5">
        {uitklapbaar ? (
          <span
            aria-hidden
            className="inline-flex shrink-0 text-[#7E8C82] transition-transform"
            style={{ transform: open ? "rotate(90deg)" : undefined }}
          >
            <Icons.ChevronRight s={11} />
          </span>
        ) : null}
        <span className="truncate text-[13px] font-semibold leading-snug text-[#E7EDE8]">
          {rij.label}
        </span>
      </span>

      {/* Status — op smal naast de categorie, op breed als laatste kolom. */}
      <span
        className="shrink-0 justify-self-end text-[10.5px] font-semibold uppercase tracking-[0.06em] @[44rem]:order-5"
        style={{ color: kleur }}
      >
        {STATUS_LABEL[rij.status]}
      </span>

      {/* Jij */}
      <span className="col-span-2 min-w-0 truncate text-[12px] leading-snug text-[#CDD7D0] @[44rem]:col-span-1 @[44rem]:order-2">
        {rij.jij}
      </span>

      {/* Balk */}
      <span className="col-span-2 @[44rem]:col-span-1 @[44rem]:order-3">
        <Meetbaan positie={rij.schaalPositie} status={rij.status} />
      </span>

      {/* Richtlijn. Zonder richtlijn blijft de cel op breed leeg staan zodat
          de statuskolom niet een plek opschuift; op smal valt hij helemaal
          weg, want daar stapelt de rij en is een lege regel alleen ruimte. */}
      <span
        className={`col-span-2 min-w-0 text-[11px] leading-snug text-[#7E8C82] @[44rem]:col-span-1 @[44rem]:order-4 @[44rem]:truncate ${
          richtlijn ? "" : "hidden @[44rem]:block"
        }`}
      >
        {richtlijn}
      </span>
    </div>
  );

  return (
    <li className="min-w-0 border-b border-white/[0.06] last:border-b-0">
      {uitklapbaar ? (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={paneelId}
          className="block w-full cursor-pointer border-none bg-transparent p-0 text-left font-[inherit] transition-colors hover:bg-white/[0.03]"
        >
          {cellen}
        </button>
      ) : (
        cellen
      )}

      {open && rij.categorieId ? (
        <div
          id={paneelId}
          className="mx-3.5 mb-3 rounded-lg bg-black/25 px-3 py-2.5"
        >
          <CategorieDetailPaneel
            categorieId={rij.categorieId}
            categorieLabel={rij.label}
            report={report}
            surface={surface}
          />
        </div>
      ) : null}
    </li>
  );
}

export default function VoedingsstatusTabel({
  rijen,
  report,
  selfReport = null,
  moments = [],
  surface,
}: {
  rijen: readonly NutritionFactRow[];
  report: NutritionLadderReport | null;
  /**
   * Het frequentie-zelfrapport, voor de doordruk. Los van `report`: die draagt
   * de slider-indices voor de tabel zelf, dit draagt de genormaliseerde vorm
   * waar de nutriënt-engine op draait. Null = doordruk toont de neutrale staat.
   */
  selfReport?: NutritionSelfReport | null;
  /** De meetmomenten van voeding, nieuwste eerst — voedt de verschuivingstabel. */
  moments?: readonly DomainMeasurement[];
  surface: string;
}) {
  const kaarten = useMemo(
    () => categorieKaarten(rijen, report),
    [rijen, report],
  );
  const alleRijen = useMemo(
    () => bouwStatusRijen(rijen, report),
    [rijen, report],
  );
  const filters = useMemo(() => bouwStatusFilters(alleRijen), [alleRijen]);
  const [filter, setFilter] = useState<StatusFilter["id"]>("alles");
  const [openRij, setOpenRij] = useState<string | null>(null);

  const zichtbaar = useMemo(
    () => filterStatusRijen(alleRijen, filter),
    [alleRijen, filter],
  );

  // De verschuiving draait op de voedselgroep-kaarten, niet op de
  // kwaliteitsrijen: hij vergelijkt meetmomenten per categorie, en de
  // kwaliteitsvragen hebben geen categorie-as om langs te vergelijken.
  const verschuiving = useMemo(
    () => bouwVerschuiving({ kaarten, moments }),
    [kaarten, moments],
  );

  const rijSignature = alleRijen
    .map((rij) => `${rij.id}:${rij.status}`)
    .join("|");

  useEffect(() => {
    if (alleRijen.length === 0) {
      return;
    }
    for (const rij of alleRijen) {
      trackEvent("nutrition_basis_category_view", {
        surface,
        category_id: rij.id,
        status: rij.status,
      });
      emitAccountClientEvent("nutrition.basis_category_viewed", {
        category_id: rij.id,
        status: rij.status,
        surface,
      });
    }
    clarityTag("nutrition_basis_overview", surface);
  }, [rijSignature, alleRijen, surface]);

  function kiesFilter(next: StatusFilter["id"]) {
    setFilter(next);
    setOpenRij(null);
    trackEvent("nutrition_statustabel_filter", { surface, filter: next });
    clarityTag("nutrition_statustabel_filter", next);
  }

  if (alleRijen.length === 0) {
    return (
      <div className={`mt-4 ${surfaceStyles("dashboard").kaart} px-4 py-3.5`}>
        <p className="m-0 text-[13.5px] leading-relaxed text-[#9FB0A6] text-pretty">
          Doe de voedingscheck om per categorie te zien waar je staat ten
          opzichte van de richtlijn.
        </p>
      </div>
    );
  }

  const metRuimte = alleRijen.filter((rij) => rij.status === "below").length;
  const opOrde = alleRijen.filter((rij) => rij.status === "meets").length;

  return (
    <div className="@container mt-4">
      <div
        className={`overflow-hidden border border-white/10 bg-black/20 ${
          verschuiving.momenten.length > 1 ? "rounded-t-xl" : "rounded-xl"
        }`}
      >
        {/* De header draagt de telling én de bediening. Twee dingen op één
            balk, maar ze horen bij elkaar: de telling zegt wat er te filteren
            valt, de knoppen doen het. */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/10 px-3.5 py-2.5">
          <p className="m-0 text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#7E8C82]">
            Per categorie
          </p>
          <span className="flex items-center gap-3.5">
            {metRuimte > 0 ? (
              <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[#C8956C]">
                <span
                  aria-hidden
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: STATUS_KLEUR.below }}
                />
                {metRuimte} met ruimte
              </span>
            ) : null}
            {opOrde > 0 ? (
              <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[#9CC5A9]">
                <span
                  aria-hidden
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: STATUS_KLEUR.meets }}
                />
                {opOrde} op orde
              </span>
            ) : null}
            <span className="text-[11px] text-[#7E8C82]">
              {alleRijen.length} totaal
            </span>
          </span>

          {filters.length > 0 ? (
            <div
              role="group"
              aria-label="Filter op status"
              className="ml-auto flex flex-wrap items-center gap-1.5"
            >
              {filters.map((optie) => {
                const actief = filter === optie.id;
                return (
                  <button
                    key={optie.id}
                    type="button"
                    onClick={() => kiesFilter(optie.id)}
                    aria-pressed={actief}
                    className={`min-h-7 cursor-pointer rounded-full border px-2.5 text-[11px] font-semibold transition-colors ${
                      actief
                        ? "border-[#9CC5A9]/50 bg-[#9CC5A9]/15 text-[#E7EDE8]"
                        : "border-white/10 bg-transparent text-[#9FB0A6] hover:border-white/25"
                    }`}
                  >
                    {optie.label}
                    <span className="ml-1 tabular-nums text-[#7E8C82]">
                      {optie.aantal}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* Kolomkoppen, alleen waar de rijen ook echt in kolommen staan. Op
            smal stapelt de rij, en dan wijst een koprij naar niets. */}
        <div className="hidden gap-x-3 border-b border-white/10 px-3.5 py-1.5 @[44rem]:grid @[44rem]:grid-cols-[minmax(7rem,1.1fr)_minmax(6rem,1fr)_minmax(4rem,0.9fr)_minmax(7rem,1.2fr)_minmax(4.5rem,auto)]">
          {["Categorie", "Jij", "", "Richtlijn", "Status"].map((kop, index) => (
            <span
              key={kop || `kolom-${index}`}
              className={`text-[9.5px] font-bold uppercase tracking-[0.13em] text-[#7E8C82] ${
                index === 4 ? "justify-self-end" : ""
              }`}
            >
              {kop}
            </span>
          ))}
        </div>

        <ul className="m-0 list-none p-0" role="list">
          {zichtbaar.map((rij) => (
            <StatusTabelRij
              key={rij.id}
              rij={rij}
              open={openRij === rij.id}
              onToggle={() =>
                setOpenRij((huidig) => (huidig === rij.id ? null : rij.id))
              }
              report={selfReport}
              surface={surface}
            />
          ))}
        </ul>
      </div>

      {/* De verschuiving sluit aan op de tabel: hij zegt hoe de stand erboven
          tot stand kwam. Hij rendert met een open bovenrand, dus hij hoort
          direct onder de tabel te staan — geen ruimte ertussen. */}
      <VerschuivingTabel verschuiving={verschuiving} />
    </div>
  );
}
