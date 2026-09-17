-- Producten en gerechten op het 2+2-dagboek.
--
-- Waarom naast `portions` en `meals`, en niet in plaats daarvan: dezelfde
-- reden waarom `meals` er in september naast kwam. De invoervorm mag fijner
-- worden, de analyse-as niet. Alles wat vandaag rekent — breedte, variatie,
-- de weekendvergelijking, de zelfrapport-brug naar de nutriëntroutes — leest
-- `portions`, en dat blijft zo. Elk item draagt zijn voedselgroep, dus
-- `portions` wordt er bij het opslaan uit afgeleid.
--
-- Wat dit toevoegt dat `meals` niet kon: wélk product het was. Dat verschil is
-- het scherpste argument uit BESLUIT_VOEDINGSDAGBOEK_KOMPAS_V1_2026-09 §4 —
-- op groepsniveau telt "vis" tonijn uit blik (200 mg EPA/DHA) even zwaar als
-- makreel (3.000 mg), en is verrijkte margarine niet van olijfolie te
-- onderscheiden. Alleen op productniveau staat er wélke bron het was, en pas
-- daar kan een milligram-uitlezing eerlijk zijn.
--
-- Wat het NIET verandert:
--
--   * Geen tweede score. Zelfde lock als bij beweging (minuten = evidence,
--     nooit een tweede score). Dit verrijkt de readout van laag 5 en voedt
--     `nutrition-score.ts` niet.
--   * Geen dagtotaal. Een som over gekozen producten is een ONDERGRENS —
--     niemand noemt alles, en het woord "minstens" reist verplicht mee met
--     elk getal dat hieruit volgt.
--   * Geen calorieën en geen macro's. Laag 5 blijft dicht voor tellen.
--
-- Een dag uit de groepen- of momentenperiode heeft een lege `items` en blijft
-- volledig leesbaar: dat leest als "niet op productniveau ingevuld", niet als
-- nul. Dezelfde soort versiegrens die `gevraagdeGroepen()` al hanteert.
alter table public.account_nutrition_daybook
  add column if not exists items jsonb not null default '[]'::jsonb;

comment on column public.account_nutrition_daybook.items is
  'Producten en gerechten per eetmoment: [{ "moment": "ontbijt", "key": "havermout", "grams": 60 }, ...]. Invoervorm op productniveau; portions blijft de bron voor analyse en wordt hieruit afgeleid. Leeg bij dagen uit de groepen- en momentenperiode.';
