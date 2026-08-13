# BESLUIT — Koppelnaad v1: van prioriteit naar een moment, en pas veel later naar een aanbieder

> **Status:** onderzoeksrapport + besluitvoorstel. Secties met **LOCK** volgen uit bestaande canon (v3.5-besluit, PROEF, CLAUDE.md-naamgeving, COMPLIANCE). Secties met **VOORSTEL** wachten op expliciete GO van Dennis.
> **Datum:** 13 augustus 2026
> **Reeks:** `BESLUIT_BEWEGING_PRIORITEITEN_V35_2026-08.md` (de ladder) · `BESLUIT_BEWEGING_ZITGEDRAG_EN_WEARABLES_V1_2026-08.md` (Prioriteit 1 + passieve meting) · dit document (Prioriteit 2–6 koppelingen) · `BESLUIT_BEWEGING_AANBIEDERS_P2_P4_V1_2026-08.md` (K2 uitgewerkt, vervolg op §D)
> **Noordster:** *Een prioriteit koppelen aan een moment kost niets en levert alles. Een prioriteit koppelen aan een aanbieder kost een redactie.*

---

## A · Diagnose — de naad ligt er al, hij is alleen nooit bedraad

**A1 · `agenda_blocks` draagt de koppelvelden al.** De tabel heeft `external_provider` en `external_ref`, met een tabelcomment die het doel letterlijk benoemt: *"external_* kolommen gereserveerd voor latere koppelingen"* ([migratie 20260718160000](../../supabase/migrations/20260718160000_agenda_blocks.sql)). De read-mapping naar `externalProvider` / `externalRef` bestaat ([agenda-blocks.ts:103-104](../../src/lib/agenda-blocks.ts#L103)).

**A2 · Het bronnen-type is al volledig uitgeschreven.** `AgendaBlockSource` ([types/agenda.ts:4-15](../../src/types/agenda.ts#L4)) enumereert `external:google_calendar`, `apple_calendar`, `outlook`, plus zes wearables. `TimelineBlockKind` kent al `"external"` naast `"analysis"` en `"routine"`.

**A3 · Schrijvers: nul.** Buiten testfixtures vult niets in `src/` deze velden ooit. Elke koppeling die je bouwt, is de eerste schrijver — en daarmee degene die het patroon vastlegt voor alle volgende.

**A4 · De tijd/duur/datum-primitief bestaat al helemaal.** `CreateAgendaBlockInput` is `{ date, categoryId, title, startTime, endTime }` en `UpdateAgendaBlockInput` staat verplaatsen en herplannen toe. `AgendaCategoryId` dekt alle vijf domeinen plus `supplementen`, `water`, `werk`, `ontspanning`, `persoonlijke_routine`. Wat je in P4 vroeg — *"tijd-duur-datum goed kunnen koppelen met Mijn Dag"* — is qua datamodel **af**.

**A5 · Maar de dagstap wordt bewust niet weggeschreven.** v3.5 §G lockt: *"Mijn Dag rendert virtueel. De dagstap wordt niet als agenda-blok weggeschreven; de timeline sorteert op tijd en de basis-rij staat er altijd."* Dat is de reden dat A4 nog geen koppeling ís: de prioriteiten leven in een ladder, de agenda leeft in een tabel, en er is met opzet geen brug. Die brug bouwen is §C — en het is precies één ontwerpbesluit, niet een migratie.

**A6 · Voor aanbieders bestaat helemaal niets.** Nul treffers op lokale dienstverleners, geo of beschikbaarheid in `PRODUCTVISIE_AFFILIATE_PLATFORM.md` of in `src/lib/partnerdesk/`. PartnerDesk beheert *upstream* merchants (Vitaminstore, Daisycon) — geen directory van trainers of sportscholen. Wat er wél staat, is een reservering: het beweegcockpit-ontwerp noemt een coach-/zorgverlener-slot *"toekomst-slot, gated §15"*.

---

## B · Drie soorten koppeling — en ze zijn niet één ding

Je vraag in P2 t/m P5 leest als één wens ("een koppel-optie"), maar er zitten drie verschillende dingen in met totaal verschillende kosten:

| | Wat het koppelt | Kosten | Poort |
|---|---|---|---|
| **K1 · Moment** | Prioriteit → tijd/duur/datum op Mijn Dag | **Laag** — datamodel bestaat (§A4) | geen |
| **K2 · Aanbieder** | Prioriteit → coach, trainer, locatie | **Hoog** — nieuw datamodel, redactie, monetisatiebesluit, aansprakelijkheid | eigen besluit |
| **K3 · Bron** | Prioriteit → wearable/agenda-import | **Hoog** — AVG-traject | §15 |

K3 staat volledig in `BESLUIT_BEWEGING_ZITGEDRAG_EN_WEARABLES_V1`. Dit document behandelt K1 en K2.

**De centrale aanbeveling van dit document:** bouw **K1 generiek voor alle zes prioriteiten** — één mechanisme, één component, geen per-prioriteit-werk. ~~Beperk **K2 tot Prioriteit 4**~~ — **achterhaald, zie hieronder.**

> **Update 13 augustus 2026.** Dennis heeft besloten dat K2 op **P2, P3 én P4** komt. De uitwerking daarvan — inclusief de scheiding tussen *vermelding* (P2/P3/P4) en *commissie* (alleen P4) die de positionering heel houdt — staat in een eigen document: [`BESLUIT_BEWEGING_AANBIEDERS_P2_P4_V1_2026-08.md`](./BESLUIT_BEWEGING_AANBIEDERS_P2_P4_V1_2026-08.md). §D hieronder blijft staan als de analyse die aan dat besluit voorafging; waar §D en het aanbiedersdocument botsen, wint het aanbiedersdocument.

---

## C · K1 · Moment-koppeling — VOORSTEL, nu bouwbaar

### C1 · Wat het is

Op een geopende prioriteit staat naast de acties één koppelknop: **"Zet dit in mijn dag"**. Die opent de bestaande tijd-picker, schrijft een `agenda_blocks`-rij met `categoryId: "beweging"`, en zet `external_provider: null`. De rij verschijnt in de timeline op Mijn Dag.

Dat is alles. Geen nieuwe tabel, geen nieuw type, geen migratie.

### C2 · De ene ontwerpvraag: virtueel versus weggeschreven

v3.5 §G lockt dat de **dagstap** virtueel blijft (§A5). Dat lock moet blijven staan — de dagstap is één per dag, komt uit het programma, en wegschrijven zou hem bewerkbaar maken op een plek waar dat verboden is.

Een gekoppeld prioriteit-moment is **iets anders**: het is door de gebruiker zelf gezet, het is er niet elke dag, en het is bedoeld om verplaatst en verwijderd te kunnen worden. Dat is precies wat `source: "routine"` in `agenda_blocks` al betekent.

**LOCK-voorstel:** *de dagstap blijft virtueel; een gekoppeld prioriteit-moment is een gewone routine-rij.* Twee dingen, twee mechanismen, geen uitzondering in de timeline.

### C3 · Per prioriteit — wat de knop doet

| Prioriteit | Moment-koppeling | Waarom |
|---|---|---|
| **P1** Dagelijks bewegen | ✅ ja | Terugkerend moment ("wandeling na de lunch") — het meest natuurlijke gebruik |
| **P2** Kracht + basisconditie | ✅ ja | Je krachtdagen vastzetten; dit is de kern van het programma |
| **P3** Progressief opbouwen | ✅ ja | Een opbouwmoment plannen |
| **P4** Specifiek sporten | ✅ ja | Je sportmoment |
| **P5** Geavanceerde training | ⚠️ mechanisme klaar, **knop uit** | v3.5: *"Hier staat bewust geen kaart"* — zie §C4 |
| **P6** Supplementen · wearables | ❌ nee | Categorie `supplementen` bestaat, maar P6 is gegate; een innamemoment plannen vóór de poort open is, omzeilt de poort |

### C4 · Waarom P5 het mechanisme wél en de knop niet krijgt

Je zei bij P5: *"misschien ook meenemen, later vullen met mogelijkheden."* Het mechanisme generiek bouwen kost niets extra — dat is het hele voordeel van één component. Maar de knop activeren op P5 botst met de v3.5-tekst *"Hier staat bewust geen kaart. We beoordelen pas wat we ook kunnen meten."*

**Advies:** bouw generiek, activeer P5 niet. Dat is een configuratieregel, geen code-wijziging, en het activeren wordt daarmee een expliciet besluit in plaats van een bijproduct.

### C5 · Compliance

Geen nieuwe verwerking: `agenda_blocks` bestaat, is account-gescoopt, RLS deny-all, service-role-only. Eén aandachtspunt, overgenomen uit het zitgedrag-document (§D4 daar): `agenda_blocks` valt buiten het **sessie-gescoopte** `cleanup_intake_session_linked_data()`. Vandaag onschuldig (zelf ingevoerde routines, cascade bij accountverwijdering) — maar leg vast dát het zo is, vóórdat er ooit iets gevoeligers in die tabel landt.

---

## D · K2 · Aanbieder-koppeling — VOORSTEL met een groot voorbehoud

### D1 · Eerst een conflict dat opgelost moet worden

Je vroeg om een aanbieder-koppeling op **P2, P3, P4 en P5**. De bestaande v3.5-canon (§F daar) zegt iets anders, en het is expliciet:

| Prioriteit | v3.5 zegt letterlijk |
|---|---|
| P2 Kracht + basisconditie | *"je basis — **hier oordelen we niet over**"* |
| P3 Progressief opbouwen | *"je programma, **geen product**"* |
| P4 Specifiek sporten | *"**lokale partners, mét oordeel**"* |
| P5 Geavanceerde training | *"ghost-kaarten, geen prijs, geen link"* |

Dit is geen detail. De ladder is zo gebouwd dat **de gratis basis gratis blijft en niemand er iets aan verdient**. P1 t/m P3 zijn de WHO-richtlijn en de Beweegrichtlijnen: dingen die iedereen zonder aankoop kan doen. Een trainer-aanbod op P2 hangen betekent: op de laag waar we zeggen *"dit is je fundament en het kost niets"* staat een commerciële deur.

Dat is precies wat een concurrent zou doen, en het is precies wat de Consumentenbond-positionering onmogelijk maakt. Het is dezelfde structuur als de verbinding-lock (*"Hier komt geen potje"*) en als de P6-poort.

**Advies — LOCK-voorstel:** *aanbieder-koppeling bestaat alleen op Prioriteit 4, en later eventueel op P5. Nooit op P1, P2 of P3.*

Dat is geen beperking van je idee, het is de plaatsing ervan: P4 is *"specifiek sporten — een sport die je zelf kiest"*, en dáár is een lokale aanbieder een echte dienst in plaats van een verkocht fundament. v3.5 had die plek al voor je gereserveerd.

Als je hier anders over beslist, is dat legitiem — maar het is een wijziging van de positionering, niet van een scherm, en dan moet v3.5 §F herschreven worden vóór er code komt.

> **BESLIST 13 augustus 2026 — dit advies is verworpen.** K2 komt op P2, P3 en P4. De grens loopt niet langs de vermelding maar langs het geld: op P2 en P3 mag een aanbieder staan mét oordeel en **zonder** commissie, op P4 mag commissie lopen. v3.5 §F is dienovereenkomstig herschreven. Twee dingen die de analyse hierboven miste en die het besluit ondersteunen: de twee bestaande `Partner · lokaal`-kaarten (*PT-intake*, *Krachtgroep 45+*) zijn inhoudelijk **kracht** en stonden alleen op P4 omdat P4 de enige toegestane plek was; en `PROEF` §4 levert met *"waar commissie nog niet loopt, komt ze pas ná het oordeel"* al de formulering waarmee een onbetaalde vermelding op P2/P3 afdwingbaar is. Volledige uitwerking: [`BESLUIT_BEWEGING_AANBIEDERS_P2_P4_V1`](./BESLUIT_BEWEGING_AANBIEDERS_P2_P4_V1_2026-08.md).

### D2 · De naamgevingsval — dit wordt een vierde "affiliate"

`CLAUDE.md` waarschuwt expliciet dat drie dingen niet verward mogen worden: `affiliate_clicks` (uitgaande merchant-kliks) ≠ `pd_partners` (upstream partners) ≠ `af_affiliates` (eigen programma). Een lokale-aanbiedersdirectory wordt de **vierde**, en zonder besluit vooraf komt hij in de verkeerde tabel terecht.

**Voorstel — splits de relatie van de vermelding:**

| Laag | Waar | Waarom |
|---|---|---|
| **Commerciële relatie** (contract, commissieregel, contactpersoon, tijdlijn) | **hergebruik `pd_*`** | Een sportschool die per lead betaalt, ís een upstream partner. PartnerDesk doet dossier, contracten en commissieresolutie al — dat niet opnieuw bouwen |
| **Publieke vermelding** (locatie, omschrijving, oordeel, beschikbaarheid) | **nieuwe tabel** | Geo, redactioneel oordeel en consumentzichtbaarheid bestaan nergens in `pd_*`, en `pd_*` is admin-only |

Wat je daarmee vermijdt: een tweede commissie-grootboek naast de twee die er al zijn.

### D3 · De kostenpost die dit besluit bepaalt

`PROEF_BEWEGING_SCHAP_INHOUD_2026-08.md` §7 vraagt om registratie van **zoektijd en oordeeltijd per optie**, en het statusverdict zegt daarover: *"dat cijfer is het jaarbudget van de redactie."* Die proef is nog steeds niet uitgevoerd (statusverdict §F.1) en blokkeert het schap (slice 11).

Een aanbiedersdirectory is dezelfde vraag, maar dan met een veel groter grondvlak: het schap heeft acht opties, een landelijke directory van sportscholen en trainers heeft er honderden — elk met een oordeel dat onderhouden moet worden, want een oordeel van twee jaar oud over een sportschool die van eigenaar wisselde, is erger dan geen oordeel.

**Dat is het echte argument om K2 uit te stellen — niet de bouwtijd, maar de doorlopende redactielast.** En het is toetsbaar met een proef die al ontworpen is: doe de bestaande PROEF eerst met acht opties, meet de oordeeltijd, en vermenigvuldig.

### D4 · Compliance-punten die vaak vergeten worden

- **Oordelen over bedrijven.** Een publiek verdict over een aanwijsbare onderneming is een uitspraak met juridische scherpte. Vereist: bronvermelding, feitelijke basis, dateerbaarheid, en een correctieprocedure. Zonder dat is het een risico, geen moat.
- **Eenmanszaken zijn personen.** Een zelfstandige trainer is een natuurlijk persoon; zijn bedrijfsgegevens zijn deels persoonsgegevens. AVG-informatieplicht en correctierecht gelden.
- **Locatie van de gebruiker.** Zodra je "bij jou in de buurt" toont, verwerk je een locatie-indicatie. Postcode-op-vier-cijfers (zoals de v3.5-prebuild al doet) is de minimale variant; die keuze bewust vastleggen, niet impliciet laten ontstaan.
- **Geen lead-generatie op een gemeten waarde.** Dezelfde lock als in het zitgedrag-document (§E3 daar): een aanbieder mag nooit worden getoond *omdat* iemands score laag is.

---

## E · Prioriteit 6 · Het EFSA-kader — nu bouwbaar, met één correctie

### E1 · Wat er al staat

De **dubbele poort** bestaat en werkt: `source === "beweegcheck" && nutritionLogCompleted` ([VoortgangDomeinScreen.tsx:104-105](../../src/components/dashboard/voortgang/VoortgangDomeinScreen.tsx#L104)). De claim-registry bestaat met thresholds en condities: `creatine.performance` (bij 3 g/dag) en `creatine.strength-55plus` ([approved-claims.ts:324](../../src/data/approved-claims.ts#L324)).

Wat ontbreekt is alleen het **kader-tekstblok** uit v3.5 §F: de uitleg in gewone taal achter de dichte deur.

### E2 · ✅ AFGEHANDELD — de cafeïne-claim was fout en is eruit

De v3.5-prebuild schreef bij Prioriteit 6:

> *"De EFSA-goedgekeurde claims voor creatine **en cafeïne** gelden bovenop training, niet in plaats daarvan."*

**Dat was onjuist.** Geverifieerd op 13 augustus 2026:

- **Er is geen toegestane EU-gezondheidsclaim voor cafeïne.** EFSA gaf in 2011 positieve adviezen over cafeïne en uithoudingsprestatie, uithoudingsvermogen, alertheid en concentratie. De Commissie stelde een verordening op om vier van die claims te autoriseren, maar het **Europees Parlement heeft die in juli 2016 met een motie geblokkeerd** (rapporteur Schaldemose, in het debat over energiedrankjes). De Commissie trok het voorstel in. Sindsdien zijn cafeïne-claims niet geautoriseerd, en de tijdelijke on-hold-status geldt voor de meeste ervan ook niet meer. Een positief EFSA-advies is geen claim — pas autorisatie door de Commissie maakt er een.
- **Onze eigen registry had gelijk:** `approved-claims.ts` kent alleen magnesium, EPA/DHA, DHA, vitamine D, zink en creatine als `ClaimNutrient`. Cafeïne stond er nooit in, en hoort er ook niet in.

Er stond dus een verboden claim in precies het blok dat over claim-naleving gaat. **Doorgevoerd in de prebuild** (`beweging-keuze-consumentenbond-prebuild-v3.5-2026-08.html`, `PRIORITIES[6]`): cafeïne is uit `kern`, uit `scope` en uit `src` verwijderd.

Nieuwe `src`-regel, en de langere kader-copy voor het P6-blok:

> Voor creatine bestaat een toegestane claim, en die geldt **bovenop** training: het effect is beschreven in combinatie met weerstandstraining, niet in plaats daarvan. Voor de meeste andere middelen in deze categorie bestaat helemaal geen toegestane claim. Daarom staat deze deur dicht tot je voedingscheck en je hertest er zijn — een supplement dicht een gat, en zonder te weten waar dat gat zit, is aanvullen gokken.

**Lock die hieruit volgt:** noem in beweeg-copy nooit een middel als "EFSA-goedgekeurd" zonder dat het als `ClaimNutrient` in `approved-claims.ts` staat. De registry is de bron; de copy is de afgeleide, nooit andersom.

### E3 · Kosten

Klein: één tekstblok, één verificatieslag, geen nieuwe logica. Dit is de goedkoopste van alle punten in beide documenten en kan mee in R1b/R2.

---

## F · Data & engine

| Onderdeel | K1 (moment) | K2 (aanbieder) |
|---|---|---|
| Tabel | `agenda_blocks` — **bestaat** | nieuw (vermelding) + `pd_*` (relatie) |
| Migratie | **geen** | ja |
| Nieuwe types | geen — `CreateAgendaBlockInput` volstaat | ja |
| `external_provider` | `null` (eigen moment) | provider-id — **eerste schrijver ooit** |
| Component | één `PrioriteitKoppelKnop`, alle zes prioriteiten | eigen surface |
| Configuratie | per prioriteit aan/uit (§C3) | vermelding P2–P4, commissie alleen P4 |
| Consent | geen nieuwe | locatie-indicatie vastleggen |

**Eén lock voor de eerste schrijver van `external_provider`:** wie dat veld als eerste vult, legt de betekenis vast voor calendars, wearables én aanbieders. Leg het naamgevingspatroon expliciet vast (voorstel: dezelfde `{soort}:{slug}`-vorm die `nutrientFromActionKey` al gebruikt voor `voeding:<nutrient>:<slug>`, [step-sourcing.ts:44](../../src/lib/step-sourcing.ts#L44)) — niet opnieuw bedenken.

---

## G · Meetpunten

| Event | Koppeling | Payload | Hier lees je aan af |
|---|---|---|---|
| `movement_priority_moment_linked` | K1 | `{ priority, has_time }` | Of mensen prioriteiten überhaupt in hun dag zetten — de kernvraag van K1 |
| `movement_priority_moment_completed` | K1 | `{ priority }` | Of een gepland moment ook gebeurt. Dit is het echte succescriterium |
| `dashboard.agenda_domain_link_click` | K1 | `{ domain, to }` | bestaat al in v3.5 §H — hergebruiken |
| `choice.provider_viewed` | K2 | `{ priority, provider_kind, monetised }` | pas relevant ná de proef — volledige set in het aanbiedersdocument §I |

**Kill-criterium voor K2, expliciet:** blijft `movement_priority_moment_linked` op P4 laag over een volledig venster van twee weken, dan zetten mensen hun sportmoment niet eens zelf vast — en dan is een aanbiedersdirectory een oplossing voor een stap die niemand zet. Meet K1 vóór je K2 overweegt.

**Meetpunt bij oplevering:** `movement_priority_moment_linked` tegenover `movement_priority_moment_completed` — daar lees je af of koppelen tot doen leidt of alleen tot plannen.

---

## H · Copy-lock

**Verboden in gerenderde tekst, aria-labels en eyebrows** (bovenop de v3.5 §J-lijst, die ook `Laag N` bevat):
aanbevolen voor jou · partner (als kwaliteitskeurmerk) · gecertificeerd (tenzij aantoonbaar) · "de beste trainer bij jou in de buurt" · elke prijs vóór het oordeel · elk aanbod op P1, P2 of P3.

**Toegestaan:** "Zet dit in mijn dag" · "Prioriteit N" · het oordeel mét datum en bron · commissie-microcopy **ná** het oordeel (v3.5 §F).

---

## I · Bouwvolgorde

| Slice | Inhoud | Afhankelijk van | Kosten |
|---|---|---|---|
| **K1a** | `PrioriteitKoppelKnop` generiek + `agenda_blocks`-schrijver + P1–P4 aan, P5/P6 uit | ladder-data (R2) | **S/M** |
| **K1b** | Terugkerende momenten (wekelijks herhalen) | K1a | **M** |
| **E1** | EFSA-kaderblok op P6 + cafeïne-verificatie | geen | **S** |
| **P0** | **POORT** — bestaande PROEF uitvoeren, oordeeltijd meten | Dennis | **M**, redactie |
| **K2a** | Besluit datamodel + positionering (§D1, §D2) | P0 | **S** besluit |
| **K2b** | Aanbieder-vermelding op P2–P4 — slices A0–A6 in het aanbiedersdocument | K2a | **L** |

E1 kan vandaag. K1a hangt aan de ladder-data uit R2 en is daarna klein. K2 hangt aan een proef die al ontworpen is en al maanden wacht.

---

## J · Open besluiten voor Dennis — vier

**J1 · ~~Bevestig of verwerp de P2/P3-beperking~~ — BESLIST 13 aug (§D1).**
Dennis kiest P2, P3 en P4. Uitgevoerd in [`BESLUIT_BEWEGING_AANBIEDERS_P2_P4_V1`](./BESLUIT_BEWEGING_AANBIEDERS_P2_P4_V1_2026-08.md), met de commissiegrens op P4 en v3.5 §F herschreven. De vier vervolgbesluiten staan daar in §L.

**J2 · Gaat K1 generiek, met P5 uit?**
**Advies: ja.** Eén component voor zes prioriteiten kost hetzelfde als één voor vier, en P5 activeren wordt daarmee later een configuratieregel in plaats van nieuw werk.

**J3 · Wanneer voeren we de PROEF uit — of parken we hem expliciet?**
Dit stond al als actie 5 in het statusverdict van 11 augustus en is nog steeds open. Hij blokkeert nu **twee** dingen: het schap (slice 11) én de aanbiedersdirectory (K2). **Advies: zet een datum of park hem hardop.** Stil doorschuiven is inmiddels een besluit dat niemand genomen heeft, en het wordt met dit document duurder.

**J4 · ~~Verifieer de cafeïne-claim~~ — GESLOTEN 13 aug (§E2).**
Geverifieerd: het Europees Parlement blokkeerde in juli 2016 de autorisatie van de vier cafeïne-claims; er is geen toegestane EU-claim. Cafeïne is uit `PRIORITIES[6]` van de v3.5-prebuild verwijderd. Geen actie meer open.

---

## K · Bronnen

- Intern: `docs/design/BESLUIT_BEWEGING_PRIORITEITEN_V35_2026-08.md` §F, §G, §J · `docs/design/PROEF_BEWEGING_SCHAP_INHOUD_2026-08.md` §7, §10 · `docs/cursors/opus-beweging-status-verdict-slices-1-16-2026-08.md` §F, §N · `docs/plan/PRODUCTVISIE_AFFILIATE_PLATFORM.md` · `docs/plan/ONTWERP_BEWEEGCOCKPIT_COMMANDOCENTRUM.md` · `docs/core/COMPLIANCE.md` · `CLAUDE.md` (naamgeving affiliate-begrippen)
- EU-claimsregister (Verordening 1924/2006 / 432/2012) — cafeïne-status geverifieerd 13 aug, §E2. Parlementaire blokkade juli 2016: [nutraingredients, *MEPs block 4 caffeine claims*](https://www.nutraingredients.com/Article/2016/07/07/MEPs-block-4-caffeine-claims) · [EFSA-adviezen en afwijzing RPE-claim](https://www.nutraingredients.com/Article/2014/02/20/EFSA-rejects-caffeine-alertness-and-sterol-cholesterol-claims/) · [marktanalyse ongereguleerde cafeïne-claims (MDPI 2024)](https://www.mdpi.com/2504-3900/109/1/20)
- Code: `src/types/agenda.ts` · `supabase/migrations/20260718160000_agenda_blocks.sql` · `src/lib/agenda-blocks.ts` · `src/data/approved-claims.ts`
