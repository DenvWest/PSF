import { nurtureCtaButton, nurtureEmailWrap } from "@/lib/emails/shared";

export const day30EmailSubject = "Tijd voor je voortgangscheck";

export function day30EmailHtml(params: {
  unsubscribeUrl: string;
  intakeUrl: string;
}): string {
  const inner = `
          <tr>
            <td style="padding:8px 28px 16px 28px;">
              <h1 style="margin:0;font-family:'DM Serif Display',Georgia,serif;font-size:24px;line-height:1.25;color:#1a1a1a;font-weight:400;">
                Tijd voor je voortgangscheck
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px 28px;">
              <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#333333;">
                30 dagen geleden heb je je eerste meting gedaan.
                Ben je benieuwd wat er veranderd is? Doe de intake opnieuw en vergelijk je scores.
              </p>
              ${nurtureCtaButton(params.intakeUrl, "Naar de intake")}
            </td>
          </tr>`;

  return nurtureEmailWrap(inner, params.unsubscribeUrl, false);
}
