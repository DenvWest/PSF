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
} from "@/lib/resolve-nurture-cta";
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
): { subject: string; html: string } {
  const intakeUrl = resolveIntakeRecoveryUrl(ctx);
  const { subject, blocks, supplementTip, interventionHighlight } =
    prepareNurtureMailContent(data);
  const profileKey = resolveNurtureProfileKey(
    data.profileLabel,
    data.domainScores,
  );

  const affiliateDisclaimer =
    blocks.cta.url.startsWith("/beste/") ||
    (interventionHighlight?.comparePath != null &&
      interventionHighlight.comparePath.length > 0);

  const inner =
    renderPersonalizedRows(
      blocks,
      supplementTip,
      intakeUrl,
      data.firstName,
      interventionHighlight,
    ) + renderProfileAnchorFooter(profileKey, intakeUrl);

  return {
    subject,
    html: wrapNurtureBlock(inner, ctx, affiliateDisclaimer),
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
} {
  const profileKey = resolveNurtureProfileKey(
    data.profileLabel,
    data.domainScores,
  );
  const weakestDomain = getWeakestDomain(data.domainScores);
  const sequenceDay = toSequenceDay(data.sequenceDay);

  const interventionHighlight = resolveNurtureInterventionHighlight(data);
  const highlightHasCompare =
    typeof interventionHighlight?.comparePath === "string" &&
    interventionHighlight.comparePath.trim().length > 0;
  const hasComparePath =
    highlightHasCompare || hasSupplementComparePath(profileKey);

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
  );

  const built = buildNurtureEmail(
    data.sequenceDay,
    data.profileLabel,
    data.domainScores,
    data.urgencyLevel ?? "moderate",
    { planGate, resolvedCta, profileKey },
  );

  let blocksWithTip = interventionHighlight
    ? { ...built.blocks, tip: interventionHighlight.body }
    : built.blocks;

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
  };
}

export { resolveNurtureProfileKey };
