import type { NurtureEmailData, NurtureEmailDispatchContext } from "./types";
import type { ResolvedNurtureCta } from "@/lib/resolve-nurture-cta";
import { renderNurtureDayInner } from "./prepare-nurture-mail";

export function nurtureDay14Email(
  data: NurtureEmailData,
  ctx: NurtureEmailDispatchContext,
): { subject: string; html: string; resolvedCta: ResolvedNurtureCta } {
  return renderNurtureDayInner(data, ctx);
}
