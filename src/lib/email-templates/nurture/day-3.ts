import type { NurtureEmailData, NurtureEmailDispatchContext } from "./types";
import {
  domainLabelNl,
  escapeHtml,
  nurtureCtaButton,
  quickWinsForDomain,
  wrapNurtureBlock,
} from "./helpers";

const WHY_FIRST_WIN: Record<string, string> = {
  sleep:
    "Een vast ritme en minder prikkels voor het slapen geven je systeem een duidelijk signaal om tot rust te komen — dat ondersteunt je natuurlijke slaapdruk.",
  energy:
    "Stabiele energie begint vaak bij voeding en lichte beweging rond de maaltijd: kleine interventies die je bloedsuiker minder extreem laten schommelen.",
  stress:
    "Korte ademruimte en bewuste schermvrije momenten verlagen mentale ruis — dat maakt ontspanning eerder haalbaar dan ‘meer willen ontspannen’.",
  nutrition:
    "Kleine upgrades in vetzuren en vezels ondersteunen ontstekingsbalans en verzadiging — zonder dat je je hele week hoeft om te gooien.",
  movement:
    "Lichte, frequente beweging houdt stofwisseling en stemming meer stabiel dan af en toe een zware sessie.",
  recovery:
    "Herstel groeit waar belasting en rust in balans zijn; een gerichte pauze voorkomt dat je lichaam in een constante ‘te hoge versnelling’ blijft hangen.",
};

export function nurtureDay3Email(
  data: NurtureEmailData,
  ctx: NurtureEmailDispatchContext,
): { subject: string; html: string } {
  const subject = "Kleine stap, groot verschil";
  const wins = quickWinsForDomain(data.primaryDomain);
  const first = wins[0] ?? wins[1] ?? "";
  const why =
    WHY_FIRST_WIN[data.primaryDomain.trim().toLowerCase()] ??
    WHY_FIRST_WIN.sleep;
  const domein = domainLabelNl(data.primaryDomain);

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
              <p style="margin:0 0 12px 0;font-size:16px;line-height:1.6;color:#333333;">
                Even checken: je hoofdthema blijft <strong>${escapeHtml(domein)}</strong>.
              </p>
              <p style="margin:0 0 12px 0;font-size:16px;line-height:1.6;color:#333333;">
                <strong>Focus deze week:</strong> ${escapeHtml(first)}
              </p>
              <p style="margin:0;font-size:16px;line-height:1.6;color:#333333;">
                ${escapeHtml(why)}
              </p>
            </td>
          </tr>`;

  return { subject, html: wrapNurtureBlock(inner, ctx.recipientEmail, false) };
}
