import type { NurtureEmailData, NurtureEmailDispatchContext } from "./types";
import { buildNurtureEmail } from "@/data/nurture-content";
import {
  buildIntakeHerstelplanUrl,
  renderPersonalizedRows,
  wrapNurtureBlock,
} from "./helpers";

export function nurtureDay21Email(
  data: NurtureEmailData,
  ctx: NurtureEmailDispatchContext,
): { subject: string; html: string } {
  const intakeUrl = buildIntakeHerstelplanUrl(ctx.sessionId ?? null);

  const { subject, blocks, supplementTip } = buildNurtureEmail(
    21,
    data.profileLabel,
    data.domainScores,
    data.urgencyLevel ?? "moderate",
  );

  const inner = renderPersonalizedRows(blocks, supplementTip, intakeUrl);

  return { subject, html: wrapNurtureBlock(inner, ctx, false) };
}
