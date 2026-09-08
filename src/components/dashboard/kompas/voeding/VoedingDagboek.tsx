"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as Icons from "@/components/app/icons";
import { getVoedingsmiddel, type Voedingsmiddel } from "@/data/nutrition/food-items";
import type { Micronutrient } from "@/data/nutrition/micronutrients";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { bijdragenVanProduct } from "@/lib/micronutrient-index";
import {
  bouwDagdekking,
  dagdekkingRegel,
  dagdekkingRuimteRegel,
  zwaksteStoffen,
} from "@/lib/nutrition-dagdekking";
import { itemsNaarMomenten } from "@/lib/nutrition-dagboek-items";
import {
  EETMOMENTEN,
  structuurRegel,
  waterRegel,
  WATER_GLAS_ML,
  type EetmomentId,
} from "@/lib/nutrition-eetmomenten";
import { dagTitel } from "@/lib/nutrition-dagstrip";
import type { VoedingDagboekState } from "@/lib/use-voeding-dagboek";
import MicronutrientBronnen from "@/components/dashboard/kompas/voeding/MicronutrientBronnen";
import MicronutrientDagoverzicht from "@/components/dashboard/kompas/voeding/MicronutrientDagoverzicht";
import MicronutrientMeter from "@/components/dashboard/kompas/voeding/MicronutrientMeter";
import VoedingDagstrip from "@/components/dashboard/kompas/voeding/VoedingDagstrip";
import VoedingsmiddelZoeker from "@/components/dashboard/kompas/voeding/VoedingsmiddelZoeker";

/**
 * Het voedingsdagboek op Kompas — P1, de landingslaag van Voeding.
 *
 * ## Waarom het hier staat en niet meer op Voortgang
 *
 * Het dagboek stond onder Voortgang, op laag 5 (Meten & timing). Dat leek
 * logisch — je meet iets — maar het klopte niet met wat de twee schermen
 * dragen. Voortgang beantwoordt *hoe ging het*: een terugblik over weken, met
 * reeksen. Kompas beantwoordt *waar sta ik en wat pak ik nu*. Invullen wat je
 * vanmiddag at is geen terugblik; het is de handeling waar al het andere op
 * draait. Op Voortgang lag hij bovendien vier klikken diep, terwijl het de
 * meest herhaalde handeling van het hele domein is.
 *
 * Sinds die verhuizing is Voortgang-voeding een samenvatting van wat hier
 * gebeurt — één plek per vraag, en de plek waar je iets doet is Kompas.
 *
 * ## Waarom producten en geen voedselgroepen
 *
 * De vorige invoervorm telde porties per groep: "3 × groente". Dat kan de
 * vraag van dit scherm niet beantwoorden. Spinazie en komkommer zijn allebei
 * groente en leveren een volstrekt verschillend bord — 79 mg magnesium en 483
 * µg vitamine K tegenover vrijwel niets. Wie zijn micronutriënten uit groente
 * wil halen, moet zien wélke groente dat doet.
 *
 * De groepsvorm is niet weg: hij leeft voort als afleiding
 * (`itemsNaarMomenten` telt producten naar groepen op), zodat de breedte-,
 * variatie- en weekendanalyse ongewijzigd blijven draaien op `portions`.
 *
 * ## Waarom er geen dagtotaal in milligrammen staat
 *
 * Dat zou het scherm mooier maken en onwaar. Zie `nutrition-dagdekking.ts`:
 * indicatieve gehaltes, standaardporties en fytaat maken van een som een
 * inname-claim die dit instrument niet kan dragen. Wat er wél staat is dekking
 * — welke stoffen kwamen langs, uit welke bron.
 */

const TEL_KNOP =
  "inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/[0.03] text-[#9FB0A6] transition-colors hover:border-white/30 hover:text-[#E7EDE8] disabled:opacity-40";

const CHIP =
  "inline-flex items-center rounded-full border border-white/[0.09] bg-white/[0.03] px-1.5 py-0.5 text-[10.5px] font-medium text-[#9FB0A6]";

export default function VoedingDagboek({
  dagboek,
  surface,
  onGoVoortgang,
}: {
  dagboek: VoedingDagboekState;
  surface: string;
  /** Naar de samenvatting op Voortgang. */
  onGoVoortgang?: () => void;
}) {
  const [openMoment, setOpenMoment] = useState<EetmomentId | null>(null);
  const [openStof, setOpenStof] = useState<Micronutrient | null>(null);
  const dekkingGemeld = useRef(false);

  const { items, datum, vandaag, strip, gevuldeDagen, waterMl, geladen, busy, fout } =
    dagboek;

  const dekking = useMemo(() => bouwDagdekking(items), [items]);
  const meters = useMemo(() => zwaksteStoffen(dekking, 4), [dekking]);
  // De structuurregel leest de groepsvorm, want dat is wat hij altijd deed.
  // Items daarnaartoe afleiden houdt één implementatie van "hoeveel maaltijden
  // had je" in stand, in plaats van er een tweede te schrijven voor producten.
  const structuur = structuurRegel(itemsNaarMomenten(items));
  const water = waterRegel(waterMl);

  useEffect(() => {
    emitAccountClientEvent("nutrition.dagboek_opened", { surface, laag: 1 });
  }, [surface]);

  useEffect(() => {
    if (dekkingGemeld.current || dekking.producten === 0) return;
    dekkingGemeld.current = true;
    emitAccountClientEvent("nutrition.dagdekking_viewed", {
      surface,
      gedekt: dekking.gedekt,
      totaal: dekking.totaal,
      producten: dekking.producten,
    });
  }, [dekking, surface]);

  function openStofPaneel(stof: Micronutrient) {
    setOpenStof(stof);
    emitAccountClientEvent("nutrition.micronutrient_bronnen_opened", {
      surface,
      stof: stof.id,
    });
  }

  function voegToe(moment: EetmomentId, product: Voedingsmiddel) {
    dagboek.voegToe(moment, product);
  }

  return (
    <section
      aria-label="Voedingsdagboek"
      className="flex flex-col gap-2.5 rounded-2xl border border-white/10 bg-black/20 p-3.5"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="m-0 text-[15px] font-semibold text-[#F1EFE8]">
          {dagTitel(datum, vandaag)}
        </h2>
        <p className="m-0 text-[11px] text-[#7E8C82]">
          {busy ? "Opslaan…" : geladen ? "Automatisch bewaard" : "Laden…"}
        </p>
      </header>

      <VoedingDagstrip
        dagen={strip}
        geselecteerd={datum}
        gevuldeDagen={gevuldeDagen}
        onSelect={(date) => {
          dagboek.kiesDatum(date);
          setOpenMoment(null);
          setOpenStof(null);
        }}
      />

      {/* De kop van het overzicht: wat leverde deze dag, en waar zit de ruimte.
          Geen caloriedoel — zie de kop van dit bestand voor waarom er geen
          dagtotaal in milligrammen staat. */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3">
        <p className="m-0 text-[13.5px] font-semibold leading-snug text-[#E7EDE8] text-pretty">
          {dagdekkingRegel(dekking)}
        </p>
        {dagdekkingRuimteRegel(dekking) ? (
          <p className="m-0 mt-1 text-[11.5px] leading-relaxed text-[#9FB0A6] text-pretty">
            {dagdekkingRuimteRegel(dekking)}
          </p>
        ) : null}

        {/* Vier stoffen: die waar vandaag het minst van binnenkwam. Ze
            verschuiven terwijl je invult, en dat is de bedoeling — het is een
            leesbare stand, geen doel dat je vooraf instelt. */}
        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3 @[560px]:grid-cols-4">
          {meters.map((rij) => (
            <MicronutrientMeter
              key={rij.stof.id}
              rij={rij}
              compact
              onOpen={(gekozen) => openStofPaneel(gekozen.stof)}
            />
          ))}
        </div>
      </div>

      {openStof ? (
        <MicronutrientBronnen
          stof={openStof}
          onSluit={() => setOpenStof(null)}
          onKiesProduct={(product) => {
            voegToe(openMoment ?? "avondeten", product);
            setOpenStof(null);
          }}
        />
      ) : null}

      {/* De dag zelf: vier momenten, elk met zijn regels en een knop. */}
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
        {EETMOMENTEN.map((moment) => {
          const regels = items[moment.id] ?? [];
          const isOpen = openMoment === moment.id;

          return (
            <li
              key={moment.id}
              className="rounded-[14px] border border-white/[0.07] bg-white/[0.02] p-2.5"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="m-0 text-[12.5px] font-semibold text-[#E7EDE8]">
                  {moment.label}
                </h3>
                <span className="text-[10.5px] text-[#7E8C82]">
                  {regels.length === 0
                    ? (moment.hint ?? "nog niets")
                    : `${regels.length} ${regels.length === 1 ? "product" : "producten"}`}
                </span>
              </div>

              {regels.length > 0 ? (
                <ul className="m-0 mt-1.5 flex list-none flex-col gap-1.5 p-0">
                  {regels.map((regel) => (
                    <ItemRij
                      key={regel.key}
                      productKey={regel.key}
                      porties={regel.porties}
                      busy={busy}
                      onZet={(aantal) => dagboek.zetPorties(moment.id, regel.key, aantal)}
                    />
                  ))}
                </ul>
              ) : null}

              {isOpen ? (
                <VoedingsmiddelZoeker
                  moment={moment.id}
                  momentLabel={moment.label}
                  onKies={(product) => voegToe(moment.id, product)}
                  onSluit={() => setOpenMoment(null)}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setOpenMoment(moment.id);
                    setOpenStof(null);
                  }}
                  className="mt-2 flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 text-left text-[12.5px] text-[#7E8C82] transition hover:border-white/25"
                >
                  <Icons.Plus s={14} />
                  Wat at je bij {moment.label.toLowerCase()}?
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {/* Water mag wél een eenheid dragen: geen bron-onzekerheid, geen
          fytaat-vraag, geen ongeverifieerde tabel. Wat er niet bij staat is een
          dagbehoefte — die vuistregel is geen richtlijn. */}
      <div className="flex flex-wrap items-center gap-2 rounded-[14px] border border-white/[0.07] bg-white/[0.02] px-2.5 py-2">
        <span className="text-[12px] text-[#CDD7D0]">Water</span>
        <span className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={busy || (waterMl ?? 0) <= 0}
            onClick={() => dagboek.zetWater(Math.max(0, (waterMl ?? 0) - WATER_GLAS_ML))}
            aria-label="Eén glas water minder"
            className={TEL_KNOP}
          >
            −
          </button>
          <span className="w-16 text-center text-[12.5px] tabular-nums text-[#E7EDE8]">
            {waterMl ?? 0} ml
          </span>
          <button
            type="button"
            disabled={busy}
            onClick={() => dagboek.zetWater((waterMl ?? 0) + WATER_GLAS_ML)}
            aria-label="Eén glas water meer"
            className={TEL_KNOP}
          >
            +
          </button>
        </span>
        <span className="text-[11px] text-[#7E8C82]">
          {water ?? `1 glas ≈ ${WATER_GLAS_ML} ml`}
        </span>
      </div>

      {structuur ? (
        <p className="m-0 text-[11px] leading-relaxed text-[#9FB0A6]">{structuur}</p>
      ) : null}

      {fout ? (
        <p role="alert" className="m-0 text-[11.5px] text-[#D9A05B]">
          {fout}
        </p>
      ) : null}

      <MicronutrientDagoverzicht dekking={dekking} onOpenStof={openStofPaneel} />

      <p className="m-0 text-[10.5px] leading-relaxed text-[#7E8C82]">
        Zelfrapportage, geen meting. Gehaltes zijn indicatief en porties zijn
        standaardporties — het overzicht laat zien wélke bronnen langskwamen, niet
        hoeveel milligram je binnenkreeg.
        {onGoVoortgang ? (
          <>
            {" "}
            <button
              type="button"
              onClick={onGoVoortgang}
              className="cursor-pointer border-none bg-transparent p-0 text-[10.5px] font-semibold text-[#9CC5A9] underline"
            >
              Je reeks over de weken staat op Voortgang.
            </button>
          </>
        ) : null}
      </p>
    </section>
  );
}

/**
 * Eén regel in de dag: product, portie, de stoffen die het levert, en een
 * teller.
 *
 * De chips staan op de regel zelf en niet achter een uitklap: dát is waar dit
 * dagboek voor bestaat. Twee chips, want drie maakt de rij op 375 px twee
 * regels hoog, en de rest staat in het overzicht per stof.
 */
function ItemRij({
  productKey,
  porties,
  busy,
  onZet,
}: {
  productKey: string;
  porties: number;
  busy: boolean;
  onZet: (porties: number) => void;
}) {
  const product = useMemo(() => getVoedingsmiddel(productKey), [productKey]);
  const chips = useMemo(
    () => (product ? bijdragenVanProduct(product, { max: 2, minNiveau: "bron" }) : []),
    [product],
  );

  if (!product) {
    return null;
  }

  return (
    <li className="flex items-center justify-between gap-2.5 rounded-[10px] border border-white/[0.05] bg-black/20 px-2 py-1.5">
      <span className="min-w-0 flex-1">
        {/* Naam en portie mogen afbreken in plaats van afkappen: op 375 px
            past "Havermout · 50 g droog · schaal pap" niet op één regel, en
            een portie die je niet kunt lezen is geen portie. */}
        <span className="block text-[12.5px] font-medium leading-snug text-[#E7EDE8] text-pretty">
          {product.labelNl}{" "}
          <span className="font-normal text-[#7E8C82]">
            ({porties === 1 ? product.portieLabel : `${porties}× ${product.portieLabel}`})
          </span>
        </span>
        <span className="mt-0.5 flex flex-wrap gap-1">
          {chips.length > 0 ? (
            chips.map((chip) => (
              <span key={chip.stof.id} className={CHIP}>
                {chip.stof.label} {chip.hoeveelheidLabel}
              </span>
            ))
          ) : (
            <span className="text-[10.5px] text-[#7E8C82]">
              Levert geen stof uit dit overzicht in noemenswaardige hoeveelheid.
            </span>
          )}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          disabled={busy}
          onClick={() => onZet(porties - 1)}
          aria-label={`Eén portie ${product.labelNl.toLowerCase()} minder`}
          className={TEL_KNOP}
        >
          −
        </button>
        <span className="w-4 text-center text-[13px] tabular-nums text-[#E7EDE8]">
          {porties}
        </span>
        <button
          type="button"
          disabled={busy}
          onClick={() => onZet(porties + 1)}
          aria-label={`Eén portie ${product.labelNl.toLowerCase()} meer`}
          className={TEL_KNOP}
        >
          +
        </button>
      </span>
    </li>
  );
}
