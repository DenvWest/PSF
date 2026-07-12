import type { ReactNode } from "react";
import { DeskIcon } from "@/components/partnerdesk/DeskIcon";
import { lastContactLabel } from "@/lib/partnerdesk/contact-recency";
import { todayIso } from "@/lib/partnerdesk/dates";
import { formatNlDay } from "@/lib/partnerdesk/format";
import type { PdContact, PdPartner } from "@/types/partnerdesk";

export interface PassportCommission {
  label: string;
  validUntil: string | null;
}
export interface PassportContract {
  number: string;
  cancelBy: string | null;
  endsOn: string | null;
  cookieDays: number | null;
}

function Row({
  label,
  href,
  children,
  muted,
}: {
  label: string;
  href?: string;
  children: ReactNode;
  muted?: boolean;
}) {
  const value = (
    <span className={muted ? "text-[var(--ps-muted)]" : "text-[var(--ps-ink)]"}>
      {children}
    </span>
  );
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 text-sm">
      <span className="shrink-0 text-[var(--ps-body)]">{label}</span>
      {href ? (
        <a href={href} className="truncate hover:underline">
          {value}
        </a>
      ) : (
        <span className="truncate">{value}</span>
      )}
    </div>
  );
}

/**
 * Het partnerpaspoort — de acht feiten waar je altijd naar zoekt. In plak 1 is
 * alleen Login gevuld uit de partnergegevens; contract/commissie/contactpersoon
 * volgen in plak 2/3, feed/API in fase 2/3.
 */
export function PassportCard({
  partner,
  primaryContact,
  commissionNow,
  contract,
  openTasks,
  openSignals,
}: {
  partner: PdPartner;
  primaryContact: PdContact | null;
  commissionNow: PassportCommission | null;
  contract: PassportContract | null;
  openTasks: number;
  openSignals: number;
}) {
  const now = todayIso();
  return (
    <div className="rounded-xl border border-[var(--ps-border)] bg-[var(--ps-surface)] px-5 py-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--ps-body)]">
          Paspoort
        </h2>
      </div>
      <div className="divide-y divide-[var(--ps-border)]">
        <Row label="Commissie nu" href="#commissies" muted={!commissionNow}>
          {commissionNow ? (
            <span>
              {commissionNow.label}
              {commissionNow.validUntil && (
                <span className="ml-1 text-[var(--ps-muted)]">
                  · t/m {formatNlDay(commissionNow.validUntil)}
                </span>
              )}
            </span>
          ) : (
            "nog geen regel"
          )}
        </Row>
        <Row label="Contract" href="#contracten" muted={!contract}>
          {contract ? (
            <span>
              {contract.number}
              {contract.cancelBy && (
                <span className="ml-1 text-[var(--ps-muted)]">
                  · opzeggen vóór {formatNlDay(contract.cancelBy)}
                </span>
              )}
            </span>
          ) : (
            "nog invullen →"
          )}
        </Row>
        <Row label="Cookieduur" href="#contracten" muted={!contract?.cookieDays}>
          {contract?.cookieDays != null ? `${contract.cookieDays} dagen` : "—"}
        </Row>
        <Row
          label="Contactpersoon"
          href="#contactpersonen"
          muted={!primaryContact}
        >
          {primaryContact ? (
            <span>
              {primaryContact.name}
              <span className="ml-1 text-[var(--ps-muted)]">
                · {lastContactLabel(primaryContact.last_contact_at, now)}
              </span>
            </span>
          ) : (
            "nog invullen →"
          )}
        </Row>
        <Row
          label="Login"
          href={partner.login_url ?? "#algemeen"}
          muted={!partner.login_url}
        >
          {partner.login_url ? (
            <span className="inline-flex items-center gap-1">
              {partner.login_username ?? partner.login_url}
              <DeskIcon name="external" width={13} height={13} />
            </span>
          ) : (
            "nog invullen →"
          )}
        </Row>
        <Row label="Feed" muted>
          — (fase 2)
        </Row>
        <Row label="API" muted>
          — (fase 3)
        </Row>
        <Row
          label="Openstaand"
          href="#taken"
          muted={openTasks === 0 && openSignals === 0}
        >
          {openTasks} {openTasks === 1 ? "taak" : "taken"} · {openSignals}{" "}
          {openSignals === 1 ? "signaal" : "signalen"}
        </Row>
      </div>
    </div>
  );
}
