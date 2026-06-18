import Link from "next/link";
import { Leaf } from "@/components/app/icons";
import { REVEAL_COPY } from "@/lib/results-reveal-copy";
import type { RevealLifestyleItem } from "@/lib/reveal-model";

type RevealFirstStepCardProps = {
  item: RevealLifestyleItem;
};

export default function RevealFirstStepCard({ item }: RevealFirstStepCardProps) {
  return (
    <section aria-label="Je eerste stap">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-intake-sage">
        {REVEAL_COPY.firstStepEyebrow}
      </p>
      <Link
        href="/account/login"
        className="block rounded-3xl border p-5 no-underline transition-colors hover:border-intake-sage/55 lg:p-6"
        style={{
          background: "var(--panel, rgba(255,255,255,0.05))",
          borderColor: "rgba(90,143,106,0.32)",
          boxShadow: "0 0 0 1px rgba(90,143,106,0.1)",
        }}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-[9px] border border-intake-sage/30 bg-intake-sage/15 text-intake-sage">
              <Leaf s={17} />
            </span>
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
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-intake-sage">
            Start hier →
          </span>
        </div>
        <h2 className="text-[16px] font-semibold text-intake-ink">{item.win.title}</h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-intake-ink-muted">
          {item.win.detail}
        </p>
        <p className="mt-3 text-[13px] text-intake-sage">{REVEAL_COPY.firstStepCtaHint}</p>
      </Link>
    </section>
  );
}
