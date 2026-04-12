import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { buildZohoTags } from "@/lib/contact-segmentation-tags";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getClientIp, verifyTurnstileToken } from "@/lib/turnstile-verify";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /(https?:\/\/|www\.)/i;
const CONTROL_CHARS_REGEX = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const TURNSTILE_ACTION = "contact_submit";
const SUCCESS_MESSAGE = "Message successfully sent.";
const CONTACT_RATE_LIMIT = {
  limit: 5,
  windowMs: 10 * 60 * 1000,
} as const;
const MAX_EMAIL_LENGTH = 254;
const MAX_NAME_LENGTH = 80;
const MAX_MESSAGE_LENGTH = 2000;
const MIN_MESSAGE_LENGTH = 10;

type ZohoTokenConfig = {
  accountsDomain: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
};

type ZohoCreateResponse = {
  data?: Array<{
    code?: string;
    details?: Record<string, unknown>;
    message?: string;
    status?: string;
  }>;
};

type SmtpConfig = {
  host: string;
  inbox: string;
  outbox: string;
  password: string;
  port: number;
  secure: boolean;
};

type ContactPayload = {
  email: string;
  message: string;
  name: string;
  turnstileToken: string;
  website: string;
};

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

function normalizeSingleLine(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim();
}

function normalizeMultiline(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\r\n/g, "\n").trim();
}

function containsControlChars(value: string): boolean {
  return CONTROL_CHARS_REGEX.test(value);
}

function parseContactPayload(body: Record<string, unknown>): ContactPayload {
  return {
    name: normalizeSingleLine(body.name),
    email: normalizeSingleLine(body.email),
    message: normalizeMultiline(body.message),
    turnstileToken: normalizeSingleLine(body.turnstileToken),
    website: normalizeSingleLine(body.website),
  };
}

function validateContactPayload(payload: ContactPayload): string | null {
  if (!payload.name) {
    return "Naam is verplicht.";
  }
  if (payload.name.length > MAX_NAME_LENGTH) {
    return "Naam is te lang.";
  }
  if (URL_REGEX.test(payload.name)) {
    return "Gebruik geen links in het naamveld.";
  }
  if (containsControlChars(payload.name)) {
    return "Naam bevat ongeldige tekens.";
  }

  if (!payload.email) {
    return "E-mail is verplicht.";
  }
  if (payload.email.length > MAX_EMAIL_LENGTH) {
    return "E-mailadres is te lang.";
  }
  if (!isValidEmail(payload.email)) {
    return "Ongeldig e-mailadres.";
  }

  if (!payload.message) {
    return "Bericht is verplicht.";
  }
  if (payload.message.length < MIN_MESSAGE_LENGTH) {
    return "Bericht is te kort.";
  }
  if (payload.message.length > MAX_MESSAGE_LENGTH) {
    return "Bericht is te lang.";
  }
  if (containsControlChars(payload.message)) {
    return "Bericht bevat ongeldige tekens.";
  }

  if (!payload.turnstileToken) {
    return "Bevestig eerst dat je geen bot bent.";
  }

  return null;
}

function logSecurityEvent(
  event: string,
  details: Record<string, unknown> = {},
) {
  console.warn("[api/contact][security]", { event, ...details });
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const rateLimit = consumeRateLimit(`contact:${clientIp}`, CONTACT_RATE_LIMIT);

  if (!rateLimit.allowed) {
    logSecurityEvent("rate_limited", { remoteIp: clientIp });
    return NextResponse.json(
      { error: "Te veel pogingen. Probeer het over een paar minuten opnieuw." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Ongeldig verzoek" }, { status: 400 });
  }

  const bodyRecord = body as Record<string, unknown>;
  const payload = parseContactPayload(bodyRecord);

  if (payload.website) {
    logSecurityEvent("honeypot_hit", { remoteIp: clientIp });
    return NextResponse.json({ message: SUCCESS_MESSAGE }, { status: 200 });
  }

  const validationError = validateContactPayload(payload);
  if (validationError) {
    logSecurityEvent("input_invalid", {
      message: validationError,
      remoteIp: clientIp,
    });
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const turnstileCheck = await verifyTurnstileToken({
    token: payload.turnstileToken,
    remoteIp: clientIp,
    expectedAction: TURNSTILE_ACTION,
    logContext: "api/contact",
  });

  if (!turnstileCheck.ok) {
    if (turnstileCheck.reason === "config") {
      return NextResponse.json(
        { error: "Human verification is nog niet geconfigureerd op de server." },
        { status: 503 },
      );
    }

    if (turnstileCheck.reason === "unavailable") {
      return NextResponse.json(
        { error: "Verificatie kon niet worden voltooid. Probeer het opnieuw." },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { error: "De human verification is mislukt. Probeer het opnieuw." },
      { status: 403 },
    );
  }

  const { name, email, message } = payload;
  const contactDisabled = process.env.CONTACT_SMTP_DISABLED === "true";

  if (contactDisabled) {
    return NextResponse.json({ message: SUCCESS_MESSAGE }, { status: 200 });
  }

  const clientId = process.env.ZOHO_CLIENT_ID?.trim();
  const clientSecret = process.env.ZOHO_CLIENT_SECRET?.trim();
  const refreshToken = process.env.ZOHO_REFRESH_TOKEN?.trim();
  const accountsDomain = process.env.ZOHO_ACCOUNTS_DOMAIN?.trim() || "https://accounts.zoho.eu";
  const apiDomain = process.env.ZOHO_API_DOMAIN?.trim() || "https://www.zohoapis.eu";
  const moduleName = process.env.ZOHO_CRM_MODULE?.trim() || "Leads";
  const smtpConfig = getSmtpConfig();
  const zohoConfig: ZohoTokenConfig | null =
    clientId && clientSecret && refreshToken
      ? {
        clientId,
        clientSecret,
        refreshToken,
        accountsDomain,
      }
      : null;

  if (!zohoConfig && !smtpConfig) {
    return NextResponse.json(
      {
        error:
          "Contact is nog niet geconfigureerd. Vul Zoho CRM-gegevens of SMTP-gegevens in op de server.",
      },
      { status: 503 },
    );
  }

  if (zohoConfig) {
    try {
      const accessToken = await getZohoAccessToken(zohoConfig);

      const zohoResponse = await fetch(`${apiDomain}/crm/v2/${moduleName}`, {
        method: "POST",
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: [
            {
              Last_Name: name,
              Email: email,
              Description: message,
              Lead_Source: "Website Contact Form",
            },
          ],
        }),
        cache: "no-store",
      });

      const zohoJson = (await zohoResponse.json().catch(() => null)) as ZohoCreateResponse | null;

      if (!zohoResponse.ok || zohoJson?.data?.[0]?.status !== "success") {
        console.error("[api/contact] zoho create error:", zohoJson);
        return NextResponse.json(
          { error: getZohoErrorMessage(zohoJson) },
          { status: zohoResponse.ok ? 502 : zohoResponse.status },
        );
      }

      const contactId = zohoJson?.data?.[0]?.details?.id as string | undefined;
      if (contactId) {
        try {
          await attachZohoTags({
            accessToken,
            apiDomain,
            moduleName,
            contactId,
            body: bodyRecord,
          });
        } catch (tagErr) {
          console.warn("[api/contact] zoho tag error (non-fatal):", tagErr);
        }
      }

      return NextResponse.json({ message: SUCCESS_MESSAGE }, { status: 200 });
    } catch (err) {
      console.error("[api/contact] zoho error:", err);
    }
  }

  if (!smtpConfig) {
    return NextResponse.json(
      { error: "Bericht kon niet naar Zoho CRM worden verzonden. Probeer het later opnieuw." },
      { status: 500 },
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.outbox,
        pass: smtpConfig.password,
      },
    });

    await transporter.sendMail({
      from: `"Perfect Supplement contact" <${smtpConfig.outbox}>`,
      to: smtpConfig.inbox,
      replyTo: email,
      subject: `[Contact] ${name}`,
      text: `Naam: ${name}\nE-mail: ${email}\n\n${message}`,
      html: `<p><strong>Naam:</strong> ${escapeHtml(name)}</p><p><strong>E-mail:</strong> ${escapeHtml(email)}</p><p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>`,
    });

    return NextResponse.json({ message: SUCCESS_MESSAGE }, { status: 200 });
  } catch (err) {
    console.error("[api/contact] smtp error:", err);
    logSecurityEvent("provider_error");
    return NextResponse.json(
      { error: "E-mail kon niet worden verzonden. Probeer het later opnieuw." },
      { status: 500 },
    );
  }
}

function getSmtpConfig(): SmtpConfig | null {
  const outbox =
    process.env.OUTBOX_EMAIL?.trim() || process.env.ZOHO_MAIL_USER?.trim() || "";
  const password = process.env.OUTBOX_EMAIL_PASSWORD || process.env.ZOHO_MAIL_PASSWORD || "";
  const inbox = process.env.INBOX_EMAIL?.trim() || outbox;

  if (!outbox || !password || !inbox) {
    return null;
  }

  return {
    host: process.env.SMTP_HOST?.trim() || "smtp.zoho.com",
    inbox,
    outbox,
    password,
    port: parseInt(process.env.SMTP_PORT ?? "465", 10),
    secure: process.env.SMTP_SECURE !== "false",
  };
}

async function getZohoAccessToken(config: ZohoTokenConfig): Promise<string> {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: config.refreshToken,
  });

  const response = await fetch(`${config.accountsDomain}/oauth/v2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
    cache: "no-store",
  });

  const json = (await response.json().catch(() => null)) as
    | { access_token?: string; error?: string; error_description?: string }
    | null;

  if (!response.ok || !json?.access_token) {
    throw new Error(json?.error_description || json?.error || "Zoho access token ophalen mislukt.");
  }

  return json.access_token;
}

function getZohoErrorMessage(response: ZohoCreateResponse | null): string {
  const firstError = response?.data?.[0];
  if (firstError?.message) {
    return `Zoho CRM fout: ${firstError.message}`;
  }

  return "Zoho CRM accepteerde het bericht niet.";
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function attachZohoTags(options: {
  accessToken: string;
  apiDomain: string;
  moduleName: string;
  contactId: string;
  body: Record<string, unknown>;
}): Promise<void> {
  const { accessToken, apiDomain, moduleName, contactId, body } = options;

  const tags = buildZohoTags({
    doelgroep: typeof body.doelgroep === "string" ? body.doelgroep : undefined,
    hoofd_symptoom: typeof body.hoofd_symptoom === "string" ? body.hoofd_symptoom : undefined,
    leefstijl_score: typeof body.leefstijl_score === "string" ? body.leefstijl_score : undefined,
    supplement_fase: typeof body.supplement_fase === "string" ? body.supplement_fase : undefined,
    quiz_voltooid: typeof body.quiz_voltooid === "boolean" ? body.quiz_voltooid : undefined,
    affiliate_klik: typeof body.affiliate_klik === "string" ? body.affiliate_klik : undefined,
  });

  if (tags.length === 0) return;

  const authHeaders = {
    Authorization: `Zoho-oauthtoken ${accessToken}`,
    "Content-Type": "application/json",
  };

  // Fetch existing tags to determine which ones need to be created
  const existingTagsRes = await fetch(
    `${apiDomain}/crm/v8/settings/tags?module=${moduleName}`,
    { headers: authHeaders, cache: "no-store" }
  );
  const existingTagsJson = (await existingTagsRes.json().catch(() => null)) as
    | { tags?: Array<{ name: string }> }
    | null;
  const existingNames = new Set(
    existingTagsJson?.tags?.map((t) => t.name) ?? []
  );

  // Create tags that do not exist yet
  const newTags = tags.filter((t) => !existingNames.has(t));
  if (newTags.length > 0) {
    await fetch(`${apiDomain}/crm/v8/settings/tags`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        tags: newTags.map((name) => ({ name, module: { api_name: moduleName } })),
      }),
      cache: "no-store",
    });
  }

  // Attach all tags to the contact record
  await fetch(
    `${apiDomain}/crm/v8/${moduleName}/${contactId}/actions/add_tags`,
    {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ tags: tags.map((name) => ({ name })) }),
      cache: "no-store",
    }
  );
}
