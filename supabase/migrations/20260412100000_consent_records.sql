-- AVG Art. 9: toestemming bijzondere persoonsgegevens; audittrail via consent_records
create table if not exists public.consent_records (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.intake_sessions (id) on delete set null,
  consent_type text not null,
  consent_version text not null,
  granted boolean not null,
  consent_text text not null,
  granted_at timestamptz default now(),
  withdrawn_at timestamptz,
  ip_hash text,
  ua_hash text
);

create index if not exists consent_records_session_id_idx
  on public.consent_records (session_id);

create index if not exists consent_records_type_session_idx
  on public.consent_records (consent_type, session_id);

alter table public.consent_records enable row level security;

-- Optioneel: e-mail voor marketingtoestemming bij intake (alleen gezet bij expliciete opt-in)
alter table public.intake_sessions
  add column if not exists marketing_email text;

create or replace function public.has_active_consent(
  p_session_id uuid,
  p_consent_type text
)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.consent_records cr
    where cr.session_id = p_session_id
      and cr.consent_type = p_consent_type
      and cr.granted = true
      and cr.withdrawn_at is null
  );
$$;
