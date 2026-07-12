"use server";

import { revalidatePath } from "next/cache";
import { getPartnerDeskDb } from "@/lib/partnerdesk/db";
import { recomputeSignalsForPartner } from "@/lib/partnerdesk/signals";
import { recordTimelineEvent } from "@/lib/partnerdesk/timeline";
import type { ActionResult } from "@/lib/partnerdesk/actions";
import type { SupabaseClient } from "@supabase/supabase-js";

// UI-types → tijdlijn-kinds. Alleen mail/meeting/telefoon tellen als "contact"
// (voeden last_contact_at en het stale_contact-signaal); een notitie niet.
const EVENT_KIND: Record<string, string> = {
  notitie: "note",
  mail: "email",
  meeting: "meeting",
  telefoon: "call",
};
const CONTACT_KINDS = new Set(["email", "meeting", "call"]);

function revalidateDossier(slug?: string) {
  revalidatePath("/admin/partners");
  if (slug) revalidatePath(`/admin/partners/${slug}`);
}

/** Zet last_contact_at op de nieuwste contact-touch (nooit terug in de tijd). */
async function touchContact(
  db: SupabaseClient,
  contactId: string,
  occurredAt: string,
): Promise<void> {
  const { data } = await db
    .from("pd_contacts")
    .select("last_contact_at")
    .eq("id", contactId)
    .maybeSingle();
  const current = (data?.last_contact_at as string | null) ?? null;
  if (!current || occurredAt > current) {
    await db
      .from("pd_contacts")
      .update({ last_contact_at: occurredAt })
      .eq("id", contactId);
  }
}

export async function addTimelineEventAction(input: {
  partnerId: string;
  eventType: string;
  body: string;
  contactId?: string | null;
  occurredAt?: string;
  slug?: string;
}): Promise<ActionResult> {
  const kind = EVENT_KIND[input.eventType];
  if (!kind) return { ok: false, error: "Onbekend type." };
  if (!input.body.trim()) return { ok: false, error: "Tekst is verplicht." };

  try {
    const db = getPartnerDeskDb();
    const occurredAt = input.occurredAt ?? new Date().toISOString();
    await recordTimelineEvent(db, {
      partnerId: input.partnerId,
      actor: "user",
      kind,
      body: input.body.trim(),
      contactId: input.contactId ?? null,
      occurredAt,
    });
    if (input.contactId && CONTACT_KINDS.has(kind)) {
      await touchContact(db, input.contactId, occurredAt);
      await recomputeSignalsForPartner(db, input.partnerId);
    }
    revalidateDossier(input.slug);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

/**
 * BR-16: klik op de mailknop logt direct een e-mail-event (optimistisch) en
 * werkt last_contact_at bij. De client opent daarna mailto:. Corrigeerbaar via
 * een gewone notitie als de mail toch niet verstuurd is.
 */
export async function logMailToContactAction(input: {
  partnerId: string;
  contactId: string;
  contactName: string;
  contactEmail: string;
  slug?: string;
}): Promise<ActionResult> {
  try {
    const db = getPartnerDeskDb();
    const occurredAt = new Date().toISOString();
    await recordTimelineEvent(db, {
      partnerId: input.partnerId,
      actor: "user",
      kind: "email",
      body: `Mail gestuurd aan ${input.contactName}`,
      contactId: input.contactId,
      metadata: {
        contact_snapshot: { name: input.contactName, email: input.contactEmail },
      },
      occurredAt,
    });
    await touchContact(db, input.contactId, occurredAt);
    await recomputeSignalsForPartner(db, input.partnerId);
    revalidateDossier(input.slug);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}
