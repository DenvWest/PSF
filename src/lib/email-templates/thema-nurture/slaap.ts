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
    subject: "Je Slaapgids staat klaar",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
      <h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; margin-bottom: 16px;">
        Je Slaapgids staat klaar
      </h1>
      <p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 8px;">
        Bedankt voor je interesse in betere slaap. Hieronder vind je de link om je gids te downloaden.
      </p>
      <p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
        De gids bevat een 7-dagen slaapprotocol, doseerschema's per supplement en de meest gemaakte fouten die je slaap saboteren.
      </p>
      ${ctaButton(absoluteUrl("/downloads/slaapgids-perfectsupplement.pdf"), "Download de Slaapgids (PDF) →")}
    `,
        unsubscribeUrl,
      ),
  },
  3: {
    subject: "De #1 fout die mannen 40+ maken met slaap",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
      <h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; margin-bottom: 16px;">
        Heb je de gids al doorgenomen?
      </h1>
      <p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 8px;">
        De belangrijkste takeaway uit de Slaapgids is simpel: je slaapritme is belangrijker dan de hoeveelheid slaap.
      </p>
      <p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 8px;">
        Veel mannen focussen op "8 uur slaap halen" — maar een vast ritme (ook in het weekend) heeft meer impact op je energieniveau overdag dan een uur extra liggen.
      </p>
      <p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
        Eén ding dat je vanavond al kunt doen: stel een vast tijdstip in waarop je het licht dimt en je scherm wegdoet. Begin met 30 minuten voor je gewenste slaaptijd.
      </p>
      ${ctaButton(absoluteUrl("/slaap-verbeteren-na-40"), "Lees de complete slaapgids →")}
    `,
        unsubscribeUrl,
      ),
  },
  7: {
    subject: "Welke magnesium werkt het beste voor slaap?",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
      <h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; margin-bottom: 16px;">
        Supplementen voor slaap: waar begin je?
      </h1>
      <p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 8px;">
        Als je de leefstijlbasis op orde hebt — vast ritme, licht dimmen, geen schermen voor bed — kan een supplement het verschil maken.
      </p>
      <p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 8px;">
        De twee meest onderbouwde opties voor slaap zijn magnesium glycinaat en melatonine. Welke bij jou past hangt af van je situatie:
      </p>
      <ul style="font-size: 15px; color: #555; line-height: 1.8; margin-bottom: 24px; padding-left: 20px;">
        <li><strong>Magnesium glycinaat</strong> — als je moeite hebt met ontspannen en je spieren 's avonds nog gespannen aanvoelen</li>
        <li><strong>Melatonine</strong> — als je vooral moeite hebt met inslapen, maar eenmaal in slaap goed doorslaapt</li>
      </ul>
      <p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
        We hebben beide vergeleken op dosering, opname en prijs:
      </p>
      <div style="margin-bottom: 12px;">
        ${ctaButton(absoluteUrl("/beste-magnesium"), "Bekijk magnesium vergelijking →")}
      </div>
      <div>
        <a href="${absoluteUrl("/beste-melatonine")}" style="display: inline-block; color: #3C7A56; font-weight: 600; font-size: 15px; text-decoration: underline;">
          Of bekijk de melatonine vergelijking →
        </a>
      </div>
    `,
        unsubscribeUrl,
      ),
  },
};
