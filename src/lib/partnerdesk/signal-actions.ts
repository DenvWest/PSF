"use server";

import { revalidatePath } from "next/cache";
import { getPartnerDeskDb } from "@/lib/partnerdesk/db";
import { recordTimelineEvent } from "@/lib/partnerdesk/timeline";
import { todayIso } from "@/lib/partnerdesk/dates";
import type { ActionResult } from "@/lib/partnerdesk/actions";

function isoPlusDays(days: number): string {
  const d = new Date(`${todayIso()}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function snoozeSignalAction(input: {
  signalId: string;
  days: number;
  reason: string;
  partnerId?: string | null;
}): Promise<ActionResult> {
  const reason = input.reason.trim();
  if (reason.length < 5) {
    return { ok: false, error: "Geef een reden (minstens 5 tekens)." };
  }
  try {
    const db = getPartnerDeskDb();
    const { error } = await db
      .from("pd_signals")
      .update({
        status: "snoozed",
        snoozed_until: isoPlusDays(input.days),
        snooze_reason: reason,
      })
      .eq("id", input.signalId);
    if (error) return { ok: false, error: error.message };

    if (input.partnerId) {
      await recordTimelineEvent(db, {
        partnerId: input.partnerId,
        actor: "system",
        kind: "signal_snoozed",
        body: `Signaal uitgesteld (${input.days} dgn): ${reason}`,
        metadata: { days: input.days },
      });
    }
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Onbekende fout." };
  }
}
