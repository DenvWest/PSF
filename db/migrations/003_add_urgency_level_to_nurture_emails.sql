-- Voeg urgency_level toe aan nurture_emails voor toon-aanpassing in gepersonaliseerde mails
ALTER TABLE nurture_emails
ADD COLUMN IF NOT EXISTS urgency_level text;
