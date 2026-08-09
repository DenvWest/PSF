# Back-up-restoretest — PerfectSupplement.nl

**Versie 1.0 — 9 augustus 2026**
**Intern document** — procedure + logboek voor de kwartaal-restoretest
**Verwerkingsverantwoordelijke:** Dennis van Westbroek · KVK 74667653 · info@perfectsupplement.nl

> Bewijsstuk voor AVG art. 32 lid 1 sub d ("een procedure voor het op gezette tijdstippen testen, beoordelen en evalueren van... maatregelen"). Beloofd in `docs/plan/COMPLIANCE_AUDIT_AFFILIATE_PLATFORM.md` (stap 14 · R6 · stap 16) als kwartaal-restore-test — tot nu toe zonder uitvoeringsbewijs in de repo (zie `docs/plan/ADVIES_BEVEILIGING_AUTH_HOSTING_2026-08.md` §D.3/F.3). Dit document is de praktische one-pager, in dezelfde stijl als `Datalekprocedure_PerfectSupplement_nl.md`.

---

## Wanneer

Elk kwartaal (± 3 maanden). Log elke uitvoering onderaan, ook een gefaalde — een gefaalde test die je herstelt levert sterker bewijs op dan geen test.

## Waarom niet zomaar tegen productie testen

Een Point-in-Time Recovery-restore in Supabase werkt doorgaans **in-place** op het gekoppelde project en overschrijft daarmee productiedata. Test daarom nooit rechtstreeks tegen het live project.

## Stap 0 — plan checken (afgerond 9 aug 2026)

Geverifieerd: het productieproject stond op **Free plan** — dat plan heeft **geen enkele beheerde back-up** (bevestigd via Supabase-pricingpagina: "Daily backups" verschijnt pas vanaf Pro). Fix: upgrade naar Pro (dagelijkse back-ups, 7 dgn retentie — geen PITR, dat is een losse add-on). Zodra Pro actief is en de eerste nachtelijke back-up gedraaid heeft, is Route B in principe een optie voor dagelijkse-back-up-restore (géén PITR/point-in-time zonder de add-on). Route A werkt sowieso, ongeacht plan, en test bovendien je eigen herstelpad los van wat Supabase aanbiedt.

## Route A — dump & restore naar tijdelijk project (aanbevolen, werkt op elk plan, 100% read-only op productie)

**1. Dump maken van productie.** Settings → Database → Connection string → kies **URI**, **directe verbinding** (poort 5432, niet de pooler op 6543 — die geeft problemen met `pg_dump`). Lokaal (niet op de VPS nodig):

```bash
pg_dump "postgresql://postgres:[WACHTWOORD]@[PROJECT-REF].supabase.co:5432/postgres" \
  --schema=public -F c -f psf_restoretest_$(date +%Y%m%d).dump
```

`--schema=public`: de `auth`/`storage`/`realtime`-schema's beheert Supabase zelf en worden in een nieuw project automatisch al aangemaakt — die wil je niet overschrijven. `pg_dump` **leest alleen** — nul risico voor productie. Zet het wachtwoord niet los in je shell-historie (bijv. via een env-var of `~/.pgpass`).

**2. Tijdelijk project aanmaken.** Dashboard → **New project** → zelfde organisatie → regio **Frankfurt (eu-central-1)**, zodat de doorgifte-afspraak uit DPIA §1.6 klopt. Noem het herkenbaar, bijv. `psf-restoretest-2026-08`.

**3. Terugzetten.** Connection string van het **nieuwe** project ophalen (zelfde plek), dan:

```bash
pg_restore -d "postgresql://postgres:[NIEUW-WACHTWOORD]@[NIEUW-PROJECT-REF].supabase.co:5432/postgres" \
  --no-owner --no-privileges psf_restoretest_20260809.dump
```

`--no-owner --no-privileges`: voorkomt irrelevante foutmeldingen doordat rolnamen tussen projecten verschillen.

**4. Verifiëren** — zie checklist hieronder, in het tijdelijke project (Table Editor + SQL Editor).

**5. Opruimen.** Tijdelijk project verwijderen: Settings → General → Delete project, zodra je het resultaat gelogd hebt.

## Route B — Supabase PITR (alleen als stap 0 bevestigt dat je plan dit heeft)

1. Dashboard → **Database → Backups** → kies een punt in de tijd.
2. Let op: op sommige plannen restoort dit **in-place** op het bestaande project — bevestig in de UI-waarschuwing expliciet of het een nieuw/apart doel is vóór je op Restore klikt. Twijfel je, gebruik Route A of C.
3. Doorloop de verificatiestappen hieronder.

⚖️ Beschikbaarheid en exact gedrag van deze knop verschillen per plan en veranderen soms in de Supabase-UI — vertrouw hiervoor de live dashboard-tekst, niet dit document.

## Route C — "Restore to new project" (BETA, native, aanbevolen — bevestigd werkend 9 aug 2026)

Op Pro-projecten toont **Database → Backups** een derde tab: **Restore to new project (BETA)**. Dit is de eenvoudigste route: geen `pg_dump`/CLI nodig, en het test het échte Supabase-herstelmechanisme in plaats van je eigen export.

1. Database → Backups → tab **Restore to new project (BETA)**.
2. Kies een back-uppunt, doorloop de wizard — dit zet een gloednieuw, apart project neer; productie blijft onaangeroerd.
3. Wachten tot het nieuwe project klaar is.
4. Verifiëren (checklist hieronder), dan tijdelijk project verwijderen.

Dit is nu de **standaardroute** zolang Pro actief is; Route A blijft de terugval als de BETA-feature ooit wegvalt of faalt.

## Verificatiestappen (na herstel, ongeacht route)

- [ ] Project/branch is bereikbaar en de database start op
- [ ] `intake_sessions` bevat rijen met een timestamp vóór het herstelpunt
- [ ] Steekproef: 1 sessie openen — `answers`/`domain_scores` zijn leesbaar, niet corrupt of leeg
- [ ] RLS-policies zijn nog actief (`select * from pg_policies` of dashboard-check) — een restore die RLS "vergeet" is een stille kwetsbaarheid
- [ ] Rijentelling van de herstelde data ligt in dezelfde orde van grootte als de bron (geen stil dataverlies)
- [ ] Hersteltijd gemeten: start tot verifieerbaar (bepaalt je werkelijke RTO)
- [ ] Tijdelijk project/branch weer verwijderd

## Logboek (bewaren — dit is je art. 32-bewijs)

| Datum | Uitgevoerd door | Route | Bronmoment back-up | Resultaat | Hersteltijd | Bijzonderheden |
|---|---|---|---|---|---|---|
| 2026-08-09 | Dennis van Westbroek | C — Restore to new project (BETA) | Meest recente scheduled backup (09 aug 2026) | **Geslaagd** | Niet genoteerd | Eerste restore-test ooit. Data + herstelmechanisme bevestigd werkend op het nieuwe Pro-plan |

Bij een gefaalde test: noteer de oorzaak, herhaal binnen 2 weken, en beoordeel of het back-upbeleid (retentie, plan) aanpassing nodig heeft.

## Gekoppelde documenten

- [`docs/core/DPIA.md`](../core/DPIA.md) §5 — restrisico-conclusie verwijst naar back-upbeleid
- [`docs/plan/COMPLIANCE_AUDIT_AFFILIATE_PLATFORM.md`](../plan/COMPLIANCE_AUDIT_AFFILIATE_PLATFORM.md) stap 14 (Back-upbeleid) · R6 · stap 16 — herkomst van de kwartaal-belofte
- [`docs/plan/ADVIES_BEVEILIGING_AUTH_HOSTING_2026-08.md`](../plan/ADVIES_BEVEILIGING_AUTH_HOSTING_2026-08.md) §D.3, P0-3 — aanleiding voor dit document

---

*Dit document intern houden. Niet publiceren op de website.*
