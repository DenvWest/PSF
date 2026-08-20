# Prompt — Ecosysteem: Kompas als aanbevelingsmotor + Bond-herformulering

> **Gebruik:** kopieer alles onder **Prompt (copy-paste)** naar Claude Opus (nieuw gesprek, met repo-toegang in `~/psf`).
> **Output:** één verdict-markdown. **Geen code, geen diffs, geen SQL, geen HTML-prebuild, geen commits.**
> **Opgesteld:** 20 augustus 2026.
> **Aanleiding:** Ecosysteem-analyse + Kompas-pivot: Kompas wordt aanbevelingsmotor per prioriteitslaag (gratis → betaald → affiliate → premium), niet afvink-hub. Bouw is bevroren tot dit verdict.

## Plaats in de reeks

| Doc | Relatie |
| --- | --- |
| Dit document | **Denkronde** — besluit vóór enige Cursor-bouw |
| `.cursor/plans/ecosysteem_ia_analyse_5583e4a4.plan.md` | Strategische analyse (aug 2026) |
| `.cursor/plans/kompas_uitwerking_0219f94c.plan.md` | Kompas bevroren + toekomst-noordster |
| [fable-domeinen-analyse-advies-voortgang-verdict-2026-08.md](fable-domeinen-analyse-advies-voortgang-verdict-2026-08.md) | Domain-gap **niet heropenen** — wel §C domeincontract respecteren |
| [claude-opus-kompas-domein-keuzehart-prompt.md](claude-opus-kompas-domein-keuzehart-prompt.md) | Vorige modelvraag; deels achterhaald door aanbevelingsmotor-pivot |
| Prebuild `#b` / `#s-b` in [beweging-keuze-consumentenbond-prebuild-v3.6-2026-08.html](../design/beweging-keuze-consumentenbond-prebuild-v3.6-2026-08.html) | **Normatief voor toekomst** — Bond-kaarten op één laag |
| Prebuild `#e` / frame K | **Tussenstap as-built** — gratis + deur schap; niet eindbeeld |
| [BESLUIT_FIT_PREFS.md](../design/BESLUIT_FIT_PREFS.md) | Locks L1–L10 — dual readout |
| [BESLUIT_BEWEGING_PRODUCT_EN_IA.md](../design/BESLUIT_BEWEGING_PRODUCT_EN_IA.md) | §A.2 lagen — L3-gate mogelijk PIVOT |
| [claude-opus-beweging-mijn-dag-verdict-2026-08.md](claude-opus-beweging-mijn-dag-verdict-2026-08.md) | Afvinken blijft Mijn Dag — niet heropenen |

## Gebruiksinstructie

1. Open **Claude Opus** in een **nieuw** gesprek met repo-toegang (niet de chat waarin preselect/dagstap is bedacht).
2. Kopieer het volledige blok onder **Prompt (copy-paste)**.
3. Claude leest de leeslijst zelf — geen bijlagen meeplakken.
4. Output = **alleen** `docs/cursors/opus-ecosysteem-aanbevelingsmotor-verdict-2026-08.md` met secties A–J (hieronder).
5. **Niets bouwen** vóór Dennis' review van het verdict. Cursor krijgt pas W1 na expliciet GO op PIVOTs.

## Wat Dennis vooraf vasthoudt (hint — toets, neem niet blind over)

- **Nu weinig veranderen:** Beweging native + prebuilds blijven; geen native rollout andere domeinen.
- **Toekomst Kompas:** per ladderlaag aanbevelen (gratis → betaald → affiliate → premium); later postcode-filter.
- **Niet centraal:** gratis dingen afvinken op Kompas — dat is Mijn Dag.
- **Consumentenbond** moet mogelijk herformuleerd: Bond = **oordeel**, niet **locatie** (schap).
- Fable domain-gap (2 aug) **niet** opnieuw draaien.

---

## Prompt (copy-paste)

```text
## Rol
Je bent senior product-architect + UX-lead voor PerfectSupplement (perfectsupplement.nl),
het leefstijlplatform voor mannen 40+ — positionering "Consumentenbond van supplementen /
leefstijl", affiliate-monetisatie op /beste/*, dashboard achter de Leefstijlcheck.

Je levert één VERDICT-markdown. GEEN code, GEEN JSX, GEEN SQL, GEEN Tailwind,
GEEN HTML-prebuild, GEEN commits. Nederlands; paden, types en event-namen Engels.

Je bent niet meegaan met een mooi verhaal. Dennis heeft een pivot; jij toetst aan repo
en gelockte besluiten. Zeg het als de pivot intern botst — met PIVOT-markering en
wat er kapotgaat.

## North star (de stelling — toets, niet automatisch bevestigen)

Dennis wil dat Kompas in de toekomst een **aanbevelingsmotor per prioriteitslaag** wordt:
wat past bij jouw stand, gerangschikt van **gratis → betaald → affiliate → premium** —
niet een hub om gratis dingen af te vinken. Later sorteert **postcode** (fit-dimensie
locatie) mee. De Consumentenbond-positionering moet mogelijk **herformuleerd** worden:
onafhankelijk oordeel **op elke aanbeveling**, niet alleen achter een schap-deur.

Vier surfaces blijven scheiden:
- **Kompas** — aanbevelen (toekomst)
- **Mijn Dag** — doen + afvinken
- **Voortgang** — bewijs + verhaal + digital twin
- **Favorieten** — rol open (schap vs detail van kaart)

**Bouw is bevroren** tot jouw verdict. As-built (aug 2026) is tussenstap, geen afkeuring.

## Vaste defaults (niet heropenen zonder PIVOT + schade)

1. Voortgang meet, Mijn Dag doet (voortgang-plan-later.md).
2. Dual readout: Bond-oordeel vast; fit/postcode sorteert — nooit één samengevoegd cijfer
   (BESLUIT_FIT_PREFS L1–L2).
3. Geen eigen producten vandaag; affiliate transparant; EFSA via approved-claims.
4. Premium = begeleiding/co-review horizon — geen gated "betere producten".
5. Fable domain-gap aug 2026 is gezet — geen zeven-domein-matrix opnieuw.
6. 5 interventiedomeinen + 2 readouts (domain-role.ts) — model blijft.
7. Afvinken primair op Mijn Dag — claude-opus-beweging-mijn-dag-verdict KILL's blijven.

## Lees vóór je begint (open echt — citeer pad:regel)

### Plans (Cursor — lees via repo)
- .cursor/plans/ecosysteem_ia_analyse_5583e4a4.plan.md
- .cursor/plans/kompas_uitwerking_0219f94c.plan.md

### Docs (lock / normatief)
- docs/core/BRAND_POSITIONING.md (§1 merk, §4 moat)
- docs/design/BESLUIT_FIT_PREFS.md (L1–L10, §3 locatie/postcode, §4 lagenkaart)
- docs/design/BESLUIT_BEWEGING_PRODUCT_EN_IA.md (§A.2 lagen, L3-gate, klaar-staat)
- docs/design/voortgang-plan-later.md ("Voortgang meet, Mijn Dag doet")
- docs/design/beweging-keuze-consumentenbond-prebuild-v3.6-2026-08.html
  → #s-b / scherm B: Bond-kaarten gratis+betaald+affiliate op één laag (TOEKOMST-normatief)
  → #s-e / frame K: as-built tussenstap (gratis + deur schap)
- docs/cursors/fable-domeinen-analyse-advies-voortgang-verdict-2026-08.md (§C contract — niet herdoen)

### Code (as-built — citeer waar relevant)
- src/components/dashboard/domain/BewegingKompasScreen.tsx
- src/components/dashboard/domain/DomainFreeActionsTile.tsx
- src/components/dashboard/domain/DomainLifestyleLadder.tsx
- src/components/dashboard/MijnKeuzeTile.tsx
- src/lib/leefstijl-ladder.ts + src/data/*/lifestyle-priorities*
- src/lib/schap-availability.ts
- src/lib/recommendation-engine.ts + src/lib/build-recommendations.ts
- src/lib/account-favorites.ts + VoortgangFavoritesProvider
- src/components/dashboard/voortgang/LeefstijlprofielDomeinScherm.tsx
- src/components/dashboard/domain/LadderCoverageMeter.tsx
- src/components/dashboard/voortgang/VoortgangHubScroll.tsx
- src/lib/events.ts + account-events allowlist route

## Werkwijze

F0  Scope — wat deze ronde WEL en NIET beslist (max 15 regels).
F1  Verificatie — as-built vs stelling; per claim WEL/NIET/DEELS + pad:regel.
Dan: KEEP / REFINE / PIVOT / KILL / DEFER per architectuurvraag.

## Centrale vragen (beantwoord elk expliciet)

Q1  Moet Kompas-domein aanbevelingskaarten tonen (spectrum gratis→premium) **op** het
    scherm, i.p.v. gratis-only + deur naar schap?
Q2  PIVOT of REFINE op BESLUIT_BEWEGING §A.2 L3 ("advies achter deur, pas na klaar-staat")?
Q3  PIVOT of REFINE op BESLUIT_FIT_PREFS §4 L4 ("geen fit-paneel op doe-surface E")?
Q4  Wordt Favorieten/schap een **detail/archief** van gekozen kaart, of blijft het aparte
    commerciële bestemming?
Q5  Hoe herformuleer je Consumentenbond (1 merkzin + 1 UI-regel) zonder "wij verkopen"?
Q6  Wat blijft op Voortgang (digital twin, levenslijn, archief) vs Kompas vs Mijn Dag?
Q7  Postcode: wanneer, welke data, register-gate — horizon only.
Q8  Premium co-viewing: grens op Voortgang — geen bouw nu.

## Output — schrijf naar
docs/cursors/opus-ecosysteem-aanbevelingsmotor-verdict-2026-08.md

Exact deze secties, in deze volgorde:

### A. Executive summary
Max 20 regels: GO/NO-GO op de pivot; wat Dennis nu wél en niet moet doen.

### B. F1 verificatie-as-built
Tabel: stelling vs code/prebuild. Minimaal 8 rijen met pad:regel.

### C. PIVOT-besluiten (verplicht — elk KEEP/REFINE/PIVOT/KILL/DEFER)
1. BESLUIT_BEWEGING L3-gate
2. BESLUIT_FIT_PREFS L4 op Kompas
3. DomainFreeActionsTile → aanbevelingskaart
4. MijnKeuzeTile rol op Kompas (nu + toekomst)
5. Favorieten/schap als surface
6. Prebuild #b vs #e als normatief
Max 8 regels onderbouwing per item; noem wat kapotgaat bij PIVOT.

### D. Aanbevelingskaart-contract
Proza-tabel: velden per kaart op één ladderlaag.
Minimaal: kind (gratis|dienst|product|begeleiding), bond_verdict, fit_sort_keys,
prijs_indicatie, primary_cta, save_to_favorites, plan_to_agenda, layer_id, domain,
product_source (affiliate|hub|premium_waitlist), compliance_note.
Eén voorbeeldkaart beweging laag 2 in prose — geen JSX.

### E. Consumentenbond herformulering
- Huidige claim vs voorgestelde claim (1 zin each)
- UI-regels (dual readout, affiliate disclosure, geen samengevoegd cijfer)
- Wat in BRAND_POSITIONING.md §1 wél/niet wijzigt vandaag (doc-only vs product)

### F. Vier surfaces — eindtoestand
Tabel: Kompas home | Kompas domein | Mijn Dag | Voortgang hub | Voortgang profiel | Favorieten
Kolommen: vraag | primair | secundair | expliciet NIET.

### G. Digital Twin Contract (kort)
Drie percentages (positie / ladder-dekking / uitvoering): bron, surface, copy-guardrail.
Geen diagnose, geen wearable-overclaim.

### H. Voortgang hub (wireframe prose)
5–8 bullets: leefstijllijn, tijdlijn, keuze-archief, logboek-verhuizing, premium placeholder.
Geen pixel-spec.

### I. Bouwgolven W1–W5 + gates
| Golf | Inhoud | Gate vóór start | Meetpunt |
W1 data-contract only; W2 Kompas pilot 1 domein; W3 Voortgang; W4 Favorieten; W5 postcode/premium.
Expliciet: **niets in Cursor vóór Dennis GO op sectie C PIVOTs.**

### J. Tegenspraak-check
Minimaal 3 punten waar A/C botsen met een gelockt doc — of expliciet "geen tegenspraak"
met bewijs. Als tegenspraak: welke lock wint tot Dennis kiest.

## Verboden in deze sessie
- Code implementeren of diffs voorstellen
- Native rollout slaap/stress/voeding plannen in detail
- Fable-style 7×7 gap-matrix
- Hermetings-/wearable-/bloed-scope heropenen
- Dagstap-preselect-spoor herprioriteren (MovementTodayHero meetvenster respecteren als DEFER)

## Meetpunten (alleen specificeren — niet registreren)
Nieuwe events voor na W2: recommendation.layer_viewed, recommendation.card_clicked,
recommendation.chosen — met params; vermelden dat allowlist 3 plekken vereist.
Bestaand choice.shelf_opened: alleen zolang schap apart blijft.

## Toon
Direct, Nederlands, geen hype. Adviezen geen diagnoses. Schrijf voor Dennis die zelf
bouwt in Cursor — hij wil besluiten, geen essay.
```

---

## Na het verdict

| Stap | Wie | Actie |
| --- | --- | --- |
| 1 | Dennis | Review sectie **C** — expliciet GO op elke PIVOT |
| 2 | Opus (optioneel) | W1-implementatieprompt voor Cursor |
| 3 | Cursor | Bouw pas na GO; context = verdict + plan |

## Meetpunt (deze ronde)

Geen product-events — dit is een besluitronde. Effect af te lezen aan: tijd tot GO,
aantal OPEN PIVOTs na review, en of W1 binnen 2 weken start.
