import { escapeHtml } from "@/lib/emails/shared";
import { isUsableFirstName } from "@/lib/intake-greetings";

export function emailWrapper(
  content: string,
  unsubscribeUrl: string,
  guideName: string,
): string {
  return `
    <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
      ${content}
      <hr style="border: none; border-top: 1px solid #e8e6e1; margin: 32px 0 16px;" />
      <p style="font-size: 12px; color: #999; line-height: 1.5;">
        Je ontvangt deze e-mail omdat je de ${guideName} hebt aangevraagd via PerfectSupplement.nl.<br />
        <a href="${unsubscribeUrl}" style="color: #999; text-decoration: underline;">Uitschrijven</a>
      </p>
    </div>
  `;
}

export function ctaButton(url: string, text: string): string {
  return `
    <a href="${url}" style="display: inline-block; background-color: #3C7A56; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
      ${text}
    </a>
  `;
}

export function personalizeGuideEmailHtml(
  html: string,
  firstName: string | null | undefined,
): string {
  if (!isUsableFirstName(firstName)) {
    return html;
  }

  const greeting = `<p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 16px;">Hoi ${escapeHtml(firstName!.trim())},</p>`;
  return html.replace(/(<h1\b)/i, `${greeting}$1`);
}
