"use client";

import { useState } from "react";
import * as Icons from "@/components/app/icons";
import {
  EETMOMENTEN,
  groepenVoorMoment,
  portieHint,
  structuurRegel,
  waterRegel,
  WATER_GLAS_ML,
  type DagMomenten,
  type EetmomentId,
} from "@/lib/nutrition-eetmomenten";
import { DAGBOEK_LABELS } from "@/lib/nutrition-dagboek";
import type { VoedselgroepId } from "@/lib/nutrition-voedselgroepen";

/**
 * Eén dag invullen, per eetmoment.
 *
 * De vorige vorm zette dertien voedselgroepen onder elkaar met plus en min.
 * Dat is compleet en onbruikbaar tegelijk: je krijgt dertien rijen op nul te
 * zien en moet per groep bedenken of hij vandaag voorkwam.
 *
 * Mensen halen hun dag per moment terug — *bij het ontbijt yoghurt, 's avonds
 * groente en vis*. Deze vorm volgt die volgorde: vier momenten, elk dicht tot
 * je hem opent, en per moment kies je welke groepen erin zaten. Wat je niet
 * aanraakt blijft afwezig in plaats van nul.
 *
 * De gram-hint naast een gekozen groep ("1 portie groente ≈ 100 g") is een
 * invoerhulp, geen meting: zonder maat is "1 portie" voor niemand hetzelfde.
 * Het systeem rekent er niets mee — zie `portieHint` voor waarom dat zo blijft.
 */

const TEL_KNOP =
  "inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/[0.03] text-[#9FB0A6] transition-colors hover:border-white/30 hover:text-[#E7EDE8] disabled:opacity-40";

const GROEP_CHIP =
  "inline-flex min-h-8 cursor-pointer items-center rounded-full border px-2.5 text-[11.5px] font-medium transition-colors disabled:opacity-50";

export default function NutritionDagInvoer({
  momenten,
  onChange,
  waterMl,
  onWaterChange,
  busy = false,
}: {
  momenten: DagMomenten;
  onChange: (volgende: DagMomenten) => void;
  waterMl: number | null;
  onWaterChange: (ml: number | null) => void;
  busy?: boolean;
}) {
  const [openMoment, setOpenMoment] = useState<EetmomentId | null>("ontbijt");

  function zetGroep(moment: EetmomentId, groep: VoedselgroepId, aantal: number) {
    const inhoud = { ...(momenten[moment] ?? {}) };
    if (aantal <= 0) {
      delete inhoud[groep];
    } else {
      inhoud[groep] = Math.min(aantal, 20);
    }
    const volgende: DagMomenten = { ...momenten };
    if (Object.keys(inhoud).length === 0) {
      delete volgende[moment];
    } else {
      volgende[moment] = inhoud;
    }
    onChange(volgende);
  }

  const structuur = structuurRegel(momenten);
  const water = waterRegel(waterMl);

  return (
    <div className="mt-2.5 rounded-[12px] border border-white/10 bg-black/25 p-3">
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
        {EETMOMENTEN.map((moment) => {
          const inhoud = momenten[moment.id] ?? {};
          const gekozen = Object.entries(inhoud).filter(([, aantal]) => (aantal ?? 0) > 0);
          const isOpen = openMoment === moment.id;

          return (
            <li
              key={moment.id}
              className="rounded-[10px] border border-white/[0.07] bg-white/[0.02]"
            >
              <button
                type="button"
                disabled={busy}
                onClick={() => setOpenMoment(isOpen ? null : moment.id)}
                aria-expanded={isOpen}
                className="flex w-full cursor-pointer items-center justify-between gap-2 border-none bg-transparent px-2.5 py-2 text-left"
              >
                <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-[12.5px] font-semibold text-[#E7EDE8]">
                    {moment.label}
                  </span>
                  {gekozen.length > 0 ? (
                    <span className="text-[11px] text-[#9CC5A9]">
                      {gekozen
                        .map(([groep, aantal]) =>
                          aantal === 1
                            ? DAGBOEK_LABELS[groep as VoedselgroepId]
                            : `${aantal}× ${DAGBOEK_LABELS[groep as VoedselgroepId]}`,
                        )
                        .join(" · ")}
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#7E8C82]">
                      {moment.hint ?? "nog niets"}
                    </span>
                  )}
                </span>
                <span
                  aria-hidden
                  className="shrink-0 text-[#7E8C82] transition-transform"
                  style={{ transform: isOpen ? "rotate(90deg)" : undefined }}
                >
                  <Icons.ChevronRight s={13} />
                </span>
              </button>

              {isOpen ? (
                <div className="border-t border-white/[0.07] px-2.5 py-2">
                  {/* Wat je al koos, met een teller. Alleen deze rijen dragen
                      een aantal — de rest is een chip die je aantikt. */}
                  {gekozen.length > 0 ? (
                    <ul className="m-0 mb-2 flex list-none flex-col gap-1.5 p-0">
                      {gekozen.map(([groepRaw, aantal]) => {
                        const groep = groepRaw as VoedselgroepId;
                        const hint = portieHint(groep);
                        return (
                          <li key={groep} className="flex items-center justify-between gap-3">
                            <span className="min-w-[10ch] flex-1">
                              <span className="block text-[12.5px] leading-snug text-[#CDD7D0]">
                                {DAGBOEK_LABELS[groep]}
                              </span>
                              {hint ? (
                                <span
                                  className="block text-[10.5px] leading-snug text-[#7E8C82]"
                                  title={hint.bron}
                                >
                                  {hint.label}
                                </span>
                              ) : null}
                            </span>
                            <span className="flex shrink-0 items-center gap-1.5">
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => zetGroep(moment.id, groep, (aantal ?? 0) - 1)}
                                aria-label={`Eén ${DAGBOEK_LABELS[groep].toLowerCase()} minder bij ${moment.label.toLowerCase()}`}
                                className={TEL_KNOP}
                              >
                                −
                              </button>
                              <span className="w-5 text-center text-[13px] tabular-nums text-[#E7EDE8]">
                                {aantal}
                              </span>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => zetGroep(moment.id, groep, (aantal ?? 0) + 1)}
                                aria-label={`Eén ${DAGBOEK_LABELS[groep].toLowerCase()} meer bij ${moment.label.toLowerCase()}`}
                                className={TEL_KNOP}
                              >
                                +
                              </button>
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}

                  {/* Alle dertien blijven bereikbaar; alleen de volgorde
                      verschilt per moment. Wie 's ochtends vis eet moet dat
                      gewoon kunnen invullen. */}
                  <div className="flex flex-wrap gap-1.5">
                    {groepenVoorMoment(moment.id)
                      .filter((groep) => !(inhoud[groep] ?? 0))
                      .map((groep) => (
                        <button
                          key={groep}
                          type="button"
                          disabled={busy}
                          onClick={() => zetGroep(moment.id, groep, 1)}
                          className={`${GROEP_CHIP} border-white/10 bg-transparent text-[#9FB0A6] hover:border-white/30 hover:text-[#E7EDE8]`}
                        >
                          + {DAGBOEK_LABELS[groep]}
                        </button>
                      ))}
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      {/* Water mag wél een eenheid dragen: geen bron-onzekerheid, geen
          fytaat-vraag, geen ongeverifieerde tabel. Wat er niet bij staat is
          een dagbehoefte — die vuistregel is geen richtlijn. */}
      <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-2.5">
        <span className="text-[12px] text-[#CDD7D0]">Water</span>
        <span className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={busy || (waterMl ?? 0) <= 0}
            onClick={() => onWaterChange(Math.max(0, (waterMl ?? 0) - WATER_GLAS_ML))}
            aria-label="Eén glas water minder"
            className={TEL_KNOP}
          >
            −
          </button>
          <label className="flex items-center gap-1">
            <span className="sr-only">Water in milliliters</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={50}
              value={waterMl ?? 0}
              disabled={busy}
              onChange={(event) => onWaterChange(Number(event.target.value) || 0)}
              className="w-[4.5rem] rounded-[8px] border border-white/10 bg-black/25 px-2 py-1 text-right text-[12.5px] tabular-nums text-[#F1EFE8]"
            />
            <span className="text-[11.5px] text-[#7E8C82]">ml</span>
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={() => onWaterChange((waterMl ?? 0) + WATER_GLAS_ML)}
            aria-label="Eén glas water meer"
            className={TEL_KNOP}
          >
            +
          </button>
        </span>
        {water ? (
          <span className="text-[11px] text-[#7E8C82]">{water}</span>
        ) : (
          <span className="text-[11px] text-[#7E8C82]">1 glas ≈ {WATER_GLAS_ML} ml</span>
        )}
      </div>

      {structuur ? (
        <p className="m-0 mt-2 text-[11px] leading-relaxed text-[#9FB0A6]">{structuur}</p>
      ) : null}

      <p className="m-0 mt-1.5 text-[11px] leading-relaxed text-[#7E8C82]">
        Porties, geen grammen — de maat erbij is een hulpje. Een schatting uit je hoofd is
        precies genoeg.
      </p>
    </div>
  );
}
