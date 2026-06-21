# IA-ECOSYSTEEM — PerfectSupplement leefstijl-platform

> **Layer 1 — Core.** Informatiearchitectuur voor het hele platform: hoe intake, dashboard, domeinen, content en vergelijkingen één systeem vormen.
> Schrijfstem staat in `WRITING_VOICE.md`, kleuren in `DESIGN_TOKENS.md`, content-typen in `CONTENT_SYSTEM.md`, scoring in `INTAKE_SYSTEM.md`. Dit document gaat over **structuur en verbinding**, niet over copy of code.

> Opgesteld 2026-06-21 als correctie op een extern IA-prototype ("Kennis Ecosysteem") dat vijf pijlers hanteerde en het gemeten domein **energie** liet vallen, waardoor de kernbelofte "kennis verbonden met wat je meet" intern vastliep.

---

## 1. Fundament: de zes domeinen als single source of truth

Alles — scoring, dashboard, content-pijlers, navigatie — draait om **dezelfde zes domeinen**. Niet vijf, niet zeven.

| # | Scoring-key | DomainId | Pijler (UI) | Profiel-label | Domein-ingang (route) | Kleur-token |
|---|---|---|---|---|---|---|
| 1 | `sleep_score` | sleep | Slaap | Onrustige Slaper | `/slaap-verbeteren-na-40` | sleep |
| 2 | `energy_score` | energy | **Energie** | Lage Batterij | `/energie-na-40` | energy |
| 3 | `stress_score` | stress | Stress | Stressdrager | `/stress-verminderen-man` | stress |
| 4 | `nutrition_score` | nutrition | Voeding | _(geen eigen label)_ | `/voeding-na-40` | nutrition |
| 5 | `movement_score` | movement | Beweging | _(geen eigen label)_ | `/beweging-na-40` | movement |
| 6 | `recovery_score` | recovery | Herstel | _(geen eigen label)_ | `/herstel-verbeteren-na-40` | recovery |

**Regel:** staat een domein in deze tabel, dan heeft het een score (in het dashboard), een publieke domein-ingang, een kleur én een content-stroom. Geen uitzonderingen.

- Bron van waarheid voor de scores: `src/lib/intake-engine.ts` (`DomainScores`, `DOMAIN_SCORE_KEYS`).
- **Aanbeveling:** introduceer één centrale `DOMAINS`-constante in `src/data/` (key, id, slug, label, kleur) waaruit nav, dashboard, hubs en feed-filters allemaal lezen. Nu is deze kennis verspreid; dat is hoe de prototype-mismatch (5 vs 6) ontstaat.

### Twee sporen, één pijler-taal

Het platform heeft twee sporen die je niet mag vermengen:

```
PERSOONLIJK SPOOR (achter de check)     PUBLIEK SPOOR (open, SEO, redactioneel)
  Leefstijlcheck → Dashboard              Leefstijlhub: domein-ingangen + /inzichten
  "waar sta JIJ op slaap"                 "wat we weten over slaap"
        │                                        │
        └─────────────  PIJLER  ─────────────────┘
              de gedeelde taal tussen beide sporen
```

De **pijler is geen pagina-soort** maar de dwarsdoorsnede die beide sporen verbindt. Personalisatie (scores, "waar sta jij") woont **uitsluitend in het dashboard**. De domein-ingangen (de bestaande landingspagina's) horen in het **publieke spoor**: redactionele intro per domein, SEO-gedreven, géén score en géén login. Ze zijn de brug, niet een derde gepersonaliseerde categorie — dat zou dubbelop zijn met het dashboard én auth forceren op een SEO-pagina.

Twee scharnieren verbinden de sporen:
- **Dashboard-tegel → domein-ingang** — van jouw score naar verdiepende content.
- **Domein-ingang → /intake** — van anonieme lezer naar persoonlijk profiel.

## 2. Sitemap (IA-boom)

```
/                          Home — symptoom-hero → intake
│
├── /intake                Leefstijlcheck (5 fases, 15 vragen)
│       ↓ produceert profiel + 6 scores
│
├── /dashboard             ★ HART — gepersonaliseerd, achter de check
│     ├─ Vandaag-kaart (laatste check-in — NIET "live gemeten")
│     ├─ 6 domein-tegels met score + status
│     ├─ Aanbevolen content (op leefstijl, niet op clicks)
│     ├─ Aanbevolen supplementen → /beste/*
│     └─ Hermeting-reminder
│
├── /leefstijl/{domein}    6 DOMEIN-INGANGEN (PUBLIEK)  ← de bestaande landingspagina's
│     (slaap, energie, stress, voeding, beweging, herstel)
│     ├─ Redactionele intro per domein — publiek/SEO, GEEN score, GEEN login
│     ├─ CTA → /intake ("word persoonlijk")
│     ├─ Content-feed gefilterd op dít domein → /inzichten?pijler=
│     ├─ Relevante supplementen + vergelijkingen → /beste/*
│     └─ Actiepunt (quick win uit de pijler-config)
│
├── /inzichten             ÉÉN CONTENT-FEED (blog + kennisbank samen)
│     filterbaar op  domein × type
│     types: Artikel · Deep dive · Checklist · Begrip
│     └─ /inzichten/{slug}  (artikel-template met evidence-blok)
│
├── /supplementen          Supplement-gidsen (informatief, neutraal)
│     └─ /supplementen/{supplement}
│
└── /beste/{supplement}    VERGELIJKINGEN — aparte commerciële as
      (affiliate; "beoordeeld op bewijs, dosering, vorm")
```

**Top-navigatie (max 5):** `Start · Leefstijl ▾ · Inzichten · Supplementen · Mijn dashboard`.
"Tools" verschijnt pas in de nav zodra er een tool bestaat; checklists wonen tot die tijd in Inzichten als type *Checklist*.

## 3. Content-taxonomie: twee assen, geen twee silo's

- **As 1 — Domein** (verplicht, precies 1 van de 6). Geen artikel zonder domein; dit is wat de koppeling met het dashboard mogelijk maakt.
- **As 2 — Type** (verplicht, 1 van 4): **Artikel · Deep dive · Checklist · Begrip** (= ex-kennisbank). Leestijd en evidence-badge zijn metadata, geen aparte types.

**Vergelijkingen (`/beste/*`) zijn géén content-type** maar een aparte as. Dit scheidt objectieve redactie van affiliate-monetisatie en beschermt de "Consumentenbond"-positionering. → "Blog" en "Kennisbank" verdwijnen als losse merken; ze worden **types binnen één `/inzichten`-feed**.

## 4. Gebruikersflow

```
Anoniem:   Home → herkenning → Intake → 6 scores + profiel
                                   ↓
Bekend:    Dashboard ⇄ Domein-ingang ⇄ Inzichten-artikel ⇄ Vergelijking
                                   ↓
Terugkeer: Hermeting → delta → nieuw advies → nieuwe content
```

De te sluiten lus: **score → domein-ingang → artikel → actie → hermeting → nieuwe score**. Personalisatie blijft in het dashboard; de domein-ingang is publiek. Kritieke nieuwe verbindingen: dashboard-tegel → domein-ingang, en domein-ingang ⇄ gefilterde inzichten-feed.

## 5. Dashboard-architectuur (modules)

Sluit aan op de bestaande 5-tab bottom-nav ("Roadmap-first") in `src/app/dashboard/`.

1. **Vandaag** — laatste check-in + 1 prioriteit. Copy: *"op basis van je laatste check-in"* — **niet** "live gemeten" (er zijn geen sensoren; dat was een overclaim die botst met de compliance- en positioneringsregels).
2. **6 domein-tegels** — score, status, kleur, → naar de (publieke) domein-ingang. Hier wordt 6 = 6 zichtbaar; dit is de enige plek waar de score per domein leeft.
3. **Aanbevolen voor jou** — content op profiel/scores (niet op clicks); pull uit `/inzichten` op het laagste domein.
4. **Aanbevolen supplementen** → `/beste/*`, met disclaimer "advies, geen diagnose".
5. **Hermeting-reminder** — sluit de lus.

## 6. URL- & naamstrategie

- **Behoud de bestaande domein-slugs als canonical** (`/slaap-verbeteren-na-40` enz.) vanwege SEO-waarde. Voeg een schone alias `/leefstijl/{domein}` toe die canonical/301 naar de bestaande slug wijst, zodat de interne IA consistent is zonder rankings te verbranden. Eén domein-hub-template, zes data-objecten.
- **Noem de feed "Inzichten"** maar **behoud `/kennisbank` en `/blog` met canonical → `/inzichten`** voor bestaande links/SEO.
- **Geen big-bang.** Routes blijven leven; eerst veranderen de verbindingen en de presentatie.

## 7. Verwijderen / samenvoegen / herontwerpen

| Actie | Pagina('s) | Wat |
|---|---|---|
| **Samenvoegen** | `/blog` + `/kennisbank` | → één `/inzichten`-feed; oude URL's canonical, type-label behouden |
| **Herontwerpen** | 6 domein-landers | van losse SEO-lander → volwaardige domein-hub (intro + feed + supplementen + vergelijkingen + acties + score-pull) |
| **Herontwerpen** | `/dashboard` | 6 domein-tegels + 5 modules; "live gemeten" → "laatste check-in" |
| **Ontdubbelen** | `/gids` · `/gidsen` · `/supplementen` | drie overlappende ingangen — kies één canonieke supplement-ingang, rest canonical erheen (losse opruimactie) |
| **Schrappen uit nav** | "Tools" | bestaat niet als route; pas terugzetten bij eerste echte tool |
| **Intact laten** | `/beste/*` | aparte affiliate-as — niet vermengen met content |

## 8. Meetpunten voor de nieuwe verbindingen

Per de meet-standaard in `CLAUDE.md`: elke nieuwe verbindings-CTA krijgt in dezelfde wijziging een meetpunt. Hergebruik bestaande event-types vóór je nieuwe verzint. De drie kernverbindingen om te meten:

- dashboard-tegel → domein-hub (welk domein trekt door)
- domein-hub → inzichten-artikel (sluit content aan op de score)
- domein-hub / dashboard → `/beste/*` (de monetisatie-pijl)

## 9. Afwijkingen t.o.v. het externe prototype (vastgelegd)

| Prototype deed | Dit blueprint doet | Waarom |
|---|---|---|
| 5 pijlers, energie weg | 6 domeinen, energie terug | scoring meet 6; anders breekt "verbonden met wat je meet" |
| "live gemeten" | "laatste check-in" | geen sensoren; overclaim botst met compliance |
| licht editorial, sage-accent, geen koper | stijlkeuze bewust maken (zie `DESIGN_TOKENS.md`) | intake is dark-green + koper-accent; continuïteit niet per ongeluk breken |
| hand-rolled React, inline styles | Next.js + Tailwind (+ shadcn waar passend) | prototype is mockup, geen implementatiepad |
| nav-item "Tools" | weggelaten tot tool bestaat | dode route vermijden |

Behouden uit het prototype: één samengevoegde content-feed met domein × type-filters, vergelijkingen als aparte as, en het dashboard-als-hub principe.
