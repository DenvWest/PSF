"use client";

import { useId, useState } from "react";
import AgendaSheetFrame from "@/components/dashboard/agenda/AgendaSheetFrame";

/**
 * Eén waarde aanpassen, in een paneel van onderen: een getal (met − en +) of
 * een keuze uit een lijst. Eén veld, één Opslaan — zodat Je doelen een rustige
 * lijst kan zijn in plaats van een formulier met een knop per veld.
 *
 * Geen draaiwiel zoals in native apps: dat werkt stroef in een browser. Het
 * getalveld opent het numerieke toetsenbord; − en + doen de kleine stappen.
 *
 * "Wissen" zet de waarde op leeg. Wat leeg betekent verschilt per doel en
 * staat daarom in `leegUitleg` (bijv. "volg je laatste check").
 */

type GetalProps = {
  soort: "getal";
  titel: string;
  eenheid: string;
  waarde: number | null;
  stap: number;
  decimalen?: 0 | 1;
  /** Waar − en + beginnen als het veld leeg is; zonder start blijven ze uit tot je typt. */
  start?: number;
  isGeldig: (waarde: number | null) => boolean;
  foutTekst: string;
  uitleg?: string;
  leegUitleg: string;
  onBewaar: (waarde: number | null) => Promise<void>;
  onSluit: () => void;
};

type KeuzeProps = {
  soort: "keuze";
  titel: string;
  waarde: number | null;
  opties: ReadonlyArray<{ waarde: number; label: string; uitleg: string }>;
  leegLabel: string;
  leegUitleg: string;
  onBewaar: (waarde: number | null) => Promise<void>;
  onSluit: () => void;
};

export type DoelInvoerSheetProps = GetalProps | KeuzeProps;

export type DoelInvoerInhoud = Omit<GetalProps, "onSluit"> | Omit<KeuzeProps, "onSluit">;

function toonGetal(waarde: number | null, decimalen: 0 | 1): string {
  if (waarde === null) return "";
  return decimalen === 1 ? String(waarde).replace(".", ",") : String(Math.round(waarde));
}

function leesGetal(invoer: string, decimalen: 0 | 1): number | null {
  const tekst = invoer.trim().replace(",", ".");
  if (tekst === "") return null;
  const waarde = Number.parseFloat(tekst);
  if (!Number.isFinite(waarde)) return null;
  return decimalen === 1 ? Math.round(waarde * 10) / 10 : Math.round(waarde);
}

export default function DoelInvoerSheet(props: DoelInvoerSheetProps) {
  const titelId = useId();
  const [invoer, setInvoer] = useState(() =>
    props.soort === "getal" ? toonGetal(props.waarde, props.decimalen ?? 0) : "",
  );
  const [keuze, setKeuze] = useState<number | null>(props.waarde);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  async function bewaar(waarde: number | null) {
    setBezig(true);
    setFout(null);
    try {
      await props.onBewaar(waarde);
      props.onSluit();
    } catch (error: unknown) {
      setFout(error instanceof Error ? error.message : "Opslaan lukte niet.");
    } finally {
      setBezig(false);
    }
  }

  if (props.soort === "keuze") {
    return (
      <AgendaSheetFrame
        titleId={titelId}
        title={props.titel}
        onClose={props.onSluit}
        footer={
          <button
            type="button"
            disabled={bezig}
            onClick={() => void bewaar(keuze)}
            className="min-h-11 w-full cursor-pointer rounded-xl border-none bg-[var(--sage)] px-4 text-[14px] font-semibold text-[#0D190B] transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            Opslaan
          </button>
        }
      >
        <div role="radiogroup" aria-labelledby={titelId} className="grid gap-1">
          {[...props.opties, { waarde: null, label: props.leegLabel, uitleg: props.leegUitleg }].map(
            (optie) => {
              const actief = keuze === optie.waarde;
              return (
                <button
                  key={optie.label}
                  type="button"
                  role="radio"
                  aria-checked={actief}
                  onClick={() => setKeuze(optie.waarde)}
                  className="flex w-full cursor-pointer items-start gap-3 rounded-xl border-none bg-transparent px-2 py-3 text-left transition-colors hover:bg-white/[0.04]"
                >
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      actief ? "border-[var(--sage)]" : "border-white/30"
                    }`}
                  >
                    {actief ? <span className="h-2.5 w-2.5 rounded-full bg-[var(--sage)]" /> : null}
                  </span>
                  <span className="grid gap-0.5">
                    <span className="text-[14.5px] text-[#F1EFE8]">{optie.label}</span>
                    <span className="text-[12.5px] leading-snug text-[#9FB0A6]">{optie.uitleg}</span>
                  </span>
                </button>
              );
            },
          )}
        </div>
        {fout ? (
          <p role="alert" className="m-0 mt-3 text-[13px] text-[#E08A6B]">
            {fout}
          </p>
        ) : null}
      </AgendaSheetFrame>
    );
  }

  const decimalen = props.decimalen ?? 0;
  const waarde = leesGetal(invoer, decimalen);
  const leeg = invoer.trim() === "";
  const ongeldig = !leeg && !props.isGeldig(waarde);
  const stapBasis = waarde ?? props.start ?? null;

  function stap(richting: 1 | -1) {
    if (stapBasis === null || props.soort !== "getal") return;
    const volgende = Math.round((stapBasis + richting * props.stap) * 10) / 10;
    setInvoer(toonGetal(Math.max(0, volgende), decimalen));
  }

  const stapKnop =
    "flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-[22px] leading-none text-[#F1EFE8] transition-colors hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <AgendaSheetFrame
      titleId={titelId}
      title={props.titel}
      onClose={props.onSluit}
      footer={
        <div className="flex gap-2">
          {props.waarde !== null ? (
            <button
              type="button"
              disabled={bezig}
              onClick={() => void bewaar(null)}
              className="min-h-11 cursor-pointer rounded-xl border border-white/15 bg-transparent px-4 text-[14px] font-semibold text-[#9FB0A6] transition-colors hover:text-[#F1EFE8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Wissen
            </button>
          ) : null}
          <button
            type="button"
            disabled={bezig || ongeldig || leeg}
            onClick={() => void bewaar(waarde)}
            className="min-h-11 flex-1 cursor-pointer rounded-xl border-none bg-[var(--sage)] px-4 text-[14px] font-semibold text-[#0D190B] transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            Opslaan
          </button>
        </div>
      }
    >
      <div className="grid gap-4">
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            aria-label={`${props.stap} ${props.eenheid} minder`}
            disabled={stapBasis === null}
            onClick={() => stap(-1)}
            className={stapKnop}
          >
            −
          </button>
          <label className="flex items-baseline gap-2">
            <span className="sr-only">{props.titel}</span>
            <input
              value={invoer}
              onChange={(event) => setInvoer(event.target.value)}
              inputMode={decimalen === 1 ? "decimal" : "numeric"}
              placeholder="—"
              aria-invalid={ongeldig}
              className="w-28 border-0 border-b-2 border-white/25 bg-transparent py-1 text-center font-serif text-[34px] text-[#F1EFE8] outline-none placeholder:text-white/30 focus:border-[var(--sage)]"
            />
            <span className="text-[16px] text-[#9FB0A6]">{props.eenheid}</span>
          </label>
          <button
            type="button"
            aria-label={`${props.stap} ${props.eenheid} meer`}
            disabled={stapBasis === null}
            onClick={() => stap(1)}
            className={stapKnop}
          >
            +
          </button>
        </div>

        <p className={`m-0 text-center text-[12.5px] leading-relaxed ${ongeldig ? "text-[#E08A6B]" : "text-[#9FB0A6]"}`}>
          {ongeldig ? props.foutTekst : (props.uitleg ?? props.leegUitleg)}
        </p>
        {props.uitleg && !ongeldig ? (
          <p className="m-0 text-center text-[12px] leading-relaxed text-white/45">{props.leegUitleg}</p>
        ) : null}
        {fout ? (
          <p role="alert" className="m-0 text-center text-[13px] text-[#E08A6B]">
            {fout}
          </p>
        ) : null}
      </div>
    </AgendaSheetFrame>
  );
}
