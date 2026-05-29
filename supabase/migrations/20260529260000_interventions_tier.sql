-- Fase 3b: stepped-care tier-velden op interventions + paid-disclosure
-- tier stuurt alleen volgorde + visuele trap; kind blijft semantische renderer-tag.

alter table public.interventions
  add column if not exists tier int not null default 1
    check (tier between 1 and 5),
  add column if not exists is_paid boolean not null default false,
  add column if not exists paid_disclosure_key text,
  add column if not exists external_provider_label text,
  add column if not exists external_provider_url text;

create index if not exists interventions_theme_tier_idx
  on public.interventions (theme_id, tier);

comment on column public.interventions.tier is
  '1=Quick win (gratis, vandaag), 2=Bouwen (meten/tracken), 3=Ondersteuning (supplement/affiliate), 4-5=Betaalde treden';
comment on column public.interventions.is_paid is
  'true voor affiliate-supplementen en betaalde externe diensten; triggert disclosure-regel.';
comment on column public.interventions.paid_disclosure_key is
  'Verwijst naar disclaimers.key voor de inline disclosure boven een betaalde actie.';
comment on column public.interventions.external_provider_label is
  'Verplicht zichtbaar bij betaalde externe diensten (Aangeboden door ...).';

-- Bestaande seed-content mappen: tier afgeleid van kind; supplement => betaald.
update public.interventions
set
  tier = case kind
    when 'free_action' then 1
    when 'measurement' then 2
    when 'supplement' then 3
    else tier
  end,
  is_paid = (kind = 'supplement'),
  paid_disclosure_key = case
    when kind = 'supplement' then 'paid_action_default'
    else paid_disclosure_key
  end,
  updated_at = now()
where organization_id = '00000000-0000-0000-0000-000000000001';

-- Generieke affiliate/partner-disclosure (placeholder; eigenaar levert definitieve zin).
insert into public.disclaimers (
  organization_id,
  key,
  body_text,
  scope
) values (
  '00000000-0000-0000-0000-000000000001',
  'paid_action_default',
  'Affiliate: we kunnen een vergoeding ontvangen als je via deze link koopt. Dit beïnvloedt onze beoordeling niet.',
  'theme'
)
on conflict (organization_id, key) do update set
  body_text = excluded.body_text,
  scope = excluded.scope,
  updated_at = now();
