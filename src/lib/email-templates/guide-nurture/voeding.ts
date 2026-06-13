import { absoluteUrl } from "@/lib/public-site-url";
import { ctaButton, emailWrapper } from "@/lib/email-templates/guide-nurture/shared";
import type { GuideNurtureDay, GuideNurtureTemplate } from "@/lib/email-templates/guide-nurture/types";

const GUIDE_NAME = "Voedingsgids";

export const voedingGuideTemplates: Record<GuideNurtureDay, GuideNurtureTemplate> = {
  0: {
    subject: "Je voedings-stappenplan staat klaar",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
<h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
  Je voedings-stappenplan staat klaar
</h1>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px;">
  Goed dat je begint bij de basis. Na je 40e telt eiwit per maaltijd zwaarder dan het perfecte dieet.
</p>
<ul style="font-size: 15px; color: #555; line-height: 1.8; margin-bottom: 24px; padding-left: 20px;">
  <li>Deze week: eiwit bij elke maaltijd — concreet en haalbaar</li>
  <li>Week 2–4: korte voedingscheck voor inzicht in je patroon</li>
  <li>Supplementen pas als laatste stap</li>
</ul>
${ctaButton(absoluteUrl("/voeding-na-40"), "Start met je stappenplan →")}
<p style="font-size: 14px; color: #777; line-height: 1.6; margin-top: 24px;">
  <strong>P.S.</strong> Begin elke maaltijd met eiwit — vlees, vis, eieren, kwark of peulvruchten. Eén anker is genoeg om mee te starten.
</p>`,
        unsubscribeUrl,
        GUIDE_NAME,
      ),
  },
  3: {
    subject: "Stap 1: eiwit bij elke maaltijd",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
<h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
  Eén gewoonte, groot effect
</h1>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
  Veel mannen 40+ eten wel eiwit, maar niet verspreid over de dag. Richt op 20–30 g per maaltijd — dat ondersteunt herstel en spiermassa beter dan één grote portie 's avonds.
</p>
${ctaButton(absoluteUrl("/voeding-na-40"), "Lees het complete voedingsprotocol →")}`,
        unsubscribeUrl,
        GUIDE_NAME,
      ),
  },
  7: {
    subject: "Hoeveel eiwit krijg jij echt binnen?",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
<h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
  Meet eerst — gok daarna niet
</h1>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
  In 1 minuut schat je je inname van gisteren. Geen calorie-app nodig — wel een eerlijk beeld voordat je supplementeert.
</p>
${ctaButton(absoluteUrl("/intake/voeding"), "Doe de snelle voedingscheck →")}
<p style="font-size: 14px; color: #777; line-height: 1.6; margin-top: 24px;">
  <a href="${absoluteUrl("/intake")}" style="color: #3C7A56; text-decoration: underline;">Doe de volledige Leefstijlcheck</a> als je alle pijlers wilt vergelijken.
</p>`,
        unsubscribeUrl,
        GUIDE_NAME,
      ),
  },
  14: {
    subject: "Omega-3: wanneer voeding niet volstaat",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
<h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
  Eerst vette vis, dan vergelijken
</h1>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
  Eet je minder dan twee keer per week vette vis? Dan is omega-3 het meest logische supplementgesprek — pas als je basis op orde is.
</p>
${ctaButton(absoluteUrl("/supplementen/omega-3"), "Lees de omega-3 gids →")}
<p style="margin-top: 12px;">
  <a href="${absoluteUrl("/beste/omega-3-supplement")}" style="color: #3C7A56; font-weight: 600; font-size: 15px; text-decoration: underline;">
    Vergelijk omega-3 supplementen →
  </a>
</p>`,
        unsubscribeUrl,
        GUIDE_NAME,
      ),
  },
  21: {
    subject: "Voeding + beweging: het duo na 40",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
<h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
  Eiwit zonder beweging is half werk
</h1>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px;">
  Krachttraining geeft de prikkel; eiwit levert het bouwmateriaal. Check hoe je beweging en voeding samen staan — dat bepaalt of je vooruitgang ziet.
</p>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
  Herhaal over twee weken de voedingscheck — dan zie je of je inname beweegt sinds je startpunt.
</p>
${ctaButton(absoluteUrl("/intake/beweging"), "Doe de beweegcheck (1 min) →")}
<p style="margin-top: 12px;">
  <a href="${absoluteUrl("/intake/voeding")}" style="color: #3C7A56; font-weight: 600; font-size: 15px; text-decoration: underline;">
    Log opnieuw je voeding →
  </a>
</p>`,
        unsubscribeUrl,
        GUIDE_NAME,
      ),
  },
  30: {
    subject: "Hoe staat je voeding er nu voor?",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
<h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
  Tijd voor een nieuwe meting
</h1>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
  Na een maand is het zinvol om opnieuw te kijken: voeding, slaap, stress en beweging hangen samen. De Leefstijlcheck geeft je een actueel beeld in 3 minuten.
</p>
${ctaButton(absoluteUrl("/intake"), "Doe de gratis Leefstijlcheck →")}`,
        unsubscribeUrl,
        GUIDE_NAME,
      ),
  },
};
