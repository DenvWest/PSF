# PerfectSupplement — Inzichten-strategie 4 juli 2026

> **Layer 3 — Strategie/besluitlog.** Hoe `/inzichten` waardevol en onderscheidend wordt als
> gratis kennislaag — schaalbaar, gekoppeld aan de leefstijlcheck, met een pad naar wearables later.
> Geen code — IA-besluiten, prioriteiten, meetplan, acties. Loopt **naast** het conversie-dataplan
> (`fable-conversie-datastrategie-2026-07.md`) en het architectuurrapport
> (`fable-architectuur-synthese-rapport-2026-07.md`); overlapt bewust met geen enkele wave of week daaruit.
> Alles hieronder geverifieerd tegen de code op 2026-07-04.

---

## Antwoord op de vijf vragen (samenvatting)

1. **Prioriteit × moeite blijft het juiste kader** — maar als *besliskader en verdienmodel-scharnier* (Q1 gratis / Q2 betaald), niet als zichtbaar grid. De UI toont het kwalitatief (volgorde, chips, highlight) en doet dat vandaag al deels. Wearables vervangen dit kader niet; ze maken later de prioriteit-as datarijker per categorie.
2. **Het leefstijlplan hoort ERNAAST, niet erin.** Het plan is een persoonlijk-spoor-artefact (intake/dashboard); Inzichten weeft ernaartoe via de al bestaande maar ongelezen metadata-velden (`planPhase`, `theme`, `gapSignal`). Embedden zou het twee-sporen-principe uit `IA_ECOSYSTEEM.md` breken en auth op een SEO-pagina forceren.
3. **Het onderscheid is de lus, niet de content.** Andere aanbieders hebben óf content zonder meting (blogs, magazines) óf meting zonder publieke kennislaag (apps). PerfectSupplement is de enige waar hetzelfde zes-domeinen-vocabulaire loopt van SEO-artikel → check → dashboard → artikel-op-jouw-prioriteit → actie → hermeting. Plus de Consumentenbond-handtekening: publiekelijk zeggen wat we *niet* aanraden.
4. **Minimale schaalbare invulling:** getemplate "uit jouw check"-duiding op de prioriteit-pijler (bestaat), + weaving-metadata mét eerste consumer (bestaat als type, nul lezers), + één Q1-categorie-kaart uit de taxonomie (substraat bestaat, nul UI-consumers). Coach-playbook en LLM komen daar bovenop, in die volgorde (matrixplan §6) — niets daarvan blokkeert de eerste stap.
5. **NU EERST:** vindbaarheid (sitemap-gat) + metadata-dekking (4/55 getagd) + de eerste weaving-consumer. **LATER:** volledige matrix-UI, wearable-OAuth, LLM-duiding, Q2-programma-launch. De conversie-blokkeerders (waitlist-500, account-events) staan al in het conversieplan wk 1–2 en gaan vóór alles hier.

---

## F0 — North star

**Hypothese uit de opdracht: bevestigd met twee nuances.**

> **Inzichten is de publieke kennislaag die dezelfde zes domeinen spreekt als de meting, en die voor wie gecheckt heeft wordt herordend — niet herschreven — op zijn prioriteit. Elke kenniseenheid staat één klik van een actie (check-in, plan-stap, of vergelijking), zodat de lus kennis → actie → hermeting zowel retentie als conversie voedt. De kennislaag is gratis, altijd; de betaalde laag verdiept de *meting* (T1 trends, T2 coach), nooit de kennis.**

Nuance 1: de hypothese legt het zwaartepunt op "gratis kennis voelt als persoonlijk advies". Dat klopt voor het ingelogde spoor, maar voor de anonieme bezoeker (de acquisitie-kant) is het onderscheid niet personalisatie maar de Consumentenbond-transparantie — evidence-taal plus uitsluitingen ("waarom wij melatonine niet verkopen"). Inzichten heeft twee gezichten met één taal; beide moeten dragen.

Nuance 2: "de betaalde laag is de verdieping op wat je al meet" — precies, en dáárom hoort er geen betaalde kennis te bestaan. De bestaande "Premium kennisbank" (tier 2–3 begrippen) is account-gated maar gratis; dat moet zo blijven én anders gaan heten vóór Plus live gaat (Poort 7).

---

## F1 — Verificatie (WEL/NIET live, tegen alle genoemde bronnen)

| Vraag | Antwoord | Bewijs |
|---|---|---|
| Hub-modes feed / aanpak / premium-kennisbank live? | **JA, alle drie** | `page.tsx:76-78`: `weergave=aanpak` → `AanpakMode`, `kennisbank=premium` → premium-feed (zonder context → upsell), default → hub/feed met pijler×type-filters |
| Personalisatie zonder login? | **NEE** | `inzichten-visitor-context.ts:11-19`: vereist account-cookie én niet-lege dashboard-data; anoniem = generieke hub. SEO-veilig (crawler ziet publieke versie), maar intake-zonder-account geeft géén personalisatie |
| Prioriteit×moeite-matrix live of plan? | **Als UI: NEE — er staat iets anders** | `AanpakMode.tsx` toont **supplement-kaarten** via `buildRecommendations` met prioriteit/moeite-chips. `category-taxonomy.ts` (17 categorieën) heeft als enige consumer zijn eigen test; alle `insightSlugs`-arrays zijn **leeg** |
| Leefstijlplan gekoppeld aan Inzichten? | **NEE** | `lifestyle-plans/`-consumers: `/intake/plan/[domain]`, `/api/intake/plan`, `/api/account/plan`, `dashboard-active-plan.ts`, `resolve-nurture-tier.ts`. Nul verwijzingen vanuit `/inzichten` of `components/insights/` |
| Weaving-metadata actief? | **NEE** | `CONTENT_METADATA` tagt 4 slugs van ~55 items; `types/insight.ts` zegt het letterlijk: *"nog geen consumer leest dit veld"*. Grep op `.planPhase`/`.gapSignal` buiten types/tests: 0 hits |
| Waar staan wearable-stubs? | Twee plekken | `category-taxonomy.ts`: 3 categorieën `source:"wearable"` (HRV, rusthartslag, slaapduur — alle slaap); `data/dashboard/index.ts:170` `SIGNALS` met `status:"binnenkort"`, lege data-arrays. Geen OAuth, geen actieve UI-belofte |

**Aanvullende feiten die de diagnose sturen:**

1. **`/inzichten` staat niet in `src/app/sitemap.ts`** en de nav-link is login-gated (`HeaderClient.tsx:98`). Publieke inbound links bestaan wél: `DomainHubConnector` op alle 6 domein-hubs linkt naar `/inzichten?pijler=`. Netto: de hub is voor anoniem verkeer bereikbaar maar zwak ontsloten.
2. **Content-dekking is scheef:** 29 blogartikelen (10 energie, 7 slaap, 4 stress, 10 categorie "supplementen" via override herverdeeld) + 26 kennisbank-begrippen (6 tier-1 publiek, 18 tier 2–3 account-blok). Voeding drijft op overrides; beweging heeft vrijwel niets; verbinding niets. De hub-kop zegt "Zes domeinen, één systeem" terwijl `PILLARS` er zeven telt (verbinding) — kleine inconsistentie.
3. **De Aanpak-kaart is supplement-centrisch tot in de hoofdlink:** de kaart-CTA "Zo pak je het aan →" gaat naar `rec.guideHref` = de **supplementgids**, de adv-regel naar `/beste/*`. Beide klikdoelen zijn supplement-surfaces — de copy zegt "Voeding eerst", de kliks zeggen supplement. Dit wijkt af van de kaart-anatomie in het matrixplan §4 (Q1-CTA = gratis actie/duiding).
4. **F1 eiwit-hero (geshipt 27 jun) is de supplement-variant:** de bovenste kaart krijgt "Prioriteit · hoog", maar het is een `buildRecommendations`-supplement, geen categorie-kaart uit `NUT_PROT`.
5. **Meetpunten live:** GA4 `inzichten_hub_nav_click`, `focus_area_click` (destinations `approach_<slug>_gids`/`_vergelijk` + FocusAreaCard), `clarityTag("inzichten_layer","premium_kennisbank")`. Durable: `focus.viewed` is geregistreerd maar heeft **0 emit-sites** (bevestigd in het conversierapport) — en kan client-side ook niet emitten zolang de account-events-route (conversieplan wk 2) er niet is.
6. **Compliance is op orde:** nergens scores of urgentie-getallen in de Inzichten-UI ("Prioriteit · hoog" kwalitatief, `has_checkin`-loze payloads), personalisatie-copy zegt "op basis van je laatste check — niet je clicks". Conform DPIA-R4 en de matrixplan-regel.

---

## F2 — Diagnose (drie sporen)

### Spoor A — Waarde als gratis kennis

- **As-is:** volwassen personalisatie-shell (herordende pijlers, "Speelt voor jou nu", prioriteits-kennisbank) op een dunne, scheve contentlaag; voor anoniem verkeer zwak ontsloten (geen sitemap-entry, nav gated).
- **Gewenst:** "Consumentenbond van leefstijl" — per domein een geloofwaardige evidence-plank, vindbaar via SEO, met de uitsluitings-transparantie als handtekening.
- **Blokkade:** vindbaarheid + dekking. De personalisatie is af; wat ontbreekt is het ding dat gepersonaliseerd wordt. Drie van de zes (zeven) domeinen hebben vrijwel geen content, en de best gebouwde pagina van het publieke spoor staat niet in de sitemap.
- **Signaal van verbetering:** organische impressies/kliks op `/inzichten` en artikel-URL's per domein; `focus_area_click` vanaf de hub; hub → `/intake`-doorklikratio.

### Spoor B — Onderscheid & schaalbaarheid

- **As-is:** kennis en plan zijn twee werelden. De weaving-velden bestaan als types (goed ontworpen naad) maar niemand leest ze; de taxonomie (het playbook-substraat) heeft lege `insightSlugs`, dus de evidence-klik uit het matrixplan kán nergens heen; de Aanpak-mode verkoopt in beide klikdoelen supplement-surfaces.
- **Gewenst:** elk artikel weet bij welke plan-fase, welk gap-signaal en welk profiel het hoort; elke categorie-kaart kan naar zijn bewijs linken; de Aanpak ordent gedrag, met supplement als laatste regel — dat ís het coach-playbook in dataform, en precies wat een LLM later nodig heeft.
- **Blokkade:** geen consumer van de metadata (kip-ei: niemand tagt omdat niemand leest, niemand leest omdat er niets getagd is). Doorbreek het aan de lees-kant: één consumer maakt tagging renderend.
- **Signaal:** CTR artikel → plan-stap/check-in; % content met volledige metadata; eerste categorie-kaart met werkende evidence-klik.

### Spoor C — Meetkader (prioriteit × moeite vs wearables)

- **As-is:** prioriteit leeft op pijler-niveau (`getPriorityPillarId` op scores); moeite alleen als chip op supplement-kaarten. Categorie-niveau prioriteit (laagste antwoord per categorie, matrixplan §1) bestaat niet: `derivePersonalization` krijgt alleen `scores`, geen `answers`.
- **Gewenst:** besliskader op categorie-niveau — de eiwit-kaart komt boven omdat `NUT_PROT` laag is, niet omdat voeding als pijler laag is. Wearables verrijken dat later (dagelijkse-activiteit-categorie wacht er expliciet op).
- **Blokkade:** de visitor-context moet antwoord-niveau data meekrijgen (kleine uitbreiding — dashboard laadt de sessie al voor `AanpakMode`). Geen nieuw datamodel nodig; de taxonomie heeft de `questionId`-mapping al.
- **Signaal:** eerste Q1-kaart die uit een intake-antwoord komt en meetbaar beter klikt dan de generieke volgorde.

---

## F3 — Beslissingspoorten

**Poort 1 — Primaire functie → C (hybride), en dat staat er al.**
A verspilt de gebouwde personalisatie; B gate't de SEO-laag (verboden per harde regel). C is de huidige build: publieke feed + additieve personalisatie voor ingelogden. Besluit hier is bevestigen + de publieke helft repareren: `/inzichten` in de sitemap, en de contentlaag op dekking brengen. Personalisatie blijft additief — nooit content verbergen voor anoniem die ingelogd wél publiek zou zijn.

**Poort 2 — Prioriteit × moeite → A (behouden), met een precisering.**
Het kader is het verdienmodel-scharnier (Q1 gratis = vertrouwen, Q2 betaald = programma) en het sorteermechanisme — geen zichtbaar grid en geen getallen (DPIA-R4). De UI-vertaling is er al: volgorde, kwalitatieve chips, highlight. C (schrappen) gooit het enige kader weg dat gratis/betaald principieel scheidt; B (alleen prioriteit-pijler) mist de moeite-as die de Q2-upsell eerlijk maakt. Wearables zijn hier géén alternatief kader — ze voeden later de prioriteit-as.

**Poort 3 — Leefstijlplan → B (ernaast, Inzichten linkt via weaving).**
Het plan is de actie-laag van het persoonlijke spoor; Inzichten is de kennis-laag van het publieke spoor. A (embedden) forceert auth op een SEO-pagina en dupliceert het dashboard; C (schrappen) gooit een werkende retentie-asset weg. B kost het minst: `planPhase`/`theme` bestaan al op `InsightItem` — er hoeft alleen een lezer te komen (plan-bridge-kaart voor ingelogden met actief plan; "hoort bij fase 2 van je plan"-regel op artikelen).

**Poort 4 — Aanpak-mode → B als eindbeeld, via C-light nu.**
De huidige build (A) is in beide klikdoelen supplement — dat ondergraaft "leefstijl eerst" precies op de pagina die het moet bewijzen. Volledige B (matrix als hoofd) vereist categorie-prioriteit + gevulde `insightSlugs` — te veel voor nu. Daarom C-light: één echte Q1-categorie-hero (eiwit, uit `NUT_PROT`, CTA naar gedrag/gids-inhoud, affiliate als laatste regel) bóven de bestaande supplement-kaarten; de kaarten eronder blijven staan als "ondersteuning". Data beslist daarna over de volle matrix (F2 matrixplan). Geen twee tabs (verdubbelt navigatie voor een module die nog moet bewijzen).

**Poort 5 — Wearables → B (stubs houden; self-report eerst bewijzen).**
A (nu OAuth bouwen) haalt art. 9-doorlopende gezondheidsdata binnen zonder bewezen gebruikslus — DPIA-addendum, aparte consent, en een verwerkersvraagstuk per wearable-vendor, allemaal vóór er één gebruiker om vraagt. C (uit de IA slopen) vernielt goedkope toekomst-optionaliteit (stubs zijn inert en goed gelabeld "binnenkort"). B: de check-in-ratio's (T4-KPI conversieplan) bepalen wanneer wearables aan de beurt zijn; dan slaap-signalen eerst, onder de betaalde T1-trends-capability (verdieping op meting = betaald mag; de kennis erover blijft gratis).

**Poort 6 — Volgorde t.o.v. 90-dagen roadmap → B (blokkeerders eerst).**
De waitlist-500 en account-events-route (conversieplan wk 1–2, architectuurrapport fase 1–2) gaan vóór alles hier — dat staat al vast en dit plan raakt die prompts niet. Inzichten-werk dat **geen code raakt** (tagging, sitemap-besluit, contentplan) kan direct parallel; de weaving-seam-prompt komt in wk 2–3, ná de account-events-route, zodat `focus.viewed` meteen durable kan. A zou de enige live dataverlies-bug laten liggen voor een kennislaag zonder deadline; C (alleen content) laat de gebouwde naad nóg een kwartaal ongelezen.

**Poort 7 (extra) — "Premium kennisbank" hernoemen vóór Plus live gaat.**
De tier 2–3-begrippen zijn account-gated maar gratis. Zodra Plus (€49/jaar) bestaat, betekent "premium" op de site ineens twee dingen — en de gratis variant ondermijnt de betaalde naam. Hernoem naar bv. "Verdieping na je check" (component/route-namen mogen blijven; dit is copy). De gate blijft gratis-account — begrippen achter de betaalmuur zetten zou "uitkomsten gratis" schenden. De `q2_content`-capability uit Cursor Wave 6 is voor tóekomstige programma-content, niet voor deze begrippen — geef dat Cursor expliciet mee.

---

## F4 — Ontwerp

### 4.1 IA-schets: twee sporen, één pijler-taal

```
PUBLIEK SPOOR (SEO, anoniem)                PERSOONLIJK SPOOR (account)
─────────────────────────────               ─────────────────────────────
Google/social                                Dashboard (Kompas/Voortgang)
   │                                            │  prioriteit uit laatste check
   ▼                                            ▼
/inzichten/{artikel} ◄──────────┐            /inzichten (zelfde URL, herordend)
   │  evidence, uitsluitingen   │               ├─ ContextStrip (prioriteit + profiel)
   ▼                            │               ├─ "Speelt voor jou nu" (prioriteit-feed)
domein-hub (/slaap-...-na-40)   │               ├─ Verdieping na je check (tier 2-3)
   │  DomainHubConnector ───────┘               ├─ [NIEUW] plan-bridge → /intake/plan
   ▼                                            └─ Aanpak: Q1-categorie-hero + kaarten
/intake ──── check → account ──────────────►        │ evidence-klik → artikel (gratis)
                                                    │ kaart-CTA → actie / (later) Q2
                                                    ▼
                                             check-in / plan-stap → hermeting
                                                    │
                                                    └──► nieuwe prioriteit → herordende hub
```

De pijler blijft de gedeelde taal; personalisatie blijft additief op dezelfde URL's (geen aparte gated routes, dus geen SEO-splitsing). Nieuw t.o.v. vandaag: de twee gestippelde randen — plan-bridge (Poort 3) en de evidence-klik vanaf categorie-kaarten (Poort 4).

### 4.2 User journey (de lus, concreet)

1. **Anoniem:** landt via SEO op een artikel → ziet evidence-blok + "waar sta jij op slaap?"-CTA → domein-hub → `/intake`.
2. **Check gedaan:** resultaat + account → dashboard toont prioriteit → nav-link Inzichten (ingelogd) → hub is herordend, "Speelt voor jou nu" toont de prioriteit-pijler.
3. **Actie:** Aanpak-tab → Q1-hero ("Eiwit — grootste winst, kleinste stap, uit jouw check") → gedrags-CTA of, laatste regel, affiliate → of plan-bridge → plan-stap afvinken.
4. **Terugkeer:** check-in of dag-30 hermeting → prioriteit verschuift → hub herordent → nieuwe kennis voelt vers zonder nieuwe content te schrijven. *Dat is het schaal-geheim: herordening ís personalisatie.*

### 4.3 Content-taxonomie: drie lagen die elkaar vinden

| Laag | Eenheid | Sleutel | Verbindt met |
|---|---|---|---|
| Feed | `InsightItem` (artikel/deepdive/begrip) | `pijler` × `type` | hub-filters, domein-hubs |
| Weaving | metadata-overlay per slug | `theme`, `planPhase`, `gapSignal`, `profile`, `relatedSupplementId` | plan-fases, check-antwoorden, profielen, `/beste/*` |
| Aanpak | `CategoryDefinition` (taxonomie) | `questionId` + `insightSlugs` | intake-antwoord → prioriteit; evidence-klik → artikel |

**Redactionele regel vanaf nu:** geen artikel gepubliceerd zonder metadata-regel in `CONTENT_METADATA`, en elke self-report-categorie krijgt ≥1 `insightSlug` vóór hij een kaart wordt. Content-gap-volgorde: voeding (eiwit/vetzuren/vezels — draagt de Q1-hero) → beweging (kracht/cardio — draagt de latere Q2) → stress-herstelmomenten → verbinding laatst.

### 4.4 Waar prioriteit en moeite in de UI verschijnen (kwalitatief, nooit getallen)

- **Prioriteit:** volgorde (herordende pijler-grid, kaart-sortering), highlight (FocusAreaCard-ring), sectiekop ("Speelt voor jou nu"), chip "Prioriteit · hoog/middel". Nooit een score, nooit urgentie-taal.
- **Moeite:** chip per kaart ("Moeite · laag/middel/hoog") — intrinsiek, dus ook toonbaar zonder check.
- **Kwadrant:** nooit als label. Q1 herken je aan "grootste winst, kleinste stap"-framing; Q4 wordt later een "bewust niet nu"-regel onderaan (geloofwaardigheids-feature, pas bij F2-matrix).
- **Evidence:** korte tag ("Sterk onderbouwd") + klikbare bron — het enige klikdoel dat nooit verkoopt.

### 4.5 Wearable-horizon (gefaseerd, met gates)

| Fase | Trigger (geen datum) | Wat | Gate/compliance |
|---|---|---|---|
| W0 (nu) | — | Stubs blijven zoals ze zijn (`SIGNALS` "binnenkort", taxonomie-categorieën inert) | Geen belofte-copy toevoegen |
| W1 | Self-report bewezen: T4-KPI ≥30% accounts met wekelijkse check-in, 2+ maanden | Besluit + DPIA-addendum voorbereiden (doorlopende art. 9-stroom, vendor-DPA's) | Papier vóór code |
| W2 | Plus live + DPIA-addendum af | Slaap-signalen eerst (HRV, slaapduur, rustpols — categorieën bestaan al) als **T1-trends-verdieping** | Betaald (verdieping op meting); expliciete aparte consent; kennis erover gratis in /inzichten |
| W3 | W2 draait stabiel | Beweging: stappen → "Dagelijkse activiteit"-categorie wordt datagestuurd Q1 | Zelfde gate |

Wearables veranderen het kader niet: ze maken de prioriteit-as per categorie continu in plaats van check-moment-gebonden.

### 4.6 Schaalpad: coach → playbook → LLM

| Fase | Wie doet de duiding | Wat is geautomatiseerd | Wat je leert |
|---|---|---|---|
| 1 (nu) | Templates ("uit jouw check"-regels per categorie/antwoord) | Alles — herordening + getemplate copy schaalt naar 10.000 users zonder mens | Welke categorieën/kaarten getrokken worden (CTR-data) |
| 2 (bij Q2-launch, F3 matrixplan) | Echte coach voor betaalde Q2-programma's (kracht eerst); consent-uitbreiding + DPA | Gratis laag blijft vol-automatisch; coach werkt met een draaiboek dat je vanaf dag 1 codificeert | Het playbook: welke opbouw, welke terugkoppeling, welke taal werkt |
| 3 (volume + governance) | LLM op het gecodificeerde playbook, mens als reviewer | Q2-duiding grotendeels; RAG op productkennis (niet-persoonlijk) conform BRAND_POSITIONING §6 | — |

Harde regel door alle fases: de engine/triggers/timing blijven backstage (moat); de LLM krijgt het playbook, nooit de scoring-gewichten in output.

---

## F5 — Actieplan 4 weken (parallel aan conversieplan wk 1–4 en architectuur-fase 1–2, zonder overlap)

| Week | Dennis | Cursor/Fable | Meetpunt van de week | Naast (geen conflict) |
|---|---|---|---|---|
| **1 — Besluiten + vindbaarheid** | 1. Poorten 1–7 bevestigen (m.n. Poort 4 C-light en Poort 7 naam) · 2. Contentplan voeding/beweging vaststellen (welke 4–6 artikelen eerst) · 3. Sitemap-besluit: `/inzichten` + artikel-URL's erin | **Fable (geen code-conflict):** tagging-batch — `CONTENT_METADATA` naar volledige dekking (55 items) + `insightSlugs` vullen voor de 11 self-report-categorieën; 1-regel sitemap-fix kan mee met een conversie-prompt | Dekking: % items met metadata (doel 100%) | Conversieplan wk 1 = waitlist-fix (andere bestanden) |
| **2 — Weaving-seam** | 1. Copy reviewen voor plan-bridge + artikel-fase-regel · 2. Eerste 2 voeding-artikelen schrijven | **Cursor-prompt (dé prioriteit, zie F6):** eerste metadata-consumer — plan-bridge-kaart op de hub (ingelogd + actief plan) + "hoort bij fase X"-regel op artikelen + gapSignal-verrijking van "Speelt voor jou nu" | `focus_area_click` met nieuwe destinations `inzichten_plan_bridge`, `artikel_plan_fase` | Conversieplan wk 2 = account-events-route; zodra die er is: `focus.viewed` in de account-allowlist (stub eindelijk activeren) |
| **3 — Aanpak C-light** | 1. Q1-eiwit-copy vaststellen (gedrag eerst, affiliate laatste regel) · 2. Beweging-artikel 1–2 | **Cursor-prompt:** Q1-categorie-hero in AanpakMode — prioriteit uit `NUT_PROT` (visitor-context uitbreiden met answers), CTA naar gedrag, evidence-klik naar getagd artikel; bestaande supplement-kaarten worden "ondersteuning"-sectie eronder | `focus_area_click` destination `approach_q1_eiwit` vs bestaande `approach_eiwitpoeder_*` — klikt gedrag beter dan supplement? | Conversieplan wk 3 = funnel-views/n8n (SQL, andere laag) |
| **4 — Review op data** | 1. Cijfers lezen: hub→intake-ratio, plan-bridge-CTR, Q1-hero-CTR · 2. Besluit: door naar F2-matrix (meer categorieën) óf content-eerst (meer artikelen) · 3. Nav-gating heroverwegen (anoniem tonen?) op basis van dekking | Reserve/uitloop; eventueel tweede Q1-kaart (vetzuren) als eiwit-hero trekt | Weekcijfer in het n8n-rapport (GA4-sectie, consented cohort) | Conversieplan wk 4 = cohort-review — zelfde leesmoment, één zitting |

**Afbakening capaciteit:** weken 2–3 kosten elk één Cursor-prompt; die concurreren niet met de conversie-prompts (waitlist = retentie-prompt 3, account-events = architectuur-prompt 2, views = §9-prompt) omdat ze andere bestanden raken. Bij krapte wint het conversieplan — Poort 6.

---

## F6 — Handoff

### Meetpunten (hergebruik eerst, conform meet-standaard)

| KPI | Event(s) | Kanaal | Waar aflezen |
|---|---|---|---|
| Hub-effect | `inzichten_hub_nav_click` (bestaand) + hub→`/intake`-doorklik | GA4 | GA4 Exploration |
| Weaving-effect | `focus_area_click` destinations `inzichten_plan_bridge`, `artikel_plan_fase` (nieuw als destination-waarde, geen nieuw event) | GA4 + Clarity | GA4; layer-tag Clarity |
| Aanpak-effect | `focus_area_click` destination `approach_q1_eiwit` vs `approach_<slug>_gids/_vergelijk` | GA4 | GA4 |
| Durable spoor | `focus.viewed` activeren via de account-events-route zodra die bestaat (conversieplan wk 2) — stub heeft nu 0 emit-sites | domain_events | n8n-weekrapport |
| SEO | impressies/kliks `/inzichten*` per domein | Search Console | handmatig, maandelijks |

**Meetpunt-regel:** `focus_area_click(approach_q1_eiwit | inzichten_plan_bridge)` → check-in of plan-stap binnen dezelfde week — hier lees je af of kennis tot actie leidt (de lus), en dat is de enige maat die Inzichten-investeringen rechtvaardigt.

### Open besluiten voor Dennis (3)

1. **Sitemap + nav-gating.** Aanbeveling: sitemap-entry nu (kostenloos, pure vindbaarheid); nav-link voor anoniem pas ná de content-gap-inhaalslag van week 1–3 — een dunne hub prominent tonen schaadt de Consumentenbond-indruk meer dan hij oplevert.
2. **Naam "Premium kennisbank".** Aanbeveling: hernoemen naar "Verdieping na je check" vóór Plus live gaat (copy-wijziging, geen route-wijziging); gate blijft gratis account.
3. **Content-investering vs weaving-volgorde.** Aanbeveling: parallel zoals in F5 — tagging/weaving is Cursor-werk, artikelen zijn Dennis-werk; ze blokkeren elkaar niet. Als er gekozen moet worden: weaving eerst (maakt bestaande content meer waard; nieuwe content zonder naad herhaalt het probleem).

### Niet-nu-lijst (7)

- **Geen volledige F2-matrix-UI** — eerst bewijzen dat één categorie-kaart beter klikt dan de supplement-variant.
- **Geen wearable-OAuth of wearable-copy-beloftes** — stubs blijven inert tot de W1-trigger (Poort 5).
- **Geen LLM-duiding** — fase 3 van het schaalpad, ná coach-playbook.
- **Geen Q2-programma-launch** (kracht) — vereist consent-uitbreiding + coach-rol + DPIA-wijziging; F3 matrixplan.
- **Geen verbinding-content** — laagste ROI, geen affiliate, geen check-in-route.
- **Geen nieuwe event-namen** — destinations op `focus_area_click` volstaan; `focus.viewed` is hergebruik van een geregistreerde stub.
- **Geen route-herstructurering van /inzichten** en geen personalisatie zonder account (cookie-loze personalisatie = fingerprinting-risico; huidige gate is privacy by design).

### Hoogste-prioriteit Cursor-prompt (titel)

> **"Inzichten-weaving seam: eerste consumer van planPhase/gapSignal — plan-bridge op de hub + fase-regel op artikelen + metadata-dekking"**

(Week 2 in F5; effort ~1 dag; blokkerende voorwaarde: geen — GA4-destinations werken direct, het durable spoor lift mee zodra de account-events-route uit het conversieplan er is.)

---

*Opgesteld: 4 juli 2026 (Fable-sessie Inzichten-strategie). Geen code gewijzigd, geen commits.*
