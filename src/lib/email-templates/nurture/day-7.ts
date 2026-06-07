import type { NurtureEmailData, NurtureEmailDispatchContext } from "./types";
import { renderNurtureDayInner } from "./prepare-nurture-mail";

export function nurtureDay7Email(
  data: NurtureEmailData,
  ctx: NurtureEmailDispatchContext,
): { subject: string; html: string } {
  return renderNurtureDayInner(data, ctx);
}
