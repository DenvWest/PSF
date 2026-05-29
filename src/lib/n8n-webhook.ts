import { createSupabaseAdmin } from "@/lib/supabase-admin";

export type DomainEventWebhookPayload = {
  id: string;
  organization_id: string;
  occurred_at: string;
  event_type: string;
  session_id: string | null;
  email: string | null;
  payload: Record<string, unknown>;
};

function getN8nWebhookUrl(): string | null {
  const url = process.env.N8N_WEBHOOK_URL?.trim();
  if (!url || !url.startsWith("http")) {
    return null;
  }
  return url;
}

export async function publishDomainEventToN8n(
  event: DomainEventWebhookPayload,
): Promise<boolean> {
  const webhookUrl = getN8nWebhookUrl();
  if (!webhookUrl) {
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "perfectsupplement",
        event,
      }),
    });

    if (!response.ok) {
      console.error("[n8n-webhook] non-2xx response:", response.status);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[n8n-webhook] publish failed:", err);
    return false;
  }
}

export async function markDomainEventDelivered(
  eventId: string,
  channel: string,
): Promise<void> {
  const admin = createSupabaseAdmin();
  if (!admin) {
    return;
  }

  const { data: row, error: fetchError } = await admin
    .from("domain_events")
    .select("delivered_to")
    .eq("id", eventId)
    .maybeSingle<{ delivered_to: string[] | null }>();

  if (fetchError || !row) {
    return;
  }

  const current = Array.isArray(row.delivered_to) ? row.delivered_to : [];
  if (current.includes(channel)) {
    return;
  }

  const { error: updateError } = await admin
    .from("domain_events")
    .update({ delivered_to: [...current, channel] })
    .eq("id", eventId);

  if (updateError) {
    console.error("[n8n-webhook] mark delivered failed:", updateError.message);
  }
}

type PendingDomainEventRow = {
  id: string;
  organization_id: string;
  occurred_at: string;
  event_type: string;
  session_id: string | null;
  email: string | null;
  payload: Record<string, unknown> | null;
  delivered_to: string[] | null;
};

export async function runPendingN8nDomainEvents(): Promise<{
  forwarded: number;
  errors: number;
}> {
  const admin = createSupabaseAdmin();
  if (!admin) {
    throw new Error("SUPABASE_CONFIG");
  }

  if (!getN8nWebhookUrl()) {
    return { forwarded: 0, errors: 0 };
  }

  const { data: pending, error } = await admin
    .from("domain_events")
    .select(
      "id, organization_id, occurred_at, event_type, session_id, email, payload, delivered_to",
    )
    .order("occurred_at", { ascending: true })
    .limit(50);

  if (error) {
    console.error("[n8n-events-cron] fetch error:", error.message);
    throw error;
  }

  const rows = (pending ?? []) as PendingDomainEventRow[];
  let forwarded = 0;
  let errors = 0;

  for (const row of rows) {
    const delivered = Array.isArray(row.delivered_to) ? row.delivered_to : [];
    if (delivered.includes("n8n_webhook")) {
      continue;
    }

    const payload =
      row.payload && typeof row.payload === "object" && !Array.isArray(row.payload)
        ? row.payload
        : {};

    const ok = await publishDomainEventToN8n({
      id: row.id,
      organization_id: row.organization_id,
      occurred_at: row.occurred_at,
      event_type: row.event_type,
      session_id: row.session_id,
      email: row.email,
      payload,
    });

    if (ok) {
      await markDomainEventDelivered(row.id, "n8n_webhook");
      forwarded += 1;
    } else {
      errors += 1;
    }
  }

  return { forwarded, errors };
}
