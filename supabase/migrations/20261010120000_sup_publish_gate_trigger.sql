-- Publiceerpoort als DB-invariant (BESLUIT_AFFILIATE_VERVOLG_2026-10.md, B-2).
-- Een product kan alleen naar 'published' als de DB-criteria slagen, ook bij een
-- UPDATE vanuit de SQL Editor of een service-role-call. Parallel aan
-- src/lib/product-admin/publish-gate.ts (images, actives, claims, offers,
-- affiliate-link, sources). Het zevende TS-criterium (PS-Score te berekenen)
-- staat niet in de DB: de score wordt in TypeScript berekend.
--
-- Raakt uitsluitend de overgang naar 'published'. Producten die nu al
-- 'published' zijn blijven staan (B-3); een gepubliceerd product dat op
-- 'published' blijft staan triggert niets. Tijdelijk omzeilen (bewust, alleen
-- in de SQL Editor): set local session_replication_role = replica;

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
    failures := failures || 'afbeelding met bron en licentie-notitie';
  end if;

  if not exists (select 1 from public.sup_product_actives where product_id = p_product_id)
     or exists (
       select 1 from public.sup_product_actives
       where product_id = p_product_id
         and (amount_per_serving <= 0 or btrim(coalesce(unit, '')) = '')
     ) then
    failures := failures || 'werkzame stoffen volledig ingevuld';
  end if;

  if exists (
    select 1 from public.sup_product_claims
    where product_id = p_product_id and meets_condition = false
  ) then
    failures := failures || 'gekoppelde claims halen hun drempel';
  end if;

  if not exists (
    select 1 from public.sup_offers
    where product_id = p_product_id
      and active
      and price_checked_at is not null
      and (price_checked_at at time zone 'Europe/Amsterdam')::date >= today - 30
  ) then
    failures := failures || 'actieve aanbieding met prijs jonger dan 30 dagen';
  end if;

  if not exists (
    select 1 from public.sup_offers
    where product_id = p_product_id
      and active
      and affiliate_url ~* '^https://[^/\s]+\.[^/\s]+'
  ) then
    failures := failures || 'aanbieding met geldige https-affiliate-link';
  end if;

  if not exists (select 1 from public.sup_sources where product_id = p_product_id) then
    failures := failures || 'minstens één bron';
  end if;

  return failures;
end;
$$;

create or replace function public.sup_products_publish_gate()
returns trigger
language plpgsql
as $$
declare
  failures text[];
begin
  if new.status = 'published' and (tg_op = 'INSERT' or old.status is distinct from 'published') then
    failures := public.sup_publish_gate_failures(new.id);
    if array_length(failures, 1) > 0 then
      raise exception 'Publiceren geblokkeerd door de publiceerpoort: %', array_to_string(failures, '; ')
        using errcode = 'check_violation';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists sup_products_publish_gate_trg on public.sup_products;
create trigger sup_products_publish_gate_trg
  before insert or update of status on public.sup_products
  for each row execute function public.sup_products_publish_gate();
