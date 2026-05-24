type PreviewRow = {
  label: string;
  status: string;
  tone: "sage" | "neutral" | "terra";
};

const PREVIEW_ROWS: PreviewRow[] = [
  { label: "Slaap", status: "Aandacht", tone: "terra" },
  { label: "Stress", status: "Voldoende", tone: "neutral" },
  { label: "Voeding", status: "Sterk", tone: "sage" },
  { label: "Beweging", status: "Voldoende", tone: "neutral" },
];

const TONE_CLASS: Record<PreviewRow["tone"], string> = {
  sage: "border-intake-sage/40 bg-intake-sage/15 text-intake-sage",
  neutral: "border-intake-card-border bg-intake-bg text-intake-ink-muted",
  terra: "border-intake-terra/40 bg-intake-terra/15 text-intake-terra",
};

export default function IntakeResultPreviewCard() {
  return (
    <article
      className="w-full rounded-2xl border border-intake-card-border bg-intake-bg-elevated px-5 py-5 text-left"
      aria-label="Voorbeeld van je leefstijl-overzicht"
    >
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-intake-ink-subtle">
        Zo ziet jouw overzicht eruit
      </p>
      <ul className="space-y-2.5">
        {PREVIEW_ROWS.map((row) => (
          <li
            key={row.label}
            className="flex items-center justify-between gap-3 rounded-xl border border-intake-divider bg-intake-bg/60 px-3.5 py-2.5"
          >
            <span className="text-sm font-medium text-intake-ink">{row.label}</span>
            <span
              className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${TONE_CLASS[row.tone]}`}
            >
              {row.status}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs leading-relaxed text-intake-ink-subtle">
        Illustratie — op basis van jouw antwoorden, zonder totaalscore of
        diagnose.
      </p>
    </article>
  );
}
