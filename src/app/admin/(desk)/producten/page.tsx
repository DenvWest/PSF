import Image from "next/image";
import Link from "next/link";
import { EmptyState } from "@/components/partnerdesk/EmptyState";
import { PRODUCT_STATUS_CLASS, PRODUCT_STATUS_LABEL } from "@/components/product-admin/ProductStatusControl";
import { listAdminProducts, type AdminProductRow, type ProductStatus } from "@/lib/product-admin/queries";

export const dynamic = "force-dynamic";

const FILTERS: { value: ProductStatus | "alle"; label: string }[] = [
  { value: "alle", label: "Alle" },
  { value: "published", label: "Gepubliceerd" },
  { value: "draft", label: "Concept" },
];

function ScoreCell({ score }: { score: AdminProductRow["score"] }) {
  if (!score) return <span className="text-[var(--ps-muted)]">—</span>;
  if (!score.available) {
    return (
      <span className="text-xs text-amber-700" title={score.reason}>
        geen invoer
      </span>
    );
  }
  return (
    <span className="tabular-nums" title={`${score.result.determinedCount} van ${score.result.totalCount} onderdelen bepaald`}>
      {Math.round(score.result.total)}
    </span>
  );
}

function FreshnessCell({ row }: { row: AdminProductRow }) {
  const { state, staleData, stalePrices } = row.freshness;
  if (state === "vers") return <span className="text-[var(--ps-green-hover)]">Vers</span>;
  if (state === "onbekend") return <span className="text-[var(--ps-muted)]">Niet gecontroleerd</span>;
  return (
    <span className="text-amber-700">
      {[staleData ? "data >90 dgn" : null, stalePrices > 0 ? `${stalePrices} prijs oud` : null]
        .filter(Boolean)
        .join(" · ")}
    </span>
  );
}

export default async function ProductenPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const statusParam = (await searchParams).status;
  const filter = FILTERS.some((f) => f.value === statusParam) ? (statusParam as ProductStatus | "alle") : "alle";
  const { rows, summary } = await listAdminProducts();
  const visible = filter === "alle" ? rows : rows.filter((r) => r.status === filter);

  return (
    <div className="mx-auto max-w-6xl px-8 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Producten</h1>
        <p className="mt-0.5 text-sm text-[var(--ps-body)]">
          {rows.length} {rows.length === 1 ? "product" : "producten"} in de catalogus
        </p>
        <nav aria-label="Statusfilter" className="mt-3 flex gap-2 text-sm">
          {FILTERS.map((f) => (
            <Link
              key={f.value}
              href={f.value === "alle" ? "/admin/producten" : `/admin/producten?status=${f.value}`}
              className={`rounded-full px-3 py-1 ${
                filter === f.value
                  ? "bg-[var(--ps-green-light)] font-semibold text-[var(--ps-ink)]"
                  : "text-[var(--ps-body)] hover:bg-[var(--ps-bg)]"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </nav>
      </header>

      {(summary.staleDataProducts > 0 || summary.stalePriceOffers > 0) && (
        <aside className="mb-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {summary.staleDataProducts > 0 && (
            <p>
              {summary.staleDataProducts} {summary.staleDataProducts === 1 ? "product" : "producten"} langer dan 90 dagen
              niet gecontroleerd.
            </p>
          )}
          {summary.stalePriceOffers > 0 && (
            <p>
              {summary.stalePriceOffers} {summary.stalePriceOffers === 1 ? "prijs" : "prijzen"} ouder dan 30 dagen of nooit
              gecontroleerd.
            </p>
          )}
        </aside>
      )}

      {visible.length === 0 ? (
        <EmptyState title="Geen producten">
          Er zijn geen producten met deze status. De catalogus wordt gevuld via de backfill-routes.
        </EmptyState>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--ps-border)] bg-[var(--ps-surface)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--ps-border)] text-left text-xs uppercase tracking-wide text-[var(--ps-muted)]">
                <th className="w-16 px-5 py-3 font-medium"></th>
                <th className="px-3 py-3 font-medium">Product</th>
                <th className="px-3 py-3 font-medium">Merk</th>
                <th className="px-3 py-3 font-medium">Categorie</th>
                <th className="px-3 py-3 text-right font-medium">Score</th>
                <th className="px-3 py-3 text-right font-medium">Aanbiedingen</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Versheid</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.id} className="border-b border-[var(--ps-border)] last:border-0 hover:bg-[var(--ps-bg)]">
                  <td className="px-5 py-2">
                    {row.imagePath ? (
                      <Image src={row.imagePath} alt={`${row.brandName} ${row.name}`} width={40} height={40} className="h-10 w-10 rounded object-contain" />
                    ) : (
                      <span className="block h-10 w-10 rounded bg-[var(--ps-bg)]" />
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <Link href={`/admin/producten/${row.slug}`} className="font-medium text-[var(--ps-ink)] hover:underline">
                      {row.name}
                    </Link>
                    {row.variant && <span className="ml-2 text-xs text-[var(--ps-muted)]">{row.variant}</span>}
                  </td>
                  <td className="px-3 py-2 text-[var(--ps-body)]">{row.brandName}</td>
                  <td className="px-3 py-2 text-[var(--ps-body)]">{row.categoryName}</td>
                  <td className="px-3 py-2 text-right">
                    <ScoreCell score={row.score} />
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {row.offerCount === 0 ? <span className="text-amber-700">0</span> : row.offerCount}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${PRODUCT_STATUS_CLASS[row.status]}`}>
                      {PRODUCT_STATUS_LABEL[row.status]}
                    </span>
                  </td>
                  <td className="px-5 py-2 text-xs">
                    <FreshnessCell row={row} />
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
