import type { NurtureEmailData, NurtureEmailDispatchContext } from "./types";
import {
  buildIntakeHerstelplanUrl,
  nurtureCtaButton,
  wrapNurtureBlock,
} from "./helpers";

export function nurtureDay30Email(
  _data: NurtureEmailData,
  ctx: NurtureEmailDispatchContext,
): { subject: string; html: string } {
  const subject = "Tijd om je voortgang te meten";
  const intakeUrl = buildIntakeHerstelplanUrl(ctx.sessionId ?? null);

  const inner = `
          <tr>
            <td style="padding:8px 28px 16px 28px;">
              <h1 style="margin:0;font-family:'DM Serif Display',Georgia,serif;font-size:22px;line-height:1.25;color:#1a1a1a;font-weight:400;">
                Herhaalmeting
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px 28px;">
              <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;color:#333333;">
                30 dagen geleden heb je je eerste meting gedaan. Ben je benieuwd wat er veranderd is?
                Doe de intake opnieuw — dan kun je je scores vergelijken en je volgende stap kiezen.
              </p>
              <p style="margin:0 0 18px 0;font-size:16px;line-height:1.6;color:#333333;">
                Geen diagnose; wel een duidelijk beeld van je eigen trend.
              </p>
              ${nurtureCtaButton(intakeUrl, "Opnieuw meten via de intake")}
            </td>
          </tr>`;

  return { subject, html: wrapNurtureBlock(inner, ctx, false) };
}
