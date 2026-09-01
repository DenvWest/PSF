# Verdict — tenants, volgorde, en de check als dienst

**Datum:** 30 augustus 2026 · **Type:** onderzoek + verdict · **Repo:** `psf` @ `main`
**Labels:** `[FEIT]` = uit repo of wet · `[OORDEEL]` = analyse · `[AANNAME]` = niet geverifieerd

---

## Verdict vooraan

**Deel A — tenants.**
De tenant-eenheid is **(d) interne scheiding**; `af_*` en `pd_*` zijn administratieve domeinen van jou, geen tenants. Optie (b) werkgever is juridisch dood — het AP heeft slaap- en bewegingsgegevens van werknemers expliciet verboden, óók geanonimiseerd via een derde partij. De isolatie is vandaag geen lek (één org, één rij), maar de dekking is **19 van de 414 `.from()`-calls** (4,6%): bij tenant 2 is dit onherstelbaar. Bouw multi-tenancy **niet**. Doe alleen het "deur openhouden"-werk: één `orgScoped()`-wrapper voor nieuwe code, een migratie-checklist, en gooi de `theme`/`orgRegistry`-scaffold weg — dat is een verkeerde abstractie.

**Deel B — volgorde.**
Het verdict van 15 augustus **wint**, maar niet zoals het bedoeld was: het bouwwerk is namelijk **al af**. `[FEIT]` Zeven `/beste/*`-vergelijkingen live (niet drie), `/methodologie` + `/ps-score` + `/onderbouwing` gepubliceerd, en `BuyingGuide.tsx:202` linkt er al naar. `/beste/*` heeft geen bouwwerk meer nodig — het heeft **bezoekers** nodig. Daarom is er maar één echte stap: distributie. Zes stappen, met stap 1 = bevries het dashboard (136 bestanden vs. 13 voor supplements) en stap 2 = één acquisitiekanaal drie weken serieus. Het ene ding voor september: verkeer naar wat er al staat.

**Deel C — recht.**
De check is vandaag **geen** medisch hulpmiddel en dat blijft zo zolang je hem op je eigen site aan consumenten geeft; verkoop aan een zorgprofessional of verzekeraar verschuift het *beoogde doel* en kan hem wél kwalificeren, ook zonder één vraag te wijzigen. De B2B-werkgeversvariant sluit je nu af. AI Act: je hebt vandaag **geen** verplichting (geen AI-systeem in `src/`, geverifieerd). EAA: je valt onder de micro-onderneming-uitzondering voor diensten (art. 4 lid 5) — **geen werk**. n8n staat correct als "niet actief" in het register; houd het daar.

---

# Deel A — van mono-tenant naar meerdere tenants

## A1. Wat is de tenant-eenheid?

**Aanbeveling: (d) interne scheiding.** `af_*` en `pd_*` zijn administratieve domeinen van jou; multi-tenancy als productconcept schrap je.

De onderbouwing loopt via eliminatie, en één van de vier valt om op recht, niet op techniek.

**(b) werkgever — juridisch dood.** `[FEIT]` Het AP heeft geoordeeld dat gegevens over beweging en slaappatronen gevoelige gezondheidsgegevens zijn die werkgevers **niet mogen verwerken**, en dat een derde partij dit **ook niet in geanonimiseerde vorm** namens de werkgever mag doen. Twee bedrijven hebben hun programma na AP-onderzoek gestaakt. Dat zijn precies twee van jouw zes domeinen. Zie C2 — dit pad sluit je nu, niet later.

**(c) professional — duur op de verkeerde as.** `[OORDEEL]` Fysio of diëtist die cliëntuitkomsten inziet, betekent: gezondheidsgegevens in opdracht verwerken (verwerkersovereenkomst per praktijk, DPIA, bewaartermijnen), én het verschuift het beoogde doel richting MDR (C1). De techniek is het probleem niet; de compliance-last per klant is het probleem, en die schaalt lineair met klanten terwijl jij solo bent.

**(a) white-label — technisch het duurst, en dat is contra-intuïtief.** `[FEIT]` Alle content zit file-based in `src/data/` (blog 236K, supplements 116K, kennisbank 72K, supplement-guides 68K) en is per-deploy. `[OORDEEL]` Een tweede merk met eigen content betekent per definitie een CMS of een tweede deploy-pipeline. En de claim-aansprakelijkheid verschuift mee (C3). Dit is het pad dat *lijkt* op "gewoon een subdomein" maar in werkelijkheid een tweede product is.

**(d) wint** omdat het beschrijft wat er al is: één org, één rij, en twee administratieve tabelfamilies die bewust deny-all zijn. `[FEIT]` `pd_*` en `af_*` hebben RLS aan en nul policies — dat is geen gat, dat is een correcte keuze.

**Conditie waaronder ik omdraai:** een betalende klant die (a) wil en bereid is vooruit te betalen voor de content-scheiding. Niet een geïnteresseerde partij — een getekende factuur.

## A2. Het isolatie-gat

**Is het vandaag een lek? Nee — maar de dekking is slechter dan je prompt stelt.**

`[FEIT]` 414 `.from()`-calls in `src/`, waarvan **19** met `.eq("organization_id", …)`. Dat is 4,6%. Je prompt zegt "isolatie hangt eraan of de code een filter niet vergeet"; de code vergeet het al in 95% van de gevallen. Het is vandaag onschadelijk omdat er één org is en `DEFAULT_ORG_ID` overal de default is. Het is bij tenant 2 direct een datalek over alle 25 org-dragende tabellen.

Drie dingen die je §1 mist en die het beeld veranderen:

`[FEIT]` **De header-spoof-naad is dicht.** `src/proxy.ts:113` geeft de inkomende `x-org-id` door aan `resolveOrgIdFromHost`, maar die functie negeert de parameter volledig (`_spoofedOrgHeader`, nooit gelezen — `src/lib/org-resolver.ts:65-72`) en overschrijft de header daarna op regel 116. Er zijn tests die dit vastpinnen (`api-middleware.test.ts:71`, `org-resolver.test.ts:89`). Goed geregeld.

`[FEIT]` **Er staan al werkende RLS-policies klaar.** `20260412200000_organization_id.sql` maakt per tabel een `for all to authenticated` policy op `auth.jwt()->'app_metadata'->>'organization_id'`. Die zijn dood: er is geen anon- of auth-client meer (`src/lib/supabase-admin.ts` is de enige `createClient`, en die is service-role) en `auth.users` is leeg (vastgelegd in `20260815130000_drop_anon_policies.sql`).

`[FEIT]` **`/api/partner/analytics` leest wél uit de DB** — je prompt noemt hem "idem-achtig" aan intake, maar hij haalt `intake_sessions` en `affiliate_clicks` op via service-role (`route.ts:48-59`). Hij filtert correct op `orgId`. Het risico zit een laag hoger: `resolvePartnerOrgId` valt bij een key **zonder** `:orgId`-suffix terug op `getDefaultOrganizationId()` (`api-middleware.ts:46`). Eén slordig geconfigureerde key = een externe partij die jouw productie-intakes leest.

### Welk mechanisme — één keuze

**Kies (i): een verplichte query-wrapper waar `createSupabaseAdmin()` achter verdwijnt.**

Concreet: één module `src/lib/db/scoped.ts` die `orgScoped(orgId)` exporteert en een client teruggeeft waarvan `.from(table)` voor elke org-dragende tabel automatisch het filter zet, plus `insert`/`upsert` die `organization_id` injecteert. Daarnaast een expliciete `unscoped()`-uitgang voor de tabellen die bewust mono zijn, zodat "geen filter" een zichtbare keuze wordt in plaats van een vergeten regel.

**Waarom (ii) afvalt.** Echte RLS met een per-request claim is architectonisch het juiste antwoord en ik zou het aanraden als je een klant had. Maar in deze codebase betekent het: Supabase Auth introduceren náást je bestaande `psf_account` HMAC-cookie, of een tweede Postgres-connectie met `set local` buiten de supabase-js-client om. `[OORDEEL]` Dat is weken werk voor nul tenants, en het raakt de auth-laag — het riskantste deel van een live systeem.

**Waarom (iii) afvalt.** Een ESLint-regel die kale `.from()` verbiedt is goedkoop maar lost het verkeerde probleem op: hij dwingt af dát je de wrapper gebruikt, niet dát het filter klopt. `[OORDEEL]` Hij is wél waardevol — maar als *handhaving van (i)*, niet als alternatief. Bouw hem in die volgorde.

**Kosten van (i):** `[AANNAME]` 1–2 dagen voor de wrapper plus de ESLint-regel; de 99 bestaande call-sites migreer je **niet** — nieuwe code gebruikt de wrapper, oude blijft. Dat is de hele truc: je koopt de deur open zonder de refactor te betalen.

### fail-open of fail-closed?

**Laat het fail-open, met één wijziging.** `[OORDEEL]` Vandaag is fail-open correct: bij één org is `DEFAULT_ORG_ID` altijd het juiste antwoord, en fail-closed zou betekenen dat een tijdelijke DB-storing je hele publieke site plat legt — inclusief `/beste/*`, je enige omzet. Dat is een slechtere uitkomst dan het risico dat het afdekt.

De wijziging: `resolveOrgIdFromSubdomain` cachet de **fallback** nu 5 minuten (`org-resolver.ts:52-55`). Een DB-hikje van één seconde pint een verkeerde org dus 5 minuten vast. Cache alleen succesvolle lookups; laat fouten ongecached terugvallen. `[OORDEEL]` Draai het pas om naar fail-closed op de dag dat er een tweede rij in `organizations` staat — dat is de trigger, niet de kalender.

### PARTNER_API_KEYS

`[FEIT]` Eén env-string, `key:orgId` komma-gescheiden, geparsed op elk request (`api-middleware.ts:19-47`). Het loopt stuk op: rotatie (nieuwe key = deploy + `systemctl restart`), intrekken (idem, geen directe revocatie), audit (geen logging wie wat wanneer opvroeg), en de default-org-terugval hierboven.

**Minimale alternatief:** `[OORDEEL]` niet nu bouwen — de route heeft nul gebruikers. Zet in plaats daarvan `PARTNER_API_KEYS` leeg in productie en laat `withPartnerApi` bij een lege env harde 403 geven. Dat is een regel werk en sluit het gat volledig. Bouw een `partner_api_keys`-tabel (gehashte key, `org_id` verplicht, `revoked_at`) pas op de dag dat er een partner is.

## A3. De 28 tabellen zonder `organization_id`

Per groep, niet in bulk.

| Groep | Kolom? | Waarom |
|---|---|---|
| `pd_*` (17) | **Nee, bewust mono** | `[OORDEEL]` PartnerDesk beheert *jouw* upstream-relaties met merchants. Zelfs bij tenant 2 blijven die van jou — een white-label-partner krijgt geen inzage in jouw Daisycon-contracten. Een kolom hier suggereert een scheiding die niet bestaat. |
| `af_*` (11) | **Nee, bewust mono** | `[OORDEEL]` Idem downstream: dit is jouw programma, jouw grootboek, jouw uitbetalingen. `[FEIT]` Beide families hebben RLS aan met nul policies — dat is de juiste bescherming voor "alleen ik". |
| `account_entitlements` | **Ja — als eerste** | Zie hieronder. |
| `account_favorites` | **Ja** | `[FEIT]` 18 augustus 2026, kreeg de kolom niet. Hangt aan `accounts` (die de kolom wél heeft) — dit is pure drift, geen keuze. |
| `guide_opt_ins`, `premium_waitlist` | **Ja** | `[OORDEEL]` Bevatten e-mailadressen van eindgebruikers; die horen bij een merk. Bij white-label mag tenant B jouw lijst niet zien. |
| `recovery_tokens` | **Nee** | `[OORDEEL]` Kortlevende tokens gekoppeld aan één account; de org volgt uit `accounts`. Een kolom voegt niets toe en geeft een tweede plek waar het fout kan. |

**`account_entitlements` — wat er gebeurt bij tenant 2.** `[FEIT]` De tabel bepaalt wie premium heeft en heeft geen `organization_id`; `getVisibleTiers(orgId)` leest daarnaast `organizations.settings.maxTier` (`src/lib/org-settings.ts:27`), en `src/lib/db/entitlements.ts:9` documenteert de bedoelde AND-relatie. `[OORDEEL]` Zonder kolom is een entitlement **globaal**: wie op tenant A premium koopt, is op tenant B ook premium. Bij white-label betekent dat dat jij de omzet van je partner weggeeft. Dit is de enige tabel in de lijst waar het ontbreken van de kolom direct geld kost.

**Volgorde: eerst de isolatie-laag (A2), dan kolommen waar nodig.** `[OORDEEL]` Kolommen zonder afdwingmechanisme geven schijnzekerheid — je hebt dan 62 tabellen met een kolom die 95% van de queries nog steeds negeert. De wrapper maakt het filter afdwingbaar; pas dan is een kolom toevoegen zinvol. Uitzondering: `account_entitlements` mag vooruit, want dat is een geldnaad.

**Tegen de drift — een mechanisme, geen voornemen.** Een test die de migratiemap leest en faalt als een nieuwe `create table` matcht op een prefix-allowlist (consumenten-tabellen) zonder `organization_id`. `[OORDEEL]` Dat draait in `vitest`, dus in je pre-push hook, en hij faalt op de dag dat je tabel 63 schrijft — niet drie maanden later. Kosten: een halve dag. Dit is het enige stuk multi-tenant-werk dat ik je nú aanraad, want het is het enige dat goedkoper wordt naarmate je het eerder doet.

## A4. Wat is écht herbruikbaar

**Bak 1 — domein-agnostisch, direct herbruikbaar.**
`src/lib/intake-engine.ts` (1182 regels, pure scoring) · `src/lib/rate-limit.ts` + `rate-limit-config.ts` · `src/lib/events.ts` + `domain_events` · consent-laag (`consent_records`, `src/lib/connection-profile-consent.ts`) · `src/lib/supabase-admin.ts` · de nurture-verzendlaag (niet de content).
`[OORDEEL]` Dit is echt herbruikbaar en het is ook echt weinig — grofweg 5% van 190.518 regels.

**Bak 2 — herbruikbaar na afgebakende ingreep.**
- `src/lib/recommendation-engine.ts` (463 r.) — ingreep: supplement-uitkomsten uit de engine trekken naar data. `[AANNAME]` 2–3 dagen.
- Nurture-templates (`src/lib/email-templates/nurture/`) — ingreep: merknaam/afzender uit `orgRegistry` in plaats van hardcoded. 1 dag.
- `src/lib/movement-assessment.ts` (814 r.) — domein-agnostisch van opzet, maar geschreven tegen jouw vraagset. 2 dagen.

**Bak 3 — hard PerfectSupplement-specifiek, niet generaliseren.**
`src/data/affiliate-links.ts` en de hele affiliate-naad · EFSA-claim-logica (`src/data/approved-claims.ts`) · `/beste/*` (`src/components/supplements/`) · de supplement-catalogus en PS-Score (`src/lib/supplement-hub/product-catalog.ts`, 524 r.) · alle `src/data/` content.
`[OORDEEL]` Dit is het product. Probeer het niet te abstraheren — de EFSA-claimregels zijn EU-specifiek én categoriespecifiek, en een tweede merk in een ander land heeft er niets aan.

**Bak 4 — dood of dormant, kan weg.**
`[FEIT]` Geverifieerd op niet-test-importeurs:
- `src/config/theme.ts` — **0 importeurs**. Weg.
- `src/lib/org-context.ts` — **0 importeurs**. Weg.
- `src/lib/api-middleware.ts` — 2 importeurs, allebei de partner-routes die niemand gebruikt.
- `src/app/api/partner/intake/route.ts` + `analytics/route.ts` — geen bekende afnemer. `[OORDEEL]` Weg, of minimaal achter een lege `PARTNER_API_KEYS` dichtzetten (A2).
- `registerOrg()` in `src/config/org.ts` — **0 aanroepers**; `orgRegistry` heeft exact één entry.
- `src/components/connection-profile/` — 2 bestanden, en verbinding staat op je eigen stop-lijst van 15 augustus.

**De content-vraag.** `[OORDEEL]` Een tweede tenant kan **niet** zinvol eigen content hebben zonder CMS. Het goedkoopste antwoord dat over vijf jaar geen spijt geeft: accepteer dat, en verkoop white-label alleen als "jouw merk, mijn content". Dat is een legitiem product (de content ís je moat) en het vereist nul CMS-werk. De spijt-variant is een half-CMS bouwen waar je content in twee vormen leeft.

**De harde vraag: is `theme`/`orgRegistry` de goede fundering?**
**Nee. Gooi het weg voordat je erop bouwt.** `[FEIT]` `orgRegistry` is een in-code `Record` met één entry en een `registerOrg()` die niemand aanroept; `ThemeConfig` heeft nul importeurs; beide dragen al een `EXPERIMENTAL … Not used by production pages`-banner. `[OORDEEL]` Het is een verkeerde abstractie om twee redenen: (1) het is een **tweede bron van waarheid** naast `organizations.settings` in de DB, en die twee gaan onvermijdelijk uit elkaar lopen; (2) een theme als kleuren-object past niet bij een Tailwind-codebase waar kleuren in JSX staan — je zou 1340 bestanden moeten omschrijven om het te laten werken. Houd `DEFAULT_ORG_ID` en `getDefaultOrganizationId()` (21 importeurs, die dragen echt iets); schrap de rest.

## A5. Timing

**Bouw multi-tenancy niet. Doe het minimale deur-open-werk.**

**Nu wel (samen ±2 dagen):**
1. De migratie-drift-test (A3) — wordt duurder naarmate je wacht.
2. `orgScoped()`-wrapper + ESLint-regel voor **nieuwe** code (A2); bestaande 99 call-sites ongemoeid.
3. `PARTNER_API_KEYS` leeg + harde 403 (A2).
4. Bak 4 schrappen (A4) — dood scaffold weghalen is goedkoper dan het meeslepen.

**Nu niet:** kolommen op alle 28 tabellen · echte RLS met tenant-claim · een CMS · subdomein-routing testen · `partner_api_keys`-tabel · iets aan `pd_*`/`af_*` veranderen.

**Point of no return:** de dag dat er een **tweede rij in `organizations`** komt die echt verkeer krijgt. Vanaf dat moment is elke ongefilterde query een datalek en moet je vóór livegang: fail-closed resolver, kolommen op de vier tabellen uit A3, en de bestaande call-sites migreren. `[OORDEEL]` Reken op 2–3 weken. Dat is de prijs die je bewust uitstelt, en dat is de juiste keuze bij nul klanten.

---

# Deel B — in welke volgorde nu aan de gang

## B1. De contradictie

**Het verdict van 15 augustus wint — maar de belangrijkste vondst is dat het bouwwerk waar het om vroeg al af is.**

Dit corrigeert §1 van je prompt op twee punten, en het verandert de hele volgorde:

`[FEIT]` Er zijn **zeven** live `/beste/*`-vergelijkingen, niet drie: `magnesium`, `omega-3`, `ashwagandha`, `vitamine-d`, `creatine`, `zink`, `eiwitpoeder` (`src/data/supplements/`, elk 281–356 regels, alle zeven geregistreerd in `index.ts` en gerenderd via `generateStaticParams` in `src/app/beste/[supplement]/page.tsx:41`).

`[FEIT]` De scoremethodiek is **al gepubliceerd**: `/methodologie` (`src/app/methodologie/page.tsx`), `/ps-score` (95 regels) en `/onderbouwing` (398 regels). En `/beste/*` linkt er al naar — `src/components/supplements/BuyingGuide.tsx:202`.

`[OORDEEL]` Dat betekent dat de `one thing` van 15 augustus — "`/beste/*` + gepubliceerde scoremethodiek" — als **bouwopdracht** voltooid is. De contradictie is dus niet "je hebt het verkeerde gebouwd in plaats van het juiste"; het is subtieler en ongemakkelijker: je hebt het juiste afgemaakt, geen distributie geregeld, en bent toen doorgebouwd aan de volgende laag. Het patroon is niet luiheid maar **bouwen als vluchtgedrag voor verkopen**.

De verhoudingen blijven wel scheef: `[FEIT]` `src/components/dashboard/` = **136 bestanden**, `src/components/supplements/` = **13**, `intake/` = 66. `[OORDEEL]` Elke dashboard-feature is een weddenschap op retentie van een publiek dat nog niet binnen is. Maar de remedie is niet "bouw meer aan `/beste/*`" — daar valt weinig meer te bouwen. De remedie is stoppen met bouwen en beginnen met distributie. Dat is wat de volgorde hieronder doet.

## B2. De volgorde — 6 stappen

Merk op wat hier ontbreekt: er staat geen enkele bouwstap in de eerste drie. Dat is opzettelijk, en het is het hele punt van dit advies.

### 1. Bevries het dashboard-oppervlak
**Wat:** geen nieuwe features in `src/components/dashboard/`, `intake/` of `connection-profile/`; alleen bugfixes die live gebruikers raken.
**Waarom vóór de volgende:** zonder deze stap lekt elke week opnieuw capaciteit naar de 136-bestanden-kant, en komt stap 2 er nooit. Dit is de enige stap die *tijd vrijmaakt* in plaats van kost; alle volgende stappen hangen ervan af.
**Tijd:** 0 dagen — het is een besluit, geen bouwwerk.
**Afbreekcriterium:** klaar zodra het opgeschreven staat. Het werkt níet als je binnen twee weken opnieuw een dashboard-commit maakt; dan is het probleem niet de volgorde maar de aantrekkingskracht van bouwen, en dan is B4 het enige wat je moet herlezen.

### 2. Meet wat er nu binnenkomt
**Wat:** Search Console + GA4 openen en per `/beste/`-pagina vastleggen: impressies, posities, klikken, affiliate-kliks. Eén tabel, zeven rijen.
**Waarom vóór de volgende:** je hebt zeven live vergelijkingen en weet niet welke ranken. Zonder dit nulpunt is stap 3 blind gokken en kun je achteraf niet zien of het werkte. Het is een uur werk en het bepaalt waar dat werk heen gaat.
**Tijd:** 1 dag (inclusief het eerlijk opschrijven van wat je ziet).
**Afbreekcriterium:** klaar als je per pagina een getal hebt. Als blijkt dat je nul impressies hebt, is dat geen mislukking maar de diagnose: dan is het een indexatie-/autoriteitsprobleem en niet een contentprobleem, en dat verandert stap 3.

### 3. Eén acquisitiekanaal, drie weken serieus
**Wat:** kies één kanaal en werk het door. `[OORDEEL]` Mijn voorkeur: SEO op long-tail vergelijkingszoekwoorden, want daar staat je content al op en het is het enige kanaal dat blijft opleveren zonder doorlopende inzet. Tweede keus als stap 2 nul impressies toont: ergens aanwezig zijn waar je doelgroep al is (fora, Reddit, nieuwsbrieven van anderen) — geen advertenties, want zonder conversiedata verbrand je budget.
**Waarom vóór de volgende:** dit is de enige stap die het grondprobleem raakt. Alles wat je bouwt zonder bezoekers is speculatie; dit is de stap die van speculatie meting maakt. En het is de stap die je twee weken lang hebt vermeden door te bouwen.
**Tijd:** 15 werkdagen verspreid over 3 weken.
**Afbreekcriterium:** geslaagd bij 500 unieke bezoekers/maand op `/beste/*`. Breek af en kies een ander kanaal als je na 3 weken onder de 50 zit. `[OORDEEL]` Breek **niet** af omdat het langzaam voelt — SEO heeft 8–12 weken nodig voordat de curve zichtbaar wordt; het getal na 3 weken is een richtingssignaal, geen eindstand.

### 4. Het deur-open-werk uit A5
**Wat:** migratie-drift-test, `orgScoped()`-wrapper voor nieuwe code, `PARTNER_API_KEYS` leeg + 403, bak 4 schrappen.
**Waarom vóór de volgende:** klein (±2 dagen), het wordt duurder naarmate de codebase groeit, en het is de enige multi-tenant-investering die rendeert zonder klant. Het komt ná stap 3 omdat het geen bezoeker oplevert — maar vóór stap 5, omdat stap 5 nieuwe tabellen kan opleveren die de drift-test meteen moet bewaken.
**Tijd:** 2 dagen.
**Afbreekcriterium:** klaar als de drift-test rood wordt op een proeftabel zonder `organization_id`. Te klein om te falen.

### 5. Beslis over het half-afgebouwde: afmaken of afschrijven
**Wat:** per brok (kompas, schap, ladders, agenda, PartnerDesk fase 1, `af_*` fase 3A) één geschreven besluit: afmaken, bevriezen of verwijderen.
**Waarom vóór de volgende:** je kunt pas over nieuw werk beslissen als je weet wat er nog leeft, en na stap 3 heb je voor het eerst data om die keuze op te baseren. `[OORDEEL]` Mijn verwachting: PartnerDesk afmaken (28 componenten, 21 lib-bestanden — het bedient jou dagelijks); `af_*` bevriezen (bedient partners die je niet hebt); connection-profile verwijderen (2 bestanden, staat al op de stop-lijst).
**Tijd:** 1 dag beslissen; uitvoering variabel.
**Afbreekcriterium:** klaar als alle zes een besluit hebben. Je hebt níet besloten maar uitgesteld als je bij meer dan twee "afmaken" kiest.

### 6. Pas hier: premium, of de volgende weddenschap
**Wat:** met echt verkeer beslissen waar het geld vandaan komt naast affiliate.
**Waarom als laatste:** dit is de enige stap die "we meten het wel" legitiem als rechtvaardiging mag gebruiken, omdat stap 3 de meting mogelijk heeft gemaakt.
**Tijd:** onbepaald.
**Afbreekcriterium:** n.v.t. — hier plan je opnieuw.

### Wat er in geen geval geraakt mag worden
`[FEIT]` De affiliate-naad: `src/data/affiliate-links.ts`, de slug-consistentie tussen `SupplementProduct`/`ChoiceRoute`/`AffiliateLink`, `rel="nofollow sponsored"`, en het Arctic Blue `sld=`-mechanisme. Geen enkele stap hierboven raakt die bestanden. Stap 3 voegt eraan toe; hij herschrijft niets.

## B3. De stop-lijst

| Wat | Waarom het wacht | Kosten om op te pakken |
|---|---|---|
| **Kompas, schap, ladders, cyclus** (het werk van 22–29 aug) | `[OORDEEL]` Bedient gebruikers die je niet hebt. Dit is het pijnlijkste item: er zit weken werk in en het is goed werk, maar het is gebouwd voor een publiek dat nog niet bestaat. | Laag — het staat er en rot niet. Oppakken bij 500 bezoekers/maand. |
| **`af_*` / affiliate-programma fase 3A** | Downstream-partners bestaan niet, en zonder verkeer heb je niets om te laten promoten. Stond al op je eigen 15-aug-lijst. | Midden — de grootboek-kern is af, de UI niet. |
| **Multi-tenancy voorbij A5** | Nul klanten. Zie A5. | Hoog (2–3 weken) — bewust geaccepteerd. |
| **B2B-werkgeversvariant** | `[FEIT]` Juridisch geblokkeerd (C2). Dit wacht niet, dit stopt. | N.v.t. — niet oppakken. |
| **Connection Profile / verbinding** | 2 componenten, geen EFSA-claim, geen schap, en het staat al op de stop-lijst. | Laag — maar ik zou het verwijderen (A4), niet bewaren. |
| **Een LLM in de check** | Zie C5: het verandert je positie onder de AI Act én mogelijk onder MDR. Niet doen zonder aanleiding. | Hoog — en het is een compliance-beslissing, geen technische. |
| **Nieuwe `/beste/*`-pagina's** | `[FEIT]` Zeven staan er al en ze krijgen geen bezoekers. Een achtste voegt niets toe zolang de eerste zeven niet gevonden worden. | Laag — pak het op als stap 3 laat zien wélk type zoekwoord werkt. |

### Waar dit advies met zichzelf botst

`[OORDEEL]` Je prompt vroeg dit expliciet te benoemen. A5 zegt "bouw geen multi-tenancy", maar stap 4 van B2 zet er toch 2 dagen in. Dat is geen tegenspraak maar een bewuste asymmetrie: het deur-open-werk (drift-test, wrapper, partner-keys dicht) is goedkoop nú en duur later, terwijl de rest van multi-tenancy duur nú en even duur later is. Ik zou die 2 dagen ook doen als je nooit een tweede tenant krijgt, want de drift-test en de dichte partner-API zijn op zichzelf hygiëne. Alles daarbovenop wacht op een getekende klant.

Tweede spanning: B2 zegt "bouw niets in september", terwijl stap 4 en 5 wel werk zijn. Los dat zo op: stap 1–3 zijn september. Stap 4–6 beginnen pas als stap 3 een getal heeft opgeleverd, en dat is oktober op zijn vroegst.

## B4. Het ene ding voor september 2026

Haal bezoekers naar de zeven vergelijkingen die er al staan — en bouw in september niets. Dit is het ongemakkelijke antwoord, want het is geen programmeerwerk en daarmee precies het werk dat je de afgelopen twee weken hebt vermeden door aan kompas, schap en cyclus te bouwen. Maar de diagnose is eenduidig: `/beste/*` is compleet (zeven vergelijkingen, drie methodiekpagina's, werkende affiliate-links, onderlinge links) en krijgt nagenoeg geen bezoekers. Dat is geen bouwprobleem — geen enkele extra regel code lost het op, en elke regel die je toevoegt vergroot alleen het oppervlak dat je later onderhoudt. Je hebt een distributieprobleem, en distributie is het enige vak in dit project waar je nog geen uur in hebt gestoken. Eén kanaal, drie weken, een getal aan het eind. Als dat getal er is, weet je voor het eerst iets wat de code je niet kan vertellen; zonder dat getal is elke volgende architectuurbeslissing — inclusief alles in Deel A — een gok op een publiek waarvan je niet weet of het bestaat.

---

# Deel C — de check als product-dienst

## C1. Wanneer kantelt de check naar medisch hulpmiddel?

**Verdict:** Vandaag geen hulpmiddel; verkoop aan een zorgprofessional of verzekeraar kan hem wél laten kwalificeren **zonder dat je één vraag wijzigt**, omdat de MDR-toets aan het *beoogde doel* hangt en niet aan de vragenlijst.

**Onderbouwing.** `[FEIT]` Verordening (EU) 2017/745 art. 2 lid 1 definieert een hulpmiddel via het door de fabrikant beoogde doel. MDCG 2019-11 is op **17 juni 2025** herzien naar rev. 1 — je `COMPLIANCE.md:93` verwijst dus naar de actuele versie. De kern van de kwalificatietoets: software heeft een medisch doel als zij een *actie op data* verricht die verder gaat dan opslag, archivering, communicatie of eenvoudig zoeken, **ten behoeve van een individuele patiënt**. `[FEIT]` Rev. 1 voegt een module-per-module-benadering toe: een medische module binnen een overigens administratief platform trekt alleen díe module het regime in, mits grenzen en afhankelijkheden gedocumenteerd zijn.

`[OORDEEL]` Dat laatste is voor jou het scherpste punt en het snijdt twee kanten op. Het beschermt je (een B2B-rapportagemodule maakt niet je hele site een hulpmiddel), maar het weerlegt ook de redenering "de vragenlijst verandert niet, dus er verandert niets" — de module in de nieuwe context wordt apart beoordeeld.

**Regel 11 (Bijlage VIII).** `[FEIT]` Regel 11a: software die informatie levert die wordt gebruikt voor diagnostische of therapeutische beslissingen → klasse IIa (hoger bij dood/onomkeerbare achteruitgang). Regel 11b: software die fysiologische processen monitort. `[OORDEEL]` De elementen in jouw huidige output die richting IIa duwen, in volgorde van risico:

1. **`urgency_level` zichtbaar maken.** Nu niet user-facing — `[FEIT]` `COMPLIANCE.md:104` legt dat expliciet vast. Zodra een zorgprofessional dit veld ziet en het zijn handelen stuurt, is het "informatie gebruikt voor een beslissing".
2. **Escalatie of triage-taal.** "Neem contact op met je huisarts" als *conditionele* uitkomst is een oordeel; de altijd-zichtbare vangnetregel (`COMPLIANCE.md:102`) is dat niet. `[OORDEEL]` Je bestaande "altijd-zichtbaar is informatie, conditioneel-zichtbaar is een oordeel"-regel is juridisch scherp en zou ik ongewijzigd laten.
3. **Doorverwijzing met inhoud.** Een rapport dat naar een fysio gaat mét interpretatie is anders dan de ruwe antwoorden van de cliënt zelf.
4. **`profile_label` als toestand.** "Lage Batterij" is een gedragsprofiel; wordt het gepresenteerd als bevinding aan een professional, dan verschuift het.

**Ontwerpkeuzes die je aan de veilige kant houden** (aanvullend op je bestaande kill-lijst, `COMPLIANCE.md:112`):
- De eindgebruiker is altijd de ontvanger; een derde krijgt hooguit wat de gebruiker zelf doorstuurt.
- Geen conditionele doorverwijzing — vangnetregel altijd zichtbaar, nooit getriggerd.
- `urgency_level` blijft intern, ook in elke API-response naar derden (`[FEIT]` `/api/partner/intake/route.ts:53-58` geeft `urgency` nu wél terug — dat is precies de naad die je moet dichten als die route ooit gebruikt wordt).
- Geen longitudinale monitoring die als bewaking van een fysiologisch proces leest (Regel 11b).
- Geen koppeling aan een behandelplan of een zorgverlener-dossier.

**Betrouwbaarheid:** hoog voor de wettekst en de rev.1-datum; midden voor mijn inschatting van waar precies de kantelpunten liggen.
**⚖️** Een jurist moet bevestigen: of de module-per-module-benadering van rev. 1 een B2B-rapportagemodule inderdaad isoleert van de rest. Zelf te besluiten: de vier ontwerpkeuzes hierboven — die zijn strenger dan de wet vraagt en kosten je niets.

`[FEIT]` Geen jurisprudentie of nieuwe guidance in 2025–2026 gevonden die dit oordeel omkeert; rev. 1 wordt door de geraadpleegde bronnen consistent beschreven als verduidelijking zonder inhoudelijke wijziging.

## C2. Mag ik dit aan een werkgever leveren?

**Verdict: Nee. Sluit dit pad nu af — het AP heeft precies dit type dienstverlening al onrechtmatig verklaard, en de anonimiseer-uitweg is expliciet dichtgezet.**

**Onderbouwing.** `[FEIT]` Het AP heeft in een onderzoek naar wearable-gebaseerde vitaliteitsprogramma's geoordeeld dat gegevens over **hoeveelheid beweging en slaappatronen** gevoelige persoonsgegevens over gezondheid zijn die werkgevers **niet mogen verwerken**. Twee Nederlandse bedrijven staakten hun programma na dat onderzoek.

`[FEIT]` Over toestemming: *"In een arbeidsverhouding, waarin de werknemer financieel afhankelijk is van de werkgever, is over het algemeen geen sprake van 'vrije' toestemming."* Dat sluit AVG art. 6 lid 1 sub a en art. 9 lid 2 sub a als grondslag uit — precies de eis van "vrijelijk gegeven" uit art. 4 lid 11.

`[FEIT]` **Het beslissende punt voor jouw model:** het AP oordeelde dat derden (leveranciers) deze gegevens **ook niet in geanonimiseerde vorm** namens de werkgever mogen verwerken. De gebruikelijke uitweg — "de werkgever ziet alleen groepscijfers" — is hiermee dicht. `[OORDEEL]` Er is dus geen groepsgrootte waarbij het alsnog mag; de vraag naar een drempel (N≥10 o.i.d.) is niet de juiste vraag, want de onrechtmatigheid zit in het verwerken zelf, niet in de herleidbaarheid van de uitkomst.

`[FEIT]` De resterende grondslagen zijn smal: gezondheidsgegevens van werknemers mogen niet worden verwerkt tenzij noodzakelijk voor naleving van wettelijke bepalingen of voor re-integratie/begeleiding bij ziekte. Dat loopt via de bedrijfsarts onder beroepsgeheim — `[FEIT]` de werkgever heeft geen toegang tot het dossier, ook niet als hij het PMO betaalt. Deelname aan PAGO/PMO is bovendien vrijwillig.

**Jouw rol.** `[OORDEEL]` In een werkgeversconstructie zou je **verwerker** zijn (je verwerkt in opdracht) — maar dat helpt niet, want een verwerker mag geen verwerking uitvoeren die de verwerkingsverantwoordelijke zelf niet mag laten doen. De verwerkersovereenkomst (art. 28), DPIA (art. 35, door het AP verplicht gesteld bij gezondheidsgegevens) en bewaartermijnen zijn dan niet de horde — de grondslag is de horde, en die ontbreekt.

**Verdict voor een solo-bouwer:** `[OORDEEL]` Sluit het af. Niet omdat het te veel werk is, maar omdat het handhaafbaar onrechtmatig is; het AP heeft in dit domein daadwerkelijk gehandhaafd (`[FEIT]` €15.000 boete voor CP&A wegens verwerking van gezondheidsgegevens van zieke werknemers). Dit is het antwoord dat tenant-optie (b) uit A1 omver duwt, precies zoals je vermoedde.

**Betrouwbaarheid:** hoog. De AP-standpunten zijn expliciet en gaan over hetzelfde datatype (slaap, beweging) en hetzelfde model (derde partij levert aan werkgever).
**⚖️** Een jurist hoeft dit niet te bevestigen om **nee** te zeggen — dat kun je zelf besluiten. Een jurist heb je pas nodig als je een variant wilt waarin de *werknemer* jouw klant is en de werkgever alleen betaalt zonder enige data of rapportage te ontvangen; `[OORDEEL]` dat is mogelijk houdbaar, maar dan verkoop je geen B2B-product maar een cadeaubon, en het commerciële verhaal ("inzicht in de vitaliteit van uw personeel") valt weg.

## C3. Evidence als contractueel artefact

**Verdict:** Versionering van de regels is genoeg zolang jij de aanbieder bent; zodra een derde je engine onder eigen merk draait, heb je een overdraagbaar dossier nodig — en verschuift de claim-aansprakelijkheid naar hém, niet naar jou.

**Onderbouwing — claims.** `[FEIT]` Verordening (EG) 1924/2006 art. 8 legt de bewijslast bij de *exploitant van een levensmiddelenbedrijf die de claim gebruikt*; bevoegde autoriteiten kunnen van degene die het product in de handel brengt alle onderbouwing opvragen. Autorisatie van een claim laat de civiel- en strafrechtelijke aansprakelijkheid van die exploitant onverlet.

`[OORDEEL]` Bij white-label betekent dat: de partner die onder eigen merk claims doet, is aansprakelijk voor die claims. Dat klinkt gunstig, maar het is een valstrik — jij levert de engine die de claims *genereert*, dus contractueel zal hij die verantwoordelijkheid bij jou willen leggen. Regel dat expliciet in het contract, en lever de claim-onderbouwing als artefact mee. `[FEIT]` Je hebt daar al een basis voor: `src/data/approved-claims.ts` (16K).

**Onderbouwing — scoring.** `[OORDEEL]` `RULES_VERSION` 1.4.0 plus de `evidence_*`-tabellen zijn voldoende voor een redactioneel product. Voor een betaalde variant heb je nodig: (1) een vastgelegde koppeling item → bron → beslisregel, (2) een changelog waaruit blijkt wélke regel wanneer veranderde en waarom, (3) reproduceerbaarheid — dezelfde antwoorden geven bij versie X dezelfde uitkomst. `[FEIT]` Punt 3 heb je al: `intake_sessions` draagt `rules_version` (`20260609120000_intake_sessions_rules_version.sql`).

**Validatie is niet vereist, maar de claim van validatie wel.** `[OORDEEL]` Zolang je nergens beweert dat de check *gevalideerd* is, hoef je geen validatiestudie. Zeg je het wel, dan moet je het kunnen tonen. Dit is de goedkoopste risicoreductie in dit hele hoofdstuk: schrijf het woord niet op.

**Wat is blokkerend voor een betaalde variant?** `[AANNAME]` Op basis van de geheugen-index (evidence-audit 5 juli, verdict NUANCEER, P0 copy-fixes zoals `melatonine_signal` omgekeerd + 2 veldverwijderingen open — niet opnieuw in de repo geverifieerd):
- **Blokkerend:** elke P0 waarbij de *inhoud* omgekeerd of onjuist is. Een omgekeerd signaal is bij een gratis check een fout; bij een betaald product is het een gebrek in de zin van wanprestatie.
- **Kan wachten:** de nuancerings-copy en de dormante velden (`profile`, `relSuppId`).

**Betrouwbaarheid:** hoog voor 1924/2006 art. 8; midden voor de scoring-eisen (geen sectorstandaard, mijn inschatting).
**⚖️** Jurist bevestigen: de aansprakelijkheidsverdeling in een white-label-contract. Zelf besluiten: het woord "gevalideerd" vermijden, en de P0-fixes doen — dat moet je sowieso.

## C4. n8n — lijm of tenant-integratielaag?

**Verdict:** Houd n8n weg; los het op met de bestaande cron-outbox. Het register klopt vandaag, en dat is precies de toestand die je wilt bewaren.

**Onderbouwing.** `[FEIT]` `src/lib/n8n-webhook.ts:11` bevat inderdaad `email: string | null` in de payload. En `[FEIT]` — dit corrigeert de suggestie in je prompt dat dit niet geregeld zou zijn — het verwerkingsregister dekt het af: `VERWERKINGSREGISTER.md:126` legt vast dat PostHog en n8n *voorbereid maar niet geconfigureerd* zijn (`N8N_WEBHOOK_URL` ontbreekt), mét de expliciete voorwaarde: *"Bij activatie: register + privacyverklaring eerst bijwerken."* Regel 319 herhaalt het per subverwerker.

`[OORDEEL]` Dat is correct geregeld. De verplichting ontstaat bij activatie, niet bij het bestaan van de code. Wat er dan moet gebeuren: n8n als subverwerker in het register, verwerkersovereenkomst, en bij n8n **cloud** een expliciete keuze voor de EU-regio plus doorgifte-toets. Zelf-gehost op je eigen Hetzner-VPS is aanzienlijk goedkoper in compliance-termen — geen extra verwerker, geen doorgifte, het valt onder je bestaande hosting.

**Wordt n8n stilletjes kritieke infrastructuur bij tenants?** `[OORDEEL]` Ja, en dat is precies het risico. De grens die ik zou trekken:
- **n8n mag:** notificaties, rapportages, boekhoud-export, alles waar vertraging of uitval geen datavernietiging veroorzaakt en waar de bron van waarheid in Postgres blijft.
- **n8n mag nooit:** in het pad van een gebruikersactie zitten, de enige plek zijn waar een gebeurtenis is vastgelegd, of PII naar buiten dragen zonder dat het register dat dekt. `[OORDEEL]` Het `email`-veld in de payload is de kanarie: zodra dat naar een externe cloud gaat, is n8n geen lijm meer maar een verwerker van persoonsgegevens.

**De keuze: cron-outbox.** `[FEIT]` Je hebt `/api/cron/n8n-events` en `markDomainEventDelivered` al — het outbox-patroon staat er. `[OORDEEL]` De outbox in Postgres is de waardevolle helft; n8n is slechts een consument ervan. Voor jouw schaal (nul verkeer, solo) voegt een tweede systeem alleen operationele last toe. Bouw wat je nodig hebt als route in de app, houd de outbox als naad, en haal n8n er pas bij als je een integratie hebt die je écht niet zelf wilt schrijven.

**Betrouwbaarheid:** hoog (repo + register geverifieerd).
**⚖️** Niets voor een jurist zolang n8n uit staat. Zelf besluiten: laat `N8N_WEBHOOK_URL` leeg.

## C5. AI Act en toegankelijkheid

**Verdict AI Act: je hebt vandaag geen enkele verplichting — art. 4 raakt je niet, want je hebt geen AI-systeem.**

`[FEIT]` Bevestigd, en sterker dan je prompt stelt: `package.json` bevat **geen enkele** LLM-dependency (geen `anthropic`, `openai`, `langchain`, `mistral`, `cohere`, `ollama`, `transformers`); `src/` bevat geen enkele call en geen `embedding`-code. `/api/chat/route.ts` gebruikt `answerEvidenceQuestion` uit `src/lib/evidence-rag.ts` — keyword-matching over eigen tabellen, geen generatief model en geen vector-embeddings.

`[FEIT]` Verordening (EU) 2024/1689 art. 4 verplicht *aanbieders en gebruiksverantwoordelijken van AI-systemen* om AI-geletterdheid van hun personeel te waarborgen; de verplichting geldt sinds **2 februari 2025** en staat los van risicoklasse. `[OORDEEL]` De verplichting hangt aan het *hebben* van een AI-systeem. Zonder AI-systeem is er geen aanbieder- of gebruiksverantwoordelijke-rol, dus geen art. 4-verplichting. Let op de reikwijdte als je het wél gaat gebruiken: de verplichting strekt zich uit tot iedereen die het systeem namens jou bedient, inclusief opdrachtnemers.

**Wanneer kantelt het?** De uitspraak uit de compliance-audit — *"zodra AI iets over een persoon gaat beoordelen, kantelt dit"* — is **te grof**. Scherper:

- **Je wordt gebruiksverantwoordelijke** zodra je een extern model onder eigen gezag inzet (bijv. de Claude API aanroepen om plan-copy te genereren). Dan geldt art. 4, plus transparantie richting gebruikers.
- **Je wordt aanbieder** zodra je een AI-systeem onder je eigen naam of merk in de handel brengt — bijvoorbeeld "de PerfectSupplement AI-coach" als product, of wanneer je een model substantieel aanpast. `[OORDEEL]` Dit is de kanteling die telt: aanbieder-verplichtingen zijn een orde van grootte zwaarder.
- **Bijlage III komt in zicht** bij werkgelegenheid (personeelsselectie, beoordeling) en bij toegang tot essentiële diensten. `[OORDEEL]` Jouw consumentenproduct raakt dat niet — maar de B2B-werkgeversvariant uit A1(b) zou het wél kunnen raken. Dat is een tweede, onafhankelijke reden om dat pad te sluiten.
- **Let op de dubbele kanteling:** een LLM dat individuele gezondheidsoutput genereert, verschuift óók de MDR-toets uit C1, omdat het een "actie op data ten behoeve van een individuele patiënt" wordt. `[OORDEEL]` Die twee regimes tegelijk raken is de duurste stap die je in dit project kunt zetten. Vandaar B3: geen LLM in de check zonder aanleiding.

**Betrouwbaarheid:** hoog voor art. 4 en de datum; midden voor de aanbieder/gebruiksverantwoordelijke-grens in randgevallen.

**Verdict EAA: de micro-onderneming-uitzondering geldt. Geen werk.**

`[FEIT]` Richtlijn (EU) 2019/882 art. 3: micro-onderneming = minder dan 10 personen **én** jaaromzet of balanstotaal niet boven €2 miljoen. Art. 4 lid 5: *"Microenterprises providing services shall be exempt from complying with the accessibility requirements referred to in paragraph 3 of this Article and any obligations relating to the compliance with those requirements."* Van toepassing op producten en diensten aangeboden na **28 juni 2025**. `[FEIT]` De uitzondering geldt voor **diensten**, niet voor producten — jouw site is een dienst.

`[OORDEEL]` Je voldoet aan beide criteria als solo-bouwer, en de uitzondering is automatisch: geen aanvraag, geen assessment. Dit is geen werk. Toegankelijkheid blijft goed vakmanschap (en helpt SEO), maar het is geen verplichting en hoort niet in de volgorde van Deel B.

**Betrouwbaarheid:** hoog (richtlijntekst zelf geraadpleegd).
**⚖️** Niets voor een jurist. Wel zelf bewaken: de uitzondering vervalt zodra je 10 medewerkers of €2M passeert.

---

# Wat ik zou schrappen

| Pad | Reden |
|---|---|
| `src/config/theme.ts` | `[FEIT]` 0 niet-test-importeurs. Verkeerde abstractie voor een Tailwind-codebase (A4). |
| `src/lib/org-context.ts` | `[FEIT]` 0 niet-test-importeurs. Duplicaat van `getDefaultOrganizationId()`. |
| `registerOrg()` + `orgRegistry` in `src/config/org.ts` | `[FEIT]` 0 aanroepers, 1 entry. Tweede bron van waarheid naast `organizations.settings`. Houd `DEFAULT_ORG_ID` en `getOrgConfig`-terugval. |
| `src/app/api/partner/intake/route.ts` | Geen afnemer; lekt `urgency` in de response (C1). Minimaal: `PARTNER_API_KEYS` leeg + 403. |
| `src/app/api/partner/analytics/route.ts` | Geen afnemer; leest productie-intakes via service-role; default-org-terugval bij key zonder `:orgId` (A2). |
| `src/lib/api-middleware.ts` | Bestaat alleen voor de twee routes hierboven. |
| `src/components/connection-profile/` (2 bestanden) + `cprofile_*` | Staat op je eigen stop-lijst sinds 15 aug; geen EFSA-claim, geen schap. `[OORDEEL]` Tabellen laten staan (data), UI weg. |

**Niet schrappen, tegen de verwachting in:** `src/lib/dashboard-dev-data.ts`. `[FEIT]` `src/app/dashboard/page.tsx:7` importeert `buildDevDashboardData` — het bestand zit in het productiepad, ondanks de naam.

`[OORDEEL]` Doe dit opruimwerk in stap 4 van Deel B, niet eerder. Het is geen omzetwerk, en het is precies het soort taak dat aanvoelt als vooruitgang zonder het te zijn — dezelfde valkuil als het dashboard-werk zelf.

---

# Openstaande vragen

**1. Hoeveel verkeer krijgt `/beste/*` vandaag echt, en welke van de zeven rankt?**
Dit is nu de belangrijkste open vraag van het hele document — stap 2 en 3 van Deel B hangen eraan, en "nagenoeg geen" is geen getal.
*Goedkoopste route:* Search Console + GA4, laatste 90 dagen, uitgesplitst per `/beste/`-pagina. Eén uur. Dit is stap 2.

**2. Welke P0's uit de evidence-audit staan nog open?**
Bepaalt of C3 blokkerend is voor een betaalde variant. Ik heb de audit niet in de repo geverifieerd — die kennis komt uit de geheugen-index, niet uit deze sessie.
*Goedkoopste route:* de audit in `docs/research/` erbij pakken en de P0-lijst afvinken tegen `src/data/leefstijlcheck-evidence.ts`. Halve dag.

**3. Is er een reëel white-label-vooruitzicht, of is dit een hypothese?**
De enige vraag die A5 kan omdraaien.
*Goedkoopste route:* geen experiment — één gesprek met één concrete partij. Kun je die niet bij naam noemen, dan heb je het antwoord al.

**4. Waarom bleef het verdict van 15 augustus liggen?**
`[OORDEEL]` Dit is geen technische vraag, maar het is wel de vraag die bepaalt of dit document over drie weken hetzelfde lot ondergaat. De stop-lijst in B3 werkt alleen als de onderliggende reden bekend is — en die is waarschijnlijk dat bouwen prettiger is dan verkopen.
*Goedkoopste route:* over twee weken terugkijken naar je commits. Staat er weer dashboard-werk in, dan is de volgorde niet het probleem.

**5. `src/lib/dashboard-dev-data.ts` — verwijderen of niet?**
`[FEIT]` Geverifieerd: `src/app/dashboard/page.tsx:7` importeert `buildDevDashboardData`. Dit is **geen** dood bestand; het staat in het productiepad van het dashboard. Ik heb het daarom uit de schraplijst gehaald.
*Route:* niet schrappen. Wel controleren of het echte data of fixtures serveert in productie — het bestand staat in je working tree gewijzigd, dus je bent er zelf mee bezig.

---

## Bronnen

- [MDCG 2019-11 rev. 1 — aankondiging Europese Commissie, 17 juni 2025](https://health.ec.europa.eu/latest-updates/update-mdcg-2019-11-rev1-qualification-and-classification-software-regulation-eu-2017745-and-2025-06-17_en) · [guidance PDF](https://health.ec.europa.eu/document/download/b45335c5-1679-4c71-a91c-fc7a4d37f12b_en?filename=mdcg_2019_11_en.pdf)
- [MDR Bijlage VIII Regel 11 — toelichting](https://www.regaffairshub.com/blog/eu-mdr-rule-11-software-classification) · [Emergo by UL over rev. 1](https://www.emergobyul.com/news/european-revision-primary-software-guidance-mdcg-2019-11-revision-1-small-changes-meaningful)
- [AP: verwerking gezondheidsgegevens wearables door werkgevers mag niet](https://www.autoriteitpersoonsgegevens.nl/nl/nieuws/ap-verwerking-gezondheidsgegevens-wearables-door-werkgevers-mag-niet) · [NJB-bericht over hetzelfde oordeel](https://www.njb.nl/nieuws/verwerking-gezondheidsgegevens-wearables-door-werkgevers-mag-niet/)
- [AP: boete CP&A wegens privacyschending zieke werknemers](https://autoriteitpersoonsgegevens.nl/nl/nieuws/boete-voor-cpa-om-privacyschending-zieke-werknemers)
- [AP-beleidsregels "De zieke werknemer" (PDF)](https://nvab-online.nl/app/uploads/2024/08/beleidsregels_de_zieke_werknemer.pdf) · [Beleidsregels op wetten.overheid.nl](https://wetten.overheid.nl/1.3:c:BWBR0037896&g=2025-07-01&z=2025-12-03)
- [Verordening (EG) 1924/2006 — geconsolideerde tekst](https://eur-lex.europa.eu/legal-content/NL/TXT/HTML/?uri=CELEX:02006R1924-20141213)
- [Richtlijn (EU) 2019/882 — European Accessibility Act](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32019L0882)
- [Verordening (EU) 2024/1689 art. 4 — AI-geletterdheid](https://artificialintelligenceact.eu/article/4/)
