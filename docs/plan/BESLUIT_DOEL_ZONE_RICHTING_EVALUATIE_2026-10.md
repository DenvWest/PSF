# Besluit: de zone "Waar je naartoe werkt" wordt "Doel", met richting, stand en evaluatie

**Datum:** 9 oktober 2026
**Status:** Besloten (Dennis, 9 okt: akkoord; Agenda en Keuze buiten deze reeks). Stap 1 gebouwd 9 okt (zie onder); stap 2 en 3 nog niet.
**Bouwt voort op:** `BESLUIT_VOEDINGSRICHTING_2026-10.md` (richting kadert en meet niet, klachten = doorverwijzing), `PLAN_EIGEN_IJKPUNT_DOEL_PER_DOMEIN.md` (ijkpunt = eigen as), `BESLUIT_DOEL_IN_ZIJBALK_NAMETING_2026-10.md` (stand gebouwd; nameting), `BESLUIT_KOMPAS_WINST_DAGBOEK_2026-10.md` (winstkaart)
**Raakt:** `KompasContextSpine.tsx` (doel-zone), `KompasDoelStand.tsx`, `KompasDagboekRegel.tsx`, `account_voedingsdoelen`

## Aanleiding

De zone toont alleen het ijkpunt ("Doordeweeks zelf koken volhouden, nu 2 van 10"). Dat zegt weinig: je ziet niet *waarom* je dit doet, niet waar je staat en niet of het werkt. Dennis vroeg of de zone "Doel" kan heten, of iemand er een "pijn" kiest, en of het doel geëvalueerd wordt.

## Wat er al ligt

- De **richting** (`NUT_DOEL`) bestaat als herkenningskeuze ("Ik zak 's middags in, ben vaak moe", …) maar staat alleen in Je doelen.
- Het **ijkpunt** (0–10) staat al in de zone en is te herscoren; scores hebben een tijdstempel.
- De **stand** per stof staat sinds #209 onder het ijkpunt.

## Besloten (voorstel)

### 1. De zone heet "Doel", met drie lagen op voeding

1. **Waar loop je tegenaan** (de richting). Staat hij nog leeg, dan kiest iemand hem in de zijbalk zelf, uit de zes bestaande opties, met dezelfde opslag als Je doelen. Het label is "Waar loop je tegenaan", niet "pijn": herkenning, geen klacht (schrijfstem; "adviezen, geen diagnoses").
2. **Concreet doel** (het ijkpunt, 0–10), ongewijzigd.
3. **Je stand** (de stof van je richting, uit het dagboek), zoals gebouwd.

Andere domeinen blijven bij kop "Doel" en het ijkpunt; alleen voeding heeft een richting en een meetbare stand.

### 2. Geen dubbele regel

De doel-zone draagt de stof. De dagboekregel in de winstkaart noemt dan een andere stof of niets, en de knop in de winstkaart wordt "Bekijk je patroon" zodra er 5 volle dagen zijn (nu blijft hij "Log je maaltijd van vandaag").

### 3. Evaluatie: houden of veranderen

Bij de hermeting (of 30 dagen na de keuze) toont de zone één blok:

> Je koos "Vaak moe" op 9 september. Hoe makkelijk gaat het: 4 → 6 van 10. Je magnesium: minstens 48% → 71%. Blijft dit je doel?  [Houden] [Veranderen]

- **Houden:** legt `doel_bevestigd_op` vast; het blok verdwijnt voor 30 dagen.
- **Veranderen:** opent de richtingkiezer. Een nieuwe richting krijgt een nieuwe startstand.
- Ijkpunt en stofstand staan als twee regels met elk een eigen label, nooit samen tot één score. Bij een daling dezelfde neutrale zin met twee getallen; nooit "gehaald", "mislukt" of tekort-taal (asymmetrie-regel).
- De evaluatie wijzigt de richting nooit zelf op grond van het dagboek.

### 4. Opslag (additieve migratie, migratie-eerst naar `main`)

Op `account_voedingsdoelen`: `voedingsrichting_gekozen_op timestamptz`, `doel_startstand jsonb` (`{stof, datum, aandeelPct, dagen}` per stof, nooit overschreven) en `doel_bevestigd_op timestamptz`. Een blok in `OPENSTAAND.md`; de code die de kolommen leest blijft op de feature-branch tot Dennis de migratie draaide.

### 5. De kolom volgt het scherm, niet alleen het domein (aanvulling 9 okt)

**Het probleem (Dennis):** "Context bij vandaag" staat naast het dagboek, en de winstkaart zegt daar "Log je maaltijd van vandaag" met een knop naar het dagboek, terwijl je er al bent. Op de andere tabs staat nog de oude kolom.

**Oorzaak (`Dashboard.tsx`):** `KompasContextSpine` bestaat alleen op `tab=vandaag` en kiest zijn inhoud per *domein*. Het Dagboek is die tab (zonder domein), dus de kolom weet niet dat je op het dagboek zit. Op Agenda, Voortgang en Keuze is `spineDomain` null en valt de kolom terug op de oude inspectorkaarten (gewoonte, meten, ritme).

**Besluit (voorstel):** de kolom krijgt een `surface` naast het domein en beantwoordt per scherm één vraag:

| Scherm | Vraag van de kolom | Wat de kolom doet |
|---|---|---|
| **Dagboek** (`tab=vandaag`, geen domein) | Wat is er vandaag nog open? | Dagstatus ("Ontbijt gelogd · lunch en avondeten nog open"), de stap als herinnering, en een knop die de volgende open maaltijd in het dagboek opent (`buildDagboekZoekHref`) in plaats van naar het dagboek te gaan. Daarna Doel en ritme |
| **Kompas-domeinscherm** (`tab=vandaag`, met domein) | Waar zit mijn winst? | Zoals nu: stap, knop naar het dagboek, Doel, schap |
| **Voortgang / Patroon** | Wat zegt mijn stand? | Stand en richting van de stof, evaluatie (stap 3 van de volgorde) |
| **Agenda, Keuze** | blijven voorlopig de oude kaarten | Eigen besluit later; niet in deze reeks |

- Geen knop die naar de plek wijst waar je al bent: op het Dagboek is de primaire knop "Voeg toe bij {volgende maaltijd}", en zodra alle maaltijden van vandaag erop staan ("Vandaag compleet") verdwijnt de knop.
- De winstkaart blijft de uitkomst van de check; alleen de handeling eronder volgt het scherm.
- De dagstatus is een feit over wat er vandaag staat, geen oordeel (overgeslagen maaltijden tellen als gelogd, `verwachteMaaltijden`).

### 6. Gratis

Alles hierboven is eigen-getallen-en-registratie en dus gratis. De venstergrootte (nu 7 dagen) en drempels blijven parameters die de aparte gratis/premium-sessie bepaalt.

### 7. De loop met n8n en het aanbod (later, 9 okt)

Dennis vroeg of de evaluatie automatisch kan terugkomen en later een n8n-loop kan geven voor producten, extra features en een abonnement. Besloten als startpunt voor de gratis/premium-sessie; niet gebouwd.

1. **Doel gekozen:** domain event `doel.richting_gekozen`; n8n zet een timer van 30 dagen (`voedingsrichting_gekozen_op`).
2. **Evaluatie klaar:** event `doel.evaluatie_due`; n8n stuurt een mail **zonder gegevens** ("Je doel-evaluatie staat klaar", link naar het dashboard).
3. **Houden of Veranderen:** event `doel.evaluatie_keuze`. Houden start de volgende ronde van 30 dagen; Veranderen begint met een nieuwe richting en een nieuwe startstand.
4. **Aanbod op het juiste moment:** pas na de evaluatie en een 30-dagenpatroon de premium-teaser ("je patroon per maaltijd staat klaar"). Een supplementvergelijking blijft algemene informatie en volgt de 30-dagenregel; hij komt nooit uit de evaluatie zelf.

Randvoorwaarden:
- **Eigen opt-in** ("doel-herinneringen"), los van de weekmail en `marketing_email`. Er geldt één hoofd-nurture per adres (`EMAIL_SYSTEM.md`): de loop is geen tweede nurture.
- **Geen voedingsgegevens in de mail en niet in n8n.** De events dragen geen percentages of stoffen (art. 9-gegevens); n8n weet alleen "evaluatie klaar" en "keuze gemaakt".
- **Wat het abonnement is** (14/30/90-trappen, personalisatie, voorstellen met effect), de prijs en de proef horen bij de aparte gratis/premium-sessie. De loop levert het moment, niet de inhoud.
- De evaluatie verandert de richting nooit zelf; de gebruiker kiest.

## Gebouwd (9 okt, stap 1)

- Zone heet "Doel" (`aria-label` en kop). Op voeding staat bovenaan "Waar je tegenaan loopt" (`KompasDoelRichting`): kiezen of wijzigen uit de zes richtingen, zelfde opslag en gedeelde toestand als Je doelen (`postVoedingsdoelen` + `zetKernstofWeergave`), `klachten` toont de doorverwijzing.
- Dedupe: `buildDagboekWinstRegel` krijgt `uitsluiten`; de winstkaart noemt de stof van de doel-zone niet. "Op je norm" volgt nog steeds uit álle meetbare stoffen.
- `KompasWinstKnop`: op een domeinscherm "Log je maaltijd van vandaag" (of "Bekijk je patroon" vanaf 5 volle dagen); op het Dagboek zelf de dagstatus ("Vandaag gelogd: ontbijt. Nog open: lunch en avondeten.") en "Voeg toe bij {volgende open maaltijd}", of bij een complete dag "Bekijk je patroon" zodra er 5 volle dagen zijn.
- Beperking: de dagstatus hangt aan de winstkaart met een stap uit de check. Zonder check (`geen_winstlaag`) staat de dagstatus er nog niet.
- Meetpunten: `nutrition.voedingsrichting_gekozen` {surface: kompas_context}, GA4/Clarity `dashboard_kompas_context_click` met `zone: doel_richting`, `zone: dagstatus_voeg_toe` {moment} en `zone: winst_stap` {doel: patroon|dagboek}.

## Afgewezen

- **"Pijn" als zichtbaar label:** een klacht-woord op een gezondheidsproduct; de herkenning ("Waar loop je tegenaan") doet hetzelfde.
- **Ijkpunt en stofstand samenvoegen tot één doelscore:** een tweede score is verboden en het ijkpunt is een eigen as.
- **De richting automatisch aanpassen op het dagboek:** de richting kadert, hij meet niet; de gebruiker kiest.
- **Elke dag evalueren:** een doel evalueer je op het ritme van de hermeting.

## Volgorde

1. **Zone "Doel" + richting kiezen in de zijbalk + dedupe + knopwissel + de kolom die het Dagboek herkent (§5: dagstatus en "Voeg toe bij …").** Geen migratie.
2. **Migratie** (drie kolommen), aparte kleine PR naar `main`.
3. **Startstand vastleggen en het evaluatieblok** (leest de nieuwe kolommen).

## Meetpunten

- Domain event `nutrition.voedingsrichting_gekozen` met `surface: kompas_context` (bestaand event, nieuwe surface).
- GA4 + Clarity `dashboard_kompas_context_click` met `zone: doel_richting` en `zone: dagstatus_voeg_toe` {moment}.
- Domain events `doel.evaluatie_getoond` en `doel.evaluatie_keuze` {keuze: houden|veranderen}; GA4 `zone: doel_evaluatie`.
- Effect: aandeel gebruikers dat een richting kiest in de zijbalk, en het aandeel dat bij de evaluatie "houden" kiest versus "veranderen" (zegt of de richting klopt).

## Open

- Of "Veranderen" ook het ijkpunt opnieuw laat zetten, of alleen de richting (voorstel: alleen de richting; het ijkpunt heeft al "Ander doel kiezen").
