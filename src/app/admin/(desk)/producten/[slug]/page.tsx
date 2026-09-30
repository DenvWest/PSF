import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CollapsibleSection } from "@/components/partnerdesk/CollapsibleSection";
import { InlineField } from "@/components/partnerdesk/InlineField";
import { SectionAnchorNav, type DossierSection } from "@/components/partnerdesk/SectionAnchorNav";
import { ProductStatusControl } from "@/components/product-admin/ProductStatusControl";
import { todayIso } from "@/lib/partnerdesk/dates";
import { formatMoney, formatNlDay } from "@/lib/partnerdesk/format";
import { isFreshPrice } from "@/lib/product-admin/publish-gate";
import { getProductDossierBySlug } from "@/lib/product-admin/queries";

export const dynamic = "force-dynamic";

const SECTIONS: DossierSection[] = [
  { id: "poort", label: "Publiceerpoort" },
  { id: "basis", label: "Basis" },
  { id: "samenstelling", label: "Samenstelling" },
  { id: "etiket", label: "Etiket" },
  { id: "afbeeldingen", label: "Afbeeldingen" },
  { id: "claims", label: "Claims" },
  { id: "score", label: "Score" },
  { id: "aanbiedingen", label: "Aanbiedingen" },
  { id: "bronnen", label: "Bronnen" },
];

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[10rem_1fr] items-start gap-4 py-2">
      <span className="pt-1 text-sm text-[var(--ps-body)]">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function ReadOnlyRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <FieldRow label={label}>
      <span className="block py-1 text-sm">{children}</span>
    </FieldRow>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-[var(--ps-muted)]">{children}</p>;
}

function first<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export default async function ProductDossierPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dossier = await getProductDossierBySlug(slug);
  if (!dossier) notFound();

  const { product, actives, ingredients, certifications, claims, images, offers, sources, score, gate } = dossier;
  const brand = first(product.sup_brands);
  const category = first(product.sup_categories);
  const today = todayIso();
  const failures = gate.filter((c) => !c.ok);

  return (
    <div>
      <header className="sticky top-0 z-10 border-b border-[var(--ps-border)] bg-[var(--ps-surface)]/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-8 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Link href="/admin/producten" className="text-sm text-[var(--ps-body)] hover:underline">
                ← Producten
              </Link>
              <h1 className="mt-2 text-2xl font-semibold">{product.name}</h1>
              <p className="text-sm text-[var(--ps-body)]">
                {brand?.name ?? "—"} · {category?.name ?? "—"} · gecontroleerd{" "}
                {product.data_checked_at ? formatNlDay(product.data_checked_at) : "nog nooit"}
              </p>
            </div>
            <ProductStatusControl productId={product.id} slug={slug} status={product.status} />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-8 px-8 py-6">
        <SectionAnchorNav sections={SECTIONS} />

        <div className="min-w-0 flex-1 space-y-5">
          <CollapsibleSection id="poort" title={`Publiceerpoort (${gate.length - failures.length}/${gate.length})`}>
            <ul className="space-y-2">
              {gate.map((c) => (
                <li key={c.key} className="flex items-start gap-3 text-sm">
                  <span
                    className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                      c.ok ? "bg-[var(--ps-green-light)] text-[var(--ps-green-hover)]" : "bg-red-50 text-red-700"
                    }`}
                    aria-label={c.ok ? "voldaan" : "niet voldaan"}
                  >
                    {c.ok ? "✓" : "✕"}
                  </span>
                  <span>
                    <span className="font-medium">{c.label}</span>
                    <span className="block text-[var(--ps-body)]">{c.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
            {failures.length > 0 && product.status !== "published" && (
              <p className="mt-3 text-xs text-[var(--ps-muted)]">Publiceren kan pas als alle punten voldaan zijn.</p>
            )}
          </CollapsibleSection>

          <CollapsibleSection id="basis" title="Basis">
            <div className="divide-y divide-[var(--ps-border)]">
              <FieldRow label="Naam">
                <InlineField entity="product" id={product.id} slug={slug} field="name" value={product.name} />
              </FieldRow>
              <FieldRow label="Variant">
                <InlineField entity="product" id={product.id} slug={slug} field="variant" value={product.variant ?? ""} />
              </FieldRow>
              <FieldRow label="Vorm">
                <InlineField entity="product" id={product.id} slug={slug} field="form" value={product.form ?? ""} />
              </FieldRow>
              <FieldRow label="Smaak">
                <InlineField entity="product" id={product.id} slug={slug} field="flavour" value={product.flavour ?? ""} />
              </FieldRow>
              <FieldRow label="Doelgroep">
                <InlineField entity="product" id={product.id} slug={slug} field="target_audience" value={product.target_audience ?? ""} />
              </FieldRow>
              <FieldRow label="Land van herkomst">
                <InlineField entity="product" id={product.id} slug={slug} field="country_of_origin" value={product.country_of_origin ?? ""} />
              </FieldRow>
              <FieldRow label="Productpagina">
                <InlineField entity="product" id={product.id} slug={slug} field="product_url" value={product.product_url ?? ""} asLink />
              </FieldRow>
              <FieldRow label="Gebruiksadvies">
                <InlineField entity="product" id={product.id} slug={slug} field="usage_advice" value={product.usage_advice ?? ""} variant="textarea" />
              </FieldRow>
              <FieldRow label="Omschrijving">
                <InlineField entity="product" id={product.id} slug={slug} field="description" value={product.description ?? ""} variant="textarea" />
              </FieldRow>
              <ReadOnlyRow label="Slug">{product.slug}</ReadOnlyRow>
            </div>
            <p className="mt-3 text-xs text-[var(--ps-muted)]">
              Klik een waarde om te bewerken; Enter of klik-weg slaat op, Esc annuleert. Wijzigingen aan een gepubliceerd product zijn
              direct zichtbaar op de site.
            </p>
          </CollapsibleSection>

          <CollapsibleSection id="samenstelling" title="Samenstelling">
            {actives.length === 0 ? (
              <Empty>Nog geen werkzame stoffen vastgelegd.</Empty>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-[var(--ps-muted)]">
                    <th className="py-1 font-medium">Stof</th>
                    <th className="py-1 font-medium">Vorm</th>
                    <th className="py-1 text-right font-medium">Per portie</th>
                    <th className="py-1 pl-4 font-medium">Elementair</th>
                  </tr>
                </thead>
                <tbody>
                  {actives.map((a) => (
                    <tr key={a.id} className="border-t border-[var(--ps-border)]">
                      <td className="py-1.5">{a.nutrient_key}</td>
                      <td className="py-1.5 text-[var(--ps-body)]">{a.form_key ?? "—"}</td>
                      <td className="py-1.5 text-right tabular-nums">
                        {a.amount_per_serving ?? "—"} {a.unit ?? ""}
                      </td>
                      <td className="py-1.5 pl-4 text-[var(--ps-body)]">{a.is_elemental ? "ja" : "nee"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {ingredients.length > 0 && (
              <p className="mt-4 text-sm text-[var(--ps-body)]">
                <span className="font-medium text-[var(--ps-ink)]">Ingrediënten:</span>{" "}
                {ingredients.map((i) => i.name + (i.is_allergen ? " (allergeen)" : "")).join(", ")}
              </p>
            )}
          </CollapsibleSection>

          <CollapsibleSection id="etiket" title="Etiket">
            <div className="divide-y divide-[var(--ps-border)]">
              <ReadOnlyRow label="Verpakking">
                {product.container_size ? `${product.container_size} ${product.container_unit ?? ""}` : "—"}
                {product.servings_per_container ? ` · ${product.servings_per_container} porties` : ""}
              </ReadOnlyRow>
              <ReadOnlyRow label="Portie">
                {product.serving_size ? `${product.serving_size} ${product.serving_unit ?? ""}` : "—"}
              </ReadOnlyRow>
              <ReadOnlyRow label="Certificeringen">{certifications.length > 0 ? certifications.join(", ") : "—"}</ReadOnlyRow>
            </div>
          </CollapsibleSection>

          <CollapsibleSection id="afbeeldingen" title="Afbeeldingen">
            {images.length === 0 ? (
              <Empty>Nog geen afbeeldingen.</Empty>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2">
                {images.map((img) => {
                  const licensed = Boolean(img.source?.trim()) && Boolean(img.license_note?.trim());
                  return (
                    <li key={img.id} className="flex gap-3 rounded-lg border border-[var(--ps-border)] p-3">
                      <Image src={img.path} alt={img.alt ?? product.name} width={72} height={72} className="h-[72px] w-[72px] shrink-0 rounded object-contain" />
                      <div className="min-w-0 text-sm">
                        <p className="truncate text-[var(--ps-body)]" title={img.path}>{img.path}</p>
                        <p>Bron: {img.source ?? "—"}</p>
                        <p className={licensed ? "text-[var(--ps-body)]" : "text-amber-700"}>
                          Licentie: {img.license_note?.trim() ? img.license_note : "niet vastgelegd"}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CollapsibleSection>

          <CollapsibleSection id="claims" title="Claims (berekend)">
            {claims.length === 0 ? (
              <Empty>Geen gekoppelde EFSA-claims.</Empty>
            ) : (
              <ul className="space-y-1 text-sm">
                {claims.map((c) => (
                  <li key={c.efsa_claim_id} className="flex items-center gap-2">
                    <span className={c.meets_condition ? "text-[var(--ps-green-hover)]" : "text-red-700"}>{c.meets_condition ? "✓" : "✕"}</span>
                    <span>{c.efsa_claim_id}</span>
                    <span className="text-[var(--ps-muted)]">{c.meets_condition ? "drempel gehaald" : "drempel niet gehaald"}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-[var(--ps-muted)]">Alleen lezen: de claimdrempel volgt uit de gekoppelde werkzame stoffen.</p>
          </CollapsibleSection>

          <CollapsibleSection id="score" title="PS-Score (berekend)">
            {!score ? (
              <Empty>Score kon niet worden bepaald voor dit product.</Empty>
            ) : !score.available ? (
              <Empty>{score.reason}</Empty>
            ) : (
              <>
                <p className="text-2xl font-semibold tabular-nums">
                  {score.result.total}
                  <span className="text-sm font-normal text-[var(--ps-muted)]"> / 100 · model {score.result.modelVersion}</span>
                </p>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {score.result.components.map((c) => (
                    <li key={c.id} className="grid grid-cols-[9rem_4rem_1fr] gap-3">
                      <span className="font-medium">{c.label}</span>
                      <span className="tabular-nums">{c.points === null ? "n.v.t." : Math.round(c.points)}</span>
                      <span className="text-[var(--ps-body)]">{c.reden}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <p className="mt-3 text-xs text-[var(--ps-muted)]">
              Prijs telt niet mee in de score. De score-invoer (vorm, etiketfeiten) staat nog in score-inputs.ts.
            </p>
          </CollapsibleSection>

          <CollapsibleSection id="aanbiedingen" title="Aanbiedingen">
            {offers.length === 0 ? (
              <Empty>Nog geen aanbiedingen.</Empty>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-[var(--ps-muted)]">
                    <th className="py-1 font-medium">Retailer</th>
                    <th className="py-1 text-right font-medium">Prijs</th>
                    <th className="py-1 pl-4 font-medium">Gecontroleerd</th>
                    <th className="py-1 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map((o) => {
                    const retailer = first(o.sup_retailers);
                    const fresh = isFreshPrice(o.price_checked_at, today);
                    return (
                      <tr key={o.id} className="border-t border-[var(--ps-border)]">
                        <td className="py-1.5">
                          {retailer?.name ?? "—"}
                          {retailer?.relationship === "network" && <span className="ml-2 text-xs text-[var(--ps-muted)]">netwerk</span>}
                        </td>
                        <td className="py-1.5 text-right tabular-nums">{formatMoney(o.price_cents)}</td>
                        <td className={`py-1.5 pl-4 ${fresh ? "text-[var(--ps-body)]" : "text-amber-700"}`}>
                          {o.price_checked_at ? formatNlDay(o.price_checked_at) : "nooit"}
                        </td>
                        <td className="py-1.5 text-[var(--ps-body)]">{o.active ? "actief" : "inactief"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CollapsibleSection>

          <CollapsibleSection id="bronnen" title="Bronnen">
            {sources.length === 0 ? (
              <Empty>Nog geen bronnen.</Empty>
            ) : (
              <ul className="space-y-1 text-sm">
                {sources.map((s) => (
                  <li key={s.id}>
                    <span className="text-[var(--ps-muted)]">{s.kind}</span>{" "}
                    {s.url ? (
                      <a href={s.url} target="_blank" rel="noreferrer" className="hover:underline">
                        {s.title ?? s.url} ↗
                      </a>
                    ) : (
                      (s.title ?? "—")
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );
}
