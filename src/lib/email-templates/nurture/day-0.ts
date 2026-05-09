import type { NurtureEmailData, NurtureEmailDispatchContext } from "./types";
import { buildNurtureEmail } from "@/data/nurture-content";
import {
  buildIntakeHerstelplanUrl,
  escapeHtml,
  nurtureCtaButton,
  renderPersonalizedRows,
  wrapNurtureBlock,
} from "./helpers";
import { absoluteUrl } from "@/lib/public-site-url";

function parseDomainScore(raw: unknown): number {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const n = Number.parseFloat(raw);
    return Number.isFinite(n) ? n : Number.NaN;
  }
  return Number.NaN;
}

function buildPdfGuideSignatureHtml(
  psBodyPlainText: string,
  greetingTopMarginPx: number,
): string {
  const mTop = greetingTopMarginPx;
  return `
            <p style="margin: ${mTop}px 0 4px; font-size: 15px; line-height: 1.6; color: #333333;">
              Groet,
            </p>
            <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #333333;">
              Dennis van Westbroek<br />
              <span style="font-size: 14px; color: #707070;">PerfectSupplement</span>
            </p>
            <p style="margin: 0; font-size: 14px; line-height: 1.65; color: #555555;">
              <strong>P.S.</strong> ${escapeHtml(psBodyPlainText)}
            </p>`;
}

const SLEEP_GUIDE_PS =
  "— Begin met één ding deze week. Vaste bedtijd is het meest onderschat — niet sexy, wel effectief.";

const STRESS_GUIDE_PS =
  "Eén ding dat je deze week nog kunt proberen: vijf minuten uitademen gericht uitvoeren vóór je je werkmail opent — het is klein, maar je zenuwstelsel merkt het verschil.";

const ENERGY_GUIDE_PS =
  "Begin deze week klein met één ding: stabiel eiwit bij het eerste moment van eten na opstaan — dat helpt vaak meer dan nog een kop koffie.";

const RECOVERY_GUIDE_PS =
  "Plan vandaag welke twee harde blokken deze week wél plaatsmaken voor licht werk en meer slaap dat levert meer op dan nog een kop sterke espresso.";

function buildStressGuideBlock(stressProfileUrl: string): string {
  const pdfUrl = absoluteUrl("/downloads/stressgids-perfectsupplement.pdf");
  const profileEsc = escapeHtml(stressProfileUrl);
  return `
        <tr>
          <td style="padding: 24px 28px; border-top: 1px solid #E7E5E4;">
            <p style="margin: 0 0 12px; font-size: 16px; color: #333333; line-height: 1.6;">
              Ik heb een gids voor je samengesteld die past bij jouw profiel:
            </p>
            <p style="margin: 0 0 12px;">
              <a href="${pdfUrl}"
                 style="font-size: 16px; font-weight: 600; color: #2d4a3e; text-decoration: underline;">
                📄 De Stressgids voor mannen 40+ →
              </a>
            </p>
            <p style="margin: 0 0 16px; font-size: 14px; color: #404040; line-height: 1.6;">
              Geen verkooppraat. Vier pijlers, een 4-weken plan, en eerlijke informatie over wanneer je beter een professional inschakelt.
            </p>
            <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #333333;">
              Wil je je profiel verder verkennen?
              <a href="${profileEsc}" style="color:#2d4a3e; font-weight:600;">
                Bekijk hier wat het Stressdrager-profiel inhoudt
              </a>.
            </p>
            ${buildPdfGuideSignatureHtml(STRESS_GUIDE_PS, 0)}
          </td>
        </tr>`;
}

function buildSleepGuideBlock(): string {
  const pdfUrl = absoluteUrl("/downloads/slaapgids-perfectsupplement.pdf");
  return `
        <tr>
          <td style="padding: 24px 28px; border-top: 1px solid #E7E5E4;">
            <p style="margin: 0 0 8px; font-size: 12px; font-weight: 600; color: #4A7C28; text-transform: uppercase; letter-spacing: 0.05em;">
              GRATIS SLAAPGIDS
            </p>
            <p style="margin: 0 0 12px; font-size: 18px; font-weight: 700; color: #171717;">
              Je persoonlijke slaapgids staat klaar
            </p>
            <p style="margin: 0 0 16px; font-size: 14px; color: #404040; line-height: 1.6;">
              Op basis van je Leefstijlcheck zien we dat slaap een aandachtspunt is.
              We hebben een complete gids voor je klaargezet met een 7-dagen protocol,
              doseerschema's en de fouten die je slaap saboteren.
            </p>
            <a href="${pdfUrl}"
               style="display: inline-block; padding: 12px 24px; background-color: #2D5016; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">
              Download de Slaapgids (PDF) →
            </a>
            ${buildPdfGuideSignatureHtml(SLEEP_GUIDE_PS, 24)}
          </td>
        </tr>`;
}

function buildEnergyGuideBlock(profileUrl: string): string {
  const pdfUrl = absoluteUrl("/downloads/energiegids-perfectsupplement.pdf");
  const profileEsc = escapeHtml(profileUrl);
  return `
        <tr>
          <td style="padding: 24px 28px; border-top: 1px solid #E7E5E4;">
            <p style="margin: 0 0 12px; font-size: 12px; font-weight: 600; color: #4A7C28; text-transform: uppercase; letter-spacing: 0.05em;">
              GRATIS ENERGIEGIDS
            </p>
            <p style="margin: 0 0 12px; font-size: 18px; font-weight: 700; color: #171717;">
              Je Energiegids staat voor je klaar
            </p>
            <p style="margin: 0 0 16px;">
              <a href="${pdfUrl}"
                 style="font-size: 16px; font-weight: 600; color: #2d4a3e; text-decoration: underline;">
                Download je gratis Energiegids →
              </a>
            </p>
            <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.65; color: #333333;">
              Als <strong>Lage Batterij</strong> is je energiehuishouding je belangrijkste aandachtspunt. In je Energiegids vind je concrete stappen — van voeding
              en bloedsuiker tot de supplementen die het meest evidence-based zijn.
            </p>
            <p style="margin: 0 0 24px; font-size: 14px; color: #404040; line-height: 1.6;">
              Wil je je profiel verder verdiepen?
              <a href="${profileEsc}" style="color:#2d4a3e; font-weight:600;">
                Bekijk hier wat het Lage Batterij-profiel inhoudt
              </a>.
            </p>
            ${buildPdfGuideSignatureHtml(ENERGY_GUIDE_PS, 0)}
          </td>
        </tr>`;
}

function buildRecoveryGuideBlock(
  deepDiveUrl: string,
  deepDiveAnchorText: string,
): string {
  const pdfUrl = absoluteUrl("/downloads/herstelgids-perfectsupplement.pdf");
  const deepEsc = escapeHtml(deepDiveUrl);
  const anchorEsc = escapeHtml(deepDiveAnchorText);
  return `
        <tr>
          <td style="padding: 24px 28px; border-top: 1px solid #E7E5E4;">
            <p style="margin: 0 0 8px; font-size: 12px; font-weight: 600; color: #4A7C28; text-transform: uppercase; letter-spacing: 0.05em;">
              GRATIS HERSTELGIDS
            </p>
            <p style="margin: 0 0 12px; font-size: 18px; font-weight: 700; color: #171717;">
              Je Herstelgids staat voor je klaar
            </p>
            <p style="margin: 0 0 16px;">
              <a href="${pdfUrl}"
                 style="font-size: 16px; font-weight: 600; color: #2d4a3e; text-decoration: underline;">
                Download je gratis Herstelgids (PDF) →
              </a>
            </p>
            <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.65; color: #333333;">
              Op basis van je Leefstijlcheck zien we dat herstel en herstelruimte een aandachtspunt zijn. In de gids vind je een 7-dagen protocol,
              doseerschema's voor magnesium, omega-3, creatine en zink, en de grootste fouten die mannen 40+ maken.
            </p>
            <p style="margin: 0 0 24px; font-size: 14px; color: #404040; line-height: 1.6;">
              Wil je verder lezen?
              <a href="${deepEsc}" style="color:#2d4a3e; font-weight:600;">
                ${anchorEsc}
              </a>.
            </p>
            ${buildPdfGuideSignatureHtml(RECOVERY_GUIDE_PS, 0)}
          </td>
        </tr>`;
}

function renderStressdragerDay0PersonalizedRows(intakeUrl: string): string {
  const headline =
    "Hoi, dit valt op in jouw resultaten";
  const breathingTip =
    "Eén ding voor deze week: adem elke dag 5 minuten bewust uit (4 seconden in, 6 seconden uit). Het kalmeert je nervus vagus direct. Doe het ’s ochtends voor je je telefoon pakt.";
  return `
        <tr>
          <td style="padding:8px 28px 16px 28px;">
            <h1 style="margin:0;font-family:'DM Serif Display',Georgia,serif;font-size:22px;line-height:1.25;color:#1a1a1a;font-weight:400;">
              ${escapeHtml(headline)}
            </h1>
          </td>
        </tr>
        <tr>
          <td style="padding:0 28px 28px 28px;">
            <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;color:#333333;">
              Ik zie dat stress een grote rol speelt in jouw resultaten. Dat is geen oordeel — het is een patroon dat veel mannen na 40 herkennen, vaak zonder het zelf door te hebben.
            </p>
            <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;color:#333333;">
              Je profiel is <strong>Stressdrager</strong>. Dat betekent niet dat je een burn-out hebt. Het betekent dat je zenuwstelsel langer ’aan’ staat dan goed voor je is — en dat je dat zelf vaak niet meer voelt.
            </p>
            <div style="background:#f5f5f0;border-left:3px solid #2d4a3e;padding:14px 18px;margin:18px 0;border-radius:0 4px 4px 0;">
              <p style="margin:0;font-size:15px;line-height:1.6;color:#1a1a1a;">${escapeHtml(breathingTip)}</p>
            </div>
            ${nurtureCtaButton(intakeUrl, "Bekijk je Herstelplan")}
          </td>
        </tr>`;
}

function renderRecoveryLeadDay0PersonalizedRows(
  intakeUrl: string,
  isOvertrainerVoice: boolean,
): string {
  const headline = "Je lichaam vraagt om meer rust — dit zien we in je scores";
  const opener = isOvertrainerVoice
    ? "Je profiel is <strong>Overtrainer</strong>: veel belasting, te weinig buffer om weer op peil te komen. Dat zegt niets over je karakter — veel mannen 40+ lopen zo vast tussen ambitie en fysieke rek."
    : "Je herstelsignaal in de Leefstijlcheck valt op: vaak veel trainen of weinig echte ontspanning. Daar past deze recovery-mail bij, ook als je andere domeinen hoger scoorden.";
  const tip =
    "Kies deze week twee geplande zware sessies en maak ze echt licht óf ruim ze op. Vervang ze door 30–40 minuten wandelen zonder stopwatchstress en ga een halfuur eerder naar bed twee avonden op rij klein, maar je systeem merkt het.";
  return `
        <tr>
          <td style="padding:8px 28px 16px 28px;">
            <h1 style="margin:0;font-family:'DM Serif Display',Georgia,serif;font-size:22px;line-height:1.25;color:#1a1a1a;font-weight:400;">
              ${escapeHtml(headline)}
            </h1>
          </td>
        </tr>
        <tr>
          <td style="padding:0 28px 28px 28px;">
            <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;color:#333333;">
              ${opener}
            </p>
            <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;color:#333333;">
              Geen oordeel — je wilt vooruit. Na 40 wordt het verschil tussen trainingsdruk en echte rust eerder zichtbaar; supplementen komen pas nadat volume en slaap eerlijk zijn tegen het licht gehouden.
            </p>
            <div style="background:#f5f5f0;border-left:3px solid #2d4a3e;padding:14px 18px;margin:18px 0;border-radius:0 4px 4px 0;">
              <p style="margin:0;font-size:15px;line-height:1.6;color:#1a1a1a;">${escapeHtml(tip)}</p>
            </div>
            ${nurtureCtaButton(intakeUrl, "Bekijk je Herstelplan")}
          </td>
        </tr>`;
}

export function nurtureDay0Email(
  data: NurtureEmailData,
  ctx: NurtureEmailDispatchContext,
): { subject: string; html: string } {
  const intakeUrl = buildIntakeHerstelplanUrl(ctx.sessionId ?? null);

  const { subject, blocks, supplementTip } = buildNurtureEmail(
    0,
    data.profileLabel,
    data.domainScores,
    data.urgencyLevel ?? "moderate",
  );

  const sleepScore = parseDomainScore(data.domainScores.sleep_score);
  const sleepScoreLowEnough = Number.isFinite(sleepScore) && sleepScore < 50;

  const stressScore = parseDomainScore(data.domainScores.stress_score);
  const stressScoreLowEnough = Number.isFinite(stressScore) && stressScore < 50;

  const energyScore = parseDomainScore(data.domainScores.energy_score);
  const energyScoreLowEnough =
    Number.isFinite(energyScore) && energyScore < 50;

  const recoveryScore = parseDomainScore(data.domainScores.recovery_score);
  const movementScore = parseDomainScore(data.domainScores.movement_score);
  const isOvertrainerPatternScores =
    Number.isFinite(movementScore) &&
    Number.isFinite(recoveryScore) &&
    movementScore >= 43 &&
    recoveryScore <= 35;

  const isOvertrainerVoice =
    data.profileLabel === "Overtrainer" || isOvertrainerPatternScores;

  const showSleepGuide =
    data.profileLabel === "Onrustige Slaper" || sleepScoreLowEnough;

  const showStressGuide =
    !showSleepGuide &&
    (data.profileLabel === "Stressdrager" || stressScoreLowEnough);

  const showEnergyGuide =
    !showSleepGuide &&
    !showStressGuide &&
    (data.profileLabel === "Lage Batterij" || energyScoreLowEnough);

  const showRecoveryGuide =
    !showSleepGuide &&
    !showStressGuide &&
    !showEnergyGuide &&
    (data.profileLabel === "Overtrainer" ||
      data.profileLabel === "Stille Slijter" ||
      (Number.isFinite(recoveryScore) && recoveryScore < 50) ||
      isOvertrainerPatternScores);

  const stressProfileFirst = data.profileLabel === "Stressdrager";

  const stressProfileUrl = absoluteUrl("/profiel/stressdrager");
  const energyProfileUrl = absoluteUrl("/profiel/lage-batterij");
  const overtrainerProfileUrl = absoluteUrl("/profiel/overtrainer");
  const herstelThemaUrl = absoluteUrl("/thema/herstel");

  const mainRows = stressProfileFirst
    ? renderStressdragerDay0PersonalizedRows(intakeUrl)
    : showRecoveryGuide
      ? renderRecoveryLeadDay0PersonalizedRows(intakeUrl, isOvertrainerVoice)
      : renderPersonalizedRows(blocks, supplementTip, intakeUrl);

  let emailSubject: string;
  if (stressProfileFirst) emailSubject = "Hoi, dit valt op in jouw resultaten";
  else if (showRecoveryGuide) emailSubject = "Je recovery vraagt nu je aandacht";
  else emailSubject = subject;

  const recoveryDeepDiveUrl = isOvertrainerVoice
    ? overtrainerProfileUrl
    : herstelThemaUrl;
  const recoveryDeepDiveAnchor = isOvertrainerVoice
    ? "Bekijk hier wat het Overtrainer-profiel inhoudt"
    : "Lees verder op het herstelthema";

  const inner =
    mainRows +
    (showRecoveryGuide
      ? buildRecoveryGuideBlock(recoveryDeepDiveUrl, recoveryDeepDiveAnchor)
      : "") +
    (showSleepGuide ? buildSleepGuideBlock() : "") +
    (showStressGuide ? buildStressGuideBlock(stressProfileUrl) : "") +
    (showEnergyGuide ? buildEnergyGuideBlock(energyProfileUrl) : "");

  return { subject: emailSubject, html: wrapNurtureBlock(inner, ctx, false) };
}
