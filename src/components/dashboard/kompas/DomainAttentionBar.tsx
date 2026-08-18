import type { LifestyleLayerState } from "@/components/dashboard/domain/DomainLifestyleLadder";

export type AttentionBarLayer = { id: number; name: string };

type DomainAttentionBarProps = {
  layers: readonly AttentionBarLayer[];
  states: Record<number, LifestyleLayerState>;
  stateLabels: Record<LifestyleLayerState, string>;
  /** Standaard 3 — v3.6 renderAttnbar toont er nooit meer. */
  max?: number;
};

/** Winst eerst, dan houd-in-de-gaten, dan op orde, dan wacht. Bij gelijke
 * staat wint de laagste id — zonder tiebreaker hangt de volgorde af van
 * objectvolgorde in plaats van betekenis. Zelfde ATTN_RANK als
 * beweging-keuze-consumentenbond-prebuild-v3.6 `attentionOrder()`. */
const ATTN_RANK: Record<LifestyleLayerState, number> = {
  winst: 0,
  watch: 1,
  ok: 2,
  wacht: 3,
};

const DOT_COLOR: Record<LifestyleLayerState, string> = {
  winst: "#C8956C",
  ok: "#5A8F6A",
  watch: "#C99A3C",
  wacht: "rgba(255,255,255,0.16)",
};

const WORD_COLOR: Record<LifestyleLayerState, string> = {
  winst: "#C8956C",
  ok: "#9CC5A9",
  watch: "#C99A3C",
  wacht: "#7E8C82",
};

/**
 * De aandachtsbalk uit slaap-piramide-v2-prebuild `renderAttnbar()` r.1433,
 * generiek gemaakt: top-3 prioriteiten met kleur ÉN statuswoord in tekst. De
 * stip is nooit het enige signaal — op 7px zijn terra en amber niet
 * betrouwbaar te onderscheiden, en kleurenblindheid maakt dat erger.
 */
export default function DomainAttentionBar({
  layers,
  states,
  stateLabels,
  max = 3,
}: DomainAttentionBarProps) {
  const ordered = [...layers]
    .sort((a, b) => {
      const rankA = ATTN_RANK[states[a.id] ?? "wacht"];
      const rankB = ATTN_RANK[states[b.id] ?? "wacht"];
      return rankA !== rankB ? rankA - rankB : a.id - b.id;
    })
    .slice(0, max);

  return (
    <div className="mt-4 flex gap-0 border-t border-white/[0.06] pt-3">
      {ordered.map((layer) => {
        const state = states[layer.id] ?? "wacht";
        return (
          <div key={layer.id} className="flex min-w-0 flex-1 flex-col gap-1.5 pr-2.5">
            <span
              aria-hidden="true"
              className="h-[7px] w-[7px] rounded-full"
              style={{ background: DOT_COLOR[state] }}
            />
            <span
              className="font-mono text-[9.5px] uppercase tracking-[0.06em] text-[#7E8C82]"
              style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
            >
              P{layer.id}
            </span>
            <span className="text-[11px] leading-snug text-[#9FB0A6]">{layer.name}</span>
            <span
              className="text-[9px] font-bold uppercase tracking-[0.1em]"
              style={{ color: WORD_COLOR[state] }}
            >
              {stateLabels[state]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
