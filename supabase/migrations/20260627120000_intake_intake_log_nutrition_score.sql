-- Voeding-categoriescore (0–100) uit de Lifesum-stijl voedingscheck.
-- Voedt de voeding-pijler + Vitaliteit op het dashboard (account-dashboard.ts).
-- Nullable: bestaande rijen (oude voedingscheck) hebben geen score.

alter table public.intake_intake_log
  add column if not exists nutrition_score smallint
    check (nutrition_score is null or (nutrition_score >= 0 and nutrition_score <= 100));

comment on column public.intake_intake_log.nutrition_score is
  'Punt-gebaseerde voeding-categoriescore (0–100) uit de slider-voedingscheck; reflectie van zelf-gerapporteerde frequentie, geen status of diagnose.';
