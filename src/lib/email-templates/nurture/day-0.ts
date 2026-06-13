import type { NurtureEmailData, NurtureEmailDispatchContext } from "./types";
import type { ResolvedNurtureCta } from "@/lib/resolve-nurture-cta";
import { lifestyleCtaForProfile } from "@/lib/resolve-nurture-cta";
import { resolveNurtureProfileKey } from "@/data/nurture-content";
import {
  resolveIntakeRecoveryUrl,
  renderDay0MainRows,
  wrapNurtureBlock,
} from "./helpers";

export function nurtureDay0Email(
  data: NurtureEmailData,
  ctx: NurtureEmailDispatchContext,
): { subject: string; html: string; resolvedCta: ResolvedNurtureCta } {
  const intakeUrl = resolveIntakeRecoveryUrl(ctx);

  const mainRows = renderDay0MainRows({
    primaryDomain: data.primaryDomain,
    intakeUrl,
    firstName: data.firstName,
    domainScores: data.domainScores,
  });

  const profileKey = resolveNurtureProfileKey(data.profileLabel, data.domainScores);
  return {
    subject: "Dit valt op in jouw resultaten",
    html: wrapNurtureBlock(mainRows, ctx, false),
    resolvedCta: lifestyleCtaForProfile(profileKey),
  };
}
