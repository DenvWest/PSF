import type { IntakeAgeRange } from "@/data/intake-questions";
import type { IntakeSessionPayload } from "@/lib/intake-session-payload";

export type { IntakeSessionPayload };

export async function saveIntakeSession(data: {
  symptoms: string[];
  answers: Record<string, number>;
  ageRange: IntakeAgeRange;
  turnstileToken: string;
  website: string;
}): Promise<string | null> {
  try {
    const response = await fetch("/api/intake/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        ageRange: data.ageRange,
        symptoms: data.symptoms,
        answers: data.answers,
        turnstileToken: data.turnstileToken,
        website: data.website,
      }),
    });

    const json = (await response.json().catch(() => null)) as
      | { sessionId?: string; error?: string }
      | null;

    if (!response.ok) {
      console.error("Save session error:", json?.error ?? response.status);
      return null;
    }

    const id = json?.sessionId;
    return typeof id === "string" ? id : null;
  } catch (e) {
    console.error("Save session error:", e);
    return null;
  }
}

export async function saveIntakeFeedback(
  sessionId: string | null,
  rating: "positive" | "negative",
  comment: string | null,
) {
  const trimmed = comment?.trim();
  try {
    const response = await fetch("/api/intake/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        sessionId,
        rating,
        comment: trimmed && trimmed.length > 0 ? trimmed : null,
        website: "",
      }),
    });
    if (!response.ok) {
      const json = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      console.error("Save intake feedback error:", json?.error ?? response.status);
    }
  } catch (e) {
    console.error("Save intake feedback error:", e);
  }
}

export async function saveReminderEmail(email: string) {
  try {
    const response = await fetch("/api/intake/reminder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, website: "" }),
    });
    if (!response.ok) {
      const json = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      console.error("Save reminder error:", json?.error ?? response.status);
    }
  } catch (e) {
    console.error("Save reminder error:", e);
  }
}

export async function getLastSession(): Promise<IntakeSessionPayload | null> {
  try {
    const response = await fetch("/api/intake/session", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    const json = (await response.json().catch(() => null)) as
      | { session?: IntakeSessionPayload | null; error?: string }
      | null;

    if (!response.ok) {
      return null;
    }

    return json?.session ?? null;
  } catch {
    return null;
  }
}
