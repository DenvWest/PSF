# BESLUIT — Aanbieders op Prioriteit 2, 3 en 4: vermelding mag breed, commissie mag smal

> **Status:** uitvoeringsbesluit. Dennis heeft op 13 augustus 2026 besloten dat de aanbieder-koppeling op **P2, P3 én P4** komt. Het advies uit `BESLUIT_BEWEGING_KOPPELNAAD_V1` §D1 (alleen P4) vervalt daarmee. Dit document voert het besluit uit en zet de randvoorwaarden die de positionering heel houden. Secties met **LOCK** volgen uit bestaande canon; secties met **VOORSTEL** wachten op GO.
> **Datum:** 13 augustus 2026
> **Reeks:** `BESLUIT_BEWEGING_PRIORITEITEN_V35_2026-08.md` (de ladder) · `BESLUIT_BEWEGING_ZITGEDRAG_EN_WEARABLES_V1_2026-08.md` (P1 + passieve meting) · `BESLUIT_BEWEGING_KOPPELNAAD_V1_2026-08.md` (K1 moment, K3 bron) · dit document (K2 aanbieder)
> **Noordster:** *Wie je helpt mag je beoordelen. Aan wie je beoordeelt hoef je niet te verdienen.*

---

## A · Wat dit document doet

Je vroeg in P2 t/m P5 om een koppel-optie naar een coach, trainer of locatie. Het koppelnaad-document adviseerde die tot P4 te beperken, omdat v3.5 §F P2 lockt als *"je basis — hier oordelen we niet over"* en P3 als *"je programma, geen product"*. **Je hebt anders besloten: P2, P3 en P4.** Dat is legitiem en dit document neemt het als uitgangspunt.

Wat het besluit niet raakt en wat dus ongewijzigd blijft:

| | Status na dit besluit |
|---|---|
| **P1** Dagelijks bewegen | Geen aanbieder. Gratis, geen kaart nodig — ongewijzigd |
| **P2** Kracht + basisconditie | **Aanbieder-vermelding, zonder commissie** — nieuw |
| **P3** Progressief opbouwen | **Aanbieder-vermelding, zonder commissie** — nieuw |
| **P4** Specifiek sporten | **Aanbieder-vermelding, commissie toegestaan** — bestaande v3.5-reservering |
| **P5** Geavanceerde training | Mechanisme klaar, knop uit — ongewijzigd (v3.5: *"hier staat bewust geen kaart"*) |
| **P6** Supplementen · wearables | Gegate achter voedingscheck én hertest — ongewijzigd |

De scheiding tussen "vermelding" en "commissie" in §C is wat dit besluit uitvoerbaar maakt zonder de Consumentenbond-positie op te geven. Het is geen inperking van je besluit; het is de vorm waarin het besluit standhoudt.

---

## B · Diagnose — het meeste staat er al, en één ding staat op de verkeerde plek

**B1 · Het schap heeft al drie lokale aanbieders.** `beweging-keuze-consumentenbond-prebuild-v3.5-2026-08.html` bevat drie kaarten met badge `Partner · lokaal`: *PT-intake bij Kracht & Co* (r1089), *Krachtgroep 45+ bij De Vliert* (r1109) en *Rustig baantjeszwemmen* (r1129). Ze dragen adres-nabijheid in de subregel (`Kracht & Co, 1,8 km` · `De Vliert, 3,2 km` · `Sportiom, 4,6 km`). Aanbieders zijn dus niet nieuw op het schap — ze zijn nieuw op de **ladder**.

**B2 · Het lokaal-lens bestaat al.** Scherm B heeft twee lenzen (`Voor jou` / `Bij jou`) en een postcodeveld van vier cijfers, met de tekst *"Opties binnen vijf kilometer van 1234"* en een expliciete fallback zolang de postcode leeg is (r1949-1957). Het herteken-gedrag is al bewust ontworpen: alleen op de grens van vier cijfers, anders kost het de focus midden in het typen (v3.5 §L).

**B3 · De oordeelvorm bestaat al.** Elke kaart draagt `verdict: { gecheckt, sterk, zwak, oordeel, micro }`, met de commissie-microcopy ná het oordeel, en boven de lijst staat de disclosure die het hele model draagt:

> *"Aan sommige opties in deze lijst verdienen we iets, aan andere niets — ze staan door elkaar en worden op dezelfde punten beoordeeld. Het oordeel staat in de kaart, vóór de link. Een partner koopt zich hier niet omhoog."*

Dat is precies de zin die §C hieronder afdwingbaar maakt. Hij bestaat al; hij is alleen nog nooit getoetst op een lijst waar de helft van de kaarten géén commissie draagt.

**B4 · De vondst — de twee bestaande partnerkaarten zijn inhoudelijk P2-kaarten die op P4 geparkeerd staan.** In `PRIORITIES` hangt Prioriteit 4 (*"Specifiek sporten — hardlopen · zwemmen · teamsport"*) de preview `prev: ["pt-intake", "krachtgroep"]` (r867). Maar kijk wat die twee kaarten inhoudelijk zijn:

- *PT-intake*: **"één afspraak van 45 minuten waarin je de vijf basisoefeningen op techniek doorloopt"** — dat is Prioriteit 2, kracht. Niet een sport die je zelf kiest.
- *Krachtgroep 45+*: **"groepen van maximaal acht, twee vaste avonden per week"** — dat is Prioriteit 2, kracht. Het woord staat in de titel.

**Ze staan op P4 omdat P4 de enige laag was waar een aanbieder mocht staan, niet omdat ze daar horen.** De lock heeft de inhoud verplaatst in plaats van hem te begrenzen. Dat is het sterkste argument vóór je besluit: de plaatsing die je nu vraagt is de inhoudelijk juiste, en de bestaande is een artefact.

**B5 · PartnerDesk kan de relatie al dragen.** `pd_partners` heeft `is_sole_proprietor boolean` ([migratie r53](../../supabase/migrations/20260712120000_partnerdesk_fase1.sql)) — het onderscheid eenmanszaak/rechtspersoon is al voorzien, en dat is precies het veld dat een zelfstandige trainer nodig heeft (§H2). `pd_commission_rules.kind` kent al `cpl` (cost-per-lead) naast `cps_percent`, `cps_fixed`, `cpc` en `cpa` ([r115](../../supabase/migrations/20260712120000_partnerdesk_fase1.sql)) — het meest waarschijnlijke model voor een sportschool is dus al modelleerbaar zonder één regel nieuw grootboek.

**B6 · Wat nergens bestaat.** Geo of afstand, openingstijden of beschikbaarheid, publieke (niet-admin) zichtbaarheid, een datum waarop een oordeel geschreven is, en een correctieprocedure voor een beoordeelde onderneming. `pd_*` is admin-only en heeft van dit alles niets. Dát is het bouwwerk, niet de knop.

---

## C · LOCK-voorstel — vermelding en commissie zijn twee schakelaars, niet één

### C1 · De twee sporen

| | Wat het is | Waar het mag |
|---|---|---|
| **V · Vermelding** | Een aanbieder staat op het schap met naam, plaats, afstandsband, ons oordeel en de vier assen. Bereikbaar vanaf de prioriteit | **P2 · P3 · P4** |
| **€ · Commissie** | Er loopt geld op een klik, een lead of een inschrijving bij die aanbieder | **P4** (en later eventueel P5) |

Op P2 en P3 geldt dus: `is_monetised: nee` **en** `zou_monetiseren: nee` — het tweede veld is de belangrijkste, want dat is het voornemen. Een kaart met `zou_monetiseren: ja` op P2 is een commerciële deur die nog niet open is, en die hoort daar niet.

### C2 · Waarom deze scheiding, en niet gewoon "overal alles"

De regel komt niet uit voorzichtigheid maar uit een bestaande, al vastgelegde formulering. `PROEF_BEWEGING_SCHAP_INHOUD_2026-08.md` §4 zegt letterlijk:

> **Waar commissie al loopt, moet het oordeel haar kunnen intrekken. Waar ze nog niet loopt, komt ze pas ná het oordeel.**

En daarbij, in dezelfde alinea: clausule 2 *"geldt voor dienst en sociaal, en is afdwingbaar zolang die kaarten geen aanbieder noemen"*. Dat is exact het punt waar dit besluit doorheen breekt — we gaan wél aanbieders noemen. De scheiding vermelding/commissie is de manier om clausule 2 afdwingbaar te houden nadat de aanbieder een naam heeft gekregen: op P2 en P3 kán het oordeel niet door geld gekleurd zijn, omdat er geen geld is.

Drie dingen die je daarmee koopt:

1. **P1–P3 blijft aantoonbaar gratis.** De richtlijn (Beweegrichtlijnen 2017, WHO 2020, ACSM) is de inhoud van die lagen, en die kost niets. Dat iemand je erbij kan helpen is waar; dat wij daaraan verdienen zou de belofte breken.
2. **De disclosure uit B3 wordt waar in plaats van geruststellend.** "Aan sommige opties verdienen we iets, aan andere niets" is nu een beschrijving van de lijst, niet een claim over onze intenties.
3. **Het onderscheid is machinaal te toetsen.** Eén acceptatieregel: nul kaarten met `is_monetised: ja` of `zou_monetiseren: ja` bereikbaar vanaf P1, P2 of P3. Dat is een test, geen belofte.

### C3 · Wat er gebeurt als je het niet splitst

Dan hangt er op de laag waar we zeggen *"dit is je fundament en het kost niets"* een betaalde deur. Dat is dezelfde structuur als een magnesiumpot bij verbinding (`BESLUIT_VERBINDING_PIRAMIDE_V1` §C6) of een supplement vóór de voedingscheck (P6). Het is bovendien onomkeerbaar in perceptie: de eerste lezer die merkt dat de "gratis basis" een lead-funnel is, komt niet terug met een correctie maar met een oordeel.

---

## D · Wat er per prioriteit komt te staan — VOORSTEL

### D1 · Prioriteit 2 · Kracht + basisconditie

**Verhuizing, geen uitbreiding.** De twee bestaande kaarten gaan van P4 naar P2, waar ze inhoudelijk horen (§B4):

| Kaart | Wordt | `is_monetised` | `zou_monetiseren` |
|---|---|---|---|
| PT-intake bij Kracht & Co | `prev` op P2 | nee | **nee** |
| Krachtgroep 45+ bij De Vliert | `prev` op P2 | nee | **nee** |

`PRIORITIES[2].prev` wordt `["basis", "pt-intake", "krachtgroep"]` — je eigen programma eerst, de aanbieders erna. De volgorde is de boodschap: *dit is je plan; dit zijn mensen die je erbij kunnen helpen.*

**Wat een P2-aanbieder mag zijn:** iemand die je krachtbasis leert uitvoeren of volhouden — een eenmalige techniek-intake, een groep met vaste avonden, een sportschool met begeleiding voor 45+. **Wat het niet mag zijn:** een abonnement dat het plan vervangt, of een traject dat pas na maanden iets oplevert. De rol-regel op de kaart blijft `Aanvulling naast je basis`.

### D2 · Prioriteit 3 · Progressief opbouwen — de lastigste van de drie

v3.5 zegt hier *"je programma, geen product"*. Dat blijft waar voor een **product**, maar begeleiding bij opbouw is geen product — het is precies de dienst waar de ACSM-position-stand over gaat: de opbouw doet het werk, en de meeste mensen bouwen te snel op.

Twee soorten aanbieders die hier passen, en één die er niet past:

- ✅ **Begeleiding op progressie** — een trainer die je vier tot acht weken meekijkt op volume en intensiteit. De bestaande kaart *Online begeleiding — Beweegcoach Nederland* (`traject`, `ttlDays: 56`) is hiervan de online variant en hangt vandaag aan geen enkele prioriteit.
- ✅ **Een lokale variant daarvan** — dezelfde dienst, met een naam en een afstand.
- ❌ **Een programma-abonnement zonder einddatum.** De hele these van P3 is dat opbouw een fase is. Een dienst zonder einde verkoopt het tegenovergestelde.

`PRIORITIES[3].prev` wordt `["dose", "traject"]` en later een lokale kaart. Beide `zou_monetiseren: nee`.

**Let op de kaartsoort:** `traject` draagt vandaag `v: "mits"` (*"Alleen als…"*). Dat oordeel blijft staan — een aanbieder op P3 verhuizen betekent niet hem promoveren.

### D3 · Prioriteit 4 · Specifiek sporten — ongewijzigd, mét commissie

Blijft `["baantjes", "keten"]` plus sportspecifieke aanbieders. Dit is de enige laag waar `zou_monetiseren: ja` mag staan, en de enige waar `is_monetised: ja` ooit waar mag worden. De reden staat al in v3.5: er is geen richtlijn die zegt dat je moet hardlopen of padellen — je kiest het zelf, en dan is een lokale aanbieder een echte dienst in plaats van een verkocht fundament.

### D4 · De afstandsband — LOCK-voorstel

De prebuild toont vandaag `1,8 km` en `3,2 km`. Met een postcode van vier cijfers weten we de gebruiker niet nauwkeuriger dan het postcodegebied (grofweg één tot twee kilometer diameter). **Een afstand op één decimaal suggereert dat we zijn adres hebben.**

Voorstel: banden in plaats van getallen — *"in je eigen postcodegebied" · "binnen 5 km" · "binnen 15 km" · "landelijk of online"*. Dat is eerlijk over wat we weten, sluit aan op de bestaande tekst *"Opties binnen vijf kilometer"*, en scheelt bovendien onderhoud: een band verandert niet als iemand verhuist binnen de stad.

---

## E · v3.5 §F — de rijen die wijzigen

Dit besluit herschrijft de canon; het overschrijft hem niet stilzwijgend. De tabel in `BESLUIT_BEWEGING_PRIORITEITEN_V35_2026-08.md` §F wordt:

| Prioriteit | Onderbouwing | Wat er hoort — **na dit besluit** |
|---|---|---|
| 1 Dagelijks bewegen | Beweegrichtlijnen 2017 | gratis, geen kaart nodig — *ongewijzigd* |
| 2 Kracht + basisconditie | WHO 2020 | je basis. **Lokale begeleiding mag hier staan, mét oordeel en zonder commissie** |
| 3 Progressief opbouwen | ACSM position stand | je programma. **Begeleiding op opbouw mag hier staan, mét oordeel en zonder commissie** |
| 4 Specifiek sporten | geen aparte richtlijn | lokale partners, mét oordeel — **en dit is de enige laag waar commissie mag lopen** |
| 5 Geavanceerde training | reviews periodisering | ghost-kaarten, geen prijs, geen link — *ongewijzigd* |
| 6 Supplementen · wearables | EFSA-claims | **gegate**: voedingscheck én hertest — *ongewijzigd* |

De formuleringen *"hier oordelen we niet over"* (P2) en *"geen product"* (P3) vervallen en worden vervangen door bovenstaande. Reden voor de wijziging, in één zin die in v3.5 hoort: *aanbieders staan bij de prioriteit waar hun inhoud thuishoort, en de commissiegrens loopt niet langs de kaart maar langs de prioriteit.*

---

## F · Datamodel — begin met data, niet met een tabel

### F1 · De naamgevingsval — dit wordt een vierde "affiliate"

`CLAUDE.md` waarschuwt dat drie dingen niet door elkaar mogen lopen: `affiliate_clicks` (uitgaande merchant-kliks) ≠ `pd_partners` (upstream) ≠ `af_affiliates` (eigen programma). Een lokale-aanbiedersvermelding wordt de vierde, en zonder besluit vooraf belandt hij in de verkeerde tabel.

**Splitsing, zoals in `BESLUIT_BEWEGING_KOPPELNAAD_V1` §D2:**

| Laag | Waar | Waarom |
|---|---|---|
| Commerciële relatie (contract, `cpl`-regel, contactpersoon, tijdlijn) | **`pd_*` hergebruiken** | Alleen relevant op P4. PartnerDesk doet dossier en commissieresolutie al |
| Publieke vermelding (plaats, afstandsband, oordeel, herzieningsdatum) | **eigen bron** | Consumentzichtbaar; `pd_*` is admin-only en heeft geen van deze velden |

Op P2 en P3 bestaat de eerste laag simpelweg niet — geen contract, geen commissieregel, geen `pd_partner`-rij nodig. Dat is de datamodel-uitdrukking van §C1.

### F2 · Fase 1 — een databestand, geen migratie

De rest van het schap is statische data in `src/data/`. Een aanbiedersvermelding hoeft daar in v1 niet van af te wijken:

```
src/data/beweging/aanbieders.ts   →  MovementProvider[]
src/types/movement-provider.ts    →  het type + de verplichte velden
```

Wat dat oplevert: geen migratie, geen RLS-vraag, git als redactie-audit (wie wijzigde welk oordeel wanneer, met review), en `tsc` als validatie op verplichte velden. Wat het kost: een deploy per redactionele wijziging — acceptabel bij tientallen vermeldingen, niet bij honderden.

**Verplichte velden per vermelding** (elk veld heeft een reden in §G of §H):

| Veld | Waarom verplicht |
|---|---|
| `slug`, `name`, `city`, `distanceBand` | identiteit + §D4 |
| `priority: 2 \| 3 \| 4` | bepaalt de commissiegrens (§C1) |
| `providerKind: "zelfstandig" \| "onderneming"` | AVG-regime (§H2) |
| `verdict: { gecheckt, sterk, zwak, oordeel }` | bestaande kaartvorm (§B3) |
| `verdictWrittenOn`, `verdictReviewDue` | dateerbaarheid (§H1) en herzieningsritme (§G) |
| `sources[]` | een oordeel zonder bron is een mening (§H1) |
| `isMonetised`, `zouMonetiseren` | PROEF §4, machinaal toetsbaar (§C2) |
| `correctionContact` | recht van antwoord (§H1) |

### F3 · Fase 2 — wanneer het wél een tabel wordt

Drie drempels, elk afzonderlijk voldoende: **meer dan ± 50 vermeldingen**, **een aanbieder die zijn eigen gegevens moet kunnen corrigeren zonder deploy**, of **beschikbaarheid/openingstijden die vaker dan per kwartaal wijzigen**. Dan pas `dir_*` (directory) als vierde prefix — bewust níet `pd_*` of `af_*`, zodat de vier betekenissen gescheiden blijven. Tot die drempel is een tabel duurder dan wat hij oplost.

---

## G · De redactielast — dit is de echte kostenpost

`PROEF_BEWEGING_SCHAP_INHOUD_2026-08.md` §7 vraagt registratie van **zoektijd en oordeeltijd per optie**, met de opmerking: *"vermenigvuldigd met 32 (4 domeinen × 8) is dit het jaarbudget van de redactie, inclusief het herzieningsritme."* Met aanbieders op drie prioriteiten verandert dat grondvlak wezenlijk:

- Een schap-optie (creatine, wandelen) is **landelijk geldig** en veroudert langzaam.
- Een aanbieder is **per postcodegebied geldig** en veroudert snel: eigenaarswisseling, een trainer die stopt, een groep die wordt opgeheven. **Een oordeel van twee jaar oud over een sportschool die van eigenaar wisselde, is erger dan geen oordeel** — het is dan een onjuiste uitspraak over een aanwijsbare onderneming (§H1).

Drie maatregelen die dit begrensd houden:

1. **Eén regio in v1.** De prebuild speelt al in Den Bosch (De Vliert, Sportiom). Begin daar, met een harde cap — voorstel: **maximaal twaalf vermeldingen over P2, P3 en P4 samen**. Buiten die regio toont het lokaal-lens landelijke en online opties, precies zoals de bestaande fallback-tekst al zegt.
2. **Herzieningsritme van twaalf maanden**, met `verdictReviewDue` zichtbaar op de kaart als *"Oordeel van maart 2026"*. Verlopen oordeel = kaart valt uit de lijst, niet: kaart blijft staan met een oude tekst.
3. **Geen aparte proef.** De PROEF ligt er al ontworpen en is nog niet uitgevoerd (statusverdict 11 augustus, actie 5). **Voorstel: breid hem uit van acht opties naar acht plus drie aanbieders** — één per prioriteit — in plaats van er een tweede proef naast te zetten. Dan meet je de oordeeltijd van een aanbieder tegen die van een schap-optie in dezelfde sessie, en dat verschil is precies het getal dat bepaalt of twaalf vermeldingen haalbaar zijn of al te veel.

Dit is geen uitstel van je besluit. Het besluit staat; §G bepaalt alleen met hoeveel vermeldingen je begint.

---

## H · Compliance

### H1 · LOCK — een publiek oordeel over een onderneming is een uitspraak met juridische scherpte

Vier eisen, alle vier al afgedekt door de verplichte velden in §F2:

- **Feitelijke basis en bron.** Elk oordeel steunt op verifieerbare feiten (openbare tarieven, groepsgrootte, kwalificatie van de begeleider). Wat alleen de aanbieder zelf beweert, mag in de kaart staan als *"opgave van de aanbieder"* — nooit als vastgesteld feit. Dit is dezelfde grens die PROEF §7 al benoemt: *"Je kunt een bewering niet verifiëren zonder de aanbieder te geloven"* is een telbaar signaal, geen detail.
- **Dateerbaarheid.** Elk oordeel draagt zijn schrijfdatum zichtbaar.
- **Correctieprocedure.** Een genoemde onderneming moet een feitelijke onjuistheid kunnen laten corrigeren via een vindbaar adres. `correctionContact` is daarom verplicht.
- **Geen vergelijkende superlatieven.** "De beste trainer bij jou in de buurt" is geen oordeel maar een claim (§J).

### H2 · LOCK — een zelfstandige trainer is een natuurlijk persoon

Bij `providerKind: "zelfstandig"` zijn bedrijfsgegevens deels persoonsgegevens: AVG-informatieplicht (art. 14, gegevens niet bij de betrokkene verkregen), rectificatierecht en bezwaarrecht gelden. Praktisch: bij opname informeren, en de vermelding op verzoek verwijderen. `pd_partners.is_sole_proprietor` bestaat al voor de commerciële kant; `providerKind` is het publieke equivalent.

### H3 · LOCK — de postcode wordt niet opgeslagen

Postcode-4 is een locatie-indicatie en dus een persoonsgegeven zodra hij aan een sessie hangt. Drie regels:

- **Nooit persisteren** — niet in `intake_sessions`, niet in prefs, niet in `agenda_blocks`. Component-state, meer niet.
- **Nooit in een event-payload.** `domain_events`, GA4 en Clarity krijgen hooguit `has_postcode: true|false`. Zelfde lock als vrije tekst.
- **Nooit gecombineerd** met check-antwoorden in één opslagrecord. Een postcode naast een gezondheidsscore is een wezenlijk gevoeliger gegeven dan beide afzonderlijk.

### H4 · LOCK — geen aanbieder op grond van een gemeten waarde

Erft ongewijzigd uit `BESLUIT_BEWEGING_ZITGEDRAG_EN_WEARABLES_V1` §E3:

> *Een coach-, product- of dienstaanbod mag nooit worden getoond op grond van een passief gemeten waarde, en nooit in dezelfde weergave als de meting.*

Concreet voor dit document: de prioriteitsstaat (`winst` / `watch` / `wacht`) mag bepalen **welke prioriteit opent**, maar nooit een aanbieder oplichten, vooraan zetten of aanbevelen. De gebruiker gaat zelf naar het schap, via de brug die er al is. En: **geen nurture-mail, geen dashboardsignaal en geen e-mail die een aanbieder noemt op grond van een lage score.**

### H5 · LOCK — geen zorgaanbieders in v1

Fysiotherapie, herstel- of pijnbehandeling en leefstijlgeneeskunde vallen onder een ander regime (Wkkgz, BIG-registratie, en bij verwijzing raken we aan zorgbemiddeling). **Voorstel: uitsluiten in v1.** Alleen begeleiding bij bewegen — trainer, coach, groep, locatie. Als er later een zorgaanbieder bij komt, is dat een eigen besluit met een eigen compliancecheck, niet een extra rij in een databestand.

### H6 · Commissie-transparantie op P4

De bestaande regels blijven onverkort: `rel="nofollow sponsored"` en `target="_blank"` op elke uitgaande link, de commissie-microcopy ná het oordeel, en de disclosure boven de lijst. Aanvullend: **de vermeldingen van P2/P3 en P4 staan in dezelfde lijst, in dezelfde vorm, met dezelfde assen.** Een lezer mag niet aan de vorm van een kaart kunnen zien of er geld op loopt — hij leest het in de microcopy, en dat is de bedoeling.

---

## I · Meetpunten

Elk nieuw client-event op drie registratieplekken: `src/lib/events.ts` + `src/lib/intake-events-client.ts` + allowlist in `src/app/api/intake/events/route.ts`.

| Event | Payload | Hier lees je aan af |
|---|---|---|
| `choice.provider_viewed` | `{ priority, provider_kind, monetised }` | Of aanbieders vanaf P2/P3 überhaupt bekeken worden, en of het verschil met P4 zit in de prioriteit of in het geld |
| `choice.provider_verdict_opened` | `{ priority, slug }` | Of het oordeel gelezen wordt of alleen de kaart. Blijft dit laag, dan is het schap een doorgeefluik en geen oordeel |
| `choice.provider_contact_click` | `{ priority, monetised }` | De enige uitgaande stap. Op P2/P3 is dit een verwijzing zonder opbrengst — dat moet je apart kunnen zien |
| `choice.shelf_opened` | bestaat al (v3.5 §H), uitbreiden met `lens: 'profiel'\|'lokaal'` | Of het lokaal-lens gebruikt wordt vóór je twaalf vermeldingen onderhoudt |
| `movement_priority_moment_linked` | uit koppelnaad §G | K1 is de voorwaarde: wie zijn moment niet vastzet, heeft geen aanbieder nodig |

**Geen postcode in enige payload** (§H3). **Geen aanbiedersnaam** in GA4 of Clarity — alleen `slug` in `domain_events`, dat is server-side en niet extern.

**Kill-criterium, expliciet:** blijft `choice.provider_viewed` op P2 en P3 over een venster van twee weken ver onder P4, dan is de brede plaatsing niet wat gebruikers zoeken en kun je terug naar P4-only zonder verlies — de vermeldingen zijn data, niet code.

**Meetpunt bij oplevering:** `choice.provider_viewed` tegenover `choice.provider_verdict_opened` per prioriteit — daar lees je af of een aanbieder gelezen wordt als hulp of als advertentie.

---

## J · Copy-lock

**Verboden in gerenderde tekst, aria-labels en eyebrows** (bovenop v3.5 §J en koppelnaad §H):
"de beste trainer bij jou in de buurt" · aanbevolen voor jou · geselecteerd voor jou · gecertificeerd (tenzij aantoonbaar en met register) · erkend (idem) · elke prijs vóór het oordeel · elke superlatief zonder vergelijkingsmaat · een exacte afstand op één decimaal (§D4) · elk commercieel aanbod bereikbaar vanaf P1, P2 of P3.

**⚠️ Bestaande inconsistentie die hierbij opgelost moet worden.** De prebuild gebruikt op alle drie de lokale kaarten de badge `Partner · lokaal` (r1090, r1110, r1130). Koppelnaad §H verbiedt *"partner (als kwaliteitskeurmerk)"* — en op P2/P3 is het bovendien feitelijk onjuist, want daar is niemand partner: er is geen contract en geen commissie. **Voorstel: badge wordt `Bij jou in de buurt`** op P2/P3, en blijft type-aanduidend (`Dienst · lokaal`) op P4. Het woord "partner" verdwijnt uit publieke copy en blijft een PartnerDesk-term.

**Toegestaan:** "Bij jou in de buurt" · "binnen 5 km" · het oordeel mét datum en bron · "opgave van de aanbieder" · commissie-microcopy ná het oordeel · "Zet dit in mijn dag" (K1).

---

## K · Bouwvolgorde

| Slice | Inhoud | Afhankelijk van | Kosten |
|---|---|---|---|
| **A0** | v3.5 §F herschrijven volgens §E; badge-rename §J | dit besluit | **S**, docs |
| **A1** | `MovementProvider`-type + `src/data/beweging/aanbieders.ts` met de drie bestaande kaarten, verplaatst naar P2/P4 (§D1) | A0 | **S** |
| **A2** | `prev`-herschikking in de ladder-data + acceptatietest "nul gemonetiseerde kaarten vanaf P1–P3" | A1, R2 (ladder-data) | **S** |
| **A3** | Afstandsbanden in plaats van km-getallen (§D4) + postcode-lock (§H3) | A1 | **S** |
| **P0** | **POORT** — PROEF uitvoeren, uitgebreid met drie aanbieders (§G3) | Dennis | **M**, redactie |
| **A4** | Regio-vulling tot de cap van twaalf, met `verdictWrittenOn` en herzieningsritme | P0 | **M**, redactie |
| **A5** | Meetpunten §I op drie registratieplekken | A2 | **S** |
| **A6** | Commissie op P4: `pd_*`-relatie + `cpl`-regel + uitgaande link met `sponsored` | A4, partnerbesluit | **M** |
| **A7** | `dir_*`-tabellen — alleen bij een drempel uit §F3 | drempel | **L**, uitgesteld |

A0 t/m A3 zijn vandaag te doen en raken geen enkele poort: het is een verhuizing van bestaande kaarten plus een type. A4 en verder hangen aan de PROEF.

---

## L · Open besluiten voor Dennis — vier

**L1 · Ga je akkoord met de scheiding vermelding/commissie (§C1)?**
Dit is de kern. Het geeft je P2, P3 en P4 zoals gevraagd, en houdt het geld op P4. **Advies: ja.** Zeg je nee — dus ook commissie op P2/P3 — dan vervalt de disclosure-zin uit §B3 als eerlijke beschrijving en moet de positionering opnieuw geformuleerd worden vóór A1. Dat is dan een besluit over wat PerfectSupplement is, niet over een scherm.

**L2 · Verhuizen de twee bestaande kaarten van P4 naar P2 (§D1)?**
Ze zijn inhoudelijk kracht. **Advies: ja** — en het is de goedkoopste slice in dit document, want het is een `prev`-regel.

**L3 · Regio-cap van twaalf, of breder beginnen (§G)?**
**Advies: twaalf, één regio.** De doorlopende herzieningslast is de reden, niet de bouwtijd. Twaalf vermeldingen met een geldig oordeel zijn meer waard dan zestig met een oordeel van vorig jaar.

**L4 · PROEF uitbreiden of apart houden (§G3)?**
**Advies: uitbreiden naar 8 + 3.** Hij staat al sinds 11 augustus open en blokkeert nu drie dingen: het schap, de aanbiedersvermelding en het commissiebesluit op P4. Eén sessie meer levert het getal dat L3 onderbouwt.

---

## M · Bronnen

- Intern: `docs/design/BESLUIT_BEWEGING_PRIORITEITEN_V35_2026-08.md` §F, §H, §J · `docs/design/BESLUIT_BEWEGING_KOPPELNAAD_V1_2026-08.md` §D1, §D2, §H · `docs/design/BESLUIT_BEWEGING_ZITGEDRAG_EN_WEARABLES_V1_2026-08.md` §E3 · `docs/design/PROEF_BEWEGING_SCHAP_INHOUD_2026-08.md` §4, §5, §7, §10 · `docs/design/BESLUIT_VERBINDING_PIRAMIDE_V1_2026-08.md` §C6 · `docs/core/COMPLIANCE.md` · `docs/plan/PRODUCTVISIE_AFFILIATE_PLATFORM.md` · `CLAUDE.md` (naamgeving affiliate-begrippen)
- Prebuild: `docs/design/beweging-keuze-consumentenbond-prebuild-v3.5-2026-08.html` — `PRIORITIES` (r820-894), `OPTS` (r969-1005), `CARDS` (r1007-1180), lokaal-lens en postcodeveld (r1944-1960)
- Code: `supabase/migrations/20260712120000_partnerdesk_fase1.sql` (`pd_partners.is_sole_proprietor`, `pd_commission_rules.kind` incl. `cpl`) · `src/data/affiliate-links.ts` · `src/data/domain-product-stance.ts` · `src/data/approved-claims.ts`
