alter table public.intake_sessions
  add column if not exists recommendations jsonb,
  add column if not exists referral_source text;
comment on column public.intake_sessions.recommendations is
  'Snapshot van advies op T=0: supplements, quick_wins, urgency, profile_label, rules_version.';
comment on column public.intake_sessions.referral_source is
  'utm_source bij binnenkomst intake; null als niet aanwezig.';
