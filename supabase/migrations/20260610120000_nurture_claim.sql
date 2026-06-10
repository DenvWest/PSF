-- P1: Atomaire cron-claim voor nurture_emails.
-- Voegt 'sending'-status toe als claim-slot tussen pending en sent.
-- claimed_at registreert wanneer een run de rij claimde; gebruikt voor stuck-detectie (>15 min).
-- Op productie zijn de constraints per naam bekend; drop + re-add is veilig omdat de tabel
-- nooit in 'sending' staat (status was 'pending'|'sent'|'failed'|'cancelled').

alter table public.nurture_emails
  drop constraint if exists nurture_emails_status_check;

alter table public.nurture_emails
  add constraint nurture_emails_status_check
  check (status in ('pending', 'sending', 'sent', 'failed', 'cancelled'));

alter table public.nurture_emails
  add column if not exists claimed_at timestamptz;
