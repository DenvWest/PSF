# Beweegcockpit (Dashboard Main) als persoonlijk commandocentrum — ontwerpdocument

> **Status (22 jul 2026): productontwerp / ruimtelijke informatie-architectuur. Geen code, geen implementatie.**
> Derde document in de reeks, op een nieuwe as:
> - [`BLAUWDRUK_BEWEEGSYSTEEM_DASHBOARD_STAPPENPLAN.md`](BLAUWDRUK_BEWEEGSYSTEEM_DASHBOARD_STAPPENPLAN.md) — de **surfaces** (tegels, states, sync).
> - [`ONTWERP_BEWEEGDASHBOARD_BESTURINGSSYSTEEM.md`](ONTWERP_BEWEEGDASHBOARD_BESTURINGSSYSTEEM.md) — het **conceptuele** (vier vragen, datatransformatie, betekenis-motor).
> - **Dit document** — de **ruimtelijke laag**: header, navigatie, drie-zone-werkruimte, rechter contextpaneel, responsive shell (desktop/tablet/mobile), componentbibliotheek. Hoe het geheel *aanvoelt als een centrale werkplek* i.p.v. een scroll-lijst.
> **Referentie:** de HCI One-agenda-screenshot is gebruikt als **informatiearchitectuur-referentie** (twee-rijige header, centraal canvas, rechter inspector) — géén visuele kopie. Eigen identiteit, passend bij *Bewegen na 40*.
> **Verankerd tegen `main`.** Alle namen verwijzen naar bestaande of voorgestelde PSF-artefacten. Verandert geen enkele DEFER/FREEZE/KILL-status.

---

## 0. Leeswijzer & verankering

### 0.1 Wat er nú staat (het vertrekpunt)

De huidige dashboard-shell (`Dashboard.tsx`) is één **donkere, verticale scroll-pagina**:

- **`DashHeader`** — minimaal: Wordmark links, twee icoon-knoppen rechts (Instellingen → `/account`, Uitloggen). Geen modulenavigatie.
- **`DomainTopNav`** — een tweede-laags *segmented control* (Kompas-knop + 5 pijler-tabs: slaap · beweging · voeding · stress · verbinding). Dit is al een embryonale "tweede navigatielaag".
- **Body** — `Greeting` → "Je grootste hefboom" → `ActiveHabitCard` (de check-off) → pijlerladder → signalen → hermeting-strip. Alles onder elkaar, één kolom.
- **Per-domein "screens"** — `BewegingScreen` → `MovementCockpit` (de zes beweeg-tegels), idem Stress/Sleep/Verbinding. Plus `AgendaScreen` (planner) en `VoortgangHub`.
- **Tab-shell** — Kompas / Voortgang / Hermeting (`DASHBOARD_TABS`).

**Wat ontbreekt t.o.v. een echte cockpit** en wat HCI wél heeft: (a) een **twee-rijige header** met modulenavigatie, (b) een **rechter contextpaneel** dat meebeweegt met wat je aankijkt, (c) een **vaste chrome met scrollend canvas** i.p.v. de hele pagina die scrolt.

### 0.2 De centrale herontwerp-these

> HCI One is een **professionele werkplek voor iemand die veel patiënten beheert**. Onze cockpit is een **persoonlijke werkplek voor één reis: die van jou.**

Dat verschil bepaalt álles. Bij HCI is de spil "welke patiënt / welke medewerker" (de entiteit-picker in rij 2). Bij ons is de spil altijd hetzelfde: **jij, vandaag, op weg naar Future You.** Die entiteit-picker verdwijnt dus — en dat maakt de tweede header-rij vrij voor iets veel persoonlijkers: je **reis-Kompas** (§4).

We stelen van HCI de *structuur* (persistente oriëntatie, centraal focuspunt, contextuele inspector, vaste chrome). We verwerpen de *dichtheid en klinische neutraliteit* (40 gekleurde blokken, EPD-koelte). Het resultaat moet voelen als een premium zorg-/begeleidingsplatform, niet als een EPD of een fitness-app.

### 0.3 Botsingen met gelockte PSF-besluiten (omarmen ≠ klakkeloos overnemen)

De prompt vraagt een aantal dingen die spanning geven met vastgelegde noordsterren (rust, één primaire actie, geen overvol dashboard). Waar dat botst, verzoen ik expliciet:

| Prompt-wens | Verzoening | Reden |
|---|---|---|
| Altijd-aan rechter contextpaneel vol widgets | ⚠️ **Contextueel paneel** — verschijnt met één relevant object, niet een muur | "Rust in de interface" + max cognitive load; HCI's inspector toont ook één ding (de afspraak) |
| "Berichten" in de header | ⚠️ **Toekomst-slot** (coach/zorgverlener), niet dag-1 | PSF is mono-tenant consumenten-site; er is geen messaging-systeem |
| Floating Action Button | ⚠️ **Contextueel**, niet permanent | Een persistente FAB creëert een tweede primaire actie naast de hero-check-off (§13) |
| "Mijn Doelen" als los tabblad met targets | ⚠️ Doelen = **anker + route**, procesgericht | Geen resultaat-targets als dagelijkse stok (blauwdruk §4.4) |
| Notificaties/push | ⚠️ **Gefaseerd**: in-app → e-mail (Resend) → web push | Web-first, geen native app (blauwdruk §0.1) |
| Volledige breedte benutten | ✅ **Ja**, met een dashboard-specifieke bredere shell | CLAUDE.md `Container max-w-7xl` geldt content-pagina's; de cockpit is een app-surface — gemotiveerde uitzondering (§10.4) |

De **vier invarianten** (uit besturingssysteem §14.2) blijven heilig in élk zone-ontwerp: **één check-off** (de VANDAAG-hero), **één score** (engine), **dagstap altijd gratis**, **geen gamification**.

---

## 1. Cockpit-visie

**De cockpit is het hart van de applicatie — de gebruiker hoeft nergens anders te beginnen.** Vanuit één scherm ziet hij waar hij staat, waar hij heen wil, start hij zijn beweegplan, bekijkt hij voortgang, past hij doelen aan, doet hij een check-in en krijgt hij inzicht. Geen verzameling widgets: een **intelligent werkcentrum** dat meebeweegt met de dag.

Drie eigenschappen onderscheiden een cockpit van een dashboard:

1. **Persistente oriëntatie.** Je weet altijd waar je bent in je reis (de Kompas-rail, §4) én in de app (de modulenav, §3). Nooit verdwaald.
2. **Eén centraal focuspunt.** Het midden toont precies één ding dat er nu toe doet — VANDAAG. Alles eromheen *kadert* dat, concurreert er niet mee.
3. **Contextuele diepte zonder navigatie.** Het rechter paneel (desktop) / de bottom sheet (mobiel) toont détail van wat je aankijkt — waarom deze stap, wat komt hierna — zónder de pagina te verlaten. Je blijft in flow.

De emotionele belofte: **rust, vertrouwen, begeleiding, persoonlijk, professioneel.** Geen ziekenhuisgevoel, geen fitnessgevoel. Een systeem dat naast je staat en de weg wijst.

---

## 2. Analyse van HCI-principes

De HCI One-screenshot ontleed als informatiearchitectuur — zeven principes, en per principe de vertaling naar onze cockpit.

### 2.1 De anatomie van HCI (wat je ziet)

```
┌─ RIJ 1 · PRIMAIRE HEADER ────────────────────────────────────────────────┐
│ [logo]   Agenda* · Patiënt · Dossier · Statistieken · …   [🎴][✉46][Welkom, …▾] │
├─ RIJ 2 · CONTEXTUELE TOOLBAR ────────────────────────────────────────────┤
│ Medewerker▾ [patiënt-zoek……] │ Dag Dag+7 Werkweek* Week Maand │ Anoniem │ ← Vandaag → │ Aanmeldlijst │
├──────────────────────────────────────────────────┬───────────────────────┤
│ CENTRAAL CANVAS (weekagenda, tijdrijen 6–19u)     │ RECHTER INSPECTOR      │
│  ma  di  wo*  do  vr                              │ ┌ Afspraak ──────────┐ │
│  ▊groen ▊oranje ▊blauw "Niet inplannen" ▊grijs    │ │ Datum · Tijd ·      │ │
│  ─── rode lijn = nu ───                           │ │ Medewerker · Vestiging│
│                                                    │ └────────────────────┘ │
└──────────────────────────────────────────────────┴───────────────────────┘
```

### 2.2 De zeven principes en hun vertaling

| # | HCI-principe | Waarom het werkt | Vertaling naar onze cockpit |
|---|---|---|---|
| 1 | **Duidelijke header** | Brand + module + identiteit in één blik | Twee-rijige header (§3): brand + modulenav + persoonlijk cluster |
| 2 | **Centrale werkruimte** | Eén dominant canvas, alles kadert het | VANDAAG-hero domineert het midden (§5) |
| 3 | **Vaste navigatie** | Chrome blijft staan, canvas scrolt | Sticky header + sticky Kompas-rail; alleen het midden scrolt (§10) |
| 4 | **Rechter informatiepaneel** | Détail zonder pagina-wissel → flow | Contextueel inspector-paneel (§5, §9) |
| 5 | **Logische hiërarchie** | Progressief specifieker top→onder | brand → module → reis-fase → dag → object (§3–5) |
| 6 | **Weinig cognitieve belasting** | Kleur = status, niet decoratie; vaste plekken | Sage-accent = focus; rustige readouts; geen 40 blokken (§13) |
| 7 | **Eén centrale focus** | De agenda is de ster | VANDAAG is de ster; de rest is context |

### 2.3 Wat we bewust *niet* overnemen

- **De dichtheid.** HCI toont ~40 gekleurde blokken tegelijk — passend voor een planner die een volle week overziet, dodelijk voor rust. Onze doelgroep (mannen 40+, vaak eerder afgehaakt) heeft één helder ding nodig, niet een muur.
- **De entiteit-picker (Medewerker/Patiënt).** Er is maar één "patiënt": jij. Die hele spil vervalt en maakt rij 2 vrij voor de reis-Kompas.
- **Klinische neutraliteit.** HCI is bewust kleurloos-functioneel. Wij zijn warm, persoonlijk, identiteit-eerst — Headspace-kalmte, geen EPD-koelte.
- **Statuskleur als primaire taal.** HCI codeert alles in groen/oranje/blauw/grijs. Wij gebruiken kleur spaarzaam (één sage-accent op de focus); status tonen we in taal en rustige iconen (● NU / ○ toekomst / ✓ gedaan).

> **De kern die we stelen:** de **twee-rijige header** (module + context) en het **rechter inspector-paneel**. Dat zijn de twee structurele upgrades die van een scroll-pagina een werkplek maken.

---

## 3. Nieuwe Header

### 3.1 Structuur — twee rijen, oplopende specificiteit

```
┌─ RIJ 1 · IDENTITEIT + MODULE ───────────────────────────────────────────────────┐
│ [Wordmark]   Mijn Dag*   Mijn Week   Mijn Voortgang   Mijn Doelen   Meer▾         │
│                                                        [🔔]  [◐ profiel ▾]  [⚙]   │
├─ RIJ 2 · KOMPAS (reis-navigatie, §4) ───────────────────────────────────────────┤
│ 📍 Hier begon je → ❤️ Waarom → 🎯 Mijn doel → 🚶 Vandaag* → 📈 Mijn groei → ⭐ Future You │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Rij 1 — modulenavigatie (vervangt `DashHeader`)

| Zone | Item | Mapt op (PSF) | Status |
|---|---|---|---|
| **Links** | Wordmark → `/` | bestaat | behouden |
| **Midden** | **Mijn Dag** (default) | VANDAAG-hero / `day-model` | bestaat, wordt landing |
| | **Mijn Week** | `AgendaScreen` / `buildWeekSchedulePreview` | bestaat (planner) |
| | **Mijn Voortgang** | `VoortgangHub` / leefstijllijn | bestaat |
| | **Mijn Doelen** | anker (`movementAnchor`) + route-ladder | bestaat, herkaderd als "doelen" |
| | **Meer ▾** | overflow: Gids · Inzichten · Supplementen · Hermeting | bestaat, gebundeld |
| **Rechts** | 🔔 **Notificaties** | in-app → e-mail → push (gefaseerd) | deels; push = later |
| | ◐ **Profiel ▾** | `/account` (naam, uitloggen) | bestaat |
| | ⚙ **Instellingen** | `/account` (anker/startpatroon/privacy) | bestaat |
| | *(Berichten / Help)* | **toekomst-slot** (coach/zorgverlener) | gated, §15 |

**Reconciliatie met de prompt:** de prompt noemt "Berichten" en "Help" prominent (à la HCI's ✉46-badge). PSF heeft (nog) geen berichten-systeem — dat impliceert een coach/zorgverlener-relatie die pas in de toekomstvisie (§15) landt. We **reserveren de plek** in het rechter cluster maar activeren 'm niet op dag 1. Zo is de header future-proof zonder dood gewicht.

### 3.3 De identiteit van de header — rust, geen ziekenhuis, geen sportschool

| Aspect | Keuze | Waarom |
|---|---|---|
| Achtergrond | Donker, licht doorschijnend (`bg-white/[0.045]` + `backdrop-blur`) — zoals `DomainTopNav` nu | Cockpit-atmosfeer, "staand besluit" |
| Typografie | Modulenav DM Sans, medium; actieve module met sage onderstreping | Rustig, professioneel |
| Actief-indicatie | Onderstreping in pijler-accent, geen gevulde knop | Oriëntatie zonder lawaai |
| Iconen | Lijn-iconen (`@/components/app/icons`), 18px | Geen medaille/vlam (anti-gamification) |
| Hoogte | Rij 1 ~56px, rij 2 ~44px; samen sticky | Compact, canvas krijgt ruimte |
| Sfeer-anker | Naam "Mijn Dag" i.p.v. "Agenda" | Persoonlijk, niet administratief |

### 3.4 Waarom "Mijn Dag" en niet "Agenda"

"Agenda" is HCI-taal — het suggereert afspraken-beheer. "Mijn Dag" is besturingssysteem-taal: het opent op de **ene stap van vandaag** (VANDAAG-hero), niet op een lege weekgrid. De week (`AgendaScreen`) is een aparte module ("Mijn Week"), niet de default. Dit borgt "één primaire actie" al vanaf de landing.

---

## 4. Kompas-navigatie

### 4.1 Het Kompas is geen menu — het is je reis, navigeerbaar gemaakt

De tweede header-rij is niet nóg een set tabbladen. Het is de **emotionele ruggengraat**: waar zit ik in mijn reis van *"Hier begon ik"* naar *"Future You"*? Het maakt de vier vragen (besturingssysteem §leeswijzer) letterlijk zichtbaar en aanklikbaar.

```
📍 Hier begon je   →   ❤️ Waarom       →   🎯 Mijn doel   →   🚶 Vandaag   →   📈 Mijn groei   →   ⭐ Future You
   (0-punt)            (het anker)         (anker→doel)       (de hero)        (de trend)          (bestemming)
   VRAAG 1             VRAAG 3a            VRAAG 3b           VRAAG 4          VRAAG 2             VRAAG 3c
```

| Kompas-waypoint | Beantwoordt | Data / component | Wat je ziet als je erop klikt |
|---|---|---|---|
| 📍 **Hier begon je** | Waar begon ik? | 0-punt (intake-baseline, `trendRow.baselineScore`, eerste antwoorden) | De terugblik-view: beginscore, eerste anker, eerste beperkingen |
| ❤️ **Waarom** | Waarom beweeg ik? | `movementAnchor` + `buildAnchorWhySuffix` | Je gekozen waarom, met "wijzig mijn waarom" |
| 🎯 **Mijn doel** | Waar naartoe (concreet)? | anker → Future You-beeld (§5 besturingssysteem) | Het concrete toekomstbeeld + route-fase |
| 🚶 **Vandaag** | Wat is de volgende stap? | VANDAAG-hero / `day-model` | De dagstap + check-off (de default-focus) |
| 📈 **Mijn groei** | Waar sta ik nu (over tijd)? | leefstijllijn / `buildDomainTrendRow` | Sparkline, begin→nu, hermeting-teaser |
| ⭐ **Future You** | Waar wil ik naartoe? | anker als bestemming + laatste route-fase | Het richtpunt; hoe elke stap ernaartoe leidt |

### 4.2 Visueel gedrag van het Kompas

- **Huidige positie licht op** in het pijler-accent (sage voor beweging); doorlopen waypoints subtiel afgevinkt (✓), toekomstige gedimd (○) — exact de route-ladder-grammatica (● NU / ○ toekomst / ✓ gedaan), nu horizontaal in de header.
- **Het is een readout, geen dwang.** Klikken navigeert; het toont nooit een "je bent hier achter"-schuld. De pijlen (→) suggereren richting, niet een aftellijst.
- **Progressie is echt.** "Hier begon je" is altijd afgevinkt (je bént begonnen); "Mijn groei" ontgrendelt pas bij ≥2 trendpunten (anders: gedimd met tooltip "na je eerste hermeting"). Zo liegt het Kompas nooit.
- **Sticky onder rij 1** op desktop/tablet; op mobiel een swipebare chip-rail (§7).

### 4.3 Naamgeving — een besluit voor Dennis

"Kompas" is in PSF al dubbel bezet: de tab-shell (Kompas/Voortgang/Hermeting) én de knop in `DomainTopNav`. Deze journey-stepper geeft "Kompas" zijn **sterkste, letterlijke betekenis**: een kompas oriënteert je op een reis. Aanbeveling: **maak dít de kanonieke betekenis van Kompas** en laat de domein-switch (slaap/beweging/…) een aparte, kleinere control worden (bv. binnen "Meer ▾" of als segmented control in de contextbalk). Dat lost de driedubbele bezetting op. *Dit raakt terminologie-harmonisatie die nog open staat (zie de Kompas-beweging-analyse) — daarom een expliciet besluit, geen stille wijziging.*

---

## 5. Desktop Cockpit (1080p en breder)

### 5.1 Het drie-zone-grid

```
┌─ HEADER (sticky) ─ rij 1 modules · rij 2 Kompas ────────────────────────────────────────┐
├──────────────┬──────────────────────────────────────────────┬───────────────────────────┤
│ LINKS  260px │ MIDDEN  (fluid, dominant)                     │ RECHTS  340px             │
│ (sticky)     │ (scrollt)                                     │ CONTEXT-INSPECTOR (sticky)│
│              │                                               │                           │
│ ◐ Profiel    │ ┌ VANDAAG · trainen ───────────────────────┐ │ ┌ Waarom deze stap ─────┐ │
│   mini-kaart │ │ Eén krachtsessie: squat, push, pull       │ │ │ Mechanisme (feit)     │ │
│   naam·groet │ │ voor: sterk blijven · ⏱ 30–45 min         │ │ │ …want jij wilt sterk  │ │
│              │ │ [ Markeer als gedaan ✓ ]  Geen tijd?      │ │ │ blijven (anker)       │ │
│ ── Vandaag   │ └───────────────────────────────────────────┘ │ │ Verwacht effect ·     │ │
│  in 't kort  │                                               │ │ Alternatief: fietsen  │ │
│  · stap ✓/○  │ ◔ 58 Beweging  "elke week telt mee voor…"     │ └───────────────────────┘ │
│  · herstel   │                                               │                           │
│              │ ┌ Deze week ─┐ ┌ Je trend ─────────┐          │ ┌ Coach-tip (contextueel)┐ │
│ ── Check-in  │ │ kracht 1×  │ │ ▁▂▃▅ Begin 55·nu58 │          │ │ "3× 'matig' op rij —  │ │
│  [Hoe voel   │ └────────────┘ └────────────────────┘          │ │  je herstel is stabiel"│ │
│   je je?]    │                                               │ └───────────────────────┘ │
│              │ ┌ Jouw route ──────────────────────────────┐ │                           │
│              │ │ ● F1 NU · ○F2 ○F3 ○F4                     │ │ ┌ Je volgende meetmoment┐ │
│              │ │ Bekijk je volledige stappenplan →         │ │ │ "over ~3 weken…"      │ │
│              │ └───────────────────────────────────────────┘ │ └───────────────────────┘ │
└──────────────┴──────────────────────────────────────────────┴───────────────────────────┘
```

### 5.2 De drie zones — verantwoordelijkheid

**LINKS (260px, sticky) — "wie ben ik, en wat is mijn ingang".** Statisch-persoonlijk. Bevat:
- **Profiel-mini** (naam, korte groet uit `Greeting`, huidig anker als regel).
- **Vandaag in 't kort** — een condensaat: is de dagstap gedaan (✓/○), herstel-status. Één blik, geen actie (de actie zit in het midden).
- **Check-in-ingang** — de ene dagvraag (`RCV_FEEL`: "Hoe voel je je?"). Klein, uitnodigend, niet dwingend.

**MIDDEN (fluid, dominant, scrollt) — "wat doe ik, waar sta ik".** Het echte werkgebied = de bestaande `MovementCockpit`-tegels, maar nu met ademruimte i.p.v. in één smalle kolom geperst. Hiërarchie ongewijzigd: VANDAAG-hero (grootst, enige gevulde knop) → score-ring → Deze week + Trend (2-up) → route-ladder → doorway. Dit is de ster.

**RECHTS (340px, sticky) — "context bij wat je aankijkt".** Het HCI-inspector-idee, maar rustig en contextueel. Toont dynamisch **één relevant object tegelijk** (§5.3). Standaard: de "Waarom deze stap"-uitleg van de VANDAAG-stap. Bij een geselecteerde route-fase: die fase-details. Bij een dreigende overbelasting: een coach-tip. Bij naderende hermeting: de meetmoment-kaart.

### 5.3 Het inspector-paneel reageert intelligent (maar rustig)

De prompt vraagt een paneel dat "intelligent reageert" en waar dynamisch afspraak/coach-tip/motivatie/uitleg/doel/planning/waarschuwing/aanbeveling verschijnt. De verzoening met "rust": het paneel toont **hooguit twee kaarten**, geprioriteerd door één regel — de meest relevante context nú:

```
prioriteit inspector-inhoud (hoogste wint de bovenste kaart):
  1. WAARSCHUWING   — medisch signaal / recovery=rust → zorg-copy (nooit weg te drukken)
  2. UITLEG         — "Waarom deze stap" van de actieve VANDAAG-stap (default)
  3. COACH-TIP      — deterministisch inzicht (§7.3 besturingssysteem), alleen als eerlijk+actionable
  4. MEETMOMENT     — hermeting-teaser als <14 dagen tot hermeting
  5. DOEL/MOTIVATIE — Future You-beeld als er niks urgenters is
```

Één object, geoorloofde tweede kaart, nooit een muur. Dit is HCI's "één afspraak in het paneel", vertaald naar onze rust.

### 5.4 Breedtes: 1920 / 1440 / 1080

| Breakpoint | Links | Midden | Rechts | Gedrag |
|---|---|---|---|---|
| **≥1680 (1920)** | 280px | fluid (max ~760px leesbreedte) | 360px | Volle drie-zone, royale gutters, midden gecentreerd met max-leesbreedte zodat het niet "uitrekt" |
| **1440** | 260px | fluid | 340px | Idem, iets krappere gutters |
| **1280–1439 (1080p-vensters)** | 240px | fluid | 320px | Drie-zone blijft; inspector versmalt eerst |
| **1024–1279** | → tablet (§6) | | | Links wordt icoon-rail, rechts wordt drawer |

> **"Volle breedte zonder druk te worden":** het midden krijgt een **max-leesbreedte** (~760px) en wordt gecentreerd binnen zijn fluid kolom. De extra breedte gaat naar witruimte en de zijpanelen, niet naar bredere tekstregels. Zo benut je 1920px zonder de rust te breken.

---

## 6. Tablet-layout (768–1023px)

Twee zones i.p.v. drie. De linker profiel-rail is te duur voor de breedte; hij **klapt in tot de header** (profiel-mini verhuist naar het rechter header-cluster; check-in wordt een knop in het midden-canvas boven de hero).

```
┌─ HEADER (rij 1 + Kompas-rail) ───────────────────────────────┐
├──────────────────────────────────────────┬───────────────────┤
│ MIDDEN (dominant, scrollt)                │ INSPECTOR (drawer)│
│  [check-in-knop]                          │  ⟨ inklapbaar ⟩   │
│  ┌ VANDAAG-hero ─────────────────────────┐│  standaard dicht; │
│  │ …                                     ││  chevron-tab opent│
│  └───────────────────────────────────────┘│  "Waarom deze stap"│
│  score · Deze week · trend · route        │                   │
└──────────────────────────────────────────┴───────────────────┘
```

- **Inspector wordt een inklapbare drawer** (rechts, chevron-tab zoals HCI's `⌄ Afspraak`). Standaard dicht op tablet; opent over het canvas of duwt het canvas smaller. Zo behoudt de tablet de "détail zonder pagina-wissel"-kracht zonder permanent 340px op te eisen.
- **Kompas-rail** blijft horizontaal onder de header, nu eventueel met kleinere labels (icoon + korte tekst).
- **Herschikking:** "Deze week" en "Trend" blijven 2-up; route-ladder full-width eronder.

---

## 7. Mobile Cockpit (≤767px) — mobile-first, geen verkleinde desktop

### 7.1 Ontwerpprincipe

Niet de desktop indikken, maar **een mobiele cockpit ontwerpen**. Eén ding tegelijk, duim-vriendelijk, de rest achter gebaren.

```
┌─ STICKY HEADER ───────────────────────────┐
│ [Wordmark]              🔔   [◐ ≡]         │  ← rij 1 gecomprimeerd (overflow in ≡)
├───────────────────────────────────────────┤
│ 📍 ❤️ 🎯 🚶* 📈 ⭐   ‹swipe›               │  ← Kompas = swipebare chip-rail (sticky)
├───────────────────────────────────────────┤
│                                           │
│ ┌ VANDAAG · trainen ────────────────────┐ │  ← hero domineert het scherm
│ │ Eén krachtsessie: squat, push, pull   │ │
│ │ voor: sterk blijven · ⏱ 30–45 min     │ │
│ │ [ Markeer als gedaan ✓ ]              │ │
│ │ Geen tijd?   Waarom deze stap? ⌃      │ │  ← "Waarom" opent bottom sheet
│ └───────────────────────────────────────┘ │
│                                           │
│ ◔ 58 Beweging   (score, compact)          │
│ ┌ Deze week ─┐ ┌ Je trend ─┐  (2-up klein)│
│ Jouw route  ● F1 NU · ○○○                 │
│                                           │
├───────────────────────────────────────────┤
│  🚶 Dag   📅 Week   📈 Voortgang   🎯 Doel  │  ← bottom-nav (module-switch)
└───────────────────────────────────────────┘

     ⌃ bottom sheet (swipe-up):  "Waarom deze stap"
        mechanisme · anker · effect · alternatief
```

### 7.2 Wat blijft, verdwijnt, transformeert

| Onderdeel | Op mobiel |
|---|---|
| **Header rij 1** | Comprimeert: Wordmark + 🔔 + profiel/overflow (`≡`). Modules verhuizen naar bottom-nav + `≡`-drawer |
| **Kompas** | **Swipebare chip-rail**, sticky onder de header — blijft altijd zichtbaar (de reis is de ankering) |
| **Linker profiel-rail** | Verdwijnt als kolom; profiel in de `≡`-drawer, groet boven de hero |
| **Rechter inspector** | Wordt een **bottom sheet** — "Waarom deze stap ⌃" opent 'm; coach-tip/waarschuwing pushen 'm omhoog |
| **VANDAAG-hero** | Dominant, vult ~eerste viewport; enige gevulde knop |
| **Score / Deze week / Trend / Route** | Compacte readouts eronder, scrollbaar |
| **Modulenav** | **Bottom-nav** (Dag / Week / Voortgang / Doel) — duim-bereik; "Meer" in `≡` |
| **Check-in** | Contextuele kaart boven de hero óf in de bottom sheet — niet een concurrerende FAB |

### 7.3 Gebaren

- **Kompas-rail:** horizontaal swipen om waypoints te bekijken; tik = navigeren.
- **Bottom sheet:** swipe-up voor "Waarom deze stap" en fase-detail; swipe-down om te sluiten. Dit is de mobiele vertaling van het desktop-inspector-paneel.
- **Module-wissel:** bottom-nav (geen zij-drawer voor primaire modules — duim-bereik wint).
- **Kaart-herordening:** bij recovery=rust schuift de rust-variant van de hero naar boven; de score dimt (faket geen daling) — de mobiele cockpit "leeft" identiek aan desktop (§8).

### 7.4 Over de FAB (prompt vraagt erom, wij verzoenen)

Een **persistente** floating action button botst met "één primaire actie" — hij zou naast de hero-check-off een tweede primaire trekker zetten. Aanbeveling: **geen permanente FAB.** Wél een *contextuele* variant: zodra je voorbij de hero scrolt en de dagstap nog niet gedaan is, verschijnt een kleine sticky "✓ Vandaag gedaan"-pil onderaan die je terugbrengt naar de hero-actie. Verschijnt alleen wanneer relevant, verdwijnt na afvinken. Zo krijg je het gemak van een FAB zonder de tweede-actie-valkuil.

---

## 8. Dashboard ↔ Stappenplan interactie

Het volledige interactiemodel staat in besturingssysteem §6 en blauwdruk §6. Hier de **cockpit-specifieke lus** — wat er ruimtelijk gebeurt in de drie zones.

```
COCKPIT (drie zones)
   │  MIDDEN: kies tier op de hero
   ▼
STAPPENPLAN laadt de stap in de hero (day-model SSOT)
   │  MIDDEN: "Markeer als gedaan ✓"  (de ENIGE check-off)
   ▼
CHECK-IN: exertie-microtik (licht/matig/zwaar)
   │  → daily_action_log (executie-SSOT, append-only)
   ▼
NIEUWE INZICHTEN verschijnen:
   · MIDDEN  → "Deze week" + trend updaten
   · RECHTS  → inspector toont coach-tip ("herstel stabiel") of waarschuwing
   · LINKS   → "Vandaag in 't kort" springt op ✓
   ▼
COCKPIT VERANDERT:
   · computeCurrentPhaseId → route-ladder-NU-badge schuift (MIDDEN)
   · Kompas-waypoint "Mijn groei" ontgrendelt bij ≥2 trendpunten (HEADER)
   ▼
NIEUWE AANBEVELING / NIEUW BEWEEGPLAN:
   · nieuwe dagstap-pool ontsloten; bij hermeting → arc herbouwt
   ▼
   └────────► terug naar boven, op een hoger niveau
```

**Het commandocentrum-effect:** de gebruiker doet één ding (afvinken in het midden), en ziet drie zones tegelijk reageren — links springt op ✓, midden werkt de week bij, rechts geeft een eerlijk inzicht. Dát is het verschil met een scroll-pagina waar je moet scrollen om te zien dat er iets veranderde. De cockpit *reageert in één blik*.

> **Kern-invariant blijft:** de check-off leeft alléén in de MIDDEN-hero. Het stappenplan (via "Bekijk je volledige stappenplan →") is read-only en spiegelt de status. Nooit een tweede vinklijst in een ander paneel.

---

## 9. Componentarchitectuur

Componentbibliotheek voor de cockpit-shell. Per component: doel · states · desktop- vs mobiel-gedrag. **[b]** = bestaat, **[n]** = nieuw/herontwerp.

### 9.1 Shell & navigatie

| Component | Doel | States | Desktop | Mobiel |
|---|---|---|---|---|
| `CockpitHeader` **[n]** (vervangt `DashHeader`) | Rij 1: brand + modules + persoonlijk cluster | module-actief, notif-badge | volle rij, sticky | gecomprimeerd (Wordmark+🔔+`≡`) |
| `KompasRail` **[n]** (herkadert `DomainTopNav`-idee) | Rij 2: reis-navigatie (§4) | waypoint actief/gedaan/gedimd | sticky horizontaal | swipebare chips |
| `CockpitShell` **[b]** | Grid-omhulsel, drie-zone / één-kolom | — | `[260px_1fr_340px]` | 1 kolom |
| `ProfileRail` **[n]** | Links: profiel-mini + vandaag-in-'t-kort + check-in | leeg/normaal | sticky 260px | → `≡`-drawer |
| `ContextInspector` **[n]** | Rechts: contextueel object-paneel (§5.3) | waarschuwing/uitleg/tip/meetmoment/doel | sticky 340px | → bottom sheet |
| `BottomNav` **[n]** | Mobiele module-switch | actieve module | verborgen | zichtbaar |
| `OverflowDrawer` **[n]** (`≡`) | "Meer" + profiel op mobiel | open/dicht | (Meer▾ dropdown) | drawer |
| `ContextualLogPill` **[n]** | Mobiele "✓ Vandaag gedaan" na scroll | zichtbaar/verborgen/done | n.v.t. | sticky onder |

### 9.2 Content-kaarten (grotendeels bestaand — de cockpit herplaatst ze)

| Component | Doel | States | Bron |
|---|---|---|---|
| `MovementTodayHero` **[b]** | VANDAAG · enige check-off · exertie · recovery | todo/gedaan/geen-tijd/recovery/medical/leeg | day-model |
| `MovementCockpit`-tegels **[b]** | score-ring · Deze week · trend · route · meetmoment | per tegel (blauwdruk §4) | model |
| `MovementStartChoice` **[b]** | anker + startpatroon (Future You-bron) | picker/skip | movement-prefs |
| `MovementRouteLadder` **[b]** | 4-fasen read-only + doorway | normaal/promotie/leeg | computeCurrentPhaseId |
| `CheckinCard` **[n]** | de ene dagvraag (`RCV_FEEL`) | onbeantwoord/beantwoord | recovery-context |
| `InsightCard` **[n]** | deterministisch inzicht in de inspector | leeg/getoond | §7.3 besturingssysteem |
| `FutureYouCard` **[n]** | concreet toekomstbeeld (inspector/Kompas) | per anker | movement-prefs |
| `ZeroPointCard` **[n]** | "Hier begon je"-terugblik | pre/post-hermeting | intake-baseline |
| `CoachCard` **[n]** | zorg-copy bij recovery/medical | rust/medisch | recovery-hint |
| `NotificationCard` **[n]** | in-app notificatie-item | ongelezen/gelezen | gefaseerd |

### 9.3 Gedeelde primitieven (bestaan)

`CockpitTile`, `Card`, `Button`, `DeltaBadge`, `Sparkline`, `SectionHeader`, iconen (`@/components/app/icons`) — de craft-tokens die alle zones één familie houden.

### 9.4 De ene nieuwe lib: de betekenis-motor

Zoals in besturingssysteem §9.4: een pure functie `buildMeaning(metric, referent, anchor) → string`, aangeroepen door `InsightCard`, `FutureYouCard`, de hero-waarom-regel en de inspector-uitleg. Het is de laag die "geen getal zonder adres" afdwingt — cruciaal juist in een cockpit vol readouts.

---

## 10. Responsive gedrag

### 10.1 Breakpoint-strategie (mobile-first)

| Breakpoint | Zones | Header | Kompas | Inspector | Modulenav |
|---|---|---|---|---|---|
| **≤767 mobiel** | 1 kolom | Wordmark+🔔+`≡` | swipe-chips | bottom sheet | bottom-nav |
| **768–1023 tablet** | 2 zones | volle rij 1 | horizontaal | drawer (dicht) | rij 1 |
| **1024–1279** | 3 zones (krap) | volle rij 1 | horizontaal | 320px sticky | rij 1 |
| **1280–1679** | 3 zones | volle rij 1 | horizontaal | 340px sticky | rij 1 |
| **≥1680** | 3 zones (royaal) | volle rij 1 | horizontaal | 360px sticky | rij 1 |

### 10.2 Vaste vs. flexibele onderdelen

- **Vast (sticky):** `CockpitHeader` (rij 1), `KompasRail` (rij 2), `ProfileRail` (links, desktop), `ContextInspector` (rechts, desktop). De chrome blijft; alleen het **midden scrolt** — HCI-principe 3.
- **Flexibel:** de midden-kolom (fluid met max-leesbreedte), de inspector-inhoud (prioriteits-gestuurd), de Kompas-labels (verkorten op smal).
- **Uitklapbaar:** inspector-drawer (tablet), bottom sheet (mobiel), `OverflowDrawer` (`≡`), collapsible "Voeding & supplementen"-sectie (bestaat).

### 10.3 Wat waar naartoe migreert bij versmallen

```
LINKS-rail   →  (tablet) header-cluster + midden-knop  →  (mobiel) ≡-drawer + groet
RECHTS-panel →  (tablet) inklapbare drawer             →  (mobiel) bottom sheet
Modulenav    →  (mobiel) bottom-nav + ≡
Kompas       →  (mobiel) swipebare chip-rail (blijft altijd zichtbaar)
```

### 10.4 De Container-uitzondering

CLAUDE.md schrijft `Container max-w-7xl px-6 lg:px-8` voor. Dat geldt **content-pagina's** (leesbreedte). De cockpit is een **app-surface** — een commandocentrum benut meer breedte. Aanbeveling: een dashboard-specifieke shell met `max-w-[1600px]` (of full-bleed met gutters), terwijl de midden-kolom een eigen max-leesbreedte houdt. *Dit is een bewuste, gemotiveerde afwijking van de Container-default — te bevestigen door Dennis, want het raakt een projectconventie.*

---

## 11. Dataflow

Volledige dataarchitectuur: besturingssysteem §8. Hier de **zone-gebonden** dataflow — welke zone leest/schrijft wat.

```
                       ┌─────────────── 0-PUNT (permanent) ───────────────┐
                       │ intake-baseline · anker · beperkingen            │
                       └───────┬──────────────────────────┬───────────────┘
                  leest LINKS  │                          │ leest KOMPAS 📍/❤️/🎯/⭐
                       ▼                                  ▼
          ┌──────────────────┐   day-model SSOT    ┌────────────────────┐
          │ ProfileRail      │◀──(wat is vandaag)──│ MIDDEN: hero+tegels│
          │ vandaag-in-'t-kort│                     │ (leest score,      │
          └──────────────────┘                     │  trend, route)     │
                  │                                 └─────────┬──────────┘
      schrijft    │ RCV_FEEL                         schrijft │ afvink + exertie
      (CheckinCard)▼                                          ▼
          ┌──────────────────┐                     ┌────────────────────┐
          │ recovery-context │────soft override───▶│ daily_action_log   │ (executie-SSOT)
          └──────────────────┘                     └─────────┬──────────┘
                  │                                          │
                  └──────────► RECHTS: ContextInspector ◀────┘
                               leest recovery + log + score →
                               kiest inspector-kaart (§5.3 prioriteit)
```

**Eigenaarschap (besturingssysteem §9.1) blijft:** één component bezit elk stuk waarheid; de zones lezen. `day-model` bezit "wat is vandaag"; `daily_action_log` bezit "is het gedaan"; `movement-prefs` bezit anker+startpatroon; de engine bezit de score. Geen zone dupliceert waarheid.

---

## 12. Eventflow

De systeem-events (= meet-events, drie-lagen-meting) die de zones laten reageren. Nieuwe CTA's krijgen hun meetpunt in dezelfde wijziging (CLAUDE.md meet-standaard).

```
EVENT                                BRON (zone)           GEVOLG OP ZONES
──────────────────────────────────────────────────────────────────────────────────
kompas_waypoint_selected [n]         KompasRail (header)   navigeert; markeert positie
dashboard_module_selected [b-achtig] CockpitHeader rij 1   wisselt module (Dag/Week/…)
movement_tier_selected [b]           MIDDEN hero           hero-stap wisselt direct
dashboard_vandaag_action_toggled [b] MIDDEN hero           LINKS ✓ · MIDDEN week/trend · RECHTS tip
  (payload: exertion)                check-in microtik     recovery-context → morgen
checkin_feel_submitted [n]           LINKS CheckinCard     RECHTS coach-copy · MIDDEN tier-badge
inspector_card_shown [n]             RECHTS inspector      (meting: welke context landt)
dashboard_beweging_plan_click [b]    MIDDEN doorway        opent read-only plan-reader
movement_phase_promoted [b]          computeCurrentPhaseId MIDDEN route-badge · HEADER Kompas
remeasure_started/done [b]           Kompas 📈 / teaser    score/trend/betekenis herijkt
```

> **Meetpunt:** `dashboard_vandaag_action_toggled` + `kompas_waypoint_selected` + `inspector_card_shown` — hieraan lees je af of de cockpit als commandocentrum functioneert (één actie → meerdere zones reageren, en de reis-navigatie wordt gebruikt). Geen PII in GA4/Clarity; exertie/feel zijn enums.

---

## 13. UX-principes

| Principe | In de cockpit |
|---|---|
| **Één centrale focus** | Het MIDDEN toont VANDAAG; links en rechts kaderen, concurreren niet |
| **Één primaire actie** | Enkel de hero heeft een gevulde knop; geen permanente FAB (§7.4) |
| **Persistente oriëntatie** | Kompas-rail + modulenav altijd zichtbaar; nooit verdwaald |
| **Détail zonder navigatie** | Inspector/bottom sheet toont context zonder pagina-wissel |
| **Minimale cognitieve belasting** | Inspector max 2 kaarten; kleur = focus, niet decoratie; geen 40 blokken |
| **Betekenis boven data** | Betekenis-motor overal; geen getal zonder adres |
| **Rust in de interface** | Witruimte, spaarzaam accent, geen rode urgentie; midden met max-leesbreedte |
| **Informatie alleen wanneer relevant** | Inspector-kaarten prioriteits-gestuurd; contextuele log-pil; Kompas-waypoints ontgrendelen eerlijk |
| **Autonomie (SDT)** | Kompas navigeert zonder schuld; check-in nodigt uit, dwingt niet |
| **Vaste chrome, scrollend canvas** | Header/rails/panelen sticky; alleen het midden beweegt |

**Sfeer-referenties (principes, niet kopie):** Apple Health (rust, ademruimte) · Headspace (menselijke toon) · Notion (heldere structuur, blok-hiërarchie) · Linear (dichte maar kalme overzichten, sticky chrome) · HCI One (twee-rijige header + inspector-werkplek) · Arc (moderne, lichte navigatie-chrome). Vertaald naar één eigen identiteit: **de rustige beweeg-begeleider**, met de bestaande tokens (sage `#5A8F6A`, DM Serif + DM Sans, donkere cockpit + light plan-reader).

---

## 14. Wireframebeschrijvingen

### 14.1 Desktop 1440 — volledige cockpit (zie §5.1 voor het grid)

Leesrichting per zone, met de vraag die elke zone beantwoordt:
- **Header rij 1** → *waar in de app ben ik* (module).
- **Header rij 2 (Kompas)** → *waar in mijn reis ben ik* (vier vragen).
- **Links** → *wie ben ik + is vandaag gedaan* (identiteit + status).
- **Midden** → *wat doe ik nu + waar sta ik* (vraag 4 + vraag 2) — dominant.
- **Rechts** → *waarom + wat komt hierna* (context bij het midden).

### 14.2 Mobiel 375 — mobiele cockpit (zie §7.1)

```
[Wordmark]           🔔  ◐≡        ← header, gecomprimeerd
📍 ❤️ 🎯 🚶* 📈 ⭐  ‹swipe›       ← Kompas chip-rail (sticky)
┌ VANDAAG · trainen ───────────┐   ← hero domineert
│ Eén krachtsessie…            │
│ voor: sterk blijven · ⏱30–45 │
│ [ Markeer als gedaan ✓ ]     │
│ Geen tijd?  Waarom? ⌃        │   ← ⌃ opent bottom sheet
└──────────────────────────────┘
◔58 Beweging   Deze week·Trend      ← compacte readouts
Jouw route ● F1 · ○○○
🚶Dag 📅Week 📈Voortg 🎯Doel        ← bottom-nav
```

### 14.3 Inspector-paneel — vier contextvoorbeelden (desktop rechts / mobiel bottom sheet)

```
① UITLEG (default)        ② WAARSCHUWING            ③ COACH-TIP               ④ MEETMOMENT
┌ Waarom deze stap ──┐    ┌ Rustig aan vandaag ─┐   ┌ Je herstel is stabiel┐   ┌ Volgende meetmoment ┐
│ Opstaan zonder     │    │ Je gaf 'uitgeput'   │   │ 3× 'matig' op rij —  │   │ Over ~3 weken zie   │
│ handen traint de   │    │ aan. Vandaag licht  │   │ ruimte om de Trainen-│   │ je je lijn bewegen. │
│ beenkracht die na  │    │ of rust — dat is    │   │ tier te proberen als │   │ Niet elke dag een   │
│ 40 't snelst daalt │    │ verstandig, geen    │   │ je zin hebt.         │   │ cijfer — bewust.    │
│ …want jij wilt     │    │ achterstand.        │   │ [uitnodigend, geen   │   │ [Zo werkt je        │
│ sterk blijven.     │    │ [zorg-copy, niet    │   │  druk]               │   │  hermeting →]       │
│ Effect · Alternatief│    │  weg te drukken]    │   └──────────────────────┘   └─────────────────────┘
└────────────────────┘    └─────────────────────┘
```

### 14.4 Header-states

```
DESKTOP (volledig):
[Wordmark]  Mijn Dag* · Mijn Week · Mijn Voortgang · Mijn Doelen · Meer▾    🔔 ◐Dennis▾ ⚙
📍Hier begon je✓ → ❤️Waarom✓ → 🎯Doel✓ → 🚶Vandaag* → 📈Groei○ → ⭐Future You○

MOBIEL (gecomprimeerd):
[Wordmark]                                              🔔  ◐≡
📍✓ ❤️✓ 🎯✓ 🚶* 📈○ ⭐○  ‹swipe›
```

---

## 15. Toekomstvisie

Ontworpen om tien jaar mee te gaan: elke uitbreiding is een **modulaire poort** die in een bestaande zone landt zonder de kern te verzwaren. De cockpit-shell (header, Kompas, drie zones) verandert niet; de *inhoud* van zones groeit.

| Uitbreiding | Waar het landt in de cockpit | Poort / voorwaarde |
|---|---|---|
| **AI-coach** | `CoachCard` in de inspector (reranking van tips, betere timing) | Fase 6+; guardrails (max intensity, medische grens); geen vrije-tekst-health-dump |
| **AI-samenvattingen** | Inspector-kaart "je week in één zin" | deterministisch eerst, model-gegenereerd later, achter dezelfde eerlijkheidspoort |
| **Wearables** (Apple Health / Google Fit / Garmin / Fitbit) | Soft recovery-hint (inspector) + toekomstige "Mijn Week"-signalen | Art. 9-gate: expliciete toestemming, client-side aggregatie, TTL 90d; nooit 2e domeinscore |
| **Spraakbesturing** | Check-in per stem ("ik heb gewandeld") → `daily_action_log` | web speech; zelfde SSOT, geen nieuw grootboek |
| **Huisarts / fysio / mantelzorger / zorgverlener** | Activeert het **Berichten**-slot in de header + gedeelde inspector-kaart | Aparte tenant-/toestemmingslaag; `lp_activity_definitions` voor pro-toevoegingen zonder deploy |
| **Community** | Aparte module in "Meer ▾" — nooit op de first viewport (rust) | Los van de kern; geen competitie/leaderboard (anti-gamification) |
| **Video-consult** | Berichten-slot / zorgverlener-poort | Gated; buiten de dagelijkse cockpit-flow |
| **Nieuwe leefstijlmodules** (slaap/stress/voeding op deze cockpit) | Modulenav + Kompas erven de structuur | `LifestyleModule`-interface; elke module 1 check-off, 1 score |

**Uitbreidings-invariant (uit besturingssysteem §14.2):** elke nieuwe poort respecteert de vier noordsterren (één check-off, één score, gratis dagstap, geen gamification) én de privacy-gates. Een wearable voegt *bevestiging* toe, geen tweede waarheid. Een AI-coach voegt *betere timing* toe, geen nieuwe inhoud die de kern omzeilt. Een zorgverlener voegt *inhoud* toe, geen tweede afvink-mechaniek. De cockpit blijft één centraal focuspunt — hoeveel adapters er ook bijkomen.

---

## Slot — de aanbeveling in één alinea

Bouw geen breder dashboard, maar een **commandocentrum met vaste chrome en één scrollend canvas**: een twee-rijige header (module + reis-Kompas) die je altijd oriënteert, een dominant midden dat precies één ding toont — VANDAAG —, een linker rail die zegt wie je bent en of je vandaag al bewoog, en een rechter inspector die contextueel uitlegt *waarom* deze stap en *wat* er hierna komt. Dat is exact de kracht die HCI One prettig maakt (persistente oriëntatie, centraal focuspunt, détail zonder navigatie), maar dan vertaald van klinische dichtheid naar de rust en menselijkheid van *Bewegen na 40*. De drie zones reageren samen op de ene actie die telt (afvinken in het midden), zodat de gebruiker in één blik voelt dat het systeem leeft — en de mobiele variant is geen ingedikte desktop maar een eigen cockpit met een swipebare Kompas-rail en een bottom sheet als inspector. Alles blijft verankerd aan de vier vragen en de vier invarianten: één check-off, één score, gratis dagstap, geen gamification. De gebruiker mag nooit het gevoel hebben een dashboard te bedienen; hij moet het gevoel hebben plaats te nemen in de cockpit van zijn eigen reis — van "Hier begon je" naar "Future You".

> **Meetpunt:** `dashboard_vandaag_action_toggled` + `kompas_waypoint_selected` + `inspector_card_shown` — hieraan lees je af of de cockpit als één levend commandocentrum functioneert. Geen PII in GA4/Clarity.

*Opgesteld 22 juli 2026, verankerd tegen `main` + de blauwdruk + het besturingssysteem-document + de drie SSOT-docs. HCI One-screenshot als IA-referentie, geen visuele kopie. Geen implementatie, geen code. Verandert geen enkele DEFER/FREEZE/KILL-status.*
