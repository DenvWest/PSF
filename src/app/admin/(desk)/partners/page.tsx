import Link from "next/link";
import { EmptyState } from "@/components/partnerdesk/EmptyState";
import { NewPartnerPanel } from "@/components/partnerdesk/NewPartnerPanel";
import { RestorePartnerButton } from "@/components/partnerdesk/RestorePartnerButton";
import { StatusBadge } from "@/components/partnerdesk/StatusBadge";
import { listNetworks, listPartners } from "@/lib/partnerdesk/queries";

export const dynamic = "force-dynamic";

export default async function PartnersPage({
  searchParams,
}: {
  searchParams: Promise<{ archived?: string }>;
}) {
  const archived = (await searchParams).archived === "1";
  const [rows, networks] = await Promise.all([
    listPartners(archived),
    listNetworks(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-8 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {archived ? "Gearchiveerde partners" : "Partners"}
          </h1>
          <p className="mt-0.5 text-sm text-[var(--ps-body)]">
            {rows.length} {rows.length === 1 ? "partner" : "partners"}
            {" · "}
            {archived ? (
              <Link href="/admin/partners" className="hover:underline">← Actieve partners</Link>
            ) : (
              <Link href="/admin/partners?archived=1" className="hover:underline">Gearchiveerd →</Link>
            )}
          </p>
        </div>
        {!archived && <NewPartnerPanel networks={networks} />}
      </header>

      {rows.length === 0 ? (
        <EmptyState
          title={archived ? "Geen gearchiveerde partners" : "Nog geen partners"}
          action={archived ? undefined : <NewPartnerPanel networks={networks} />}
        >
          {archived
            ? "Gearchiveerde partners verschijnen hier en zijn te herstellen."
            : "Voeg je eerste affiliate-partner toe — je hebt alleen een naam en netwerk nodig, de rest vul je in het dossier aan."}
        </EmptyState>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--ps-border)] bg-[var(--ps-surface)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--ps-border)] text-left text-xs uppercase tracking-wide text-[var(--ps-muted)]">
                <th className="px-5 py-3 font-medium">Naam</th>
                <th className="px-5 py-3 font-medium">Netwerk</th>
                <th className="px-5 py-3 font-medium">Categorie</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Labels</th>
                <th className="px-5 py-3 font-medium text-right">
                  {archived ? "" : "Signalen"}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ partner, networkName, categoryName, labels, openSignalCount }) => (
                <tr
                  key={partner.id}
                  className="border-b border-[var(--ps-border)] last:border-0 hover:bg-[var(--ps-bg)]"
                >
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/partners/${partner.slug}`}
                      className="font-medium text-[var(--ps-ink)] hover:underline"
                    >
                      {partner.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-[var(--ps-body)]">{networkName}</td>
                  <td className="px-5 py-3 text-[var(--ps-body)]">{categoryName ?? "—"}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={partner.status} />
                  </td>
                  <td className="px-5 py-3">
                    <span className="flex flex-wrap gap-1">
                      {labels.map((l) => (
                        <span key={l.id} className="inline-flex items-center gap-1 rounded-full bg-[var(--ps-bg)] px-2 py-0.5 text-xs text-[var(--ps-body)]">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: l.color }} />
                          {l.name}
                        </span>
                      ))}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {archived ? (
                      <RestorePartnerButton partnerId={partner.id} slug={partner.slug} />
                    ) : openSignalCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[var(--ps-body)]">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        {openSignalCount}
                      </span>
                    ) : (
                      <span className="text-[var(--ps-muted)]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
