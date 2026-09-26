-- Productplatform plak 1 — display_order op sup_products.
--
-- Ontdekt tijdens het omschakelen van /beste/magnesium naar de DB-loader: de
-- statische ComparisonPageData.products-array droeg een impliciete,
-- redactionele volgorde (topkeuze eerst), maar de database heeft geen kolom
-- die dat vastlegt. loadCategoryProducts() had daardoor geen ORDER BY, dus de
-- volgorde op de pagina veranderde onbedoeld (Viridian kwam vóór Vitaminstore
-- te staan i.p.v. erna). Besluit (Dennis, 26 sep 2026): expliciete kolom i.p.v.
-- op created_at leunen — dat laatste werkt toevallig nu, maar is fragiel bij
-- een backfill-herrun of toekomstige data-import, en geeft plak 2 (admin) geen
-- manier om de volgorde handmatig aan te passen.
-- Uitvoeren via de Supabase Dashboard SQL Editor — nooit `supabase db push`.

alter table public.sup_products
  add column if not exists display_order int not null default 0;

comment on column public.sup_products.display_order is
  'Presentatievolgorde binnen een categorie (laag = eerst). Backfill vult dit op basis van de oorspronkelijke array-volgorde in ComparisonPageData; plak 2 (admin) mag dit later handmatig aanpasbaar maken.';

create index if not exists sup_products_category_display_order_idx
  on public.sup_products (category_id, display_order);
