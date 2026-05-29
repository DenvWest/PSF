import type { NurtureEmailData, NurtureEmailDispatchContext } from "./types";
import { buildNurtureEmail } from "@/data/nurture-content";
import { resolveNurtureInterventionHighlight } from "@/lib/content/nurture-interventions";
import {
  resolveIntakeRecoveryUrl,
  renderPersonalizedRows,
  wrapNurtureBlock,
} from "./helpers";

export function nurtureDay3Email(
  data: NurtureEmailData,
  ctx: NurtureEmailDispatchContext,
): { subject: string; html: string } {
  const intakeUrl = resolveIntakeRecoveryUrl(ctx);

  const { subject, blocks, supplementTip } = buildNurtureEmail(
    3,
    data.profileLabel,
    data.domainScores,
    data.urgencyLevel ?? "moderate",
  );

  const interventionHighlight = resolveNurtureInterventionHighlight(data);
  const blocksWithTip = interventionHighlight
    ? { ...blocks, tip: interventionHighlight.body }
    : blocks;

  const inner = renderPersonalizedRows(
    blocksWithTip,
    interventionHighlight ? null : supplementTip,
    intakeUrl,
    data.firstName,
    interventionHighlight,
  );

  return { subject, html: wrapNurtureBlock(inner, ctx, false) };
}
