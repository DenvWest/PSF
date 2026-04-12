export type ContactFormData = {
  name: string;
  email: string;
  message: string;
  turnstileToken: string;
  website: string;
};

/** Antwoord van POST /api/contact */
export type ContactApiResponse = {
  message?: string;
  error?: string;
};

export async function handleSendEmail(data: ContactFormData): Promise<ContactApiResponse> {
  const res = await fetch("/api/contact", {
    method: "POST",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return (await res.json()) as ContactApiResponse;
  }

  if (!res.ok) {
    return { error: `Serverfout (${res.status}). Probeer het later opnieuw.` };
  }

  return { message: "Message successfully sent." };
}
