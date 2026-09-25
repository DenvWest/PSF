# Besluitdocument — sessie-architectuur: de check krijgt een eigen sessie-ingang

**Datum:** 25 september 2026
**Status:** **besloten 25 sep** — Dennis akkoord op de richting en de acht wijzigingen (§17). Uitvoering in plakken, S0 afgerond (§18). Wat nog open staat, staat in §17 onder "Stand van de beslispunten".
**Beoordeelt:** [`VOORSTEL_CHECK_SESSIE_LOSKOPPELEN_2026-09.md`](VOORSTEL_CHECK_SESSIE_LOSKOPPELEN_2026-09.md) (24 sep)
**Hangt samen met:** [`BESLUIT_VOEDINGSFOCUS_DASHBOARD_2026-09.md`](BESLUIT_VOEDINGSFOCUS_DASHBOARD_2026-09.md) §3.9 (de check op `/intake` is de enige ingang) · [`BESLUIT_VOEDINGSCHECK_RESULTAAT_PER_STOF_2026-09.md`](BESLUIT_VOEDINGSCHECK_RESULTAAT_PER_STOF_2026-09.md) §B ("Past bij jou" leest de check) · [`ARCHITECTUUR_CONVERSATIONELE_VOEDINGSINVOER_2026-09.md`](ARCHITECTUUR_CONVERSATIONELE_VOEDINGSINVOER_2026-09.md) (de chatlaag die hierop zou voortbouwen)

Geschreven zodat een ontwikkelaar die de chat van 24–25 sep niet kent het kan beoordelen. Elke bewering over de code verwijst naar een bestand; regelnummers gelden voor commit `cad3ad2e`.

---

## 0. Conclusie vooraf

**Het voorstel van 24 sep: GO WITH CHANGES.** De richting klopt: de check op `/intake` moet zelf een sessie kunnen aanmaken, in de bestaande tabel `intake_sessions`, zonder nieuwe tabel. Maar het voorstel onderschat het werk op drie punten en mist drie risico's:

1. **Stap 1 van het voorstel is al gedaan.** De zes kolommen die "nullable moeten worden" zijn in het schema nooit `NOT NULL` geweest. Het "verplicht" zit alleen in het TypeScript-type en in twee validatiefilters. De migratie krimpt tot één check-constraint (§6).
2. **Er zijn twee filters die een voedingssessie weggooien, niet één.** Het voorstel noemt `account-dashboard.ts`. Het tweede, `intakeSessionRowToPayload`, staat onder `/supplementen` ("Past bij jou"), het plan, de feedback-route, de nurture-cron en nog zes andere plekken (§2, P3).
3. **Nurture hergebruiken kan niet.** De check vraagt geen e-mailadres. Zonder e-mail is er geen nurture. Dat is een productbeslissing, geen techniek (§3.6).
4. **Risico: `nutrition-log` heeft geen botcheck.** De brede check draait Turnstile en een honeypot vóór de insert; `nutrition-log` niet. Als die route zelf rijen gaat aanmaken, wordt hij een onbeschermde ingang om rijen in te voegen (§3.3, R1).
5. **Risico: ingelogd is niet hetzelfde als een sessie.** Een ingelogde gebruiker op een nieuw apparaat krijgt nu een 401. Na het voorstel zoals het er staat krijgt hij een anonieme sessie die niet aan zijn account hangt, en die ziet zijn dashboard dan niet (§2, P4).
6. **Risico: de hermetingsherinnering valt weg.** De cron stuurt alleen een herinnering bij precies één sessie per account. Een extra voedingssessie schakelt die herinnering dus stil uit (§14, R3).

**Een grote ontkoppeling (een aparte visitor-tabel, een conversation-tabel, een nieuw identiteitsmodel): DO NOT MIGRATE YET.** Het account is al de duurzame identiteit, en het dagboek hangt er al aan. Een tweede identiteitslaag lost vandaag geen enkel probleem op dat de kleine migratie niet ook oplost (§4).

---

## 1. Huidige situatie

### 1.1 Drie lagen, twee cookies

Er is geen Supabase Auth. Beide cookies zijn eigen HMAC-tokens; alle data loopt via de service-role-client, en de tabellen hebben RLS aan zonder policies (deny-all).

| Laag | Mechanisme | Code | Levensduur |
|---|---|---|---|
| **Authenticatie** | `psf_account` = `accountId.issuedAt.HMAC`, uitgegeven na magic link of code; geen wachtwoord | `src/lib/account-session-cookie.ts`, `src/lib/account-server.ts` | 90 dagen |
| **Account** | `accounts`: pseudonieme identiteit (citext-e-mail, `active`/`revoked`) | migratie `20260614120000_account_identity.sql` | tot intrekking |
| **Anonieme sessie** | `psf_intake_sid` = `sessionId.issuedAt.HMAC` → `intake_sessions.id`. Het legacy-formaat met 2 delen (zonder expiry) wordt nog geaccepteerd | `src/lib/intake-session-cookie.ts` | cookie 90 dagen; de rij 24 maanden (`intake-retention.ts`) |

### 1.2 Wat één rij in `intake_sessions` tegelijk is

Een rij draagt vier rollen tegelijk:

1. **Anonieme identiteit.** De cookie wijst ernaar; 22 plekken in de code lezen die cookie (§1.6).
2. **Een meting.** `answers`, `domain_scores`, `profile_label`, `urgency_level` en `rules_version` vormen een momentopname die niet meer verandert. Een hermeting is een nieuwe rij met `baseline_session_id`.
3. **Toestemmingsanker.** `consent_records.session_id`, en `has_active_consent(session_id, type)` als poort.
4. **Lead.** `marketing_email`, `first_name`, `referral_source`; `nurture_emails`, `recovery_tokens` en `domain_events` gebruiken de sessie-id als sleutel; affiliate-attributie via `attributeIntakeLead`.

**Die vier samen in één rij zijn de kern van het probleem.** Wie geen meting van de brede check heeft, heeft daardoor ook geen identiteit, geen toestemmingsanker en geen lead.

### 1.3 Wat aan de sessie hangt en wat aan het account

| Aan de sessie (`session_id`, FK naar `intake_sessions`) | Aan het account (`account_id`) |
|---|---|
| `intake_intake_log` — **de check op `/intake`** (cascade bij verwijderen) | `account_nutrition_daybook` — **het 2+2-dagboek**, incl. `meals` en `items` |
| `intake_domain_checkin`, `plan_progress`, `intake_baseline_snapshots` | `account_dagboek_favorieten`, `account_voedingsdoelen`, `account_nutrient_zichtbaarheid` |
| `nurture_emails`, `recovery_tokens`, `intake_feedback`, `intake_reminders` | `agenda_blocks`, `account_favorites`, `account_action_reflections`, `movement_session_log` |
| `consent_records.session_id` (bij verwijderen `set null`) | `consent_records.account_id` (sinds `20260815150000`, voor toestemmingen die bij het account horen) |

**Het dagboek is dus al losgekoppeld van de sessie.** Wat de opdracht "een voedingsdag die los staat van een chatsessie" noemt, bestaat al: `account_nutrition_daybook` is uniek op `(account_id, entry_date)`.

### 1.4 Hoe sessie en account aan elkaar komen

- **`POST /api/account/request-link`** koppelt de sessie uit de cookie aan het account (`update … set account_id where account_id is null`), schrijft een `account_storage`-toestemming en plant een herinnering voor dag 30 (`request-link/route.ts:32-80`).
- **`claim_intake_sessions_for_account`** koppelt alle sessies waarvan `marketing_email` gelijk is aan het e-mailadres van het account (`20260616120000_account_claim_sessions.sql`).
- **Het dashboard** leest sessies op `account_id` (`account-dashboard.ts:375`).
- **`resolveActiveIntakeSessionId`** kiest voor een ingelogde gebruiker de nieuwste account-sessie, en anders de sessie uit de cookie (`intake-session-resolve.ts`). **Alleen `movement-checkin` gebruikt die functie.**

### 1.5 Wie sessies aanmaakt

Precies één plek: `POST /api/intake/session` — de brede check, niet meer aangeboden sinds §3.9. Die route doet achtereenvolgens: rate limit → honeypot → validatie van de antwoorden → validatie van de toestemming → **Turnstile** → insert → `consent_records` (met saga-rollback) → affiliate-lead → baseline-snapshot → `intake.completed` → nurture bij opt-in → cookie (`session/route.ts:236-632`). `recover` geeft opnieuw een cookie uit voor een sessie die al bestaat, maar maakt er geen nieuwe.

### 1.6 Wie de sessie-cookie leest (22 plekken)

`api/intake/{consent, events, feedback, movement-checkin, nutrition-log, nutrition-log/latest, plan, protein-target, recover, reminder, session, sleep-checkin, stress-checkin}` · `api/account/{login-eligibility, request-link, verify, verify-code}` · `api/chat` · `api/gids/{opt-in, sleep-analysis/event}` · `app/rapport/[sid]` · `app/supplementen`.

---

## 2. Problemen

**P1 — De enige ingang die we promoten, kan zijn resultaat niet opslaan.** `nutrition-log/route.ts:144-152` geeft een 401 zonder cookie; `NutritionCapture.tsx` vangt dat vóór de eerste vraag op en stuurt door naar `/intake/leefstijl`, de brede check die §3.9 juist uit de UI haalde. Iedere nieuwe bezoeker moet dus langs de check die we niet meer aanbieden.

**P2 — De check levert geen lead op.** Geen e-mailveld, geen nurture, geen affiliate-lead, geen `intake.completed`. Ook `measurement.checkin_completed` wordt alleen verstuurd ná een geslaagde opslag, dus ook dat blijft stil bij iedere nieuwe bezoeker. Het groeikanaal dat het voorstel noemt, is vandaag leeg.

**P3 — "Past bij jou" op `/supplementen` werkt alleen voor wie de brede check deed.** `supplementen/page.tsx:72-78` leest de laatste check alleen als `session !== null`, en `intakeSessionRowToPayload` (`intake-session-payload.ts:45-56`) geeft `null` terug zonder `symptom_profile`, `domain_scores` of `profile_label`. Besluit §B van 24 sep ("Past bij jou leest de check") geldt daardoor alleen voor de populatie van de brede check. Het voorstel mist dit: het noemt alleen het filter in het dashboard.

**P4 — Ingelogd is niet hetzelfde als een sessie.** `nutrition-log` en `nutrition-log/latest` lezen alleen de cookie. Een ingelogde gebruiker met een verlopen cookie of op een nieuw apparaat krijgt een 401, ook al heeft zijn account sessies. Na het voorstel zoals het er staat zou hij een nieuwe, anonieme sessie krijgen die niet aan zijn account hangt, en dan ziet zijn dashboard die check niet.

**P5 — De check-historie hangt aan de rij van de eerste check.** `nutrition-log/latest` leest op de sessie uit de cookie. Doet iemand na de check alsnog de brede check, dan wijst de cookie naar de nieuwe rij en is de check-historie niet meer bereikbaar via `/intake?resultaten=true`. Nu klein, want de brede check wordt niet gepromoot.

**P6 — Twee definities van "een geldige sessie".** `intake-session-payload.ts:45-56` en `account-dashboard.ts:395-420` zeggen allebei "sessie = brede check". Een derde soort sessie moet met beide rekening houden, en dat zie je niet aan de namen van die functies.

---

## 3. Voorgestelde architectuur

### 3.1 Het principe

`intake_sessions` wordt expliciet wat hij in feite al is: **het pseudonieme anker voor één bezoeker**, met een meting van de brede check als *optionele* inhoud. `session_kind` zegt welke meting een rij draagt:

| `session_kind` | Draagt | Aangemaakt door |
|---|---|---|
| `initial` | brede check, eerste keer | `POST /api/intake/session` (ongewijzigd) |
| `remeasure` | brede check, hermeting | idem (ongewijzigd) |
| **`nutrition`** (nieuw) | niets in de brede-check-kolommen; de check zelf staat in `intake_intake_log` | `POST /api/intake/nutrition-log`, als er nog geen sessie is |

Het account blijft de enige duurzame identiteit. **Samenvoegen gebeurt op het account, niet op de sessie**: sessies worden nooit samengevoegd, ze worden hooguit aan hetzelfde account gekoppeld. Zo werkt het nu ook voor de brede check.

### 3.2 Types: een discriminated union in plaats van een versoepeld type

Het huidige `IntakeSessionInsert` (`src/types/intake-session-insert.ts`) níét losser maken, want dan verliest de brede check zijn compile-time-garanties. In plaats daarvan:

```ts
export type BroadCheckSessionInsert = {
  organization_id: string;
  session_kind?: "initial" | "remeasure";
  symptom_profile: SymptomId[];
  answers: StoredIntakeAnswers;
  domain_scores: DomainScores;
  // … de bestaande velden, ongewijzigd verplicht
};

export type NutritionCheckSessionInsert = {
  organization_id: string;
  session_kind: "nutrition";
  account_id: string | null;
  referral_source: string | null;
};

export type IntakeSessionInsert = BroadCheckSessionInsert | NutritionCheckSessionInsert;
```

`intakeSessionRowToPayload` blijft streng: die functie betekent voortaan uitdrukkelijk "de payload van de brede check". Voor consumers die alleen willen weten of er een sessie is, komt er een kleine lezer:

```ts
// src/lib/intake-session-server.ts
export async function loadIntakeSessionMeta(sessionId: string): Promise<
  | { ok: true; meta: { id: string; kind: "initial" | "remeasure" | "nutrition"; accountId: string | null; createdAt: string } | null }
  | { ok: false; error: "no_admin" | "db" }
>;
```

### 3.3 Schrijfpad: één functie in `src/lib/`, achter Turnstile

- **`createNutritionCheckSession(admin, { accountId, referralSource })`** in een nieuw bestand `src/lib/intake-session-create.ts`: voegt een rij in met `session_kind: "nutrition"` en geeft de id terug. Maakt **nooit** een baseline-snapshot aan (die tabel heeft `NOT NULL`-kolommen voor profiellabel en leeftijd) en verstuurt **nooit** `intake.completed`.
- **`setIntakeSessionCookie(res, sessionId)`**: de cookie-opties staan nu letterlijk op drie plekken (`session`, `recover`, `consent`). Eén helper in `intake-session-cookie.ts`.
- **In `nutrition-log/route.ts`:**
  - *Cookie aanwezig* → precies zoals nu.
  - *Geen cookie, geen `turnstileToken`* → **401 zoals nu.** Zo blijft een oude, gecachte client zijn doorverwijzing tonen in plaats van een onbekende fout (zie §12).
  - *Geen cookie, wel een token* → honeypot, `verifyTurnstileToken` (nieuwe actie `nutrition_check_save`), sessie aanmaken, toestemming vastleggen, log invoegen. **Mislukt de insert van de log, dan wordt de nieuwe sessie weer verwijderd** (`rollbackIntakeSession` bestaat al). Daarna de cookie zetten.
- **Ingelogd zonder cookie:** `getAccountFromCookie()` geeft een account → de nieuwe sessie krijgt meteen `account_id`, plus een `account_storage`-toestemmingsrij op die sessie (hetzelfde als wat `linkSessionAndRecordConsent` in `request-link` nu doet). Zo komt de check op het dashboard van de juiste persoon.
- **Uitschakelbaar:** een omgevingsvlag (bijv. `CHECK_SESSION_CREATE_ENABLED`, standaard uit). Staat de vlag uit, dan blijft het pad van nu (401) volledig intact. Dat maakt deploy en rollback onafhankelijk van de migratie (§13).

### 3.4 Leespad: eerst "wie is dit?", dan "welke sessie?"

Eén resolver in `src/lib/intake-session-resolve.ts`, naast de bestaande:

```ts
export async function resolveCheckSubject(cookieSessionId: string | null): Promise<{
  accountId: string | null;
  /** Ingelogd: alle sessies van het account. Anoniem: de sessie uit de cookie (of leeg). */
  sessionIds: string[];
}>;
```

- **`nutrition-log/latest`** leest de laatste log over álle `sessionIds`. Dat lost P4 op voor ingelogde gebruikers, en P5 voor ingelogde gebruikers die ook de brede check deden. Voor een anonieme gebruiker blijft P5 bestaan; dat wordt als bekende beperking geaccepteerd, want de brede check wordt niet aangeboden.
- **`/supplementen`** vraagt niet langer "is er een payload van de brede check", maar "is er een sessie" (`loadIntakeSessionMeta`). Dat lost P3 op.
- **Het dashboard** (`account-dashboard.ts:375-470`) laadt `intake_intake_log` op álle sessies van het account, niet alleen op de sessies die door het snapshotfilter komen. De snapshots zelf blijven alleen voor de brede check (§8, plak S4).

### 3.5 Meetpunt

Er komt geen nieuw eventtype. `measurement.checkin_completed` bestaat al en wordt al verstuurd na elke opslag in `nutrition-log`. De payload krijgt twee velden: `session_created: boolean` en `session_kind`. Zo lees je af hoeveel checks nu wél worden opgeslagen door iemand zonder eerdere sessie. Voor de nulmeting: tot deze wijziging is dat aantal per definitie 0.

### 3.6 Wat dit bewust níét doet

- **Geen nurture voor voedingssessies.** Er is geen e-mailadres. Een opt-in op het resultaat van de check plus eigen nurture-copy is een aparte productbeslissing (plak S5). `nutrition-relog-nurture.ts` (de uitnodiging om na 14 dagen opnieuw te loggen) is daarvoor de natuurlijke eerste mail zodra er een adres is.
- **Geen affiliate-lead zonder besluit.** `attributeIntakeLead` voor voedingssessies aanroepen is één regel en faalt veilig, maar het programma `af_*` staat op de stoplijst van het verdict van 15 aug. Besluitpunt 4 in §17.
- **Raakt de engine van de brede check niet.** `RULES_VERSION` 1.4.0, de berekening van `domain_scores` en de hermeting-deltalogica blijven zoals ze zijn.

---

## 4. Waarom deze architectuur, en niet een andere

**Gekozen: een nieuwe `session_kind` op de bestaande tabel.** Dit is de kleinste wijziging die P1 tot en met P4 oplost. Toestemming, bewaartermijn, intrekking, cascade en koppeling aan een account werken meteen, omdat ze allemaal al op `intake_sessions.id` draaien.

**Afgewezen A — een aparte tabel `nutrition_check_sessions`.** `consent_records`, `nurture_emails`, `recovery_tokens`, `domain_events`, de affiliate-attributie, `intake-retention.ts` en `cleanup_intake_session_linked_data()` verwijzen allemaal naar `intake_sessions.id`. Een aparte tabel betekent die hele set dubbel uitvoeren, of een polymorfe verwijzing zonder foreign key. Dat is een parallelle database-architectuur voor iets wat een extra waarde in een bestaande kolom oplost.

**Afgewezen voor nu B — een visitor-tabel met sessies als kinderen.** Architectonisch het schoonst (identiteit los van meting), maar dan moet alles opnieuw verankerd worden: de toestemmings-audittrail, nurture, recovery en events. Daarnaast raakt het 22 plekken die de cookie lezen, in één keer. **Wanneer opnieuw bekijken:** (a) er is een anoniem productonderdeel dat een identiteit nodig heeft zonder meting (bijvoorbeeld een anonieme chat); (b) anonieme gebruikers moeten op meerdere apparaten werken zonder account; (c) scheiding tussen tenants voor B2B. De gekozen route verhindert B niet: een `intake_sessions` met `session_kind` kan later de visitor-tabel worden.

**Afgewezen C — de check hangen aan de nieuwste account-sessie** (het patroon van `movement-checkin`). Dit werkt alleen voor ingelogde gebruikers, lost dus P1 voor nieuwe bezoekers niet op, en zet een check onder een rij die de scores van de brede check van een ander moment draagt. Als leespad is het wel bruikbaar (§3.4).

---

## 5. Migratieplan

Elke plak is apart te reviewen en apart te deployen.

| Plak | Wat | Wijzigt gedrag? | Blokkeert |
|---|---|---|---|
| **S0** | Karakteriseringstests die het gedrag van nu vastleggen (§15). Controlequery's op productie (§6.1). De consumers uit R2 nalopen. | nee | — |
| **S1** | Migratie: de check-constraint op `session_kind` verruimen met `nutrition`. Blok in `OPENSTAAND.md`. | nee | S2 in productie |
| **S2** | Schrijfpad (§3.3): `intake-session-create.ts`, cookie-helper, Turnstile op de toestemmingsstap van `NutritionCapture`, uitbreiding van `nutrition-log`, vlag. | alleen met vlag aan | — |
| **S3** | Leespad (§3.4): `resolveCheckSubject`, `nutrition-log/latest`, `/supplementen`, `loadIntakeSessionMeta`. | ja (P3/P4 opgelost) | — |
| **S4** | Dashboard voor accounts met alleen voedingssessies. **Eerst uitzoeken** welke delen van `Dashboard.tsx` op snapshots van de brede check leunen; `loadAccountDashboardData` geeft nu `EMPTY_DASHBOARD_DATA` terug als er geen snapshot is (`account-dashboard.ts:446`). | ja | apart besluit over de omvang |
| **S5** | *(besluit nodig)* E-mail-opt-in op het resultaat van de check en nurture-copy voor een voedingssessie. | ja | besluitpunt 5 |
| **S6** | *(besluit nodig)* Affiliate-lead voor voedingssessies. | ja | besluitpunt 4 |
| **S7** | Opruimen: de doorverwijzing bij een 401 en de vroege sessiecheck in `NutritionCapture` verwijderen, pas nadat de vlag een tijd aan heeft gestaan zonder regressies. | nee | S2 bewezen |

**Volgorde:** S0 → S1 (Dennis draait de migratie) → S2 → vlag aan → S3 → S7. S4 tot en met S6 lopen los daarvan, elk na een eigen besluit.

---

## 6. Database-impact

### 6.1 Wat er al staat (geverifieerd in de migraties)

- `symptom_profile`, `answers`, `domain_scores`, `urgency_level`, `profile_label` staan in `20260410000000_baseline_core_tables.sql` **zonder** `NOT NULL`. `age_range`, `gender`, `rules_version`, `first_name`, `marketing_email`, `recommendations` en `referral_source` zijn later toegevoegd, ook zonder `NOT NULL`. **Alleen `organization_id` is `NOT NULL`** (`20260412200000_organization_id.sql`).
- `session_kind` is `text not null default 'initial'` met een check `in ('initial', 'remeasure')`, als inline-constraint gedefinieerd (`20260610100000_intake_baseline_remeasure.sql:22-24`). Postgres noemt die normaal `intake_sessions_session_kind_check`, **maar dat moet op productie gecontroleerd worden**:

```sql
select conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'public.intake_sessions'::regclass and contype = 'c';
```

### 6.2 De migratie (S1)

Additief. Hij zoekt de constraint op zijn definitie, niet op een aangenomen naam. Een `drop constraint if exists <verkeerde naam>` zou namelijk stil niets doen, en dan blijft de oude check `nutrition` tegenhouden (R5).

```sql
-- 2026MMDDHHMMSS_intake_sessions_session_kind_nutrition.sql
do $$
declare
  v_conname text;
begin
  select conname into v_conname
  from pg_constraint
  where conrelid = 'public.intake_sessions'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%session_kind%';

  if v_conname is not null then
    execute format('alter table public.intake_sessions drop constraint %I', v_conname);
  end if;
end $$;

alter table public.intake_sessions
  add constraint intake_sessions_session_kind_check
  check (session_kind in ('initial', 'remeasure', 'nutrition'));

comment on column public.intake_sessions.session_kind is
  'initial | remeasure = brede check (eerste/hermeting); nutrition = alleen de check op /intake, zonder brede-check-kolommen (die zijn dan null). Zie BESLUITDOCUMENT_SESSIE_ARCHITECTUUR_2026-09.md.';
```

### 6.3 Wat níét verandert

- **Geen nieuwe kolommen, geen nieuwe tabel, geen datamigratie.** Bestaande rijen houden `initial` of `remeasure`.
- **Geen extra index.** `intake_sessions_account_id_idx` bestaat al; bij het huidige volume is `(account_id, created_at)` niet nodig.
- **`intake_baseline_snapshots`** heeft `NOT NULL`-kolommen (`profile_label`, `age_range`, …). Een voedingssessie maakt daarom nooit een snapshot aan. Dat wordt in code afgedwongen, niet in het schema.
- **Claim op e-mail** (`claim_intake_sessions_for_account`): een voedingssessie heeft geen `marketing_email` en wordt dus nooit op e-mail geclaimd. Koppelen gebeurt bij het aanmaken (ingelogd) of via `request-link` (de cookie).
- **Bewaartermijn en intrekking:** `intake-retention.ts` (24 maanden) en `cleanup_intake_session_linked_data()` werken voor elke `session_kind`; `intake_intake_log` verdwijnt via de cascade.

**OPENSTAAND-blok (bij S1):** *Blokkeert deploy: ja*, zolang S2 zonder vlag zou draaien, want een insert met `nutrition` faalt dan met een check-violation (23514) en dat is erger dan de 401 van nu. **Met de vlag uit: nee.**

---

## 7. API-impact

| Endpoint | Nu | Na |
|---|---|---|
| `POST /api/intake/nutrition-log` | 401 zonder cookie | Zonder cookie en zonder token: 401 (compatibel). Zonder cookie mét token: botcheck → sessie `nutrition` → log → cookie. Ingelogd zonder cookie: idem, met `account_id` en toestemming. Mét cookie: ongewijzigd. |
| `GET /api/intake/nutrition-log/latest` | alleen de cookie | eerst wie de bezoeker is: ingelogd → alle sessies van het account; anoniem → de cookie |
| `GET /api/intake/session` | `session: null` voor een rij zonder brede check | ongewijzigd, want de payload betekent "brede check". Wel documenteren. |
| `POST /api/intake/session` | ongewijzigd | ongewijzigd, gebruikt alleen de gedeelde cookie-helper |
| `POST /api/account/request-link` | koppelt de sessie uit de cookie | ongewijzigd; werkt ook voor een voedingssessie (leest geen payload) |
| `protein-target`, `plan`, `feedback`, `account/plan` | laden de payload | Zonder payload gaan ze nu al door met standaardwaarden (`protein-target/route.ts:89-92` gecontroleerd). `plan` en `feedback` nalopen in S0. |

Geen nieuwe endpoints. Geen server actions: de consumentenkant gebruikt overal route handlers (58 `route.ts`-bestanden); server actions staan alleen in de admin-platformen.

---

## 8. Frontend-impact

- **`NutritionCapture.tsx`** — Turnstile-widget en honeypot op de toestemmingsstap (hetzelfde patroon als de brede check, `@marsidev/react-turnstile`), `turnstileToken` meesturen bij de eerste opslag. De vroege sessiecheck (±r. 391-420) en de doorverwijzing bij een 401 (±r. 711-730) blijven staan tot S7.
- **`src/app/supplementen/page.tsx`** — `hasSession` op basis van `loadIntakeSessionMeta` in plaats van de payload (S3).
- **Dashboard** — S4, apart uit te zoeken.
- **State management verandert niet.** De client houdt lokale `useState` bij en de server is de bron van waarheid. Er komt geen store bij.

---

## 9. Impact op authenticatie

- **Blijft aan de login gekoppeld:** alle data op accountniveau (dagboek, favorieten, agenda, doelen), toegang tot het dashboard, en het koppelen van sessies.
- **Niet (meer) aan de login gekoppeld:** het opslaan van een check. Anoniem blijft mogelijk; dat is de stap vóór het account in de funnel.
- **Nieuw:** ingelogd plus een nieuwe check = een sessie mét `account_id`. `getAccountFromCookie()` sluit ingetrokken accounts al uit.
- **Ongewijzigd:** cookieformaten, secrets en expiry. De openstaande backlog uit de security-analyse van de account-cookie (`session_version`, sliding refresh) staat hier los van.

## 10. Impact op een toekomstige conversatielaag

Een gesprek is **geen** sessie, en `intake_sessions` wordt nooit een container voor gesprekken.

**Herzien 25 sep** (Dennis wil een chatvenster met LLM óók op de check, zie `BESLUIT_LLM_CHAT_VOEDING_2026-09.md`). Er komen daarmee twee chatplekken, met elk een eigen anker:

| Chat | Anker | Waar het resultaat landt |
|---|---|---|
| Op de check (`/intake`, anoniem) | de **sessie** (`session_kind: "nutrition"`) | dezelfde antwoorden die de schuifjes nu opleveren → `intake_intake_log` |
| In het dagboek (ingelogd) | het **account** | `account_nutrition_daybook` |

Dat heeft twee gevolgen voor S2:

- **`createNutritionCheckSession` moet ook vóór de eerste vraag aangeroepen kunnen worden**, namelijk bij de AI-toestemming, en niet alleen bij de opslag aan het eind. Een toestemmingsrij heeft een anker nodig. De functie staat al los van de route (§3.3), dus dit vraagt geen ander ontwerp, alleen een tweede aanroeper.
- **Sessies zonder log** (iemand geeft toestemming en haakt af) krijgen een eigen, korte bewaartermijn in `intake-retention.ts`, voorstel 30 dagen in plaats van 24 maanden. Een lege rij met alleen een toestemming hoort niet twee jaar te blijven staan.

## 11. Impact op het dagboek

Geen. Het 2+2-dagboek staat al op `account_id` + `entry_date`, los van elke sessie. De check (een frequentieschatting, `intake_intake_log`) en het dagboek (geregistreerde dagen) blijven twee verschillende soorten waarneming, zoals de migratie van 3 sep ze bewust scheidde (`20260903130000_account_nutrition_daybook.sql`, kopcommentaar).

## 12. Achterwaartse compatibiliteit

- **Bestaande rijen:** ongewijzigd; `session_kind` houdt zijn default `initial`.
- **Cookies:** beide formaten blijven geldig.
- **Oude clients** (gecachte JS zonder token) krijgen nog steeds een 401 en dus hun doorverwijzing (§3.3), geen onbekende fout.
- **Consumers van `intakeSessionRowToPayload`** geven voor een voedingsrij `null` terug en gedragen zich dus als "geen brede check". Dat is correct.
- **Code die `intake_sessions` rechtstreeks leest en een ingevuld `profile_label` aanneemt:** `api/admin/data`, `affiliate-analytics.ts`, `intake-reminder-cron.ts`, `app/rapport/[sid]`. In S0 nalopen (R2). `remeasure-reminder-cron.ts` is al nagelopen, en daar verandert het gedrag echt (R3).

## 13. Veiligheid van de migratie: wat is omkeerbaar

| Stap | Omkeerbaar? | Hoe |
|---|---|---|
| S1 constraint | ja, zolang er geen rij met `nutrition` bestaat | de oude check terugzetten |
| S2 schrijfpad | ja, direct | vlag uit → gedrag van vandaag |
| S3 leespad | ja | `git revert` |
| Data van voedingssessies | **nee, niet zonder verlies** | zie §16 |

---

## 14. Risico's

| # | Risico | Kans | Mitigatie |
|---|---|---|---|
| R1 | Bots maken via `nutrition-log` rijen aan | middel zonder mitigatie | Turnstile + honeypot + de bestaande rate limit. Let op: zonder Redis-configuratie is die limiet in-memory en niet veilig over processen heen (`rate-limit.ts`). |
| R2 | Verborgen consumers nemen aan dat de brede-check-velden ingevuld zijn | middel | Lijst in §12 nalopen in S0, met een test per consumer die een rij met `profile_label: null` krijgt |
| R3 | **Hermetingsherinneringen vallen stil weg.** `remeasure-reminder-cron.ts:91-94` stuurt alleen iets als een account **precies één** sessie heeft. Een account met één brede check dat daarna ingelogd een check op `/intake` doet, heeft er twee en krijgt geen herinnering meer. | zeker, bij S2 met ingelogde gebruikers | In S2 de query van de cron (`:148-151`) filteren op `session_kind in ('initial','remeasure')`, plus een test. (Een account met alleen voedingssessies valt er al uit via `isValidBaselineSession`.) |
| R4 | Een voedingssessie heeft alleen de toestemming `nutrition_intake_logging`; code die op andere typen poort, geeft `false` | laag | Dat is het gewenste gedrag (er is geen e-mail en geen marketing). Wel testen. |
| R5 | De constraint heeft in productie een andere naam | laag | De migratie zoekt op definitie, niet op naam (§6.2) |
| R6 | Het dashboard is leeg voor een account met alleen voedingssessies | zeker, tot S4 | Bekend en expliciet; S4 |
| R7 | Twee sessies voor één persoon (cookies gewist, dubbele klik) | laag | Hetzelfde als nu bij de brede check. De knop is al uitgeschakeld tijdens `submitting`. Geaccepteerd. |

## 15. Tests

**Vóór de migratie (S0, karakterisering):**
- `nutrition-log` zonder cookie → 401 met de huidige boodschap.
- `intakeSessionRowToPayload` met een rij in de vorm van een voedingssessie → `null`.
- Het snapshotfilter van het dashboard met zo'n rij → weggefilterd.
- `buildHubPersonalization` met en zonder sessie.

**Na de migratie (S2/S3), route- en unittests met vitest, in het patroon van `src/app/api/**/__tests__`:**
1. Geen cookie, geen token → 401 (compatibel).
2. Geen cookie, ongeldig token → 403; er wordt niets ingevoegd.
3. Geen cookie, geldig token → 200, `Set-Cookie`, rij met `session_kind: "nutrition"`, geen baseline-snapshot, een toestemmingsrij, een log-rij.
4. Mét cookie → gedrag identiek aan nu.
5. Ingelogd zonder cookie → `account_id` gezet en een `account_storage`-toestemming.
6. De insert van de log faalt → de nieuwe sessie wordt verwijderd (geen wees-rij).
7. `latest` voor een ingelogde gebruiker met twee sessies → de nieuwste log over beide.
8. `/supplementen` met alleen een voedingssessie → "Past bij jou" gevuld.
9. Vlag uit → alle routes gedragen zich exact zoals vóór S2.

**Schema:** `npm run check:db-schema` na S1, plus de query uit §6.1.
**End-to-end** (er is geen Playwright in de repo): een handmatig script op localhost, in een schone browser: `/intake` → invullen → resultaat → herladen met `?resultaten=true` → `/supplementen` toont "Past bij jou". Daarna nog een keer ingelogd, in een privévenster.

## 16. Rollback

1. **Vlag uit** — onmiddellijk terug naar de 401 met doorverwijzing. Geen deploy nodig, alleen een herstart (`sudo systemctl restart perfectsupplement`).
2. **Code terugdraaien** — `git revert` van de PR van S2 of S3.
3. **Schema** — `nutrition` toegestaan laten; dat kan geen kwaad. De constraint niet terugdraaien zolang er zulke rijen bestaan.
4. **Data** — voedingssessies verwijderen (`cleanup_intake_session_linked_data(id)` en daarna `delete`; `intake_intake_log` gaat mee via de cascade) vernietigt checks van gebruikers. **Alleen na een expliciet besluit van Dennis**, nooit als technische rollback.

---

## 17. Aanbeveling

**GO WITH CHANGES** op het voorstel van 24 sep, met deze acht wijzigingen ten opzichte van dat voorstel:

1. **Stap 1 vervalt.** De kolommen zijn al nullable; de migratie is alleen de check-constraint, en die zoekt de constraint op zijn definitie (§6.2).
2. **Er komt een discriminated union in plaats van een losser insert-type** (§3.2).
3. **Botcheck vóór het aanmaken van een sessie.** Turnstile en een honeypot op het nieuwe pad, en een 401 blijft het antwoord zonder token (§3.3).
4. **Een ingelogde gebruiker krijgt een sessie mét `account_id`**, zodat zijn check op zijn eigen dashboard komt (§3.3, P4).
5. **Het tweede filter, `intakeSessionRowToPayload`, wordt meegenomen** via `loadIntakeSessionMeta` voor `/supplementen` en een leesresolver op basis van wie de bezoeker is (§3.4, P3).
6. **Geen nurture in deze migratie.** Nurture vraagt een e-mailveld en eigen copy, en dus een eigen besluit (S5).
7. **Een omgevingsvlag**, zodat deploy en rollback los staan van de migratie (§3.3, §13).
8. **De cron voor hermetingsherinneringen filtert op `session_kind`**, zodat een check de herinnering voor de brede check niet uitschakelt (R3).

**Grote ontkoppeling (visitor-tabel of conversation-tabel): DO NOT MIGRATE YET.** De voorwaarden om het opnieuw te bekijken staan in §4-B.

### Stand van de beslispunten (25 sep)

| # | Punt | Stand |
|---|---|---|
| 1 | Richting + acht wijzigingen | **Akkoord** (Dennis, 25 sep) |
| 2 | Turnstile in de check | **Akkoord**, als onderdeel van wijziging 3 |
| 3 | Ingelogd zonder cookie → sessie met `account_id` | **Akkoord**, als onderdeel van wijziging 4 |
| 4 | Affiliate-lead voor voedingssessies | **Ja** — Dennis: *"ja - vooral op aanvulling"*. Hoe "vooral op aanvulling" doorwerkt, is nog open (zie hieronder). `attributeIntakeLead` gaat mee in S2; S6 vervalt als losse plak. |
| 5 | E-mail en nurture op het resultaat | **Open** — S5 blijft apart |
| 6 | Niet samenvoegen; het account is het punt waar alles samenkomt | **Akkoord**, als onderdeel van §3.1 |
| 7 | Omgevingsvlag `CHECK_SESSION_CREATE_ENABLED` | **Akkoord**, als onderdeel van wijziging 7 |

**Open vraag bij punt 4:** betekent "vooral op aanvulling" (a) dat een partner vooral commissie krijgt als de check doorleidt naar een supplement (de route naar `/supplementen` of `/beste/*`), of (b) dat de lead-attributie een aanvulling is en niet de kern van het programma? Bij (a) is dat een commissieregel in `af_*`, geen wijziging aan deze sessie-ingang. De lead wordt in beide gevallen vastgelegd.

### Oorspronkelijke beslispunten (ter referentie)

1. **Akkoord met de richting en de acht wijzigingen?** Daarna begint S0.
2. **Turnstile in de check:** akkoord met één extra verificatiemoment bij de eerste opslag? (Meestal onzichtbaar; soms een klik.)
3. **Ingelogd zonder cookie:** een nieuwe sessie mét `account_id` *(aanbevolen)*, of de check onder de nieuwste account-sessie hangen?
4. **Affiliate-lead voor voedingssessies** (`attributeIntakeLead`)? *Aanbeveling: ja.* Het is één regel, het faalt veilig, en anders betekent "lead" in het programma `af_*` "brede check", en die wordt niet meer aangeboden. Tegenargument: `af_*` staat op de stoplijst van 15 aug.
5. **E-mail en nurture op het resultaat van de check:** apart oppakken (S5), of bewust nog niet?
6. **Sessies samenvoegen als iemand later de brede check doet:** *aanbeveling nee.* Het account is het punt waar alles samenkomt.
7. **Omgevingsvlag:** akkoord met `CHECK_SESSION_CREATE_ENABLED` (standaard uit)?

**Bij akkoord:** de migratie loopt via de Supabase Dashboard SQL Editor (nooit `supabase db push`), met een blok in `supabase/migrations/OPENSTAAND.md` in dezelfde commit, conform CLAUDE.md.

---

## 18. S0 — resultaten (25 sep)

### 18.1 Karakteriseringstests (gedrag van nu, vastgelegd)

| Test | Legt vast | Verandert in |
|---|---|---|
| `src/lib/__tests__/intake-session-payload.test.ts` | een rij zonder brede check → `null` | **blijft zo** (de payload betekent "brede check") |
| `src/lib/supplement-hub/__tests__/hub-personalization.test.ts` (nieuwe case) | een check-log zonder payload van de brede check → `no_intake` | **S3** draait dit om |
| `src/lib/__tests__/remeasure-reminder-cron.test.ts` | één brede check = kandidaat; alleen een voedingssessie = geen kandidaat; brede check + tweede sessie = geen kandidaat | **S2** (R3): de derde case wordt "wel kandidaat" |
| `src/app/api/intake/__tests__/nutrition-log-route.test.ts` (bestond al) | geen cookie → 401, niets ingevoegd | **S2**: blijft 401 zonder token; een nieuwe case voor mét token |

### 18.2 Consumers nagelopen: wat doen ze met een voedingssessie?

**In orde, geen wijziging nodig:**

| Consumer | Gedrag bij een rij zonder brede check |
|---|---|
| `api/intake/plan` | 404 "Sessie niet gevonden" — correct, er is geen plan zonder brede check |
| `api/intake/feedback` | slaat het event `profile.recognition` over |
| `api/account/plan`, `api/account/movement-prefs` | kiezen de nieuwste sessie **mét** `profile_label` (uit de laatste 5) en slaan de voedingssessie dus over |
| `content/nurture-interventions.ts`, `insights/AanpakMode.tsx` | `null`, dus geen interventies en geen aanbevelingen |
| `intake-reminder-cron.ts` | valt terug op de standaardteksten; wordt bovendien overgeslagen zodra het e-mailadres een actief account heeft (en dat geldt voor elke herinnering uit `request-link`) |
| `rapport/[sid]` | leest alleen hermetingen van de brede check |
| `affiliate-analytics.ts` | telt `referral_source`; een check telt mee als intake, en dat is gewenst |
| `api/account/waitlist` | neemt de nieuwste sessie-id voor attributie; welke soort maakt niet uit |

**Moeten mee in S2 (nieuw ten opzichte van §12):**

| # | Consumer | Wat er misgaat | Fix |
|---|---|---|---|
| F1 | `src/lib/account-voedingsdoelen-server.ts:60-66` | Neemt gewicht, leeftijd en antwoorden uit de **nieuwste** sessie (`limit(1)`). Zodra een ingelogde gebruiker een check doet, is dat een voedingssessie zonder `weight_kg`/`age_range`, en valt zijn eiwitdoel terug naar het doel zonder gewicht — tenzij hij zelf een gewicht instelde in `account_voedingsdoelen`. **Dit is de ernstigste vondst: het raakt het voedingsdashboard van bestaande gebruikers.** | Per veld de nieuwste niet-lege waarde over de sessies van het account |
| F2 | `api/account/remeasure/start/route.ts:49-55` | Neemt de **oudste** account-sessie als baseline. Is die een voedingssessie, dan vindt `loadBaselineSnapshot` niets, en geeft de hermeting een 400 ("startpunt niet gevonden"). | Filter `session_kind in ('initial','remeasure')` |
| F3 | `src/lib/intake-session-resolve.ts` (alleen gebruikt door `movement-checkin`) | Neemt de nieuwste account-sessie ongefilterd, dus beweeg-check-ins komen op een voedingssessie te staan | Filter op `session_kind`; lage impact (beweging is ontkoppeld uit de UI) |
| F4 | `api/admin/data/route.ts:465-468` | Telt een voedingssessie als profiel "Onbekend" in de verdeling | Label `session_kind === "nutrition"` als "Check (voeding)"; cosmetisch |
| — | `remeasure-reminder-cron.ts` | zie R3 | al in wijziging 8 |

**Onderliggend patroon:** profielgegevens (gewicht, leeftijdsband, geslacht, beweegprofiel) staan op meetrijen in plaats van op de persoon. Daardoor moet elke lezer zelf uitzoeken welke rij het juiste veld draagt. Voor nu lost "de nieuwste niet-lege waarde per veld" dat op (F1). Het profiel verhuizen naar het account (of naar de sessie als pseudoniem anker) is dezelfde stap als afgewezen alternatief B in §4, en valt onder dezelfde "opnieuw bekijken"-voorwaarden.

### 18.3 S1 staat klaar

`supabase/migrations/20260925120000_intake_sessions_session_kind_nutrition.sql`, geregistreerd in `OPENSTAAND.md`, met een controlequery erbij. **Blokkeert deploy: nee**, want nog geen code schrijft `'nutrition'`. De migratie zoekt de oude constraint op zijn definitie, dus de naam vooraf opvragen is niet nodig (R5). Dennis draait hem in de SQL Editor; daarna mag de vlag van S2 aan.
