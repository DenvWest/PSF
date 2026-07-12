import Link from "next/link";
import { notFound } from "next/navigation";
import { CollapsibleSection } from "@/components/partnerdesk/CollapsibleSection";
import { CommissionSection } from "@/components/partnerdesk/CommissionSection";
import { ContactsSection } from "@/components/partnerdesk/ContactsSection";
import { ContractsSection } from "@/components/partnerdesk/ContractsSection";
import { InlineField } from "@/components/partnerdesk/InlineField";
import {
  PassportCard,
  type PassportCommission,
  type PassportContract,
} from "@/components/partnerdesk/PassportCard";
import {
  SectionAnchorNav,
  type DossierSection,
} from "@/components/partnerdesk/SectionAnchorNav";
import {
  PARTNER_STATUS_LABEL,
  StatusBadge,
} from "@/components/partnerdesk/StatusBadge";
import { TasksSection } from "@/components/partnerdesk/TasksSection";
import { TimelineSection } from "@/components/partnerdesk/TimelineSection";
import { resolveCommissions } from "@/lib/partnerdesk/commission-resolution";
import { contractStatus } from "@/lib/partnerdesk/contract-status";
import { todayIso } from "@/lib/partnerdesk/dates";
import { COMMISSION_KIND_LABEL, formatCommissionValue } from "@/lib/partnerdesk/format";
import {
  getPartnerBySlug,
  getPartnerCommercials,
  getPartnerContacts,
  getPartnerOpenCounts,
  getPartnerTasks,
  getPartnerTimeline,
} from "@/lib/partnerdesk/queries";
import { PARTNER_STATUSES } from "@/lib/partnerdesk/validation";

export const dynamic = "force-dynamic";

const SECTIONS: DossierSection[] = [
  { id: "algemeen", label: "Algemeen" },
  { id: "contactpersonen", label: "Contactpersonen" },
  { id: "contracten", label: "Contracten" },
  { id: "commissies", label: "Commissies" },
  { id: "documenten", label: "Documenten" },
  { id: "tijdlijn", label: "Tijdlijn" },
  { id: "taken", label: "Taken" },
];

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[10rem_1fr] items-start gap-4 py-2">
      <span className="pt-1 text-sm text-[var(--ps-body)]">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function Placeholder({ plak }: { plak: string }) {
  return <p className="text-sm text-[var(--ps-muted)]">Komt in {plak}.</p>;
}

export default async function PartnerDossierPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dossier = await getPartnerBySlug(slug);
  if (!dossier) notFound();

  const { partner, network, networks, categories } = dossier;
  const [contacts, timeline, tasks, counts, commercials] = await Promise.all([
    getPartnerContacts(partner.id),
    getPartnerTimeline(partner.id),
    getPartnerTasks(partner.id),
    getPartnerOpenCounts(partner.id),
    getPartnerCommercials(partner.id),
  ]);
  const primaryContact = contacts.find((c) => c.is_primary) ?? null;

  const today = todayIso();
  const resolution = resolveCommissions(commercials.rules, commercials.contracts, today);
  const primaryGroup = resolution.groups[0];
  const commissionNow: PassportCommission | null = primaryGroup
    ? {
        label: `${formatCommissionValue(
          primaryGroup.kind,
          primaryGroup.winner.rate_percent,
          primaryGroup.winner.amount_cents,
        )} ${COMMISSION_KIND_LABEL[primaryGroup.kind]}`,
        validUntil: primaryGroup.validUntil,
      }
    : null;

  const activeContract =
    commercials.contracts.find(
      (c) => contractStatus(c.starts_on, c.ends_on, today) === "active",
    ) ?? commercials.contracts[0];
  const passportContract: PassportContract | null = activeContract
    ? {
        number: activeContract.number,
        cancelBy: activeContract.cancel_by,
        endsOn: activeContract.ends_on,
        cookieDays: activeContract.cookie_days,
      }
    : null;

  const statusOptions = PARTNER_STATUSES.map((s) => ({
    value: s,
    label: PARTNER_STATUS_LABEL[s],
  }));
  const networkOptions = networks.map((n) => ({ value: n.id, label: n.name }));
  const categoryOptions = [
    { value: "", label: "— geen —" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <div>
      <header className="sticky top-0 z-10 border-b border-[var(--ps-border)] bg-[var(--ps-surface)]/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-8 py-4">
          <Link href="/admin/partners" className="text-sm text-[var(--ps-body)] hover:underline">
            ← Partners
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{partner.name}</h1>
            <StatusBadge status={partner.status} />
            {network && (
              <span className="rounded-full bg-[var(--ps-bg)] px-2.5 py-0.5 text-xs text-[var(--ps-body)]">
                {network.name}
                {network.kind === "direct" ? " · direct" : ""}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-8 px-8 py-6">
        <SectionAnchorNav sections={SECTIONS} />

        <div className="min-w-0 flex-1 space-y-5">
          <PassportCard
            partner={partner}
            primaryContact={primaryContact}
            commissionNow={commissionNow}
            contract={passportContract}
            openTasks={counts.openTasks}
            openSignals={counts.openSignals}
          />

          <CollapsibleSection id="algemeen" title="Algemene gegevens">
            <div className="divide-y divide-[var(--ps-border)]">
              <FieldRow label="Naam">
                <InlineField entity="partner" id={partner.id} field="name" value={partner.name} />
              </FieldRow>
              <FieldRow label="Status">
                <InlineField
                  entity="partner"
                  id={partner.id}
                  field="status"
                  value={partner.status}
                  variant="select"
                  options={statusOptions}
                />
              </FieldRow>
              <FieldRow label="Netwerk">
                <InlineField
                  entity="partner"
                  id={partner.id}
                  field="network_id"
                  value={partner.network_id}
                  variant="select"
                  options={networkOptions}
                />
              </FieldRow>
              <FieldRow label="Categorie">
                <InlineField
                  entity="partner"
                  id={partner.id}
                  field="category_id"
                  value={partner.category_id ?? ""}
                  variant="select"
                  options={categoryOptions}
                />
              </FieldRow>
              <FieldRow label="Website">
                <InlineField
                  entity="partner"
                  id={partner.id}
                  field="website"
                  value={partner.website ?? ""}
                  renderValue={(v) => (
                    <a
                      href={v.includes("://") ? v : `https://${v}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      {v}
                    </a>
                  )}
                />
              </FieldRow>
              <FieldRow label="Login-URL">
                <InlineField entity="partner" id={partner.id} field="login_url" value={partner.login_url ?? ""} />
              </FieldRow>
              <FieldRow label="Gebruikersnaam">
                <InlineField entity="partner" id={partner.id} field="login_username" value={partner.login_username ?? ""} />
              </FieldRow>
              <FieldRow label="Accountmanager">
                <InlineField entity="partner" id={partner.id} field="account_manager" value={partner.account_manager ?? ""} />
              </FieldRow>
              <FieldRow label="Omschrijving">
                <InlineField
                  entity="partner"
                  id={partner.id}
                  field="description"
                  value={partner.description ?? ""}
                  variant="textarea"
                />
              </FieldRow>
            </div>
            <p className="mt-3 text-xs text-[var(--ps-muted)]">
              Wachtwoord hoort in de wachtwoordmanager, niet hier. Klik een waarde
              om te bewerken; Enter of klik-weg slaat op, Esc annuleert.
            </p>
          </CollapsibleSection>

          <CollapsibleSection id="contactpersonen" title="Contactpersonen">
            <ContactsSection partnerId={partner.id} slug={slug} contacts={contacts} />
          </CollapsibleSection>

          <CollapsibleSection id="contracten" title="Contracten">
            <ContractsSection
              partnerId={partner.id}
              slug={slug}
              today={today}
              contracts={commercials.contracts}
              rules={commercials.rules}
              documents={commercials.documents}
            />
          </CollapsibleSection>
          <CollapsibleSection id="commissies" title="Commissies">
            <CommissionSection
              partnerId={partner.id}
              slug={slug}
              today={today}
              contracts={commercials.contracts}
              rules={commercials.rules}
              tiers={commercials.tiers}
              categories={categories}
            />
          </CollapsibleSection>
          <CollapsibleSection id="documenten" title="Materiaal & documenten" defaultOpen={false}>
            <Placeholder plak="plak 5" />
          </CollapsibleSection>

          <CollapsibleSection id="tijdlijn" title="Tijdlijn">
            <TimelineSection
              partnerId={partner.id}
              slug={slug}
              events={timeline}
              contacts={contacts}
            />
          </CollapsibleSection>

          <CollapsibleSection id="taken" title="Taken">
            <TasksSection partnerId={partner.id} slug={slug} tasks={tasks} />
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );
}
