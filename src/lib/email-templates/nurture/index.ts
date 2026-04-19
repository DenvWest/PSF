import type { NurtureEmailData, NurtureEmailDispatchContext } from "./types";
import { nurtureDay0Email } from "./day-0";
import { nurtureDay3Email } from "./day-3";
import { nurtureDay7Email } from "./day-7";
import { nurtureDay14Email } from "./day-14";
import { nurtureDay21Email } from "./day-21";
import { nurtureDay30Email } from "./day-30";

export type { NurtureEmailData, NurtureEmailDispatchContext } from "./types";

/**
 * Rendert onderwerp + HTML voor een nurture-stap op basis van `sequenceDay` (0, 3, 7, 14, 21, 30).
 */
export function getNurtureEmailContent(
  data: NurtureEmailData,
  ctx: NurtureEmailDispatchContext,
): { subject: string; html: string } {
  const day = data.sequenceDay;
  switch (day) {
    case 0:
      return nurtureDay0Email(data, ctx);
    case 3:
      return nurtureDay3Email(data, ctx);
    case 7:
      return nurtureDay7Email(data, ctx);
    case 14:
      return nurtureDay14Email(data, ctx);
    case 21:
      return nurtureDay21Email(data, ctx);
    case 30:
      return nurtureDay30Email(data, ctx);
    default:
      return nurtureDay30Email(data, ctx);
  }
}
