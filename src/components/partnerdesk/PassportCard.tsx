import type { ReactNode } from "react";
import { DeskIcon } from "@/components/partnerdesk/DeskIcon";
import type { PdPartner } from "@/types/partnerdesk";

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
export function PassportCard({ partner }: { partner: PdPartner }) {
  return (
    <div className="rounded-xl border border-[var(--ps-border)] bg-[var(--ps-surface)] px-5 py-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--ps-body)]">
          Paspoort
        </h2>
      </div>
      <div className="divide-y divide-[var(--ps-border)]">
        <Row label="Commissie nu" href="#commissies" muted>
          nog geen contract
        </Row>
        <Row label="Contract" href="#contracten" muted>
          nog invullen →
        </Row>
        <Row label="Cookieduur" href="#contracten" muted>
          —
        </Row>
        <Row label="Contactpersoon" href="#contactpersonen" muted>
          nog invullen →
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
        <Row label="Openstaand" href="#taken" muted>
          0 taken · 0 signalen
        </Row>
      </div>
    </div>
  );
}
