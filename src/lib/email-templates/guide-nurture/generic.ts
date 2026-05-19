import { absoluteUrl } from "@/lib/public-site-url";
import { GUIDE_DATA } from "@/data/gids";
import { ctaButton, emailWrapper } from "@/lib/email-templates/guide-nurture/shared";
import type { GuideNurtureDay, GuideNurtureTemplate } from "@/lib/email-templates/guide-nurture/types";
import type { GuideThema } from "@/types/guide-opt-in";

function day0Template(thema: GuideThema): GuideNurtureTemplate {
  const data = GUIDE_DATA[thema];
  const downloadUrl = data.pdfPath
    ? absoluteUrl(data.pdfPath)
    : absoluteUrl(data.pillarHref);
  const ctaLabel = data.pdfPath
    ? `Download de ${data.guideName} (PDF) →`
    : `Lees de ${data.guideName} →`;

  return {
    subject: `Je ${data.guideName} staat klaar`,
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
<h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
  Je ${data.guideName} staat klaar
</h1>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px;">
  Goed dat je de stap zet. Deze gids helpt je herkennen wat er speelt — en welke stappen haalbaar zijn na je 40e.
</p>
${ctaButton(downloadUrl, ctaLabel)}`,
        unsubscribeUrl,
        data.guideName,
      ),
  };
}

function followUpTemplate(
  thema: GuideThema,
  day: GuideNurtureDay,
  subject: string,
  title: string,
  body: string,
  ctaHref: string,
  ctaText: string,
): GuideNurtureTemplate {
  const data = GUIDE_DATA[thema];
  return {
    subject,
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
<h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
  ${title}
</h1>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
  ${body}
</p>
${ctaButton(absoluteUrl(ctaHref), ctaText)}
<p style="font-size: 14px; color: #777; line-height: 1.6; margin-top: 24px;">
  <a href="${absoluteUrl("/intake")}" style="color: #3C7A56; text-decoration: underline;">Doe de gratis Leefstijlcheck</a> — 15 vragen, 3 minuten.
</p>`,
        unsubscribeUrl,
        data.guideName,
      ),
  };
}

export function buildGenericGuideTemplates(
  thema: GuideThema,
): Record<GuideNurtureDay, GuideNurtureTemplate> {
  const data = GUIDE_DATA[thema];
  return {
    0: day0Template(thema),
    3: followUpTemplate(
      thema,
      3,
      `Tip 1: waar de meeste mannen beginnen met ${data.guideName.toLowerCase()}`,
      "Begin met één anker",
      "Kies deze week één gewoonte die je elke dag herhaalt. Niet vijf tegelijk — één die je wél volhoudt.",
      data.pillarHref,
      "Lees het complete protocol →",
    ),
    7: followUpTemplate(
      thema,
      7,
      "Week 1: wat merk je al?",
      "Kleine signalen tellen",
      "Beter slapen, meer rust of meer energie ontstaat zelden lineair. Noteer wat subtiel verandert — dat helpt je volgende stap kiezen.",
      data.pillarHref,
      "Verdiep je in de gids →",
    ),
    14: followUpTemplate(
      thema,
      14,
      "Supplementen: waar passen ze?",
      "Eerst de basis, dan aanvullen",
      "Supplementen zijn geen vervanging voor slaap, voeding en beweging. Wel een logische tweede stap als de basis op orde is.",
      "/supplementen",
      "Bekijk onze supplementgidsen →",
    ),
    21: followUpTemplate(
      thema,
      21,
      "Halverwege: volhouden loont",
      "Je bent op de goede weg",
      "De mannen die het grootste verschil merken, zijn niet perfect — wel consistent. Blijf je ene anker vasthouden.",
      data.pillarHref,
      "Terug naar het protocol →",
    ),
    30: followUpTemplate(
      thema,
      30,
      "Meet je voortgang na 30 dagen",
      "Tijd voor een nieuwe meting",
      "Na een maand is het zinvol om opnieuw te kijken. De Leefstijlcheck geeft je een actueel beeld van slaap, stress, energie en herstel.",
      "/intake",
      "Doe de gratis Leefstijlcheck →",
    ),
  };
}
