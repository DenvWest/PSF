export type ContactFormData = {
  name: string;
  email: string;
  message: string;
};

/** Antwoord van POST /api/contact */
export type ContactApiResponse = {
  message?: string;
  error?: string;
};

/**
 * Verstuurt het contactformulier naar de Next.js API-route.
 * Later: zorg dat `.env.local` echte SMTP-gegevens bevat (of zet CONTACT_SMTP_DISABLED=false).
 */
export async function handleSendEmail(data: ContactFormData): Promise<ContactApiResponse> {
  const res = await fetch("/api/contact", {
    method: "POST",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const json = (await res.json()) as ContactApiResponse;
  return json;
}
