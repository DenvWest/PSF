import Link from "next/link";
import { EmptyState } from "@/components/partnerdesk/EmptyState";
import { NewPartnerPanel } from "@/components/partnerdesk/NewPartnerPanel";
import { StatusBadge } from "@/components/partnerdesk/StatusBadge";
import { listNetworks, listPartners } from "@/lib/partnerdesk/queries";

export const dynamic = "force-dynamic";

export default async function PartnersPage() {
  const [rows, networks] = await Promise.all([listPartners(), listNetworks()]);

  return (
    <div className="mx-auto max-w-6xl px-8 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Partners</h1>
          <p className="mt-0.5 text-sm text-[var(--ps-body)]">
            {rows.length} {rows.length === 1 ? "partner" : "partners"}
          </p>
        </div>
        <NewPartnerPanel networks={networks} />
      </header>

      {rows.length === 0 ? (
        <EmptyState
          title="Nog geen partners"
          action={<NewPartnerPanel networks={networks} />}
        >
          Voeg je eerste affiliate-partner toe — je hebt alleen een naam en
          netwerk nodig, de rest vul je in het dossier aan.
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
                <th className="px-5 py-3 font-medium text-right">Signalen</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ partner, networkName, categoryName, openSignalCount }) => (
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
                  <td className="px-5 py-3 text-[var(--ps-body)]">
                    {categoryName ?? "—"}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={partner.status} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    {openSignalCount > 0 ? (
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
