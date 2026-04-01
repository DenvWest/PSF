import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Ongeldig verzoek" }, { status: 400 });
  }

  const { name, email, message } = body as Record<string, unknown>;
  const nameStr = typeof name === "string" ? name.trim() : "";
  const emailStr = typeof email === "string" ? email.trim() : "";
  const messageStr = typeof message === "string" ? message.trim() : "";

  if (!nameStr) {
    return NextResponse.json({ error: "Naam is verplicht." }, { status: 400 });
  }
  if (!emailStr) {
    return NextResponse.json({ error: "E-mail is verplicht." }, { status: 400 });
  }
  if (!isValidEmail(emailStr)) {
    return NextResponse.json({ error: "Ongeldig e-mailadres." }, { status: 400 });
  }
  if (!messageStr) {
    return NextResponse.json({ error: "Bericht is verplicht." }, { status: 400 });
  }

  const smtpDisabled = process.env.CONTACT_SMTP_DISABLED === "true";

  if (smtpDisabled) {
    return NextResponse.json({ message: "Message successfully sent." }, { status: 200 });
  }

  const outbox = process.env.OUTBOX_EMAIL?.trim();
  const password = process.env.OUTBOX_EMAIL_PASSWORD;
  const inbox = process.env.INBOX_EMAIL?.trim();

  const placeholders =
    !outbox ||
    !password ||
    !inbox ||
    outbox.includes("youroutboxemail") ||
    password === "yourpassword" ||
    inbox.includes("yourinboxemail");

  if (placeholders) {
    return NextResponse.json(
      {
        error:
          "Mail is nog niet geconfigureerd. Vul echte waarden in .env.local in en zet CONTACT_SMTP_DISABLED=false.",
      },
      { status: 503 },
    );
  }

  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT ?? "587", 10);
  const secure = process.env.SMTP_SECURE === "true";

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user: outbox,
        pass: password,
      },
    });

    await transporter.sendMail({
      from: `"Perfect Supplement contact" <${outbox}>`,
      to: inbox,
      replyTo: emailStr,
      subject: `[Contact] ${nameStr}`,
      text: `Naam: ${nameStr}\nE-mail: ${emailStr}\n\n${messageStr}`,
      html: `<p><strong>Naam:</strong> ${escapeHtml(nameStr)}</p><p><strong>E-mail:</strong> ${escapeHtml(emailStr)}</p><p>${escapeHtml(messageStr).replace(/\n/g, "<br/>")}</p>`,
    });

    return NextResponse.json({ message: "Message successfully sent." }, { status: 200 });
  } catch (err) {
    console.error("[api/contact] nodemailer error:", err);
    return NextResponse.json(
      { error: "E-mail kon niet worden verzonden. Probeer het later opnieuw." },
      { status: 500 },
    );
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
