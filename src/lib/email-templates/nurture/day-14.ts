import type { NurtureEmailData, NurtureEmailDispatchContext } from "./types";
import { buildNurtureEmail } from "@/data/nurture-content";
import { resolveNurtureInterventionHighlight } from "@/lib/content/nurture-interventions";
import {
  resolveIntakeRecoveryUrl,
  renderPersonalizedRows,
  wrapNurtureBlock,
} from "./helpers";

export function nurtureDay14Email(
  data: NurtureEmailData,
  ctx: NurtureEmailDispatchContext,
): { subject: string; html: string } {
  const intakeUrl = resolveIntakeRecoveryUrl(ctx);

  const { subject, blocks, supplementTip } = buildNurtureEmail(
    14,
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

  return { subject, html: wrapNurtureBlock(inner, ctx, false) };
}
