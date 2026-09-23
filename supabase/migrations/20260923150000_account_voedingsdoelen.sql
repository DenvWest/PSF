-- Eigen voedingsdoelen: gewicht, trainingsbelasting en een eventueel
-- overschreven eiwitdoel, los van de intake.
--
-- ## Waarom dit niet in intake_sessions kan
--
-- Gewicht en trainingsbelasting staan vandaag in `intake_sessions.weight_kg`
-- en in de antwoorden van de laatste check. Dat is de goede plek voor "wat
-- zei je tijdens die check", maar de verkeerde voor "wat geldt er nu": een
-- check is een momentopname die je niet los mag bijwerken zonder de historie
-- te vervalsen. Hermeting rekent tegen eerdere sessies, dus een kolom daar
-- overschrijven verandert met terugwerkende kracht wat een eerdere meting
-- beweerde.
--
-- Daarom een eigen tabel met precies één rij per account: de check blijft de
-- historie, dit is de huidige stand.
--
-- ## Waarom het eiwitdoel nullable is en geen kopie
--
-- `protein-target.ts` leidt een range af uit gewicht, trainingsbelasting en
-- leeftijd (PROT-AGE/ESPEN). Die afleiding is het product; een opgeslagen
-- kopie zou stilletjes verouderen zodra iemand zijn gewicht bijwerkt.
--
-- `eiwit_doel_g` is dus geen cache maar een *overschrijving*: null betekent
-- "gebruik de afleiding", een getal betekent "deze persoon weet iets wat de
-- formule niet weet" (een diëtist, een blessure, een doel). De afleiding
-- blijft de standaard en blijft meebewegen.
--
-- ## Waarom geen calorieën of macro's
--
-- Het dagboek kent ~40 voedingsmiddelen, gekozen omdat ze de vijf stoffen
-- dragen die dit product analyseert. Een caloriedoel daarbovenop zou een
-- bovengrens-vraag stellen ("heb ik te veel gegeten?") aan data die alleen
-- een ondergrens kan bewijzen — precies omgekeerd aan de asymmetrie-regel in
-- nutrition-tekortsysteem.ts. Zie BESLUIT_VOEDINGSFOCUS_DASHBOARD_2026-09.md.
--
-- Zelfde opzet als account_nutrient_zichtbaarheid: organization_id via
-- orgScoped() (@/lib/db/scoped), RLS deny-all, alleen server-side via
-- service role.
create table if not exists public.account_voedingsdoelen (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  organization_id uuid not null default '00000000-0000-0000-0000-000000000001'
    references public.organizations (id),
  -- Dezelfde grenzen als MIN_WEIGHT_KG/MAX_WEIGHT_KG in protein-target.ts:
  -- buiten dat bereik geeft computeProteinTarget null terug, dus een waarde
  -- die de database wel accepteert maar de formule weigert zou een doel
  -- opleveren dat nergens verschijnt.
  gewicht_kg numeric(5, 1) check (gewicht_kg is null or (gewicht_kg >= 40 and gewicht_kg <= 250)),
  -- 1–4, gelijk aan trainingLoad in protein-target.ts (max van MOV_STR/MOV_CARD).
  trainingsbelasting smallint check (trainingsbelasting is null or (trainingsbelasting between 1 and 4)),
  -- Null = gebruik de afleiding uit gewicht/belasting/leeftijd. Een getal
  -- overschrijft die. Ruim begrensd: de formule levert bij 250 kg en zware
  -- training ~450 g, en een handmatig doel mag daar iets boven kunnen.
  eiwit_doel_g smallint check (eiwit_doel_g is null or (eiwit_doel_g between 20 and 400)),
  updated_at timestamptz not null default now(),
  unique (account_id)
);

create index if not exists account_voedingsdoelen_account_id_idx
  on public.account_voedingsdoelen (account_id);

alter table public.account_voedingsdoelen enable row level security;
-- Geen anon/authenticated policies: alleen service role via API-routes.

comment on table public.account_voedingsdoelen is
  'Eigen voedingsdoelen per account (gewicht, trainingsbelasting, overschreven eiwitdoel). Eén rij per account. De intake blijft de historie; deze tabel is de huidige stand.';
comment on column public.account_voedingsdoelen.gewicht_kg is
  'Huidig gewicht in kg. Overschrijft intake_sessions.weight_kg voor het eiwitdoel, zonder de checkhistorie te raken. Grenzen gelijk aan protein-target.ts (40-250).';
comment on column public.account_voedingsdoelen.trainingsbelasting is
  'Trainings-/krachtbelasting 1-4, gelijk aan trainingLoad in protein-target.ts. Null = leid af uit de laatste check.';
comment on column public.account_voedingsdoelen.eiwit_doel_g is
  'Handmatig eiwitdoel in gram. Null betekent: gebruik de afleiding uit gewicht, belasting en leeftijd. Geen cache van die afleiding - die zou verouderen zodra het gewicht wijzigt.';
