/**
 * De balk van een stof tegen zijn norm: afgeronde baan, de vulling en een
 * streep op de norm. Dezelfde balk als in de hero van Per stof, zodat het
 * Overzicht en het detail één taal spreken. Zonder aandeel (geen norm) toont
 * hij niets: een balk zonder maat zou een oordeel suggereren.
 */
export default function StofBalk({
  aandeel,
  toon,
  label,
}: {
  /** Deel van de norm (1 = norm gehaald), of null als er geen norm of meting is. */
  aandeel: number | null;
  toon: "sage" | "terra" | "neutraal";
  label: string;
}) {
  if (aandeel === null) return null;
  const schaal = Math.max(1.3, aandeel * 1.05);
  const pct = (deel: number) => `${Math.min(100, (deel / schaal) * 100)}%`;
  const kleur = toon === "sage" ? "var(--vd-sage)" : toon === "terra" ? "var(--vd-terra)" : "var(--vd-ink-3)";

  return (
    <div role="img" aria-label={label} className="relative h-2.5 rounded-full bg-[var(--vd-track)]">
      <div
        className="absolute inset-y-0 left-0 rounded-l-full transition-[width] duration-300 motion-reduce:transition-none"
        style={{ width: pct(aandeel), background: kleur }}
      />
      <div className="absolute -bottom-1 -top-1 w-0.5 rounded bg-[var(--vd-ink)]" style={{ left: pct(1) }} />
    </div>
  );
}
