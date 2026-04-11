-- Feedback na intake-resultaten; koppel aan intake_sessions.id
create table if not exists public.intake_feedback (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.intake_sessions (id) on delete cascade,
  rating text not null check (rating in ('positive', 'negative')),
  comment text,
  created_at timestamptz not null default now()
);

create index if not exists intake_feedback_session_id_idx
  on public.intake_feedback (session_id);
