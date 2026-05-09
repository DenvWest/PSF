import { absoluteUrl } from "@/lib/public-site-url";
import type { ThemaNurtureDay, ThemaNurtureTemplate } from "./types";

function emailWrapper(content: string, unsubscribeUrl: string): string {
  return `
    <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
      ${content}
      <hr style="border: none; border-top: 1px solid #e8e6e1; margin: 32px 0 16px;" />
      <p style="font-size: 12px; color: #999; line-height: 1.5;">
        Je ontvangt deze e-mail omdat je de Energiegids hebt aangevraagd via PerfectSupplement.nl.<br />
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

export const energieTemplates: Record<ThemaNurtureDay, ThemaNurtureTemplate> = {
  1: {
    subject: "Je Energiegids staat klaar",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
<h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
  Je Energiegids staat klaar
</h1>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px;">
  Goed dat je de stap zet. Meer energie begint met begrijpen wat er na je 40e verandert — en daar helpt deze gids bij.
</p>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px;">
  Je bent niet de enige man boven de 40 die merkt dat de tank sneller leeg voelt. Bloedsuiker, slaapkwaliteit, stress en micronutriënten spelen allemaal mee — en ze versterken elkaar vaak zonder dat je het merkt.
</p>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 8px;">
  In de gids vind je:
</p>
<ul style="font-size: 15px; color: #555; line-height: 1.8; margin-bottom: 24px; padding-left: 20px;">
  <li>Concrete stappen rond voeding, beweging en dagritme die je deze week kunt proberen</li>
  <li>Hoe supplementen passen bij energie na 40 — realistisch en evidence-based</li>
  <li>Signalen waar je op let en wanneer verdieping bij een professional slim is</li>
</ul>
${ctaButton(
          absoluteUrl("/downloads/energiegids-perfectsupplement.pdf"),
          "Download de Energiegids (PDF) →",
        )}
<p style="font-size: 14px; color: #777; line-height: 1.6; margin-top: 24px;">
  <strong>P.S.</strong> Eén ding dat vandaag al helpt: drink direct na het opstaan een groot glas water vóór je eerste koffie — vaak het snelste “resetmoment” van je ochtend.
</p>`,
        unsubscribeUrl,
      ),
  },
  3: {
    subject: "De #1 energie-fout na 40 die bijna niemand ziet aankomen",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
<h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
  De #1 fout die je energie stiekem leegtrekt
</h1>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px;">
  Heb je de Energiegids al doorgenomen? Dan is dit het belangrijkste inzicht om te onthouden:
</p>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px;">
  <strong>Meer cafeïne compenseert niet voor een kapotte energiebasis.</strong>
</p>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px;">
  Als bloedsuiker en slaap niet stabiel zijn, werkt cafeïne als een lening: eerst alert, daarna meer dip. Het duurzame werk zit eerst in een eiwitrijk ontbijt, voldoende water en ritme overdag — daarna heeft je lichaam minder nood aan “kunstmatige prikkels”.
</p>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
  Op onze energiepagina zetten we het op een rij: wat er speelt na 40 en hoe je klein en herhaalbaar start.
</p>
${ctaButton(
          absoluteUrl("/energie-na-40"),
          "Lees de complete energiegids op de site →",
        )}
<p style="font-size: 14px; color: #777; line-height: 1.6; margin-top: 24px;">
  <strong>P.S.</strong> Begin klein: kies deze week één vaste ochtend-gewoonte na het opstaan (water → 10 minuten buitenlicht). Niets meer.
</p>`,
        unsubscribeUrl,
      ),
  },
  7: {
    subject: "Omega-3 of creatine — wat past eerst bij meer energie?",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
<h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
  Omega-3 of creatine — wat past eerst bij jou?
</h1>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px;">
  Als je de afgelopen week meer op ritme zat met eten en bewegen, kun je bekijken of een supplement slim is om dat verschil te versterken.
</p>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px;">
  Twee keuzes die vaak naar voren komen bij mannen 40+:
</p>
<table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
  <tr style="border-bottom: 1px solid #e8e6e1;">
    <td style="padding: 12px; color: #555; vertical-align: top;"><strong>Omega-3 (EPA/DHA)</strong></td>
    <td style="padding: 12px; color: #555; vertical-align: top;">Je eet weinig vette vis en zoekt iets dat cellen en het energiehuishouden op hoofdlijnen kan ondersteunen.</td>
  </tr>
  <tr>
    <td style="padding: 12px; color: #555; vertical-align: top;"><strong>Creatine</strong></td>
    <td style="padding: 12px; color: #555; vertical-align: top;">Je merkt dat fysieke en mentale output sneller zakt; creatine kan volgens onderzoek een rol spelen bij directe ATP-ondersteuning.</td>
  </tr>
</table>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
  We hebben beide vergeleken op kwaliteit, dosering en prijs — zodat je een keuze kunt maken die bij jou past:
</p>
${ctaButton(absoluteUrl("/beste-omega-3-supplement"), "Bekijk de omega-3-vergelijking →")}
<p style="margin-top: 12px;">
  <a href="${absoluteUrl("/beste-creatine")}" style="color: #3C7A56; font-weight: 600; font-size: 15px; text-decoration: underline;">
    Of bekijk de creatine-vergelijking →
  </a>
</p>
<p style="font-size: 14px; color: #777; line-height: 1.6; margin-top: 24px;">
  <strong>P.S.</strong> Niet zeker welk pad bij jouw situatie past? <a href="${absoluteUrl("/intake")}" style="color: #3C7A56; text-decoration: underline;">Doe de gratis Leefstijlcheck</a> — in 3 minuten weet je waar je staat.
</p>`,
        unsubscribeUrl,
      ),
  },
};
