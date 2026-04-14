# PerfectSupplement — Systeemplan

**Van content-site naar data-gedreven gezondheidsplatform**
*Versie 1.0 — April 2026*

---

## Samenvatting

PerfectSupplement staat op een kantelpunt. De site heeft een sterk fundament: een helder doelgroepprofiel (mannen 40+), een geloofwaardige methodologie, en een vierstappen-structuur die logisch aanvoelt. Maar onder de motorkap ontbreekt het belangrijkste: een systeem dat leert.

Dit plan transformeert Stap 2 (Leefstijl) van een passieve informatiepagina naar een intelligente intake — een gestructureerde vragenlijst die twee dingen tegelijk doet: de gebruiker concreet advies geven, én het platform slimmer maken met elke interactie.

Het plan behandelt zeven lagen: gebruikersflow, vragenlijst-ontwerp, datamodel, beslislogica, zelflerend systeem, UX-vereenvoudiging en strategische taal.

---

## 1. Gebruikersflow — De hele reis opnieuw

### Huidig probleem

De vier stappen (Symptomen → Leefstijl → Supplementen → Progressie) zijn nu losse pagina's. Er is geen doorlopende lijn. Stap 1 herkent, maar onthoudt niets. Stap 2 verwijst naar methodologie. Stap 3 toont productcategorieën. Stap 4 linkt naar blogartikelen. Er is geen personalisatie, geen geheugen, geen feedback.

### Nieuwe flow: vijf fasen

**Fase 1 — Herkenning** *(huidige Stap 1, licht aangepast)*
De gebruiker selecteert symptomen. Maar in plaats van alleen informatie tonen, slaat het systeem de selectie op als `symptom_profile`. Dit wordt de startwaarde voor alles wat volgt.

**Fase 2 — Diagnose** *(nieuwe Stap 2, de kern van dit plan)*
Een korte, slimme vragenlijst (maximaal 12 vragen, verdeeld over 6 categorieën) die de symptomen verbindt met leefstijlpatronen. Het resultaat is een `lifestyle_profile` met scores per domein.

**Fase 3 — Advies** *(huidige Stap 3, data-gestuurd)*
Op basis van het gecombineerde profiel genereert het systeem een geprioriteerde aanbeveling: eerst leefstijlaanpassingen ("quick wins"), dan gerichte supplementen. Niet langer een productcatalogus, maar een persoonlijk plan.

**Fase 4 — Actie** *(nieuw)*
De gebruiker krijgt een concreet 30-dagenplan: welke gewoonten aanpassen, welke supplementen overwegen, en wanneer opnieuw meten. Dit is de brug tussen weten en doen.

**Fase 5 — Feedback** *(huidige Stap 4, geactiveerd)*
Na 30 dagen vult de gebruiker dezelfde vragenlijst opnieuw in. Het systeem vergelijkt, toont vooruitgang, en past aanbevelingen aan. Dit sluit de feedbackloop.

### Visueel

```
Herkenning → Diagnose → Advies → Actie → Feedback
     ↑                                        |
     └────────────────────────────────────────┘
                   (elke 30 dagen)
```

---

## 2. Vragenlijst-ontwerp — Stap 2 in detail

### Ontwerpprincipes

Elke vraag moet aan twee criteria voldoen: (a) de gebruiker begrijpt direct waarom deze vraag relevant is, en (b) het antwoord is kwantificeerbaar voor het datamodel. Vragen die alleen "leuk om te weten" zijn, worden geschrapt.

Maximaal 12 vragen. Twee per categorie. Keuze uit meervoudige opties of een schaal van 1–5.

### Categorie 1: Slaap

**Vraag 1.1 — Slaapkwaliteit**
*"Hoe voel je je gemiddeld als je wakker wordt?"*
Antwoordopties: (A) Uitgerust en helder (B) Redelijk, maar niet optimaal (C) Moe, alsof ik niet geslapen heb (D) Wisselend, verschilt per dag
Variabele: `sleep_quality` → waarde 4/3/1/2
Data-tag: `SLP_QUAL`

**Vraag 1.2 — Slaapritme**
*"Lukt het je om op een vast tijdstip te gaan slapen en wakker te worden?"*
Antwoordopties: (A) Ja, vrij consistent (B) Meestal wel, soms niet (C) Nee, mijn ritme is onregelmatig
Variabele: `sleep_consistency` → waarde 3/2/1
Data-tag: `SLP_CONS`

### Categorie 2: Energie

**Vraag 2.1 — Energieniveau**
*"Hoe zou je je energieniveau overdag omschrijven?"*
Antwoordopties: (A) Stabiel de hele dag (B) Goed in de ochtend, dip in de middag (C) Laag vanaf het begin (D) Wisselend en onvoorspelbaar
Variabele: `energy_pattern` → waarde 4/2/1/2
Data-tag: `NRG_PATN`

**Vraag 2.2 — Energiebronnen**
*"Waar leun je op voor energie?"*
Antwoordopties: (A) Koffie of energiedrank (meer dan 3 per dag) (B) Koffie of energiedrank (1–2 per dag) (C) Ik heb weinig stimulanten nodig (D) Ik gebruik regelmatig suiker of snacks als opkikker
Variabele: `energy_dependency` → waarde 1/2/4/1
Data-tag: `NRG_DEP`

### Categorie 3: Stress

**Vraag 3.1 — Stressbeleving**
*"Hoe vaak voel je je gestrest of overprikkeld?"*
Antwoordopties: (A) Zelden (B) Soms, maar beheersbaar (C) Regelmatig (D) Dagelijks of bijna dagelijks
Variabele: `stress_frequency` → waarde 4/3/2/1
Data-tag: `STR_FREQ`

**Vraag 3.2 — Herstelvermogen**
*"Als je een drukke of stressvolle dag hebt gehad, hoe snel kom je tot rust?"*
Antwoordopties: (A) Vrij snel, ik kan goed loslaten (B) Het kost me wat tijd, maar lukt wel (C) Ik neem stress mee naar bed (D) Ik merk dat stress zich opstapelt over dagen
Variabele: `stress_recovery` → waarde 4/3/1/1
Data-tag: `STR_RECV`

### Categorie 4: Voeding

**Vraag 4.1 — Eetpatroon**
*"Hoe zou je je dagelijkse eetpatroon omschrijven?"*
Antwoordopties: (A) Gevarieerd met groente, eiwitten en vetten (B) Redelijk, maar niet altijd bewust (C) Onregelmatig of eenzijdig (D) Veel bewerkt voedsel en weinig groente
Variabele: `nutrition_quality` → waarde 4/3/2/1
Data-tag: `NUT_QUAL`

**Vraag 4.2 — Vetzuurinname**
*"Eet je regelmatig vette vis (zalm, makreel, sardines)?"*
Antwoordopties: (A) 2x per week of vaker (B) Ongeveer 1x per week (C) Zelden of nooit
Variabele: `omega3_intake` → waarde 3/2/1
Data-tag: `NUT_O3`

### Categorie 5: Beweging

**Vraag 5.1 — Bewegingsfrequentie**
*"Hoe vaak beweeg je intensief (sport, krachtraining, hardlopen)?"*
Antwoordopties: (A) 3x per week of meer (B) 1–2x per week (C) Minder dan 1x per week (D) Zelden of nooit
Variabele: `movement_frequency` → waarde 4/3/2/1
Data-tag: `MOV_FREQ`

**Vraag 5.2 — Dagelijkse activiteit**
*"Hoeveel beweeg je buiten sport om (wandelen, fietsen, staan)?"*
Antwoordopties: (A) Veel — ik sta en loop de hele dag (B) Gemiddeld — ik wissel zitten en bewegen af (C) Weinig — ik zit het grootste deel van de dag
Variabele: `daily_activity` → waarde 3/2/1
Data-tag: `MOV_DAILY`

### Categorie 6: Herstel

**Vraag 6.1 — Fysiek herstel**
*"Hoe snel herstel je na inspanning (sport, fysiek werk)?"*
Antwoordopties: (A) Binnen een dag (B) Duurt 2–3 dagen (C) Ik voel me langer moe of stijf
Variabele: `physical_recovery` → waarde 3/2/1
Data-tag: `RCV_PHYS`

**Vraag 6.2 — Mentaal herstel**
*"Neem je bewust momenten van rust of ontspanning?"*
Antwoordopties: (A) Ja, dagelijks (meditatie, wandeling, ademhaling) (B) Soms, maar niet structureel (C) Nee, daar kom ik niet aan toe
Variabele: `mental_recovery` → waarde 3/2/1
Data-tag: `RCV_MENT`

---

## 3. Datamodel

### Laag 1: Ruwe scores (UserProfile)

```
UserProfile {
  user_id              : string
  created_at           : timestamp
  symptom_profile      : string[]       // uit Stap 1
  
  // Slaap
  sleep_quality        : int (1-4)      // SLP_QUAL
  sleep_consistency    : int (1-3)      // SLP_CONS
  
  // Energie
  energy_pattern       : int (1-4)      // NRG_PATN
  energy_dependency    : int (1-4)      // NRG_DEP
  
  // Stress
  stress_frequency     : int (1-4)      // STR_FREQ
  stress_recovery      : int (1-4)      // STR_RECV
  
  // Voeding
  nutrition_quality    : int (1-4)      // NUT_QUAL
  omega3_intake        : int (1-3)      // NUT_O3
  
  // Beweging
  movement_frequency   : int (1-4)      // MOV_FREQ
  daily_activity       : int (1-3)      // MOV_DAILY
  
  // Herstel
  physical_recovery    : int (1-3)      // RCV_PHYS
  mental_recovery      : int (1-3)      // RCV_MENT
}
```

### Laag 2: Domeinscores (berekend)

Elke categorie krijgt een genormaliseerde score van 0–100 door de ruwe waarden om te rekenen naar percentages van hun maximale waarde.

```
DomainScores {
  sleep_score     : (sleep_quality + sleep_consistency) / 7 × 100
  energy_score    : (energy_pattern + energy_dependency) / 8 × 100
  stress_score    : (stress_frequency + stress_recovery) / 8 × 100
  nutrition_score : (nutrition_quality + omega3_intake) / 7 × 100
  movement_score  : (movement_frequency + daily_activity) / 7 × 100
  recovery_score  : (physical_recovery + mental_recovery) / 6 × 100
}
```

### Laag 3: Afgeleide signalen

```
DeficiencySignals {
  omega3_deficiency    : true als NUT_O3 ≤ 1
  magnesium_signal     : true als SLP_QUAL ≤ 2 EN STR_RECV ≤ 2
  cortisol_risk        : true als STR_FREQ ≤ 2 EN SLP_CONS ≤ 1
  recovery_deficit     : true als RCV_PHYS ≤ 1 EN MOV_FREQ ≥ 3
  energy_crash_pattern : true als NRG_PATN ≤ 2 EN NRG_DEP ≤ 2
}

PriorityScore {
  // Laagste domeinscore bepaalt het primaire aandachtsgebied
  primary_domain   : domein met laagste score
  secondary_domain : domein met op-één-na-laagste score
  overall_health   : gemiddelde van alle domeinscores
}

UrgencyLevel {
  critical  : 2+ domeinscores onder 30
  moderate  : 1 domeinscore onder 30, of 3+ onder 50
  mild      : alle scores boven 30, maar 2+ onder 60
  healthy   : alle scores boven 60
}
```

### Laag 4: Aanbevelingsclusters

```
RecommendationCluster {
  cluster_id    : string
  name          : string       // bijv. "Slaap & Stress Herstel"
  domains       : string[]     // gekoppelde domeinen
  lifestyle     : string[]     // leefstijladviezen
  supplements   : string[]     // supplementsuggesties
  quick_wins    : string[]     // eerste 7 dagen
  long_term     : string[]     // 30-dagen strategie
}
```

---

## 4. Beslislogica (Decision Engine)

### Basisregels

De engine werkt met een prioriteitssysteem: eerst het domein met de laagste score aanpakken, omdat verbeteringen daar het meeste impact hebben.

**Regel 1 — Slaap als fundament**
ALS `sleep_score < 40` → Slaap wordt altijd het primaire aandachtsgebied, ongeacht andere scores. Redenering: zonder goede slaap werkt geen enkele andere interventie optimaal.

**Regel 2 — Stress-slaap koppeling**
ALS `sleep_score < 50` EN `stress_score < 50` → Activeer cluster "Stress-Slaap Spiraal". Leefstijl: vast slaapritme + ademhalingsoefeningen. Supplementen: magnesium glycinaat + ashwagandha.

**Regel 3 — Energie zonder basis**
ALS `energy_score < 40` EN `nutrition_score < 50` → Energie-advies richt zich eerst op voeding, niet op supplementen. Quick win: eiwitrijk ontbijt.

**Regel 4 — Omega-3 signaal**
ALS `omega3_intake = 1` (zelden vis) → Omega-3 supplementatie is bijna altijd relevant. Dit is een van de weinige "universele" aanbevelingen.

**Regel 5 — Overtraining-signaal**
ALS `movement_frequency ≥ 3` EN `physical_recovery ≤ 1` → Waarschuw voor mogelijke overtraining. Advies: rustdagen, magnesium, eiwitinname checken.

**Regel 6 — Cortisolrisico**
ALS `stress_frequency ≤ 2` EN `sleep_consistency ≤ 1` EN `energy_pattern ≤ 2` → Hoog cortisolrisico. Prioriteit: stressmanagement vóór supplementen. Supplementen: ashwagandha, magnesium, eventueel vitamine D.

### Outputstructuur

Elke gebruiker krijgt een resultaat in drie lagen:

**Laag A — Quick Wins (Week 1)**
Maximaal 3 concrete, kleine aanpassingen. Voorbeelden: "Zet je telefoon om 21:00 op vliegtuigmodus", "Voeg een handvol noten toe aan je lunch", "Wandel 10 minuten na het avondeten".

**Laag B — Supplementadvies (Week 1–4)**
Maximaal 2 supplementen, geprioriteerd op basis van het profiel. Altijd met uitleg waarom dit supplement bij dit profiel past, en een link naar de vergelijkingspagina.

**Laag C — Langetermijnstrategie (Maand 2+)**
Structurele aanpassingen die meer inspanning vragen maar meer opleveren. Voorbeelden: "Bouw krachttraining op naar 3x per week", "Experimenteer met een vast eetvenster".

---

## 5. Zelflerend systeem

### Het probleem dat we oplossen

Nu is elk advies statisch: dezelfde input geeft dezelfde output, ongeacht of het advies werkt. Het systeem leert niets van zijn eigen aanbevelingen.

### De drie datasporen

**Spoor 1 — Inputs (wat de gebruiker invult)**
Elke vragenlijst-invulling wordt opgeslagen met tijdstempel. Na verloop van tijd ontstaat een dataset die laat zien welke profieltypen het meest voorkomen, welke antwoordcombinaties samen optreden, en welke patronen correleren met specifieke symptomen.

**Spoor 2 — Outputs (wat het systeem aanbeveelt)**
Elke aanbeveling wordt gelogd: welke supplementen, welke leefstijladviezen, welk urgentieniveau. Dit maakt het mogelijk om te analyseren welke aanbevelingen het vaakst worden gegeven en of de beslisregels voldoende differentiëren.

**Spoor 3 — Outcomes (wat er verandert)**
Wanneer een gebruiker na 30 dagen opnieuw de vragenlijst invult, kan het systeem delta's berekenen per domein. Dit is het meest waardevolle dataspoor: het laat zien welke adviezen daadwerkelijk leiden tot verbetering.

### De feedbackloop

```
Intake (T=0) → Advies → Actie → Herhaalmeting (T=30)
                                        |
                                        ↓
                              Delta per domein berekend
                                        |
                                        ↓
                         Koppeling: welk advies → welke delta?
                                        |
                                        ↓
                    Patroonherkenning over alle gebruikers
                                        |
                                        ↓
                        Beslisregels worden aangescherpt
```

### Fase 1 — Regelgebaseerd (nu)

Start met de handmatige regels uit sectie 4. Geen AI nodig, alleen logica. Dit werkt voor de eerste honderden gebruikers en geeft een baseline.

### Fase 2 — Patroonherkenning (bij 500+ gebruikers)

Met voldoende data kunnen clusters worden geïdentificeerd: groepen gebruikers met vergelijkbare profielen die vergelijkbaar reageren op bepaalde adviezen. Dit kan met simpele statistische analyse, zonder machine learning.

Voorbeeldpatroon: "Gebruikers met sleep_score < 35 en stress_score < 40 die magnesium + ademhalingsoefening kregen, toonden gemiddeld +18 punten verbetering op sleep_score na 30 dagen."

### Fase 3 — Voorspellend model (bij 2000+ gebruikers)

Op dit punt is het mogelijk om met een eenvoudig ML-model (decision tree of gradient boosting) te voorspellen welk advies de hoogste kans op verbetering geeft voor een specifiek profiel. Het model wordt getraind op de input-output-outcome triades.

### Privacy en ethiek

Alle data is geanonimiseerd. Er worden geen medische diagnoses gesteld. Het systeem geeft adviezen, geen behandelingen. De disclaimer-structuur die nu al op de site staat, vormt een goede basis.

---

## 6. UX-vereenvoudiging

### Wat te VERWIJDEREN

- De losse "Leefstijl"-pagina die nu naar Methodologie verwijst. Vervang door de vragenlijst.
- De generieke supplementcatalogus als eerste view in Stap 3. Vervang door persoonlijke aanbeveling.
- De "Progressie"-stap die nu naar blog linkt. Vervang door herhaalmeting.
- Dubbele navigatiepaden (dezelfde content bereikbaar via 3+ routes).
- Alle tekst die uitlegt wat het systeem doet in plaats van het te doen.

### Wat te MERGEN

- Symptomen (Stap 1) en Vragenlijst (Stap 2) worden één doorlopende intake-flow. De gebruiker ervaart het als één moment, het systeem slaat twee datalaagen op.
- Supplementvergelijkingen en persoonlijk advies worden samengevoegd: de gebruiker ziet eerst wat voor hém relevant is, en kan dan doorklikken naar de vergelijking.
- Blog en Progressie worden verbonden: na een herhaalmeting krijgt de gebruiker relevante artikelen op basis van zijn verbeterpunten.

### Wat te AUTOMATISEREN

- Profielberekening: scores worden direct na invullen berekend, geen handmatige stap.
- Aanbevelingsprioritering: de beslislogica bepaalt de volgorde, niet de gebruiker.
- Herinnering voor herhaalmeting: na 30 dagen een signaal (e-mail of in-app).
- Artikelsuggestie: op basis van het profiel, niet op basis van publicatiedatum.

### UX-principes voor de vragenlijst

- Eén vraag per scherm op mobiel.
- Voortgangsindicator (6 stappen, niet 12 vragen — groepeer per categorie).
- Direct visuele feedback na elke categorie ("Je slaapscore: 45/100").
- Geen mogelijkheid om vragen over te slaan (het systeem heeft alle data nodig).
- Totale invultijd: maximaal 3 minuten.

---

## 7. Strategische taal

### Gebruikersprofielen (User States)

In plaats van klinische termen, krijgen profielen herkenbare namen:

| Profielnaam | Trigger | Betekenis |
|---|---|---|
| **Lage Batterij** | `energy_score < 40` | Chronisch energietekort, vaak gekoppeld aan voeding of slaap |
| **Onrustige Slaper** | `sleep_score < 40` | Slaapkwaliteit structureel onder de maat |
| **Stressdrager** | `stress_score < 40` | Chronische stressbelasting zonder voldoende herstel |
| **Stille Slijter** | `recovery_score < 35` | Fysiek en mentaal onvoldoende herstel, vaak onopgemerkt |
| **Basis Mist** | `nutrition_score < 40` | Voedingspatroon mist essentiële bouwstenen |
| **Overtrainer** | `movement ≥ 3` EN `recovery ≤ 1` | Veel inspanning, te weinig herstel |

### Outputnamen

- **Herstelplan** — het persoonlijke adviesresultaat na de vragenlijst
- **Quick Wins** — de eerste 3 acties voor week 1
- **Supplementroute** — de geprioriteerde supplementsuggesties
- **Voortgangscheck** — de herhaalmeting na 30 dagen
- **Delta-rapport** — het verschil tussen twee metingen

### Scores

- **Slaapkracht** — de slaapscore in het profiel
- **Energiebalans** — de energiescore
- **Stressbelasting** — de stressscore (omgekeerd: hoog = slecht)
- **Voedingsbodem** — de voedingsscore
- **Beweegkracht** — de bewegingsscore
- **Herstelvermogen** — de herstelscore

### Tone of voice

De taal is direct, warm en mannelijk zonder macho te zijn. Vergelijk:

❌ *"Uw testosteronspiegel kan suboptimaal zijn door chronische hypothalamus-hypofyse-bijnier-as-dysregulatie."*

✅ *"Je lichaam herstelt niet goed genoeg. Dat vreet aan je energie. Hier is wat je eraan kunt doen."*

---

## 8. Implementatie-roadmap

### Sprint 1 (Week 1–2) — Vragenlijst bouwen

Bouw de 12 vragen als interactieve flow in de bestaande Next.js-omgeving. Sla resultaten op in een simpele database (Supabase, Firestore, of zelfs lokaal). Bereken domeinscores in de frontend als eerste MVP.

### Sprint 2 (Week 3–4) — Beslislogica implementeren

Implementeer de 6 basisregels. Koppel regels aan outputtemplates (Herstelplan, Quick Wins, Supplementroute). Genereer een gepersonaliseerde resultatenpagina.

### Sprint 3 (Week 5–6) — Intake-flow samenvoegen

Merge Stap 1 (Symptomen) en Stap 2 (Vragenlijst) tot één doorlopende intake. Bouw voortgangsindicator. Test op mobiel.

### Sprint 4 (Week 7–8) — Herhaalmeting

Bouw de feedback-flow: zelfde vragenlijst, delta-berekening, voortgangsrapport. Implementeer e-mailherinnering (of notificatie).

### Sprint 5 (Week 9–12) — Data-pipeline

Sla alle input-output-outcome triades gestructureerd op. Bouw een simpel dashboard om patronen te bekijken. Begin met handmatige analyse.

### Doorlopend — Leren en aanscherpen

Verfijn beslisregels op basis van data. Voeg nieuwe vragen toe als blijkt dat bepaalde domeinen meer differentiatie nodig hebben. Schaal naar ML wanneer het volume het toelaat.

---

## Bijlage: Volledige variabelenlijst

| Data-tag | Variabele | Type | Bereik | Categorie |
|---|---|---|---|---|
| `SLP_QUAL` | sleep_quality | int | 1–4 | Slaap |
| `SLP_CONS` | sleep_consistency | int | 1–3 | Slaap |
| `NRG_PATN` | energy_pattern | int | 1–4 | Energie |
| `NRG_DEP` | energy_dependency | int | 1–4 | Energie |
| `STR_FREQ` | stress_frequency | int | 1–4 | Stress |
| `STR_RECV` | stress_recovery | int | 1–4 | Stress |
| `NUT_QUAL` | nutrition_quality | int | 1–4 | Voeding |
| `NUT_O3` | omega3_intake | int | 1–3 | Voeding |
| `MOV_FREQ` | movement_frequency | int | 1–4 | Beweging |
| `MOV_DAILY` | daily_activity | int | 1–3 | Beweging |
| `RCV_PHYS` | physical_recovery | int | 1–3 | Herstel |
| `RCV_MENT` | mental_recovery | int | 1–3 | Herstel |

---

*Dit document is een levend plan. Elke sectie kan onafhankelijk worden geïmplementeerd en getest. De kracht zit niet in de complexiteit, maar in de samenhang: elk onderdeel voedt het volgende.*
