import { absoluteUrl } from "@/lib/public-site-url";
import type { ThemaNurtureDay, ThemaNurtureTemplate } from "./types";

function emailWrapper(content: string, unsubscribeUrl: string): string {
  return `
    <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
      ${content}
      <hr style="border: none; border-top: 1px solid #e8e6e1; margin: 32px 0 16px;" />
      <p style="font-size: 12px; color: #999; line-height: 1.5;">
        Je ontvangt deze e-mail omdat je de Stressgids hebt aangevraagd via PerfectSupplement.nl.<br />
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

export const stressTemplates: Record<ThemaNurtureDay, ThemaNurtureTemplate> = {
  1: {
    subject: "Je Stressgids staat klaar — download hier",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
<h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
  Je Stressgids staat klaar
</h1>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px;">
  Goed dat je de stap zet. Meer grip op stress begint met begrijpen wat er in je lichaam gebeurt — en daar helpt deze gids bij.
</p>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px;">
  Je bent niet de enige man boven de 40 die merkt dat stress niet meer vanzelf wegzakt. Na je 40e reageert je stress-as gevoeliger op aanhoudende druk, herstelt je hormonale balans langzamer en kost chronische spanning meer van je slaap en energie. Dat is normaal — maar het betekent wel dat je andere keuzes maakt dan twintig jaar geleden.
</p>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 8px;">
  In de gids vind je:
</p>
<ul style="font-size: 15px; color: #555; line-height: 1.8; margin-bottom: 24px; padding-left: 20px;">
  <li>Praktische stappen om je stressrespons te kalmeren — ook als je weinig tijd hebt</li>
  <li>Welke lifestyle-factoren de grootste hefboom zijn (en wat eerst aanpakken)</li>
  <li>Hoe supplementen passen bij stress — realistisch en evidence-based</li>
</ul>
${ctaButton(
          absoluteUrl("/downloads/stressgids-perfectsupplement.pdf"),
          "Download de Stressgids (PDF) →",
        )}
<p style="font-size: 14px; color: #777; line-height: 1.6; margin-top: 24px;">
  <strong>P.S.</strong> Eén ding dat vandaag al helpt: na een stressmoment 2 minuten langzaam uitademen (langer uit dan in). Klein ritueel, meetbaar effect op je systeem.
</p>`,
        unsubscribeUrl,
      ),
  },
  3: {
    subject: "De #1 stressval die bijna elke drukke man maakt",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
<h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
  De #1 val die bijna elke drukke man maakt
</h1>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px;">
  Heb je de Stressgids al doorgenomen? Dan is dit het belangrijkste inzicht om te onthouden:
</p>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px;">
  <strong>Je lichaam herstelt niet van “even niets doen” als je hoofd nog vol gas staat.</strong>
</p>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px;">
  Veel mannen plannen rust na werktijd — maar blijven mentaal in dezelfde versnelling. Dan blijft je stress-as actief en voel je je ’s avonds opgebrand zonder echt uitgerust te zijn. Echte recovery is een schakelmoment: van aandacht naar het nu, niet alleen minder taken.
</p>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
  Op onze stresspagina leggen we uit hoe je dat schakelmoment opbouwt — praktisch en haalbaar na 40.
</p>
${ctaButton(
          absoluteUrl("/stress-verminderen-man"),
          "Lees de complete stressgids op de site →",
        )}
<p style="font-size: 14px; color: #777; line-height: 1.6; margin-top: 24px;">
  <strong>P.S.</strong> Begin klein: kies deze week één vast moment van 5 minuten zonder scherm, direct na het werk. Alleen dat — geen protocol, geen app.
</p>`,
        unsubscribeUrl,
      ),
  },
  7: {
    subject: "Ashwagandha of magnesium — wat past bij jouw stress?",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
<h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
  Ashwagandha of magnesium — wat past bij jou?
</h1>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px;">
  Als je de afgelopen week bewuster met stress bent omgegaan, merk je misschien al verschil. De basis telt het meest — en soms helpt een gericht supplement dat verschil te versterken.
</p>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px;">
  Twee opties die het vaakst voorkomen bij mannen 40+:
</p>
<table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
  <tr style="border-bottom: 1px solid #e8e6e1;">
    <td style="padding: 12px; color: #555; vertical-align: top;"><strong>Ashwagandha (KSM-66)</strong></td>
    <td style="padding: 12px; color: #555; vertical-align: top;">Je voelt je mentaal opgefokt, piekert veel en zoekt iets dat je stressperceptie en cortisol ondersteunt.</td>
  </tr>
  <tr>
    <td style="padding: 12px; color: #555; vertical-align: top;"><strong>Magnesium glycinaat</strong></td>
    <td style="padding: 12px; color: #555; vertical-align: top;">Je spieren zijn strak, je slaap is onrustig en je zoekt vooral fysieke ontspanning.</td>
  </tr>
</table>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
  We hebben beide vergeleken op kwaliteit, dosering en prijs — zodat je een keuze kunt maken die bij jou past:
</p>
${ctaButton(absoluteUrl("/beste-ashwagandha"), "Bekijk de ashwagandha-vergelijking →")}
<p style="margin-top: 12px;">
  <a href="${absoluteUrl("/beste-magnesium")}" style="color: #3C7A56; font-weight: 600; font-size: 15px; text-decoration: underline;">
    Of bekijk de magnesium-vergelijking →
  </a>
</p>
<p style="font-size: 14px; color: #777; line-height: 1.6; margin-top: 24px;">
  <strong>P.S.</strong> Niet zeker welk pad bij jouw situatie past? <a href="${absoluteUrl("/intake")}" style="color: #3C7A56; text-decoration: underline;">Doe de gratis Leefstijlcheck</a> — in 3 minuten weet je waar je staat.
</p>`,
        unsubscribeUrl,
      ),
  },
};
