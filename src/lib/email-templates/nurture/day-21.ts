import type { NurtureEmailData, NurtureEmailDispatchContext } from "./types";
import { buildNurtureEmail } from "@/data/nurture-content";
import { resolveNurtureInterventionHighlight } from "@/lib/content/nurture-interventions";
import {
  resolveIntakeRecoveryUrl,
  renderPersonalizedRows,
  wrapNurtureBlock,
} from "./helpers";

export function nurtureDay21Email(
  data: NurtureEmailData,
  ctx: NurtureEmailDispatchContext,
): { subject: string; html: string } {
  const intakeUrl = resolveIntakeRecoveryUrl(ctx);

  const { subject, blocks, supplementTip } = buildNurtureEmail(
    21,
    data.profileLabel,
    data.domainScores,
    data.urgencyLevel ?? "moderate",
  );

  const interventionHighlight = resolveNurtureInterventionHighlight(data);

  const inner = renderPersonalizedRows(
    blocks,
    interventionHighlight ? null : supplementTip,
    intakeUrl,
    data.firstName,
    interventionHighlight,
  );

  const affiliateDisclaimer =
    interventionHighlight?.comparePath != null &&
    interventionHighlight.comparePath.length > 0;

  return { subject, html: wrapNurtureBlock(inner, ctx, affiliateDisclaimer) };
}
