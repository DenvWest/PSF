-- Affiliate fase O — productionele uitbetaal- & onboardinggegevens op af_affiliates.
-- Gestructureerd (i.p.v. losse payout_details jsonb) zodat je compliant kunt
-- uitbetalen: IBAN/BTW/KVK/land/adres, akkoord voorwaarden, uitbetaaldrempel.
-- Uitvoeren via de Supabase Dashboard SQL Editor.

alter table public.af_affiliates
  add column if not exists iban text,
  add column if not exists payout_name text,
  add column if not exists vat_number text,
  add column if not exists coc_number text,
  add column if not exists country text,
  add column if not exists address text,
  add column if not exists payout_threshold_cents int not null default 0
    check (payout_threshold_cents >= 0),
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists terms_version text;
