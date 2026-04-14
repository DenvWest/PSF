import { escapeHtml, nurtureCtaButton, nurtureEmailWrap } from "@/lib/emails/shared";

export const welcomeEmailSubject = "Je Herstelplan staat klaar";

export function welcomeEmailHtml(params: {
  unsubscribeUrl: string;
  intakeUrl: string;
  profileLabel: string;
  urgencyLabel: string;
  primaryDomainLabel: string;
  quickWin: string;
}): string {
  const inner = `
          <tr>
            <td style="padding:8px 28px 16px 28px;">
              <h1 style="margin:0;font-family:'DM Serif Display',Georgia,serif;font-size:24px;line-height:1.25;color:#1a1a1a;font-weight:400;">
                Je Herstelplan staat klaar
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px 28px;">
              <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#333333;">
                Je profiel: <strong>${escapeHtml(params.profileLabel)}</strong>. Urgentieniveau in de intake: <strong>${escapeHtml(params.urgencyLabel)}</strong>.
                Hoofdthema uit je scores: <strong>${escapeHtml(params.primaryDomainLabel)}</strong>.
                Dit is een korte samenvatting op basis van je antwoorden — geen diagnose.
              </p>
              <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#333333;">
                <strong>Je eerste Quick Win:</strong> ${escapeHtml(params.quickWin)}
              </p>
              <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#333333;">
                Open je resultaten opnieuw (zelfde apparaat/browser helpt) of vul de intake opnieuw in als je verder bent.
              </p>
              ${nurtureCtaButton(params.intakeUrl, "Naar mijn resultaten")}
            </td>
          </tr>`;

  return nurtureEmailWrap(inner, params.unsubscribeUrl, false);
}
