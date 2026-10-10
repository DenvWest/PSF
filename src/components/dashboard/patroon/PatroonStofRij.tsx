import type { ReactNode } from "react";
import StofBalk from "@/components/dashboard/patroon/StofBalk";

/**
 * Eén stof in het Overzicht als kaart: naam met stand, de balk tegen de norm,
 * het gemiddelde en wat de norm is. Een tik opent de stof. Op een telefoon
 * staat alles onder elkaar in plaats van in smalle kolommen.
 */
export default function PatroonStofRij({
  naam,
  pil,
  waarde,
  aandeelTekst,
  aandeel,
  toon,
  balkLabel,
  regels,
  richting,
  onOpen,
}: {
  naam: string;
  pil?: { tekst: string; toon: "sage" | "amber" };
  /** Het gemiddelde of totaal, met eenheid. */
  waarde: string;
  /** "91%" of "—". */
  aandeelTekst: string;
  aandeel: number | null;
  toon: "sage" | "terra" | "neutraal";
  balkLabel: string;
  regels: readonly ReactNode[];
  richting?: { teken: string; toon: string } | null;
  onOpen: () => void;
}) {
  const stip = toon === "sage" ? "var(--vd-sage-2)" : toon === "terra" ? "var(--vd-terra)" : "var(--vd-ink-4)";

  return (
    <li className="list-none">
      <button
        type="button"
        onClick={onOpen}
        className="w-full cursor-pointer rounded-[14px] border border-[var(--vd-line)] bg-gradient-to-br from-[var(--vd-surface-2)] to-[var(--vd-surface)] p-3 text-left font-[inherit] text-inherit hover:border-[var(--vd-line-2)]"
      >
        <span className="flex items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-2">
            <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ background: stip }} />
            <b className="min-w-0 truncate text-[0.9375rem] font-semibold text-[var(--vd-ink)]">{naam}</b>
            {pil ? (
              <span className="vd-pil" data-toon={pil.toon}>
                {pil.tekst}
              </span>
            ) : null}
          </span>
          <span className="flex shrink-0 items-baseline gap-2">
            <span className="font-mono text-[0.875rem] tabular-nums text-[var(--vd-ink)]">{aandeelTekst}</span>
            {richting ? (
              <span className="vd-trend" data-richting={richting.toon} aria-hidden>
                {richting.teken}
              </span>
            ) : (
              <span aria-hidden className="text-[var(--vd-ink-4)]">
                ›
              </span>
            )}
          </span>
        </span>
        {aandeel !== null ? (
          <span className="mt-2.5 block">
            <StofBalk aandeel={aandeel} toon={toon} label={balkLabel} />
          </span>
        ) : null}
        <span className="mt-2 flex flex-col gap-0.5">
          <span className="font-mono text-[0.75rem] tabular-nums text-[var(--vd-ink-2)]">{waarde}</span>
          {regels.map((regel, i) => (
            <span key={i} className="text-[0.6875rem] leading-snug text-[var(--vd-ink-3)]">
              {regel}
            </span>
          ))}
        </span>
      </button>
    </li>
  );
}
