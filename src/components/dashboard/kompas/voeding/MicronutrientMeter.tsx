"use client";

import { DEKKING_LABEL, type DekkingStatus, type StofDekking } from "@/lib/nutrition-dagdekking";

/**
 * Eén stof als balk: hoe goed hij vandaag gedekt is, en waar dat vandaan kwam.
 *
 * ## Waarom de balk geen percentage is
 *
 * De balk vult op **status**, niet op een gerekend aandeel. Dat is geen
 * bescheidenheid maar de enige eerlijke vorm: de gehaltes zijn indicatief, de
 * porties zijn standaardporties, en bij magnesium en zink bepaalt fytaat mede
 * wat je er werkelijk uit haalt. Een balk op 62% zou drie onzekerheden achter
 * één cijfer verstoppen. Zie `nutrition-dagdekking.ts`.
 *
 * De vier vullingen zijn dus een leesbare vertaling van vier woorden, en de
 * regel eronder noemt de bron waar het vandaan kwam — dát is het bewijs.
 */

const VULLING: Record<DekkingStatus, string> = {
  sterk: "100%",
  iets: "62%",
  weinig: "28%",
  geen: "0%",
};

const KLEUR: Record<DekkingStatus, string> = {
  sterk: "#5A8F6A",
  iets: "#7FA98B",
  weinig: "#8C7B4F",
  geen: "transparent",
};

export default function MicronutrientMeter({
  rij,
  compact = false,
  onOpen,
}: {
  rij: StofDekking;
  /** Compacte vorm voor de rij van vier bovenaan; vol voor het volle overzicht. */
  compact?: boolean;
  onOpen?: (stof: StofDekking) => void;
}) {
  const topBron = rij.bronnen[0];
  const inhoud = (
    <>
      <span className="flex items-baseline justify-between gap-2">
        <span
          className={`truncate font-semibold text-[#CDD7D0] ${
            compact ? "text-[11px]" : "text-[12.5px]"
          }`}
        >
          {rij.stof.label}
        </span>
        {!compact ? (
          <span className="shrink-0 text-[10.5px] text-[#7E8C82]">
            {DEKKING_LABEL[rij.status]}
          </span>
        ) : null}
      </span>

      <span
        aria-hidden
        className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]"
      >
        <span
          className="block h-full rounded-full transition-[width]"
          style={{ width: VULLING[rij.status], background: KLEUR[rij.status] }}
        />
      </span>

      <span
        className={`mt-1.5 block truncate text-[#9FB0A6] ${
          compact ? "text-[10.5px]" : "text-[11px]"
        }`}
      >
        {topBron
          ? `${topBron.product.labelNl}${rij.bronnen.length > 1 ? ` +${rij.bronnen.length - 1}` : ""}`
          : compact
            ? DEKKING_LABEL[rij.status]
            : rij.stof.bronRegel}
      </span>
    </>
  );

  if (!onOpen) {
    return (
      <div className="min-w-0">
        <span className="sr-only">
          {rij.stof.label}: {DEKKING_LABEL[rij.status]}
        </span>
        {inhoud}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onOpen(rij)}
      aria-label={`${rij.stof.label} — ${DEKKING_LABEL[rij.status]}. Bekijk alle bronnen.`}
      className="min-w-0 cursor-pointer rounded-xl border-none bg-transparent p-0 text-left transition hover:opacity-80"
    >
      {inhoud}
    </button>
  );
}
