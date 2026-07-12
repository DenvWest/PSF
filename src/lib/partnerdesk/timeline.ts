import type { SupabaseClient } from "@supabase/supabase-js";
import type { TimelineActor } from "@/types/partnerdesk";

export interface TimelineRecordInput {
  partnerId: string;
  actor: TimelineActor;
  kind: string;
  body?: string | null;
  metadata?: Record<string, unknown>;
  contactId?: string | null;
  contractId?: string | null;
  occurredAt?: string;
}

/**
 * Append-only tijdlijn-event. Elke mutatie via de service-laag roept dit aan
 * (mutatie-contract): schrijven én event horen bij elkaar. In plak 1 nog
 * beperkt gebruikt (partner_created); plak 2 bouwt de tijdlijn-UI erbovenop.
 */
export async function recordTimelineEvent(
  db: SupabaseClient,
  input: TimelineRecordInput,
): Promise<void> {
  const { error } = await db.from("pd_timeline_events").insert({
    partner_id: input.partnerId,
    actor: input.actor,
    kind: input.kind,
    body: input.body ?? null,
    metadata: input.metadata ?? {},
    contact_id: input.contactId ?? null,
    contract_id: input.contractId ?? null,
    ...(input.occurredAt ? { occurred_at: input.occurredAt } : {}),
  });
  if (error) {
    // Tijdlijn is een neveneffect; een falend event mag de hoofdmutatie niet
    // terugdraaien, maar moet wel zichtbaar zijn.
    console.error("[partnerdesk] recordTimelineEvent:", error.message);
  }
}
