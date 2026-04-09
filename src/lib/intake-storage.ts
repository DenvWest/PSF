import type { DomainScores } from "@/lib/intake-engine";

export const INTAKE_SESSIONS_KEY = "ps_intake_sessions";

export const REMINDER_EMAILS_KEY = "ps_reminder_emails";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export type ReminderEmailRecord = {
  email: string;
  sessionTimestamp: number;
  reminderDate: number;
  createdAt: number;
};

function readReminderEmailsRaw(): unknown {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(REMINDER_EMAILS_KEY);
    if (raw === null || raw === "") {
      return [];
    }
    return JSON.parse(raw) as unknown;
  } catch {
    return [];
  }
}

export function saveReminderEmail(
  email: string,
  sessionTimestamp: number,
): void {
  if (typeof window === "undefined") {
    return;
  }

  const createdAt = Date.now();
  const reminderDate = sessionTimestamp + THIRTY_DAYS_MS;
  const record: ReminderEmailRecord = {
    email: email.trim(),
    sessionTimestamp,
    reminderDate,
    createdAt,
  };

  const parsed = readReminderEmailsRaw();
  const existing = Array.isArray(parsed)
    ? parsed.filter(isReminderEmailRecord)
    : [];
  const next = [...existing, record];
  window.localStorage.setItem(REMINDER_EMAILS_KEY, JSON.stringify(next));
}

function isReminderEmailRecord(value: unknown): value is ReminderEmailRecord {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const o = value as Record<string, unknown>;
  return (
    typeof o.email === "string" &&
    typeof o.sessionTimestamp === "number" &&
    typeof o.reminderDate === "number" &&
    typeof o.createdAt === "number"
  );
}

export type IntakeSessionPayload = {
  symptoms: string[];
  answers: Record<string, number>;
  scores: DomainScores;
  urgency: string;
  profile: string;
  timestamp: number;
};

function readRawSessions(): unknown {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(INTAKE_SESSIONS_KEY);
    if (raw === null || raw === "") {
      return [];
    }
    return JSON.parse(raw) as unknown;
  } catch {
    return [];
  }
}

export function saveIntakeSession(data: IntakeSessionPayload): void {
  if (typeof window === "undefined") {
    return;
  }

  const existing = getAllSessions();
  const next = [...existing, data];
  window.localStorage.setItem(INTAKE_SESSIONS_KEY, JSON.stringify(next));
}

export function getLastSession(): IntakeSessionPayload | null {
  const all = getAllSessions();
  return all.length > 0 ? all[all.length - 1] : null;
}

export function getAllSessions(): IntakeSessionPayload[] {
  const parsed = readRawSessions();
  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.filter(isIntakeSessionPayload);
}

function isIntakeSessionPayload(value: unknown): value is IntakeSessionPayload {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const o = value as Record<string, unknown>;
  if (
    !Array.isArray(o.symptoms) ||
    !o.symptoms.every((s) => typeof s === "string") ||
    typeof o.answers !== "object" ||
    o.answers === null ||
    !isDomainScores(o.scores) ||
    typeof o.urgency !== "string" ||
    typeof o.profile !== "string" ||
    typeof o.timestamp !== "number"
  ) {
    return false;
  }

  const ans = o.answers as Record<string, unknown>;
  return Object.values(ans).every((v) => typeof v === "number");
}

function isDomainScores(value: unknown): value is DomainScores {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const s = value as Record<string, unknown>;
  return (
    typeof s.sleep_score === "number" &&
    typeof s.energy_score === "number" &&
    typeof s.stress_score === "number" &&
    typeof s.nutrition_score === "number" &&
    typeof s.movement_score === "number" &&
    typeof s.recovery_score === "number"
  );
}
