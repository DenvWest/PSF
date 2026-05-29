import Link from "next/link";
import type { PlanAction } from "@/lib/content/plan-content";
import type { InterventionKind } from "@/lib/content/match-interventions";

const KIND_LABELS: Record<InterventionKind, string> = {
  free_action: "Gratis",
  measurement: "Meten",
  supplement: "Supplement",
};

type IntakeActionProps = {
  action: PlanAction;
  step: number;
};

export default function IntakeAction({ action, step }: IntakeActionProps) {
  const href = action.affiliateUrl ?? action.comparisonPath;
  const isExternalAffiliate =
    typeof href === "string" &&
    href.startsWith("http") &&
    action.kind === "supplement";

  return (
    <article className="rounded-2xl border border-intake-card-border bg-intake-bg px-5 py-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-intake-sage text-xs font-bold text-white">
          {step}
        </span>
        <span className="rounded-full border border-intake-sage/35 bg-intake-sage/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-intake-sage">
          {KIND_LABELS[action.kind]}
        </span>
      </div>

      <h3 className="mb-1 text-[15px] font-semibold text-intake-ink">{action.name}</h3>
      <p className="mb-3 text-sm leading-relaxed text-intake-ink-muted">
        {action.description}
      </p>

      <p className="mb-2 text-sm leading-relaxed text-intake-ink">{action.claimText}</p>

      {action.sourceUrl ? (
        <p className="m-0 text-xs text-intake-ink-subtle">
          <a
            href={action.sourceUrl}
            target="_blank"
            rel="nofollow sponsored"
            className="font-medium text-intake-sage underline underline-offset-2"
          >
            {action.sourceLabel}
          </a>
        </p>
      ) : (
        <p className="m-0 text-xs text-intake-ink-subtle">{action.sourceLabel}</p>
      )}

      {href && action.kind === "supplement" ? (
        <p className="mt-3 text-sm">
          {isExternalAffiliate ? (
            <a
              href={href}
              target="_blank"
              rel="nofollow sponsored"
              className="font-medium text-intake-sage underline underline-offset-2"
            >
              Vergelijk {action.name} →
            </a>
          ) : (
            <Link
              href={href}
              className="font-medium text-intake-sage underline underline-offset-2"
            >
              Vergelijk {action.name} →
            </Link>
          )}
        </p>
      ) : null}
    </article>
  );
}
