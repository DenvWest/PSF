import type { NurtureEmailData, NurtureEmailDispatchContext } from "./types";
import { wrapNurtureBlock, nurtureCtaButton, escapeHtml } from "./helpers";
import { absoluteUrl } from "@/lib/public-site-url";

export function nurtureDay3Email(
  _data: NurtureEmailData,
  ctx: NurtureEmailDispatchContext,
): { subject: string; html: string } {
  const subject = "Dit is waarom 'gewoon ontspannen' niet werkt";
  const compareUrl = absoluteUrl("/beste-magnesium");

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
            <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;color:#333333;">Je weet dat je gestrest bent. Mensen zeggen: &ldquo;neem het rustiger aan&rdquo;. Maar dat voelt als iemand die zegt dat je moet stoppen met ademen.</p>
            <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;color:#333333;">Het probleem is niet dat je niet w&iacute;lt ontspannen. Het probleem is dat je lichaam niet k&aacute;n.</p>
            <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;color:#333333;">Je hebt een stresssysteem &mdash; de HPA-as &mdash; dat cortisol aanmaakt. Normaal gaat het aan bij gevaar en weer uit bij rust. Maar bij chronische stress blijft het aan. Je lichaam staat in permanente waakstand.</p>
            <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;color:#333333;">Het gevolg: je slaapt lichter, herstelt slechter, en je energiereserves raken op. Niet omdat je te weinig doet, maar omdat je lichaam nooit echt stopt.</p>
            <div style="background:#f5f5f0;border-left:3px solid #2d4a3e;padding:14px 18px;margin:18px 0;border-radius:0 4px 4px 0;">
              <p style="margin:0;font-size:15px;line-height:1.6;color:#1a1a1a;">Je kunt slaap niet fixen zonder eerst je stressniveau te verlagen.</p>
            </div>
            <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;color:#333333;">Begin vanavond met &eacute;&eacute;n ding: dim je verlichting 1 uur voor bedtijd. Geen telefoon, geen laptop. Geef je zenuwstelsel het signaal dat het veilig is om af te schakelen.</p>
            <p style="margin:0 0 20px 0;font-size:16px;line-height:1.6;color:#333333;">Trouwens &mdash; magnesium speelt een directe rol bij het kalmeren van je zenuwstelsel. Als je benieuwd bent welke vorm het beste wordt opgenomen: we hebben ze vergeleken.</p>
            ${nurtureCtaButton(compareUrl, "Bekijk de vergelijking")}
          </td>
        </tr>`;

  return { subject, html: wrapNurtureBlock(inner, ctx, false) };
}
