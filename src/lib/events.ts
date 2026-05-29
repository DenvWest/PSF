import { getDefaultOrganizationId } from "@/lib/organization";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const DOMAIN_EVENT_TYPES = [
  "intake.completed",
  "intake.theme_revealed",
  "plan.action_clicked",
  "email.opted_in",
  "consent.revoked",
] as const;

export type DomainEventType = (typeof DOMAIN_EVENT_TYPES)[number];

const EVENT_TYPE_SET = new Set<string>(DOMAIN_EVENT_TYPES);

export function isDomainEventType(value: string): value is DomainEventType {
  return EVENT_TYPE_SET.has(value);
}

export type EmitEventInput = {
  eventType: DomainEventType;
  sessionId?: string | null;
  email?: string | null;
  payload?: Record<string, unknown>;
  organizationId?: string;
  deliveredTo?: string[];
};

export async function emitEvent(input: EmitEventInput): Promise<void> {
  const admin = createSupabaseAdmin();
  if (!admin) {
    console.error("[emitEvent] Supabase admin not configured", {
      eventType: input.eventType,
    });
    return;
  }

  const organizationId = input.organizationId ?? getDefaultOrganizationId();
  const email =
    typeof input.email === "string" && input.email.trim()
      ? input.email.trim().toLowerCase()
      : null;

  const { error } = await admin.from("domain_events").insert({
    organization_id: organizationId,
    event_type: input.eventType,
    session_id: input.sessionId ?? null,
    email,
    payload: input.payload ?? {},
    delivered_to: input.deliveredTo ?? [],
  });

  if (error) {
    console.error("[emitEvent] insert failed:", {
      eventType: input.eventType,
      message: error.message,
    });
  }
}
