-- Eetmomenten en water op het 2+2-dagboek.
--
-- Waarom naast `portions` en niet erin: de momenten zijn de invoervorm, het
-- dagtotaal is de bron. Alles wat vandaag rekent (breedte, variatie,
-- weekendvergelijking, de zelfrapport-brug naar de nutriëntroutes) leest
-- `portions`, en dat blijft zo — `meals` wordt er bij het opslaan naartoe
-- opgeteld. Een dag die met de oude platte lijst is ingevuld heeft dus een
-- lege `meals` en blijft volledig leesbaar.
--
-- Water krijgt wél een eenheid waar voedsel dat niet krijgt. De drie redenen
-- die grammen blokkeren (bron-onzekerheid, verified:false in food-sources,
-- biobeschikbaarheid zoals fytaat) gelden geen van drieën voor water. Wat er
-- nog steeds niet mag: het als "dagbehoefte gehaald" presenteren — die
-- vuistregel is geen richtlijn.
alter table public.account_nutrition_daybook
  add column if not exists meals jsonb not null default '{}'::jsonb;

alter table public.account_nutrition_daybook
  add column if not exists water_ml integer;

comment on column public.account_nutrition_daybook.meals is
  'Porties per voedselgroep per eetmoment: { "ontbijt": { "zuivel": 1 }, ... }. Invoervorm; portions blijft de bron voor analyse. Leeg bij dagen uit de platte-lijst-periode.';

comment on column public.account_nutrition_daybook.water_ml is
  'Water in milliliters, of null. Registratie zonder norm — geen dagbehoefte-oordeel.';
