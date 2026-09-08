"use client";

import { useMemo, useState } from "react";
import * as Icons from "@/components/app/icons";
import type { Voedingsmiddel } from "@/data/nutrition/food-items";
import { bijdragenVanProduct, zoekVoedingsmiddelen } from "@/lib/micronutrient-index";
import { DAGBOEK_LABELS } from "@/lib/nutrition-dagboek";
import { voedingsmiddelenVanGroep } from "@/lib/micronutrient-index";
import { MOMENT_VOORKEUR, type EetmomentId } from "@/lib/nutrition-eetmomenten";
import { DAGBOEK_GROEPEN } from "@/lib/nutrition-dagboek";
import type { VoedselgroepId } from "@/lib/nutrition-voedselgroepen";

/**
 * Kiezen wát je at, niet alleen uit welke groep.
 *
 * De groepsvorm die hiervoor stond ("+ Groente") kon één vraag niet
 * beantwoorden: welke stoffen kwamen er langs. Spinazie en komkommer zijn
 * allebei één portie groente en leveren een totaal verschillend bord. Deze
 * zoeker vraagt daarom het product.
 *
 * ## Waarom er geen leeg zoekveld staat
 *
 * Zonder invoer toont de lijst de groepen die bij dít eetmoment horen, in de
 * volgorde uit `MOMENT_VOORKEUR`. Een leeg zoekveld dwingt je te bedenken hoe
 * iets heet voordat je iets ziet; een lijst laat je herkennen. Alle groepen
 * blijven bereikbaar — bij het ontbijt staat zuivel bovenaan en vis onderaan,
 * maar wie 's ochtends haring eet moet dat gewoon kunnen invullen.
 *
 * ## Waarom de chips al in de keuzelijst staan
 *
 * De twee zwaarste stoffen staan naast het product vóór je het kiest. Dat is
 * het hele argument van dit scherm: het verschil tussen twee producten uit
 * dezelfde groep is zichtbaar op het moment dat je kiest, niet pas erna.
 */

const CHIP =
  "inline-flex items-center rounded-full border border-white/[0.09] bg-white/[0.03] px-1.5 py-0.5 text-[10px] font-medium text-[#9FB0A6]";

function ProductKnop({
  product,
  onKies,
}: {
  product: Voedingsmiddel;
  onKies: (product: Voedingsmiddel) => void;
}) {
  const chips = bijdragenVanProduct(product, { max: 2, minNiveau: "bron" });
  return (
    <li>
      <button
        type="button"
        onClick={() => onKies(product)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-2.5 py-2 text-left transition hover:border-white/20"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[12.5px] font-medium leading-snug text-[#E7EDE8]">
            {product.labelNl}
          </span>
          <span className="mt-0.5 flex flex-wrap items-center gap-1">
            <span className="text-[10.5px] text-[#7E8C82]">{product.portieLabel}</span>
            {chips.map((chip) => (
              <span key={chip.stof.id} className={CHIP}>
                {chip.stof.label} {chip.hoeveelheidLabel}
              </span>
            ))}
          </span>
        </span>
        <span aria-hidden className="shrink-0 text-[#7E8C82]">
          <Icons.Plus s={15} />
        </span>
      </button>
    </li>
  );
}

export default function VoedingsmiddelZoeker({
  moment,
  momentLabel,
  onKies,
  onSluit,
}: {
  moment: EetmomentId;
  momentLabel: string;
  onKies: (product: Voedingsmiddel) => void;
  onSluit: () => void;
}) {
  const [term, setTerm] = useState("");
  const [openGroep, setOpenGroep] = useState<VoedselgroepId>(
    MOMENT_VOORKEUR[moment][0] ?? "groente",
  );

  const treffers = useMemo(
    () => (term.trim().length >= 2 ? zoekVoedingsmiddelen(term) : []),
    [term],
  );

  // Voorkeur eerst, daarna de rest — dezelfde regel als de groepsinvoer had.
  const groepen = useMemo(() => {
    const voorkeur = MOMENT_VOORKEUR[moment];
    const rest = DAGBOEK_GROEPEN.filter((groep) => !voorkeur.includes(groep));
    return [...voorkeur, ...rest].filter(
      (groep) => voedingsmiddelenVanGroep(groep).length > 0,
    );
  }, [moment]);

  const zoekt = term.trim().length >= 2;

  return (
    <div className="mt-2 rounded-[14px] border border-white/10 bg-black/30 p-2.5">
      <div className="flex items-center gap-2">
        <span aria-hidden className="text-[#7E8C82]">
          <Icons.Search s={15} />
        </span>
        <label className="flex-1">
          <span className="sr-only">Zoek een voedingsmiddel voor {momentLabel}</span>
          <input
            type="search"
            autoFocus
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder={`Wat at je bij het ${momentLabel.toLowerCase()}?`}
            className="w-full border-none bg-transparent text-[13px] text-[#F1EFE8] outline-none placeholder:text-[#7E8C82]"
          />
        </label>
        <button
          type="button"
          onClick={onSluit}
          className="shrink-0 cursor-pointer rounded-full border border-white/10 bg-transparent px-2.5 py-1 text-[11px] font-semibold text-[#9FB0A6] transition hover:border-white/25 hover:text-[#E7EDE8]"
        >
          Sluiten
        </button>
      </div>

      {zoekt ? (
        treffers.length > 0 ? (
          <ul className="m-0 mt-2 flex max-h-[46vh] list-none flex-col gap-1 overflow-y-auto p-0">
            {treffers.map((product) => (
              <ProductKnop key={product.key} product={product} onKies={onKies} />
            ))}
          </ul>
        ) : (
          <p className="m-0 mt-3 text-[12px] leading-relaxed text-[#9FB0A6]">
            Niets gevonden voor “{term.trim()}”. Kies de groep die het dichtst in de buurt
            komt — dan telt je dag mee, ook zonder het exacte product.
          </p>
        )
      ) : (
        <>
          {/* Eén scrollbare rij en geen wrap: dertien groepen over zeven regels
              duwde de producten van het scherm af, en juist die lijst is
              waarvoor je de zoeker opent. */}
          <div className="-mx-1 mt-2 flex gap-1.5 overflow-x-auto px-1 pb-1">
            {groepen.map((groep) => (
              <button
                key={groep}
                type="button"
                // Nooit terug naar niets: op de actieve groep tikken liet de
                // lijst inklappen en het paneel leeg achter — een chiprij
                // zonder resultaten leest als een kapot scherm.
                onClick={() => setOpenGroep(groep)}
                aria-pressed={groep === openGroep}
                className={`inline-flex min-h-8 shrink-0 cursor-pointer items-center whitespace-nowrap rounded-full border px-2.5 text-[11.5px] font-medium transition ${
                  groep === openGroep
                    ? "border-[rgba(90,143,106,0.55)] bg-[rgba(90,143,106,0.16)] text-[#E7EDE8]"
                    : "border-white/10 bg-transparent text-[#9FB0A6] hover:border-white/25"
                }`}
              >
                {DAGBOEK_LABELS[groep]}
              </button>
            ))}
          </div>

          <ul className="m-0 mt-2 flex max-h-[42vh] list-none flex-col gap-1 overflow-y-auto p-0">
            {voedingsmiddelenVanGroep(openGroep).map((product) => (
              <ProductKnop key={product.key} product={product} onKies={onKies} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
