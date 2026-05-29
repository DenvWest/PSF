import {
  STATUS_TONE_CLASS,
  type DisplayStatus,
  type DisplayStatusTone,
} from "@/lib/score-display";

export type SummaryRow = {
  label: string;
  status: string;
  tone: DisplayStatusTone;
};

const PREVIEW_ROWS: SummaryRow[] = [
  { label: "Slaap", status: "Aandacht", tone: "terra" },
  { label: "Stress", status: "Voldoende", tone: "neutral" },
  { label: "Voeding", status: "Sterk", tone: "sage" },
  { label: "Beweging", status: "Voldoende", tone: "neutral" },
];

const ROW_TONE_CLASS: Record<DisplayStatusTone, string> = {
  sage: STATUS_TONE_CLASS.sage,
  neutral: "border-intake-card-border bg-white/5 text-intake-ink-muted",
  terra: STATUS_TONE_CLASS.terra,
  "terra-deep": STATUS_TONE_CLASS["terra-deep"],
};

type IntakeResultPreviewCardProps = {
  rows?: SummaryRow[];
  variant?: "preview" | "live";
  primaryLabel?: string;
  hideContextFooter?: boolean;
};

export function summaryToneFromStatus(
  status: DisplayStatus | "Niet gemeten",
): DisplayStatusTone {
  if (status === "Niet gemeten") {
    return "neutral";
  }
  if (status === "Sterk") {
    return "sage";
  }
  if (status === "Voldoende") {
    return "neutral";
  }
  if (status === "Aandacht") {
    return "terra";
  }
  return "terra-deep";
}

export default function IntakeResultPreviewCard({
  rows,
  variant = "preview",
  primaryLabel,
  hideContextFooter = false,
}: IntakeResultPreviewCardProps) {
  const isLive = variant === "live";
  const displayRows = rows ?? PREVIEW_ROWS;

  return (
    <article
      className="w-full rounded-2xl border border-intake-card-border bg-intake-bg-elevated px-5 py-5 text-left"
      aria-label={
        isLive ? "Jouw leefstijlgebieden" : "Voorbeeld van je leefstijl-overzicht"
      }
    >
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-intake-ink-subtle">
        {isLive ? "Jouw leefstijlgebieden" : "Zo ziet jouw overzicht eruit"}
      </p>
      <ul className="space-y-2.5">
        {displayRows.map((row) => (
          <li
            key={row.label}
            className="flex items-center justify-between gap-3 rounded-xl border border-intake-divider bg-white/[0.03] px-3.5 py-2.5"
          >
            <span className="text-sm font-medium text-intake-ink">{row.label}</span>
            <span className="flex shrink-0 items-center gap-1.5">
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${ROW_TONE_CLASS[row.tone]}`}
              >
                {row.status}
              </span>
              {primaryLabel && row.label === primaryLabel ? (
                <span className="text-intake-ink-subtle" aria-hidden>
                  →
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
      {!hideContextFooter ? (
        !isLive ? (
          <p className="mt-4 text-xs leading-relaxed text-intake-ink-subtle">
            Illustratie — op basis van jouw antwoorden, zonder totaalscore of
            diagnose.
          </p>
        ) : (
          <p className="mt-4 text-xs leading-relaxed text-intake-ink-subtle">
            Op basis van je antwoorden — geen medische diagnose.
          </p>
        )
      ) : null}
    </article>
  );
}
