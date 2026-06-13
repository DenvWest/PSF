import { absoluteUrl } from "@/lib/public-site-url";
import { ctaButton, emailWrapper } from "@/lib/email-templates/guide-nurture/shared";
import type { GuideNurtureDay, GuideNurtureTemplate } from "@/lib/email-templates/guide-nurture/types";

const GUIDE_NAME = "Slaapgids";

export const slaapGuideTemplates: Record<GuideNurtureDay, GuideNurtureTemplate> = {
  0: {
    subject: "Je Slaapgids staat klaar",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
<h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
  Je Slaapgids staat klaar
</h1>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px;">
  Goed dat je de stap zet. Beter slapen begint met begrijpen wat er verandert — en daar helpt deze gids bij.
</p>
<ul style="font-size: 15px; color: #555; line-height: 1.8; margin-bottom: 24px; padding-left: 20px;">
  <li>Een 7-dagen protocol dat je vanavond al kunt starten</li>
  <li>Welke supplementen wél en niet werken (met doseringen)</li>
  <li>De #1 fout die de meeste mannen maken met slaap</li>
</ul>
${ctaButton(absoluteUrl("/downloads/slaapgids-perfectsupplement.pdf"), "Download de Slaapgids (PDF) →")}
<p style="font-size: 14px; color: #777; line-height: 1.6; margin-top: 24px;">
  <strong>P.S.</strong> Dim het licht vanaf 21:00 en zet je telefoon op vliegtuigmodus. Klein, maar merkbaar.
</p>`,
        unsubscribeUrl,
        GUIDE_NAME,
      ),
  },
  3: {
    subject: "De #1 slaapfout die bijna iedereen maakt",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
<h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
  Je slaapritme is belangrijker dan de hoeveelheid slaap
</h1>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px;">
  Veel mannen proberen "8 uur te halen" — maar een vast ritme (ook in het weekend) heeft meer impact dan een uur extra liggen.
</p>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
  Op onze slaappagina leggen we uit hoe je dit ritme opbouwt — stap voor stap.
</p>
${ctaButton(absoluteUrl("/slaap-verbeteren-na-40"), "Lees het complete slaapprotocol →")}
<p style="font-size: 14px; color: #777; line-height: 1.6; margin-top: 24px;">
  <a href="${absoluteUrl("/intake/plan/sleep")}" style="color: #3C7A56; text-decoration: underline;">Wil je stappen afvinken? Open je slaapplan →</a>
</p>`,
        unsubscribeUrl,
        GUIDE_NAME,
      ),
  },
  7: {
    subject: "Magnesium of melatonine — wat past bij jou?",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
<h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
  Magnesium of melatonine?
</h1>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px;">
  Magnesium glycinaat past bij ontspanning en gespannen spieren. Melatonine past vooral bij moeite met inslapen.
</p>
${ctaButton(absoluteUrl("/beste/magnesium"), "Bekijk de magnesium vergelijking →")}
<p style="margin-top: 12px;">
  <a href="${absoluteUrl("/supplementen/melatonine")}" style="color: #3C7A56; font-weight: 600; font-size: 15px; text-decoration: underline;">
    Lees de melatonine-gids (informatief) →
  </a>
</p>
<p style="font-size: 14px; color: #777; line-height: 1.6; margin-top: 24px;">
  <a href="${absoluteUrl("/intake")}" style="color: #3C7A56; text-decoration: underline;">Doe de gratis Leefstijlcheck</a> — in 3 minuten weet je waar je staat.
</p>`,
        unsubscribeUrl,
        GUIDE_NAME,
      ),
  },
  14: {
    subject: "3 gewoontes die je slaap saboteren (zonder dat je het merkt)",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
<h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
  3 gewoontes die je slaap saboteren
</h1>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 12px;">
  1. Inhalen in het weekend<br />
  2. Schermen tot vlak voor bed<br />
  3. Koffie na 14:00 "om door te zetten"
</p>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
  In de gids en op onze pillar-pagina vind je alternatieven die wél passen bij een druk schema.
</p>
${ctaButton(absoluteUrl("/supplementen/magnesium"), "Lees de magnesiumgids →")}`,
        unsubscribeUrl,
        GUIDE_NAME,
      ),
  },
  21: {
    subject: "Je bent halverwege — dit is het moment om vol te houden",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
<h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
  Volhouden loont
</h1>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
  Slaap verbetert zelden in één nacht. De mannen die het grootste verschil merken, zijn consequent met ritme en avondafsluiting — niet perfect, wel structureel.
</p>
${ctaButton(absoluteUrl("/slaap-verbeteren-na-40"), "Terug naar het complete slaapprotocol →")}`,
        unsubscribeUrl,
        GUIDE_NAME,
      ),
  },
  30: {
    subject: "Hoe gaat het met je slaap? Meet je voortgang",
    html: (unsubscribeUrl) =>
      emailWrapper(
        `
<h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">
  Tijd om te meten wat er veranderd is
</h1>
<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 24px;">
  Na een maand is het zinvol om opnieuw te kijken: slaap, stress, energie en herstel hangen samen. De Leefstijlcheck geeft je een actueel beeld in 3 minuten.
</p>
${ctaButton(absoluteUrl("/intake"), "Doe de gratis Leefstijlcheck →")}`,
        unsubscribeUrl,
        GUIDE_NAME,
      ),
  },
};
