# Besluit: het doel in de contextkolom krijgt een stand, een nameting en een volgende stap

**Datum:** 9 oktober 2026
**Status:** Voorstel, wacht op Dennis' akkoord. Niet gebouwd.
**Bouwt voort op:** `BESLUIT_KOMPAS_WINST_DAGBOEK_2026-10.md` (dagboekregel, #203), `BESLUIT_VOEDINGSRICHTING_2026-10.md` (richting kadert en meet niet), `PLAN_EIGEN_IJKPUNT_DOEL_PER_DOMEIN.md` (ijkpunt = PSFS, eigen as), `BESLUIT_DOELEN_VERBONDEN_2026-10.md` (normen, gevolgde stoffen), `BESLUIT_PATROON_PREMIUM_EN_WEEKMAIL_2026-10.md` §2–4 en `BESLUIT_GRATIS_NU_PREMIUM_AANBOD_2026-10.md` (wat gratis en premium is, n8n-mail zonder gegevens)
**Raakt:** `KompasContextSpine.tsx` (zone "Waar je naartoe werkt"), `src/lib/kompas-winst-dagboek.ts`, `account_voedingsdoelen`

## Aanleiding

De zone "Waar je naartoe werkt" toont nu alleen het ijkpunt als leesregel. Er staat geen stand, geen verloop en geen volgende stap bij. Dennis vroeg of dit doel meer waarde kan krijgen: een nameting, een aanbeveling bij het doel, en later een upsell met n8n.

## Wat er al ligt (en dus niet opnieuw gebouwd wordt)

| Laag | Waar het woont | Tijdstempel? |
|---|---|---|
| **Ijkpunt** (0–10, eigen situatie) | `domain_goal` + scores, bij elke domeincheck opnieuw gevraagd | Ja: `scoredAt`. De nameting van het ervaren doel bestaat dus al ("Vorige keer 4 van 10") |
| **Richting** (`NUT_DOEL`) | `account_voedingsdoelen.voedingsrichting`, stuurt alleen de volgorde van kernstoffen | Nee |
| **Norm per stof** | `useKernstofNormen` (persoonlijk) | n.v.t. |
| **Stand per stof** | dagboek, afgelopen 7 dagen (`buildDagboekWinstRegel`) | Niet bewaard |

**Gevolg:** voor het ervaren doel is geen migratie nodig. Voor de gemeten stand per stof wel, want `listDaybookDays` geeft maar de laatste 30 dagen terug. Een startstand achteraf uit het dagboek berekenen kan dus niet betrouwbaar.

## Voorstel

### 1. Stand + volgende stap in de doel-zone (gratis, geen migratie)

- De stof volgt de **richting** (`ordenVoorRichting`): energie → magnesium eerst, spier of gewicht → eiwit. Zonder richting: de stof met het laagste aandeel uit de dagboekregel. De richting kadert alleen de keuze welke stof er staat, nooit de meting of "gehaald".
- Regel: "Je werkt aan magnesium: minstens 62% van je norm (7 dagen)."
- **Wat vandaag helpt:** een voedingsbron, uit `bronnenVanStof` en `ruimteBij` (de maaltijd met de meeste ruimte): "Je ontbijt levert weinig magnesium. Havermout of noten erbij helpt." Alleen voeding. Geen supplement (stappenzorg, 30-dagenregel).
- Zonder 5 van 7 dagen (de drempel van #203): geen stof, wel "N van 7 dagen ingevuld" met de link naar het dagboek.

### 2. Nameting per stof (gratis, vraagt een migratie)

- **Startstand** vastleggen op het eerste moment dat de dagboekregel een stof noemt met minstens 5 van 7 dagen: `{ stof, datum, aandeelPct, dagen }`, per stof één keer, nooit overschreven.
- **Opslag (voorstel):** kolom `doel_startstand jsonb` op `account_voedingsdoelen` (additief). Additieve migratie, dus migratie-eerst naar `main` met een blok in `OPENSTAAND.md`. De code blijft op de feature-branch tot Dennis de migratie draait.
- **Tonen:** pas na minstens 14 dagen sinds de startstand én 5 van 7 dagen in het nieuwe venster: "Toen minstens 48% (sept) · nu minstens 71%." Beide getallen zijn ondergrenzen en dus vergelijkbaar.
- **Bij een daling:** dezelfde neutrale zin met de twee getallen, zonder oordeel of tekort-taal (asymmetrie-regel). Geen weekscore, geen totaalcijfer.
- **Koppeling met het ijkpunt:** staan beide naast elkaar, dan als twee aparte regels met elk een eigen label ("Hoe makkelijk gaat het: 4 → 6 van 10" en "Je magnesium: 48% → 71%"). Nooit samen tot één score; het ijkpunt is een eigen as (`PLAN_EIGEN_IJKPUNT_DOEL_PER_DOMEIN.md` §0).

### 3. Gratis versus premium

| Gratis | Premium (later) |
|---|---|
| Doel, stand, voedingsbron voor vandaag, nameting per stof (eigen getallen) | Nameting over 30–90 dagen per maaltijd: "je ontbijt droeg het, je avondeten niet" |
| | Voorstellen met effect: "met X bij je ontbijt kom je op Y% van je norm" |

Reden: eigen getallen inzien en registreren zijn nooit gegated (patroon-besluit §2). Premium verkoopt het verband over tijd, niet de nameting zelf.

### 4. Upsell en n8n (later, geen eigen nurture)

- Trigger: de nameting is klaar én er is een 30-dagenpatroon. Pas dan de premium-teaser ("je patroon per maaltijd staat klaar"), conform het 5-van-7-dagen-moment uit het premium-besluit.
- **n8n:** een domain event `doel.nameting_klaar` zet de bestaande weekoverzicht-mail in gang, **zonder voedingsgegevens in de mail** ("Je nameting staat klaar", link naar het dashboard). Geen aparte nurture: er geldt één hoofd-nurture per adres (`EMAIL_SYSTEM.md`), en de weekoverzicht-opt-in blijft de enige toestemming.
- Een supplementvergelijking blijft de 30-dagenvoorwaarde houden en komt nooit uit de doel-zone zelf.

## Afgewezen

- **Startstand uit het dagboek terugrekenen:** het dagboek geeft maar 30 dagen terug, dus de startstand valt na een maand weg.
- **Het ijkpunt en de stofstand samenvoegen tot één doelscore:** een tweede score is verboden en het ijkpunt is een eigen as.
- **Supplementadvies in de doel-zone:** botst met voeding eerst en de 30-dagenregel.
- **Een aparte nurture voor de nameting:** schendt één hoofd-nurture per adres.

## Volgorde

1. Doel-zone: richting + stand + voedingsbron (geen migratie). Eerst, want het levert de startstand.
2. Migratie `doel_startstand` (aparte kleine PR, migratie-eerst) → daarna de nameting in de code.
3. Premium-teaser en de n8n-mail: bij de premium-plak, na de weekmail.

## Meetpunten

- GA4 `dashboard_kompas_context_view` en `_click` met `zone: doel_stand` en `staat: te_weinig|stof|nameting`.
- Domain event `doel.startstand_gelegd` en `doel.nameting_getoond` {stof, dagen_tussen}: durable, zonder percentages.
- Effect: aandeel gebruikers met een nameting dat binnen 7 dagen opnieuw invult (retentie), en daarna `premium.trial_offered`.

## Open

- Een kolom op `account_voedingsdoelen` of een eigen tabel? Voorstel: kolom, want de startstand hoort bij hetzelfde doel-record. Een eigen tabel kan als er meerdere doelen per stof komen.
- Of de doel-zone ook op de andere domeinen een stand toont. Nu alleen voeding, omdat alleen voeding een meetbare stand heeft.
- De rij- en promptnaam "Plantbasis" hernoemen naar "Groente en fruit" is een los copybesluit; varianten volgen apart.
