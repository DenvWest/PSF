import type { SupabaseClient } from "@supabase/supabase-js";
import { getPartnerDeskDb } from "@/lib/partnerdesk/db";
import { todayIso } from "@/lib/partnerdesk/dates";
import { daysUntil } from "@/lib/partnerdesk/contract-status";
import {
  computePartnerSignals,
  taskOverdueSignal,
  type DesiredSignal,
} from "@/lib/partnerdesk/partner-signals";
import type {
  PdCommissionRule,
  PdContact,
  PdContract,
  PdPartner,
  PdTask,
} from "@/types/partnerdesk";

interface ExistingSignal {
  id: string;
  dedupe_key: string;
  status: string;
  snoozed_until: string | null;
  reopen_count: number;
}

/** Zet een gewenste set signalen af tegen de bestaande (voor één scope). */
async function reconcileScope(
  db: SupabaseClient,
  existing: ExistingSignal[],
  desired: DesiredSignal[],
  today: string,
): Promise<void> {
  const now = new Date().toISOString();
  const existingByKey = new Map(existing.map((e) => [e.dedupe_key, e]));
  const desiredKeys = new Set(desired.map((d) => d.dedupeKey));

  // Writes worden verzameld en parallel weggeschreven i.p.v. seriële await-per-rij:
  // nieuwe signalen in één insert, auto-resolve in één update, de rest concurrent.
  const inserts: Record<string, unknown>[] = [];
  const writes: PromiseLike<unknown>[] = [];

  for (const d of desired) {
    const ex = existingByKey.get(d.dedupeKey);
    if (!ex) {
      inserts.push({
        type: d.type,
        severity: d.severity,
        subject_type: d.subjectType,
        subject_id: d.subjectId,
        partner_id: d.partnerId,
        dedupe_key: d.dedupeKey,
        payload: d.payload,
        status: "open",
        last_seen_at: now,
      });
    } else if (ex.status === "resolved") {
      writes.push(
        db
          .from("pd_signals")
          .update({
            status: "open",
            severity: d.severity,
            payload: d.payload,
            last_seen_at: now,
            resolved_at: null,
            reopen_count: ex.reopen_count + 1,
          })
          .eq("id", ex.id),
      );
    } else if (ex.status === "snoozed" && ex.snoozed_until && ex.snoozed_until < today) {
      writes.push(
        db
          .from("pd_signals")
          .update({
            status: "open",
            severity: d.severity,
            payload: d.payload,
            last_seen_at: now,
            snoozed_until: null,
            reopen_count: ex.reopen_count + 1,
          })
          .eq("id", ex.id),
      );
    } else {
      writes.push(
        db
          .from("pd_signals")
          .update({ severity: d.severity, payload: d.payload, last_seen_at: now })
          .eq("id", ex.id),
      );
    }
  }

  const staleIds = existing
    .filter(
      (ex) =>
        (ex.status === "open" || ex.status === "snoozed") &&
        !desiredKeys.has(ex.dedupe_key),
    )
    .map((ex) => ex.id);

  if (inserts.length > 0) writes.push(db.from("pd_signals").insert(inserts));
  if (staleIds.length > 0) {
    writes.push(
      db
        .from("pd_signals")
        .update({ status: "resolved", resolved_at: now })
        .in("id", staleIds),
    );
  }

  await Promise.all(writes);
}

/** BR-04: automatische opzeg-taak op cancel_by − 14 dgn (idempotent via dedupe_key). */
async function ensureCancelDeadlineTasks(
  db: SupabaseClient,
  contracts: PdContract[],
  partnerName: string,
  today: string,
): Promise<void> {
  const rows = contracts
    .filter((c) => {
      if (c.archived_at || !c.cancel_by) return false;
      const days = daysUntil(c.cancel_by, today);
      return days !== null && days >= 0 && days <= 14;
    })
    .map((c) => ({
      partner_id: c.partner_id,
      contract_id: c.id,
      title: `Opzeggen of verlengen: ${partnerName} ${c.number}`,
      due_on: c.cancel_by,
      source: "system",
      dedupe_key: `cancel_by:${c.id}`,
    }));
  if (rows.length === 0) return;
  await db
    .from("pd_tasks")
    .upsert(rows, { onConflict: "dedupe_key", ignoreDuplicates: true });
}

/**
 * Herberekent de signalen voor één partner (onderdeel van het mutatie-contract:
 * elke actie roept dit aan). Idempotent — respecteert snooze, resolvet vanzelf.
 */
export async function recomputeSignalsForPartner(
  db: SupabaseClient,
  partnerId: string,
): Promise<void> {
  const today = todayIso();
  const { data: partnerData } = await db
    .from("pd_partners")
    .select("*")
    .eq("id", partnerId)
    .maybeSingle();
  if (!partnerData) return;
  const partner = partnerData as PdPartner;

  const { data: existingData } = await db
    .from("pd_signals")
    .select("id, dedupe_key, status, snoozed_until, reopen_count")
    .eq("partner_id", partnerId);
  const existing = (existingData ?? []) as ExistingSignal[];

  if (partner.archived_at) {
    await reconcileScope(db, existing, [], today);
    return;
  }

  const [contractsRes, contactsRes, tasksRes] = await Promise.all([
    db.from("pd_contracts").select("*").eq("partner_id", partnerId).is("archived_at", null),
    db.from("pd_contacts").select("*").eq("partner_id", partnerId).is("archived_at", null),
    db.from("pd_tasks").select("*").eq("partner_id", partnerId).eq("status", "open"),
  ]);
  const contracts = (contractsRes.data ?? []) as PdContract[];
  const contacts = (contactsRes.data ?? []) as PdContact[];
  const tasks = (tasksRes.data ?? []) as PdTask[];

  let rules: PdCommissionRule[] = [];
  if (contracts.length > 0) {
    const rulesRes = await db
      .from("pd_commission_rules")
      .select("*")
      .in("contract_id", contracts.map((c) => c.id))
      .is("archived_at", null);
    rules = (rulesRes.data ?? []) as PdCommissionRule[];
  }

  const desired = computePartnerSignals({ partner, contracts, rules, contacts }, today);
  for (const t of tasks) {
    const s = taskOverdueSignal(t, today);
    if (s) desired.push(s);
  }

  await reconcileScope(db, existing, desired, today);
  await ensureCancelDeadlineTasks(db, contracts, partner.name, today);
}

let lastFullSyncDay: string | null = null;

/**
 * Volledige sync over alle partners. Draait hooguit één keer per dag per
 * serverproces: mutaties houden signalen al vers via recomputeSignalsForPartner,
 * dus deze full-sync vangt enkel tijd-gedreven drempeloverschrijdingen op. De
 * Vandaag-pagina draait dit via `after()`, buiten het render-pad. `force` negeert
 * de dag-guard (bijv. een cron of test).
 */
export async function syncAllSignals(force = false): Promise<void> {
  const today = todayIso();
  if (!force && lastFullSyncDay === today) return;
  lastFullSyncDay = today;
  try {
    await runFullSync(today);
  } catch (err) {
    lastFullSyncDay = null; // laat een volgende load het opnieuw proberen
    throw err;
  }
}

async function runFullSync(today: string): Promise<void> {
  const db = getPartnerDeskDb();

  const [partnersRes, contractsRes, contactsRes, tasksRes, signalsRes] =
    await Promise.all([
      db.from("pd_partners").select("*").is("archived_at", null),
      db.from("pd_contracts").select("*").is("archived_at", null),
      db.from("pd_contacts").select("*").is("archived_at", null),
      db.from("pd_tasks").select("*").eq("status", "open"),
      db
        .from("pd_signals")
        .select("id, dedupe_key, status, snoozed_until, reopen_count, partner_id"),
    ]);

  const partners = (partnersRes.data ?? []) as PdPartner[];
  const contracts = (contractsRes.data ?? []) as PdContract[];
  const contacts = (contactsRes.data ?? []) as PdContact[];
  const tasks = (tasksRes.data ?? []) as PdTask[];
  const signals = (signalsRes.data ?? []) as (ExistingSignal & {
    partner_id: string | null;
  })[];

  let rules: PdCommissionRule[] = [];
  if (contracts.length > 0) {
    const rulesRes = await db
      .from("pd_commission_rules")
      .select("*")
      .in("contract_id", contracts.map((c) => c.id))
      .is("archived_at", null);
    rules = (rulesRes.data ?? []) as PdCommissionRule[];
  }

  const contractPartner = new Map(contracts.map((c) => [c.id, c.partner_id]));
  const group = <T,>(items: T[], key: (i: T) => string | null) => {
    const m = new Map<string | null, T[]>();
    for (const i of items) {
      const k = key(i);
      const list = m.get(k) ?? [];
      list.push(i);
      m.set(k, list);
    }
    return m;
  };

  const contractsByPartner = group(contracts, (c) => c.partner_id);
  const contactsByPartner = group(contacts, (c) => c.partner_id);
  const rulesByPartner = group(rules, (r) => contractPartner.get(r.contract_id) ?? null);
  const tasksByPartner = group(tasks, (t) => t.partner_id);
  const signalsByPartner = group(signals, (s) => s.partner_id);

  for (const partner of partners) {
    const pc = contractsByPartner.get(partner.id) ?? [];
    const desired = computePartnerSignals(
      {
        partner,
        contracts: pc,
        rules: rulesByPartner.get(partner.id) ?? [],
        contacts: contactsByPartner.get(partner.id) ?? [],
      },
      today,
    );
    for (const t of tasksByPartner.get(partner.id) ?? []) {
      const s = taskOverdueSignal(t, today);
      if (s) desired.push(s);
    }
    await reconcileScope(db, signalsByPartner.get(partner.id) ?? [], desired, today);
    await ensureCancelDeadlineTasks(db, pc, partner.name, today);
  }

  // Taken zonder partner: alleen task_overdue.
  const orphanTasks = tasksByPartner.get(null) ?? [];
  const orphanDesired: DesiredSignal[] = [];
  for (const t of orphanTasks) {
    const s = taskOverdueSignal(t, today);
    if (s) orphanDesired.push(s);
  }
  await reconcileScope(db, signalsByPartner.get(null) ?? [], orphanDesired, today);
}
