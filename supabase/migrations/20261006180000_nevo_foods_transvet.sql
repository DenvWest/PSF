-- Transvet in nevo_foods (BESLUIT_DAGBOEK_RINGEN_IN_LAGEN_2026-10.md, aanvulling 3).
--
-- NEVO publiceert "Vetzuren trans totaal" (stofcode FATRS, gram per 100 g).
-- Het EU-etiket vraagt er niet om, dus sm_products krijgt geen kolom; alleen
-- NEVO-producten hebben een waarde. Weergave zonder norm, als "waarvan trans"
-- in de voedingswaardetabel.
--
-- Na deze migratie: `node scripts/nevo-laden.mjs --schrijf` opnieuw draaien
-- (upsert op nevo_code), zodat de bestaande rijen de waarde krijgen.
alter table public.nevo_foods
  add column if not exists trans_fat_g numeric(8, 2) check (trans_fat_g is null or trans_fat_g >= 0);

comment on column public.nevo_foods.trans_fat_g is
  'Vetzuren trans totaal (NEVO FATRS), gram per 100 g/ml. Null = niet gemeten of spoor.';
