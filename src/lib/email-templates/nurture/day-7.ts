import type { NurtureEmailData, NurtureEmailDispatchContext } from "./types";
import { wrapNurtureBlock, nurtureCtaButton, escapeHtml } from "./helpers";
import { absoluteUrl } from "@/lib/public-site-url";

export function nurtureDay7Email(
  _data: NurtureEmailData,
  ctx: NurtureEmailDispatchContext,
): { subject: string; html: string } {
  const subject =
    "Je slaapt misschien genoeg \u2014 maar op het verkeerde moment";
  const slaapgidsUrl = absoluteUrl("/slaap-verbeteren-na-40");

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
            <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;color:#333333;">Je slaapt 7 uur. Dat zou genoeg moeten zijn. Toch word je moe wakker, alsof je nauwelijks hebt geslapen. Herkenbaar?</p>
            <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;color:#333333;">Je lichaam heeft een biologische klok &mdash; je circadiaan ritme. Die klok bepaalt wanneer je melatonine aanmaakt, wanneer je alert bent, en wanneer je het diepst slaapt.</p>
            <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;color:#333333;">Het probleem: die klok raakt makkelijk verstoord. Elke keer dat je in het weekend 2 uur later opstaat, geef je hem een jetlag. Beeldschermen tot laat geven hem het signaal dat het nog middag is. Laat eten zegt hem dat de dag nog niet voorbij is.</p>
            <div style="background:#f5f5f0;border-left:3px solid #2d4a3e;padding:14px 18px;margin:18px 0;border-radius:0 4px 4px 0;">
              <p style="margin:0;font-size:15px;line-height:1.6;color:#1a1a1a;">Slaap gaat niet alleen over hoeveel, maar vooral over wanneer.</p>
            </div>
            <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;color:#333333;">Kies een vaste opstaantijd en houd die 7 dagen vol &mdash; ook in het weekend. Binnen 30 minuten van hetzelfde tijdstip. Dit &eacute;&eacute;n ding heeft meer impact dan je denkt.</p>
            <p style="margin:0 0 20px 0;font-size:16px;line-height:1.6;color:#333333;">We schreven een complete gids over hoe slaap verandert na 40 &mdash; inclusief een week-voor-week aanpak.</p>
            ${nurtureCtaButton(slaapgidsUrl, "Lees de slaapgids")}
          </td>
        </tr>`;

  return { subject, html: wrapNurtureBlock(inner, ctx, false) };
}
