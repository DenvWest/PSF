import { absoluteUrl } from "@/lib/public-site-url";
import { ctaButton, emailWrapper } from "@/lib/email-templates/guide-nurture/shared";
import type { GuideNurtureDay, GuideNurtureTemplate } from "@/lib/email-templates/guide-nurture/types";

const GUIDE_NAME = "Bewegingsgids";

export const bewegingGuideTemplates: Record<GuideNurtureDay, GuideNurtureTemplate> = {
  0: {
    subject: "Je beweging-stappenplan staat klaar",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
<h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
  Je beweging-stappenplan staat klaar
</h1>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px;">
  Goed dat je begint met bewegen — niet met een supplementenmandje. Kracht thuis is vaak de sterkste hefboom na 40.
</p>
<ul style="font-size: 15px; color: #555; line-height: 1.8; margin-bottom: 24px; padding-left: 20px;">
  <li>Deze week: één kracht-oefening thuis — geen materiaal nodig</li>
  <li>Week 2–4: 2× full-body kracht + belasting bijhouden</li>
  <li>Creatine pas als je basis op orde is</li>
</ul>
${ctaButton(absoluteUrl("/beweging-na-40"), "Start met je stappenplan →")}
<p style="font-size: 14px; color: #777; line-height: 1.6; margin-top: 24px;">
  <strong>P.S.</strong> Opstaan uit een stoel zonder je handen — een paar keer achter elkaar. Klein, maar een echte krachtprikkel.
</p>`,
        unsubscribeUrl,
        GUIDE_NAME,
      ),
  },
  3: {
    subject: "Stap 1: één kracht-oefening thuis",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
<h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
  Begin klein, blijf consistent
</h1>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
  Kies één oefening die je vandaag kunt doen: kniebuigingen tegen het aanrecht, opdrukken, of vaker de trap nemen. Consistentie telt meer dan het perfecte schema.
</p>
${ctaButton(absoluteUrl("/blog/krachttraining-na-40"), "Lees het 8-weken startprotocol →")}`,
        unsubscribeUrl,
        GUIDE_NAME,
      ),
  },
  7: {
    subject: "Week 2: 2× kracht per week",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
<h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
  Full-body, twee keer per week
</h1>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
  Squat, push, pull, hip hinge — 2–3 sets × 8–12 reps. Rust 48–72 uur tussen krachtdagen. Techniek eerst, zwaarte daarna.
</p>
${ctaButton(absoluteUrl("/intake/beweging"), "Check je kracht- en conditieniveau →")}`,
        unsubscribeUrl,
        GUIDE_NAME,
      ),
  },
  14: {
    subject: "Herstel telt net zo hard als training",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
<h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
  Rustdag is geen falen
</h1>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px;">
  Noteer 7 dagen: training, slaap en zwaarte na inspanning. Patronen worden zichtbaar wanneer je te veel of te weinig doet — vóór je extra supplementen stapelt.
</p>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
  Herhaal de beweegcheck over twee weken — dan zie je of je kracht en conditie bewegen sinds je startpunt.
</p>
${ctaButton(absoluteUrl("/intake/beweging"), "Doe opnieuw de beweegcheck →")}
<p style="margin-top: 12px;">
  <a href="${absoluteUrl("/beweging-na-40")}" style="color: #3C7A56; font-weight: 600; font-size: 15px; text-decoration: underline;">
    Lees over herstel en ritme →
  </a>
</p>`,
        unsubscribeUrl,
        GUIDE_NAME,
      ),
  },
  21: {
    subject: "Creatine: pas als je basis staat",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
<h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
  Eerst trainen, eten, slapen — dan creatine
</h1>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
  Creatine kan ondersteunen bij krachttraining — geen vervanging van herstel, eiwit of rustdagen. Vergelijk pas als je al structureel traint.
</p>
${ctaButton(absoluteUrl("/beste/creatine"), "Vergelijk creatine supplementen →")}`,
        unsubscribeUrl,
        GUIDE_NAME,
      ),
  },
  30: {
    subject: "Hoe gaat het met je beweging?",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
<h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
  Tijd voor een nieuwe meting
</h1>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
  Na een maand is het zinvol om opnieuw te kijken: beweging, herstel, voeding en slaap hangen samen. De Leefstijlcheck geeft je een actueel beeld in 3 minuten.
</p>
${ctaButton(absoluteUrl("/intake"), "Doe de gratis Leefstijlcheck →")}`,
        unsubscribeUrl,
        GUIDE_NAME,
      ),
  },
};
