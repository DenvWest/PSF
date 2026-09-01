# Onderzoeksprompt — Van mono-tenant naar meerdere tenants, en wat als eerste af moet

**Model:** Claude Opus 5 (`claude-opus-5`), effort `xhigh`, met websearch aan.
**Repo:** `/home/dennisvanwestbroek/psf` (branch `main`).
**Datum:** 30 augustus 2026.
**Type:** onderzoek + verdict. Geen code, geen commits.

---

## 0. Wie je bent en wat ik van je wil

Je bent de architect + strateeg die dit project overneemt en die de vraag krijgt: *"waar gaat dit stuk, en wat moet ik als eerste doen?"* Ik ben een solo-bouwer met beperkte tijd en nul verkeer. Ik heb geen behoefte aan een inventarisatie — die kan ik zelf maken. Ik heb behoefte aan **uitspraken die ik kan volgen of kan weerleggen.**

Drie regels voor je antwoord:

1. **Eén aanbeveling per vraag, met onderbouwing.** Geen vijf opties zonder mening. Als je twijfelt, geef je voorkeur mét de conditie waaronder je van mening verandert.
2. **Elke bewering over de code is falsifieerbaar.** Noem `bestand:regel` of de migratienaam. Als je iets niet hebt gecontroleerd, schrijf je "niet geverifieerd".
3. **Onderscheid drie soorten uitspraken** en label ze: `[FEIT]` (uit de repo of uit wet/bron), `[OORDEEL]` (jouw analyse), `[AANNAME]` (wat je niet kon controleren).

Antwoord in het Nederlands. Termen en code in het Engels.

---

## 1. Vaste feiten — ik heb dit al voor je geverifieerd

Verspil geen turns aan het opnieuw ontdekken hiervan. Controleer alleen wat je nodig hebt om verder te komen.

### Wat het product nu is
- Next.js 16 App Router, TypeScript strict, Supabase (Postgres + RLS), Hetzner VPS + systemd, Resend.
- Consumentensite `perfectsupplement.nl`: vergelijkingspagina's `/beste/*` met affiliate-links (= de enige omzet vandaag), supplementgidsen `/supplementen/*`, blog, kennisbank.
- **Leefstijlcheck** op `/intake`: 15 vragen, 5 fases, scoring-engine over 6–7 domeinen → urgentieniveau + profiellabel + "Herstelplan". `RULES_VERSION` 1.4.0.
- Account + dashboard (cockpit-shell), nurture-mailsequence, kompas/ladders/schap/agenda — grotendeels achter login.
- **Geen enkele LLM-call in `src/`.** Geverifieerd: geen `anthropic`, `openai`, `claude-*` of `gpt-*` in de codebase. De "evidence chat" is RAG over eigen `evidence_*`-tabellen, geen generatief model.

### Wat er al aan multi-tenant staat (verrassend veel, en dat is het probleem)
- `organizations`-tabel: `id, name, slug, created_at, settings jsonb`. Eén rij: `00000000-0000-0000-0000-000000000001`.
- **~25 consumenten-tabellen dragen `organization_id`**, meestal als `not null default '000…001'` — o.a. `intake_sessions`, `agenda_blocks`, `daily_action_log`, `domain_events`, `accounts`, `domain_goal`, `cprofile_*`, `supplement_verdicts`, `movement_session_log`, `account_priority_pref`.
- [`src/lib/org-resolver.ts`](src/lib/org-resolver.ts) resolvet een subdomein → `orgId` via de DB, met 5-minuten-cache. **Bij elke fout valt hij terug op `DEFAULT_ORG_ID`.**
- [`src/config/org.ts`](src/config/org.ts) houdt daarnaast een **in-code `orgRegistry`** met `theme`, `scoring`, `supplements`, `affiliatePrefix`, `emailFrom*`. Twee bronnen van waarheid naast elkaar.
- [`src/lib/api-middleware.ts`](src/lib/api-middleware.ts) en [`src/config/theme.ts`](src/config/theme.ts) dragen allebei bovenaan: `// EXPERIMENTAL: scaffold for future multi-tenant work. Not used by production pages.`
- `/api/partner/intake` bestaat, is geauthenticeerd via `PARTNER_API_KEYS` (één komma-gescheiden env-string `key:orgId,key:orgId`), rekent scores uit en **schrijft niets weg**. `/api/partner/analytics` idem-achtig.
- `getVisibleTiers(orgId)` leest `organizations.settings.maxTier` — de enige echte per-tenant gedragsknop die live is.

### Waar de multi-tenant-laag stukloopt — geverifieerd
- **Alles draait via `createSupabaseAdmin()` (service-role). Service-role omzeilt RLS.** Er zijn geen anon-policies meer (`20260815130000_drop_anon_policies.sql`). Tenant-isolatie hangt dus **volledig** aan de vraag of de app-code een `.eq("organization_id", …)` niet vergeet. Er is geen mechanisme dat dat afdwingt.
- **Deze tabellen hebben géén `organization_id`:**
  - alle 17 `pd_*` (PartnerDesk) — `20260712120000_partnerdesk_fase1.sql`
  - alle 11 `af_*` (eigen affiliate-programma, incl. `af_clicks`) — `20260714120000_*`
  - `account_entitlements` (= wie premium heeft), `premium_waitlist`, `guide_opt_ins`, `recovery_tokens`, `account_favorites` (18 aug)
- `pd_*` en `af_*` hebben wél `enable row level security` (17 resp. 10 keer) maar **nul policies** → deny-all, uitsluitend service-role.
- De drift loopt door: `account_favorites` is van 18 augustus 2026 en kreeg de kolom niet. Nieuwe tabellen krijgen `organization_id` niet meer standaard.
- Alle content (`src/data/supplements/`, `src/data/supplement-guides/`, blog, kennisbank) is **file-based en per-deploy**, niet per-tenant.

### Waar het werk nu heen gaat (en waar de spanning zit)
- **15 augustus 2026, vastgelegd verdict:** "focus op de vergelijking" — `one thing` = `/beste/*` + gepubliceerde scoremethodiek; dashboard, agenda, verbinding en `af_*` op de **stop-lijst**.
- **22–29 augustus, feitelijke commits:** kompas-zijbalk, schap/nutriëntvak, cyclus-reflectiebord, voortgang-doorstroom, supplementen-hub met zoekbalk, bibliotheek-chassis, intake-resultaten-doorstroom.
- Dat is een contradictie tussen wat er is besloten en wat er is gebouwd. Ik wil dat je die benoemt en oplost, niet gladstrijkt.
- Context: **er is nagenoeg geen verkeer.** Meetlussen (`domain_events`, PostHog, GA4, Clarity) staan wel klaar, maar leveren nog geen signaal.

### Relevante docs (lees selectief, niet alles — het is >1MB)
`docs/core/COMPLIANCE.md` · `docs/core/DPIA.md` · `docs/core/VERWERKINGSREGISTER.md` · `docs/core/ARCHITECTURE.md` · `docs/core/DOMAIN_MODEL.md` · `docs/plan/COMPLIANCE_AUDIT_AFFILIATE_PLATFORM.md` · `docs/plan/ARCHITECTUUR_AFFILIATE_AUTOMATISERING.md` · `docs/plan/PLAN_LEEFSTIJLCHECK_UITVOERING.md` · `docs/research/LEEFSTIJLCHECK_EXPERT_REVIEW.md` · `docs/plan/ADVIES_BEVEILIGING_AUTH_HOSTING_2026-08.md`. `docs/PROJECT_STATE.md` is van 4 juni en verouderd — negeer.

---

## 2. DEEL A — Van mono-tenant naar meerdere tenants

De kernvraag is niet "hoe bouw ik multi-tenancy". De kernvraag is **wat een tenant hier eigenlijk is, en wat er dan overblijft dat herbruikbaar is.**

### A1. Wat is de tenant-eenheid? (beantwoord dit eerst — de rest hangt eraan)
Er zijn minstens vier kandidaten en ze leiden tot compleet verschillende architecturen:
- **(a) Merk / white-label site** — iemand anders draait "zijn" supplementensite op mijn engine, eigen domein, eigen content, eigen affiliate-inkomsten.
- **(b) Zakelijke afnemer / werkgever** — een bedrijf koopt de check voor zijn medewerkers en wil groepsrapportage.
- **(c) Professional** — fysio, diëtist, personal trainer stuurt cliënten door en ziet hun uitkomsten.
- **(d) Interne scheiding** — `af_*` en `pd_*` zijn geen tenants maar administratieve domeinen van mij, en multi-tenancy gaat alleen over de consumentenkant.

Geef één aanbeveling. Wat me daarbij interesseert: **welke van deze vier vraagt het minste nieuwe bouwwerk gegeven wat er al staat**, en welke wordt fataal duur. Weeg mee: (b) en (c) betekenen dat ik gezondheidsgegevens van een ander verwerk in opdracht — zie Deel C, en laat dat oordeel doorwerken in je aanbeveling hier.

### A2. Het isolatie-gat
Service-role omzeilt RLS; er is geen enkel vangnet tegen een vergeten tenant-filter. Beantwoord:
- Is dit vandaag al een echt lek, of pas bij tenant nummer 2? Onderbouw met de code.
- Wat is het **goedkoopste mechanisme dat een vergeten filter onmogelijk maakt** in deze codebase? Weeg minstens: (i) een verplichte repository/query-wrapper waar `createSupabaseAdmin()` achter verdwijnt, (ii) echte RLS met een per-request tenant-claim (`set local`, of een aparte niet-service-role connectie), (iii) een ESLint-regel of typetruc die kale `.from()`-calls verbiedt. Kies er één en zeg waarom de andere twee afvallen.
- `resolveOrgIdFromSubdomain` valt bij een DB-fout stil terug op `DEFAULT_ORG_ID` en cachet dat 5 minuten. Is fail-open hier acceptabel of moet dit fail-closed? Wat breekt er als je het omdraait?
- `PARTNER_API_KEYS` als env-string: waar loopt dat stuk (rotatie, intrekken, per-tenant scoping) en wat is het minimale alternatief?

### A3. De 28 tabellen zonder `organization_id`
- Welke van `pd_*` / `af_*` / `account_entitlements` / `account_favorites` / `premium_waitlist` / `guide_opt_ins` / `recovery_tokens` moeten de kolom **echt** krijgen, en welke horen bewust mono te blijven? Onderbouw per groep, niet in bulk.
- `account_entitlements` bepaalt wie premium heeft. Wat gebeurt er met entitlements zodra tenant 2 bestaat?
- Wat is de goede volgorde: eerst de kolom + backfill overal, of eerst de isolatie-laag uit A2 en pas kolommen waar nodig? Geef één volgorde.
- Hoe voorkom ik dat de drift doorgaat (tabel 62 die de kolom weer vergeet)? Noem een mechanisme, geen goed voornemen.

### A4. Wat is écht herbruikbaar — en wat niet
Dit is de "lukt het om overlap te maken"-vraag. Ik wil een **eerlijke scheidslijn**, geen optimistische. Deel de codebase in vier bakken en noem per bak concrete paden:
1. **Al domein-agnostisch en direct herbruikbaar** (kandidaten: `intake-engine`, scoring, `domain_events`, nurture, consent-laag, rate-limit).
2. **Herbruikbaar na een afgebakende ingreep** — noem per stuk wat de ingreep is en schat de omvang.
3. **Hard PerfectSupplement-specifiek** en niet zinnig te generaliseren (affiliate-links, EFSA-claim-logica, `/beste/*`, supplement-catalogus, PS-Score).
4. **Dood of dormant** — bestaat wel, draagt niets, kan weg. Wees hier concreet en hard: welke bestanden zou je schrappen?

Behandel daarbij expliciet de **content-vraag**: alle content zit in `src/data/*` en is per-deploy. Kan een tweede tenant überhaupt eigen content hebben zonder dat dat een CMS wordt? Wat is het goedkoopste antwoord dat niet over vijf jaar spijt oplevert?

En één harde: **is de `theme`/`orgRegistry`-scaffold uit `src/config/` de goede fundering, of is het een verkeerde abstractie die ik beter kan weggooien voordat ik erop bouw?** Beide antwoorden zijn toegestaan; kies er één.

### A5. De timingvraag
Bouw ik multi-tenancy **nu** (duur, geen klant, mogelijk verkeerd geraden), of **pas bij klant 1** (dan is de refactor groter)? Geef een antwoord in de vorm van:
- wat ik **nu** moet doen zodat de latere stap niet onbetaalbaar wordt (het minimale "houd de deur open"-werk),
- wat ik **niet** nu moet doen,
- en het **concrete signaal** waarop ik omschakel ("point of no return").

---

## 3. DEEL B — In welke volgorde nu aan de gang

### B1. Los de contradictie op
Op 15 augustus is vastgelegd: focus op `/beste/*` + scoremethodiek, dashboard/agenda/`af_*` op de stop-lijst. Daarna is er twee weken aan kompas, schap, cyclus en supplementen-hub gebouwd. Zeg welke van de twee wint en waarom. Als het verdict van 15 augustus achterhaald is, zeg dat dan expliciet en zeg wat het vervangt.

### B2. De volgorde zelf
Ik wil een genummerde volgorde van **maximaal 7 stappen**, en per stap:
- wat het is, in één zin;
- **waarom het vóór de volgende komt** — dit is het belangrijkste veld, niet de beschrijving;
- de grofste tijdschatting die nog eerlijk is (dagen, niet uren);
- het **afbreekcriterium**: waaraan zie ik dat deze stap klaar is, of dat hij niet werkt en ik moet stoppen.

Randvoorwaarden waar je volgorde doorheen moet:
- **Er is geen verkeer.** Elke stap die "we meten het wel" als rechtvaardiging heeft, is verdacht. Welke volgorde overleeft bij nul gebruikers?
- **De enige omzet vandaag zijn affiliate-links op `/beste/*`.** Wat mag daar in geen geval door geraakt worden?
- Er staat veel half af (kompas, schap, ladders, agenda, PartnerDesk fase 1, `af_*` fase 3A). **Afmaken of afschrijven is ook een stap** — behandel dat als een echte optie, geen restpost.

### B3. De stop-lijst
Noem expliciet wat er **niet** gebouwd wordt de komende periode, inclusief dingen waar al werk in zit. Voor elk: waarom het wacht, en wat het zou moeten kosten om het weer op te pakken. Dit deel mag pijn doen.

### B4. De één-ding-vraag
Als ik maar één ding mag doen in september 2026: wat is het? Eén alinea, geen slag om de arm.

---

## 4. DEEL C — Bijlage: de vragenlijst-check als product-dienst

Dit gaat over de kanteling van *"gratis check op mijn eigen site"* naar *"check als dienst die ik aan een ander lever"*. Vier onderwerpen, en ze hangen samen.

### C1. EU-wet — wanneer kantelt de check naar medisch hulpmiddel?
De check produceert vandaag `urgency_level`, `profile_label` en een "Herstelplan" per persoon. `docs/core/COMPLIANCE.md` §"Geen klinische vorm (MDR-grens)" beroept zich op Verordening (EU) 2017/745 en MDCG 2019-11 rev. 1 en concludeert: leefstijl/welzijn, dus geen hulpmiddel.

Toets die conclusie opnieuw, **specifiek voor het scenario waarin de check als dienst aan een derde wordt verkocht**:
- Verschuift het *beoogde doel* (de MDR-toets) als de afnemer een werkgever, verzekeraar of zorgprofessional is, ook als de vragenlijst zelf niet verandert?
- Waar ligt de grens bij Regel 11 van Bijlage VIII? Welke concrete elementen van de huidige output (urgentie-escalatie, doorverwijzing, "signalering") schuiven het richting klasse IIa?
- Zijn er in 2025–2026 nieuwe MDCG-guidance, jurisprudentie of EU-wijzigingen die dit oordeel raken? **Zoek dit op** — vertrouw hier niet op je geheugen.
- Geef een **concrete lijst van ontwerpkeuzes die de check aan de veilige kant houden** (welke woorden, welke output-vormen, welke doorverwijzingen wel en niet).

### C2. EU-wet — mag ik dit überhaupt aan een werkgever leveren?
Dit is wat mij betreft de kritische vraag, want als het antwoord nee is, valt tenant-optie (b) uit A1 om.
- Nederlands recht: mag een werkgever gezondheidsgegevens van werknemers laten verzamelen? Betrek Arbowet, de rol van de bedrijfsarts, en het standpunt van de Autoriteit Persoonsgegevens.
- Is toestemming van een werknemer geldig gegeven de gezagsverhouding (AVG art. 4 lid 11 + art. 9)? Zo nee, welke grondslag blijft over?
- Verandert het antwoord als de werkgever **alleen geaggregeerde** uitkomsten ziet? Vanaf welke groepsgrootte, en op basis van welke bron?
- Wat is mijn rol: verwerker of verwerkingsverantwoordelijke? Wat volgt daaruit aan verplichtingen (verwerkersovereenkomst, DPIA, bewaartermijnen)?
- **Geef een verdict: is een B2B-werkgeversvariant realistisch voor een solo-bouwer, of moet ik dat pad nu afsluiten?**

### C3. Evidence als contractueel artefact
Zolang de check gratis op mijn eigen site staat, is de onderbouwing redactioneel. Zodra ik hem verkoop, wordt het iets wat ik moet kunnen aantonen.
- Wat moet ik kunnen overleggen over de **onderbouwing van de scoring** (`RULES_VERSION` 1.4.0, de `evidence_*`-tabellen, de item-baseline)? Is versionering van de regels genoeg, of hoort daar validatie bij?
- Er ligt een evidence-audit met verdict "NUANCEER" en openstaande P0-copy-fixes. Wat daarvan is **blokkerend** voor een betaalde variant en wat kan wachten?
- Hoe verhoudt dit zich tot Verordening 1924/2006 (gezondheidsclaims) zodra een **derde partij** mijn engine onder eigen merk draait — wie is dan aansprakelijk voor de claims in de uitkomst?

### C4. n8n — lijm of tenant-integratielaag?
- `src/lib/n8n-webhook.ts` stuurt `domain_events` naar een webhook. **De payload bevat een `email`-veld.** Wat betekent dat voor het verwerkingsregister, de verwerkersovereenkomst en de vraag zelf-gehost vs. n8n cloud (en in welke regio)? Controleer of dit in `docs/core/VERWERKINGSREGISTER.md` en de DPIA staat.
- De affiliate-architectuur noemt n8n "optioneel en uitgesteld". Klopt dat nog als er tenants bijkomen — wordt n8n dan stilletjes kritieke infrastructuur? Geef een grens: wat mag n8n wel doen en wat nooit.
- Is n8n hier de goede keuze, of los ik hetzelfde op met de bestaande cron-outbox (`/api/cron/n8n-events`) zonder extra systeem? Kies.

### C5. AI Act en toegankelijkheid — waar sta ik en wanneer kantelt het?
- Er zit vandaag **geen LLM in `src/`**. Bevestig of weerleg dat. Wat betekent dat voor mijn positie onder Verordening (EU) 2024/1689 vandaag — geldt art. 4 (AI-geletterdheid) al voor mij?
- Wat kantelt er zodra ik wél een model in de check of het advies zet? De compliance-audit stelt: *"zodra AI iets over een persoon gaat beoordelen, kantelt dit."* Toets die uitspraak en maak hem scherper: bij welke concrete feature word ik aanbieder in plaats van gebruiksverantwoordelijke, en wanneer raakt Bijlage III in zicht?
- **European Accessibility Act:** geldt die voor mijn site (e-commerce/consumentendienst) sinds 28 juni 2025? Val ik onder de micro-onderneming-uitzondering, en zo ja, op basis van welke criteria precies? **Zoek de actuele stand op.** Als de uitzondering geldt: zeg dat kort en ga door, dan is dit geen werk.

### Formaat voor heel Deel C
Per juridisch punt: **verdict in één zin** → onderbouwing met **verordening + artikel/regelnummer + bron-URL** → **betrouwbaarheid** (hoog/midden/laag) → markeer met **⚖️** wat een echte jurist moet bevestigen en wat ik op eigen houtje kan besluiten. Onderscheid streng tussen "dit is wat de wet zegt" en "dit is mijn inschatting van hoe het uitpakt".

---

## 5. Werkwijze en grenzen

**Doen:**
- Lees de code die je nodig hebt om je uitspraken te dragen. Steekproefsgewijs, gericht, niet uitputtend.
- Gebruik websearch voor **alles in Deel C** — de wetgeving beweegt en je geheugen is niet de bron.
- Wees het oneens met de vaste feiten in §1 als de code je ongelijk geeft. Zeg het dan expliciet.
- Als twee delen van je advies met elkaar botsen (bv. A5 zegt "wacht" en B2 zegt "bouw nu"), benoem dat en kies.

**Niet doen:**
- Geen code schrijven, geen bestanden in `src/` wijzigen, geen commits, geen branches. Dit is een onderzoeksopdracht.
- Geen nieuwe HTML-prebuild of prototype maken.
- Geen samenvatting van wat er al is als antwoord op een "wat moet ik doen"-vraag.
- Geen vijf opties zonder voorkeur. Geen "het hangt ervan af" zonder te zeggen waarvan, en wat jij zou kiezen.
- Niet vriendelijk zijn over werk waar al veel tijd in zit. Als iets weg moet, zeg dat.

---

## 6. Wat je oplevert

Eén document, in deze volgorde:

1. **Verdict vooraan** — drie blokken van maximaal 5 regels: Deel A, Deel B, Deel C. Ik moet hieruit kunnen handelen zonder de rest te lezen.
2. **Deel A** — tenant-eenheid, isolatiemechanisme, kolommenbesluit, de vier herbruik-bakken met concrete paden, timing-verdict.
3. **Deel B** — de contradictie opgelost, maximaal 7 genummerde stappen met "waarom vóór de volgende" + afbreekcriterium, de stop-lijst, de één-ding-alinea.
4. **Deel C** — vier onderwerpen in het formaat uit §4, met bronnen.
5. **Wat ik zou schrappen** — concrete bestanden of tabellen die niets dragen, met de reden.
6. **Openstaande vragen** — wat je niet kon beslissen, en per vraag **de goedkoopste manier om hem te beantwoorden** (welk experiment, welk gesprek, welke meting). Geen open vraag zonder route naar een antwoord.

Lengte: zo lang als de onderbouwing vraagt, geen woord meer. Ik lees liever vier scherpe pagina's dan twintig volledige.
