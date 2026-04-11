export function getReminderEmailHtml(): string {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />
  <title>Tijd voor je voortgangscheck</title>
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
          <tr>
            <td style="padding:8px 28px 16px 28px;">
              <h1 style="margin:0;font-family:'DM Serif Display',Georgia,serif;font-size:24px;line-height:1.25;color:#1a1a1a;font-weight:400;">
                Tijd voor je voortgangscheck
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px 28px;">
              <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#333333;">
                30 dagen geleden heb je je eerste meting gedaan.<br />
                Ben je benieuwd wat er veranderd is? Doe de intake opnieuw en vergelijk je scores.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:8px;">
                <tr>
                  <td style="border-radius:10px;background-color:#1a1a1a;">
                    <a href="https://perfectsupplement.nl/intake" style="display:inline-block;padding:14px 24px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                      Naar de intake
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 24px 28px;border-top:1px solid #eeeeee;">
              <p style="margin:20px 0 12px 0;font-size:13px;line-height:1.5;color:#666666;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                Dit is een eenmalige herinnering. Je ontvangt geen verdere e-mails.
              </p>
              <p style="margin:0;font-size:11px;line-height:1.4;color:#999999;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                © 2026 PerfectSupplement
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
