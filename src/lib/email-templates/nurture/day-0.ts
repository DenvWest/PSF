import type { NurtureEmailData, NurtureEmailDispatchContext } from "./types";
import {
  buildIntakeHerstelplanUrl,
  domainLabelNl,
  escapeHtml,
  nurtureCtaButton,
  quickWinsForDomain,
  wrapNurtureBlock,
} from "./helpers";

export function nurtureDay0Email(
  data: NurtureEmailData,
  ctx: NurtureEmailDispatchContext,
): { subject: string; html: string } {
  const subject = "Je persoonlijke Herstelplan staat klaar";
  const wins = quickWinsForDomain(data.primaryDomain);
  const w1 = wins[0] ?? "";
  const w2 = wins[1] ?? "";
  const domein = domainLabelNl(data.primaryDomain);
  const intakeUrl = buildIntakeHerstelplanUrl(ctx.sessionId ?? null);

  const inner = `
          <tr>
            <td style="padding:8px 28px 16px 28px;">
              <h1 style="margin:0;font-family:'DM Serif Display',Georgia,serif;font-size:22px;line-height:1.25;color:#1a1a1a;font-weight:400;">
                Welkom
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px 28px;">
              <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;color:#333333;">
                Hoi, je hebt de leefstijlcheck gedaan. Je profiel: <strong>${escapeHtml(data.profileLabel)}</strong>.
                Je belangrijkste aandachtspunt is <strong>${escapeHtml(domein)}</strong>.
              </p>
              <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;color:#333333;">
                <strong>Je eerste stappen:</strong><br />
                1) ${escapeHtml(w1)}<br />
                2) ${escapeHtml(w2)}
              </p>
              <p style="margin:0 0 18px 0;font-size:16px;line-height:1.6;color:#333333;">
                Bekijk je volledige Herstelplan via onderstaande knop.
              </p>
              ${nurtureCtaButton(intakeUrl, "Naar mijn Herstelplan")}
            </td>
          </tr>`;

  return { subject, html: wrapNurtureBlock(inner, ctx.recipientEmail, false) };
}
