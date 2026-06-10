import type { NurtureEmailData, NurtureEmailDispatchContext } from "./types";
import type { ResolvedNurtureCta } from "@/lib/resolve-nurture-cta";
import { lifestyleCtaForProfile } from "@/lib/resolve-nurture-cta";
import { resolveNurtureProfileKey } from "@/data/nurture-content";
import {
  resolveIntakeRecoveryUrl,
  escapeHtml,
  renderDay0MainRows,
  normalizeDomainId,
  wrapNurtureBlock,
} from "./helpers";
import { absoluteUrl } from "@/lib/public-site-url";

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
              team PerfectSupplement
            </p>
            <p style="margin: 0; font-size: 14px; line-height: 1.65; color: #555555;">
              <strong>P.S.</strong> ${escapeHtml(psBodyPlainText)}
            </p>`;
}

const SLEEP_GUIDE_PS =
  "— Begin met één ding deze week. Vaste bedtijd is het meest onderschat — niet sexy, wel effectief.";

const STRESS_GUIDE_PS =
  "Eén ding dat je deze week nog kunt proberen: vijf minuten gericht uitademen vóór je je werkmail opent — het is klein, maar je merkt het verschil.";

const ENERGY_GUIDE_PS =
  "Begin deze week klein met één ding: stabiel eiwit bij het eerste moment van eten na opstaan — dat helpt vaak meer dan nog een kop koffie.";

const RECOVERY_GUIDE_PS =
  "Plan vandaag welke twee harde blokken deze week wél plaatsmaken voor licht werk en meer slaap dat levert meer op dan nog een kop sterke espresso.";

function buildStressGuideBlock(): string {
  const pdfUrl = absoluteUrl("/downloads/stressgids-perfectsupplement.pdf");
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
            <p style="margin: 0 0 16px;">
              <a href="${pdfUrl}"
                 style="font-size: 16px; font-weight: 600; color: #2d4a3e; text-decoration: underline;">
                Download de Slaapgids (PDF) →
              </a>
            </p>
            ${buildPdfGuideSignatureHtml(SLEEP_GUIDE_PS, 0)}
          </td>
        </tr>`;
}

function buildEnergyGuideBlock(): string {
  const pdfUrl = absoluteUrl("/downloads/energiegids-perfectsupplement.pdf");
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
            ${buildPdfGuideSignatureHtml(ENERGY_GUIDE_PS, 0)}
          </td>
        </tr>`;
}

function buildRecoveryGuideBlock(): string {
  const pdfUrl = absoluteUrl("/downloads/herstelgids-perfectsupplement.pdf");
  const herstelUrl = escapeHtml(absoluteUrl("/gids/herstel"));
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
              <a href="${herstelUrl}" style="color:#2d4a3e; font-weight:600;">
                Lees verder op het herstelthema
              </a>.
            </p>
            ${buildPdfGuideSignatureHtml(RECOVERY_GUIDE_PS, 0)}
          </td>
        </tr>`;
}

export function nurtureDay0Email(
  data: NurtureEmailData,
  ctx: NurtureEmailDispatchContext,
): { subject: string; html: string; resolvedCta: ResolvedNurtureCta } {
  const intakeUrl = resolveIntakeRecoveryUrl(ctx);
  const domain = normalizeDomainId(data.primaryDomain);

  const mainRows = renderDay0MainRows({
    primaryDomain: data.primaryDomain,
    intakeUrl,
    firstName: data.firstName,
  });

  const guideBlock =
    domain === "sleep"
      ? buildSleepGuideBlock()
      : domain === "stress"
        ? buildStressGuideBlock()
        : domain === "energy"
          ? buildEnergyGuideBlock()
          : domain === "recovery"
            ? buildRecoveryGuideBlock()
            : "";

  const inner = mainRows + guideBlock;

  const profileKey = resolveNurtureProfileKey(data.profileLabel, data.domainScores);
  return {
    subject: "Dit valt op in jouw resultaten",
    html: wrapNurtureBlock(inner, ctx, false),
    resolvedCta: lifestyleCtaForProfile(profileKey),
  };
}
