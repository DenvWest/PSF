"use client";

import { useState, type ReactNode } from "react";
import * as Icons from "@/components/app/icons";
import { EETMOMENTEN, type EetmomentId } from "@/lib/nutrition-eetmomenten";

/**
 * Het portiescherm voor al het eten in het dagboek: header met terugchevron,
 * rijen Maaltijd / Aantal porties / Portiegrootte, het totaalgewicht en daaronder
 * wat het gekozen eten oplevert. Eén vorm voor een NEVO-product, een
 * supermarktproduct en een catalogusregel, zodat het overal hetzelfde voelt.
 *
 * Aantal porties × portiegrootte geeft het totale gewicht; dat gewicht bepaalt
 * de bijdrage. Wat er bij het totaal getoond wordt (macro's, kernstoffen,
 * bronregels) is aan de aanroeper, via `children`.
 */
export default function PortieRijenScherm({
  naam,
  moment,
  startGram = 100,
  snelkeuzes = [],
  kopActie = null,
  onBevestig,
  onTerug,
  busy = false,
  children,
}: {
  naam: string;
  moment: EetmomentId;
  /** De portiegrootte waarmee het scherm opent. */
  startGram?: number;
  /** Gangbare porties, als één-tik-keuze binnen de rij Portiegrootte. */
  snelkeuzes?: readonly { labelNl: string; grams: number }[];
  /** Eén extra knop rechts in de kop (de favoriet-ster). */
  kopActie?: ReactNode;
  onBevestig: (moment: EetmomentId, grams: number) => void;
  onTerug: () => void;
  busy?: boolean;
  /** Wat het scherm laat zien bij het totale gewicht: "Levert", bronregels. */
  children: (totaalGram: number) => ReactNode;
}) {
  const [gekozenMoment, setGekozenMoment] = useState<EetmomentId>(moment);
  const [aantalPorties, setAantalPorties] = useState(1);
  const [portiegrootteGram, setPortiegrootteGram] = useState(startGram);
  /** Welke rij op dit moment zijn eigen invoer toont. */
  const [openRij, setOpenRij] = useState<"maaltijd" | "porties" | "portiegrootte" | null>(
    null,
  );

  const totaalGram = Math.max(1, Math.trunc(aantalPorties * portiegrootteGram));
  const momentLabel = EETMOMENTEN.find((m) => m.id === gekozenMoment)?.label ?? "";

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onTerug}
          aria-label="Terug"
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/12 bg-white/[0.03] text-[var(--vd-ink-2)] transition-colors hover:border-white/30 hover:text-[var(--vd-ink)]"
        >
          <Icons.ChevronLeft s={18} />
        </button>
        <h2 className="m-0 min-w-0 flex-1 truncate font-serif text-[19px] font-normal text-[var(--vd-ink)]">
          Voedsel toevoegen
        </h2>
        {kopActie}
        <button
          type="button"
          disabled={busy}
          onClick={() => onBevestig(gekozenMoment, totaalGram)}
          aria-label="Bevestigen"
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-[var(--vd-sage-2)] transition-colors hover:text-[var(--vd-sage)] disabled:opacity-40"
        >
          <Icons.Check s={20} />
        </button>
      </header>

      <p className="m-0 truncate text-[15px] font-bold text-[var(--vd-ink)]">{naam}</p>

      <section className="flex flex-col divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/10">
        <button
          type="button"
          onClick={() => setOpenRij(openRij === "maaltijd" ? null : "maaltijd")}
          className="flex w-full cursor-pointer items-center justify-between gap-3 bg-white/[0.02] px-3.5 py-3 text-left transition-colors hover:bg-white/[0.05]"
        >
          <span className="text-[13px] text-[var(--vd-ink-2)]">Maaltijd</span>
          <span className="text-[13px] font-medium text-[var(--vd-accent-2)]">{momentLabel}</span>
        </button>
        {openRij === "maaltijd" ? (
          <div role="group" aria-label="Kies een maaltijd" className="flex flex-wrap gap-1.5 bg-black/10 px-3.5 py-3">
            {EETMOMENTEN.map((m) => {
              const actief = m.id === gekozenMoment;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setGekozenMoment(m.id);
                    setOpenRij(null);
                  }}
                  aria-pressed={actief}
                  className={`min-h-[32px] cursor-pointer rounded-lg border px-2.5 text-[12px] transition-colors ${
                    actief
                      ? "border-[var(--vd-sage)] bg-[rgb(var(--vd-sage-rgb)/20%)] font-semibold text-[var(--vd-sage-2)]"
                      : "border-white/10 bg-white/[0.02] text-[var(--vd-ink-3)] hover:border-white/25 hover:text-[var(--vd-ink-2)]"
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setOpenRij(openRij === "porties" ? null : "porties")}
          className="flex w-full cursor-pointer items-center justify-between gap-3 bg-white/[0.02] px-3.5 py-3 text-left transition-colors hover:bg-white/[0.05]"
        >
          <span className="text-[13px] text-[var(--vd-ink-2)]">Aantal porties</span>
          <span className="text-[13px] font-medium text-[var(--vd-accent-2)]">{aantalPorties}</span>
        </button>
        {openRij === "porties" ? (
          <div className="flex items-center gap-2.5 bg-black/10 px-3.5 py-3">
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={20}
              value={aantalPorties}
              disabled={busy}
              onChange={(event) =>
                setAantalPorties(Math.max(1, Math.trunc(Number(event.target.value)) || 1))
              }
              className="w-20 rounded-lg border border-white/15 bg-black/20 px-2.5 py-2 text-right font-mono text-[13px] tabular-nums text-[var(--vd-ink)] outline-none transition-colors focus:border-white/40"
            />
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setOpenRij(openRij === "portiegrootte" ? null : "portiegrootte")}
          className="flex w-full cursor-pointer items-center justify-between gap-3 bg-white/[0.02] px-3.5 py-3 text-left transition-colors hover:bg-white/[0.05]"
        >
          <span className="text-[13px] text-[var(--vd-ink-2)]">Portiegrootte</span>
          <span className="text-[13px] font-medium text-[var(--vd-accent-2)]">
            {portiegrootteGram} g
          </span>
        </button>
        {openRij === "portiegrootte" ? (
          <div className="flex items-center gap-2.5 bg-black/10 px-3.5 py-3">
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={2000}
              value={portiegrootteGram}
              disabled={busy}
              onChange={(event) =>
                setPortiegrootteGram(Math.max(1, Math.trunc(Number(event.target.value)) || 1))
              }
              className="w-20 rounded-lg border border-white/15 bg-black/20 px-2.5 py-2 text-right font-mono text-[13px] tabular-nums text-[var(--vd-ink)] outline-none transition-colors focus:border-white/40"
            />
            <span className="text-[12px] text-[var(--vd-ink-4)]">gram</span>
            {snelkeuzes.length > 0 ? (
              <div className="ml-auto flex flex-wrap justify-end gap-1.5">
                {snelkeuzes.map((portie) => {
                  const actief = portiegrootteGram === portie.grams;
                  return (
                    <button
                      key={`${portie.labelNl}-${portie.grams}`}
                      type="button"
                      onClick={() => setPortiegrootteGram(portie.grams)}
                      aria-pressed={actief}
                      aria-label={`${portie.labelNl}, ${portie.grams} gram`}
                      className={`min-h-[32px] cursor-pointer rounded-lg border px-2.5 text-[12px] transition-colors ${
                        actief
                          ? "border-[var(--vd-sage)] bg-[rgb(var(--vd-sage-rgb)/20%)] font-semibold text-[var(--vd-sage-2)]"
                          : "border-white/10 bg-white/[0.02] text-[var(--vd-ink-3)] hover:border-white/25 hover:text-[var(--vd-ink-2)]"
                      }`}
                    >
                      {portie.labelNl} <span className="text-[10.5px] text-[var(--vd-ink-4)]">{portie.grams} g</span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <p className="m-0 text-[11px] text-[var(--vd-ink-4)]">
        Totaal: {totaalGram} g
      </p>

      {children(totaalGram)}

      <button
        type="button"
        disabled={busy}
        onClick={() => onBevestig(gekozenMoment, totaalGram)}
        className="min-h-[44px] w-full cursor-pointer rounded-xl bg-[var(--vd-sage)] px-4 text-[13px] font-semibold text-[var(--vd-bg)] transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        Toevoegen
      </button>
    </div>
  );
}
