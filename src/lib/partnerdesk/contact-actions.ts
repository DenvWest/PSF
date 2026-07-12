"use server";

import { revalidatePath } from "next/cache";
import { getPartnerDeskDb } from "@/lib/partnerdesk/db";
import { recomputeSignalsForPartner } from "@/lib/partnerdesk/signals";
import { recordTimelineEvent } from "@/lib/partnerdesk/timeline";
import {
  isEditableContactField,
  validateContactFieldValue,
  validateContactName,
} from "@/lib/partnerdesk/validation";
import type { ActionResult } from "@/lib/partnerdesk/actions";
import type { PdContact, PdTimelineEvent } from "@/types/partnerdesk";

const NULLABLE_ON_EMPTY = new Set([
  "role",
  "email",
  "phone",
  "linkedin_url",
  "responsibility",
  "notes",
]);

function revalidateDossier(slug?: string) {
  revalidatePath("/admin/partners");
  if (slug) revalidatePath(`/admin/partners/${slug}`);
}

export async function createContactAction(input: {
  partnerId: string;
  name: string;
  slug?: string;
}): Promise<ActionResult<{ contactId: string }>> {
  const nameError = validateContactName(input.name);
  if (nameError) return { ok: false, error: nameError };
  try {
    const db = getPartnerDeskDb();
    const { data: existing, error: countError } = await db
      .from("pd_contacts")
      .select("id")
      .eq("partner_id", input.partnerId)
      .is("archived_at", null);
    if (countError) return { ok: false, error: countError.message };

    const isFirst = (existing ?? []).length === 0;
    const { data, error } = await db
      .from("pd_contacts")
      .insert({
        partner_id: input.partnerId,
        name: input.name.trim(),
        is_primary: isFirst, // eerste contact wordt automatisch primair
      })
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };

    await recomputeSignalsForPartner(db, input.partnerId);
    revalidateDossier(input.slug);
    return { ok: true, data: { contactId: (data as { id: string }).id } };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

export async function updateContactFieldAction(input: {
  contactId: string;
  field: string;
  value: string;
  slug?: string;
}): Promise<ActionResult> {
  const { contactId, field } = input;
  if (!isEditableContactField(field)) {
    return { ok: false, error: "Dit veld is niet bewerkbaar." };
  }
  const value = input.value.trim();
  const fieldError = validateContactFieldValue(field, value);
  if (fieldError) return { ok: false, error: fieldError };
  const nextValue = value === "" && NULLABLE_ON_EMPTY.has(field) ? null : value;

  try {
    const db = getPartnerDeskDb();
    const { error } = await db
      .from("pd_contacts")
      .update({ [field]: nextValue })
      .eq("id", contactId);
    if (error) return { ok: false, error: error.message };
    revalidateDossier(input.slug);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

export async function setPrimaryContactAction(input: {
  partnerId: string;
  contactId: string;
  slug?: string;
}): Promise<ActionResult> {
  try {
    const db = getPartnerDeskDb();
    // Eerst alle primairen van deze partner uitzetten (partial unique index dwingt
    // één primair af), daarna de gekozen kaart aanzetten.
    const clear = await db
      .from("pd_contacts")
      .update({ is_primary: false })
      .eq("partner_id", input.partnerId)
      .eq("is_primary", true);
    if (clear.error) return { ok: false, error: clear.error.message };
    const set = await db
      .from("pd_contacts")
      .update({ is_primary: true })
      .eq("id", input.contactId);
    if (set.error) return { ok: false, error: set.error.message };
    revalidateDossier(input.slug);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

export async function archiveContactAction(input: {
  contactId: string;
  partnerId: string;
  slug?: string;
}): Promise<ActionResult> {
  try {
    const db = getPartnerDeskDb();
    const { error } = await db
      .from("pd_contacts")
      .update({ archived_at: new Date().toISOString(), is_primary: false })
      .eq("id", input.contactId);
    if (error) return { ok: false, error: error.message };
    await recomputeSignalsForPartner(db, input.partnerId);
    revalidateDossier(input.slug);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

/**
 * AVG-inzage/portabiliteit (art. 15/20): alle vastgelegde gegevens van één
 * contact als JSON. De client biedt dit als download aan.
 */
export async function exportContactAction(input: {
  contactId: string;
}): Promise<ActionResult<{ filename: string; json: string }>> {
  try {
    const db = getPartnerDeskDb();
    const { data: contact, error } = await db
      .from("pd_contacts")
      .select("*")
      .eq("id", input.contactId)
      .maybeSingle();
    if (error) return { ok: false, error: error.message };
    if (!contact) return { ok: false, error: "Contact niet gevonden." };

    const { data: events } = await db
      .from("pd_timeline_events")
      .select("*")
      .eq("contact_id", input.contactId)
      .order("occurred_at", { ascending: true });

    const payload = {
      exported_at: new Date().toISOString(),
      contact: contact as PdContact,
      timeline_events: (events ?? []) as PdTimelineEvent[],
    };
    const c = contact as PdContact;
    return {
      ok: true,
      data: {
        filename: `contact-${c.id}.json`,
        json: JSON.stringify(payload, null, 2),
      },
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

/**
 * AVG-wissing (art. 17) — PII-scrub (compliance-audit D1). Pseudonimiseert de
 * contactvelden en de naam/e-mail in tijdlijn-snapshots, archiveert het contact
 * en logt een scrub-event zónder oude waarden. Append-only blijft: structuur
 * bewaard, inhoud gewist. Embeddings volgen in F4.
 */
export async function scrubContactAction(input: {
  contactId: string;
  partnerId: string;
  slug?: string;
}): Promise<ActionResult> {
  try {
    const db = getPartnerDeskDb();

    const scrub = await db
      .from("pd_contacts")
      .update({
        name: "Contact [gewist]",
        role: null,
        email: null,
        phone: null,
        linkedin_url: null,
        responsibility: null,
        notes: null,
        is_primary: false,
        archived_at: new Date().toISOString(),
      })
      .eq("id", input.contactId);
    if (scrub.error) return { ok: false, error: scrub.error.message };

    // Snapshots van naam/e-mail in tijdlijn-metadata verwijderen.
    const { data: events } = await db
      .from("pd_timeline_events")
      .select("id, metadata")
      .eq("contact_id", input.contactId);
    for (const ev of events ?? []) {
      const meta = (ev.metadata ?? {}) as Record<string, unknown>;
      if ("contact_snapshot" in meta) {
        const next = { ...meta, contact_snapshot: { scrubbed: true } };
        await db
          .from("pd_timeline_events")
          .update({ metadata: next })
          .eq("id", ev.id as string);
      }
    }

    await recordTimelineEvent(db, {
      partnerId: input.partnerId,
      actor: "system",
      kind: "contact_scrubbed",
      body: "Contactgegevens gewist op verzoek (AVG art. 17).",
    });
    await recomputeSignalsForPartner(db, input.partnerId);
    revalidateDossier(input.slug);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}
