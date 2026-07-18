import { getDefaultOrganizationId } from "@/lib/organization";
import {
  markDomainEventDelivered,
  publishDomainEventToN8n,
} from "@/lib/n8n-webhook";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const DOMAIN_EVENT_TYPES = [
  "account.created",
  "account.logged_in",
  "account.login_email_failed",
  "dashboard.first_checkin_started",
  "dashboard.vitality_scored",
  "dashboard.cta_to_hub",
  "dashboard.aanrader_clicked",
  "dashboard.daily_action_toggled",
  "dashboard.priority_selected",
  "dashboard.time_bucket_set",
  "agenda.block_created",
  "agenda.block_toggled",
  "agenda.block_deleted",
  "domain_tool.snapshot_viewed",
  "domain_tool.tier_preview_clicked",
  "intake.completed",
  "intake.started",
  "intake.phase_completed",
  "intake.theme_revealed",
  "intake.cta_to_pillar",
  "intake.cta_to_nutrition_log",
  "intake.cta_to_primary_checkin",
  "focus.viewed",
  "plan.viewed",
  "plan.action_clicked",
  "plan.tier_action_clicked",
  "plan.evidence_clicked",
  "plan.theme_switched",
  "plan.step_state_changed",
  "plan.phase_completed",
  "plan.step_link_clicked",
  "plan.phase_expanded",
  "plan.daily_rhythm_clicked",
  "plan.week_category_selected",
  "movement.session_logged",
  "wearable.interest_clicked",
  "plan.checkin_completed",
  "premium.waitlist_joined",
  "premium.price_indicated",
  "email.opted_in",
  "consent.revoked",
  "consent.analytics_set",
  "evidence.chat_queried",
  "nurture.email_sent",
  "nurture.scheduled",
  "nurture.skipped",
  "remeasure.invited",
  "remeasure.completed",
  "affiliate.click",
  "profile.recognition",
  "measurement.gap_detected",
  "measurement.checkin_completed",
  "measurement.direction_detected",
  "measurement.protein_target_computed",
  "measurement.protein_cta_clicked",
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

  const deliveredTo = input.deliveredTo ?? [];

  const { data: inserted, error } = await admin
    .from("domain_events")
    .insert({
      organization_id: organizationId,
      event_type: input.eventType,
      session_id: input.sessionId ?? null,
      email,
      payload: input.payload ?? {},
      delivered_to: deliveredTo,
    })
    .select(
      "id, organization_id, occurred_at, event_type, session_id, email, payload",
    )
    .single();

  if (error) {
    console.error("[emitEvent] insert failed:", {
      eventType: input.eventType,
      message: error.message,
    });
    return;
  }

  if (
    inserted &&
    deliveredTo.includes("n8n_webhook")
  ) {
    const payload =
      inserted.payload &&
      typeof inserted.payload === "object" &&
      !Array.isArray(inserted.payload)
        ? (inserted.payload as Record<string, unknown>)
        : {};

    void publishDomainEventToN8n({
      id: inserted.id,
      organization_id: inserted.organization_id,
      occurred_at: inserted.occurred_at,
      event_type: inserted.event_type,
      session_id: inserted.session_id,
      email: inserted.email,
      payload,
    }).then((ok) => {
      if (ok) {
        void markDomainEventDelivered(inserted.id, "n8n_webhook");
      }
    });
  }
}
