-- Plak 4 — Daisycon-netwerk + 3 retailer-partners (Vitaminstore, VitalNutrition,
-- Arctic Blue), nodig als brug voor sup_retailers.pd_partner_id.
--
-- Ontdekt tijdens het bouwen van plak 4: pd_networks bevatte alleen "Arctic Blue"
-- in productie (Daisycon ontbrak, bewust verwijderd/hernoemd door Dennis op een
-- eerder moment) en pd_partners bevatte alleen "möllers" — geen van de drie
-- retailers achter de bestaande affiliate-links (ds1.nl/bdt9.net = Daisycon,
-- arctic-blue.com = direct) had een eigen PartnerDesk-dossier. Zonder die
-- dossiers kan sup_retailers.pd_partner_id niet correct koppelen.
-- Uitvoeren via de Supabase Dashboard SQL Editor — nooit `supabase db push`.

insert into public.pd_networks (name, kind, login_url)
values ('Daisycon', 'network', 'https://www.daisycon.com/nl/login/')
on conflict (name) do nothing;

insert into public.pd_partners (network_id, slug, name, status, website)
select n.id, 'vitaminstore', 'Vitaminstore', 'active', 'https://www.vitaminstore.nl'
from public.pd_networks n
where n.name = 'Daisycon'
on conflict (slug) do nothing;

insert into public.pd_partners (network_id, slug, name, status, website)
select n.id, 'vitalnutrition', 'VitalNutrition', 'active', 'https://www.vitalnutrition.nl'
from public.pd_networks n
where n.name = 'Daisycon'
on conflict (slug) do nothing;

insert into public.pd_partners (network_id, slug, name, status, website)
select n.id, 'arctic-blue', 'Arctic Blue', 'active', 'https://www.arctic-blue.com'
from public.pd_networks n
where n.name = 'Arctic Blue'
on conflict (slug) do nothing;
