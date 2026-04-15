ALTER TABLE intake_reminders
  ADD COLUMN IF NOT EXISTS reminder_type text NOT NULL DEFAULT 'day30',
  ADD COLUMN IF NOT EXISTS session_id uuid REFERENCES intake_sessions(id),
  ADD COLUMN IF NOT EXISTS organization_id uuid;
