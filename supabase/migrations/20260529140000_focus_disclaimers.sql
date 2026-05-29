-- Fase 3: disclaimers + hefboom_text op themes

create table if not exists public.disclaimers (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid not null default '00000000-0000-0000-0000-000000000001'
    references public.organizations (id),
  key text not null,
  body_text text not null,
  scope text not null check (
    scope in ('screen_focus', 'theme', 'profile', 'mail')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, key)
);

alter table public.disclaimers enable row level security;

create policy "disclaimers_org_isolation_authenticated"
  on public.disclaimers
  for all
  to authenticated
  using (
    organization_id = (nullif(auth.jwt()->'app_metadata'->>'organization_id', ''))::uuid
  )
  with check (
    organization_id = (nullif(auth.jwt()->'app_metadata'->>'organization_id', ''))::uuid
  );

insert into public.disclaimers (
  organization_id,
  key,
  body_text,
  scope
) values (
  '00000000-0000-0000-0000-000000000001',
  'focus_screen',
  'Geen medisch advies. Bij aanhoudende klachten: huisarts.',
  'screen_focus'
)
on conflict (organization_id, key) do update set
  body_text = excluded.body_text,
  scope = excluded.scope,
  updated_at = now();

-- Hefboom-placeholders (Dennis vervangt via Table Editor of copy-docs)
update public.themes
set
  disclaimer_key = 'focus_screen',
  hefboom_text = case slug
    when 'sleep' then
      'Slaap is vaak de **snelste hefboom** als je overdag wazig bent of ''s nachts vaak wakker ligt. Verbeter je ritme en je omgeving eerst — supplementen vullen pas aan waar gewoonten niet rondkomen.'
    when 'stress' then
      'Stress bepaalt hoe snel je lichaam kan schakelen tussen alert zijn en herstellen. Kleine, vaste rustmomenten hebben vaak **meer effect** dan nog een product.'
    when 'nutrition' then
      'Voeding beïnvloedt energie, herstel en hoe je reageert op druk. Structurele keuzes (eiwit, vetzuren, regelmaat) zijn meestal de **eerste stap** vóór supplementen.'
    when 'movement' then
      'Beweging en kracht houden spieren en stofwisseling op peil — vooral na 40. Te veel zonder herstel kan averechts werken; **balans** is hier de hefboom.'
    else hefboom_text
  end,
  updated_at = now()
where organization_id = '00000000-0000-0000-0000-000000000001'
  and slug in ('sleep', 'stress', 'nutrition', 'movement');
