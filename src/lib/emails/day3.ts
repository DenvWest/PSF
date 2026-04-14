import { escapeHtml, nurtureEmailWrap } from "@/lib/emails/shared";

export function day3EmailSubject(quickWin: string): string {
  const snippet =
    quickWin.length > 50 ? `${quickWin.slice(0, 47).trim()}…` : quickWin;
  return `Dag 3: Hoe gaat het met ${snippet}?`;
}

export function day3EmailHtml(params: {
  unsubscribeUrl: string;
  quickWin: string;
  primaryDomainLabel: string;
  domainTip: string;
}): string {
  const inner = `
          <tr>
            <td style="padding:8px 28px 16px 28px;">
              <h1 style="margin:0;font-family:'DM Serif Display',Georgia,serif;font-size:24px;line-height:1.25;color:#1a1a1a;font-weight:400;">
                Dag 3: even checken
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px 28px;">
              <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#333333;">
                Je koos als eerste Quick Win: <strong>${escapeHtml(params.quickWin)}</strong>.
                Kleine stappen tellen — het gaat erom wat je volhoudt, niet om perfectie.
              </p>
              <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#333333;">
                In jouw intake kwam <strong>${escapeHtml(params.primaryDomainLabel)}</strong> het meest naar voren.
                Extra tip: ${escapeHtml(params.domainTip)}
              </p>
              <p style="margin:0;font-size:15px;line-height:1.6;color:#555555;">
                Geen medisch advies — bij twijfel of klachten zoek je zelf contact met je zorgverlener.
              </p>
            </td>
          </tr>`;

  return nurtureEmailWrap(inner, params.unsubscribeUrl, false);
}
