import { escapeHtml, nurtureCtaButton, nurtureEmailWrap } from "@/lib/emails/shared";

export const day7EmailSubject = "Week 1 voorbij — dit is normaal";

export function day7EmailHtml(params: {
  unsubscribeUrl: string;
  profileLabel: string;
  articleUrl: string;
  articleTitle: string;
}): string {
  const inner = `
          <tr>
            <td style="padding:8px 28px 16px 28px;">
              <h1 style="margin:0;font-family:'DM Serif Display',Georgia,serif;font-size:24px;line-height:1.25;color:#1a1a1a;font-weight:400;">
                Week 1 voorbij — dit is normaal
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px 28px;">
              <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#333333;">
                Verandering kost tijd. Een week is genoeg om te merken dat je iets probeert — zelden om alles om te gooien.
                Profiel uit je intake: <strong>${escapeHtml(params.profileLabel)}</strong>.
              </p>
              <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#333333;">
                Lees verder (informatief): <strong>${escapeHtml(params.articleTitle)}</strong>.
              </p>
              ${nurtureCtaButton(params.articleUrl, "Naar het artikel")}
            </td>
          </tr>`;

  return nurtureEmailWrap(inner, params.unsubscribeUrl, false);
}
