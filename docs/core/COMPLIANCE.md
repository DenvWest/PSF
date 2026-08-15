# COMPLIANCE — PerfectSupplement

> **Layer 1 — Core.** Juridische regels die op ELKE pagina gelden.

---

## Kernregel

PerfectSupplement vergelijkt en adviseert, maar verkoopt niet. Toch geldt de Claimsverordening (EU 1924/2006) omdat affiliate links als reclame tellen.

**Geen medische claims — altijd "adviezen, geen diagnoses".**

### Structurele leefstijl-eerst invariant (nurture + intake)

Elke output met een supplement-suggestie bevat minstens één leefstijl-quick-win uit een **ander domein** dan het supplement-domein. Dit geldt op het intake-scherm (`getAdvice`) én in nurture-mails (dag 14/21). Doel: geen kale supplementlijst zonder leefstijl-hefboom — conform "leefstijl eerst" positionering.

---

## EFSA-goedgekeurde claims per supplement

### Magnesium ✅
- Draagt bij tot de normale werking van het zenuwstelsel
- Draagt bij tot de normale spierfunctie
- Draagt bij tot de vermindering van vermoeidheid
- Draagt bij tot een normale psychologische functie
- *Voorwaarde: minimaal 56,25 mg per dagdosis (15% RI)*

### EPA/DHA — Omega-3 ✅
- EPA en DHA dragen bij tot de normale werking van het hart *(bij 250 mg EPA+DHA/dag)*
- DHA draagt bij tot normale hersenfunctie *(bij 250 mg DHA/dag)*
- DHA draagt bij tot normaal gezichtsvermogen *(bij 250 mg DHA/dag)*
- **Geen goedgekeurde claim voor "energie" of "vermoeidheid"**

### Vitamine D ✅
- Draagt bij tot normale werking van het immuunsysteem
- Draagt bij tot instandhouding van normale botten
- Draagt bij tot instandhouding van normale spierfunctie

### Zink ✅
- Draagt bij tot een normale werking van het immuunsysteem
- Draagt bij tot instandhouding van normaal testosterongehalte in het bloed
- Draagt bij tot een normale vruchtbaarheid en voortplanting

### Creatine ✅
- Creatine verhoogt de fysieke prestatie bij opeenvolgende korte, intensieve inspanningen *(bij 3g/dag)*

### Melatonine 🚫 GEEN AFFILIATE / GEEN INTERVENTIE
- Status in `approved-claims.ts`: `forbidden`, `comparisonPath: null`
- Boven 0,3 mg = geneesmiddel (IGJ); onder 0,3 mg mag geen gezondheidsclaim als supplement
- **Geen** `/beste/melatonine`, geen intake-supplementroute, geen tier-3 PLAN-interventie
- **Wel:** informatieve content (`/supplementen/melatonine`, `/kennisbank/melatonine`, blogs) zonder koop-CTA

### Ashwagandha ⚠️ ON-HOLD
- Geen goedgekeurde EFSA-claim. Alle claims staan "on hold" (botanicals)
- On-hold claims mogen voorlopig gebruikt worden mits: claim is ingediend bij EFSA, onderbouwing aannemelijk, disclaimer aanwezig
- **Risico:** VWS overweegt verbod in NL (RIVM-advies, besluit verwacht medio 2026). Denemarken heeft verboden sinds april 2023.
- **Uitgesloten van Foundation Stack** — geen EFSA approval, regulatory risk

## Claim-regels voor code

| Situatie | Regel |
|---|---|
| Vergelijkingspagina's | EFSA-bewoording letterlijk of in alternatieve bewoording, juiste ingredient + dosering |
| Intake-resultaten | "Overweeg magnesium" = advies, geen diagnose. Taal binnen EFSA-kaders |
| Blogposts | Fysiologie is OK, maar zodra een supplement als oplossing wordt genoemd → EFSA-regels |
| On-hold claims | Altijd met disclaimer: "Dit is geen goedgekeurde gezondheidsclaim" |
| EFSA-tekst in code | **Letterlijk bewaren** — niet herschrijven bij refactoring |
| Inname vs status | **Inname-inschatting MAG** ("op basis van je voeding krijg je waarschijnlijk te weinig magnesium binnen"). **Statusclaim/diagnose MAG NIET** ("je hebt een magnesiumtekort" — vereist meting, buiten scope). Geldt voor alle intake-output én engine-copy |

---

## Verbinding — geen schap, structureel

> Bron: [`docs/design/BESLUIT_VERBINDING_PIRAMIDE_V1_2026-08.md`](../design/BESLUIT_VERBINDING_PIRAMIDE_V1_2026-08.md) §C1–C7 en §I. Verbinding heeft van de zes domeinen het hoogste compliancerisico: de constructen grenzen aan mentale gezondheid, de bruikbare meetinstrumenten zijn juridisch niet vrij, en er valt niets te verkopen.

### Geen claim, dus geen schap

Er bestaat **geen EFSA-goedgekeurde claim die een voedingsstof koppelt aan sociaal contact of verbondenheid.** De claim die daar het dichtst bij in de buurt lijkt te komen — magnesium *"Draagt bij tot een normale psychologische functie"* (`approved-claims.ts`) — gaat over de werking van het zenuwstelsel, niet over relaties. Die claim hier inzetten is een claimovertreding, geen grensgeval.

**Lock:** in het verbinding-domein — check-in, readout, prioriteitenladder, plan, inzichten — komt **nooit** een supplement, merk, prijs, productkaart of vergelijk-link. Bij slaap en voeding is de bovenste laag "aanvullen & vergelijken"; **bij verbinding bestaat die laag niet.** De bovenste laag is "volgen & bijsturen" en de copy weigert expliciet:

> *Hier komt geen potje. Er is geen supplement dat contact vervangt, en geen goedgekeurde claim die dat suggereert.*

Dat is geen omzetverlies maar het scherpste Consumentenbond-signaal dat we kunnen afgeven — op precies de plek waar een concurrent wél een pot magnesium zou neerzetten. Verbinding is commercieel een vertrouwens- en retentiedomein, geen conversiedomein; dat hoort in de businessverwachting te staan vóór er gebouwd wordt.

Twee afgeleiden van dezelfde lock:

- **Geen nurture, e-mail of upsell op een laag verbinding-antwoord.** `nurture-content.ts` en `resolve-nurture-cta.ts` mogen niet dóór een verbinding-antwoord worden geselecteerd. Een automatische mail over sociaal contact naar iemand die net invulde weinig mensen te hebben, is functie-creep (DPIA R4/R8) en commercieel gebruik van het gevoeligste gegeven dat we hebben.
- **Geen gevalideerd instrument letterlijk overnemen.** De Jong Gierveld (alleen vrijgegeven voor wetenschappelijk onderzoek), UCLA-3, LSNS-6 en de SDT/BPNS-subschaal hebben geen vrije commerciële licentie — ook niet "geïnspireerd op" met bijna-identieke formuleringen. Wij bouwen eigen items in eigen stem; de literatuur is onderbouwing in `leefstijlcheck-evidence.ts`, geen itembron.

### Geen klinische vorm (MDR-grens)

Software voor leefstijl- en welzijnsdoeleinden is geen medisch hulpmiddel (Verordening 2017/745, MDCG 2019-11 rev. 1); software die informatie levert voor diagnose of behandeling wél. De grens loopt bij het beoogde doel en bij hoe de output zich presenteert.

| | |
|---|---|
| **Verboden** | Elke afkapwaarde of categorie uit een gevalideerde schaal (somscore, `< 12`, "sterk/enigszins" een toestand). Elk woord dat een toestand benoemt in plaats van gedrag. Elke screeningvraag over stemming, hopeloosheid, zelfbeschadiging of suïcidaliteit — **geen PHQ, geen GAD, geen enkel item daaruit.** Elke individuele risico-uitspraak op basis van populatiecijfers ("dit verhoogt jouw sterfterisico"). |
| **Toegestaan** | Gedragsfeiten en frequenties uit eigen antwoorden, letterlijk teruggegeven. Populatie-uitspraken mét bron en expliciet als populatieverband gelabeld. Eigen-oordeelvragen over toereikendheid ("is dit genoeg voor jou?") — het antwoord komt van de gebruiker, niet van ons. |

**De vangnetregel** staat niet-conditioneel op élke toestand van het verbinding-oppervlak, ook bij "dit past je" en bij de lege staat (`CONNECTION_SAFETY_NET_LINE`):

> *Loopt dit verder dan een druk leven — voel je je langere tijd niet goed — dan is je huisarts het juiste startpunt. Deze check meet leefstijl, geen klachten.*

Een regel die alleen bij een laag antwoord verschijnt, is zelf een beoordeling. Altijd-zichtbaar is informatie; conditioneel-zichtbaar is een oordeel — dezelfde logica als `urgency_level` niet user-facing maken.

Bij het laagste antwoord op het anker-item krimpt het aanbod naar **één** actie en verdwijnt elke "verder"-copy — het `railSingleAction`-patroon uit `docs/design/voeding-piramide-prebuild-v1-2026-08.html` (staat F3). Minder aanbod, niet meer. Dit is de enige conditionele reactie, en hij hangt aan gedrag, niet aan een toestandsoordeel.

### Kill-lijst — verboden in gerenderde tekst, aria-labels en eyebrows

Deze woorden mogen niet in verbinding-copy staan; ze staan hier alleen als controlelijst.

`eenzaam` · `eenzaamheid` · `isolatie` · `sociaal geïsoleerd` · `teruggetrokken` · `depressief` · `sociale angst` · `netwerk` (als score) · `"sterk/enigszins eenzaam"` · elke somscore of afkapwaarde · `"je hebt te weinig vrienden"` · `"Laag N"` / `"Prioriteit N"` als ordinaal boven de laagnaam · `stappenplan` · `route` · `fase` · `spoor` · `categorie` · `cockpit` · `biohack` · pijl als richtingsteken · `eindelijk` / `gelukkig` / `helaas` · elk supplement, merk, prijs of vergelijk-link.

**Toegestaan:** de zes laagnamen · "contact" · "steun" · "iemand op wie je kunt terugvallen" · letterlijke antwoordlabels · "hier ligt je winst" · een populatiecijfer mét bron en mét het woord populatie.

Vraagontwerp: vragen gaan over **de afgelopen twee weken** en over **gedrag**, elke vraag heeft een antwoordoptie die geen probleem is, en de zelf-kalibratievraag (`CON_FIT`) komt vóór de readout — weinig contact dat voor jou klopt, is géén aandachtspunt.

### Connection Profile is geen gezondheidsdata

Twee dingen met "connection" in de naam, twee volledig gescheiden regimes. Knoop ze nooit aan elkaar.

| | `CON_*` — de check | `cprofile_*` — het profiel |
|---|---|---|
| Wat | `CON_SOC` e.a.: contactritme, initiatief, ervaren steun; `connection_score`; `intake_domain_checkin` | zelf aangetikte onderwerpen, activiteiten, contactvorm, beschikbaarheid, postcodegebied (PC2), leeftijdsband |
| Regime | **art. 9** — gezondheidsgegevens, uitdrukkelijke toestemming | **art. 6** — gewone persoonsgegevens |
| Toestemming | `domain_checkin_logging` | `connection_profile_storage`, los intrekbaar zonder de leefstijlcheck te raken |
| Mag sturen | de leefstijlcheck en haar output | personalisatie, en later verbinding tussen gebruikers |

De grens uit [`BESLUIT_CONNECTION_PROFILE_V1_2026-08.md`](../design/BESLUIT_CONNECTION_PROFILE_V1_2026-08.md) §7 — **A bepaalt, B rangschikt, C blijft buiten** — is in vier maatregelen vastgelegd, waarvan drie afdwingbaar:

1. Aparte tabellen `cprofile_*`, zonder kolom, view of FK naar `intake_sessions`, `intake_domain_checkin` of `domain_scores`.
2. Aparte module `src/lib/connection-profile/`, die `@/lib/intake-engine`, `@/lib/account-dashboard` en `@/lib/vitaliteit` niet mag importeren.
3. `src/lib/connection-profile/__tests__/firewall.test.ts` bewaakt dat — de enige maatregel die overleeft als iemand hier over een jaar "even snel" iets aan koppelt.
4. Eigen toestemmingstekst en eigen `consent_records`-rij.

`account_id` is wél gedeeld: het is dezelfde ingelogde persoon, dus die koppeling is noodzakelijk en onschadelijk. Juist daarom is maatregel 3 nodig — de join is technisch mogelijk en moet in code verboden blijven.

Twee losse regels die hierbij horen: de woordenlijst-tag `gezondheid_leefstijl` is een onderwerpvoorkeur en mag nergens als gezondheidssignaal worden gelezen. En het optionele notitieveld (≤140 tekens) is nooit matchbaar, nooit zichtbaar voor anderen en komt nooit in een event, GA4 of Clarity.

---

## AVG / Privacy

- Geen account-systeem (drempel te hoog, e-mail volstaat)
- Consent management op elke pagina met cookie-opslag
- Unsubscribe flow in elke nurture email
- Analytics anonymization
- Tracking disclosure: transparant over wat wordt opgeslagen
- E-mail permissions: opt-in bij intake completion

## Affiliate disclosure

- Op elke vergelijkingspagina: zichtbare affiliate-disclaimer
- Affiliate links: `rel="noopener noreferrer sponsored"`
- Affiliate links NOOIT in blogposts, alleen op vergelijkingspagina's

## Medische disclaimers

- `MedicalDisclaimer` component op alle vergelijkings- en profielpagina's
- Profiel-specifieke disclaimers waar relevant (zie `core/PERSONALIZATION_ENGINE.md`)
- "Dit is geen medisch advies" — altijd

---

*Laatst bijgewerkt: 15 augustus 2026 — sectie Verbinding toegevoegd (schap-lock, MDR-grens, kill-lijst, `CON_*` vs `cprofile_*`).*
