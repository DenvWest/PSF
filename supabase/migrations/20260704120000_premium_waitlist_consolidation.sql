-- Premium waitlist: fix feature CHECK (live 500 on coach keys) + price indication
alter table public.premium_waitlist
  drop constraint if exists premium_waitlist_feature_check;

alter table public.premium_waitlist
  add constraint premium_waitlist_feature_check
  check (feature in (
    'inzichten', 'statistieken', 'lichaamssamenstelling',
    'voeding-coach', 'beweging-coach', 'stress-coach', 'slaap-coach', 'verbinding-coach',
    'premium-coaching'
  ));

alter table public.premium_waitlist
  add column if not exists price_indication text null;

alter table public.premium_waitlist
  drop constraint if exists premium_waitlist_price_indication_check;

alter table public.premium_waitlist
  add constraint premium_waitlist_price_indication_check
  check (price_indication is null or price_indication in (
    'lt_10', '10_20', '20_35', 'gt_35', 'unknown'
  ));
