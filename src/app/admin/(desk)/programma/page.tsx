import Link from "next/link";
import { EmptyState } from "@/components/partnerdesk/EmptyState";
import { NewAffiliatePanel } from "@/components/affiliate/NewAffiliatePanel";
import { listAffiliates } from "@/lib/affiliate/queries";
import type { AffiliateStatus } from "@/types/affiliate";

export const dynamic = "force-dynamic";

const STATUS: Record<AffiliateStatus, { label: string; cls: string }> = {
  active: { label: "Actief", cls: "bg-[var(--ps-green-light)] text-[var(--ps-green-hover)]" },
  paused: { label: "Gepauzeerd", cls: "bg-stone-100 text-stone-600" },
  ended: { label: "Beëindigd", cls: "bg-stone-100 text-stone-500" },
};

export default async function ProgrammaPage() {
  const rows = await listAffiliates();

  return (
    <div className="mx-auto max-w-6xl px-8 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Affiliates</h1>
          <p className="mt-0.5 text-sm text-[var(--ps-body)]">
            {rows.length} {rows.length === 1 ? "affiliate" : "affiliates"} in je programma
            {" · "}
            <Link href="/admin/programma/rapportage" className="hover:underline">Rapportage →</Link>
          </p>
        </div>
        <NewAffiliatePanel />
      </header>

      {rows.length === 0 ? (
        <EmptyState title="Nog geen affiliates" action={<NewAffiliatePanel />}>
          Voeg je eerste programma-partner toe — naam en e-mail volstaan; de
          tracking-ref en commissieafspraak vul je in het dossier aan.
        </EmptyState>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--ps-border)] bg-[var(--ps-surface)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--ps-border)] text-left text-xs uppercase tracking-wide text-[var(--ps-muted)]">
                <th className="px-5 py-3 font-medium">Naam</th>
                <th className="px-5 py-3 font-medium">Ref</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Regels</th>
                <th className="px-5 py-3 font-medium text-right">Links</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ affiliate, ruleCount, linkCount }) => {
                const meta = STATUS[affiliate.status];
                return (
                  <tr key={affiliate.id} className="border-b border-[var(--ps-border)] last:border-0 hover:bg-[var(--ps-bg)]">
                    <td className="px-5 py-3">
                      <Link href={`/admin/programma/${affiliate.ref}`} className="font-medium text-[var(--ps-ink)] hover:underline">
                        {affiliate.display_name}
                      </Link>
                      {affiliate.company && (
                        <span className="ml-2 text-xs text-[var(--ps-muted)]">{affiliate.company}</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <code className="rounded bg-[var(--ps-bg)] px-1.5 py-0.5 text-xs text-[var(--ps-body)]">{affiliate.ref}</code>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.cls}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-[var(--ps-body)]">{ruleCount}</td>
                    <td className="px-5 py-3 text-right text-[var(--ps-body)]">{linkCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
