# Voorstel — de check op /intake kan zelf een sessie aanmaken

**Datum:** 24 september 2026
**Status:** voorstel, nog niet besloten — vraagt Dennis' akkoord vóór er schema wijzigt
**Beoordeeld (25 sep):** `BESLUITDOCUMENT_SESSIE_ARCHITECTUUR_2026-09.md` — GO WITH CHANGES; o.a. stap 1 blijkt al zo te zijn (kolommen zijn al nullable), er is een tweede filter (`intakeSessionRowToPayload`), Turnstile ontbreekt op het nieuwe pad. Lees dat document vóór je dit uitvoert.
**Aanleiding:** gevonden tijdens het herstellen van de "Voedingcheck"-regressie
(zie `CORRECTIE_VOEDINGCHECK_NAAMGEVING_2026-09.md`) en Dennis' vraag hoe dit
zich verhoudt tot een grotere toekomst: affiliate-attributie, nurture-mails,
n8n-outbox rond de check.
**Vervolg op:** `BESLUIT_VOEDINGSFOCUS_DASHBOARD_2026-09.md` §3.9 (de check
op `/intake` als enige ingang) — dit voorstel lost een gat op dat dat besluit
niet behandelde.

---

## 1. Het probleem, in één zin

Elke nieuwe bezoeker die rechtstreeks de check op `/intake` doet — dus
precies de bezoeker die §3.9 als enige ingang bedoelde — kan zijn resultaat
niet opslaan, omdat opslaan een sessie vereist die alleen de niet meer
gepromote brede check (`/intake/leefstijl`) nog aanmaakt.

## 2. Hoe dat concreet werkt

- `src/app/api/intake/nutrition-log/route.ts:144-152` verifieert een
  signed cookie (`psf_intake_sid`) en geeft **401** terug als die ontbreekt
  — met de letterlijke boodschap "Doe eerst de Leefstijlcheck via /intake."
- Die cookie wordt in de hele codebase **op precies één plek** gezet:
  `src/app/api/intake/session/route.ts:604`, ná een insert in
  `intake_sessions` — dat is de POST-route van de brede check.
- `intake_intake_log` (de tabel achter de voedingscheck-resultaten) heeft
  een `session_id`-foreign key naar `intake_sessions` — de voedingscheck is
  technisch een *kind* van een brede-check-sessie, geen eigenstandige ingang.
- `NutritionCapture.tsx` checkt dit nu vóór de eerste vraag (toegevoegd
  tijdens de correctie) en toont een vriendelijke hand-off naar
  `/intake/leefstijl` — dat werkt, maar betekent dat **iedere nieuwe
  bezoeker via de brede, niet-gepromote check moet**, voor hij zijn
  voedingscheck-resultaat kan bewaren.

## 3. Waarom dit de kern is voor de toekomst die je schetst

`src/app/api/intake/session/route.ts` bevat al precies de infrastructuur die
affiliate-attributie, nurture en n8n nodig hebben:
- `scheduleMainNurtureIfInactive({ sessionId: row.id, email, ... })` —
  plant de dag-0/3/7/14/21/30-reeks.
- `emitEvent({ eventType: ..., sessionId: row.id, ..., deliveredTo:
  ["n8n_webhook"] })` — de outbox-naad naar n8n.
- `signIntakeSessionId(row.id)` — de sessie-identiteit die dit alles aan
  elkaar knoopt, en die (potentieel) ook de haak is voor een toekomstige
  `psz_aff_ref`-achtige affiliate-attributie op een lead.

Al deze infrastructuur hangt aan `row.id` van een `intake_sessions`-insert.
Zonder een eigen ingang voor de check zelf, heeft **geen enkele bezoeker die
uitsluitend de gepromote check doet** ooit een `intake_sessions`-rij — dus
geen lead, geen nurture, geen n8n-event, geen toekomstige
affiliate-toekenning op zijn eerste bezoek. Dit raakt dus niet alleen de
UX-blokkade van vandaag, maar blokkeert het hele groeikanaal dat je voor
ogen hebt.

## 4. Waarom een simpele insert vanuit nutrition-log niet volstaat

`IntakeSessionInsert` (`src/types/intake-session-insert.ts`) eist nu
verplicht: `symptom_profile`, `answers` (brede-check-vorm), `domain_scores`
(alle 7 sleutels), `urgency_level`, `profile_label`, `age_range`, `gender`,
`rules_version` — allemaal betekenisloos voor een voedingscheck-only
bezoeker. Twee opties, geen van beide goed genoeg:

- **Verzonnen/lege waarden invullen** → `account-dashboard.ts:410-419`
  filtert een sessie zonder geldige `domain_scores`/`profile_label` alsnog
  weg (`if (!domainScores || !profileLabel || ...) return null`) — de
  bezoeker heeft dan wel een rij, maar het dashboard toont nog steeds niets.
- **Een volledig profiellabel fabriceren** (bv. "In Balans") → corrumpeert
  het dashboard met een vals signaal over domeinen die nooit gemeten zijn.

## 5. Voorstel

Een kleine, **additieve** migratie — geen bestaande rij verandert:

1. `intake_sessions`: `domain_scores`, `symptom_profile`, `profile_label`,
   `urgency_level`, `age_range`, `gender` nullable maken.
2. `session_kind` bestaat al als kolom met `"initial" | "remeasure"`
   (`IntakeSessionInsert.session_kind`) — uitbreiden met `"nutrition"`.
   Geen nieuwe kolom nodig, alleen het type en de check-constraint (indien
   die er is) verruimen.
3. Nieuwe, kleine insert-functie in `nutrition-log/route.ts`: als
   `verifySignedIntakeSessionCookie` niets teruggeeft, zelf een
   `intake_sessions`-rij aanmaken met `session_kind: "nutrition"` en de
   brede-check-velden op `null`, `signIntakeSessionId(row.id)` tekenen,
   cookie zetten — daarna precies dezelfde opslag- en nurture-infrastructuur
   hergebruiken die `session/route.ts` al heeft.
4. `account-dashboard.ts`'s validity-filter (regel 410-419) aanpassen: een
   `session_kind === "nutrition"`-rij is geldig **zonder**
   `domain_scores`/`profile_label` — het dashboard toont dan alleen de
   voedingscheck-uitkomst (die al apart via `intake_intake_log` geladen
   wordt), geen leefstijlprofiel/vitaliteit.
5. `NutritionCapture.tsx`'s 401-hand-off-scherm en de vroege sessie-check
   (beide toegevoegd tijdens de correctie) kunnen vervallen zodra dit staat
   — er is dan geen falende sessie meer om voor te vangen.

## 6. Wat dit niet doet

- **Raakt de brede-check-engine niet.** `RULES_VERSION`, `domain_scores`-
  berekening, hermeting-deltalogica blijven exact zoals ze zijn.
- **Geen bestaande rij verandert.** Puur nieuwe, optionele kolommen +
  een nieuwe geldige `session_kind`-waarde.
- **Geen nieuwe tabel.** Hergebruikt `intake_sessions` en de al bestaande
  nurture/event-infrastructuur.

## 7. Openstaande vragen voor Dennis

- Akkoord met de migratie-richting (nullable kolommen + `session_kind:
  "nutrition"`), of liever een aparte, kleinere tabel voor
  voedingscheck-only sessies?
- Moet een `session_kind: "nutrition"`-bezoeker later, als hij alsnog de
  brede check doet, samenvloeien met zijn eerste sessie, of blijft dat twee
  losse rijen (zoals nu ook geen koppeling bestaat tussen anonieme
  sessies)?
- Welke nurture-inhoud hoort bij een `"nutrition"`-sessie — de bestaande
  dag-0/3/7/14/21/30-reeks is geschreven voor brede-check-profielen
  (`Lage Energie`, `Onrustige Slaper`, ...) en heeft voor een
  voedingscheck-only lead nieuwe copy nodig.

**Bij akkoord:** de migratie zelf gaat via de Supabase Dashboard SQL Editor
(nooit `supabase db push`), met een blok in
`supabase/migrations/OPENSTAAND.md` inclusief "Blokkeert deploy" — conform
CLAUDE.md. Nog niet uitgevoerd; dit document is de beoordelingsbasis.
