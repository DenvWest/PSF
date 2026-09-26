-- Productplatform plak 1 — raw_legacy_fields op sup_products.
--
-- Tijdens de backfill van de 21 bestaande producten (src/data/supplements/*.ts)
-- bleek dat SupplementProduct vrije velden draagt die niet in het genormaliseerde
-- sup_*-schema passen: specs[] (label/value zonder vaste sleutels, bijv.
-- "Prijs / dag"), pros[]/cons[] (redactionele vrije tekst) en breakdown[] (de OUDE
-- handmatige scorecriteria van vóór de PS-Score, bijv. "Transparantie (20%)" —
-- niet de huidige computeTrustScore()-componenten). Besluit (Dennis, 26 sep 2026):
-- deze velden 1-op-1 bewaren in een jsonb-kolom i.p.v. ze te herstructureren, zodat
-- de backfill geen dataverlies heeft en de /beste/*-pagina identiek blijft.
-- Zie docs/plan/ANALYSE_PRODUCTPLATFORM_SUPPLEMENTEN.md, plak 1-scope-verduidelijking.
-- Uitvoeren via de Supabase Dashboard SQL Editor — nooit `supabase db push`.

alter table public.sup_products
  add column if not exists raw_legacy_fields jsonb;

comment on column public.sup_products.raw_legacy_fields is
  'specs[]/pros[]/cons[]/breakdown[] uit het oude SupplementProduct-type, 1-op-1 bewaard bij de backfill. Geen bron voor nieuwe functionaliteit — nieuwe producten vullen sup_product_actives/certifications/claims rechtstreeks.';
