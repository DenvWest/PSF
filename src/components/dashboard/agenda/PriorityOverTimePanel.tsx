"use client";

import { KompasLooseCard } from "@/components/dashboard/agenda/KompasLooseCard";
import {
  buildPriorityTimeline,
  buildUserPinMarker,
  countEnginePriorityChanges,
  formatPriorityShiftSummary,
  shouldShowEngineShiftNudge,
} from "@/lib/priority-over-time";
import type { DashboardModel } from "@/types/dashboard";

type PriorityOverTimePanelProps = {
  model: DashboardModel;
  prefUpdatedAt: string | null;
  onAcceptEngine?: () => void;
  busy?: boolean;
};

export default function PriorityOverTimePanel({
  model,
  prefUpdatedAt,
  onAcceptEngine,
  busy = false,
}: PriorityOverTimePanelProps) {
  const timeline = buildPriorityTimeline(model);
  const shiftSummary = formatPriorityShiftSummary(model);
  const userPin = buildUserPinMarker(model, prefUpdatedAt);
  const changeCount = countEnginePriorityChanges(model.history);
  const showNudge = shouldShowEngineShiftNudge(model);

  return (
    <KompasLooseCard>
      <h2
        className="m-0 text-[18px] leading-tight text-[#1c1917]"
        style={{ fontFamily: "var(--f-serif)" }}
      >
        Prioriteit over tijd
      </h2>
      <p className="mt-1 text-[13px] leading-normal text-[#78716c] text-pretty">
        Hoe je vertrekpunt verschuift over checks — analyse blijft leidend.
      </p>

      {shiftSummary ? (
        <p className="mt-3 text-[14px] font-medium text-[#1c1917]">{shiftSummary}</p>
      ) : null}

      <ol className="mt-4 flex flex-col gap-0 p-0">
        {timeline.map((point, index) => (
          <li key={`${point.seq}-${point.date}`} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className="mt-1 h-3 w-3 shrink-0 rounded-full"
                style={{
                  background: point.color,
                  boxShadow: point.isLatest ? `0 0 0 3px ${point.color}33` : undefined,
                }}
                aria-hidden
              />
              {index < timeline.length - 1 ? (
                <span className="my-1 w-px flex-1 bg-[#e4e0da]" aria-hidden />
              ) : null}
            </div>
            <div className="min-w-0 flex-1 pb-4">
              <div className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#78716c]">
                Check {point.seq}
              </div>
              <div className="text-[15px] font-medium text-[#1c1917]">{point.label}</div>
              <div className="text-[12.5px] text-[#78716c]">{point.date}</div>
            </div>
          </li>
        ))}
      </ol>

      {userPin ? (
        <div className="rounded-2xl border border-[#e4e0da] bg-[#faf9f7] px-3.5 py-3">
          <p className="text-[13px] leading-normal text-[#78716c] text-pretty">
            Jij koos zelf{" "}
            <span className="font-medium text-[#1c1917]">{userPin.label.toLowerCase()}</span> als
            focus — analyse blijft {model.enginePriority.label.toLowerCase()}.
          </p>
        </div>
      ) : null}

      {changeCount > 0 ? (
        <p className="mt-3 text-[12.5px] text-[#78716c]">
          {changeCount} verschuiving{changeCount === 1 ? "" : "en"} in je analyse sinds je start.
        </p>
      ) : null}

      {showNudge && onAcceptEngine ? (
        <div className="mt-4 rounded-2xl border border-[var(--sage)] bg-[rgba(90,143,106,0.08)] px-3.5 py-3">
          <p className="text-[13px] leading-normal text-[#1c1917] text-pretty">
            Je vertrekpunt is verschoven naar{" "}
            {model.enginePriority.label.toLowerCase()} — meebewegen?
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={onAcceptEngine}
            className="mt-2 inline-flex min-h-11 cursor-pointer items-center rounded-[10px] border-none bg-[var(--sage)] px-4 text-[13px] font-semibold text-[#0f1c10] disabled:opacity-60"
            style={{ fontFamily: "var(--f-sans)" }}
          >
            Volg het nieuwe advies
          </button>
        </div>
      ) : null}
    </KompasLooseCard>
  );
}
