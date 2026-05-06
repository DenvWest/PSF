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
  const showSleepGuide =
    data.profileLabel === "Onrustige Slaper" || sleepScoreLowEnough;

  const stressScore = parseDomainScore(data.domainScores.stress_score);
  const stressScoreLowEnough = Number.isFinite(stressScore) && stressScore < 50;
  const showStressGuide =
    !showSleepGuide &&
    (data.profileLabel === "Stressdrager" || stressScoreLowEnough);

  const stressProfileUrl = absoluteUrl("/profiel/stressdrager");

  const mainRows =
    data.profileLabel === "Stressdrager"
      ? renderStressdragerDay0PersonalizedRows(intakeUrl)
      : renderPersonalizedRows(blocks, supplementTip, intakeUrl);

  const emailSubject =
    data.profileLabel === "Stressdrager"
      ? "Hoi, dit valt op in jouw resultaten"
      : subject;

  const inner =
    mainRows +
    (showSleepGuide ? buildSleepGuideBlock() : "") +
    (showStressGuide ? buildStressGuideBlock(stressProfileUrl) : "");

  return { subject: emailSubject, html: wrapNurtureBlock(inner, ctx, false) };
}
