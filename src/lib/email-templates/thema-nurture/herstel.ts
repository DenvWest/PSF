import { absoluteUrl } from "@/lib/public-site-url";
import type { ThemaNurtureDay, ThemaNurtureTemplate } from "./types";

function emailWrapper(content: string, unsubscribeUrl: string): string {
  return `
    <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
      ${content}
      <hr style="border: none; border-top: 1px solid #e8e6e1; margin: 32px 0 16px;" />
      <p style="font-size: 12px; color: #999; line-height: 1.5;">
        Je ontvangt deze e-mail omdat je de Herstelgids hebt aangevraagd via PerfectSupplement.nl.<br />
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

export const herstelTemplates: Record<ThemaNurtureDay, ThemaNurtureTemplate> = {
  1: {
    subject: "Je Herstelgids staat klaar",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
<h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
  Je Herstelgids staat klaar
</h1>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px;">
  Goed dat je de stap zet. Beter herstellen na 40 begint met begrijpen waarom je lichaam langer nodig heeft — en daar helpt deze gids bij.
</p>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px;">
  Je bent niet de enige man boven de 40 die merkt dat spierpijn, stijfheid of vermoeidheid blijft hangen terwijl je nog “alles goed doet”. Trainingsdruk, slaap, stress en voeding spelen allemaal mee — en ze versterken elkaar vaak zonder dat je het merkt.
</p>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 8px;">
  In de gids vind je:
</p>
<ul style="font-size: 15px; color: #555; line-height: 1.8; margin-bottom: 24px; padding-left: 20px;">
  <li>Een 7-dagen herstelprotocol dat je deze week kunt starten</li>
  <li>Hoe magnesium, omega-3, creatine en zink passen bij herstel — realistisch en evidence-based</li>
  <li>De drie grootste valkuilen en wanneer verdieping bij een professional slim is</li>
</ul>
${ctaButton(
          absoluteUrl("/downloads/herstelgids-perfectsupplement.pdf"),
          "Download de Herstelgids (PDF) →",
        )}
<p style="font-size: 14px; color: #777; line-height: 1.6; margin-top: 24px;">
  <strong>P.S.</strong> Eén ding vandaag: plan één training of zware afspraak deze week bewust een niveau lichter óf schuif hem een dag op. Klein signaal, groot effect op je systeem.
</p>`,
        unsubscribeUrl,
      ),
  },
  3: {
    subject: "De #1 herstelfout die mannen 40+ over het hoofd zien",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
<h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
  De #1 herstelfout die mannen 40+ over het hoofd zien
</h1>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px;">
  Heb je de Herstelgids al doorgenomen? Dan is dit het belangrijkste inzicht om te onthouden:
</p>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px;">
  <strong>Meer trainen compenseert niet voor chronisch te weinig echte rust.</strong>
</p>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px;">
  Als pieken en herstel niet meer op elkaar aansluiten, bouwt je lijf spanning op in plaats van capaciteit. Die spanning merk je eerst subtiel: minder progressie, vaker stijf, sneller leeg. Het duurzame werk zit in volume, slaap en lichte dagen — supplementen komen daarna.
</p>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
  Op onze herstelthemapagina zetten we de verdieping op een rij — praktisch en haalbaar.
</p>
${ctaButton(
          absoluteUrl("/gids/herstel"),
          "Lees het complete herstelthema op de site →",
        )}
<p style="font-size: 14px; color: #777; line-height: 1.6; margin-top: 24px;">
  <strong>P.S.</strong> Begin klein: kies deze week twee avonden een halfuur eerder naar bed — geen apps, dimlicht. Alleen dat.
</p>`,
        unsubscribeUrl,
      ),
  },
  7: {
    subject: "Magnesium of omega-3 — wat past eerst bij jouw herstel?",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
<h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
  Magnesium of omega-3 — wat past eerst bij jouw herstel?
</h1>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px;">
  Als je de afgelopen week meer op rust en ritme hebt gelet, kun je bekijken of een supplement slim is om dat verschil te versterken.
</p>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px;">
  Twee keuzes die vaak naar voren komen bij mannen 40+:
</p>
<table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
  <tr style="border-bottom: 1px solid #e8e6e1;">
    <td style="padding: 12px; color: #555; vertical-align: top;"><strong>Magnesium</strong></td>
    <td style="padding: 12px; color: #555; vertical-align: top;">Je spieren zijn strak, je slaap is onrustig en je zoekt vooral fysieke en mentale ontspanning binnen EU-claims.</td>
  </tr>
  <tr>
    <td style="padding: 12px; color: #555; vertical-align: top;"><strong>Omega-3 (EPA/DHA)</strong></td>
    <td style="padding: 12px; color: #555; vertical-align: top;">Je eet weinig vette vis en zoekt iets dat past bij hart- en hersenclaims — en je algemene leefstijl als basis hebt.</td>
  </tr>
</table>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
  We hebben beide vergeleken op kwaliteit, dosering en prijs — zodat je een keuze kunt maken die bij jou past:
</p>
${ctaButton(absoluteUrl("/beste/magnesium"), "Bekijk de magnesium-vergelijking →")}
<p style="margin-top: 12px;">
  <a href="${absoluteUrl("/beste/omega-3-supplement")}" style="color: #3C7A56; font-weight: 600; font-size: 15px; text-decoration: underline;">
    Of bekijk de omega-3-vergelijking →
  </a>
</p>
<p style="font-size: 14px; color: #777; line-height: 1.6; margin-top: 24px;">
  <strong>P.S.</strong> Niet zeker welk pad bij jouw situatie past? <a href="${absoluteUrl("/intake")}" style="color: #3C7A56; text-decoration: underline;">Doe de gratis Leefstijlcheck</a> — in 3 minuten weet je waar je staat.
</p>`,
        unsubscribeUrl,
      ),
  },
};
