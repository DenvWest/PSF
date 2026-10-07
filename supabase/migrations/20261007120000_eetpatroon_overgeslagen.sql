-- Eetpatroon in Je doelen + "niet gegeten" per maaltijd in het dagboek
-- (BESLUIT_EETPATROON_OVERGESLAGEN_2026-10.md).
--
-- gewone_maaltijden: welke hoofdmaaltijden iemand meestal eet. Null = alle
-- drie (de standaard). Wie periodiek vast en twee keer eet, heeft dan op 2/2
-- een volledige dag in Patroon en Trend.
-- overgeslagen: hoofdmaaltijden die je op die dag bewust niet at. Telt als
-- geregistreerd met 0, telt niet mee in je gebruikelijke gemiddelde.
-- Geen check-constraints: de server valideert tegen
-- src/lib/nutrition-eetpatroon.ts.
alter table public.account_voedingsdoelen
  add column if not exists gewone_maaltijden text[];

alter table public.account_nutrition_daybook
  add column if not exists overgeslagen text[] not null default '{}';

comment on column public.account_voedingsdoelen.gewone_maaltijden is
  'Hoofdmaaltijden die je meestal eet (ontbijt/lunch/avondeten), of null = alle drie. Bepaalt wanneer een dag volledig is.';
comment on column public.account_nutrition_daybook.overgeslagen is
  'Hoofdmaaltijden die op deze dag bewust niet gegeten zijn. Tellen als geregistreerd met 0, niet in het gebruikelijke gemiddelde.';
