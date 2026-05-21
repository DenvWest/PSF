import type { NurtureEmailData, NurtureEmailDispatchContext } from "./types";
import { buildNurtureEmail } from "@/data/nurture-content";
import {
  resolveIntakeRecoveryUrl,
  renderPersonalizedRows,
  wrapNurtureBlock,
} from "./helpers";

export function nurtureDay7Email(
  data: NurtureEmailData,
  ctx: NurtureEmailDispatchContext,
): { subject: string; html: string } {
  const intakeUrl = resolveIntakeRecoveryUrl(ctx);

  const { subject, blocks, supplementTip } = buildNurtureEmail(
    7,
    data.profileLabel,
    data.domainScores,
    data.urgencyLevel ?? "moderate",
  );

  const inner = renderPersonalizedRows(blocks, supplementTip, intakeUrl, data.firstName);

  return { subject, html: wrapNurtureBlock(inner, ctx, false) };
}
