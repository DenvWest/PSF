import type { NurtureEmailData, NurtureEmailDispatchContext } from "./types";
import { buildNurtureEmail } from "@/data/nurture-content";
import {
  buildIntakeHerstelplanUrl,
  renderPersonalizedRows,
  wrapNurtureBlock,
} from "./helpers";
import { absoluteUrl } from "@/lib/public-site-url";

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

  const showSleepGuide = data.profileLabel === "Onrustige Slaper";

  const inner =
    renderPersonalizedRows(blocks, supplementTip, intakeUrl) +
    (showSleepGuide ? buildSleepGuideBlock() : "");

  return { subject, html: wrapNurtureBlock(inner, ctx, false) };
}
