import { absoluteUrl } from "@/lib/public-site-url";
import type { ThemaNurtureDay, ThemaNurtureTemplate } from "./types";

function emailWrapper(content: string, unsubscribeUrl: string): string {
  return `
    <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
      ${content}
      <hr style="border: none; border-top: 1px solid #e8e6e1; margin: 32px 0 16px;" />
      <p style="font-size: 12px; color: #999; line-height: 1.5;">
        Je ontvangt deze e-mail omdat je de Slaapgids hebt aangevraagd via PerfectSupplement.nl.<br />
        <a href="${unsubscribeUrl}" style="color: #999; text-decoration: underline;">Uitschrijven</a>
      </p>
    </div>
  `;
}

function ctaButton(url: string, text: string): string {
  return `
    <a href="${url}" style="display: inline-block; background-color: #3C7A56; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
      ${text}
    </a>
  `;
}

export const slaapTemplates: Record<ThemaNurtureDay, ThemaNurtureTemplate> = {
  1: {
    subject: "Je Slaapgids staat klaar, persoonlijk voor jou",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
<h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
  Je Slaapgids staat klaar
</h1>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px;">
  Goed dat je de stap zet. Beter slapen begint met begrijpen wat er verandert — en daar helpt deze gids bij.
</p>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px;">
  Je bent niet de enige man boven de 40 die merkt dat slaap niet meer vanzelf gaat. Na je 40e produceert je lichaam minder melatonine, reageert het sterker op stress en herstelt het langzamer. Dat is normaal — maar het betekent wel dat je iets anders moet doen dan voorheen.
</p>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 8px;">
  In de gids vind je:
</p>
<ul style="font-size: 15px; color: #555; line-height: 1.8; margin-bottom: 24px; padding-left: 20px;">
  <li>Een 7-dagen protocol dat je vanavond al kunt starten</li>
  <li>Welke supplementen wél en niet werken (met doseringen)</li>
  <li>De #1 fout die de meeste mannen maken met slaap</li>
</ul>
${ctaButton(
          absoluteUrl("/downloads/slaapgids-perfectsupplement.pdf"),
          "Download de Slaapgids (PDF) →",
        )}
<p style="font-size: 14px; color: #777; line-height: 1.6; margin-top: 24px;">
  <strong>P.S.</strong> Eén ding dat je vanavond al kunt doen: dim het licht in huis vanaf 21:00 en zet je telefoon op vliegtuigmodus. Klein, maar het verschil is merkbaar.
</p>`,
        unsubscribeUrl,
      ),
  },
  3: {
    subject: "De #1 slaapfout die bijna iedereen maakt",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
<h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
  De #1 fout die bijna iedereen maakt
</h1>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px;">
  Heb je de Slaapgids al doorgenomen? Dan is dit het belangrijkste inzicht om te onthouden:
</p>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px;">
  <strong>Je slaapritme is belangrijker dan de hoeveelheid slaap.</strong>
</p>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px;">
  Veel mannen proberen "8 uur te halen" — maar een vast ritme (ook in het weekend) heeft meer impact op hoe je je overdag voelt dan een uur extra liggen. Je lichaam is geen accu die je oplaadt. Het is een klok die je gelijkzet.
</p>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
  Op onze slaappagina leggen we uit hoe je dit ritme opbouwt — stap voor stap, zonder dat je je hele avond hoeft om te gooien.
</p>
${ctaButton(
          absoluteUrl("/slaap-verbeteren-na-40"),
          "Lees het complete slaapprotocol →",
        )}
<p style="font-size: 14px; color: #777; line-height: 1.6; margin-top: 24px;">
  <strong>P.S.</strong> Begin klein: stel deze week één vast tijdstip in waarop je het licht dimt. Niet je slaaptijd zelf — alleen het moment dat je begint met afsluiten. Dat is genoeg voor nu.
</p>`,
        unsubscribeUrl,
      ),
  },
  7: {
    subject: "Magnesium of melatonine — wat past bij jou?",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
<h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
  Magnesium of melatonine — wat past bij jou?
</h1>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px;">
  Als je de afgelopen week je slaapritme hebt aangepast, merk je misschien al verschil. De basis staat — en nu kun je overwegen of een supplement dat verschil kan vergroten.
</p>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px;">
  De twee meest onderbouwde opties voor slaap zijn magnesium en melatonine. Welke bij jou past hangt af van wat je ervaart:
</p>
<table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
  <tr style="border-bottom: 1px solid #e8e6e1;">
    <td style="padding: 12px; color: #555; vertical-align: top;"><strong>Magnesium glycinaat</strong></td>
    <td style="padding: 12px; color: #555; vertical-align: top;">Je hebt moeite met ontspannen. Je spieren voelen 's avonds nog gespannen, je hoofd draait door.</td>
  </tr>
  <tr>
    <td style="padding: 12px; color: #555; vertical-align: top;"><strong>Melatonine</strong></td>
    <td style="padding: 12px; color: #555; vertical-align: top;">Je hebt vooral moeite met inslapen. Eenmaal in slaap slaap je redelijk door.</td>
  </tr>
</table>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
  We hebben beide vergeleken op dosering, opname en prijs — zodat je een keuze kunt maken die bij jou past:
</p>
${ctaButton(absoluteUrl("/beste-magnesium"), "Bekijk de magnesium vergelijking →")}
<p style="margin-top: 12px;">
  <a href="${absoluteUrl("/beste-melatonine")}" style="color: #3C7A56; font-weight: 600; font-size: 15px; text-decoration: underline;">
    Of bekijk de melatonine vergelijking →
  </a>
</p>
<p style="font-size: 14px; color: #777; line-height: 1.6; margin-top: 24px;">
  <strong>P.S.</strong> Niet zeker welk supplement bij jouw situatie past? <a href="${absoluteUrl("/intake")}" style="color: #3C7A56; text-decoration: underline;">Doe de gratis Leefstijlcheck</a> — in 3 minuten weet je waar je staat.
</p>`,
        unsubscribeUrl,
      ),
  },
};
