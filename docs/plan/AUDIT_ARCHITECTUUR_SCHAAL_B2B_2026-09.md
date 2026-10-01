# Architecture & Scale Readiness Report — PerfectSupplement

**Datum:** 30 september 2026
**Status:** **Nulmeting + voorstellen — niets hierin is besloten.** De roadmap (§13) en de ADR's (bijlage E) zijn voorstellen; Dennis accepteert of verwerpt per punt. Waar dit document een eerder besluit raakt, staat dat in §0.
**Opdracht:** volledige architectuur-, data-, security-/AVG-, schaalbaarheids- en commerciële-gereedheidsaudit in 18 fasen — "bouw nog niets".
**Repo-stand:** werkboom `kennisbank-beelden-context` @ `dc35e2a0` (= `main` t/m #66 plus ongecommit blogwerk). `origin/main` @ `31c4cfc0` (#67, CSV-import van producten) is meegenomen waar het een bevinding raakt.
**Methode:** lezen, tellen en de testsuite draaien in de repo; read-only `gh` en `npm audit`. **Er is geen code gewijzigd.** Server, Supabase-dashboard, DNS en GitHub-secrets zijn niet ingezien — wat daarvan afhangt staat als `UNKNOWN — needs verification` (verzameld in bijlage H).
**Labels:** `[FEIT]` = geverifieerd in repo of tooling · `[OORDEEL]` = analyse · `[AANNAME]` = niet geverifieerd · `UNKNOWN — needs verification`.

> **Leeswijzer.** Deel I is het gevraagde rapport (secties 1–16). Deel II bevat het bewijs per fase. Wie weinig tijd heeft: §0, §1 en §16.

| Fase uit de opdracht | Waar |
|---|---|
| 1 Discovery | §2 + bijlage A |
| 2 Database | §6 + bijlage B |
| 3 Data-architectuur | §6 |
| 4 Businesslogica | §7 |
| 5 Schaalbaarheid | §5 |
| 6 Multitenancy | §10 |
| 7 Security & AVG | §8, §9 |
| 8 Performance | bijlage C |
| 9 Technische schuld | bijlage D |
| 10 ADR's | bijlage E |
| 11 Toekomstige architectuur | §15 |
| 12 Commerciële gereedheid | §11, §12 |
| 13 Contract-timeline | §12 |
| 14 Maturity model | §11 |
| 15 Roadmap | §13 |
| 16 Do not build yet | §14 |
| 17 Technical due diligence | bijlage F |
| 18 Eindevaluatie | Deel I |

---

## 0. Bestaande besluiten die deze audit raakt — lees dit eerst

CLAUDE.md schrijft voor: eerst `docs/plan/` doorzoeken en conflicten melden vóór een eigen plan. Ik heb `docs/plan/`, `docs/research/` en `docs/core/` doorzocht op tenant, B2B, white-label, organisatie en schaal. Dit zijn de besluiten die leidend blijven:

| Besluit | Bron | Kern | Wat het betekent voor deze audit |
|---|---|---|---|
| Multi-tenancy **niet** bouwen; tenant-eenheid = interne scheiding; alleen "deur-open"-werk | `docs/research/VERDICT_MULTITENANT_VOLGORDE_EU_2026-08-30.md` A1, A5 | Deur-open-werk (orgScoped, drift-test, partner-API dicht, scaffold weg) is **grotendeels uitgevoerd** `[FEIT]` | §10 bevestigt het verdict en stelt geen tenant-bouw voor |
| **Werkgever als afnemer = juridisch dicht** | idem, C2 | De AP oordeelt dat werkgevers slaap- en bewegingsgegevens van werknemers niet mogen verwerken, ook niet geanonimiseerd via een derde | **Conflict met jouw Tenant A en E** — zie hieronder |
| Zorgprofessional (fysio/diëtist) verschuift het beoogde doel richting MDR en maakt je verwerker van art. 9-data | idem, A1(c), C1 | Kan, maar alleen via een apart juridisch traject | **Spanning met jouw Tenant C** |
| B2B/white-label pas **na bewezen B2C-conversie** | `PLAN_FUNNEL_DATA_PRIORITY.md` DEEL 4 (drempels 1–4, incl. 500+/2000+), `PLAN_NURTURE_MULTIPRODUCT_DATA_READINESS.md` DEEL 4 | Harde toegangsdrempels vóór elk horizon-item | De contract-timeline in §12 hangt aan deze drempels |
| Eerst distributie, dashboard bevroren, focus op voeding | Verdict 30 aug B2, `BESLUIT_VOEDINGSFOCUS_DASHBOARD_2026-09.md` | Stop-lijst; van 7 domeinen naar 1 op 4 tabs | De roadmap bevat geen featurewerk, alleen fundament |
| PartnerDesk (`pd_*`) en affiliate-programma (`af_*`) zijn mono-tenant; **geen `org_id` "voor de zekerheid"** | `ARCHITECTUUR_AFFILIATE_AUTOMATISERING.md` §0.1 en risico #2 | Admin-domeinen zijn geen tenants | Blijft staan; de drift-test heeft ze bewust op de allowlist |
| Blijf op Hetzner; security-uitgaven pas bij triggers | `ADVIES_BEVEILIGING_AUTH_HOSTING_2026-08.md` | P0/P1-actielijst | Deze audit vindt dat P1 #5, #7, #9, #10 en #11 nog openstaan `[FEIT]` |
| LLM-chat: bouwen achter een vlag; live pas na V1–V6 | `BESLUIT_LLM_CHAT_VOEDING_2026-09.md` | — | Staat op de "niet live zetten"-lijst tot V1–V6 rond zijn |
| Geen visitor-tabel of nieuw identiteitsmodel | `BESLUITDOCUMENT_SESSIE_ARCHITECTUUR_2026-09.md` §0 | "DO NOT MIGRATE YET" | Bevestigd; staat niet in de roadmap |

**Conflicten met de opdracht, expliciet benoemd:**

1. **Tenant A (werkgever) en Tenant E (enterprise als werkgever).** Het verdict van 30 augustus sluit dit pad juridisch af. Dat overrule ik niet. In deze audit gelden deze tenants als *niet haalbaar*. De enige resterende variant — de werknemer is de klant, de werkgever betaalt en ontvangt niets — is commercieel een cadeaubon, geen B2B-product.
2. **Tenant D (voedings- of supplementenbedrijf) als tenant.** Geen eerder besluit sluit dit letterlijk uit. `[OORDEEL]` Het botst wel met de positionering ("de Consumentenbond van supplementen") en met de affiliate-firewall in de PS-Score (`src/lib/supplement-score/compute.ts` + `__tests__/firewall.test.ts`). Ik behandel supplementbedrijven daarom als **upstream partner** (PartnerDesk, data-bijlage, postback), niet als tenant. **Dit is een nieuw oordeel — beslis het zelf.**
3. **Ontwerpen voor 100k–1M gebruikers.** De bestaande volgorde (distributie eerst, B2B pas na drempels) blijft leidend. Deze audit adviseert geen schaalinvesteringen vóór die drempels. Uitzondering: fouten die al bij ~1.000 gebruikers stil misgaan (§5).

**Wat deze audit toevoegt.** Gaten die in de eerdere documenten niet stonden: server actions zonder eigen auth-check, AVG-register dat afwijkt van de code (event-log, inactieve accounts), tabellen die buiten de migraties bestaan, tegenstrijdige deploy-governance, stille schaalfouten, JSON-LD zonder escaping op DB-gevoede pagina's, en partnergeheimen in platte tekst.

---

# DEEL I — ARCHITECTURE & SCALE READINESS REPORT

## 1. Executive summary

**Kernoordeel.** De architectuur is **gezond voor deze fase en hoeft niet herschreven te worden**, ook niet voor B2B of multi-tenancy. De kern is beter dan gemiddeld voor een solo-project:

- rekenlogica zit in pure, geteste, geversioneerde functies;
- de server rekent scores zelf na en slaat de regelversie op;
- toestemming is per type geversioneerd;
- de voedingsdata heeft een doordacht herkomstmodel;
- de PS-Score heeft een aantoonbare affiliate-firewall.

De **schil** is achtergebleven bij het bouwtempo: de admin-grens, AVG-handhaving, schema-reproduceerbaarheid, het deployproces en observability. Die schil moet dicht vóór groei, en zeker vóór een gesprek met een bedrijf.

**Het grootste risico is niet technisch.** `[FEIT]` Er staan 244.140 regels TypeScript in `src/`, 86 tabellen in migraties (plus minstens 4 daarbuiten) en 81 pagina's. Daartegenover: ~200 zoekvertoningen en **0 kliks** op `/beste/*` in 90 dagen (`docs/research/NULMETING_BESTE_VERGELIJKINGEN_2026-09-02.md`) en ~2 ingevulde checks (`BESLUIT_VOEDINGSFOCUS_DASHBOARD_2026-09.md` §2). De code groeide van ~218k regels op 5 september naar 244k op 30 september (+12% in 25 dagen). `[OORDEEL]` Elke architectuurinvestering voor schaal is nu een gok op een publiek dat nog niet bestaat. De verdicts van 15 en 30 augustus zeggen hetzelfde; deze audit bevestigt ze.

| Stand in cijfers | `[FEIT]` |
|---|---|
| Code | 1.602 TS/TSX-bestanden, 244k regels in `src/`; `src/lib` heeft 329 losse bestanden op het hoogste niveau |
| Ingangen | 81 pagina's · 63 API-routes · 80 server actions (allemaal admin) · 4 cron-routes |
| Database | 86 tabellen in 82 migraties, 106 indexen, 133 FK's, 117 check-constraints, 0 triggers, 0 partities |
| Tests | 344 testbestanden, 3.364 tests; CI groen op `main`; op deze werkboom 3 falend (samenhangend met het ongecommitte blogwerk, `[AANNAME]`) |
| Gebruik | 0 kliks op vergelijkingen in 90 dagen; ~2 checks |

### Antwoorden op de tien kernvragen

1. **Is de huidige architectuur gezond?** Ja, voor deze fase. Sterk: engines, toestemmingsmodel, herkomstmodel, migratiediscipline, ISR voor SEO-pagina's. Zwak: admin-grens, operatie, AVG-handhaving, modulariteit. Geen rewrite nodig; wel een hygiëneronde.
2. **Waar zitten de grootste risico's?** (1) Eén gedeeld admin-wachtwoord geeft toegang tot de service-role en daarmee tot alle art. 9-data, en 80 server actions controleren zelf niets. (2) Het AVG-register belooft bewaartermijnen die de code niet afdwingt. (3) Het schema is niet reproduceerbaar uit de repo. (4) Tegenstrijdige deploy-governance en geen branch protection. (5) Stille schaalfouten bij ~1.000 gebruikers. (6) Strategisch: complexiteit vóór vraag.
3. **Wat moet ik nu veranderen?** De NOW-lijst in §13: tien acties van samen ~6–9 bouwdagen, geen features.
4. **Wat moet ik absoluut nog niet bouwen?** Multi-tenancy, een migratie naar Supabase Auth, microservices, queues, partitionering, een CMS, een publieke API, werkgevers-dashboards, een supermarktdatabase (§14).
5. **Welke keuzes moeten nu worden vastgelegd?** Zes ADR's: data-toegang en autorisatie, schema als enige bron, één deploy-pad, herkomst en licenties, event-log en retentie, domeinregister (bijlage E).
6. **Welke keuzes kunnen later?** Caching-laag, queue, search-engine, meerdere instanties, SSO, RLS met tenant-claim, CMS, API-keys (§13, SCALE en FUTURE).
7. **Kan dit technisch doorgroeien naar B2B?** Ja, zonder rewrite. De naden liggen er: `organization_id`, `orgScoped()`, consent-model, versies. Maar de **juridisch haalbare** B2B-vormen zijn smaller dan je prompt aanneemt (§10, §12). Upstream-partnerschappen met merchants zijn nú al technisch ondersteund.
8. **Kan het later multi-tenant worden?** Ja. Het verdict schat 2–3 weken bij tenant 2. Daar komen per-user-admin, een audit-log en een juridisch rolmodel bij. Totaal `[OORDEEL]` 6–10 weken doorlooptijd.
9. **Welke mijlpalen vóór serieuze gesprekken met bedrijven?** M1 hygiëne (security, AVG, reproduceerbaarheid) · M2 aantoonbare B2C-tractie · M3 juridisch rolmodel, DPA-sjabloon en MDR-doelomschrijving · M4 per-user-admin, audit-log en monitoring · M5 tenant-afdwinging op de paden die een pilot raakt. Verkennende gesprekken zonder data kunnen al na M1.
10. **Welke volgorde werkt het best?** Hygiëne (4 weken) → distributie en tractie (niet-technisch, parallel) → schaalfouten dichten vóór 1.000 gebruikers → een dataplatform-stap alleen bij een trigger → B2B-voorbereiding pas bij drempels én een concrete partij.

---

## 2. Current architecture

```
Browser ──HTTPS──▶ Nginx (Hetzner VPS, Fedora, 4 GB, DNS-only — geen CDN/WAF)
                     │  x-real-ip gezet door Nginx
                     ▼
                 Next.js 16.3 — één Node-proces onder systemd (als root, [AANNAME])
                 ├─ src/proxy.ts: CSP/headers · admin-gate (optimistisch) · x-org-id · ?ref-cookie
                 ├─ 81 pagina's: content statisch + on-demand ISR · /supplementen en dashboard dynamisch
                 ├─ 63 route handlers (+ /r/[ref]) · 80 server actions (admin)
                 └─ src/lib: pure engines (intake, voeding, PS-Score) naast I/O-modules
                     │  supabase-js over HTTP (PostgREST), service-role → RLS altijd omzeild
                     ▼
                 Supabase Postgres (EU Frankfurt, Pro) — RLS "deny-all" als tweede muur
Extern: Resend (mail) · SMTP/nodemailer (contact) · Turnstile · GA4 · Clarity · Sentry (server)
        Upstash/Redis optioneel (UNKNOWN in prod) · PostHog/n8n voorbereid, uit
Cron:   server-crontab (niet in repo) → /api/cron/* met CRON_SECRET; dead-man's switch in cron_runs
Kennis: TypeScript in src/data — blog, kennisbank, EFSA-claims, RI, 371 voedingsmiddelen, supplement-fallback
```

### Lagen

| Laag | Waar | Opmerking |
|---|---|---|
| Presentatie | `src/app` (81 pagina's), `src/components` (469 bestanden, 320 met `"use client"`) | Server components waar het kan; het dashboard is een grote client-app (124 componenten, ~30k regels) |
| Edge / toegang | `src/proxy.ts` | Headers, admin-redirect, org-resolutie per request, referral-cookie |
| Ingangen | `src/app/api/**/route.ts`, `src/lib/{partnerdesk,affiliate,product-admin}/*-actions.ts` | Route handlers bevatten deels de orkestratie (tot ~390 regels) |
| Domeinlogica | `src/lib` (714 bestanden, 93k regels) | Pure rekenmodules en I/O-modules door elkaar; alleen nieuwere domeinen hebben een submap |
| Data-toegang | `createSupabaseAdmin()` is de **enige** client; `orgScoped()`/`unscoped()` voor nieuwe code | 484 `.from("…")`-calls; autorisatie zit volledig in app-code |
| Kennis/content | `src/data` (218 bestanden, 38k regels) | Git is de audittrail; wijzigen vereist een deploy |
| Opslag | Supabase Postgres (`config.toml`: major_version 17) | 82 migraties via de SQL Editor, bewaakt door `OPENSTAAND.md` + `check:migraties` |
| Infra | Hetzner, Nginx, systemd; build draait óp de productieserver | Eén machine, geen staging |

### Identiteiten

| Identiteit | Mechanisme | Levensduur | Intrekken |
|---|---|---|---|
| Anonieme sessie | `psf_intake_sid` = `id.issuedAt.HMAC` → rij in `intake_sessions` | cookie 90 d, rij 24 mnd | rij verwijderen |
| Account | magic link/OTP → `psf_account` (HMAC); `getAccountFromCookie()` checkt per request `status` in de DB | 90 d | `status = revoked` (geen per-apparaat-logout) |
| Admin | één gedeeld `ADMIN_PASSWORD` → `admin_token` (HMAC) | 12 u | secret roteren |
| Partner (machine) | `Authorization: Bearer <pd_partners.webhook_secret>` | onbeperkt | kolom wijzigen |
| Cron | `CRON_SECRET` (bearer of HMAC) + optionele IP-allowlist | — | secret roteren |

Er is geen Supabase Auth; `auth.users` is leeg (`20260815130000_drop_anon_policies.sql`).

### De vijf belangrijkste datastromen

1. **Check.** De client draait de engine voor directe feedback. `POST /api/intake/session` rekent daarna **zelf** opnieuw uit via `computeIntakePersistenceFields(answers)` en slaat `RULES_VERSION` (1.7.0) op. Daarna volgen, sequentieel en zonder transactie, consent, marketing, affiliate-attributie, baseline-snapshot en events. Rollback gebeurt via `intake-session-rollback.ts`.
2. **Supplementen.** Admin bewerkt `sup_*` via server actions, die `revalidatePath("/beste/[supplement]", "page")` aanroepen. `/beste/*` is statisch en leest bij het renderen uit de DB, met de TS-data als terugval (`page-products.ts`). De PS-Score wordt at runtime berekend door een pure functie.
3. **Affiliate.** `/api/affiliate/click` (legacy) en `/api/supplements/click` (kliktoken) → de partner meldt terug via `/api/partner/conversion` → `pd_conversions`.
4. **Mail.** De nurture-cron (batches van 50) verstuurt via Resend; herinneringen en hermeting hebben eigen crons.
5. **Verwijderen.** Bij accountverwijdering loopt een cascade over 17 tabellen, plus per sessie een transactionele RPC (`delete_intake_session_data`).

---

## 3. Critical findings

Gerangschikt op risico × waarschijnlijkheid. Details en fixes staan in bijlage D en §13.

| # | Bevinding | Bewijs `[FEIT]` | Ernst | Bijt wanneer |
|---|---|---|---|---|
| **C1** | **De 80 admin-server actions controleren zelf geen authenticatie.** Ze leunen alleen op `proxy.ts`; ook de admin-layouts en -pagina's checken niets. De admin-*API*-routes doen het wél zelf. | 15 `"use server"`-bestanden, 80 exports, 0 auth-calls; `src/app/admin/layout.tsx` en `(desk)/layout.tsx` zonder check. Next-docs: *"treat Server Actions as reachable via direct POST requests and verify authentication and authorization inside each one"* (`node_modules/next/dist/docs/01-app/02-guides/data-security.md:291`, `:339`) | **Hoog** — niet aangetoond exploiteerbaar, maar het is de enige laag vóór service-role-schrijfrechten op contracten, grootboek (`af_ledger_entries` → `paid`) en productdata | Nu |
| **C2** | **De admin-identiteit is één gedeeld wachtwoord**, zonder MFA, zonder lockout en zonder per-persoon audit trail | `src/app/api/admin/auth/route.ts`, `src/lib/admin-auth.ts`. Advies-aug P0 #2 (Cloudflare Access) vereist dat het domein via Cloudflare geproxied wordt; het is DNS-only `[OORDEEL]` | **Hoog** | Nu; blokkerend vóór een tweede admin of B2B |
| **C3** | **AVG: het register belooft wat de code niet doet.** `domain_events` bevat `email` en een jsonb-`payload`. De FK is `on delete set null`, dus bij verwijdering blijft de rij staan, en er is geen retentie. Minstens 10 van de 62 emit-plekken geven een e-mailadres mee, ook bij gezondheidsgedrag (`daily-log`, `movement-log`, `agenda-blocks`). Het register §7 zegt: "24 maanden; anonimiseren bij intrekking". Accounts hebben geen `last_seen_at` en er is geen inactiviteitsregel; het register zegt "volgt 24 maanden". | `supabase/migrations/20260529200000_domain_events.sql`, `src/lib/events.ts:188-218`, `docs/core/VERWERKINGSREGISTER.md:113-123`, `:237-293`; de verwijder-RPC's raken `domain_events` niet | **Hoog (juridisch: art. 5 lid 1 sub e, art. 17)** | Bij het eerste inzage- of verwijderverzoek, of bij een audit |
| **C4** | **Deploy-governance is tegenstrijdig.** CLAUDE.md zegt "merge ≠ deploy". `deploy.yml` deployt automatisch na groene CI op `main` en faalt nu alleen omdat de SSH-secrets ontbreken (elke merge levert een rode run op). `OPENSTAAND.md` zegt "git push origin main" en "een push naar main deployt zichzelf". `deploy.yml` mist de schema-gate en de cache-opruiming uit `deploy.sh`. **`main` heeft geen branch protection.** De build draait op de 4 GB-productieserver als root, zonder health check of rollback. | `gh run list --workflow=deploy.yml` (15× failure, "can't connect without a private SSH key"); `gh api …/branches/main/protection` → "Branch not protected"; `deploy.sh`, `.github/workflows/deploy.yml`, `supabase/migrations/OPENSTAAND.md` (runbook stap 4–5) | **Hoog (operationeel)** | Zodra iemand de secrets zet, of een sessie direct naar `main` pusht |
| **C5** | **Het schema is niet reproduceerbaar uit de repo.** `cron_runs` staat alleen in `db/migrations/006_cron_runs.sql`, `thema_nurture` alleen in `db/migrations/004`, `thema_downloads` nergens, en **`remeasure_reminders` nergens** (wel gebruikt in `src/lib/remeasure-reminder-cron.ts:170`). `check-supabase-schema.sh` controleert ze niet. | grep over `supabase/migrations/`, `db/`, `docs/` | **Hoog voor DR/staging/B2B**, Middel nu | Bij restore naar een nieuw project, bij staging, bij een aparte B2B-omgeving |
| **C6** | **Een auteursrechtelijk beschermd boek staat in git**: `docs/Present Knowledge in Nutrition … (z-library.sk, 1lib.sk, z-lib.sk) (1).pdf` | `git ls-files` | **Hoog voor due diligence en IP** | Zodra iemand anders de repo ziet |
| **C7** | **JSON-LD zonder `<`-escaping op pagina's die uit de DB lezen.** `/beste/[supplement]` rendert DB-producten via `JSON.stringify` in `<script type="application/ld+json">`. Met de CSV-import (#67) en toekomstige merchant-feeds kan externe tekst `</script>` bevatten; de CSP staat `'unsafe-inline'` toe. | `src/app/beste/[supplement]/page.tsx:99-133`; 50× `dangerouslySetInnerHTML`; Next-docs `json-ld.md:11,34` schrijven `.replace(/</g, '\\u003c')` voor | **Middel nu, Hoog zodra externe feeds binnenkomen** | Bij de eerste geïmporteerde feed |
| **C8** | **Stille schaalfouten vanaf ~1.000 gebruikers.** `api/admin/data` haalt hele tabellen op (`intake_sessions` met scores en e-mail, `affiliate_clicks`, `intake_reminders`) en aggregeert in JS. PostgREST kapt standaard af op 1.000 rijen, dus de admin-cijfers worden **stil fout**. `remeasure-reminder-cron` haalt alle accounts op en stuurt alle ID's in één `.in()`-filter in de URL mee. | `src/app/api/admin/data/route.ts:161-164, 250-252, 403-408`; `src/lib/remeasure-reminder-cron.ts:134-155`. max-rows-instelling: UNKNOWN | **Middel** (stil, bijt vroeg) | ~1.000 sessies/accounts; de `.in()`-grens mogelijk al eerder |
| **C9** | **Kwetsbare dependency op een publiek pad, zonder bewaking.** nodemailer ≤10.0.8 (4 advisories, o.a. een DoS in de addressparser) krijgt het door de gebruiker ingevulde `replyTo` in `/api/contact`; daarnaast brace-expansion. Geen Dependabot en geen audit in CI. | `npm audit --omit=dev` → 2 high; `src/app/api/contact/route.ts:364` | **Middel** (Turnstile en rate limit dempen het) | Nu |
| **C10** | **Observability is minimaal.** Geen health-endpoint, geen uptime-monitor in de repo, 172× `console.error` zonder request-ID, Sentry-tracing op 0. De client-Sentry leest `SENTRY_DSN` zonder `NEXT_PUBLIC_`-prefix, dus in de browser staat hij vrijwel zeker uit. | `src/lib/sentry-config.ts`, `src/instrumentation*.ts` | **Middel** | Je merkt uitval pas als iemand het meldt |
| **C11** | **Modulariteit.** 329 losse bestanden in `src/lib`. `Dashboard.tsx` is 3.633 regels (21 `useState`, 13 `useEffect`). Het domeinvocabulaire staat op minstens 7 plekken als `DOMAIN_SCORE_KEYS`, `PillarId` is 2× gedefinieerd, en ±47 bestanden hardcoden domeinlijsten. Orkestratie zit in route handlers (`intake/session` 660 regels, geen transactie). | zie bijlage A | **Middel** — elke wijziging wordt duurder; een tweede ontwikkelaar inwerken wordt moeilijk | Groeit elke week |
| **C12** | **Plafond van de data-architectuur.** Voedingsdata (371 voedingsmiddelen, ~104 geciteerde bronwaarden) staat als TS in de client-bundle: 8 client-componenten importeren `food-catalog.ts`. Er is geen DB-model voor datasets, imports of herkomst per waarde bij supplementen. | `src/data/nutrition/*`, `sup_sources` (per product, niet per veld) | **Laag nu, Hoog bij een trigger** | Bij import van de volledige NEVO, bij redactie door niet-ontwikkelaars, bij een datapartnerschap |

Kleinere security-bevindingen (het partnergeheim in platte tekst, een sessietoken in de rapport-URL, de CSP, de IP-allowlist van cron, filter-escaping) staan in §8.

---

## 4. Architecture risks — wat later problemen veroorzaakt

| # | Risico | Waarom het later pijn doet | Mitigatie |
|---|---|---|---|
| R1 | **Complexiteit vóór vraag.** +26k regels in 25 dagen bij ~0 gebruikers; 7 domeinen die krimpen naar 1 | Onderhoud schaalt met oppervlak, niet met gebruikers. Bus factor 1 | Bevries oppervlak (verdict 30 aug); snoei wat de voedingsfocus overbodig maakt |
| R2 | **Service-role overal.** Eén vergeten check = alle data van alle gebruikers | Bij B2B wordt elke vergeten `.eq("organization_id")` een datalek tussen klanten | ADR-001: DAL-functies nemen een geauthenticeerde principal aan; per ingang een check afgedwongen door een test |
| R3 | **Documentatie-drift in een agent-gestuurde werkwijze.** `ARCHITECTURE.md` en `SECURITY.md` noemen PM2; de README noemt Vercel/Geist; `SPEC_CLICK_TOKEN_TRACKING.md` zegt "nog niet geïmplementeerd" terwijl het er is; het `OPENSTAAND.md`-runbook spreekt CLAUDE.md tegen | Agents lezen de docs en handelen ernaar. Verouderde docs leiden tot verkeerde acties (push naar `main`, verkeerd deploy-beeld) | Eén keer gelijktrekken + "Laatst geverifieerd"-regel per core-doc |
| R4 | **Twee bronnen voor producten** (TS-terugval + `sup_*`) | Prima als overgang, gevaarlijk als die permanent wordt: welke is waar? | Einddatum voor de TS-terugval afspreken zodra alle 7 categorieën DB-gedragen zijn (dat zijn ze al) |
| R5 | **Kennis in code, verwijzingen in de DB zonder FK** (`sup_categories.ingredient_claim_key`, `sup_product_claims.efsa_claim_id` → `approved-claims.ts`) | Nu bewaakt door tests. Bij redactie door niet-ontwikkelaars of tenant-data breekt dat model | Pas bij een trigger naar een DB-referentietabel |
| R6 | **Eén VPS als single point of failure**, build op de productieserver, geen CDN | Uitval = site weg; een build kan de draaiende app geheugen afnemen (4 GB) | X4 (build elders), uptime-monitor, Hetzner-snapshots (UNKNOWN of die aan staan) |
| R7 | **Stateless sessies zonder server-side intrekking** (geen `session_version`) | Een gestolen account-cookie blijft 90 dagen geldig, tenzij het account wordt ingetrokken | X12 (backlog #2/#3 uit advies aug) |
| R8 | **jsonb-zware gebruikersdata** (`answers`, `domain_scores`, `meals`, `items`, `portions`) | Flexibel, maar analyses over gebruikers heen worden duur en schema-evolutie in jsonb is onzichtbaar | Versie in elke payload; later afgeleide, genormaliseerde tabellen voor analyse |
| R9 | **Handgeschreven validatie** (97 `validate*/parse*`-functies, geen schemabibliotheek) | Inconsistente contracten; geen OpenAPI mogelijk; blokkerend voor een partner-API | Pas bij een publieke API een schemalaag invoeren; nu niet |
| R10 | **Next.js-selfhosting-details.** De ISR-cache staat per instantie op het filesystem; image-optimalisatie op dezelfde machine | Bij meerdere instanties werkt `revalidatePath` alleen op de instantie die hem ontvangt | Bij de schaalstap een gedeelde cache-handler (S1) |

---

## 5. Scalability

**Grondhouding.** `[OORDEEL]` Postgres met de juiste indexen draagt tientallen miljoenen rijen per tabel zonder partitionering. De bottleneck in deze codebase is niet de database-engine maar vier patronen:

1. hele tabellen naar Node halen en in JS aggregeren;
2. onbegrensde `.in()`-lijsten in de URL;
3. append-only tabellen zonder retentie (`domain_events`);
4. FK-kolommen zonder index op cascade-paden.

Een structureel voordeel: supabase-js praat HTTP met PostgREST, dus Node houdt geen DB-verbindingen vast. De app is stateless, op de in-memory rate limiter en de ISR-cache na. Horizontaal schalen is daardoor later eenvoudig.

### Scenario's

Kosten zijn indicatief `[AANNAME]` (orde van grootte, exclusief jouw tijd).

| | **A — 1.000** | **B — 10.000** | **C — 100.000** | **D — 1.000.000** | **E — B2B-org met duizenden werknemers** |
|---|---|---|---|---|---|
| **Database** | Triviaal | `intake_sessions` 20–40k; `domain_events` 0,5–2M/jaar zonder retentie; prima mits FK-indexen | Compute-upgrade; retentie of partitie op events; dagboek ~11M rijen/jaar (100k × 30% loggers × 365) | Grotere compute + read replica; tijdspartities (dagboek, events); archivering | Volume = scenario B. Probleem is isolatie, niet load |
| **App/API** | 1 proces ruim voldoende | 1 proces voldoende; downtime bij deploys en build-op-prod gaan opvallen | 2+ instanties → Redis-ratelimit verplicht, gedeelde ISR-cache, load balancer, zero-downtime | Containers achter een LB, autoscaling light, meerdere AZ's (niet regio's) | SSO, bulk-provisioning, per-tenant rate limits |
| **Jobs** | Crons ok | Nurture-batches van 50 per run: frequentie UNKNOWN; bij ~300 aanmeldingen/dag ≈ 1.800 mails/dag | Queue (Postgres-gebaseerd) voor mail en imports | Queue + workers los van de web-app | Per-tenant mailbranding, bounce-afhandeling |
| **Caching/search** | Statisch + ISR volstaat | Idem; eventueel CDN | CDN (Cloudflare-proxy → DNS-only-keuze herzien); server-side zoeken zodra de catalogus uit de bundle gaat | Dedicated search indien nodig | Per-tenant cache-sleutels |
| **Analytics** | Admin in JS → **stuk vanaf 1.000 rijen** | SQL-views/RPC's verplicht | Materialized views; PostHog | Warehouse/replica | Per-tenant rapportage met k-anonimiteit |
| **Observability** | Uptime + Sentry | + alerts, gestructureerde logs | + tracing, SLO's | + on-call | + SLA-rapportage |
| **Kosten** `[AANNAME]` | ~€40–70/mnd | ~€100–250/mnd | ~€500–1.500/mnd | ~€3–10k/mnd + team | Afhankelijk van contract (pentest, ISO) |
| **Eerste bottleneck** | C8 (stille afkap, `.in()`) | Operatie: deploys, geen staging, geen alerts | Één proces + filesystem-ISR; event-groei | Team en compliance, niet techniek | Juridisch (§10) en isolatie |

**Volgorde van de echte bottlenecks:** (1) stille afkap in admin en cron — bij A; (2) operatie — bij B; (3) groei van `domain_events` zonder retentie — bij B/C; (4) één proces met filesystem-cache bij opschalen — bij C; (5) analyses over jsonb — bij C; (6) DB-compute — bij C/D.

### Kan de database groeien naar …

| Doel | Antwoord |
|---|---|
| 10.000 gebruikers | **Ja**, na het fixen van patroon 1 en 2 (X1–X3) |
| 100.000 gebruikers | **Ja**, met retentie en partitionering op events, FK-indexen, een compute-upgrade en aggregaties in SQL |
| 1 miljoen gebruikers | **Ja qua Postgres** (grotere compute, replica, partities). Dan zijn team, operatie en compliance de bottleneck, niet het schema |
| Miljoenen producten | **Niet in het huidige TS-model** (client-bundle). **Wel** in een DB-model: `sup_*` is de juiste vorm voor supplementen; voor voeding moet een analoog `food_*`-model komen. Miljoenen *supermarkt*producten zijn eerst een licentie- en curatievraag (§6), dan pas techniek |
| Honderden miljoenen voedings-/productrecords | Alleen met tijdspartitionering + archivering. Het dagboekmodel (1 rij per account-dag, `items` in jsonb) is compact en goed voor persoonlijke weergave, maar duur voor analyses over items heen → later een afgeleide genormaliseerde tabel |
| Grote hoeveelheden dagelijkse logs en metingen | Ja, met retentie + partitionering vanaf ~10–50M rijen per tabel |
| B2B-klanten met veel gebruikers | Volume is geen probleem; **isolatie** is het probleem (§10) |

---

## 6. Data architecture

### Scheiding van entiteiten — huidige stand

| Entiteit | Waar | Model | Herkomst | Oordeel |
|---|---|---|---|---|
| Producten (supplementen) | `sup_products` (DB, 25 stuks via backfill) + TS-terugval | Genormaliseerd: merk, categorie, actives, ingrediënten, certificeringen, claims, afbeeldingen, statuslevenscyclus | `sup_sources` per product/categorie; `data_checked_at`; afbeelding-`source` NOT NULL | **Goed begin**; herkomst per veld en audit van wijzigingen ontbreken; geen unique op `sup_product_actives(product_id, nutrient_key, form_key)` → dubbele CSV-import mogelijk |
| Merken | `sup_brands` met brug `pd_partner_id` | Genormaliseerd | — | Goed |
| Retailers/aanbiedingen | `sup_retailers`, `sup_offers`, `sup_offer_price_history`, `sup_clicks` | Genormaliseerd, met prijshistorie | per aanbieding | Goed |
| Supermarkten (voeding) | `src/data/nutrition/food-products.ts` | Product wijst via `foodKey` naar een voedingsmiddel en erft de gehaltes | — | **Slim ontwerp** (merk = verpakking, geen samenstelling); nog minimaal gevuld |
| Categorieën | `sup_categories` (boom) + `food-taxonomy.ts` (13 vaste groepen) | — | — | Goed; vaste groepen houden historie vergelijkbaar |
| Ingrediënten | `sup_product_ingredients` (positie, additief, allergeen) | — | — | Goed |
| Nutriënten | `NutrientId` in `src/data/nutrition/intake-reference.ts` | Code, geen tabel | — | Prima bij ~10 nutriënten |
| Gehaltes (samenstelling) | `FOOD_SOURCES` in `food-sources.ts` (~104 geciteerde waarden) | `value`/`unit`/`per 100 g` + `SourceRef {origin, ref, edition}` + `verified` + `observed` (spreiding USDA) | **Per waarde** | **Uitstekend model, verkeerde container voor schaal** |
| Voedingsmiddelen | `food-catalog.ts` (371 regels) → `bron` wijst naar `FOOD_SOURCES`; `bron: null` = werklijst | — | via verwijzing | Goed; staat in de client-bundle |
| Referentiewaarden | `reference-intake.ts` (EU 1169/2011 bijlage XIII) + `intake-reference.ts` (indicatief, "vuistregels, geen gevalideerde norm", TODO) | Code | wettelijk resp. indicatief | Scheiding correct; het indicatieve deel is een bekende schuld |
| Gebruikers | `accounts` (pseudoniem, `email citext unique` — **globaal**) | — | — | Globale uniciteit is een B2B-beslispunt (§10) |
| Profiel/metingen | Snapshots op `intake_sessions` (antwoorden, scores, leeftijdsband, gender, gewicht) + `intake_baseline_snapshots`, check-ins | Snapshot per meting, geen "huidig profiel"-tabel | `rules_version` per rij | Reproduceerbaar; het huidige profiel is afgeleid |
| Voorkeuren en doelen | `account_voedingsdoelen`, `domain_goal(_score)`, `account_nutrient_zichtbaarheid` | — | — | Ok |
| Dagboek | `account_nutrition_daybook` (uniek op account+datum; `portions`/`meals`/`items` jsonb, `water_ml`) | 1 rij per dag | — | Compact; analyse over items is duur |
| Aanbevelingen | `supplement_verdicts` (+ RPC), advies-snapshot bij T=0, `recommendation-engine.ts` | — | `based_on_session_id` | Ok |
| Berekeningen | Engines in code; versies opgeslagen (`rules_version`, `estimate_version`, `nutrition_score_version`, `model_version`); `sup_scores.inputs_hash` | — | — | **Sterk**; `sup_scores` wordt nog niet gevuld of gelezen |
| Bronnen/claims | `evidence_sources`/`evidence_claims` (DB) + `approved-claims.ts` (EFSA, code) | — | — | Ok |
| Geïmporteerde datasets | `scripts/usda-extract.mjs` (handmatig, output gitignored); CSV-import producten (#67, met controle vooraf) | — | Geen `import_runs` | **Gat** zodra imports structureel worden |

### "Waar komt iedere belangrijke waarde vandaan?"

| Waarde | Bron | Dataset | Versie | Importdatum | Bron-ID | Betrouwbaarheid | Transformatie | Handmatige correctie |
|---|---|---|---|---|---|---|---|---|
| Voedingsgehalte (NEVO/USDA) | ✅ `origin` | ✅ | ✅ `edition` | ⚠️ alleen git-datum | ✅ `ref` | ✅ `verified` + `observed` | ✅ `nutrientValue` vs `amount` gescheiden | ⚠️ git-historie, geen reden-veld |
| Supplement-etiketwaarde | ⚠️ per product | ❌ | ❌ | ⚠️ `created_at`/`data_checked_at` | ❌ | ❌ | n.v.t. | ❌ geen audit-log |
| PS-Score | ✅ model | ✅ | ✅ 1.2.0 | ✅ `computed_at` (tabel ongebruikt) | — | ✅ `determined_count`/`total_count` | ✅ pure functie | — |
| Check-score gebruiker | ✅ antwoorden | — | ✅ `rules_version` | ✅ | — | — | ✅ reproduceerbaar | — |
| RI-waarden | ✅ EU 1169/2011 | — | ⚠️ in code | — | ✅ bijlage XIII | — | — | git |
| Prijs/aanbieding | ✅ retailer | — | — | ✅ historie | ⚠️ | — | — | — |

**Conclusie.** Voor voeding ondersteunt het model herkomst al beter dan de meeste commerciële apps, maar alleen in TypeScript. Voor supplement-etiketdata, de kern van het "Consumentenbond"-verhaal, ontbreken herkomst per veld en een wijzigingslog. Juist die vraag stelt een partner of journalist als eerste: *"waarom heeft product X deze score, en wie heeft deze waarde wanneer ingevoerd?"*

### Licenties van externe datasets — bepalend voor het datamodel

| Dataset | Voorwaarde `[FEIT]` voor NEVO/USDA, `[AANNAME]` voor de rest | Gevolg voor het ontwerp |
|---|---|---|
| NEVO (RIVM) | Hergebruik "only unchanged and stating the source and version number" (strengste lezing, zie `food-sources.ts` moduledoc) | Geciteerde en afgeleide waarde strikt scheiden (al gedaan in TS); bronvermelding per waarde |
| USDA FoodData Central | Publiek domein | Vrij, maar bron en versie blijven vastleggen |
| Open Food Facts | ODbL — share-alike op afgeleide databases | **Niet mengen** met de eigen productdatabase zonder licentiebesluit; aparte laag of weglaten |
| Merk- en retailerfeeds | Contractueel (`docs/partners/DATA_BIJLAGE_PARTNERCONTRACT.md`) | Herkomst en beeldrecht per rij; feed-ID vastleggen |
| Voedingscentrum | Auteursrecht op teksten `[AANNAME]` | Citeren met bron, niet overnemen |

### Wat verbeterd moet worden (in volgorde)

1. **Nu:** unique-constraint op `sup_product_actives`, en een audit-log voor admin-mutaties op `sup_*` (wie, wat, wanneer, oud → nieuw). Die is ook nodig voor het geloofwaardigheidsverhaal (§13, X6).
2. **ADR-005 vastleggen** (herkomst en licenties): een generiek model met `data_sources` (dataset, uitgever, licentie, editie, url), `import_runs` (bron, tijdstip, aantallen, checksum, status) en per waarde `source_id`/`source_ref`/`import_run_id`/`transformation`/`verified_by`/`override_reason`. Het `FOOD_SOURCES`-model is daarvoor de blauwdruk: 1-op-1 overzetten.
3. **Bij een trigger** (volledige NEVO-import, >2k voedingsmiddelen of redactie door niet-ontwikkelaars): `food_*`-tabellen + server-side zoeken, en de catalogus uit de client-bundle halen.
4. **Niet doen:** een supermarktdatabase met miljoenen items — zie §14.

---

## 7. Business logic

### Beoordeling per logica-gebied

| Gebied | Waar | Puur? | Getest? | Versie | Versie opgeslagen? | Oordeel |
|---|---|---|---|---|---|---|
| Leefstijlcheck-scoring, urgentie, profiel | `src/lib/intake-engine.ts` (1.219 r.) | ✅ | ✅ 80%-drempel in CI | `RULES_VERSION` 1.7.0 | ✅ `rules_version` | **Sterk** |
| Inname-schatting voeding | `nutrition-intake-estimate.ts` | ✅ | ✅ | `ESTIMATE_VERSION` 1.4.0 | ✅ | Sterk |
| Voedingsscore | `nutrition-score.ts` | ✅ | ✅ | 1.1.0 | ✅ | Sterk |
| Tekortsysteem, dagboekberekeningen | `nutrition-tekortsysteem.ts`, `nutrition-dagboek*.ts` (49 `nutrition-*`-modules, bijna allemaal met test, 0 DB-/React-imports) | ✅ | ✅ | ❌ geen versieconstante | ❌ (berekend bij lezen) | Goed; versie nodig zodra uitkomsten gedeeld of opgeslagen worden |
| Eiwitdoel | `protein-target.ts` | ✅ | ✅ | 1.1.0 | — | Goed |
| Beweging (PAL, assessment) | `movement-pal.ts` 1.0.0, `movement-assessment.ts` (814 r.) | ✅ | ✅ | ✅ | — | Goed |
| PS-Score | `src/lib/supplement-score/compute.ts` | ✅ + firewall-test | ✅ | 1.2.0 | ✅ `sup_score_models` | **Sterk** — dit is je geloofwaardigheidsbezit |
| Supplementadvies | `recommendation-engine.ts` (463 r.), `domain-supplement-candidates.ts`, `supplement-verdict-store.ts` | grotendeels | ✅ | — | verdicts ✅ | Ok |
| Commissie en grootboek | `src/lib/partnerdesk/commission-*`, `src/lib/affiliate/af-ledger.ts` | deels | ✅ | `AFFILIATE_TERMS_VERSION` | — | Ok; het "append-only"-grootboek muteert wel `state` op bestaande regels |
| Orkestratie van schrijfstromen | `api/intake/session` (660 r.), `sleep-checkin` (476), `priority-pref` (446), `nutrition-log` (415) | ❌ | deels | — | — | **Zwak**: transaction scripts in routes, geen DB-transacties, compensatie met de hand |

### Wat goed is

`[FEIT]` De wetenschappelijke logica zit **niet** verstopt in React:

- componenten raken de DB nergens direct;
- `Dashboard.tsx` bevat nauwelijks rekenwerk;
- de server rekent scores zelf na;
- versies worden per meting opgeslagen.

Dat is precies wat je wilde voorkomen, en het is voorkomen.

### Wat zwak is

1. **Orkestratie zit in route handlers.** Niet herbruikbaar voor een tweede ingang (embed, partner-API, LLM-invoer), en niet atomair.
2. **Het domeinvocabulaire is gedupliceerd** (§3 C11). De voedingsfocus snoeit domeinen, dus elke snoeibeurt raakt tientallen bestanden.
3. **Een platte namespace zonder modulegrenzen.** Er zijn geen publieke `index.ts`-API's per domein. 5 lib-bestanden importeren uit `@/components` (laaginversie).
4. **Geen vaste referentiecasussen per engine-versie.** Ik vond alleen `nurture-selection-snapshot.test.ts`. `[AANNAME]` Bestaande unit-tests dekken dit mogelijk deels. Een set canonieke invoer met verwachte uitvoer, vastgepind per versie, maakt elke versiesprong zichtbaar als diff. Dat is goedkoop, en het is je bewijs richting partners.

### Aanbeveling

- Voer een dunne **application-service-laag** in, alleen voor de drie schrijfstromen met meerdere writes: check indienen, account verwijderen en `nutrition-log`. Waar atomiciteit telt, via een DB-transactie (RPC).
- Leg één **domeinregister** vast (`src/lib/domains.ts`) als enige bron voor id's, labels en scorekeys.
- Verplaats modules **incrementeel** naar domeinmappen wanneer je ze toch aanraakt. Geen big bang.

---

## 8. Security

| Gebied | Stand `[FEIT]` | Risico | Actie | Prio |
|---|---|---|---|---|
| Admin-autorisatie | Server actions en admin-pagina's alleen via de proxy; admin-API-routes checken zelf | Eén laag vóór service-role-schrijfrechten | `requireAdmin()` in elke action + een test die elk `"use server"`-bestand controleert | **P0** |
| Admin-authenticatie | Gedeeld wachtwoord, 12 u-cookie, IP-limiet (in-memory tenzij Redis), geen MFA/lockout | Brute force en diefstal van wachtwoord = alle data | TOTP in de eigen admin-login, of edge-poort (raakt de DNS-only-keuze) | **P1** |
| Consumenten-auth | Magic link/OTP, non-enumerating; HMAC-cookie 90 d; status-check in DB per request; `sameSite: lax`, `httpOnly`, `secure` in prod | Geen per-apparaat-logout | `session_version` (advies aug #7) | P2 |
| Sessietoken in URL | `rapportUrl` bevat hetzelfde ondertekende token als de sessie-cookie (`api/intake/session/route.ts:597`) | Link delen = sessie delen (90 d) | Apart doelgebonden token (HMAC over `report:` + ids) met korte geldigheid | P2 |
| IDOR | Account-routes nemen `account.id` uit de cookie; `/rapport/[sid]` vereist ondertekende tokens; claimen van sessies alleen via geverifieerde e-mail | Laag | — | ✅ |
| XSS | React escapet; 50× `dangerouslySetInnerHTML` (vooral JSON-LD); CSP met `'unsafe-inline' 'unsafe-eval'` | JSON-LD-breakout met DB-data (C7) | Escape-helper (P0); `unsafe-eval` weg (P2); nonces later | P0/P2 |
| Injectie | supabase-js parametriseert; geen ruwe SQL in de app. Eén `.or()`-filter met een template-string op admin-zoekinvoer (`partnerdesk/search-actions.ts:96`; `esc()` escapet `%`/`_` maar niet `,().`) | Filter-injectie, alleen admin, zelfde tabel | Aparte `.ilike()`-calls of komma's/haakjes escapen | P3 |
| CSRF | Cookies `sameSite` lax/strict; JSON-bodies; server actions hebben een ingebouwde origin-check | Laag | — | ✅ |
| Rate limiting | 54 van 63 API-routes; Turnstile op check en contact. Zonder limiet o.a. `consent/analytics` (schrijft `consent_records` + event, ongeauthenticeerd) | Tabelvervuiling of kosten-DoS via consent-spam | Limiet op `consent/analytics`; Redis in prod bevestigen | P2 |
| Machine-auth | Partner-postback: geheim per partner, maar **plain text in de DB** en vergeleken met `!==` (`partner/conversion/route.ts:99`). Cron: constant-time, maar de IP-allowlist leest eerst `x-forwarded-for` (`cron-auth.ts:8-13`) | Lek van de DB → partnergeheimen; allowlist te spoofen (het secret blijft vereist) | Hash + `timingSafeEqual`; `getClientIp` hergebruiken | P1 (vóór de eerste live postback-partner) / P3 |
| Geheimen | 46 env-variabelen, geen validatie bij opstart; service-role-sleutel in `/root/…/.env`; geen rotatie-runbook | Stil degraderen; rotatie is ad hoc | Env-validatie (X7); runbook | P2 |
| Supply chain | 2× high (`npm audit --omit=dev`); geen Dependabot; geen audit in CI | Bekende CVE's blijven staan | N3 | **P0** |
| Headers | HSTS preload, nosniff, frame DENY, COOP, Permissions-Policy, Referrer-Policy | — | — | ✅ |
| Latente gaten | `proxy.ts:26` sluit `/admin/api*` uit van admin-auth (die routes bestaan nu niet); demodata via `?state=` voor elke ingelogde gebruiker | Toekomstige route onbeschermd; geen lek | Uitzondering weghalen; demomodus bewust houden (handig voor B2B-demo's) | P3 |
| Infra | Root-deploy; fail2ban, SSH-config, auto-updates: UNKNOWN; DNS-only (geen WAF) | Aanvalsoppervlak op de VPS | Advies aug P1 #5 | P1 |
| Incidentgeschiedenis | INC-2026-08-15-01 (publieke anon-key + anon-SELECT-policies) afgesloten; policies gedropt en grants ingetrokken | — | Legacy JWT-keys uitgeschakeld? UNKNOWN | — |

**Consumentenapp versus B2B-platform.** In B2C zijn de dreigingen: (1) blootstelling van gezondheidsdata van individuen en (2) overname van accounts. In B2B komen daar vier bij:

- **datalekken tussen tenants** — één vergeten filter is genoeg, en met alleen service-role is er geen tweede muur;
- **bevoorrechte insiders** — tenant-admins die meer zien dan nodig;
- **contractuele verplichtingen** — meldtermijnen richting de klant, subverwerkerslijst, SLA, security-vragenlijsten en een pentest;
- **identiteitsfederatie** — SSO en offboarding.

`[OORDEEL]` Het huidige model (service-role + app-checks) is voor B2C verdedigbaar. Voor B2B heb je op z'n minst per-user-admin met audit-log nodig, en uiteindelijk isolatie op database-niveau als tweede muur (F2).

---

## 9. GDPR

### Wat sterk is `[FEIT]`

- **Documentatie.** DPIA, Verwerkingsregister, Privacyverklaring en Datalekprocedure (`docs/legal/`), plus een vastgelegde restore-test (`docs/legal/Backup_Restoretest_PerfectSupplement_nl.md`). Voor een solo-project is dit uitzonderlijk.
- **Toestemming.** `consent_records` met type en versie, `has_active_consent(...)` als poort; toestemming blijft als bewijs staan na accountverwijdering.
- **Retentie en verwijderen.** Sessies 24 maanden en nurture 12 maanden via de retentie-cron met dead-man's switch. Accountverwijdering loopt via een cascade over 17 tabellen; sessieverwijdering via een transactionele RPC.
- **Hosting en monitoring.** EU-hosting (Frankfurt); PII-scrubbing in Sentry (`sentry-scrub.ts`, `sendDefaultPii: false`).
- **Incident en AI.** Het incident van augustus is correct afgehandeld. Er is een AI Act-analyse (verdict aug C5).

### Gaten

| Gat | Bewijs | Waarom het telt | Actie |
|---|---|---|---|
| `domain_events` wordt nooit verwijderd en bevat e-mail en gedrag | C3 | Recht op vergetelheid is onvolledig; opslagbeperking geschonden; register onjuist | Geen e-mail meer in events; retentie 24 mnd; scrub bij verwijderen (N6) |
| Geen inactiviteitsregel voor accounts | Geen `last_seen_at` op `accounts` | Gezondheidsdata van inactieve accounts blijft onbeperkt staan | `last_seen_at` + beleid (bv. mail na 18 mnd, verwijderen na 24) **of** het register aanpassen |
| Register versus werkelijkheid | `VERWERKINGSREGISTER.md` §7 en accounttabellen | Bij een AP-vraag of due diligence is een onjuist register erger dan een ontbrekend | Eén keer gelijktrekken; daarna per migratie bijwerken |
| Geen self-service-export (art. 15/20) | niets gevonden | Handmatig is op deze schaal prima, mits het proces beschreven is | Proces in de privacyverklaring bevestigen; export-endpoint pas bij B2B |
| Geen DPA-sjabloon waarin jij verwerker bent | `docs/legal/` bevat alleen een Zoho-DPA-notitie | Blokkeert elke B2B-pilot met eindgebruikersdata | B1 (juridisch traject) |
| Ontwikkelen tegen productiedata? | UNKNOWN — needs verification (`.env.local` niet ingezien) | Als dev tegen prod draait, verwerk je art. 9-data op je laptop | Verifiëren; zo ja: apart dev-project met synthetische data |
| Logs op de VPS (Nginx met IP's) | Register zegt 90 d; afdwinging UNKNOWN | — | logrotate-instelling verifiëren |

### Wat verandert bij B2B

- **Rollen.** Je rol wordt per tenant bepaald: verantwoordelijke of verwerker.
- **Per tenant.** Export en verwijdering per tenant, plus een DPIA-addendum per tenanttype.
- **Werknemers.** Voor werknemersdata geldt een absoluut verbod richting de werkgever (verdict C2).
- **Zorgcontext.** In een zorgcontext kantelt het beoogde doel (MDR).
- **Beleid.** Geen aggregatie of LLM-training over tenants heen (`PLAN_NURTURE_MULTIPRODUCT_DATA_READINESS.md` DEEL 4C).

---

## 10. Multitenancy

### Wat er ligt `[FEIT]`

- `organizations` met 1 rij; `organization_id` NOT NULL met default op de consumententabellen (intake, consent, events, accounts, dagboek en meer).
- `orgScoped()`/`unscoped()` (`src/lib/db/scoped.ts`), gebruikt in 5 nieuwe account-routes.
- Een drift-test (`src/lib/db/__tests__/organization-id-drift.test.ts`) met een bewuste allowlist (`pd_`, `af_`, `sup_`, tokens, `account_entitlements`).
- De header-spoof is dicht (`org-resolver.ts`); de oude partner-intake/analytics-API is verwijderd; de dode `theme`/`orgRegistry`-scaffold is weg.
- De RLS-policies op `auth.jwt()->app_metadata->organization_id` bestaan, maar zijn dood (geen auth-client).

### Per dimensie

| Dimensie | Nu | Voorbereid? | Nodig bij tenant 2 |
|---|---|---|---|
| Tenant-isolatie | Alleen app-filters; ~5% van de oude call-sites filtert | Naad + wrapper | Oude call-sites op de pilotpaden migreren; fail-closed resolver |
| `tenant_id`-strategie | `organization_id` op consumententabellen; admin-domeinen bewust zonder | ✅ | `account_entitlements.organization_id` (geldnaad) |
| DB-isolatie | Gedeelde tabellen, één project | Keuze open | Gedeeld + RLS als tweede muur (F2); apart project alleen op contracteis |
| RLS | Deny-all; tenant-policies dood | Deels | Echte principal nodig (Supabase Auth of een eigen JWT per request) — duur, alleen bij tenant 3+ of enterprise-eis |
| Autorisatie/rollen | Account = eigenaar; admin = één persoon | ❌ | Rollen (tenant-admin, coach, lid), membership-tabel |
| Organisatielidmaatschap | ❌ | ❌ | `organization_members` |
| Adminusers | Gedeeld wachtwoord | ❌ | Per-user-admin + audit (X6) — **eerst**, want dit is de kiem van rollen |
| Billing | ❌ | ❌ | Pas bij een betaalde pilot |
| Feature flags / tenantconfig | Env-flags; `organizations.settings.maxTier` bestaat | Deels | Flags per tenant in `settings` |
| Branding | ❌ (`getOrgConfig` negeert `orgId`) | ❌ | Logo/kleur/afzender; **geen** contentfork ("jouw merk, mijn content", verdict A4) |
| Audit-logs | `pd_timeline_events`, `consent_records`, `cron_runs` | Deels | Per tenant, onveranderbaar |
| Data-export/-verwijdering per tenant | ❌ | ❌ | Nodig vóór de pilot |
| API-keys/service accounts | Per partner een geheim (platte tekst) | ❌ | Gehashte keys-tabel met `org_id` en `revoked_at` (verdict A2) |

### Nu voorbereiden (goedkoop, wordt duurder als je wacht)

- Drift-test en `orgScoped()` voor nieuwe code op consumententabellen **blijven gebruiken**.
- **Per-user-admin + audit-log** (X6): nodig voor security en due diligence, en de kiem van rollen.
- ADR over `accounts.email`: uniek per organisatie of globaal? Alleen een besluit, geen code. Globaal betekent één persoon, één account over tenants heen; per organisatie betekent dat bestaan in tenant A niet te zien is vanuit tenant B.
- `account_entitlements.organization_id` meenemen **zodra premium live gaat** (verdict A3).

### Later

RLS met tenant-claim, tenant-admin-UI, branding, billing/seats, SSO, per-tenant export, API-keys, flags per tenant.

### Absoluut voorkomen

- `org_id` op `pd_`, `af_` of `sup_` (admin-domeinen).
- Tenant-specifieke codeforks (`if (tenant === …)`).
- Per-tenant database-kopieën zonder contracteis.
- Aggregatie of LLM-training over tenants heen.
- Werkgeversrapportage op gezondheidsdata.
- Tenants die claims of het scoremodel kunnen aanpassen: de EFSA-grens moet met de engine meereizen (DEEL 4C).

### Tenanttypen uit de opdracht

| Tenant | Juridisch | Technisch | Oordeel |
|---|---|---|---|
| **A — Werkgever** | ❌ AP: geen verwerking van slaap- en bewegingsdata van werknemers, ook niet geanonimiseerd via een derde (verdict C2) | — | **Niet doen.** Alleen de cadeaubon-variant (werknemer is klant, geen data naar de werkgever) |
| **B — Sportschool** | ⚠️ Kan, als leden hun eigen advies krijgen en de sportschool hooguit niet-gezondheids-KPI's ziet (aantal checks). Zien trainers individuele uitkomsten, dan word je verwerker en schuift het beoogde doel | Co-branding + tenant-afdwinging + k-anonieme rapportage | **Mogelijk, na drempels en een juridisch traject** |
| **C — Diëtistenpraktijk** | ⚠️ Zorgaanbieder: MDR-kanteling, verwerkerschap, NEN 7510-verwachtingen | Koppeling behandelaar ↔ cliënt, deeltoestemming, toegangslog | **Duurste variant**; niet vóór een apart juridisch traject |
| **D — Voedings-/supplementenbedrijf** | Juridisch ok | Kan | **Niet als tenant** (onafhankelijkheid, firewall). **Wel als upstream partner** — dat bestaat al (PartnerDesk, postback, data-bijlage) |
| **E — Enterprise** | Als werkgever: ❌; als zorggroep: zie C | SSO, SLA, pentest, ISO | Niet binnen 12 maanden realistisch |

**Point of no return** (ongewijzigd uit het verdict): de dag dat er een **tweede rij in `organizations`** komt die echt verkeer krijgt. Vanaf dan is elke ongefilterde query een datalek.

---

## 11. B2B readiness — wat ontbreekt, en het maturity model

### Wat ontbreekt voor een B2B-pilot

| Categorie | Ontbreekt |
|---|---|
| Techniek | Per-user-admin + audit-log; tenant-afdwinging op de pilotpaden; export en verwijdering per tenant; monitoring en health-checks; deploys zonder downtime; staging |
| Product | Aantoonbaar gebruik door eindgebruikers (nu ~2 checks); een afgebakende pilotpropositie; demo op synthetische data (`?state=` bestaat al) |
| Operatie | Supportkanaal, incidentproces richting de klant, statuspagina, runbooks (deploy, restore, sleutelrotatie) |
| Security | Admin-MFA; pentest-light; dependency-bewaking; schema reproduceerbaar |
| Juridisch/AVG | Rolmodel per tenanttype; DPA-sjabloon (jij als verwerker); subverwerkerslijst; MDR-doelomschrijving; DPIA-addendum |
| Commercieel | Een concrete partij die je bij naam kunt noemen (verdict open vraag 3) |

### Maturity model

Een percentage is hier een oordeel, geen meting. **Rubriek:** 0–20 afwezig · 20–40 ad hoc · 40–60 gedefinieerd · 60–80 afgedwongen en getest · 80–100 gemeten en geaudit. Doel = 12 maanden, onder voorwaarde van de drempels. Er is bewust geen totaalscore.

| Dimensie | Nu | Doel | Gap | Wat nodig is |
|---|---|---|---|---|
| Architectuur | 55% | 70% | Orkestratie in routes; platte lib; geen ADR's | Application services (3 stromen), domeinregister, ADR-001…010 |
| Codekwaliteit | 65% | 75% | God-componenten, duplicatie | Strict TS en lint 0 zijn er al; `Dashboard.tsx` opknippen wanneer je hem toch aanraakt |
| Data-architectuur | 45% | 65% | Schema-drift; herkomst alleen in TS; geen imports-registry | N5, ADR-005, audit-log op `sup_*` |
| Security | 50% | 75% | Admin-grens, deps, CSP, geheimen | N1–N3, N8, N9, X11 |
| Schaalbaarheid | 40% (voor >10k) | 60% | Stille afkap, indexen, events | X1–X3, retentie |
| Observability | 20% | 60% | Geen health, alerts of logstructuur | N10, X10 |
| Productvolwassenheid | 30% | 50% | Breed in features, niet gevalideerd | Tractie (niet-technisch) |
| B2B-gereedheid | 10% | 30% (voorwaardelijk) | Zie tabel hierboven | M1–M5 |
| Multitenant-gereedheid | 20% | 25% (bewust laag) | Naden liggen er | Alleen deur-open houden |
| Operationele gereedheid | 25% | 55% | Build op prod, root, geen staging of runbooks | N4, X4, X5 |
| AVG-gereedheid | 60% | 85% | Handhaving versus register; B2B-documenten | N6, B1 |

---

## 12. Commercial readiness en contract-timeline

### Zes gereedheidsassen — stand vandaag

| As | Stand | Kernpunt |
|---|---|---|
| Technisch | 🟡 | Voor B2C inzetbaar; voor B2B ontbreken admin-identiteit, tenant-afdwinging en monitoring |
| Product | 🔴 | Geen bewijs van gebruik; dit is de grootste gap en die is niet technisch |
| Operationeel | 🔴 | Solo, geen support- of incidentproces richting klanten |
| Security | 🟡 | Goed gedocumenteerd, de admin-grens moet dicht |
| Juridisch/AVG | 🟡 | Sterke B2C-documenten; B2B-rolmodel en DPA ontbreken; werkgever gesloten |
| Commercieel | 🔴 | Waarde niet gevalideerd; geen concrete partij |

### Welke gesprekken zijn wanneer verantwoord?

| Gesprek | Verantwoord zodra | Nu |
|---|---|---|
| Upstream partnerschap (merchant/merk: commissie, datafeed, postback) | **Nu** — PartnerDesk, kliktoken, postback en data-bijlage bestaan | ✅ na N2 (JSON-LD) en N9 (geheimen) |
| Verkennend of feedbackgesprek (geen data, geen belofte) | **Nu**, met de demomodus op synthetische data | ✅ |
| Design partner (co-ontwerp, geen persoonsdata) | Na M1 (hygiëne) | 🟡 ±4 weken |
| Onbetaalde pilot met echte eindgebruikers | Na M1 + M3 (juridisch) + M5 (tenant-afdwinging op de pilotpaden) | ❌ |
| Betaalde pilot | Na M1–M5 **en** B2C-drempels uit `PLAN_FUNNEL_DATA_PRIORITY.md` | ❌ |
| B2B-contract met SLA | Na een pilot + no-downtime deploys, runbooks, pentest-light | ❌ |
| API-integratie of datapartnerschap | Na ADR-005 (herkomst/licenties) + API-contract + key-beheer | ❌ |
| Enterprise-overeenkomst | Na SSO, pentest, ISO-light | ❌ niet binnen 12 mnd |

### Timeline in scenario's — geen belofte

**Aannames.**

- Solo, AI-ondersteund, **±20 effectieve bouwuren per week** — UNKNOWN; bij meer of minder uren schalen de weken evenredig.
- Een jurist is beschikbaar met 2–4 weken doorlooptijd.
- Geen scope-uitbreiding naar het dashboard.
- De stack blijft zoals hij is.

| Fase | Technische stand | Mogelijke commerciële activiteit | Scenario 1: tractie komt | Scenario 2: tractie blijft uit | Scenario 3: concrete partij meldt zich eerder |
|---|---|---|---|---|---|
| 1 Foundation (M1) | Hygiëne klaar | Verkennende gesprekken, upstream-partners | wk 0–4 | wk 0–4 | wk 0–4 |
| 2 MVP-bewijs (M2) | Ongewijzigd; distributiewerk | Design partners, demo's | mnd 1–3 | mnd 1–3, daarna herijken | versneld: partner definieert de scope |
| 3 Pilot-ready (M3–M5) | Juridisch traject, per-user-admin, tenant-afdwinging op de pilotpaden, monitoring | Pilotgesprekken | mnd 3–5 | **niet aanbevolen** | mnd 2–4 bij een smalle scope (co-branded check + content, geen professional-dashboard) |
| 4 B2B-ready | Pilot draait, pentest-light, export/verwijdering per tenant | Betaalde pilot | mnd 5–8 | — | mnd 4–6 |
| 5 Production-ready | No-downtime deploys, SLA-light, support | Contract | mnd 8–12 | — | mnd 6–10 |
| 6 Scale-ready | SSO, ISO-light, meerdere instanties | Grotere organisaties | >12 mnd | — | >12 mnd |

**Formulering.** Op basis van de huidige technische staat lijkt een eerste serieuze B2B-pilot pas verantwoord zodra drie dingen af zijn:

1. de NOW-lijst;
2. de juridische rolverdeling met DPA-sjabloon;
3. per-user-admin met audit-log en monitoring.

**Commercieel** zinvol wordt het pas zodra de B2C-drempels aantonen dat eindgebruikers het product gebruiken.

**Versnellers.** Een design partner die de scope smal houdt. Hergebruik van consent, versies en demomodus. Kiezen voor "jouw merk, mijn content" (geen CMS).

**Vertragers.** Juridische doorlooptijden (4–8 weken); een MDR-beoordeling als een zorgpartij instapt; solo-capaciteit; terugkerende scope-uitbreiding (het patroon dat het verdict van 30 augustus beschrijft); uitblijvende B2C-tractie.

**Onbekend.** Of er een concrete partij is (verdict open vraag 3): *"kun je die niet bij naam noemen, dan heb je het antwoord al."*

---

## 13. Roadmap

Effort: **S** ≤ ½ dag · **M** 1–3 dagen · **L** 1–2 weken · **XL** > 2 weken. Prio: P0 = nu, P1 = binnen dit kwartaal, P2 = gepland, P3 = als je er toch bent.

### NOW — 0–4 weken (samen ±6–9 bouwdagen, geen features)

| # | Taak | Impact | Effort | Afhankelijk van | Prio | Waarom |
|---|---|---|---|---|---|---|
| N1 | `requireAdmin()` in alle 80 server actions en de admin-pagina's + een vitest die elk `"use server"`-bestand controleert; `/admin/api`-uitzondering uit `proxy.ts` | Hoog | S–M | — | P0 | C1; Next-docs |
| N2 | Eén `jsonLdScript()`-helper met `<`-escaping voor alle JSON-LD | Middel-Hoog | S | — | P0 | C7; vóór de eerste feed |
| N3 | `npm audit fix` (nodemailer, brace-expansion) + Dependabot + `npm audit --omit=dev --audit-level=high` in CI | Middel | S | — | P0 | C9 |
| N4 | Branch protection op `main` (required checks, geen force-push) + **ADR-007** (één deploy-pad: `deploy.yml` weg, óf met schema-gate) + CLAUDE.md, `OPENSTAAND.md`-runbook, `ARCHITECTURE.md` en `SECURITY.md` gelijktrekken | Hoog | S | ADR-007 | P0 | C4 |
| N5 | Schema-drift dichten: idempotente migraties voor `cron_runs`, `thema_nurture`, `thema_downloads` en `remeasure_reminders` (vanuit een schema-dump van prod); `check-supabase-schema.sh` uitbreiden; lokaal `supabase db reset` als bewijs; `db/` markeren als legacy | Hoog | M | toegang tot het prod-schema | P0 | C5 |
| N6 | AVG: (a) geen e-mail meer in `domain_events`; (b) retentie 24 mnd; (c) scrub bij verwijderen van sessie of account; (d) `accounts.last_seen_at` + inactiviteitsbeleid **óf** het register aanpassen | Hoog | M | Besluit over bewaartermijn inactief | P0 | C3 |
| N7 | Boek-PDF uit HEAD. History-purge is destructief → **jouw besluit**, verplicht vóór de repo ooit gedeeld wordt | Hoog (DD) | S | — | P0 | C6 |
| N8 | Admin-MFA (TOTP in de eigen login) | Hoog | M | ADR-002 | P1 | C2 |
| N9 | Partnergeheim hashen + `timingSafeEqual`; cron-allowlist via `getClientIp` | Middel | S | — | P1 | §8 |
| N10 | `/api/health` (DB-ping) + externe uptime-monitor met alert | Middel | S | — | P1 | C10 |

### NEXT — 1–3 maanden

| # | Taak | Impact | Effort | Afhankelijk van | Prio | Waarom |
|---|---|---|---|---|---|---|
| X1 | Admin-aggregaties naar SQL (views/RPC, zoals de bestaande `v_funnel_week`) | Middel | M | — | P1 | Stille afkap bij 1.000 rijen |
| X2 | `remeasure-reminder-cron` batchen of in SQL joinen | Middel | S | N5 (tabel) | P1 | `.in()`-limiet; afkap van accounts |
| X3 | FK-indexen (o.a. `nurture_emails.session_id`, `domain_goal_score.*`, `premium_waitlist.account_id`) + `intake_sessions(created_at)` + `lower(marketing_email)`; unique op `sup_product_actives` | Middel | S | — | P1 | Cascades en retentie op schaal |
| X4 | Build van de server af (CI-artifact of container), systemd als niet-root-user, health-check na herstart, rollback naar het vorige artifact | Hoog | M–L | N4 | P1 | Downtime, root, OOM-risico |
| X5 | Staging: tweede Supabase-project + omgeving met synthetische data | Middel | M | N5 | P2 | Testen tegen echt schema zonder prod-data |
| X6 | Per-user-admin (`admins`, rol) + `admin_audit_log` voor alle mutaties (oud → nieuw) | **Hoog (B2B-voorwaarde)** | M | N1, N8 | P1 | Due diligence, "waarom deze score?" |
| X7 | Env-validatie bij opstart (één module; hard falen in prod op kritieke variabelen) | Middel | S | — | P2 | 46 variabelen die stil degraderen |
| X8 | Domeinregister (`src/lib/domains.ts`) + de 7 kopieën migreren | Middel | M | — | P2 | De voedingsfocus snoeit domeinen |
| X9 | Application services voor 3 schrijfstromen, met transacties via RPC | Middel | M | — | P2 | Herbruikbaar, atomair |
| X10 | Gestructureerde logs met request-ID; client-Sentry repareren (`NEXT_PUBLIC_SENTRY_DSN`) | Middel | S–M | — | P2 | C10 |
| X11 | CSP zonder `unsafe-eval` (GTM/Clarity nameten) | Middel | S–M | — | P2 | Advies aug #10 |
| X12 | `session_version` voor accounts | Middel | S–M | — | P2 | R7 |
| X13 | Referentiecasussen per engine-versie (golden files) | Middel | S–M | — | P2 | Bewijs richting partners |

### B2B PREPARATION — 3–6 maanden (alleen bij drempels + een concrete partij)

| # | Taak | Impact | Effort | Afhankelijk van | Prio | Waarom |
|---|---|---|---|---|---|---|
| B1 | Juridisch traject: rolmodel per tenanttype, DPA-sjabloon, subverwerkerslijst, MDR-doelomschrijving, DPIA-addendum | Hoog | L (doorlooptijd) | concrete partij | voorwaardelijk P1 | Geen pilot zonder |
| B2 | Tenant-afdwinging op de pilotpaden: `orgScoped()`-migratie, fail-closed resolver, `account_entitlements.organization_id`, besluit over `accounts.email` | Hoog | L (verdict: 2–3 wk) | B1 | P1 | Point of no return |
| B3 | Minimale tenant-admin: leden, rollen viewer/admin, export en verwijdering per tenant | Hoog | L | X6, B2 | P1 | AVG, contract |
| B4 | Extern pentest-light (auth, admin, tenantgrens) | Hoog | M | B2 | P1 | Security-vragenlijsten |
| B5 | Support- en incidentproces, statuspagina, SLA-light | Middel | M | X4, N10 | P2 | Operationele gereedheid |
| B6 | Rapportage per tenant met k-anonimiteit (k ≥ 20) of alleen niet-gezondheids-KPI's | Middel | M | B2 | P2 | AVG + verdict C2 |
| B7 | Co-branding via `organizations.settings` (logo, kleur, afzender) — geen contentfork | Laag-Middel | M | B2 | P3 | Verdict A4 |

### SCALE — 6–12 maanden (triggergestuurd)

| # | Taak | Trigger |
|---|---|---|
| S1 | Meerdere app-instanties: Redis-ratelimit, gedeelde ISR-cache-handler, load balancer | CPU > 60% structureel of p95 > 500 ms |
| S2 | Postgres-gebaseerde queue voor mail en imports | Cron-batches lopen achter |
| S3 | Partitionering en archivering van `domain_events` | > 10M rijen |
| S4 | `food_*`-tabellen + `import_runs` + herkomst (ADR-005); volledige NEVO | > 2k voedingsmiddelen of redactie door niet-ontwikkelaars |
| S5 | Server-side zoeken (pg_trgm/FTS) | Catalogus uit de client-bundle |
| S6 | Cloudflare-proxy/CDN (DNS-only-keuze herzien; `client-ip.ts` aanpassen) | Pieken, DDoS, internationaal verkeer |
| S7 | Materialized views / PostHog voor analyses | Admin-queries > 1 s |

### FUTURE — 12+ maanden

| # | Taak | Trigger |
|---|---|---|
| F1 | SSO (OIDC/SAML) | Contractuele eis |
| F2 | RLS met tenant-claim als tweede muur | Tenant 3+ of enterprise-eis |
| F3 | ISO 27001-light / SOC 2 | Contract |
| F4 | Read replica, grotere compute | DB-CPU |
| F5 | Publieke API + key-beheer + OpenAPI + schemavalidatie | Getekende integratiepartner |
| F6 | CMS | Redactie door niet-ontwikkelaars of tenant-content |
| F7 | Engine als intern pakket (Accendo-SDK) | Tweede afnemer van de engine |

---

## 14. Do not build yet

| Niet bouwen | Waarom niet nu | Wanneer wel (trigger) |
|---|---|---|
| Multi-tenancy (tenant-UI, membership, per-tenant RLS) | 0 klanten; verdict 30 aug A5 | Getekende betalende klant |
| Migratie naar Supabase Auth | Raakt de riskantste laag; de HMAC-cookies werken | SSO-eis of een tweede auth-provider |
| Enterprise-IAM / SSO / SCIM | Geen afnemer | Contracteis |
| Microservices of een aparte backend | Eén ontwikkelaar; één deploy is een feature | Team > 5 met gescheiden domeinen |
| Kubernetes / orkestratie | Eén VPS volstaat ruim | > 3 instanties structureel |
| Event-driven architectuur, Kafka, CQRS | De outbox in Postgres bestaat al | Integraties die realtime fan-out eisen |
| Sharding / partitionering nu | Tabellen zijn klein | > 10–50M rijen per tabel |
| Multi-region / HA | Geen SLA | SLA ≥ 99,9% in een contract |
| Headless CMS | Content is gecureerd; git is de audittrail | Redactie door niet-ontwikkelaars of tenant-content |
| Search-engine (Elastic, Typesense) | 371 voedingsmiddelen | > 50k doorzoekbare items of Postgres-FTS te traag |
| Data-warehouse / BI-stack | N ≈ 2 | 500+/2000+-drempels + k-anon-pad |
| Queue-infrastructuur (Redis-workers) | Cron + outbox volstaat | Batches lopen achter |
| Supermarktdatabase met miljoenen producten (OFF/GS1) | Licentie (ODbL share-alike), curatie, scope | Bewezen vraag + licentiebesluit |
| Werkgeversdashboards met gezondheidsdata | Juridisch dicht | Nooit |
| LLM-chat live | V1–V6 (besluit 25 sep) | V1–V6 rond |
| Wearable-ingest | DPIA + toestemming | Productbesluit + DPIA |
| n8n als integratiehub | Verdict C4 | Integratie die je echt niet zelf wilt bouwen |
| Publieke API / developer portal | Geen partner | Getekende integratiepartner |
| Billing en seats voor B2B | Geen betaalde pilot | Betaalde pilot |
| Generiek "domein-plug-in"-framework | Domeinen krimpen | ≥ 3 nieuwe domeinen tegelijk |
| Big-bang herindeling van `src/lib` | Grote diff op een live systeem | Nooit; incrementeel bij aanraken |
| Engine naar een npm-pakket (Accendo) | Er is geen tweede afnemer | Tweede afnemer |

---

## 15. Architecture target

**Over 6 maanden — solide fundament** (dezelfde stack, niets exotisch):

- Admin achter per-user-login + MFA + audit-log; elke server action controleert zelf.
- Schema reproduceerbaar; staging draait op synthetische data; build buiten de productieserver; health + uptime + alerts.
- AVG afgedwongen zoals het register zegt; admin-aggregaties in SQL; domeinregister; application services voor 3 stromen.
- Voeding nog in TS, tenzij een trigger is geraakt.

**Over 12 maanden — professioneel consumentenproduct, B2B-ready als de drempels gehaald zijn:**

```
Browser ─▶ (CDN, indien S6) ─▶ Nginx ─▶ Next.js (1–2 instanties, gedeelde cache bij 2)
                                          ├─ Ingangen: routes + actions, elk met principal-check
                                          ├─ Application services (schrijfstromen, transacties)
                                          ├─ Engines (puur, geversioneerd, golden files)
                                          └─ DAL: orgScoped()/unscoped() met principal
                                                   ▼
                     Postgres: consumentendata (org-gedragen) · admin-domeinen (mono)
                               · data_sources/import_runs/food_* (indien S4) · admin_audit_log
Jobs: cron + outbox (+ Postgres-queue indien S2) · Observability: Sentry + logs + uptime
```

**Over 24 maanden — multi-tenant/platform, alleen als er klanten zijn:** RLS met tenant-claim als tweede muur; tenant-admin; SSO; een API met keys; de engine als intern pakket; meerdere instanties; gepartitioneerde events; een analyselaag. Nog steeds een modulaire monoliet — geen microservices.

---

## 16. Recommended next actions — de eerstvolgende 10

1. **Admin-actions dichtzetten (N1).** `requireAdmin()` in alle 80 server actions (`src/lib/{partnerdesk,affiliate,product-admin}/*-actions.ts`) en de admin-pagina's, plus een test die elk `"use server"`-bestand controleert.
2. **JSON-LD escapen (N2).** Eén helper voor alle 50 `dangerouslySetInnerHTML`-plekken, te beginnen bij `src/app/beste/[supplement]/page.tsx`.
3. **Dependencies (N3).** `npm audit fix` + Dependabot + een audit-gate in `.github/workflows/ci.yml`.
4. **Eén deploy-pad (N4).** Branch protection op `main`; ADR-007 beslissen; `deploy.yml`, CLAUDE.md en `OPENSTAAND.md` gelijktrekken.
5. **Schema reproduceerbaar (N5).** Migraties voor de 4 tabellen buiten de repo; verse `supabase db reset` als bewijs.
6. **AVG afdwingen (N6).** Eerst het besluit over de bewaartermijn van inactieve accounts; dan retentie en scrub voor `domain_events`, en geen e-mail meer in events.
7. **Boek-PDF weg (N7).** Uit HEAD; over de history-purge beslis jij.
8. **Admin-MFA (N8)**, daarna per-user-admin + audit-log (X6).
9. **Health en uptime (N10)** + een nachtelijke check dat de crons gedraaid hebben (`cron_runs` bestaat al).
10. **ADR-001…010 beoordelen** (bijlage E): per ADR accepteren, aanpassen of afwijzen en de status bijwerken. **En, niet-technisch en belangrijker dan alles hierboven:** de distributiestap uit het verdict van 30 augustus. Die bepaalt of er ooit een B2B-gesprek komt.

---

# DEEL II — BIJLAGEN (bewijs per fase)

## A. Inventaris (fase 1)

### Frontend

| Onderwerp | Stand `[FEIT]` |
|---|---|
| Framework | Next.js 16.3 (App Router), React 19.2, Tailwind 4, TS strict |
| Pagina's | 81; content-routes statisch (`generateStaticParams`), admin en `/supplementen` `force-dynamic` |
| Server/client | 320 bestanden met `"use client"`; het dashboard is een client-app (124 componenten, ~30k regels) |
| State | Lokale `useState`/`useEffect` (`Dashboard.tsx`: 21/13); geen globale store |
| Data fetching | Server: directe lib-calls; client: 45 `fetch("/api…")`-plekken, geen SWR/React Query |
| Forms | Controlled components + fetch; server actions alleen in admin |
| Caching | Statisch + `revalidatePath` vanuit admin-actions; geen `"use cache"`, `unstable_cache` of `revalidateTag` |
| Loading/error | 1× `loading.tsx` (dashboard), **0× `error.tsx`/`global-error.tsx`**, 1× `not-found.tsx`; `onRequestError` → Sentry |
| Code splitting | 1× `next/dynamic` |
| Design system | Tailwind op de publieke site; het dashboard heeft een eigen primitives-/CSS-variabelensysteem met veel inline `style` (geheugen 5 sep: ~1.023 plekken) — wijkt af van CLAUDE.md |
| SEO | Metadata op alle publieke pagina's (64/81; de rest is admin); 33 JSON-LD-plekken; `sitemap.ts`, `robots.ts` |
| Toegankelijkheid | 935 `aria-*`/`role`-attributen; geen strengere a11y-lintregels dan de Next-default; EAA-uitzondering voor micro-ondernemingen (verdict C5) |
| Afbeeldingen | 15 bestanden met `next/image`, 2× een ruwe `<img>`; AVIF/WebP |

### Backend

| Onderwerp | Stand `[FEIT]` |
|---|---|
| API-routes (63) | `account/*` (27), `intake/*` (17), `admin/*` (6), `cron/*` (3), overig (10): `send-reminders`, `partner/conversion`, `affiliate/click`, `supplements/click`, `chat`, `contact`, `consent/analytics`, `gids/*` (2), `unsubscribe` |
| Server actions | 15 bestanden, 80 exports: PartnerDesk (9 bestanden), affiliate (3), product-admin (3) |
| Services/repositories | Geen formele laag; `src/lib/*-server.ts` en `src/lib/<domein>/queries.ts` fungeren als repository; `orgScoped()` als DAL-naad |
| Background jobs | HTTP-crons (`/api/cron/nurture`, `/retention`, `/n8n-events`, `/api/send-reminders`) + dead-man's switch; het schema staat buiten de repo (UNKNOWN) |
| Externe API's | Supabase, Resend, SMTP, Turnstile, GA4/Clarity (client), Sentry, Upstash/Redis (optioneel), USDA FDC (script), n8n (uit) |
| Authenticatie | Zie §2 Identiteiten |
| Validatie | Handmatig (97 `validate*/parse*`-functies), geen schemabibliotheek |
| Foutafhandeling | Try/catch in 51/63 routes; `console.error` (172×); generieke foutteksten naar de client (geen `error.message` gelekt) |
| LLM | Geen dependency of call in `src/`; `intake/chat` is een deterministische state machine |

### Waar zit de businesslogica?

| Vraag | Antwoord |
|---|---|
| Verspreid? | **Rekenlogica: nee** — in pure modules. **Orkestratie: ja** — in route handlers |
| Dubbel geïmplementeerd? | Domeinvocabulaire ja (≥7 kopieën); rekenlogica nee (client en server delen dezelfde engine) |
| Te sterk gekoppeld aan UI? | Nee; 5 lib-bestanden importeren wel uit `@/components` |
| Te sterk gekoppeld aan de DB? | Nee voor engines (0 DB-imports in `nutrition-*`); ja voor de orkestratie in routes |
| Herbruikbaar? | Engines: ja. Schrijfstromen: nee, zonder X9 |
| Geschikt voor API/integraties? | Engines ja; contracten (validatie) nee — schemalaag pas bij F5 |

---

## B. Database-inventaris (fase 2)

### Tabelfamilies `[FEIT]`

| Familie | Tabellen | Toegang |
|---|---|---|
| Consument / intake | `intake_sessions`, `intake_intake_log`, `intake_domain_checkin`, `intake_baseline_snapshots`, `intake_feedback`, `intake_reminders`, `nurture_emails`, `plan_progress`, `recovery_tokens`, `consent_records`, `domain_events`, `guide_opt_ins`, `daily_action_log`, `movement_session_log`, `agenda_blocks`, `domain_goal(_score)`, `supplement_verdicts`, … | Service-role; `organization_id` op de meeste |
| Account | `accounts`, `account_login_tokens`, `account_entitlements`, `premium_waitlist` + 7× `account_*` (dagboek, doelen, favorieten, …) | Service-role; cascade bij verwijderen |
| Kennis/evidence | `evidence_sources`, `evidence_claims` (pgvector aangezet, embeddings leeg), `interventions`, `intervention_triggers`, `themes`, `recognition_lines`, `disclaimers` | Service-role |
| Productcatalogus `sup_*` | 16 tabellen | Deny-all, service-role, bewust mono |
| PartnerDesk `pd_*` | 19 tabellen | Idem |
| Affiliate-programma `af_*` | 11 tabellen | Idem |
| Legacy | `affiliate_clicks` (niet aanraken), `cprofile_*` (stop-lijst) | — |
| Tenant | `organizations` (1 rij) | — |
| **Buiten migraties** | `cron_runs`, `thema_nurture`, `thema_downloads`, `remeasure_reminders` | **Drift (C5)** |

### Kenmerken

| Kenmerk | Stand |
|---|---|
| Indexen | 106; hot paths zijn grotendeels gedekt (`account_id`, `(account_id, date)`, partiële index op pending nurture) |
| FK's zonder index | o.a. `nurture_emails.session_id` (cascade bij retentie), `domain_goal_score.account_id/session_id`, `premium_waitlist.account_id`, `supplement_verdicts.based_on_session_id` |
| Ontbrekende indexen voor querypatronen | `intake_sessions(created_at)` (retentie), `lower(marketing_email)` (claim-RPC), `domain_events` outbox (`NOT delivered_to @> '{n8n}'` kan geen index gebruiken) |
| Constraints | 117 check-constraints; enums bewust als text + check (flexibel, goed) |
| JSON | 44 jsonb-kolommen (antwoorden, scores, maaltijden, items, payloads) |
| Normalisatie | `sup_*`, `pd_*`, `af_*` goed genormaliseerd; gebruikersmetingen bewust als snapshots in jsonb |
| Historie/versies | Versiekolommen per meting; `sup_offer_price_history`; `sup_score_models` |
| Auditability | `pd_timeline_events`, `consent_records`, `cron_runs`; **geen** audit-log op `sup_*` of admin-mutaties |
| Soft deletes | `agenda_blocks.deleted_at`; `archived_at` in `pd_*`/`sup_*`; verder hard delete (AVG-vriendelijk) |
| Triggers | 0 — `updated_at` wordt door de app bijgehouden |
| Migraties | `supabase/migrations/` + `OPENSTAAND.md` + `check:migraties` (CI) + `check:db-schema` (deploy.sh). Discipline goed; drift uit de periode vóór de baseline niet volledig ingehaald |
| RLS | 85× aangezet; tenant-policies dood; anon volledig ingetrokken na het incident |

---

## C. Performance — P0 / P1 / P2 (fase 8)

| Prio | Probleem | Waar | Oplossing |
|---|---|---|---|
| **P0** | Geen enkel probleem dat nu zichtbaar pijn doet bij het huidige verkeer | — | — |
| **P1** | Hele tabellen ophalen en in JS aggregeren (+ stille afkap bij 1.000) | `api/admin/data/route.ts` | SQL-views/RPC (X1) |
| **P1** | `.in()` met alle account-ID's + afkap van accounts bij 1.000 | `remeasure-reminder-cron.ts` | Batchen/join in SQL (X2) |
| **P1** | FK zonder index op cascade-paden; retentie-delete zonder `created_at`-index | Bijlage B | X3 |
| **P1** | `domain_events` groeit onbegrensd | `events.ts` | Retentie (N6), later partitie (S3) |
| **P1** | Build op de productie-VPS concurreert met de draaiende app; herstart = downtime | `deploy.sh` | X4 |
| **P2** | Voedingscatalogus (~65 KB) en bronnen (~85 KB) in de client-bundle | 8 dagboek-componenten, 2 publieke | Server-side zoeken bij groei (S5) |
| **P2** | Dashboard als één grote client-app (1× `next/dynamic`); tabs laden alles vooraf | `src/components/dashboard/` | Per tab lazy laden wanneer je ze aanraakt; bundle-grootte meten (UNKNOWN) |
| **P2** | N+1 in de nurture-cron (per mail meerdere queries, sequentieel, batch 50) | `nurture-cron.ts` | Pas bij volume (S2) |
| **P2** | `/supplementen` is `force-dynamic` en rekent per request alle PS-Scores | `src/app/supplementen/page.tsx`, `product-catalog.ts` | Scores cachen of `sup_scores` gebruiken zodra het verkeer dat vraagt |
| **P2** | Sequentiële schrijfacties in de check-POST (latency + geen atomiciteit) | `api/intake/session` | X9 |
| **P2** | CI draait de testsuite twee keer (`npm test` + `--coverage`) | `ci.yml` | Eén run met coverage |

---

## D. Architectural debt register (fase 9)

### Critical — blokkeert groei of B2B

**D1 — Admin-grens (C1, C2)**

- **Locatie:** `src/lib/*/*-actions.ts`, `src/app/admin/**`, `src/app/api/admin/auth`.
- **Oorzaak:** de proxy-gate is de enige laag; één gedeeld wachtwoord.
- **Risico en impact:** schrijfrechten op geld, contracten en productdata; geen audittrail; een tweede admin is onmogelijk.
- **Oplossing:** `requireAdmin()` per ingang + TOTP + per-user-admin + audit-log.
- **Complexiteit:** S + M + M.
- **Afhankelijk van:** geen.
- **Prioriteit:** P0/P1.

**D2 — Schema niet reproduceerbaar (C5)**

- **Locatie:** `db/migrations/`, `supabase/migrations/`, prod.
- **Oorzaak:** DDL buiten de migraties vóór en na de baseline.
- **Risico en impact:** geen DR naar een nieuw project, geen staging, geen aparte B2B-instantie.
- **Oplossing:** schema-dump → idempotente migraties → reset-test → schema-check uitbreiden.
- **Complexiteit:** M.
- **Afhankelijk van:** toegang tot het prod-schema.
- **Prioriteit:** P0.

**D3 — AVG-handhaving (C3)**

- **Locatie:** `domain_events`, `accounts`, `VERWERKINGSREGISTER.md`.
- **Oorzaak:** het register is geschreven naar de bedoeling, niet naar de code.
- **Risico en impact:** juridisch; due diligence.
- **Oplossing:** N6.
- **Complexiteit:** M.
- **Afhankelijk van:** besluit over de bewaartermijn.
- **Prioriteit:** P0.

### High — wordt binnenkort duur

**D4 — Deploy-pad en infra (C4)**

- **Locatie:** `deploy.sh`, `deploy.yml`, VPS.
- **Oorzaak:** organisch gegroeid; mobiel-deploy-experiment half af.
- **Risico en impact:** deploy zonder schema-gate; downtime; root.
- **Oplossing:** N4 + X4.
- **Complexiteit:** S + M–L.
- **Prioriteit:** P0/P1.

**D5 — Orkestratie in route handlers**

- **Locatie:** `api/intake/session` e.a.
- **Oorzaak:** er kwam een feature per route bij.
- **Risico en impact:** niet herbruikbaar voor embed/API/LLM; geen atomiciteit.
- **Oplossing:** X9.
- **Complexiteit:** M.
- **Prioriteit:** P2 (P1 zodra een tweede ingang nodig is).

**D6 — Domeinvocabulaire gedupliceerd**

- **Locatie:** ≥7 kopieën, ±47 bestanden.
- **Oorzaak:** domeinen kwamen er één voor één bij.
- **Risico en impact:** elke snoeibeurt en elke tenantconfiguratie per domein raakt tientallen bestanden.
- **Oplossing:** X8.
- **Complexiteit:** M.
- **Prioriteit:** P2.

**D7 — Observability**

- **Locatie:** `sentry-config.ts`, geen health-endpoint.
- **Risico en impact:** uitval en fouten blijven onzichtbaar.
- **Oplossing:** N10 + X10.
- **Complexiteit:** S–M.
- **Prioriteit:** P1.

**D8 — Documentatie-drift (R3)**

- **Locatie:** `ARCHITECTURE.md`, `SECURITY.md`, `README.md`, `OPENSTAAND.md`, `SPEC_CLICK_TOKEN_TRACKING.md`.
- **Risico en impact:** agents handelen naar verouderde regels.
- **Oplossing:** één keer gelijktrekken + een "laatst geverifieerd"-regel.
- **Complexiteit:** S.
- **Prioriteit:** P1.

### Medium

| # | Schuld | Locatie | Oplossing | Complexiteit | Prio |
|---|---|---|---|---|---|
| D9 | Platte `src/lib` (329 bestanden) | `src/lib` | Incrementeel naar domeinmappen met `index.ts` | L (verspreid) | P2 |
| D10 | `Dashboard.tsx` 3.633 regels | `src/components/dashboard/` | Opknippen per tab wanneer je hem aanraakt | M | P2 |
| D11 | Herkomst per veld bij supplementen; geen audit-log op `sup_*` | `sup_*` | ADR-005 + X6 | M | P2 |
| D12 | Voedingsdata in de client-bundle | `src/data/nutrition` | S4/S5 bij trigger | L | P2 |
| D13 | Geen `session_version` | `account-session-cookie.ts` | X12 | S–M | P2 |
| D14 | CSP met `unsafe-inline`/`unsafe-eval` | `proxy.ts:80` | X11, later nonces | M | P2 |
| D15 | Twee productbronnen (TS-terugval + DB) | `page-products.ts` | Einddatum voor de terugval | S | P2 |
| D16 | Geen env-validatie | overal | X7 | S | P2 |
| D17 | Grootboek "append-only" maar met mutaties op `state` | `af-ledger.ts:103`, `payout-actions.ts:89` | Statusovergangen als events (pas als `af_*` ontdooit) | M | P3 |

### Low

| # | Schuld | Oplossing |
|---|---|---|
| D18 | `/admin/api`-uitzondering in de proxy | Weghalen |
| D19 | Filter-escaping in de PartnerDesk-zoekfunctie | Aparte `.ilike()`-calls |
| D20 | Twee `getClientIp`-implementaties (cron vs `client-ip.ts`) | Hergebruik |
| D21 | Legacy `db/`-map met psql-instructies | Als legacy markeren of opnemen in N5 |
| D22 | `dev.log` getrackt, README verouderd | Opruimen |
| D23 | Coverage-drempel op maar 2 bestanden | Uitbreiden naar alle engines |
| D24 | Connection-Profile-cluster in de bundel (stop-lijst) | Productbesluit: parkeren of verwijderen |

---

## E. Architecture Decision Records — voorstellen (fase 10)

Status van alle ADR's: **Voorstel — niet besloten.** Na een besluit per ADR: status, datum en wat is afgewezen bijwerken (CLAUDE.md-regel).

### ADR-001 — Data-toegang en autorisatie

- **Context:** één service-role-client; RLS wordt altijd omzeild; autorisatie is 100% app-code; 80 actions zonder eigen check.
- **Besluit (voorstel):** service-role blijft. Elke ingang (route, action, pagina met data) **authenticeert zelf** via `requireAccount()`/`requireAdmin()`/`requireCron()`/`requirePartner()`. Data-functies nemen een principal (account-id, admin-id, org-id) als parameter en halen die nooit uit een request-body. Een test controleert per `"use server"`-bestand en per route of er een guard is.
- **Alternatieven:** Supabase Auth + RLS (zie ADR-002); RLS met een eigen JWT per request.
- **Waarom:** kleinste stap die de defense-in-depth-gap dicht zonder de auth-laag te herbouwen.
- **Gevolgen:** iets boilerplate per ingang; review wordt eenvoudiger.
- **Migratie:** eerst admin-actions (N1), dan de routes die nog geen guard hebben.

### ADR-002 — Authenticatie

- **Context:** eigen HMAC-cookies voor sessie, account en admin; geen Supabase Auth.
- **Besluit (voorstel):** blijven. Toevoegen: `session_version` (accounts), TOTP + per-user-identiteit (admin). Supabase Auth alleen bij SSO-eis.
- **Alternatieven:** Supabase Auth nu (afgewezen: herbouw van de riskantste laag voor nul klanten); Cloudflare Access (geblokkeerd door DNS-only).
- **Gevolgen:** je beheert crypto-details zelf; bestaande tests dekken dit.
- **Migratie:** N8 → X6 → X12.

### ADR-003 — Scheiding van businesslogica

- **Context:** engines zijn puur en geversioneerd; orkestratie zit in routes.
- **Besluit (voorstel):**
  1. Rekenlogica = pure functies in `src/lib`, met een versieconstante; de versie wordt opgeslagen bij elke persistente uitkomst, samen met een inputs-hash waar zinvol.
  2. Schrijfstromen met meer dan één write = application service; atomair via RPC waar dat telt.
  3. Route handlers zijn dun: parse → guard → service → response.
  4. Golden files per engine-versie.
- **Alternatieven:** alles in routes laten (afgewezen: niet herbruikbaar); volledige hexagonale architectuur (afgewezen: over-engineering).
- **Migratie:** X9, X13; nieuwe code volgt direct.

### ADR-004 — Kennis in code versus data in de DB

- **Context:** claims, RI, scoremodel, content en voeding staan in TS; operationele data in de DB.
- **Besluit (voorstel):** gecureerde, laag-volume, code-gekoppelde kennis blijft in TS; git is de audittrail. Naar de DB gaat het bij één van vier triggers: > 2k rijen, redactie door niet-ontwikkelaars, externe imports, of data per tenant.
- **Gevolgen:** wijzigingen vereisen een deploy (acceptabel); de client-bundle groeit mee (bewaken).
- **Migratie:** producten zijn al over (`sup_*`); voeding bij S4.

### ADR-005 — Herkomst en licenties van externe data

- **Context:** een uitstekend herkomstmodel in `food-sources.ts`; niets generieks in de DB; licenties verschillen per bron.
- **Besluit (voorstel):** `data_sources` (uitgever, dataset, licentie, editie, url) + `import_runs` (bron, tijdstip, aantallen, checksum, status, uitvoerder) + per waarde `source_id`, `source_ref`, `import_run_id`, `transformation`, `verified_by/at` en `override_reason`. Geciteerde en afgeleide waarden altijd gescheiden. ODbL-data nooit in de kern-DB zonder licentiebesluit.
- **Alternatieven:** herkomst als vrije tekst (afgewezen: niet auditbaar).
- **Migratie:** eerst supplement-etiketwaarden (audit-log + bron per active), bij S4 voeding 1-op-1 vanuit het TS-model.

### ADR-006 — Schemabeheer

- **Context:** tabellen buiten de migraties; handmatige SQL Editor; historie remote leeg.
- **Besluit (voorstel):** `supabase/migrations/` is de **enige** bron; geen DDL buiten een migratie. `check:db-schema` controleert **alle** tabellen die de code gebruikt, gegenereerd uit een grep op `.from("…")`. Een verse `db reset` moet slagen (lokaal of in CI).
- **Migratie:** N5.

### ADR-007 — Deploy en release

- **Context:** drie tegenstrijdige beschrijvingen; `deploy.yml` faalt stil; build op prod; geen branch protection.
- **Besluit (voorstel):**
  - **Optie A (aanbevolen nu):** alleen `deploy.sh`, handmatig door Dennis; `deploy.yml` verwijderen; branch protection met required checks.
  - **Optie B (later, X4):** een GitHub-workflow bouwt een artifact; de server draait alleen dat artifact, na de schema-gate, met een health-check en rollback.
- **Waarom A nu:** past bij CLAUDE.md ("deploy is een bewuste stap van Dennis") en kost 1 uur.
- **Migratie:** N4 → X4.

### ADR-008 — Rendering en caching

- **Context:** statisch + on-demand ISR voor content; dynamisch voor persoonlijke pagina's; geen data-cache.
- **Besluit (voorstel):** zo houden. Een data-cache (`"use cache"`/tags) pas bij een gemeten behoefte. Bij meer dan één instantie: een gedeelde cache-handler is verplicht.
- **Gevolgen:** eenvoud nu; bekende stap later.

### ADR-009 — Achtergrondtaken

- **Context:** HTTP-crons + `cron_runs` + outbox in `domain_events`.
- **Besluit (voorstel):** zo houden. Een Postgres-queue pas bij achterstand. n8n alleen als consument, nooit in het pad van een gebruikersactie (verdict C4).

### ADR-010 — Event-log en retentie

- **Context:** `domain_events` is outbox + analyse + half-audit, met e-mail, zonder retentie.
- **Besluit (voorstel):** `domain_events` is **geen audit-log**. Geen directe identificatoren behalve `session_id`/`account_id`; retentie 24 maanden; scrub bij verwijderen. Een audit-log voor admin-mutaties komt in een aparte tabel (`admin_audit_log`, onveranderbaar).
- **Migratie:** N6 + X6.

### ADR-011 — Multitenancy (bevestiging van het verdict van 30 aug)

- **Besluit (voorstel):** mono-tenant met bewaakte naad. Admin-domeinen zonder `org_id`. Point of no return = tweede actieve rij in `organizations`. Open beslispunt: `accounts.email` uniek per organisatie of globaal.

### ADR-012 — Domeinregister

- **Context:** ≥7 kopieën van domeinlijsten; twee `PillarId`'s.
- **Besluit (voorstel):** één module (`src/lib/domains.ts`) is de bron voor id's, NL-labels, scorekeys en zichtbaarheid; alle andere lijsten zijn afgeleiden.
- **Migratie:** X8, incrementeel.

---

## F. Technical due diligence (fase 17)

| Vraag van een partner of investeerder | Antwoord op basis van de code |
|---|---|
| **Hoe betrouwbaar is de data?** | Voeding: per waarde bron, editie en `verified` (~104 geciteerde waarden, het merendeel als `verified` gemarkeerd), geciteerd en afgeleid gescheiden; indicatieve drempels expliciet als "vuistregels" gemarkeerd. Supplementen: handmatig ingevoerd, bron per product, geen wijzigingslog. **Sterk ontwerp, beperkte omvang, audittrail onvolledig.** |
| **Hoe schaalbaar is de database?** | Postgres met een redelijk indexbeleid; tot ~100k gebruikers geen structurele beperking. Wel eerst: stille afkap in admin en cron, FK-indexen, retentie op events (§5). |
| **Waar zit de businesslogica?** | In pure, geversioneerde modules in `src/lib` (intake-engine, 49 voedingsmodules, PS-Score); de server rekent zelf na. Orkestratie zit in route handlers. |
| **Hoe wordt data gevalideerd?** | Handgeschreven validators per route (97), check-constraints in de DB (117), Turnstile + honeypot op publieke formulieren. Geen schemabibliotheek. |
| **Hoe is provenance geregeld?** | Voor voeding goed in TS; voor supplementen per product; een generiek imports- of herkomstmodel in de DB ontbreekt (ADR-005). |
| **Hoe wordt gebruikersdata beschermd?** | EU-hosting, RLS deny-all + alleen service-role, anon ingetrokken, HMAC-cookies, rate limits, CSP/HSTS, DPIA en register. Zwak: admin-grens (C1/C2), gaten in AVG-handhaving (C3). |
| **Kan B2B worden toegevoegd?** | Technisch zonder rewrite. Juridisch smal: werkgever nee; zorgpraktijk alleen via een apart traject; supplementbedrijven als partner, niet als tenant. |
| **Is multi-tenancy mogelijk?** | Ja: `organization_id`, `orgScoped()`, drift-test en dode RLS-policies liggen klaar; geschat 2–3 weken bij tenant 2, plus admin-identiteit en juridisch werk. |
| **Hoe worden imports beheerd?** | Handmatig: een USDA-script, CSV-import met controle vooraf (#67), backfill-endpoints. Geen importregistratie. |
| **Hoe worden berekeningen getest?** | 3.364 tests; engines vrijwel allemaal met tests; 80%-coverage-drempel op de intake-engine; een firewall-test op de PS-Score. Geen golden files per versie, geen e2e. |
| **Hoe makkelijk is het team uit te breiden?** | Matig. Plus: strict TS, lint 0, 65 plandocumenten met besluiten. Min: platte `src/lib`, god-componenten, documentatie-drift, veel impliciete conventies (CLAUDE.md is lang). |
| **Waar zit de technical debt?** | Bijlage D; de kern is D1–D3. |
| **Single points of failure?** | Eén VPS; één persoon (bus factor 1); één admin-wachtwoord; één Supabase-project (restore getest); DNS-only zonder CDN/WAF. |
| **IP en eigendom?** | **Rode vlag: auteursrechtelijk beschermd boek in de repo (C6).** Afbeeldingen hebben een `ATTRIBUTION.md` (kennisbank); productafbeeldingen hebben een `source`-veld. NEVO-voorwaarden worden bewust gevolgd. |
| **Tractie?** | ~0 (nulmeting 2 sep). Dit is de vraag die het gesprek bepaalt — niet de architectuur. |

---

## G. Wat goed is — niet onnodig veranderen

1. **Pure, geversioneerde engines met opgeslagen versies** (`RULES_VERSION`, `ESTIMATE_VERSION`, `NUTRITION_SCORE_VERSION`, `PS_SCORE_MODEL_VERSION`) + server-side herberekening. Dit is het fundament van reproduceerbaarheid en je sterkste B2B-argument.
2. **De PS-Score-firewall** (`compute.ts` + `firewall.test.ts`): prijs en partnerdata kunnen de score aantoonbaar niet raken. Dit is het merk.
3. **Het herkomstmodel in `food-sources.ts`**: geciteerd vs afgeleid, editie, `verified`, waargenomen spreiding. Overzetten naar de DB wanneer nodig, niet herontwerpen.
4. **Toestemmingsmodel** (`consent_records` met type en versie, `has_active_consent`).
5. **Migratiediscipline** (`OPENSTAAND.md` + CI-check + schema-check in `deploy.sh`) — alleen de drift uit het verleden inhalen.
6. **Statisch + on-demand ISR** voor de SEO-pagina's, met terugval naar de TS-data als de DB faalt (`page-products.ts`: "degradeert in plaats van breekt").
7. **Mono-tenant-besluiten met een bewaakte naad** (drift-test, `orgScoped()`, admin-domeinen bewust zonder `org_id`).
8. **Security-hygiëne op de consumentenkant**: non-enumerating OTP, correcte IP-bepaling achter Nginx, anon volledig ingetrokken, security-headers.
9. **De AVG-documentatieset** en de vastgelegde restore-test.
10. **De gewoonte om besluiten vast te leggen** (`docs/plan/`, `docs/research/`), inclusief afgewezen opties.

---

## H. UNKNOWN — needs verification

| Onbekend | Waarom nodig | Welke conclusie onzeker blijft |
|---|---|---|
| Staat `SENTRY_DSN` in prod, en werkt client-Sentry? | Observability-beoordeling | C10 |
| Draait Redis/Upstash in prod? | Rate limits die een herstart overleven | §8, advies-aug P0 #4 |
| Is poort 3000 dichtgezet (alleen Nginx)? | Anders is `x-real-ip` te spoofen | IP-bepaling, rate limits |
| Draait de app als root (systemd-unit staat niet in de repo)? | Impact van een app-compromis | §8 infra |
| Geheugen en swap tijdens de build op de server | OOM-risico tijdens deploy | X4-prioriteit |
| Cron-schema en -frequentie (crontab staat niet in de repo) | Doorvoer van nurture/herinneringen | §5 scenario B |
| Bestaan en definitie van `remeasure_reminders`, `cron_runs`, `thema_nurture`, `thema_downloads` in prod | N5 | C5 |
| PostgREST `max_rows` in het Supabase-project | Afkap bij 1.000 | C8 |
| Wijst `.env.local` naar het productieproject? | Dev op prod-data = art. 9-verwerking op een laptop | §9 |
| Supabase-compute-tier en PITR | Schaal en herstel | §5 |
| Hetzner-snapshots aan? | DR van de VPS | R6 |
| fail2ban, SSH-keys-only, automatische updates | Hardening | §8 infra |
| Zijn de legacy JWT-keys uitgezet (post-incident)? | Oude anon-key | §8 |
| Bundle-grootte per route (`next build` niet gedraaid: dev-server-regel) | Performance dashboard | Bijlage C |
| SPF/DKIM/DMARC voor het maildomein | Afleverbaarheid bij schaal | §5 |
| Effectieve bouwuren per week | Timeline | §12 |
| Is er een concrete B2B-partij? | Of B2B-voorbereiding zin heeft | §12 |

---

## I. Methode en bewijs

- **Omvang:** `find src -name '*.ts*'` (1.602 bestanden, 244.140 regels); per map geteld; grootste bestanden via `wc -l`.
- **Routes en acties:** `find src/app -name page.tsx|route.ts`; `grep '^"use server"'` + exports geteld; auth- en rate-limitmatrix per route via grep.
- **Schema:** alle 82 migraties geparsed (tabellen, indexen, FK's, constraints, jsonb, policies); FK's zonder leidende index berekend; tabellen buiten de migraties via grep over `src/`, `db/` en `docs/`.
- **Tests:** `npx vitest run` → 344 bestanden, 3.364 tests, 3 falend in `article-body-images.test.ts` e.a. op deze werkboom (ongecommit blogwerk). CI op `main` is groen (`gh run list`).
- **Tooling:** `gh run list --workflow=deploy.yml` (failure: SSH-key ontbreekt); `gh api …/branches/main/protection` (niet beschermd); `npm audit --omit=dev` (2 high).
- **Next.js-docs** in `node_modules/next/dist/docs/`: `data-security.md` (server actions), `authentication.md` (proxy = optimistische check), `json-ld.md` (escaping).
- **Niet gedaan:** `next build` (CLAUDE.md: niet naast een draaiende dev-server); server, Supabase-dashboard en `.env*` niet ingezien; geen code gewijzigd.
- **Bronnen in de repo die dit document aanvult (niet vervangt):** `docs/research/VERDICT_MULTITENANT_VOLGORDE_EU_2026-08-30.md`, `docs/plan/ADVIES_BEVEILIGING_AUTH_HOSTING_2026-08.md`, `docs/plan/ANALYSE_PRODUCTPLATFORM_SUPPLEMENTEN.md`, `docs/plan/BESLUIT_VOEDINGSFOCUS_DASHBOARD_2026-09.md`, `docs/plan/BESLUITDOCUMENT_SESSIE_ARCHITECTUUR_2026-09.md`, `docs/core/VERWERKINGSREGISTER.md`, `docs/core/DPIA.md`.
