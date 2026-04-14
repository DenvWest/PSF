import { escapeHtml, nurtureEmailWrap } from "@/lib/emails/shared";

export const day14EmailSubject = "Halverwege: tijd voor je supplementroute?";

export function day14EmailHtml(params: {
  unsubscribeUrl: string;
  supplementListHtml: string;
  hasAffiliateLinks: boolean;
}): string {
  const inner = `
          <tr>
            <td style="padding:8px 28px 16px 28px;">
              <h1 style="margin:0;font-family:'DM Serif Display',Georgia,serif;font-size:24px;line-height:1.25;color:#1a1a1a;font-weight:400;">
                Halverwege je eerste maand
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px 28px;">
              <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#333333;">
                Als je leefstijl een beetje op de rit staat, is het logisch om je supplementkeuze rustig af te stemmen — vergelijken op inhoud en gebruik, niet op beloftes.
              </p>
              <p style="margin:0 0 12px 0;font-size:16px;line-height:1.6;color:#333333;">
                Op basis van je intake past dit bij jouw route (informatief):
              </p>
              ${params.supplementListHtml}
              <p style="margin:16px 0 0 0;font-size:15px;line-height:1.6;color:#555555;">
                Supplementen zijn geen vervanging voor een gevarieerd dieet of medische zorg.
              </p>
            </td>
          </tr>`;

  return nurtureEmailWrap(inner, params.unsubscribeUrl, params.hasAffiliateLinks);
}

export function day14SupplementListItem(params: {
  name: string;
  siteUrl: string;
  partnerUrl: string | null;
}): string {
  const partnerBlock = params.partnerUrl
    ? `<li style="margin:6px 0;"><a href="${escapeHtml(params.partnerUrl)}" style="color:#1a1a1a;">Voorbeeldproduct (partnerlink)</a></li>`
    : "";

  return `<li style="margin:10px 0;font-size:16px;line-height:1.55;color:#333333;">
    <strong>${escapeHtml(params.name)}</strong>
    <ul style="margin:6px 0 0 0;padding-left:20px;">
      <li style="margin:6px 0;"><a href="${escapeHtml(params.siteUrl)}" style="color:#1a1a1a;">Lees vergelijk / uitleg op PerfectSupplement</a></li>
      ${partnerBlock}
    </ul>
  </li>`;
}
