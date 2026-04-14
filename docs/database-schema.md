# Supabase schema

## intake_sessions
- id (uuid, pk)
- created_at (timestamptz)
- symptom_profile (text[])
- answers (jsonb) — keys zijn data-tags zoals SLP_QUAL
- domain_scores (jsonb) — 6 domeinen, score 0-100
- urgency_level (text)
- profile_label (text)
- age_range (text) — "40-44", "45-49", "50-54", "55+"
- marketing_email (text, nullable)
- organization_id (uuid, nullable — nog niet in gebruik)

## intake_reminders
- id (uuid, pk)
- created_at (timestamptz)
- email (text)
- reminder_date (timestamptz)
- sent (boolean, default false)

## intake_feedback
- id (uuid, pk)
- created_at (timestamptz)
- session_id (uuid, nullable)
- rating (text) — "positive" of "negative"
- comment (text, nullable)

## affiliate_clicks
- bestaande tabel, niet aanraken

RLS aan op alle tabellen. Anon kan inserts doen op sessions, reminders en feedback. Reads op sessions en feedback. Admin dashboard gebruikt service_role key.
