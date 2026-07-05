# PerfectSupplement — Moat, Google-vindbaarheid, AI-kopie & premium-tier — 5 juli 2026

> **Layer 3 — Strategie/besluitlog.** Hoe de gratis kennislaag onderscheidend blijft terwijl een deel
> Google-vindbaar móet zijn — en wat er NU met de tier 2–3 "premium kennisbank" moet gebeuren.
> Geen code — besluiten, ringmodel, tier-scenario's, 30-dagen playbook. Loopt naast
> `fable-inzichten-strategie-2026-07.md` (Poorten 1–7) en verwijst ernaar; dupliceert niets.
> Alles geverifieerd tegen de code op 2026-07-05.

---

## 1. Executive summary

1. **De winnende strategie is de hybride (C): publiek teaser + gated diepte + dynamische assemblage.** De IA is daar al op gebouwd (twee sporen, additieve personalisatie) — maar ring 2 lekt vandaag volledig.
2. **Het moat-lek is erger dan vermoed:** alle 18 tier 2–3 begrippen zijn niet alleen publiek op `/kennisbank/[slug]` (`src/app/kennisbank/[slug]/page.tsx:73-77`, geen gate, geen noindex), ze staan ook actief in de sitemap (`src/app/sitemap.ts:74-77`). De "gate" bestaat alleen op `/inzichten?kennisbank=premium`. De upsell-copy ("beschikbaar voor account-houders", `InzichtenPremiumKennisbankUpsell.tsx:17-19`) is daarmee feitelijk onwaar.
3. **Tegen Google-scraping én AI-prompts beschermt geen enkele tekst-maatregel.** Statische content is per definitie kopieerbaar; de verdediging is merk (uitsluitingen als handtekening), de lus (check → herordening → hermeting) en data die een concurrent legaal niet kan krijgen (art. 9-consent-barrière). Geheimhouding is alleen zinvol voor de engine — en die is al backstage (`BRAND_POSITIONING.md` §4).
4. **Premium-tier advies:** teaser+gate. `whatIsIt` publiek (SEO + eerlijke teaser), `howItWorks`/`whyItMatters`/referenties achter gratis account voor tier ≥2. Sitemap-entries blijven. Naam wordt overal "Verdieping na je check" — gratis, expliciet géén Plus. Melatonine blijft als enige tier-3 volledig publiek (handtekening-content).
5. **Grootste moat-investering is niet gating maar de weaving-consumer** (strategiedoc F5 wk 2): een gated laag die statisch blijft is verstopte content; pas als hij per bezoeker anders is, is hij onkopieerbaar.

---

## 2. Ring 1/2/3 matrix — de kern

| | **RING 1 — Publiek** | **RING 2 — Gratis na check** | **RING 3 — Dynamisch + backstage** |
|---|---|---|---|
| **Inhoud** | Tier-1 begrippen (6: biobeschikbaarheid, chelaatvorm, adh, efsa-claims, derde-partij-testen, healthspan) · 29 blogartikelen · domein-hubs · `/beste/*` · methodologie · uitsluitingen (melatonine, ashwagandha, omega-3-energie) · profielpagina's · `/inzichten`-hub anoniem | Tier 2 (9: o.a. circadiaan-ritme, slaaphygiene, eiwitbehoefte-na-40, hpa-as, slaapschuld) + tier 3 (9: o.a. cortisol, testosteron, vitamine-d, magnesiumvormen, adaptogens) · "Verdieping na je check"-feed op `/inzichten` | Herordening (`orderedPillarIds`), "Speelt voor jou nu", profiellabel, ContextStrip, Aanpak-prioriteit · backstage: scoring-gewichten, K1–K3 interactieregels, triggers, nurture-timing, CTA-resolver, taxonomie-prioriteit |
| **Vandaag WEL/NIET** | **WEL** — maar zwak ontsloten: `/inzichten` niet in sitemap, nav login-gated (`HeaderClient.tsx:97-98`); content scheef (3 domeinen vrijwel leeg) | **NIET** — bestaat alleen als UI-laag op `/inzichten` (`page.tsx:139-145`); de route `/kennisbank/[slug]` is voor alle tiers publiek én geïndexeerd | **DEELS** — herordening + ContextStrip + prioriteits-feed live (`inzichten-visitor-context.ts:10-22`); weaving 4/55 getagd, **0 consumers**; taxonomie 0 consumers; engine goed backstage |
| **Google-vindbaar?** | Ja (bedoeld) — behalve `/inzichten` zelf (sitemap-gat) | **Ja (onbedoeld)** — alle 24 begrippen in sitemap, canonical, DefinedTerm-schema | Nee — dashboard is noindex (`dashboard/page.tsx:10-15`); personalisatie vereist account-cookie; crawler ziet de generieke hub |
| **AI-prompt-kopieerbaar?** | 100% — vorm, toon, structuur en tekst zijn scrape- en RAG-baar | Vandaag 100% (want publiek). Na gating: alleen via account-aanmaak (frictie, geen bescherming tegen gemotiveerde concurrent) | Tekst niet scrapbaar. Reverse-engineering alleen via gedrag (vragen zijn observeerbaar door de check te doen; gewichten/triggers niet). Duur, onnauwkeurig, en zonder jouw data niet valideerbaar |
| **Juridische grondslag** | Auteursrecht op tekst (beschermt tegen 1:1-kopie, niet tegen parafrase/AI-training) · Claimsverordening 1924/2006 geldt (affiliate = reclame) · leefstijladvies = vrij beroep | Zelfde als ring 1 zolang publiek. Na gating: begin van "redelijke maatregelen" (Wet bescherming bedrijfsgeheimen vereist die om überhaupt iets als geheim te claimen) | Bedrijfsgeheim (mits redelijke maatregelen — documenteer dat engine-docs intern zijn) · art. 9 AVG: expliciete consent = legale barrière die een concurrent niet kan omzeilen |
| **Doel** | Acquisitie + vertrouwen ("Consumentenbond-handtekening") | Waarde na conversie, switching cost, reden voor account | De echte moat: personalisatie die alleen bestaat mét jouw data |
| **Aanbeveling NU** | Uitbreiden en harder ontsluiten: `/inzichten` in sitemap; 4–6 handtekening-stukken bewust publiek promoten; content-gap voeding/beweging dichten (strategiedoc F5) | **Teaser+gate bouwen** (scenario 2, §D): `whatIsIt` publiek, diepte + referenties account-gated; sitemap behouden; upsell-copy "gratis — geen Plus" | Eerste weaving-consumer bouwen (F5 wk 2) — een moat die niemand ervaart is geen moat; engine-bescherming formaliseren (interne docs labelen) |

**De ene zin die alles samenvat:** ring 1 wint bezoekers, ring 2 wint accounts, ring 3 wint terugkeer — en alleen ring 3 is onkopieerbaar, dus ring 1 en 2 moeten zo snel mogelijk naar ring 3 dóórverwijzen in plaats van zelf de waarde te dragen.

---

## 3A. Drie ringen — toelichting per ring

### Ring 1 — bescherming via merk, niet via geheimhouding

Alles in ring 1 is per definitie kopieerbaar; dat accepteer je. De bescherming zit in drie dingen die niet mee-kopiëren:

1. **De afzender.** "Waarom wij melatonine niet verkopen" is als tekst waardeloos voor een kopieerder: een supplement-verkoper kan het niet overnemen zonder omzet op te geven, en een AI-kloon zonder historie is als afzender ongeloofwaardig. Uitsluitingen zijn de enige content-categorie die duurder is om te *zijn* dan om te *zeggen* — daarom zijn ze de handtekening.
2. **De klik-bestemming.** Elke ring-1 pagina eindigt in de check. De kopieerder kan het artikel meenemen, niet de lus erachter.
3. **NL-regulatoire actualiteit.** VWS-ashwagandha-besluit (verwacht medio 2026), EFSA-wijzigingen: wie dit als eerste correct duidt, wint freshness bij Google én veroudert elke AI-kopie (training-cutoff).

### Ring 2 — vandaag een belofte zonder slot

De constructie is precies andersom dan bedoeld: de *verwijzing* naar de begrippen is gated (premium-feed op `/inzichten` vereist context), de *begrippen zelf* zijn open. Een concurrent hoeft niet eens in te loggen — `site:perfectsupplement.nl/kennisbank` levert alles. En de best geschreven laag (tier 3: interventie/supplement-context, mét Vancouver-referenties per `kennisbank.ts:28-29`) is daarmee gratis RAG-voer.

Belangrijke nuance vóór je overcorrigeert: **de moat-waarde van gated statische tekst is beperkt.** Uitleg over cortisol staat overal op internet; wat een concurrent níet heeft is de koppeling "dit begrip, nú, omdat jouw check dit liet zien". Gating van ring 2 doet drie dingen — het maakt de bestaande upsell-belofte waar (geloofwaardigheid), het creëert een eerlijke account-reden (conversie), en het haalt je diepste laag uit de scrapers (frictie) — maar het is flankerend aan ring 3, geen vervanging.

### Ring 3 — live als shell, leeg als ervaring

De herordening werkt (`derivePersonalization` op scores + profiellabel), de premium-feed sorteert op prioriteit, de ContextStrip benoemt het profiel. Maar de metadata die de lus fijnmazig maakt (planPhase, gapSignal) heeft 4/55 slugs getagd en **nul lezers** (`insight-metadata.ts:9-28`; grep op `.planPhase`/`.gapSignal` buiten types/tests: 0 hits — bevestigd in strategiedoc F1). Reverse-engineering-risico is laag: de 15 intake-vragen zijn observeerbaar (iedereen kan de check doen), maar gewichten, domein-maxima, interactieregels en trigger-condities zijn niet af te leiden zonder duizenden sessies — en die data is art. 9-beschermd.

---

## 3B. Google-vindbaarheid vs onderscheid

**1. Wat MOET Google-vindbaar zijn (minimum viable SEO-laag):**
- `/beste/*` (monetisatie — hoogste prioriteit, staat goed)
- Domein-hubs + blogartikelen (acquisitie op symptoom-intents)
- Tier-1 begrippen + methodologie + uitsluitingen (E-E-A-T, merk)
- `/inzichten` zelf en de teasers van tier 2–3 (definitie-intents: cortisol, testosteron, vitamine-d zijn hoog-volume zoektermen — die de-indexeren is acquisitie weggooien)
- Profielpagina's (herkennings-intents, social-landingen)

**2. Wat MOET Google-onvindbaar zijn:**
- Dashboard en alles met sessie-context (staat: noindex ✓)
- De volledige diepte van tier ≥2 (vandaag: lekt ✗)
- Alles wat "uit jouw check" zegt — dat is geen URL maar assemblage, dus vanzelf onvindbaar zolang personalisatie account-gated blijft (staat ✓)
- Toekomstige q2-programma-content (betaald — vanzelfsprekend gated)

**3. Strategie A/B/C:** **C, zonder twijfel.** A ("alles achter login") doodt de acquisitie waar het hele conversieplan op drijft en botst met Poort 1 uit het strategiedoc (bevestigd: hybride). B ("alles publiek") is de huidige *feitelijke* situatie voor de kennisbank — en die maakt de premium-upsell tot loze belofte en elke geschreven letter tot concurrent-input. De IA is al C-vormig (twee sporen, additieve personalisatie op dezelfde URL's); het enige dat ontbreekt is dat ring 2 zich als ring 2 gedraagt.

**4. Content-split regel (morgen toepasbaar).** De kennisbank heeft de splitsing al in zijn datamodel — `whatIsIt` / `howItWorks` / `whyItMatters` (`kennisbank.ts:19-23`):

| Vraag over een stuk content | Ring | Regel |
|---|---|---|
| "Wat is het en waarom bestaat het?" — definitie, herkenning, waarom-wij-dit-niet-verkopen | **1 — publiek** | Altijd open. Dit wint de bezoeker en draagt het merk. |
| "Hoe werkt het en wat betekent het voor je keuze?" — mechanisme-diepte, doserings-/vormcontext, interventie-context, volledige referenties | **2 — gated (gratis account)** | Tier ≥2: alleen na check + login. De teaser (`whatIsIt`) blijft publiek. |
| "Wat betekent het voor JOU, nu?" — volgorde, prioriteit, fase-regel, delta sinds vorige check, 'uit jouw check'-duiding | **3 — nooit statische tekst** | Wordt nooit als artikel geschreven; alleen templates die de engine invult. Wie dit opschrijft, maakt ring 3 scrapbaar. |

Vuistregel bij elk nieuw stuk: *"Zou dit exact zo op de site van een concurrent kunnen staan zonder dat een lezer het verschil merkt?"* Ja → ring 1, en maak het waardevol als visitekaartje. Nee, want het verwijst naar de check/het profiel → ring 2 of 3.

---

## 3C. AI-prompt-kopieerbaarheid — aparte dreiging

### 1. Wat één prompt vandaag al kan

- **"Schrijf supplement-vergelijkingen zoals perfectsupplement.nl"** → levert vorm, toon en structuur in minuten. Wat het níet betrouwbaar levert: EFSA-letterlijkheid (hallucinatierisico), actuele NL-status (ashwagandha-besluit), en de consistente uitsluitings-lijn. Een kopie zal claims-fouten maken — maar dat voordeel bestaat alleen waar lezers of toezichthouders het verschil zien.
- **"Bouw een leefstijlcheck met 6 domeinen"** → het concept is generiek en juridisch onbeschermbaar; een werkende kloon staat er in een weekend. De vragen zelf zijn observeerbaar (check doen = vragen zien). Wat ontbreekt: scoring die klopt, profielen die herkend worden, en élke gebruiker.
- **Scraped content als RAG-input** → vandaag krijgt zo'n pipeline 100% van je geschreven kennis, inclusief de tier-3 interventie-context met referenties. Dit is het enige punt waar je morgen iets aan kunt doen (teaser+gate).

### 2. Wat AI niet kan kopiëren zonder jouw data/engine

- Scoring-gewichten, domein-maxima, K1–K3 interactieregels, trigger-condities, nurture-timing (backstage, `BRAND_POSITIONING.md` §4)
- Herordening op basis van een échte intake-sessie — een prompt kan de *vorm* van personalisatie faken, niet de *juistheid* voor deze gebruiker
- Gebruikershistorie en check-in-delta's — die bestaan alleen in jouw database, achter art. 9-consent
- Geaggregeerde gedragsdata (welke kaart klikt, welke volgorde werkt) — het toekomstige playbook
- De compliance-keuzes als **merk**: de tekst "wij verkopen geen melatonine" is kopieerbaar; de geloofwaardigheid ervan niet. Dit is bewust géén geheim — het is een publiek bewijs dat concurrenten commercieel niet kunnen navolgen.
- Distributie: rankings, backlinks, en de nurture-lijst

### 3. AI-resistente moat-bouwers (impact × haalbaarheid solo-founder, gerangschikt)

| # | Bouwer | Beschermt tegen | Waarom deze volgorde |
|---|---|---|---|
| 1 | **Weaving-consumer + zichtbare herordening** (plan-bridge, fase-regel, gapSignal in "Speelt voor jou nu") | **beide** | Maakt de gated laag dynamisch i.p.v. verstopt; al gepland (F5 wk 2), ~1 dag Cursor-werk; alles erna bouwt hierop |
| 2 | **Delta-lus versterken**: content/duiding die alleen betekenis heeft mét historie ("sinds je vorige check…") | **beide** | Historie is de enige asset die per definitie niet te scrapen én niet te prompten is; hermeting-infra bestaat al |
| 3 | **Handtekening-content hard claimen**: uitsluitingen als campagne (social pijler 2 bestaat al in `BRAND_POSITIONING.md` §7) | vooral **AI** (kloon zonder reputatie), deels Google (E-E-A-T) | Kost alleen consistentie; maakt elke kopie herkenbaar als kopie |
| 4 | **Eigen distributie**: nurture-lijst + terugkeer-momenten uitbouwen | **beide** | Een lijst is niet scrapbaar en niet promptbaar; timing blijft backstage |
| 5 | **Teaser+gate op tier 2–3** | **beide, maar zwakst** | Stopt casual scraping + RAG-verzameling; een gemotiveerde concurrent maakt gewoon een account — daarom alleen zinvol in combinatie met #1 |
| 6 | **Regulatoir actualiteits-ritme** (VWS-ashwagandha medio 2026 als eerste correct duiden) | **beide, tijdelijk** | Freshness wint bij Google; AI-kopieën lopen achter op hun cutoff |

### 4. Misleidende strategieën — lijkt bescherming, is het niet

1. **"Noindex alles" / alles achter login.** Verwart vindbaarheid met toegang: scrapers respecteren robots niet, en noindex stopt geen enkele prompt. Je betaalt met dode acquisitie en krijgt er geen bescherming voor terug.
2. **Copyright-footer / anti-AI-clausule in voorwaarden.** Auteursrecht beschermt tegen 1:1-overname, niet tegen parafrase of AI-training; handhaving tegen (buitenlandse) scrapers is praktisch onhaalbaar. Prima als signaal, waardeloos als slot.
3. **Langere/diepere artikelen als moat.** Diepte helpt ranken, maar méér statische tekst = méér RAG-voer. Diepte beschermt alleen als hij verknoopt is met iets dat de kopieerder mist (jouw check-context) — anders subsidieer je de kloon.
4. **Het concept geheimhouden.** Het 6-domeinen-model is observeerbaar via de check zelf en als idee onbeschermbaar. Geheimzinnigheid over de *waarom* kost marketing en beschermt niets; alleen de *hoe* (gewichten, triggers) is geheimhouding waard — en die is al binnen.

---

## 3D. Premium-tier advies — concreet en NU

### Stand per tier + aanbeveling

| Tier | Bedoeling (`kennisbank.ts:16`) | Gate vandaag | Google vandaag | Aanbeveling NU |
|---|---|---|---|---|
| 1 (6 begrippen) | Basis SEO | geen — publiek | indexeerbaar + sitemap | **Houden en uitbreiden.** Dit is ring 1; biobeschikbaarheid/efsa-claims/derde-partij-testen zijn methodologie-handtekening |
| 2 (9) | Verdieping na check | **UI-only** (premium-feed op `/inzichten`); route open | indexeerbaar + sitemap | **Teaser+gate:** `whatIsIt` publiek, `howItWorks` + `whyItMatters` + referenties achter gratis account. Sitemap-entry blijft |
| 3 (9) | Interventie/supplement-context | **UI-only**; route open | indexeerbaar + sitemap | **Zelfde teaser+gate.** Uitzondering: **melatonine volledig publiek** — het draagt de uitsluitings-handtekening (`COMPLIANCE.md`: informatief zonder koop-CTA is precies de bedoeling) |

### De vijf subvragen

**1. Hernoemen — waar en wanneer.** Copy-only, nu (week 1). De UI is al grotendeels goed ("Verdiepende begrippen", "Kennisbank na je check-in") — het woord "premium" leeft user-facing vooral in de Plus-context op het dashboard (`DomainDeepTool.tsx`: "Premium · meten"), en dat is de *betaalde* betekenis die het mag houden. Vastleggen als officiële term: **"Verdieping na je check"** in upsell-kop, sectiekoppen en alle nieuwe copy. Component-namen (`InzichtenPremiumKennisbank*`), GA4-event `inzichten_premium_kennisbank_click` en de query-param `kennisbank=premium` mogen blijven (Poort 7: dit is copy, geen route-werk); de query-param eventueel later hernoemen, niet blokkerend. **Deadline: vóór de eerste publieke Plus-communicatie** — vanaf dat moment betekent "premium" op de site "betaald" en niets anders.

**2. Route-gate — ja, en het patroon is teaser+gate, geen 403 en geen redirect.** De URL, canonical, breadcrumbs en DefinedTerm-schema blijven; de pagina rendert `shortDefinition` + `whatIsIt` en vervangt de rest server-side door een gate-blok (zelfde CTA-paar als de bestaande upsell: check starten / inloggen). Cruciaal: de gated tekst mag **niet in de HTML** zitten (geen CSS-verbergen — dat is triviaal scrapbaar én riekt naar cloaking); server-side weglaten, en crawler ziet exact wat een anonieme bezoeker ziet, dus geen cloaking-risico. Een 403 of redirect zou de bestaande rankings (cortisol, testosteron, vitamine-d) vernietigen.

**3. Teaser-model — ja.** `whatIsIt` is ~50–150 woorden en beantwoordt de definitie-intent; precies wat Google nodig heeft om te blijven ranken en wat een bezoeker nodig heeft om te willen doorlezen. SEO-impact: definitie-intents blijven; long-tail diepte-intents ("hoe werkt de hpa-as precies") verlies je deels — dat is de bewuste prijs, want die diepte ís de ring-2 waarde. Moat-impact: RAG-scraping krijgt voortaan alleen de bovenste laag; je 18 diepste stukken inclusief referentie-apparaat verdwijnen uit de gratis dataset.

**4. Relatie Plus (€49) — drie "premium"-betekenissen strikt scheiden:**

| Naam | Wat | Prijs | Regel |
|---|---|---|---|
| **Verdieping na je check** | tier 2–3 kennisbank | gratis (account) | Kennis is altijd gratis — nooit achter Plus |
| **Plus / T1-trends** | verdieping op de *meting* (trends, later wearables) | €49/jaar | Betaald verdiept wat je meet, nooit wat je weet |
| **q2_content** | toekomstige programma-content (kracht, begeleiding) | betaald | Begeleiding, geen kennisbank — expliciet aan Cursor meegeven bij Wave 6 |

**5. Copy op de gate — neem de paywall-angst expliciet weg.** De gate moet in de eerste regel zeggen dat dit géén betaalfunctie is (voorbeeld-copy in §3E). Anders leert de bezoeker "kennis kost hier geld" — het tegendeel van de Consumentenbond-positionering, en dodelijk zodra Plus wél live is.

### Drie scenario's

| | **1. Conservatief** (alles blijft publiek) | **2. Aanbevolen: teaser+gate** | **3. Agressief** (volledig gated) |
|---|---|---|---|
| Wat | Alleen hernoemen + upsell-copy afzwakken ("ook los te lezen") + `/inzichten` in sitemap | `whatIsIt` publiek; diepte+referenties gated voor tier ≥2; sitemap blijft; melatonine-uitzondering; gate-copy "gratis" | Tier ≥2 redirect naar upsell; uit sitemap; noindex |
| SEO | geen impact | definitie-rankings blijven; long-tail diepte deels weg | verlies rankings op cortisol/testosteron/vitamine-d; thin-content-signaal |
| Moat | ring 2 bestaat niet; upsell blijft loze belofte | belofte waar; RAG-voer stopt bij de teaser; account-reden eerlijk | maximale schaarste, maar schijn: concurrent maakt een account |
| Merk | eerlijk maar zwak | consistent met "uitkomsten gratis" | voelt als kennis-paywall; botst met Consumentenbond-geest en Poort 1 |
| Effort | 0,5 dag copy | 1 Cursor-prompt (~1 dag) + copy | 1 prompt + SEO-schade-management |

**Keuze: scenario 2.** Scenario 1 laat de geloofwaardigheids-inconsistentie staan (de site belooft nu een gate die niet bestaat); scenario 3 betaalt acquisitie voor bescherming die een account-registratie al omzeilt.

---

## 3E. "Zo zet je het NU neer" — 30-dagen positionerings-playbook

Loopt parallel aan conversieplan wk 1–4 en strategiedoc F5; de conversie-blokkeerders (waitlist-500, account-events-route) blijven eerst (Poort 6). De route-gate-prompt is **nieuw** t.o.v. F5; de weaving-prompt is dezelfde als F5 wk 2 (geen duplicaat).

### Week 1 — Besluiten (Dennis, geen code)

1. **Ring-split vaststellen per item:** loop de 24 begrippen + 29 artikelen langs de vuistregel uit §3B.4. Concreet te besluiten: klopt de tier van `slaaphygiene` (2) en `eiwitbehoefte-na-40` (2) — beide kandidaat-acquisitie-toppers, evt. naar tier 1; melatonine (3) → publiek-uitzondering bevestigen.
2. **Naam vastleggen:** "Verdieping na je check" — in dit doc, `WRITING_VOICE.md`-lijstje, en als instructie bij elke volgende Cursor-prompt.
3. **Handtekening-set kiezen (4–6 publiek, bewust):** melatonine-begrip + blog, ashwagandha-uitsluiting, omega-3-geen-energie-claim, efsa-claims, derde-partij-testen, biobeschikbaarheid. Dit zijn de stukken die je *wilt* dat gekopieerd worden — elke kopie zonder de uitsluitings-daad erachter versterkt jouw origineel.
4. Poorten 1–7 (strategiedoc) formeel bevestigen als dat nog niet gebeurd is — dit playbook hangt eraan.

### Week 2 — Technische moat (Cursor, 1 prompt)

- Route-gate teaser-split op `/kennisbank/[slug]` voor tier ≥2 (server-side, `publicOverride` voor melatonine)
- Upsell-/gate-copy incl. "gratis — geen Plus"
- `/inzichten` toevoegen aan `sitemap.ts` (1 regel); kennisbank-entries blijven
- **Geen noindex** op de teasers (bewust — zie §3D.2)
- Meetpunt in dezelfde wijziging (meet-standaard): gate-vertoning + gate-CTA-kliks — hergebruik `inzichten_premium_kennisbank_click` met slug-waarden `gate_view`/`gate_intake`/`gate_login` (geen nieuw event-type nodig)

### Week 3 — Dynamische laag (Cursor, na account-events-route)

= strategiedoc F5 wk 2, ongewijzigd: eerste weaving-consumer (plan-bridge-kaart, "hoort bij fase X van je plan"-regel, gapSignal-verrijking van "Speelt voor jou nu") + metadata-dekking naar 100%. Zodra de account-events-route uit het conversieplan live is: `focus.viewed` durable activeren.

### Week 4 — Meten

| KPI | Bewijst | Waar |
|---|---|---|
| Gate-view → intake-start of login (CTR) | Ring 2 converteert i.p.v. alleen blokkeert | GA4 (`gate_*`-slugs) |
| Return visits ingelogd op `/inzichten` + premium-feed-CTR | Ring 2 levert waarde ná conversie | GA4 + Clarity layer-tag |
| Hub → check-in/plan-stap binnen dezelfde week | De lus werkt (dé maat, conform F6-meetpuntregel) | GA4 + n8n-weekrapport |
| Organische impressies teaser-pagina's (vóór/na) | Teaser-model kost geen definitie-rankings | Search Console, handmatig |

### Voorbeeld-copy (NL)

**Publieke tier-1 artikel-footer CTA:**
> Dit was de algemene uitleg — voor iedereen hetzelfde. Waar jíj staat op slaap, stress en energie zie je in vijf minuten. **Doe de gratis Leefstijlcheck →** en zie welke begrippen voor jou nu spelen.

**Gated tier-2/3 blok (onder de publieke teaser):**
> **De verdieping is gratis — geen abonnement nodig.**
> Hier gaat dit begrip verder: hoe het werkt, waarom het ertoe doet voor jouw keuze, en de volledige wetenschappelijke referenties. Je leest het na je gratis Leefstijlcheck, ingelogd met je account — zo koppelen we de uitleg aan jouw situatie in plaats van aan iedereen tegelijk.
> [Start de gratis check →]  [Ik heb al een account — inloggen]

**Juridische disclaimer leefstijlcoach (1 alinea, voor over-ons/methodologie/footer):**
> PerfectSupplement geeft leefstijl- en voedingsinformatie en vergelijkt supplementen op basis van Europees goedgekeurde gezondheidsclaims (EFSA). We zijn geen artsen en stellen geen diagnoses: de Leefstijlcheck ordent aandachtspunten op basis van wat je zelf invult — het is geen medische test en geen vervanging voor zorg. Op basis van je antwoorden schatten we je inname in; we meten geen bloedwaarden en doen geen uitspraken over tekorten in je lichaam. Bij aanhoudende of ernstige klachten, medicijngebruik of twijfel: ga naar je huisarts.

---

## 3F. Juridische aansluiting

**1. Wat klopt / ontbreekt in het Google AI-kader.** Klopt: leefstijl-/voedingsadvies mag online, leefstijlcoach is een vrij beroep, supplementen zijn levensmiddelen (Warenwet + Richtlijn 2002/46), BIG is pas relevant bij diagnose/behandeling — en dat doe je expliciet niet. Ontbreekt in zo'n generiek kader: (a) de **Claimsverordening 1924/2006 geldt óók voor jou** omdat affiliate-links reclame zijn (staat al in `COMPLIANCE.md`); (b) de **Wet bescherming bedrijfsgeheimen** beschermt je engine alleen als je "redelijke maatregelen" kunt aantonen — gating en interne labeling zijn dus ook juridische hygiëne, niet alleen strategie; (c) **auteursrecht beschermt tekst, geen concept** — het 6-domeinen-model is juridisch vrij navolgbaar, wat het merk-antwoord uit §3C belangrijker maakt dan elk juridisch antwoord; (d) de **inname-vs-status-grens** die je zelf hanteert is strenger en concreter dan wat zo'n kader noemt — houden.

**2. Leefstijlcoach-positionering als publieke moat.** De compliance-keuzes zijn je duurste en minst kopieerbare marketing: EFSA-letterlijkheid, de uitsluitingen, en inname-vs-status zijn drie publieke bewijzen van betrouwbaarheid die een verkoper commercieel niet kan navolgen en een AI-kloon niet geloofwaardig kan dragen. Juridisch verplicht is alleen de disclaimer; strategisch verstandig is er de handtekening van maken (§3E handtekening-set, social pijler 2).

**3. Drie zinnen WEL / drie zinnen NIET op de site:**

| WEL | NIET |
|---|---|
| "Wij geven leefstijladvies, geen diagnoses — bij aanhoudende klachten ga je naar je huisarts." | "Je hebt een magnesiumtekort." (statusclaim — vereist meting) |
| "Op basis van je antwoorden schatten we je inname; we meten geen bloedwaarden." | "Dit supplement lost je slaapprobleem op." (medische claim, geen EFSA-formulering) |
| "We verkopen niets zelf; onze aanbevelingen volgen EFSA-claims en we zeggen publiekelijk wat we níet aanraden." | "De check laat zien wat je lichaam nodig heeft." (diagnose-suggestie; de check ordent, meet niet) |

**4. Art. 9 AVG: versterkt én beperkt de moat.** *Versterkt:* de gedrags- en gezondheidsdatalus (intake-antwoorden × kliks × hermetingen) is voor een concurrent legaal onbereikbaar — die moet zijn eigen expliciete-consent-infrastructuur, DPIA en vertrouwen opbouwen voordat hij ook maar één datapunt heeft. Jouw dataset is daarmee de enige asset die noch te scrapen, noch te prompten, noch te kopen is. *Beperkt:* dataminimalisatie en het verwijderrecht betekenen dat de moat-data kan krimpen en nooit "voorraad" is; geen PII in GA4/Clarity blijft hard; en personalisatie zonder account mag niet (fingerprinting) — ring 3 is dus per definitie account-gated, wat de drempel vóór de moat verhoogt. Dat is de prijs van het model en tegelijk het slot erop.

---

## 3G. Besluiten voor Dennis (6)

| # | Besluit | Opties | Aanbeveling | Meetpunt |
|---|---|---|---|---|
| 1 | Tier 2–3 route-gate | publiek / teaser+gate / volledig gated | **Teaser+gate** (scenario 2); melatonine publiek-uitzondering | `gate_view` → `gate_intake`/`gate_login` CTR; Search Console teaser-impressies vóór/na |
| 2 | Sitemap + nav anoniem | wel / nu / wachten op content | **Sitemap-entry `/inzichten` nu** (kostenloos); nav voor anoniem **wachten** tot content-gap voeding/beweging gedicht is (conform strategiedoc besluit 1) | Impressies/kliks `/inzichten` in Search Console |
| 3 | AI-resistente investering #1 | weaving / Q1-hero / engine-docs | **Weaving-consumer** (F5 wk 2) — maakt gated laag dynamisch; Q1-hero volgt (F5 wk 3) | `focus_area_click` destinations `inzichten_plan_bridge`, `artikel_plan_fase` |
| 4 | Naam premium-tier | copy-only / ook URL | **Copy-only nu**: "Verdieping na je check"; query-param + componentnamen later/optioneel. Deadline: vóór eerste publieke Plus-communicatie | n.v.t. (consistentie-check bij Plus-launch) |
| 5 | Publieke handtekening-content | welke uitsluitingen hard promoten | **Melatonine + ashwagandha + omega-3-energie** als kern; efsa-claims/derde-partij-testen/biobeschikbaarheid als methodologie-flank | Organisch verkeer handtekening-URL's; social-doorkliks naar /intake |
| 6 | Juridische positionering | waar "leefstijlcoach, geen arts" | Eén vaste alinea (§3E) op **over-ons + methodologie + intake-intro**; footer-link naar disclaimer; níet op elke pagina in de body herhalen | n.v.t. (compliance-review; sluit aan op MUST-matrix) |

---

## 3H. Wat NIET doen

- Geen code-diffs in dit document; implementatie loopt via Cursor-prompts (wk 2–3).
- Geen volledige juridische due diligence — §3F is productstrategie met juridische raakvlakken.
- Geen wearable/LLM-deep-dive: beide zijn toekomstige ring 3-lagen (wearables = W1-gate uit strategiedoc Poort 5; LLM = fase 3 schaalpad, krijgt het playbook, nooit de gewichten).
- Geen noindex op de teaser-pagina's, geen 403's, geen CSS-verborgen content.
- Geen de-indexering van bestaande rankende kennisbank-URL's.
- Geen "premium"-woord in nieuwe gratis-laag-copy, vanaf nu.

---

## 4. Moat-scorecard

| Dimensie | Vandaag | Na 30 dagen (playbook uitgevoerd) | Toelichting |
|---|---|---|---|
| Content (ring 1 dekking/kwaliteit) | **2** | **3** | Scheef: 3 domeinen vrijwel leeg; F5-contentplan dicht voeding eerst |
| Gated diepte (ring 2) | **1** | **3** | Vandaag volledig lek (route + sitemap); teaser+gate maakt de belofte waar |
| Dynamische assemblage (ring 3 zichtbaar) | **2** | **3** | Herordening + feed live, maar weaving 0 consumers; plan-bridge is de sprong |
| Engine (backstage) | **4** | **4** | Goed beschermd en gedocumenteerd; +formalisering "redelijke maatregelen" |
| Merk/compliance | **4** | **5** | Fundament sterk; handtekening-set wordt actief geclaimd i.p.v. impliciet |
| Distributie | **2** | **3** | Sitemap-gat gedicht, nurture bestaat; nav-anoniem en lijst-groei zijn de volgende trede |

---

## 5. Aanbevolen tier-scenario — zo staat het over 30 dagen

**Scenario 2 (teaser+gate).** Over 30 dagen: elke `/kennisbank/[slug]` met tier ≥2 toont publiek de definitie + "wat is het", en daaronder een gate die in de eerste regel zegt dat de verdieping **gratis** is; melatonine staat er als enige tier-3 volledig open, als handtekening. `/inzichten` staat in de sitemap; de rankings op cortisol/testosteron/vitamine-d zijn intact. Ingelogd is dezelfde begrippen-laag verweven met het plan (fase-regel, plan-bridge) — de eerste keer dat ring 2 iets doet wat een gescrapete kopie principieel niet kan. "Premium" betekent op de site nog maar één ding: de betaalde meting-verdieping die eraan komt.

## 6. Top-3 acties deze week

| # | Actie | Wie |
|---|---|---|
| 1 | Besluiten 1–6 (§3G) bevestigen + ring-split en handtekening-set vaststellen (wk 1-lijst, §3E) | **Dennis** |
| 2 | Cursor-prompt "kennisbank teaser+gate + sitemap-entry /inzichten + gate-meetpunt" laten maken en uitvoeren (wk 2-scope, §3E) | **Dennis vraagt, Fable levert prompt, Cursor voert uit** |
| 3 | Niets hiervan vóór de conversie-blokkeerders schuiven: waitlist-500 en account-events-route houden voorrang (Poort 6) | **Dennis (volgorde bewaken)** |

---

## 7. Disclaimer

Dit is product- en positioneringsstrategie, geen juridisch advies. Voor de bedrijfsgeheim-formalisering, AI-/scraping-clausules in voorwaarden en de art. 9-randen: leg de gekozen richting eenmalig voor aan een jurist met levensmiddelen-/privacypraktijk.

---

*Opgesteld: 5 juli 2026 (Fable-sessie moat & premium-tier). Geen code gewijzigd, geen commits.*
