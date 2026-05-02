import type { NurtureEmailData, NurtureEmailDispatchContext } from "./types";
import { wrapNurtureBlock, escapeHtml } from "./helpers";

export function nurtureDay21Email(
  _data: NurtureEmailData,
  ctx: NurtureEmailDispatchContext,
): { subject: string; html: string } {
  const subject = "De factor die niemand noemt";

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
            <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;color:#333333;">We hebben het gehad over stress, ritme en emoties. Dit is de vierde factor &mdash; en misschien de belangrijkste. Maar niemand in de supplementwereld praat erover.</p>
            <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;color:#333333;">Je zenuwstelsel slaapt beter als het zich veilig voelt.</p>
            <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;color:#333333;">Dat klinkt vaag, maar het is meetbaar. Gevoelens van verbondenheid &mdash; een goed gesprek, tijd met iemand die je begrijpt, het gevoel dat je er niet alleen voor staat &mdash; verlagen je cortisol en helpen je zenuwstelsel reguleren.</p>
            <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;color:#333333;">Gebrek aan verbinding doet het tegenovergestelde. Je alertheid stijgt, je komt moeilijker tot rust, je slaap wordt oppervlakkiger. Niet door cafe&iuml;ne of schermen, maar door eenzaamheid.</p>
            <div style="background:#f5f5f0;border-left:3px solid #2d4a3e;padding:14px 18px;margin:18px 0;border-radius:0 4px 4px 0;">
              <p style="margin:0;font-size:15px;line-height:1.6;color:#1a1a1a;">Je kunt alle supplementen nemen die er zijn. Maar als je je niet veilig voelt, slaapt je lichaam niet diep.</p>
            </div>
            <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;color:#333333;">Praat deze week met iemand &mdash; partner, vriend, broer &mdash; over hoe je je voelt. Niet over werk of logistiek, maar over hoe het echt gaat. Het is geen zwakte. Het is fysiologie.</p>
            <p style="margin:0 0 0 0;font-size:16px;line-height:1.6;color:#333333;">Over 9 dagen sturen we je een herinnering om je Leefstijlcheck opnieuw te doen. Dan kun je zien wat er veranderd is. Tot dan &mdash; neem het stap voor stap.</p>
          </td>
        </tr>`;

  return { subject, html: wrapNurtureBlock(inner, ctx, false) };
}
