import type { NurtureEmailData, NurtureEmailDispatchContext } from "./types";
import { wrapNurtureBlock, nurtureCtaButton, escapeHtml } from "./helpers";
import { absoluteUrl } from "@/lib/public-site-url";

export function nurtureDay14Email(
  _data: NurtureEmailData,
  ctx: NurtureEmailDispatchContext,
): { subject: string; html: string } {
  const subject = "Waarom alles zwaarder voelt als je niet herstelt";
  const compareUrl = absoluteUrl("/beste-ashwagandha");

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
            <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;color:#333333;">Die collega die iets zegt waar je normaal je schouders over ophaalt &mdash; maar nu irriteert het je mateloos. Die kleine tegenslag die je hele dag kleurt. Dat gevoel dat je geduld op is voor het 10 uur is.</p>
            <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;color:#333333;">Dit is niet zwakte. Dit is neurologie.</p>
            <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;color:#333333;">Tijdens slaap &mdash; vooral de REM-fase &mdash; worden je emoties verwerkt. Je amygdala, het deel van je brein dat reageert op dreiging, wordt als het ware gekalibreerd. Bij slaaptekort slaat die kalibratie over.</p>
            <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;color:#333333;">Het gevolg: je reageert heftiger, neemt dingen persoonlijker, en je stressbestendigheid daalt. Niet omdat er meer stress is, maar omdat je brein het niet meer goed verwerkt.</p>
            <div style="background:#f5f5f0;border-left:3px solid #2d4a3e;padding:14px 18px;margin:18px 0;border-radius:0 4px 4px 0;">
              <p style="margin:0;font-size:15px;line-height:1.6;color:#1a1a1a;">Slechte slaap = slechtere emotionele controle. Niet andersom.</p>
            </div>
            <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;color:#333333;">Bouw deze week een avondwandeling van 15 minuten in. Na het eten, voor de schermen aangaan. Het klinkt simpel, maar beweging in de avond helpt je cortisol dalen en je zenuwstelsel reguleren.</p>
            <p style="margin:0 0 20px 0;font-size:16px;line-height:1.6;color:#333333;">Als stress een terugkerend thema is: ashwagandha (KSM-66) is het meest onderzochte adaptogeen voor cortisolregulatie.</p>
            ${nurtureCtaButton(compareUrl, "Bekijk de vergelijking")}
          </td>
        </tr>`;

  return { subject, html: wrapNurtureBlock(inner, ctx, false) };
}
