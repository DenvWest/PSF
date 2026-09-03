"use client";

import { useId, useRef } from "react";
import { clarityTag } from "@/lib/clarity";
import { surfaceStyles } from "@/lib/dashboard-surface";
import type { LadderEvidenceRow } from "@/lib/domain-ladder-readout";
import { trackEvent } from "@/lib/ga4";

/**
 * De onderbouwing achter één knop in de keuzekolom.
 *
 * **Het probleem dat dit oplost.** De bronnen stonden tot nu voluit onder de
 * feiten op het werkvlak: per rij een richtlijn, een bron en een voetnoot. Dat
 * is precies de informatie die je één keer wilt kunnen nakijken en daarna niet
 * meer wilt zien — maar hij nam meer verticale ruimte in dan de feiten zelf,
 * waardoor het antwoord ("waar sta ik") onderging in de verantwoording
 * ("waarom vinden we dat").
 *
 * /supplementen loste dit al zo op: `OnderbouwingPanel` zet de rekenwijze en de
 * gidsen achter één knop in de zijbalk, en het paneel blijft in de HTML staan
 * zodat de inhoud vindbaar blijft. Dit is dezelfde vorm voor een domein, met de
 * bronnen van de prioriteit die je openhebt.
 *
 * **Waarom per prioriteit en niet één keer per domein.** De bronnen verschillen
 * per laag — de richtlijn onder groente is een andere dan die onder vette vis.
 * Eén verzamelpaneel voor het hele domein zou je laten zoeken naar de bron die
 * bij het feit hoort dat je net las.
 */

export default function DomeinOnderbouwing({
  rijen,
  prioriteitNaam,
  domain,
  surface,
  className = "",
}: {
  /** De feitenrijen van de actieve prioriteit. */
  rijen: readonly LadderEvidenceRow[];
  prioriteitNaam: string;
  domain: string;
  surface: string;
  className?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titelId = useId();
  const s = surfaceStyles("dashboard");

  // Alleen rijen die echt iets te verantwoorden hebben. Een paneel dat opengaat
  // op een lijst zonder bronnen belooft een antwoord dat er niet is.
  const metBron = rijen.filter(
    (rij) => rij.benchmarkLabel || rij.benchmarkSource || rij.footnote,
  );

  if (metBron.length === 0) {
    return null;
  }

  function open() {
    dialogRef.current?.showModal();
    trackEvent("domein_onderbouwing_open", {
      surface,
      domain,
      prioriteit: prioriteitNaam,
      bronnen: metBron.length,
    });
    clarityTag("domein_onderbouwing", domain);
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors ${s.rij} bg-black/20 hover:bg-white/[0.04] ${className}`}
      >
        <span className={`text-[12.5px] font-semibold ${s.tekst}`}>
          Waar dit op rust
        </span>
        <span
          aria-hidden
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold ${s.rij} ${s.zacht}`}
        >
          i
        </span>
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titelId}
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
        className="m-auto w-[min(34rem,92vw)] rounded-2xl border border-white/10 bg-[#182220] p-0 text-[#E7EDE8] shadow-2xl backdrop:bg-black/50"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div className="min-w-0">
            <p id={titelId} className={`m-0 text-[15px] font-semibold ${s.tekst}`}>
              Waar dit op rust
            </p>
            <p className={`m-0 mt-1 text-[12px] leading-relaxed ${s.zacht}`}>
              De richtlijnen en bronnen onder {prioriteitNaam.toLowerCase()}.
            </p>
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className={`-mr-1 -mt-1 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent ${s.zacht} transition-colors hover:bg-white/10`}
          >
            <span className="sr-only">Sluiten</span>
            <span aria-hidden className="text-lg leading-none">
              ×
            </span>
          </button>
        </div>

        <div className="max-h-[68vh] overflow-y-auto px-5 py-4">
          <ul className="m-0 flex list-none flex-col gap-3.5 p-0" role="list">
            {metBron.map((rij) => (
              <li key={rij.key} className="border-b border-white/[0.06] pb-3.5 last:border-b-0 last:pb-0">
                <p className={`m-0 text-[12.5px] font-semibold leading-snug ${s.tekst}`}>
                  {rij.label}
                </p>
                {rij.benchmarkLabel ? (
                  <p className={`m-0 mt-1 text-[12px] leading-relaxed ${s.zacht} text-pretty`}>
                    {rij.benchmarkLabel}
                  </p>
                ) : null}
                {rij.benchmarkSource ? (
                  <p className="m-0 mt-1 text-[11px] leading-relaxed text-[#7E8C82]">
                    Bron: {rij.benchmarkSource}
                  </p>
                ) : null}
                {rij.footnote ? (
                  <p className="m-0 mt-1 text-[11px] leading-relaxed text-[#7E8C82] text-pretty">
                    {rij.footnote}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>

          <p className="m-0 mt-5 border-t border-white/10 pt-3.5 text-[11px] leading-relaxed text-[#7E8C82] text-pretty">
            Je antwoorden komen uit je eigen check — zelfrapportage, geen meting.
            De richtlijnen ernaast zijn publieke normen; waar er geen norm is,
            staat dat er zo bij in plaats van een oordeel.
          </p>
        </div>
      </dialog>
    </>
  );
}
