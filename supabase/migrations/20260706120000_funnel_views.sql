-- Funnel-health views voor pull-based n8n weekrapport (T1–T6 transformaties).
-- Doel: vier geaggregeerde views die funnel-cijfers wekelijks afleesbaar maken
-- zonder handmatige SQL — zie docs/cursors/fable-conversie-datastrategie-2026-07.md §6.3.
--
-- PII-regel: views bevatten uitsluitend weken, categorieën, counts en ratio's.
-- Geen e-mail, session_id of account_id in enige view-output.
--
-- Deploy: handmatig in Supabase Dashboard SQL Editor.
-- NOOIT supabase db push — remote migratie-historie is leeg.
-- Geen CREATE ROLE / GRANT in dit bestand (Dennis draait n8n_readonly apart).

create or replace view public.v_funnel_week as
select
  date_trunc('week', occurred_at)::date as week,
  event_type,
  count(*) as events
from public.domain_events
where event_type in (
  'intake.completed',
  'email.opted_in',
  'nurture.scheduled',
  'nurture.email_sent',
  'domain_tool.snapshot_viewed',
  'domain_tool.tier_preview_clicked',
  'premium.waitlist_joined',
  'premium.price_indicated',
  'affiliate.click',
  'remeasure.invited',
  'remeasure.completed',
  'focus.viewed'
)
group by 1, 2;

create or replace view public.v_nurture_ctr as
with sent_events as (
  select
    date_trunc('week', occurred_at)::date as week,
    case
      when payload->>'sequence_day' ~ '^\d+$'
        then (payload->>'sequence_day')::integer
    end as sequence_day,
    coalesce(payload->>'profile_label', '') as profile_label,
    coalesce(payload->>'cta_kind', '') as cta_kind,
    coalesce(payload->>'cta_slug', '') as cta_slug,
    session_id
  from public.domain_events
  where event_type = 'nurture.email_sent'
),
sent_agg as (
  select
    week,
    sequence_day,
    profile_label,
    cta_kind,
    cta_slug,
    count(*) as emails_sent
  from sent_events
  group by 1, 2, 3, 4, 5
),
clicks_valid as (
  select
    (payload->>'session_id')::uuid as session_id,
    case
      when payload->>'sequence_day' ~ '^\d+$'
        then (payload->>'sequence_day')::integer
    end as sequence_day
  from public.domain_events
  where event_type = 'affiliate.click'
    and payload ? 'session_id'
    and payload->>'session_id' ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
),
attributed_clicks as (
  select
    s.week,
    s.sequence_day,
    s.profile_label,
    s.cta_kind,
    s.cta_slug,
    count(*) as attributed_clicks
  from sent_events s
  inner join clicks_valid c
    on s.session_id = c.session_id
    and s.sequence_day is not distinct from c.sequence_day
  group by 1, 2, 3, 4, 5
)
select
  sa.week,
  sa.sequence_day,
  sa.profile_label,
  sa.cta_kind,
  sa.cta_slug,
  sa.emails_sent,
  coalesce(ac.attributed_clicks, 0) as attributed_clicks,
  round(
    coalesce(ac.attributed_clicks, 0)::numeric / nullif(sa.emails_sent, 0),
    4
  ) as ctr
from sent_agg sa
left join attributed_clicks ac
  on sa.week = ac.week
  and sa.sequence_day is not distinct from ac.sequence_day
  and sa.profile_label = ac.profile_label
  and sa.cta_kind = ac.cta_kind
  and sa.cta_slug = ac.cta_slug;

create or replace view public.v_premium_intent as
select
  date_trunc('week', created_at)::date as week,
  feature,
  coalesce(source, 'onbekend') as source,
  coalesce(price_indication, 'none') as price_indication,
  count(*) as joins
from public.premium_waitlist
group by 1, 2, 3, 4;

create or replace view public.v_checkin_activity as
with checkin_rows as (
  select
    date_trunc('week', created_at)::date as week,
    session_id
  from public.intake_domain_checkin
  union all
  select
    date_trunc('week', logged_at)::date as week,
    session_id
  from public.intake_intake_log
),
checkin_agg as (
  select
    week,
    count(distinct session_id) as active_sessions,
    count(*) as total_checkins
  from checkin_rows
  group by 1
),
remeasure_agg as (
  select
    date_trunc('week', occurred_at)::date as week,
    count(*) filter (where event_type = 'remeasure.invited') as remeasure_invited,
    count(*) filter (where event_type = 'remeasure.completed') as remeasure_completed
  from public.domain_events
  where event_type in ('remeasure.invited', 'remeasure.completed')
  group by 1
)
select
  coalesce(c.week, r.week) as week,
  coalesce(c.active_sessions, 0) as active_sessions,
  coalesce(c.total_checkins, 0) as total_checkins,
  coalesce(r.remeasure_invited, 0) as remeasure_invited,
  coalesce(r.remeasure_completed, 0) as remeasure_completed
from checkin_agg c
full outer join remeasure_agg r on c.week = r.week;
