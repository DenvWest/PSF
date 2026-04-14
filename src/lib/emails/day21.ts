import { escapeHtml, nurtureEmailWrap } from "@/lib/emails/shared";

export const day21EmailSubject = "Nog 9 dagen tot je voortgangscheck";

export function day21EmailHtml(params: {
  unsubscribeUrl: string;
  quickWin: string;
}): string {
  const inner = `
          <tr>
            <td style="padding:8px 28px 16px 28px;">
              <h1 style="margin:0;font-family:'DM Serif Display',Georgia,serif;font-size:24px;line-height:1.25;color:#1a1a1a;font-weight:400;">
                Bijna zover: je voortgangscheck
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px 28px;">
              <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#333333;">
                Over ongeveer een week plannen we (als je wilt) je herhaalmeting: dezelfde intake, zodat je zelf het verschil in scores kunt zien.
              </p>
              <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#333333;">
                Ter herinnering aan je eerste focus: <strong>${escapeHtml(params.quickWin)}</strong>.
                Consistentie wint van perfectie — ook als het even tegenzit.
              </p>
              <p style="margin:0;font-size:15px;line-height:1.6;color:#555555;">
                Geen beloftes over uitkomsten; het gaat om jouw eigen trend over tijd.
              </p>
            </td>
          </tr>`;

  return nurtureEmailWrap(inner, params.unsubscribeUrl, false);
}
