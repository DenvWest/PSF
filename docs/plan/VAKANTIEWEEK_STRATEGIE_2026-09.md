# Vakantieweek — wat te bouwen (week van 14 sep 2026)

**Datum:** 13 september 2026 · **Type:** strategisch besluit + 7-dagenplan
**Rol:** CTO / productstrateeg / execution-coach · **Repo:** `psf`
**Labels:** `[FEIT]` = uit repo/Search Console/wet · `[OORDEEL]` = analyse · `[AANNAME]` = niet geverifieerd

---

## Verdict vooraan

**Bouw komende week géén product.** Niet Kompas, niet USDA, en ook niet "meer SEO-content".
De week gaat over het enige vak waar dit project nog **nul uur** in heeft gestoken:
**bezoekers naar de zeven `/beste/*`-pagina's die er al staan, en die bezoekers meetbaar maken.**

Dit is geen nieuw inzicht. Het staat woordelijk in je eigen
[VERDICT_MULTITENANT_VOLGORDE_EU_2026-08-30.md](../research/VERDICT_MULTITENANT_VOLGORDE_EU_2026-08-30.md) §B4:
*"Haal bezoekers naar de zeven vergelijkingen die er al staan — en bouw in september niets."*
Datzelfde verdict voorspelde je vakantiegedrag exact (openstaande vraag #4):
*"kijk over twee weken terug naar je commits. Staat er weer dashboard-werk in, dan is de volgorde niet het probleem."*

`[FEIT]` Ik heb teruggekeken. Week 36 (1–7 sep): **82 commits, vrijwel allemaal `voeding`/USDA/Kompas** —
de voedingscatalogus, het schap, de omgekeerde index, de USDA-herkomstlaag. Precies het werk dat op
je eigen stop-lijst staat. Het patroon dat het verdict "bouwen als vluchtgedrag voor verkopen" noemde
is niet hypothetisch — je zat er de afgelopen twee weken middenin.

De vakantie is de kans om dat te doorbreken, niet om het te herhalen.

---

## Stap 1 — De werkelijke situatie (uit repo + Search Console)

### Wat er al staat (het is niet weinig)

| Laag | Stand | `[FEIT]` bron |
|---|---|---|
| Vergelijkingspagina's `/beste/*` | **7 live** (magnesium, omega-3, ashwagandha, vitamine-d, creatine, zink, eiwitpoeder) | `src/data/supplements/` |
| Methodiek gepubliceerd | `/methodologie`, `/ps-score`, `/onderbouwing` + links vanaf `/beste/*` | verdict §B1 |
| Blogartikelen | **81 databestanden** (magnesium ~13, creatine ~8, vitamine-d ~9) | `src/data/blog/` |
| Kennisbank / pillars / profielen | 24 begrippen, 7 pillars, 4 profielen, 4 thema-hubs | CURRENT_SPRINT |
| Account + dashboard "Kompas" | 4 tabs, 5+ domeinen, vitaliteitsscore, hermeting | `src/components/dashboard/` (**136 bestanden**) |
| Voedingscatalogus (USDA) | 371 regels, 92 met bron, 279 nog `bron: null` | ONDERZOEK_SPREIDING_EN_USDA §2.6 |
| PartnerDesk (`pd_*`) + eigen affiliate-programma (`af_*`) | fase 1 / kern gebouwd, geen gebruikers | docs/plan/ |
| Technische SEO-scaffolding | Product-, FAQ-, Breadcrumb-, HowTo-, Article-, DefinedTerm-schema — **compleet** | `src/lib/seo/structuredData.ts`; FAQ vuurt al op `/beste/*` (`FaqSection.tsx`) |

### Wat het oplevert aan bezoekers en omzet

`[FEIT]` Nulmeting (Search Console, 90 dagen t/m 2 sep 2026,
[NULMETING_BESTE_VERGELIJKINGEN_2026-09-02.md](../research/NULMETING_BESTE_VERGELIJKINGEN_2026-09-02.md)):

| Pagina | Impressies (90d) | Klikken |
|---|---|---|
| `/beste/vitamine-d` | 190 | **0** |
| magnesium (op zoekopdracht-niveau) | 75 | **0** |
| `/beste/melatonine` | 7 | 0 |
| `/beste/creatine` | 2–3 | 0 |
| `/beste/eiwitpoeder` | 1 | 0 |
| omega-3, ashwagandha, zink | ~0 | 0 |

**Alle vergelijkingspagina's samen: 0 klikken in 90 dagen.** `[FEIT]` Geen bewezen premium-vraag (waitlist, geen
Stripe — `pre-traffic-gates-2026-07.md`). De monetisatie (affiliate) staat intact en klaar, maar er komt
niemand langs om erop te klikken.

### De diagnose in één regel

`[OORDEEL]` Het productoppervlak is **enorm** en de distributie is **nul**. Dit is de klassieke
oprichtersval in vergevorderde vorm: je bouwt diepte (Kompas 136 bestanden, USDA 371 regels) voor een
publiek dat nog niet bestaat, terwijl het ene ding dat het publiek zou binnenhalen — distributie — nooit
is aangeraakt. Meer bouwen, in welke laag dan ook, vergroot alleen het oppervlak dat je later onderhoudt.

---

## Kompas, USDA en SEO — kort, eerlijk

**Kompas** `[FEIT]` = het dashboard/cockpit (`src/components/dashboard/kompas/` + `voortgang/`): 4 tabs,
vitaliteitsscore, domeinmeters, hermeting, achter account-login. Ship-gate coherentie is af (jul 2026).
`[OORDEEL]` Volgende mijlpaal die ertoe doet: **niet** een feature, maar **retentie meten van echte
gebruikers** — en die zijn er niet. Grootste bottleneck van Kompas is dus geen technische; het is dat het
een weddenschap is op verkeer dat nog moet komen. **Waardevol wordt Kompas pas ná distributie**, niet ervoor.

**USDA** `[FEIT]` = de voedingscatalogus die USDA FoodData Central als primaire bron gebruikt voor eiwit,
magnesium, zink en EPA/DHA (`src/data/nutrition/food-catalog.ts`, `food-sources.ts`). Doel: `observed`
min/max/median per rij, zodat de catalogus banden toont i.p.v. punten. Voortgang: 92/371 regels met bron,
279 nog leeg. **Twee harde blokkades voor deze week:** (1) `[FEIT]` de netwerkpolicy blokkeert
`api.nal.usda.gov` én `fdc.nal.usda.gov` met 403 — `npm run extract:usda` kán hier niet draaien, en de hele
`observed`-winst hangt aan die API; (2) het echte werk is **matchbeoordeling per rij** (is Nederlands
volkorenbrood hetzelfde als "Bread, whole-wheat, commercially prepared"? Nee) — oordeelswerk, geen leuk
bouwwerk. `[OORDEEL]` USDA verder duwen deze week is dubbel onverstandig: het raakt geen bezoeker én je kunt
het cruciale deel hier niet eens uitvoeren.

**SEO** `[FEIT]` = infrastructuur is compleet (alle schema's, canonical, FAQ-rich-results vuren al op
`/beste/*`). De vitamine-d-snippet is al herschreven (1 sep: *"Vitamine D3 Vergelijken: 3 Merken Getest
(2026) … zonder de hartclaim die EFSA afwees"*). `[OORDEEL]` Dat betekent: de **codeerbare** SEO-winst is
grotendeels **al gedaan**. Wat rest is (a) een handvol kleine, klaarliggende conversie-fixes en (b) het
niet-codeerbare deel: bezoekers halen en de CTR aflezen. **Meer content bouwen is de val** — je hebt 81
artikelen en 0 klikken; artikel 82 verandert dat niet, en een berg gelijkvormige pagina's op een domein
zonder autoriteit is precies wat Google onder *scaled content abuse* schaart
([BESLUIT_BESTE_VS_SUPPLEMENTEN_2026-09-04.md](../research/BESLUIT_BESTE_VS_SUPPLEMENTEN_2026-09-04.md)).

---

## Stap 2 & 3 — Opties vergeleken + scorekaart

**Aangepaste gewichten, met reden.** Je gaf "technische leverage" 10%. `[OORDEEL]` In jouw situatie is hoge
technische leverage geen pluspunt maar een **waarschuwingssignaal** — het is precies wat je de afgelopen
maand de verkeerde kant op trok. Ik zet hem op 5% en verplaats die 5% naar **omzet/tractie** (→25%), want
dát is de bindende beperking. Scores zijn een beslishulp, geen feiten.

| Criterium | Gewicht | A: SEO-content (meer) | B: Kompas + USDA | C: Distributie & conversie |
|---|---|---|---|---|
| Strategische impact | 25% | 4 | 2 | **9** |
| Kans op concrete vooruitgang | 25% | 4 | 3 | **8** |
| Omzet/tractiepotentieel | 25% | 3 | 1 | **8** |
| Haalbaarheid in één week | 15% | 8 | 4 | 7 |
| Technische leverage *(laag = goed hier)* | 5% | 4 | 7 | 4 |
| Energie/focus tijdens vakantie | 5% | 7 | 8 | 5 |
| **Gewogen totaal** | | **4,5** | **2,85** | **7,75** |

**Optie A — meer SEO-content.** `[OORDEEL]` De *conversie-slice* van SEO (snippets, schema) is al af; de
*content-slice* (meer artikelen/programmatisch) is de val (81 artikelen, 0 klikken; SEO duurt 8–12 weken, dus
een vakantieweek "bewijst" niets). Voelt productief, beweegt de klikteller niet. Comfortabel — en dat is het
risico.

**Optie B — Kompas + USDA.** `[OORDEEL]` Staat op je eigen stop-lijst ("oppakken bij 500 bezoekers/maand").
USDA is hier bovendien API-geblokkeerd (403) en het kernwerk is Opus-oordeelswerk, geen bouwwerk. Laagste
score op elke as die telt. Het aantrekkelijkst om aan te werken — maximaal gevaar.

**Optie C — Distributie & conversie van wat er al staat.** `[OORDEEL]` Raakt als enige de werkelijke
bottleneck, levert een **getal** aan het eind van de week (eerste externe bezoekers + afleesbare funnel),
en opent het kanaal dat blijft opleveren. Zwakte: distributie is ongemakkelijk werk en grotendeels géén
code — dat is precies waarom het nooit is gebeurd, en waarom het nú moet.

**Winnaar: C.** Het is in essentie stap 3 uit je eigen verdict, eindelijk uitgevoerd — verrijkt met de
kleine conversie-fixes die je wél mag coderen.

---

## De eerlijke spanning die je moet accepteren

Je wilt **coderen** op vakantie. Het werk met de hoogste hefboom is **grotendeels geen code**. Dat is de
kern van je probleem, niet een detail. Als je de week tot "vooral coderen" maakt, herhaal je week 36 bijna
zeker. Optie C lost dit op met twee sporen, elke dag:

- **Spoor 1 (ochtend, code, ~2 u):** de kleine, klaarliggende conversie-fixes die bezoekers méér doen
  klikken en de funnel afleesbaar maken. Echt coderen, maar in dienst van het doel.
- **Spoor 2 (middag, distributie, ~1–2 u):** het ongemakkelijke werk — bezoekers halen. Dit is waar 70%
  van de waarde zit.

Meer dan ~3–4 uur werk per dag is contraproductief; het is vakantie.

---

## Stap 4 — 7-dagenplan (concreet, per dag)

> Cadans: ochtendblok code (90 min timer) + middagblok distributie (60 min). Max 2 blokken/dag. Rest = vakantie.

### Dag 1 (ma) — Nulpunt + kanaalkeuze
**Hoofddoel:** je eigen cijfers kennen en de funnel bewijzen afleesbaar te zijn.
- **Code/meten:** Search Console + GA4 open. Vul de 7-rijen-tabel per `/beste/*`: impressies, positie, klikken.
  Klik zélf op een affiliate-link op een `/beste/*`-pagina en bevestig dat de rij in `affiliate_clicks` landt
  met juiste `pagina`/`categorie`/subid, en dat het GA4-event vuurt. **Zoek de insert-route** die
  `affiliate_clicks` vult en verifieer dat elke uitgaande link hem raakt.
- **Onderzoek:** Heb je een **e-maillijst**? Check `guide_opt_ins` + `premium_waitlist` in Supabase op aantal.
  Zo ja → dat is je snelste, warmste verkeer deze week (kanaal dat je bezit). Kies daarnaast het ene externe
  kanaal (procedure onderaan). Verzamel 15 échte vragen die je doelgroep stelt (uit Reddit/forum-zoek + SC-queries
  zoals "magnesium in combinatie met medicijnen", "welke vitamine d is het beste") en koppel elke vraag aan de
  exacte PSF-pagina die hem beantwoordt.
- **Opgeleverd:** 7-rijen-baseline-tabel · werkende klik→`affiliate_clicks`→GA4-trace · gekozen kanaal + 15 vragen↔pagina's.
- **Overslaan bij weinig tijd:** alleen de baseline-tabel + kanaalkeuze.

### Dag 2 (di) — Dicht de lekken op de pagina's die al ranken
**Hoofddoel:** magnesium en vitamine-d converteren beter.
- **Code:** (1) **Magnesium H1-botsing** (openstaand uit BESLUIT_BESTE_VS §Openstaand): check éérst in SC welke
  URL rankt op "beste magnesium"/"magnesium vergelijken", pas dán de commerciële H1/snippet toe op de winnende
  URL. Noteer CTR-baseline. (2) **vitamine-d on-page:** CTA + "3 producten, geen 20"-hook boven de vouw op 375px;
  vergelijkingstabel snel. (3) Valideer FAQ- + Product-rich-results in Google's Rich Results Test voor
  `/beste/vitamine-d` en `/beste/magnesium`.
- **Klaar-check (src-wijziging):** `grep -rn "console.log" src/` + `npx tsc --noEmit` + `vitest` + `eslint --max-warnings 0`. Commit.
- **Distributie:** eerste 3–4 échte, behulpzame bijdragen in het kanaal, elk naar de pagina die de vraag beantwoordt.
- **Opgeleverd:** magnesium-fix klaar (jij beslist merge) · rich results groen · eerste 3–4 kanaalbijdragen live.

### Dag 3 (wo) — Distributie-push
**Hoofddoel:** eerste ~50 echte mensen op `/beste/*`.
- **Distributie (primair):** 5–7 extra behulpzame bijdragen. Volg referrals in GA4 realtime.
- **Code (licht, max 1–2 u):** heeft een vraag géén goede landingspagina? **Schrijf géén nieuw blog** (val) —
  verbeter de intro van de dichtstbijzijnde bestaande pagina zodat hij de vraag direct beantwoordt, of voeg
  één FAQ-item toe (vuurt schema).
- **Opgeleverd:** eerste referral-sessies zichtbaar in GA4 · notitie welke bijdragen klikken opleverden.

### Dag 4 (do) — Lezen en verdubbelen
**Hoofddoel:** leren wat converteert.
- **Ochtend:** lees de data. Welke posts leverden sessies? Bereikte een sessie een affiliate-klik? Welke vragen keren terug?
- **Code:** één conversieverbetering op basis van wat je zag (bijv. de landingspagina die mensen raken mist een
  duidelijke volgende stap).
- **Distributie:** verdubbel op wat op dag 3 verkeer trok.
- **Opgeleverd:** korte notitie "wat leverde de eerste klikken op".

### Dag 5 (vr) — Consolideren + één klaarliggende SEO-winst
**Hoofddoel:** compounding-winst vastzetten.
- **Code:** rond magnesium af. Optioneel klaarliggend: de omega-3-root-URL's (`/wat-is-omega-3`,
  `/waar-let-je-op-bij-omega-3`) via 301 samenvoegen met `/supplementen/omega-3` **als** SC bevestigt dat ze
  geen eigen impressies hebben (BESLUIT_BESTE_VS §Bevinding 3). Of: het bestaande artikel
  `magnesium-in-combinatie-met-medicijnen.ts` zijn snippet aanscherpen om die 70 impressies te pakken (artikel
  bestaat al — geen nieuw bouwwerk).
- **Distributie:** laatste batch bijdragen + een **herhaalbare wekelijkse cadans** opzetten voor ná de vakantie.
- **Klaar-check + commit.** Branch klaar voor push/deploy (jij beslist).
- **Opgeleverd:** alle code gecommit · kanaal warm te houden na de week.

### Weekend (za/zo) — licht / vrij
Optioneel: 1 pagina retro + het "één kanaal, 3 weken"-vervolgplan. Verder: rust. Het is vakantie.

---

### Minimum viable vacation (chaotische week)
Baseline-cijfers bekend · magnesium H1-fix geshipt · één acquisitiekanaal geopend met de eerste 20–50 echte
bezoekers · funnel afleesbaar. Alleen dit doorbreekt al het "nooit een uur aan distributie".

### Ideale week
Bovenstaande + eerste affiliate-klikken uit extern verkeer + herhaalbare kanaalcadans + vitamine-d/magnesium
CTR-aflezing gestart.

### Stretch
100+ externe bezoekers · eerste meetbare affiliate-conversie · gedocumenteerde les "welk kanaal/welke vraag
converteert" die oktober stuurt.

---

## Stap 5 — Technisch sterk, zonder overengineering

| Prioriteit | Wat | Waarom |
|---|---|---|
| **Must-have** | `affiliate_clicks`-capture end-to-end verifiëren op elke `/beste/*`-uitgaande link (juiste `pagina`/`categorie`/subid) + GA4-event | Zonder afleesbare funnel produceert de kanaaltest géén getal — dan was de hele week voor niets |
| **Must-have** | Magnesium H1/snippet op de rankende URL; CTR-baseline vóór | Klaarliggend, laag risico, meetbaar in 2–3 weken |
| **Should-have** | vitamine-d on-page CTA boven de vouw op 375px; rich-results validatie `/beste/vitamine-d` + `/beste/magnesium` | Doelgroep is mobiel; groter snippet zonder positie te winnen |
| **Should-have** | omega-3-root-URL's 301 → `/supplementen/omega-3` (mits 0 eigen impressies) | Ruimt autoriteitsverdunning op |
| **Nice-to-have** | Eén FAQ-item toevoegen waar een echte vraag geen landing heeft | Vuurt schema, geen nieuw bouwwerk |
| **Niet doen** | Nieuwe `/beste/*`-pagina's · nieuwe blogartikelen in bulk · USDA/`observed` · Kompas/voeding/dashboard · multi-tenancy · Stripe | Stop-lijst; raakt geen bezoeker; USDA hier bovendien API-geblokkeerd |

**Bestanden die je aanraakt:** `src/data/supplements/magnesium.ts`, `src/data/supplements/vitamine-d.ts`,
de `affiliate_clicks`-insertroute (`src/app/api/…` / `src/lib/`), `src/components/supplements/` (CTA-plaatsing),
`next.config.ts` (301 voor omega-3-roots). **Nooit aanraken:** `src/data/affiliate-links.ts` en de
slug-consistentie, `rel="nofollow sponsored"`, het Arctic Blue `sld=`-mechanisme.

---

## Stap 6 — Execution-strategie voor een vakantieweek

- **Uren:** 3–4 gefocust per dag, MAX. Eén 90-min code-blok (timer) + één 60-min distributie-blok. Niet meer.
- **Anti-planning:** je hebt 50+ planningsdocs. Verbod op nieuwe planningsdocs deze week, behalve de dag-1-baseline
  en de vrijdag-retro. Regel: schrijf je een plan i.p.v. te shippen → stop.
- **Bugs:** timebox debuggen op 45 min. Vast? Ship de kleinere versie of park het. Geen konijnenholen op vakantie.
- **Stoppen met een taak:** wanneer de meetbare uitkomst is gehaald óf de timebox verloopt.
- **Dagelijkse "next best action":** vraag elke ochtend "wat is het kleinste dat de **klikteller** of de
  **bezoekersteller** beweegt?" — niet "wat is leuk om te bouwen?".
- **Voortgang meten:** het enige scorebord deze week is **externe bezoekers op `/beste/*` + affiliate-klikken.**
  Commits zijn níet het scorebord.

---

## Stap 7 — Concreet startpunt

**Mijn beslissing:** *"Komende week focus je op **DISTRIBUTIE & CONVERSIE** van wat er al staat — niet op
Kompas/USDA, niet op nieuwe content."*

**Waarom:** je product is af genoeg om omzet te maken en krijgt nul bezoekers. Geen regel code lost dat op;
elke regel vergroot het oppervlak. Distributie is het enige vak waar je nog geen uur in stak — en je eigen
verdict zei dit al vóór de 82 commits die je er alsnog overheen bouwde.

**Eerste coding-sessie:**
- **Exacte doel:** je nulpunt kennen en bewijzen dat de funnel afleesbaar is.
- **Eerste 3 acties:** (1) Search Console open, vul de 7-rijen-tabel `/beste/*` (impr/positie/klikken). (2) Klik
  zelf op een `/beste/*`-affiliate-link en bevestig dat de `affiliate_clicks`-rij + het GA4-event correct landen.
  (3) Schrijf de 15 echte vragen + de exacte PSF-pagina die elk beantwoordt.
- **Eerst openen/inspecteren:** Search Console + GA4; daarna `src/data/supplements/magnesium.ts` en
  `vitamine-d.ts` (snippet/H1) en de `affiliate_clicks`-insertroute.
- **Sessie geslaagd als:** je de 7-rijen-tabel hebt, een geverifieerde end-to-end klik-trace, en 15 vragen aan
  pagina's gekoppeld — en **nul** nieuwe features hebt gebouwd.

**Weekdoel (meetbaar):** ≥50 externe bezoekers op `/beste/*` uit één kanaal, funnel volledig afleesbaar, en de
magnesium H1/snippet-fix geshipt. Ideaal: de eerste affiliate-klik uit extern verkeer.

**Grootste fout om te vermijden:** de week laten ontsporen in nóg een productgolf (USDA/Kompas/voeding) óf in
massaproductie van content (artikel 82–100). Beide voelen productief; beide bewegen nul. Het verdict betrapte
je hier twee weken geleden al op.

---

## Kanaalkeuze-procedure (dag 1, ≤30 min)

1. **Bezit je verkeer?** `guide_opt_ins` + `premium_waitlist` tellen. Heb je ≥50 opt-ins → mail ze deze week één
   eerlijke, behulpzame mail met een link naar de meest relevante `/beste/*`-pagina. Snelste, warmste verkeer,
   kanaal dat je bezit.
2. **Kies één extern kanaal** waar NL-mannen 40+ al over slaap/stress/energie/supplementen praten: Reddit
   (r/thenetherlands + relevante subs), een NL-forum (fok.nl-type, fitness/gezondheid), of een actieve Facebook-groep
   (burnout/40+/kracht). Criterium: waar kun jij **echt behulpzame** antwoorden plaatsen (geen spam) én wekelijks
   volhouden.
3. **Geen advertenties** deze week — zonder conversiedata verbrand je budget (verdict). Een kleine betaalde test
   (€50–100) mag pas als de funnel op dag 1 aantoonbaar afleesbaar is, en dan als *leerbudget*, niet als kanaal.
4. **Regel:** één kanaal, drie weken serieus (deze week is week 1). SEO (snippets/CTR) loopt als compounding
   spoor ernaast, maar levert deze week nog geen mensen — verwacht dat niet.

---

*Bronnen in de repo: `docs/research/VERDICT_MULTITENANT_VOLGORDE_EU_2026-08-30.md` (Deel B),
`docs/research/NULMETING_BESTE_VERGELIJKINGEN_2026-09-02.md`,
`docs/research/BESLUIT_BESTE_VS_SUPPLEMENTEN_2026-09-04.md`,
`docs/plan/ONDERZOEK_SPREIDING_EN_USDA_2026-09.md`, `docs/cursors/pre-traffic-gates-2026-07.md`.*
