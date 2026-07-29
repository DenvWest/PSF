-- Gewicht (kg) voor de eiwit-personalisatie (g/kg, zie src/lib/protein-target.ts).
-- Alleen gezet ná expliciete body_metrics-consent (zie consent_records,
-- src/lib/body-metrics-consent.ts) via de bestaande /api/intake/protein-target-route.
-- Nooit gebruikt voor iets anders dan de eiwit-doelberekening; nooit naar de
-- client teruggestuurd (alleen de afgeleide gramsLow/gramsHigh-range).
alter table public.intake_sessions
  add column if not exists weight_kg integer;
