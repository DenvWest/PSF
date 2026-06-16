import { Resend } from "resend";

type SendAccountLoginEmailParams = {
  email: string;
  code: string;
  verifyUrl: string;
};

type SendAccountLoginEmailResult = {
  ok: boolean;
  error?: string;
};

export async function sendAccountLoginEmail(
  params: SendAccountLoginEmailParams,
): Promise<SendAccountLoginEmailResult> {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.6;">
      <h1 style="font-size: 22px; margin-bottom: 12px;">Je inlogcode voor PerfectSupplement</h1>
      <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px; margin: 24px 0;">
        Je inlogcode: ${params.code} — 15 minuten geldig
      </p>
      <p>Vul deze code in op de site om in te loggen.</p>
      <p style="margin: 20px 0;">
        <a href="${params.verifyUrl}" style="display: inline-block; background: #5a8f6a; color: #fff; text-decoration: none; padding: 12px 18px; border-radius: 8px; font-weight: 600;">
          Of klik hier om in te loggen
        </a>
      </p>
      <p>Deze code is 15 minuten geldig en werkt een keer.</p>
      <p>Niet aangevraagd? Negeer deze mail.</p>
      <p style="font-size: 13px; color: #555; margin-top: 20px;">
        Werkt de knop niet? Plak dan deze link in je browser:<br />
        <a href="${params.verifyUrl}">${params.verifyUrl}</a>
      </p>
    </div>
  `;

  try {
    const { error: sendError } = await resend.emails.send({
      from: "PerfectSupplement <inloggen@mail.perfectsupplement.nl>",
      to: params.email,
      subject: "Je inlogcode voor PerfectSupplement",
      html,
    });

    if (sendError) {
      const errorMessage =
        typeof sendError === "object" &&
        sendError !== null &&
        "message" in sendError
          ? String((sendError as { message?: unknown }).message)
          : "Resend send failed";
      return { ok: false, error: errorMessage };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}
