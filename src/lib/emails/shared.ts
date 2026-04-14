export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const AFFILIATE_DISCLAIMER_NL = `Sommige links in deze e-mail zijn affiliate links: bij een aankoop via zo’n link kan PerfectSupplement een vergoeding ontvangen. Jouw prijs verandert daardoor niet.`;

export function nurtureFooterBlock(
  unsubscribeUrl: string,
  includeAffiliateDisclaimer: boolean,
): string {
  const disc = includeAffiliateDisclaimer
    ? `<p style="margin:0 0 12px 0;font-size:12px;line-height:1.5;color:#777777;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">${AFFILIATE_DISCLAIMER_NL}</p>`
    : "";

  return `
 <tr>
            <td style="padding:0 28px 24px 28px;border-top:1px solid #eeeeee;">
              ${disc}
              <p style="margin:20px 0 12px 0;font-size:13px;line-height:1.5;color:#666666;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                © 2026 PerfectSupplement · Informatief, geen medisch advies.
              </p>
              <p style="margin:0;font-size:11px;line-height:1.4;color:#999999;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                Je ontvangt deze mail omdat je toestemming gaf bij de intake.
                <a href="${escapeHtml(unsubscribeUrl)}" style="color:#666666;">Uitschrijven</a>
              </p>
            </td>
          </tr>`;
}

export function nurtureCtaButton(href: string, label: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:8px;">
                <tr>
                  <td style="border-radius:10px;background-color:#1a1a1a;">
                    <a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 24px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                      ${escapeHtml(label)}
                    </a>
                  </td>
                </tr>
              </table>`;
}

export function nurtureEmailWrap(
  bodyInnerRows: string,
  unsubscribeUrl: string,
  includeAffiliateDisclaimer: boolean,
): string {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />
</head>
<body style="margin:0;padding:0;background-color:#FAFAF7;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#FAFAF7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
          <tr>
            <td style="padding:32px 28px 8px 28px;">
              <p style="margin:0;font-family:'DM Serif Display',Georgia,serif;font-size:22px;line-height:1.2;color:#1a1a1a;letter-spacing:-0.02em;">
                PerfectSupplement
              </p>
            </td>
          </tr>
          ${bodyInnerRows}
          ${nurtureFooterBlock(unsubscribeUrl, includeAffiliateDisclaimer)}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
