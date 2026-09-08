-- Het dagboek op productniveau.
--
-- Waarom naast `meals` en niet erin: `meals` is porties per voedselgroep per
-- eetmoment ({ "ontbijt": { "zuivel": 1 } }), en dat blijft de vorm waar de
-- analyse op rekent. `items` is dezelfde dag één laag fijner — welk product,
-- hoeveel porties — en telt bij het opslaan naar `meals` en `portions` toe.
-- Een dag uit de groepen-tijd heeft dus een lege `items` en blijft volledig
-- leesbaar; een dag met items levert automatisch dezelfde groepstellingen op.
--
-- Waarom het product ertoe doet: "3 porties groente" is voor magnesium en
-- foliumzuur een heel ander antwoord bij spinazie dan bij komkommer. Zonder
-- het product kan het Kompas alleen een gemiddelde groente verzinnen.
--
-- Nog steeds GEEN score-, calorie- of gram-kolom. De gehaltes staan in de
-- codebase (food-items.ts, verified:false) en zijn productkennis; wat hier
-- opgeslagen wordt is uitsluitend wat je at.
alter table public.account_nutrition_daybook
  add column if not exists items jsonb not null default '{}'::jsonb;

comment on column public.account_nutrition_daybook.items is
  'Producten per eetmoment: { "ontbijt": [{ "k": "havermout", "n": 1 }] }. k = sleutel in food-items.ts, n = aantal porties. meals en portions worden hieruit afgeleid bij het opslaan.';
