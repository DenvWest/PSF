// Signaal-checks (PRD §10/§11) — puur, geen database. Berekent de gewenste set
// signalen voor één partner uit zijn actuele data. De sync in signals.ts zet dit
// af tegen de bestaande signalen (upsert / auto-resolve / snooze-respect).

import { resolveCommissions } from "@/lib/partnerdesk/commission-resolution";
import { isStaleContact } from "@/lib/partnerdesk/contact-recency";
import {
  cancelDeadlineSeverity,
  contractStatus,
  daysUntil,
  expirySeverity,
} from "@/lib/partnerdesk/contract-status";
import { daysSince } from "@/lib/partnerdesk/dates";
import type {
  PdCommissionRule,
  PdContact,
  PdContract,
  PdPartner,
  SignalSeverity,
} from "@/types/partnerdesk";

export interface DesiredSignal {
  type: string;
  severity: SignalSeverity;
  subjectType: "contract" | "partner" | "task";
  subjectId: string;
  partnerId: string | null;
  dedupeKey: string;
  payload: Record<string, unknown>;
}

export interface PartnerSignalBundle {
  partner: PdPartner;
  contracts: PdContract[]; // niet-gearchiveerd
  rules: PdCommissionRule[]; // niet-gearchiveerd
  contacts: PdContact[]; // niet-gearchiveerd
}

function latestContactAt(contacts: PdContact[]): string | null {
  let max: string | null = null;
  for (const c of contacts) {
    if (c.last_contact_at && (!max || c.last_contact_at > max)) {
      max = c.last_contact_at;
    }
  }
  return max;
}

export function computePartnerSignals(
  bundle: PartnerSignalBundle,
  today: string,
): DesiredSignal[] {
  const { partner, contracts, rules, contacts } = bundle;
  const out: DesiredSignal[] = [];
  const partnerActive = partner.status === "active" && !partner.archived_at;

  for (const c of contracts) {
    if (c.archived_at) continue;
    const status = contractStatus(c.starts_on, c.ends_on, today);

    if (status === "active" && !c.auto_renews) {
      const sev = expirySeverity(c.ends_on, today);
      if (sev) {
        out.push({
          type: "contract_expiring",
          severity: sev,
          subjectType: "contract",
          subjectId: c.id,
          partnerId: partner.id,
          dedupeKey: `contract_expiring:${c.id}`,
          payload: { days_left: daysUntil(c.ends_on, today), number: c.number },
        });
      }
    }

    if (status !== "expired") {
      const csev = cancelDeadlineSeverity(c.cancel_by, today);
      if (csev) {
        out.push({
          type: "cancel_deadline",
          severity: csev,
          subjectType: "contract",
          subjectId: c.id,
          partnerId: partner.id,
          dedupeKey: `cancel_deadline:${c.id}`,
          payload: { cancel_by: c.cancel_by, number: c.number },
        });
      }
    }
  }

  if (!partnerActive) return out;

  if (contacts.length === 0) {
    out.push({
      type: "partner_no_contact",
      severity: "amber",
      subjectType: "partner",
      subjectId: partner.id,
      partnerId: partner.id,
      dedupeKey: `partner_no_contact:${partner.id}`,
      payload: {},
    });
  } else {
    const last = latestContactAt(contacts);
    const createdDay = partner.created_at.slice(0, 10);
    const neverAndOld =
      last === null && (daysSince(createdDay, today) ?? 0) > 30;
    if (isStaleContact(last, today) || neverAndOld) {
      out.push({
        type: "stale_contact",
        severity: "amber",
        subjectType: "partner",
        subjectId: partner.id,
        partnerId: partner.id,
        dedupeKey: `stale_contact:${partner.id}`,
        payload: { last_contact_at: last },
      });
    }
  }

  const hasActiveContract = contracts.some(
    (c) => !c.archived_at && contractStatus(c.starts_on, c.ends_on, today) === "active",
  );
  if (hasActiveContract) {
    const res = resolveCommissions(rules, contracts, today);
    if (!res.hasAny) {
      out.push({
        type: "missing_commission",
        severity: "red",
        subjectType: "partner",
        subjectId: partner.id,
        partnerId: partner.id,
        dedupeKey: `missing_commission:${partner.id}`,
        payload: {},
      });
    }
  }

  return out;
}

/** Signaal voor een te late taak. */
export function taskOverdueSignal(task: {
  id: string;
  partner_id: string | null;
  due_on: string | null;
  title: string;
}, today: string): DesiredSignal | null {
  if (!task.due_on || task.due_on >= today) return null;
  return {
    type: "task_overdue",
    severity: "red",
    subjectType: "task",
    subjectId: task.id,
    partnerId: task.partner_id,
    dedupeKey: `task_overdue:${task.id}`,
    payload: { title: task.title, due_on: task.due_on },
  };
}
