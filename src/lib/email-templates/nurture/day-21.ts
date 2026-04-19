import type { NurtureEmailData, NurtureEmailDispatchContext } from "./types";
import {
  day21SupplementChoice,
  escapeHtml,
  nurtureCtaButton,
  wrapNurtureBlock,
} from "./helpers";
import { absoluteUrl } from "@/lib/public-site-url";

export function nurtureDay21Email(
  data: NurtureEmailData,
  ctx: NurtureEmailDispatchContext,
): { subject: string; html: string } {
  const subject = "Past een supplement bij jouw profiel?";
  const pick = day21SupplementChoice({
    primaryDomain: data.primaryDomain,
    domainScores: data.domainScores,
  });
  const compareUrl = absoluteUrl(pick.comparePath);

  const inner = `
          <tr>
            <td style="padding:8px 28px 16px 28px;">
              <h1 style="margin:0;font-family:'DM Serif Display',Georgia,serif;font-size:22px;line-height:1.25;color:#1a1a1a;font-weight:400;">
                Supplementen inhoudelijk vergelijken
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px 28px;">
              <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;color:#333333;">
                Op basis van je profiel (<strong>${escapeHtml(data.profileLabel)}</strong>) is een logisch volgende stap om <strong>${escapeHtml(pick.name)}</strong> niet als ‘must-have’, maar als <em>thema</em> te bekijken.
              </p>
              <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;color:#333333;">
                ${escapeHtml(pick.reason)}
              </p>
              <p style="margin:0 0 18px 0;font-size:13px;line-height:1.5;color:#555555;">
                Supplementen zijn een aanvulling, geen vervanging van slaap, voeding en beweging.
              </p>
              ${nurtureCtaButton(compareUrl, "Naar de vergelijkingspagina")}
            </td>
          </tr>`;

  return { subject, html: wrapNurtureBlock(inner, ctx.recipientEmail, false) };
}
