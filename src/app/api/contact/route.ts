import { NextResponse } from "next/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const contactDisabled = process.env.CONTACT_SMTP_DISABLED === "true";

  if (contactDisabled) {
    return NextResponse.json({ message: "Message successfully sent." }, { status: 200 });
  }

  const clientId = process.env.ZOHO_CLIENT_ID?.trim();
  const clientSecret = process.env.ZOHO_CLIENT_SECRET?.trim();
  const refreshToken = process.env.ZOHO_REFRESH_TOKEN?.trim();
  const accountsDomain = process.env.ZOHO_ACCOUNTS_DOMAIN?.trim() || "https://accounts.zoho.eu";
  const apiDomain = process.env.ZOHO_API_DOMAIN?.trim() || "https://www.zohoapis.eu";
  const moduleName = process.env.ZOHO_CRM_MODULE?.trim() || "Leads";

  if (!clientId || !clientSecret || !refreshToken) {
    return NextResponse.json(
      {
        error:
          "Zoho CRM is nog niet geconfigureerd. Vul ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET en ZOHO_REFRESH_TOKEN in .env.local in.",
      },
      { status: 503 },
    );
  }

  try {
    const accessToken = await getZohoAccessToken({
      clientId,
      clientSecret,
      refreshToken,
      accountsDomain,
    });

    const zohoResponse = await fetch(`${apiDomain}/crm/v8/${moduleName}`, {
      method: "POST",
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: [
          {
            Last_Name: nameStr,
            Email: emailStr,
            Description: messageStr,
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

    return NextResponse.json({ message: "Message successfully sent." }, { status: 200 });
  } catch (err) {
    console.error("[api/contact] zoho error:", err);
    return NextResponse.json(
      { error: "Bericht kon niet naar Zoho CRM worden verzonden. Probeer het later opnieuw." },
      { status: 500 },
    );
  }
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
