"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { clarityTag } from "@/lib/clarity";
import {
  BALK_ZONES,
  heeftStatusKleur,
  markerPositie,
  STATUS_KLEUR,
  surfaceStyles,
  type DashboardSurface,
} from "@/lib/dashboard-surface";
import { trackEvent } from "@/lib/ga4";
import type { LadderEvidenceStatus } from "@/lib/domain-ladder-readout";
import type { NutritionFactRow, NutritionFactRowKey } from "@/lib/nutrition-ladder";
import {
  beschikbareGroepen,
  rowKeysVoorGroepen,
  type VoedselgroepId,
} from "@/lib/nutrition-voedselgroepen";

/**
 * Wat je eet, naast de richtlijn — de feitenrijen uit je voedingscheck als
 * ranglijst.
 *
 * De vorm komt van de PesticidenEetwijzer: gesorteerd, met kleurzones en een
 * totaalregel. De inhoud komt uit `buildNutritionFactRows` — dezelfde rijen die
 * de ladder per laag toont, hier op één hoop en doorzoekbaar op voedselgroep.
 *
 * **Waarom dit dezelfde bron gebruikt als de ladder.** De eerste versie van dit
 * component bouwde een eigen tabel uit de losse sliders. Dat leverde dezelfde
 * antwoorden twee keer op één scherm op, met twee groeperingen die net niet
 * overeenkwamen. Nu is er één bron: `factRows` draagt het antwoord uit de check
 * (`answerLabel`), de lat (`benchmarkLabel` + `benchmarkSource`), waarom de rij
 * telt (`whyLine`) en zijn status. Deze component is een andere *weergave* van
 * die rijen, geen tweede berekening ervan.
 *
 * Drie statussen krijgen kleur, de vierde bewust niet:
 * - `below` rood, `near` oranje, `meets` groen
 * - `own` (geen richtlijn, of een opt-out) krijgt een open bolletje en telt
 *   niet mee in de optelling. Een kleur zonder lat is een oordeel dat we niet
 *   kunnen onderbouwen — zie de `exemption`-copy per rij.
 */

const STATUS_LABEL: Record<LadderEvidenceStatus, string> = {
  below: "hier zit je ruimte",
  near: "bijna op niveau",
  meets: "zit goed",
  own: "geen richtlijn — je eigen ijkpunt",
};

/** Sorteervolgorde: grootste ruimte eerst, rijen zonder lat onderaan. */
const STATUS_RANG: Record<LadderEvidenceStatus, number> = {
  below: 0,
  near: 1,
  meets: 2,
  own: 3,
};

/**
 * De verhoudingsbalk: drie zones met daarop de marker waar jij staat.
 *
 * De zones staan op zeer laag contrast — ze zijn de schaal, niet de boodschap.
 * De marker draagt de volle kleur van je status; dat is wat je moet zien als je
 * langs de lijst scant. Rijen zonder richtlijn krijgen geen balk: er is dan
 * geen schaal om iets op af te lezen.
 *
 * `aria-hidden`, want de rij zegt het al in woorden (`STATUS_LABEL`) — een
 * screenreader zou hier alleen de vorm herhalen.
 */
function VerhoudingBalk({ status, bed }: { status: LadderEvidenceStatus; bed: string }) {
  if (!heeftStatusKleur(status)) {
    return null;
  }
  return (
    <span
      aria-hidden
      className={`relative mt-1.5 block h-1.5 w-full overflow-hidden rounded-full ${bed}`}
    >
      <span className="absolute inset-0 flex">
        {BALK_ZONES.map((zone) => (
          <span
            key={zone.status}
            className="h-full"
            style={{
              width: `${zone.breedte}%`,
              backgroundColor: STATUS_KLEUR[zone.status],
              opacity: 0.22,
            }}
          />
        ))}
      </span>
      <span
        className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2"
        style={{
          left: `${markerPositie(status)}%`,
          backgroundColor: STATUS_KLEUR[status],
          // De ring snijdt de marker los van de zone eronder, op beide surfaces.
          "--tw-ring-color": "rgba(0,0,0,0.28)",
        } as React.CSSProperties}
      />
    </span>
  );
}

function StatusBol({ status }: { status: LadderEvidenceStatus }) {
  if (!heeftStatusKleur(status)) {
    return (
      <span
        aria-hidden
        className="inline-block h-2.5 w-2.5 shrink-0 rounded-full border border-current opacity-30"
      />
    );
  }
  return (
    <span
      aria-hidden
      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: STATUS_KLEUR[status] }}
    />
  );
}

function tellingRegel(rijen: readonly NutritionFactRow[]): string {
  let rood = 0;
  let oranje = 0;
  let groen = 0;
  let zonderLat = 0;
  for (const rij of rijen) {
    const status = rij.status ?? "own";
    if (status === "below") rood += 1;
    else if (status === "near") oranje += 1;
    else if (status === "meets") groen += 1;
    else zonderLat += 1;
  }
  const totaal = rood + oranje + groen;

  if (totaal === 0) {
    return zonderLat > 0
      ? `${zonderLat} ${zonderLat === 1 ? "onderdeel heeft" : "onderdelen hebben"} geen richtlijn om naast te leggen.`
      : "Nog niets uit je check om naast een richtlijn te leggen.";
  }
  if (rood === 0 && oranje === 0) {
    return `Alle ${totaal} onderdelen met een richtlijn zitten op niveau.`;
  }
  if (rood === 0) {
    return `${oranje} van ${totaal} onderdelen ${oranje === 1 ? "heeft" : "hebben"} nog ruimte, geen enkele in het rood.`;
  }
  return `${rood} van ${totaal} onderdelen ${rood === 1 ? "staat" : "staan"} in het rood${
    oranje > 0 ? `, ${oranje} ${oranje === 1 ? "heeft" : "hebben"} nog ruimte` : ""
  }.`;
}

function Rij({
  rij,
  surface,
  open,
  onToggle,
}: {
  rij: NutritionFactRow;
  surface: DashboardSurface;
  open: boolean;
  onToggle: () => void;
}) {
  const s = surfaceStyles(surface);
  const status = rij.status ?? "own";
  const paneelId = `verhouding-waarom-${rij.key}`;

  return (
    <li className={`border-t ${s.rij}`}>
      <div className="px-4 py-3">
        {/* Kop en status op één regel: het onderdeel links, het oordeel rechts.
            Dat oordeel stond eerst alleen in kleur en in een sr-only regel —
            nu leest iedereen hetzelfde. */}
        <div className="flex items-baseline justify-between gap-3">
          <span className="flex min-w-0 items-center gap-2">
            <StatusBol status={status} />
            <span className={`truncate text-[13px] font-semibold leading-snug ${s.tekst}`}>
              {rij.label}
            </span>
          </span>
          <span className={`shrink-0 text-[11px] font-semibold leading-snug ${s.zacht}`}>
            {STATUS_LABEL[status]}
          </span>
        </div>

        <VerhoudingBalk status={status} bed={s.balkBed} />

        {/* Onder de balk: waar jij staat en waar de lat ligt. Dezelfde twee
            waarden als voorheen, maar nu als uiteinden van één schaal in
            plaats van twee kolommen die je zelf moet vergelijken. */}
        <div className="mt-1.5 flex items-baseline justify-between gap-3">
          <span
            className={`text-[12.5px] leading-snug ${s.tekst}`}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            jij: {rij.answerLabel}
          </span>
          <span className={`shrink-0 text-right text-[11.5px] leading-snug ${s.zacht} text-pretty`}>
            {rij.benchmarkLabel ? `de lat: ${rij.benchmarkLabel}` : STATUS_LABEL.own}
          </span>
        </div>
      </div>

      <div className="px-4 pb-2">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={paneelId}
          className={`cursor-pointer border-none bg-transparent p-0 text-left text-[11.5px] font-semibold ${s.knop}`}
        >
          {open ? "Verberg onderbouwing" : "Waar komt dit vandaan?"}
        </button>
      </div>

      {open ? (
        <div
          id={paneelId}
          className={`mx-4 mb-3 rounded-[10px] px-3 py-2.5 ${s.paneel}`}
        >
          <dl className="m-0 flex flex-col gap-2">
            <div>
              <dt className={`m-0 text-[10px] font-semibold uppercase tracking-[0.12em] ${s.kop}`}>
                Uit je voedingscheck
              </dt>
              <dd className={`m-0 mt-0.5 text-[12px] leading-relaxed ${s.tekst} text-pretty`}>
                Je antwoordde: {rij.answerLabel}
              </dd>
            </div>

            <div>
              <dt className={`m-0 text-[10px] font-semibold uppercase tracking-[0.12em] ${s.kop}`}>
                Waarom deze vraag telt
              </dt>
              <dd className={`m-0 mt-0.5 text-[12px] leading-relaxed ${s.zacht} text-pretty`}>
                {rij.whyLine}
              </dd>
            </div>

            {/* De lat zelf staat al in de rij hierboven; hier alleen waar hij
                vandaan komt, of waarom hij ontbreekt. */}
            <div>
              <dt className={`m-0 text-[10px] font-semibold uppercase tracking-[0.12em] ${s.kop}`}>
                {rij.benchmarkLabel ? "Waar de lat vandaan komt" : "Waarom er geen lat is"}
              </dt>
              <dd className={`m-0 mt-0.5 text-[12px] leading-relaxed ${s.zacht} text-pretty`}>
                {rij.benchmarkLabel
                  ? (rij.benchmarkSource ?? "Algemene richtlijn voor de bevolking.")
                  : rij.exemption === "opt-out"
                    ? "Je gaf aan dit niet te eten — dan is dit niet jouw meetlat."
                    : "Voor dit onderdeel bestaat geen populatierichtlijn. Je eigen antwoord is het ijkpunt; er komt geen kleur bij."}
              </dd>
            </div>

            {rij.footnote ? (
              <div>
                <dt className="sr-only">Let op</dt>
                <dd className={`m-0 text-[11.5px] leading-relaxed ${s.kop} text-pretty`}>
                  {rij.footnote}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      ) : null}
    </li>
  );
}

export default function VerhoudingTabel({
  rijen,
  surface,
  checkDatum = null,
  titel = "Wat je eet, naast de richtlijn",
  onGoAanvullen,
  compact = false,
}: {
  /** Feitenrijen uit `buildNutritionFactRows` — dezelfde bron als de ladder. */
  rijen: readonly NutritionFactRow[];
  surface: DashboardSurface;
  /** Weergavedatum van de laatste voedingscheck; toont waar dit vandaan komt. */
  checkDatum?: string | null;
  titel?: string;
  /**
   * Uitgang naar "aanvullen" (P6). Optioneel: op de check-surface bestaat die
   * laag nog niet, en dan hoort er geen CTA onder te staan.
   */
  onGoAanvullen?: () => void;
  /** Alleen rijen — geen inleiding, disclaimer of CTA. */
  compact?: boolean;
}) {
  const s = surfaceStyles(surface);
  const [selectie, setSelectie] = useState<VoedselgroepId[]>([]);
  const [openRij, setOpenRij] = useState<NutritionFactRowKey | null>(null);
  const gezien = useRef(false);

  const groepen = useMemo(
    () => beschikbareGroepen(rijen.map((rij) => rij.key)),
    [rijen],
  );

  const gesorteerd = useMemo(() => {
    const keys = rowKeysVoorGroepen(selectie);
    const zichtbaar = keys ? rijen.filter((rij) => keys.has(rij.key)) : [...rijen];
    // Grootste ruimte bovenaan; binnen dezelfde status blijft de
    // ladder-volgorde staan (Array.prototype.sort is stabiel).
    return zichtbaar
      .slice()
      .sort((a, b) => STATUS_RANG[a.status ?? "own"] - STATUS_RANG[b.status ?? "own"]);
  }, [rijen, selectie]);

  // De telling gaat over álle rijen, niet over de filterselectie: de CTA gaat
  // over je voeding, niet over het lijstje dat je nu toevallig openhebt.
  const aantalRuimte = useMemo(
    () => rijen.filter((rij) => (rij.status ?? "own") === "below").length,
    [rijen],
  );

  useEffect(() => {
    if (gezien.current || rijen.length === 0) return;
    gezien.current = true;
    const telling = { below: 0, near: 0, meets: 0, own: 0 };
    for (const rij of rijen) {
      telling[rij.status ?? "own"] += 1;
    }
    trackEvent("nutrition_verhouding_shown", {
      surface,
      rows: rijen.length,
      rood: telling.below,
      oranje: telling.near,
      groen: telling.meets,
      zonder_lat: telling.own,
    });
    clarityTag("nutrition_verhouding", String(telling.below));
  }, [rijen, surface]);

  if (compact) {
    return (
      <section aria-labelledby="verhouding-heading" className={`@container mt-4 ${s.kaart}`}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <caption id="verhouding-heading" className="sr-only">
              {titel}
            </caption>
            <thead>
              <tr className={`border-b ${s.rij}`}>
                <th className={`px-3.5 py-2 text-[9.5px] font-bold uppercase tracking-[0.13em] ${s.zacht}`}>
                  Onderdeel
                </th>
                <th className={`px-3.5 py-2 text-[9.5px] font-bold uppercase tracking-[0.13em] ${s.zacht}`}>
                  Jij
                </th>
                <th className={`px-3.5 py-2 text-[9.5px] font-bold uppercase tracking-[0.13em] ${s.zacht}`}>
                  De lat
                </th>
              </tr>
            </thead>
            <tbody>
              {gesorteerd.length === 0 ? (
                <tr>
                  <td colSpan={3} className={`px-3.5 py-3 text-[12.5px] ${s.zacht}`}>
                    Nog geen voedingscheck — dan blijven de rijen leeg.
                  </td>
                </tr>
              ) : (
                gesorteerd.map((rij) => (
                  <tr key={rij.key} className={`border-b ${s.rij} last:border-b-0`}>
                    <th
                      scope="row"
                      className={`px-3.5 py-2.5 text-[13px] font-semibold ${s.tekst}`}
                    >
                      {rij.label}
                    </th>
                    <td className={`px-3.5 py-2.5 text-[12.5px] ${s.tekst}`}>
                      {rij.answerLabel || "—"}
                    </td>
                    <td className={`px-3.5 py-2.5 text-[12px] ${s.zacht}`}>
                      {rij.benchmarkLabel || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  if (rijen.length === 0) {
    return null;
  }

  function toggleGroep(id: VoedselgroepId) {
    setSelectie((huidig) => {
      const volgende = huidig.includes(id)
        ? huidig.filter((g) => g !== id)
        : [...huidig, id];
      trackEvent("nutrition_verhouding_filter", {
        surface,
        groups: volgende.join(",") || "alles",
        count: volgende.length,
      });
      clarityTag("nutrition_verhouding_filter", volgende.join(",") || "alles");
      return volgende;
    });
  }

  function toggleRij(key: NutritionFactRowKey) {
    setOpenRij((huidig) => {
      const volgende = huidig === key ? null : key;
      if (volgende) {
        trackEvent("nutrition_verhouding_evidence_open", { surface, row: volgende });
        clarityTag("nutrition_verhouding_evidence", volgende);
      }
      return volgende;
    });
  }

  return (
    <section aria-labelledby="verhouding-heading" className={`@container ${s.kaart}`}>
      <div className="px-4 py-3.5">
        <h2
          id="verhouding-heading"
          className={`m-0 text-[11px] font-semibold uppercase tracking-[0.16em] ${s.kop}`}
        >
          {titel}
        </h2>
        <p className={`mt-1.5 m-0 text-[13.5px] font-medium leading-snug ${s.tekst} text-pretty`}>
          {tellingRegel(gesorteerd)}
        </p>
        <p className={`mt-1 m-0 text-[11.5px] leading-relaxed ${s.zacht}`}>
          {checkDatum
            ? `Uit je voedingscheck van ${checkDatum}.`
            : "Uit je voedingscheck."}
        </p>
      </div>

      {groepen.length > 1 ? (
        <div className={`border-t px-4 py-2.5 ${s.rij}`}>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter op voedselgroep">
            <button
              type="button"
              onClick={() => setSelectie([])}
              aria-pressed={selectie.length === 0}
              className={`cursor-pointer rounded-full border px-2.5 py-1 text-[11.5px] font-semibold transition ${
                selectie.length === 0 ? s.chipAan : s.chipUit
              }`}
            >
              Alles
            </button>
            {groepen.map((groep) => {
              const aan = selectie.includes(groep.id);
              return (
                <button
                  key={groep.id}
                  type="button"
                  onClick={() => toggleGroep(groep.id)}
                  aria-pressed={aan}
                  className={`cursor-pointer rounded-full border px-2.5 py-1 text-[11.5px] font-semibold transition ${
                    aan ? s.chipAan : s.chipUit
                  }`}
                >
                  {groep.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {gesorteerd.length > 0 ? (
        <ul className="m-0 flex list-none flex-col p-0">
          {gesorteerd.map((rij) => (
            <Rij
              key={rij.key}
              rij={rij}
              surface={surface}
              open={openRij === rij.key}
              onToggle={() => toggleRij(rij.key)}
            />
          ))}
        </ul>
      ) : (
        <p className={`m-0 border-t px-4 py-4 text-[12.5px] leading-relaxed ${s.rij} ${s.zacht}`}>
          Je check zegt niets over deze groep. Kies een andere, of zet het filter
          op Alles.
        </p>
      )}

      {/* Eén uitgang onder de lijst, niet dertien in de rijen: de vraag "en
          nu?" komt pas op als je het hele beeld hebt gezien. Alleen tonen als
          er ook echt ruimte is — bij nul rode rijen is er niets aan te vullen,
          en dan is de CTA een verkooppraatje in plaats van een antwoord. */}
      {onGoAanvullen && aantalRuimte > 0 ? (
        <div className={`border-t px-4 py-3 ${s.rij}`}>
          <p className={`m-0 text-[12.5px] leading-relaxed ${s.tekst} text-pretty`}>
            {aantalRuimte === 1
              ? "Eén onderdeel met ruimte."
              : `${aantalRuimte} onderdelen met ruimte.`}{" "}
            De meeste dicht je met je bord.
          </p>
          <button
            type="button"
            onClick={() => {
              trackEvent("nutrition_verhouding_cta_click", {
                surface,
                rood: aantalRuimte,
              });
              clarityTag("nutrition_verhouding_cta", String(aantalRuimte));
              onGoAanvullen();
            }}
            className={`mt-1 cursor-pointer border-none bg-transparent p-0 text-left text-[12.5px] font-semibold ${s.knop}`}
          >
            Kijk of aanvullen zin heeft ›
          </button>
        </div>
      ) : null}

      <p className={`m-0 border-t px-4 py-3 text-[11px] leading-relaxed ${s.rij} ${s.kop} text-pretty`}>
        Hoe vaak je iets eet, naast een algemene richtlijn voor de bevolking —
        geen persoonlijke norm.
      </p>
    </section>
  );
}
