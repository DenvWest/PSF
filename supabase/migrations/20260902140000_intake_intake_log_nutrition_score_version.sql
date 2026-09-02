-- Versie van de voedingsscore-engine per log-rij.
--
-- Waarom een eigen kolom naast estimate_version: dat veld hoort bij de
-- nutriënt-schatting (estimateNutritionIntake), niet bij de 0-100 score. De
-- twee bewegen onafhankelijk — een nieuwe slider verandert de score-noemer
-- zonder dat er iets aan de nutriënt-drempels verandert, en andersom.
--
-- Nullable: bestaande rijen zijn met de 11-slider-versie (1.0.0) berekend maar
-- dragen dat niet. Die blijven null en gelden daarmee als niet-vergelijkbaar
-- met scores van na deze wijziging (zie isNutritionScoreComparable). Bewust
-- niet backfillen naar '1.0.0': een reeks die over de 11-naar-12-grens loopt
-- zou anders een trend tonen die alleen uit de extra vraag komt.

alter table public.intake_intake_log
  add column if not exists nutrition_score_version text;

comment on column public.intake_intake_log.nutrition_score_version is
  'Semver van de voedingsscore-engine (NUTRITION_SCORE_VERSION) op moment van loggen. Null = van vóór deze versionering (11 sliders); niet vergelijkbaar met latere scores.';
