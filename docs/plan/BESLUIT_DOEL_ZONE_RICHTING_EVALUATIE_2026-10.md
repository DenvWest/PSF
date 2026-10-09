# Besluit: de zone "Waar je naartoe werkt" wordt "Doel", met richting, stand en evaluatie

**Datum:** 9 oktober 2026
**Status:** Voorstel, Dennis akkoord op de aanpak (besluitdoc eerst, daarna bouwen). Niet gebouwd.
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

### 5. Gratis

Alles hierboven is eigen-getallen-en-registratie en dus gratis. De venstergrootte (nu 7 dagen) en drempels blijven parameters die de aparte gratis/premium-sessie bepaalt.

## Afgewezen

- **"Pijn" als zichtbaar label:** een klacht-woord op een gezondheidsproduct; de herkenning ("Waar loop je tegenaan") doet hetzelfde.
- **Ijkpunt en stofstand samenvoegen tot één doelscore:** een tweede score is verboden en het ijkpunt is een eigen as.
- **De richting automatisch aanpassen op het dagboek:** de richting kadert, hij meet niet; de gebruiker kiest.
- **Elke dag evalueren:** een doel evalueer je op het ritme van de hermeting.

## Volgorde

1. **Zone "Doel" + richting kiezen in de zijbalk + dedupe + knopwissel.** Geen migratie.
2. **Migratie** (drie kolommen), aparte kleine PR naar `main`.
3. **Startstand vastleggen en het evaluatieblok** (leest de nieuwe kolommen).

## Meetpunten

- Domain event `nutrition.voedingsrichting_gekozen` met `surface: kompas_context` (bestaand event, nieuwe surface).
- GA4 + Clarity `dashboard_kompas_context_click` met `zone: doel_richting`.
- Domain events `doel.evaluatie_getoond` en `doel.evaluatie_keuze` {keuze: houden|veranderen}; GA4 `zone: doel_evaluatie`.
- Effect: aandeel gebruikers dat een richting kiest in de zijbalk, en het aandeel dat bij de evaluatie "houden" kiest versus "veranderen" (zegt of de richting klopt).

## Open

- Of "Veranderen" ook het ijkpunt opnieuw laat zetten, of alleen de richting (voorstel: alleen de richting; het ijkpunt heeft al "Ander doel kiezen").
