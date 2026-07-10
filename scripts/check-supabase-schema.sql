-- Schema-manifest voor scripts/check-supabase-schema.sh
-- Output (csv): status, kind, name
-- status = OK | MISSING
-- Geen PII — alleen information_schema / pg_catalog metadata.

select status, kind, name
from (
  -- intake_sessions kolommen
  select
    case when exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'intake_sessions' and column_name = 'recommendations'
    ) then 'OK' else 'MISSING' end as status,
    'column' as kind,
    'intake_sessions.recommendations' as name
  union all
  select
    case when exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'intake_sessions' and column_name = 'referral_source'
    ) then 'OK' else 'MISSING' end,
    'column',
    'intake_sessions.referral_source'
  union all
  select
    case when exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'intake_sessions' and column_name = 'rules_version'
    ) then 'OK' else 'MISSING' end,
    'column',
    'intake_sessions.rules_version'
  union all
  select
    case when exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'intake_sessions' and column_name = 'session_kind'
    ) then 'OK' else 'MISSING' end,
    'column',
    'intake_sessions.session_kind'
  union all
  -- intake_intake_log
  select
    case when exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = 'intake_intake_log' and table_type = 'BASE TABLE'
    ) then 'OK' else 'MISSING' end,
    'table',
    'intake_intake_log'
  union all
  select
    case when exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'intake_intake_log' and column_name = 'nutrition_score'
    ) then 'OK' else 'MISSING' end,
    'column',
    'intake_intake_log.nutrition_score'
  union all
  -- domain_events
  select
    case when exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = 'domain_events' and table_type = 'BASE TABLE'
    ) then 'OK' else 'MISSING' end,
    'table',
    'domain_events'
  union all
  -- funnel views (bron: supabase/migrations/20260706120000_funnel_views.sql)
  select
    case when exists (
      select 1 from information_schema.views
      where table_schema = 'public' and table_name = 'v_funnel_week'
    ) then 'OK' else 'MISSING' end,
    'view',
    'v_funnel_week'
  union all
  select
    case when exists (
      select 1 from information_schema.views
      where table_schema = 'public' and table_name = 'v_nurture_ctr'
    ) then 'OK' else 'MISSING' end,
    'view',
    'v_nurture_ctr'
  union all
  select
    case when exists (
      select 1 from information_schema.views
      where table_schema = 'public' and table_name = 'v_premium_intent'
    ) then 'OK' else 'MISSING' end,
    'view',
    'v_premium_intent'
  union all
  select
    case when exists (
      select 1 from information_schema.views
      where table_schema = 'public' and table_name = 'v_checkin_activity'
    ) then 'OK' else 'MISSING' end,
    'view',
    'v_checkin_activity'
  union all
  -- premium_waitlist consolidatie (9 feature keys incl. premium-coaching)
  select
    case when exists (
      select 1
      from pg_constraint c
      join pg_class t on c.conrelid = t.oid
      join pg_namespace n on t.relnamespace = n.oid
      where n.nspname = 'public'
        and t.relname = 'premium_waitlist'
        and c.conname = 'premium_waitlist_feature_check'
        and pg_get_constraintdef(c.oid) like '%premium-coaching%'
    ) then 'OK' else 'MISSING' end,
    'constraint',
    'premium_waitlist_feature_check'
) checks
order by kind, name;
