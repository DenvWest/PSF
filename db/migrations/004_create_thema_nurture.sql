CREATE TABLE thema_nurture (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now() NOT NULL,
  email text NOT NULL,
  thema text NOT NULL,
  sequence_day integer NOT NULL,
  scheduled_at timestamptz NOT NULL,
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'unsubscribed')),
  sent_at timestamptz,
  resend_id text,
  error_message text
);

-- Index voor cron-query (pending + scheduled_at)
CREATE INDEX idx_thema_nurture_pending ON thema_nurture (status, scheduled_at)
  WHERE status = 'pending';

-- Index voor unsubscribe lookup
CREATE INDEX idx_thema_nurture_email_thema ON thema_nurture (email, thema);

-- RLS
ALTER TABLE thema_nurture ENABLE ROW LEVEL SECURITY;

-- Anon kan inserts doen (voor de download-route)
CREATE POLICY "anon_insert_thema_nurture" ON thema_nurture
  FOR INSERT TO anon WITH CHECK (true);

-- Service role kan alles (voor cron)
CREATE POLICY "service_all_thema_nurture" ON thema_nurture
  FOR ALL TO service_role USING (true) WITH CHECK (true);
