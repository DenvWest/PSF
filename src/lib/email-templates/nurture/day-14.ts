import type { NurtureEmailData, NurtureEmailDispatchContext } from "./types";
import {
  domainLabelNl,
  escapeHtml,
  quickWinsForDomain,
  wrapNurtureBlock,
} from "./helpers";

export function nurtureDay14Email(
  data: NurtureEmailData,
  ctx: NurtureEmailDispatchContext,
): { subject: string; html: string } {
  const subject = "Halverwege — hoe gaat het?";
  const wins = quickWinsForDomain(data.primaryDomain);
  const second = wins[1] ?? wins[0] ?? "";
  const domein = domainLabelNl(data.primaryDomain);

  const inner = `
          <tr>
            <td style="padding:8px 28px 16px 28px;">
              <h1 style="margin:0;font-family:'DM Serif Display',Georgia,serif;font-size:22px;line-height:1.25;color:#1a1a1a;font-weight:400;">
                Halverwege
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px 28px;">
              <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;color:#333333;">
                Het kost meestal 2–4 weken om een nieuwe gewoonte echt te laten landen. Je bent nu ongeveer halverwege — dat is precies het moment waarop veel mensen neigingen om ‘even te sussen’ krijgen. Blijf bij kleine, herhaalbare stappen rond <strong>${escapeHtml(domein)}</strong>.
              </p>
              <p style="margin:0;font-size:16px;line-height:1.6;color:#333333;">
                <strong>Extra focus deze week:</strong> ${escapeHtml(second)}
              </p>
            </td>
          </tr>`;

  return { subject, html: wrapNurtureBlock(inner, ctx, false) };
}
