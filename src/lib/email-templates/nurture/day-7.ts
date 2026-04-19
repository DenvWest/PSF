import type { NurtureEmailData, NurtureEmailDispatchContext } from "./types";
import {
  day7BodyCopy,
  domainLabelNl,
  escapeHtml,
  wrapNurtureBlock,
} from "./helpers";

export function nurtureDay7Email(
  data: NurtureEmailData,
  ctx: NurtureEmailDispatchContext,
): { subject: string; html: string } {
  const domeinNaam = domainLabelNl(data.primaryDomain);
  const subject = `Wat ${domeinNaam} betekent voor mannen 40+`;
  const { htmlBlock } = day7BodyCopy(data.primaryDomain);

  const inner = `
          <tr>
            <td style="padding:8px 28px 16px 28px;">
              <h1 style="margin:0;font-family:'DM Serif Display',Georgia,serif;font-size:22px;line-height:1.25;color:#1a1a1a;font-weight:400;">
                ${escapeHtml(subject)}
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px 28px;">
              ${htmlBlock}
            </td>
          </tr>`;

  return { subject, html: wrapNurtureBlock(inner, ctx.recipientEmail, false) };
}
