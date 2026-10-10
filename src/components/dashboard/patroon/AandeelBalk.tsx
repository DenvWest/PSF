/**
 * Het deel van je dagnorm dat één maaltijd dekt: de baan is de hele dagnorm,
 * de vulling is wat deze maaltijd levert. Een streepje toont je eigen doel
 * als je er een zette. Dezelfde baan en kleuren als `StofBalk`, maar zonder
 * normstreep: de volle baan ís de norm.
 */
export default function AandeelBalk({
  aandeel,
  doelAandeel = null,
  label,
  hoog = false,
}: {
  /** Deel van de dagnorm (1 = hele dagnorm). */
  aandeel: number;
  doelAandeel?: number | null;
  label: string;
  hoog?: boolean;
}) {
  const pct = (deel: number) => `${Math.max(0, Math.min(100, deel * 100))}%`;

  return (
    <div
      role="img"
      aria-label={label}
      className={`relative rounded-full bg-[var(--vd-track)] ${hoog ? "h-2" : "h-1.5"}`}
    >
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-[var(--vd-sage)] transition-[width] duration-300 motion-reduce:transition-none"
        style={{ width: pct(aandeel), minWidth: aandeel > 0 ? "0.25rem" : undefined }}
      />
      {doelAandeel !== null ? (
        <div
          aria-hidden
          className="absolute -bottom-0.5 -top-0.5 w-0.5 rounded bg-[var(--vd-ink)]"
          style={{ left: pct(doelAandeel) }}
        />
      ) : null}
    </div>
  );
}
