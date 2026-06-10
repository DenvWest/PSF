-- P3: Reserveer variant-dimensie op nurture_emails (nullable, altijd null in fase-0).
-- Maakt A/B-tests later een config-flag i.p.v. schema-wijziging.
-- Geen default-waarde: bestaande rijen blijven NULL; nieuwe rijen zetten NULL expliciet.

alter table public.nurture_emails
  add column if not exists variant text;
