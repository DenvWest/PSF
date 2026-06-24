import {
  buildNurtureEmail,
  getWeakestDomain,
  resolveNurtureProfileKey,
  resolveLifestyleTipDomainForDay,
  pickLifestyleTipFromOtherDomain,
  nurtureOutputHasCrossDomainBalance,
} from "@/data/nurture-content";
import { resolveNurtureInterventionHighlight } from "@/lib/content/nurture-interventions";
import {
  hasSupplementComparePath,
  resolveNurtureCta,
  type NurtureSequenceDay,
  type ResolvedNurtureCta,
} from "@/lib/resolve-nurture-cta";
import { buildRecommendationInput } from "@/lib/recommendation-input";
import type { DomainScores } from "@/lib/intake-engine";
import type { NurtureEmailData, NurtureEmailDispatchContext } from "./types";
import type { NurtureInterventionHighlight } from "./helpers";
import {
  resolveIntakeRecoveryUrl,
  renderPersonalizedRows,
  renderProfileAnchorFooter,
  wrapNurtureBlock,
} from "./helpers";

export function renderNurtureDayInner(
  data: NurtureEmailData,
  ctx: NurtureEmailDispatchContext,
): { subject: string; html: string; resolvedCta: ResolvedNurtureCta } {
  const intakeUrl = resolveIntakeRecoveryUrl(ctx);
  const { subject, blocks, supplementTip, interventionHighlight, resolvedCta } =
    prepareNurtureMailContent(data);
  const profileKey = resolveNurtureProfileKey(
    data.profileLabel,
    data.domainScores,
  );

  const inner =
    renderPersonalizedRows(
      blocks,
      supplementTip,
      intakeUrl,
      data.firstName,
      interventionHighlight,
      ctx.nurtureToken,
    ) + renderProfileAnchorFooter(profileKey, intakeUrl);

  const affiliateDisclaimer = inner.includes("/beste/");

  return {
    subject,
    html: wrapNurtureBlock(inner, ctx, affiliateDisclaimer),
    resolvedCta,
  };
}

function toSequenceDay(day: number): NurtureSequenceDay {
  if (day === 0 || day === 3 || day === 7 || day === 14 || day === 21 || day === 30) {
    return day;
  }
  return 30;
}

export function prepareNurtureMailContent(data: NurtureEmailData): {
  subject: string;
  blocks: ReturnType<typeof buildNurtureEmail>["blocks"];
  supplementTip: ReturnType<typeof buildNurtureEmail>["supplementTip"];
  interventionHighlight: NurtureInterventionHighlight | null;
  resolvedCta: ResolvedNurtureCta;
} {
  const profileKey = resolveNurtureProfileKey(
    data.profileLabel,
    data.domainScores,
  );
  const weakestDomain = getWeakestDomain(data.domainScores);
  const sequenceDay = toSequenceDay(data.sequenceDay);

  const recommendationInput = data.answers
    ? buildRecommendationInput({
        scores: data.domainScores as unknown as DomainScores,
        answers: data.answers,
      })
    : null;

  const interventionHighlight = resolveNurtureInterventionHighlight(data);
  const highlightHasCompare =
    typeof interventionHighlight?.comparePath === "string" &&
    interventionHighlight.comparePath.trim().length > 0;
  const hasComparePath =
    highlightHasCompare ||
    hasSupplementComparePath(profileKey, recommendationInput);

  const planGate =
    data.planGate ??
    (data.visibleTiers
      ? {
          visibleTiers: data.visibleTiers,
          completedPlanPhases: data.completedPlanPhases ?? 0,
          organizationId: "",
        }
      : null);

  const resolvedCta = resolveNurtureCta(
    profileKey,
    sequenceDay,
    planGate,
    hasComparePath,
    weakestDomain,
    recommendationInput,
  );

  const built = buildNurtureEmail(
    data.sequenceDay,
    data.profileLabel,
    data.domainScores,
    data.urgencyLevel ?? "moderate",
    { planGate, resolvedCta, profileKey, input: recommendationInput },
  );

  let blocksWithTip = interventionHighlight
    ? { ...built.blocks, tip: interventionHighlight.body }
    : built.blocks;

  // SELECTIE: engine-ranked preference + gated comparison path; tier-gate in resolveNurtureCta.
  const supplementTip = interventionHighlight ? null : built.supplementTip;
  const urgencyLevel = data.urgencyLevel ?? "moderate";

  if (
    supplementTip &&
    (data.sequenceDay === 14 || data.sequenceDay === 21) &&
    !interventionHighlight
  ) {
    const supplementDomain = getWeakestDomain(data.domainScores);
    const tipMeta = resolveLifestyleTipDomainForDay(
      data.domainScores,
      data.sequenceDay,
      urgencyLevel,
    );
    const tipDomain = tipMeta?.domain ?? supplementDomain;
    if (!nurtureOutputHasCrossDomainBalance(tipDomain, supplementDomain)) {
      blocksWithTip = {
        ...blocksWithTip,
        tip: pickLifestyleTipFromOtherDomain(
          data.domainScores,
          supplementDomain,
          urgencyLevel,
        ),
      };
    }
  }

  return {
    subject: built.subject,
    blocks: blocksWithTip,
    supplementTip,
    interventionHighlight,
    resolvedCta,
  };
}

export { resolveNurtureProfileKey };
