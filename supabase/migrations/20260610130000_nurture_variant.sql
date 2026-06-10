-- P3: Reserveer variant-dimensie op nurture_emails (nullable, altijd null in fase-0).
-- Maakt A/B-tests later een config-flag i.p.v. schema-wijziging.
-- Geen default-waarde: bestaande rijen blijven NULL; nieuwe rijen zetten NULL expliciet.
--
-- ⚠ DEPLOY-VEREISTE: deze migratie MOET zijn toegepast vóór de app-deploy.
-- Zonder de kolom falen nurture.ts en nurture-cron.ts bij elke insert op nurture_emails
-- omdat `variant: null` door de Supabase-client wordt meegestuurd.
--
-- Apply op live DB (Supabase dashboard → SQL Editor, of via CLI):
--   supabase db push  (aanbevolen — past alle pending migraties toe)
--
-- Controleer na apply:
--   select column_name, data_type, is_nullable
--   from information_schema.columns
--   where table_schema = 'public'
--     and table_name  = 'nurture_emails'
--     and column_name = 'variant';
-- Verwachte output: variant | text | YES
--
-- Idempotent: `add column if not exists` is veilig bij herhaling.

alter table public.nurture_emails
  add column if not exists variant text;
