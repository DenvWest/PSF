import type { RevealLifestyleItem } from "@/lib/reveal-model";
import { REVEAL_COPY } from "@/lib/results-reveal-copy";

type RevealLifestyleSecondaryProps = {
  item: RevealLifestyleItem;
};

export default function RevealLifestyleSecondary({ item }: RevealLifestyleSecondaryProps) {
  return (
    <article className="rounded-2xl border border-intake-card-border bg-intake-bg-elevated p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-[15px] font-semibold text-intake-ink">{item.win.title}</h3>
        <span
          className="rounded-full border px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.06em]"
          style={{
            color: item.pillar.color,
            background: `${item.pillar.color}1f`,
            borderColor: `${item.pillar.color}33`,
          }}
        >
          {item.pillar.label}
        </span>
        <span className="text-[11px] text-intake-ink-subtle">
          {REVEAL_COPY.lifestyleRoleKracht}
        </span>
      </div>
      <p className="mt-2 text-[13.5px] leading-relaxed text-intake-ink-muted">{item.win.detail}</p>
    </article>
  );
}
