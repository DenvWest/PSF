"use server";

import { revalidatePath } from "next/cache";
import { getPartnerDeskDb } from "@/lib/partnerdesk/db";
import { recomputeSignalsForPartner } from "@/lib/partnerdesk/signals";
import { recordTimelineEvent } from "@/lib/partnerdesk/timeline";
import type { ActionResult } from "@/lib/partnerdesk/actions";

export async function createTaskAction(input: {
  partnerId?: string | null;
  title: string;
  dueOn?: string | null;
  slug?: string;
}): Promise<ActionResult> {
  if (!input.title.trim()) return { ok: false, error: "Titel is verplicht." };
  try {
    const db = getPartnerDeskDb();
    const { error } = await db.from("pd_tasks").insert({
      partner_id: input.partnerId ?? null,
      title: input.title.trim(),
      due_on: input.dueOn || null,
    });
    if (error) return { ok: false, error: error.message };
    if (input.partnerId) await recomputeSignalsForPartner(db, input.partnerId);
    revalidatePath("/admin/taken");
    revalidatePath("/admin/partners");
    if (input.slug) revalidatePath(`/admin/partners/${input.slug}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}

export async function setTaskStatusAction(input: {
  taskId: string;
  done: boolean;
  slug?: string;
}): Promise<ActionResult> {
  try {
    const db = getPartnerDeskDb();
    const { data, error } = await db
      .from("pd_tasks")
      .update({
        status: input.done ? "done" : "open",
        completed_at: input.done ? new Date().toISOString() : null,
      })
      .eq("id", input.taskId)
      .select("partner_id, title")
      .single();
    if (error) return { ok: false, error: error.message };

    const partnerId = (data as { partner_id: string | null }).partner_id;
    if (input.done && partnerId) {
      await recordTimelineEvent(db, {
        partnerId,
        actor: "system",
        kind: "task_completed",
        body: `Taak afgerond: ${(data as { title: string }).title}`,
        metadata: { task_id: input.taskId },
      });
    }
    if (partnerId) await recomputeSignalsForPartner(db, partnerId);
    revalidatePath("/admin/taken");
    revalidatePath("/admin/partners");
    if (input.slug) revalidatePath(`/admin/partners/${input.slug}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}
