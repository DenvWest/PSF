-- Leeftijd in jaren en dagactiviteit in Je doelen
-- (BESLUIT_KERNSTOF_NORMEN_2026-10.md, herziening 6 okt).
--
-- leeftijd: wint van de leeftijdsband uit de check; verandert calcium,
-- vitamine D (70+), de eiwitondergrens (65+) en de vezelnorm.
-- activiteit: 1–4 (PAL 1,4 / 1,6 / 1,8 / 2,0, EFSA 2013 en Gezondheidsraad
-- 2022); alleen voor de energiebehoefte achter de vezelnorm (3,0 g per MJ).
-- Er wordt geen kcal-getal getoond.
-- zeventig_plus blijft bestaan en telt alleen zolang leeftijd leeg is.
-- Geen check-constraints: de server valideert tegen
-- src/lib/account-kernstof-profiel.ts.
alter table public.account_kernstof_profiel
  add column if not exists leeftijd integer,
  add column if not exists activiteit smallint;

comment on column public.account_kernstof_profiel.leeftijd is
  'Leeftijd in jaren (18–110) of null (= band uit de check). Bepaalt calcium, vitamine D 70+, eiwitondergrens 65+ en de vezelnorm.';
comment on column public.account_kernstof_profiel.activiteit is
  '1 zittend · 2 licht actief · 3 actief · 4 zeer actief (PAL 1,4–2,0) of null (= 1,6). Alleen voor de vezelnorm per MJ.';
