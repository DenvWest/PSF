import { absoluteUrl } from "@/lib/public-site-url";
import { ctaButton, emailWrapper } from "@/lib/email-templates/guide-nurture/shared";
import type { GuideNurtureDay, GuideNurtureTemplate } from "@/lib/email-templates/guide-nurture/types";

const GUIDE_NAME = "Stressgids";

export const stressGuideTemplates: Record<GuideNurtureDay, GuideNurtureTemplate> = {
  0: {
    subject: "Je Stressgids staat klaar",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
<h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
  Je Stressgids staat klaar
</h1>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px;">
  Goed dat je de stap zet. Meer grip op stress begint met begrijpen wat er in je lichaam gebeurt.
</p>
<ul style="font-size: 15px; color: #555; line-height: 1.8; margin-bottom: 24px; padding-left: 20px;">
  <li>Praktische stappen om je stressrespons te kalmeren</li>
  <li>Welke lifestyle-factoren de grootste hefboom zijn</li>
  <li>Hoe supplementen passen bij stress — realistisch</li>
</ul>
${ctaButton(absoluteUrl("/downloads/stressgids-perfectsupplement.pdf"), "Download de Stressgids (PDF) →")}
<p style="font-size: 14px; color: #777; line-height: 1.6; margin-top: 24px;">
  <strong>P.S.</strong> Na een stressmoment 2 minuten langzaam uitademen. Klein ritueel, merkbaar effect.
</p>`,
        unsubscribeUrl,
        GUIDE_NAME,
      ),
  },
  3: {
    subject: "De #1 stressval die bijna elke drukke man maakt",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
<h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
  Doorduwen is geen herstel
</h1>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
  De grootste val: denken dat je "even door moet" tot het rustiger wordt. Je blijft dan gespannen — ook 's nachts kom je niet echt tot rust. Herstel begint met kleine pauzes, niet met harder werken.
</p>
${ctaButton(absoluteUrl("/stress-verminderen-na-40"), "Lees het complete stressprotocol →")}`,
        unsubscribeUrl,
        GUIDE_NAME,
      ),
  },
  7: {
    subject: "Ashwagandha bij stress — wat is realistisch?",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
<h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
  Supplementen bij stress: de nuance
</h1>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
  Ashwagandha wordt veel besproken bij stress — zonder erkende EU-claims. We leggen uit wat onderzoek wél en niet zegt, en wanneer magnesium een logischere eerste stap is.
</p>
${ctaButton(absoluteUrl("/beste/ashwagandha"), "Bekijk de ashwagandha vergelijking →")}`,
        unsubscribeUrl,
        GUIDE_NAME,
      ),
  },
  14: {
    subject: "Stress, slaap en energie — het hangt samen",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
<h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
  Stress raakt meer dan je humeur
</h1>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
  Chronische spanning verstoort slaap en energie. Pak je één domein aan, dan help je vaak de andere mee. Onze stressgids en pillar-pagina laten zien waar je begint.
</p>
${ctaButton(absoluteUrl("/supplementen/ashwagandha"), "Lees de ashwagandhagids →")}`,
        unsubscribeUrl,
        GUIDE_NAME,
      ),
  },
  21: {
    subject: "Halverwege: kleine stappen, groot verschil",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
<h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
  Je hoeft je leven niet om te gooien
</h1>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
  Mannen die merkbaar minder gespannen zijn, veranderen zelden alles tegelijk. Ze kiezen één anker — ademhaling, wandeling, vaste bedtijd — en houden die 3 weken vol.
</p>
${ctaButton(absoluteUrl("/stress-verminderen-na-40"), "Terug naar het stressprotocol →")}`,
        unsubscribeUrl,
        GUIDE_NAME,
      ),
  },
  30: {
    subject: "Hoe ervaar jij stress nu? Meet je voortgang",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
<h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
  Tijd voor een nieuwe meting
</h1>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
  Na een maand is het zinvol om opnieuw te kijken naar stress, slaap en energie. De Leefstijlcheck geeft je een actueel beeld — zonder diagnose, wel met concrete stappen.
</p>
${ctaButton(absoluteUrl("/intake"), "Doe de gratis Leefstijlcheck →")}`,
        unsubscribeUrl,
        GUIDE_NAME,
      ),
  },
};
