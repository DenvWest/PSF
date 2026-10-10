-- Herstel 20261010120000_sup_publish_gate_trigger.sql: `failures || 'tekst'` werd
-- door Postgres als array-literal gelezen (22P02 malformed array literal) zodra
-- een criterium faalde. Nu met array_append. Verder ongewijzigd; de trigger zelf
-- hoeft niet opnieuw (hij roept deze functie aan).

create or replace function public.sup_publish_gate_failures(p_product_id uuid)
returns text[]
language plpgsql
stable
as $$
declare
  failures text[] := '{}';
  today date := (now() at time zone 'Europe/Amsterdam')::date;
begin
  if not exists (
    select 1 from public.sup_product_images
    where product_id = p_product_id
      and btrim(coalesce(source, '')) <> ''
      and btrim(coalesce(license_note, '')) <> ''
  ) then
    failures := array_append(failures, 'afbeelding met bron en licentie-notitie');
  end if;

  if not exists (select 1 from public.sup_product_actives where product_id = p_product_id)
     or exists (
       select 1 from public.sup_product_actives
       where product_id = p_product_id
         and (amount_per_serving <= 0 or btrim(coalesce(unit, '')) = '')
     ) then
    failures := array_append(failures, 'werkzame stoffen volledig ingevuld');
  end if;

  if exists (
    select 1 from public.sup_product_claims
    where product_id = p_product_id and meets_condition = false
  ) then
    failures := array_append(failures, 'gekoppelde claims halen hun drempel');
  end if;

  if not exists (
    select 1 from public.sup_offers
    where product_id = p_product_id
      and active
      and price_checked_at is not null
      and (price_checked_at at time zone 'Europe/Amsterdam')::date >= today - 30
  ) then
    failures := array_append(failures, 'actieve aanbieding met prijs jonger dan 30 dagen');
  end if;

  if not exists (
    select 1 from public.sup_offers
    where product_id = p_product_id
      and active
      and affiliate_url ~* '^https://[^/\s]+\.[^/\s]+'
  ) then
    failures := array_append(failures, 'aanbieding met geldige https-affiliate-link');
  end if;

  if not exists (select 1 from public.sup_sources where product_id = p_product_id) then
    failures := array_append(failures, 'minstens één bron');
  end if;

  return failures;
end;
$$;
