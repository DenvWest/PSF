-- Productplatform plak 3 — score-invoer per product in de database.
--
-- De PS-Score (computeTrustScore) heeft naast dosering en claims ook feiten nodig die
-- tot nu toe alleen in code stonden (src/data/supplement-hub/score-inputs.ts):
-- vormsleutel, etiketfeiten, kwaliteitsmarkers, certificeringen en een eventuele
-- reden waarom de dosis onzeker is. Zonder dit kan een product dat alleen in de
-- database is aangemaakt nooit een score krijgen en dus de publiceerpoort niet halen.
--
-- Additief: één nullable jsonb-kolom. Bestaande code leest 'm niet; de admin valt terug op
-- de statische invoer zolang de kolom leeg is. Prijs zit hier bewust NIET in (de score
-- is prijsvrij; prijzen leven in sup_offers).
--
-- Vorm van score_inputs (gevalideerd in src/lib/product-admin/score-inputs.ts):
--   { "formKey": text,
--     "label": { werkzameStofGekwantificeerd, dagdoseringVermeld,
--                samenstellingUitgesplitst, proprietaryBlend : boolean },
--     "certificeringen": text[],
--     "kwaliteitsmarkers": { <markerKey>: boolean },
--     "dosisOnzekerReden": text | null }
--
-- Uitvoeren via de Supabase Dashboard SQL Editor — nooit `supabase db push`.

alter table public.sup_products
  add column if not exists score_inputs jsonb;

comment on column public.sup_products.score_inputs is
  'Score-invoer voor computeTrustScore (formKey, label, certificeringen, kwaliteitsmarkers, dosisOnzekerReden). Nullable: leeg = valt terug op score-inputs.ts. Geen prijs.';
