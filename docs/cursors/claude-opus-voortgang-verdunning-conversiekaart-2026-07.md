# Prompt — Voortgang verdunnen: zijbalk-navigatie, Mijn Dag-koppeling en de conversiekaart (Opus)

> **Gebruik:** kopieer alles onder **Prompt (copy-paste)** naar Claude Opus in een nieuw gesprek. Bijlagen sterk aanbevolen (screenshots 375px + desktop).
>
> **Output:** design/IA/conversie-spec **A t/m L** + **één standalone HTML-prebuild**. Geen React, geen JSX in de app, geen diffs. De HTML is het enige codeartefact.
>
> **Opgesteld:** 29 juli 2026. Harde context geverifieerd tegen branch `s0-s1-stappenplan-ontdichten`, HEAD `1bb3564` — zie "Verificatie-log" onderaan.
>
> **Familie:** volgt `[claude-opus-voortgang-graphics-redesign-2026-07.md](claude-opus-voortgang-graphics-redesign-2026-07.md)` (vorm) en `[claude-opus-voortgang-route-eigenaarschap-2026-07.md](claude-opus-voortgang-route-eigenaarschap-2026-07.md)` (eigendom). Die twee zijn uitgevoerd. Deze ronde stelt de vraag die daarna opkwam: **het staat er nu allemaal — en het is te veel.**

---

## Probleem dat deze prompt oplost

Dennis, na de graphics-ronde en de blik-splitsing (`1bb3564`):

> "Voortgang is te vol en overkill. De navigatie hoort niet midden in de scroll, de hero moet vooral de conversiekaart worden — met leefstijladvies — en 'Je metingen en je doel' overloopt grafisch. De route en de logica moeten zichtbaarder. En Mijn Dag en Voortgang mogen veel beter aan elkaar hangen."

De hub is vandaag vier zware blokken plus een navigatielijst plus een teaserlijst, allemaal in dezelfde scroll:

```
VoortgangHero          — dark full-bleed, H1 + bewijsregel + 2 CTA's + Bewijsband (SVG, 30 dagen)
VoortgangDomeinRing    — 7 domeinrijen: sparkline + band + delta + meta + doel-subrij
VoortgangRichtingBeat  — full-bleed beat: doelblok OF vitality-band-as met absolute markers
VoortgangRouteList     — "Verder kijken" (3 rijen) + "BINNENKORT" (3 rijen met badges)
```

Drie van die vier blokken zijn **full-bleed met negatieve marges** (`-mx-3 sm:-mx-4 min-[1440px]:-mx-6`), direct op elkaar gestapeld. Dat is de "graphic overloop": hero (`#132414`, `rounded-b-3xl`) → beat (`border-y`, eigen achtergrond) → tegel-taal. Er is geen ademruimte, geen contrastritme en geen duidelijke leesvolgorde.

Tegelijk:

- **Navigatie zit in de scroll.** Zes navigatie-/teaserrijen onderaan, terwijl de linker rail op Voortgang *leeg staat*: `desiredRailMode` is `"profile"` zodra `tab !== "vandaag"`. De zijbalk toont dus alleen "Wie ben ik" terwijl er zes bestemmingen in de content hangen.
- **Mijn Dag ↔ Voortgang is één zwakke pijl.** Vanuit de hero gaat één knop naar `agenda` ("Wat staat er voor vandaag"). Terug is er niets. Adherence uit Mijn Dag voedt de bewijsregel wél inhoudelijk (`cycleEvidence.activeDays`), maar dat is nergens zichtbaar als koppeling.
- **De hero is een documentaire, geen conversiekaart.** Vier states, mooie copy, maar de gratis→premium-lens en de leefstijl-vervolgstap zitten er niet in.

De vraag is dus niet "wat kan er mooier", maar:

> **Wat mag weg, wat verhuist naar de zijbalk, en hoe wordt Voortgang de conversiekaart van het leefstijladvies — met Mijn Dag als zichtbare tegenhanger in plaats van een aparte wereld?**

---

## Wat er sinds de vorige rondes is veranderd


| Toen (graphics-prompt, 28 juli)                          | Nu op `1bb3564`                                                                     |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `VoortgangBewijsRegel` als losse component               | opgegaan in `VoortgangHero` (`H1_BY_STATE` + `regel.line` + `REASSURANCE_BY_STATE`) |
| `VoortgangReisStrip` in de hub                           | **niet meer geïmporteerd** (dode component)                                         |
| `VoortgangLogboekSection` in de hub                      | **niet meer geïmporteerd** (dode component)                                         |
| Focuspaneel gedeeld met Kompas (`VoortgangKompasPanels`) | vervangen door `VoortgangRichtingBeat` (eigen doel-/band-blok)                      |
| Statistieken = één scherm                                | opgesplitst in `blik=stand` / `advies` / `tijd` met `StatistiekenBlikNav`           |
| Premium-locks op inzichten/statistieken                  | weg; premium = **wachtlijst begeleiding** (`PremiumWaitlistCard`)                   |
| Doelen bestonden niet                                    | `DomeinDoelZetten` + `domain_goals` + `GOAL_MODE_COPY` live                         |


**Nieuw en onopgelost:** de zijbalk staat op Voortgang op `"profile"`, de navigatie staat in de scroll, en Mijn Dag heeft ondertussen een volwaardige eigen wereld gekregen (18 componenten in `src/components/dashboard/agenda/`) zonder contract met Voortgang.

---

## Vastgezette keuzes (niet heropenen zonder harde onderbouwing)


| Keuze                  | Default                                                                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Output**             | Spec A–L + één standalone HTML-prebuild. Geen React/JSX in de app.                                                                                      |
| **Scope**              | Hub-landing + zijbalk + Mijn Dag-koppelvlak. Subschermen houden hun URL-contract; geen pixel-redesign van alle nested screens.                          |
| **Zijbalk-inventaris** | Vast qua inhoud (zie prompt §C). Opus beslist vorm, groepering, naamgeving en mobiel — niet óf deze bestemmingen bestaan.                               |
| **Premium**            | Premium = **begeleiding** (wachtlijst). Scores, trends, leefstijllijn, advies en historie blijven gratis. Geen nieuwe content-locks.                    |
| **Score-invariant**    | Nooit een tweede score. Adherence · beleving · evidence blijven gescheiden meetlatten.                                                                  |
| **Palet**              | Dashboard-sage/cockpit (`#132414` / `--sage #5A8F6A` / `--terra #C8956C`), niet marketing-terracotta.                                                   |
| **Compliance**         | "Adviezen, geen diagnoses". Geen medische claims, ook niet in premium- of partnercopy.                                                                  |
| **Claude-rol**         | Meedenkend architect met agency: mag blokken schrappen, copy herschrijven en eerdere docs challengen — mits onderbouwd en met vervangende landingsplek. |


---

## Gebruiksinstructie

1. Open Claude Opus in een nieuw gesprek.
2. Voeg bijlagen toe (checklist hieronder).
3. Kopieer het volledige blok onder **Prompt (copy-paste)**.
4. Verwachte output: **A t/m L**, met **K** als klikbaar HTML-bestand.
5. Review **A** (wat weg mag), **C** (zijbalk), **D** (Mijn Dag-koppeling) en **K** (prebuild) op 375px → daarna **L** omzetten naar een Cursor-prompt via de `cursor-prompt` skill.

### Bijlagen-checklist

- **Sterk aanbevolen** — screenshots 375px: `?tab=voortgang` (hele scroll, 3–4 shots), `&screen=statistieken&blik=stand`, `&blik=advies`, `&blik=tijd`, `&screen=favorieten`, `&screen=inzichten`, plus `?tab=agenda` (Mijn Dag, hele scroll).
- **Sterk aanbevolen** — desktop ≥1280px van `?tab=voortgang` (zodat de lege linker rail zichtbaar is) en `?tab=vandaag` (waar de rail wél gevuld is).
- **Aanbevolen als tekstbijlage** — `[claude-opus-voortgang-graphics-redesign-2026-07.md](claude-opus-voortgang-graphics-redesign-2026-07.md)`, `[claude-opus-voortgang-statistieken-premium-grens-advies-2026-07.md](claude-opus-voortgang-statistieken-premium-grens-advies-2026-07.md)`, `[PLAN_EIGEN_IJKPUNT_DOEL_PER_DOMEIN.md](../plan/PLAN_EIGEN_IJKPUNT_DOEL_PER_DOMEIN.md)`.
- **Optioneel** — `[CLAUDE.md](../../CLAUDE.md)`, `[WRITING_VOICE.md](../core/WRITING_VOICE.md)`, `[ACCOUNT_DASHBOARD_SYSTEM.md](../core/ACCOUNT_DASHBOARD_SYSTEM.md)`, `[docs/design/voortgang-bewijsband-prebuild-2026-07.html](../design/voortgang-bewijsband-prebuild-2026-07.html)`.

---

## Prompt (copy-paste)

```text
Je bent productarchitect + interactieontwerper + conversiestrateeg voor
PerfectSupplement (perfectsupplement.nl) — een onafhankelijk leefstijl- en
supplementenplatform voor mannen 40+. Je werkt met volledige agency op vijf
assen tegelijk: visie, architectuur, conversie/financieel, compliance en
routevolging. Je mag eerdere beslissingen challengen, maar alleen met
onderbouwing en met een vervangende landingsplek voor wat je wegsnijdt.

Je levert GEEN React, GEEN JSX, GEEN diffs in de app. Je levert een spec
(secties A t/m L) plus één standalone HTML-prebuild (sectie K).

===============================================================================
1. DE OPDRACHT IN ÉÉN ZIN
===============================================================================

Voortgang is te vol. Verdun het tot een oppervlak dat in één blik de
conversiekaart van het leefstijladvies is — met de navigatie in de linker
zijbalk, met Mijn Dag als zichtbare tegenhanger, en met een metingen-en-doel
blok dat professioneel oogt in plaats van grafisch overloopt.

===============================================================================
2. PRODUCTCONTEXT
===============================================================================

Het account-dashboard heeft vier tabs (bron: src/data/dashboard/index.ts):

  id "vandaag"    label "Kompas"     — "Je domeinen — waar je kunt verdiepen."
  id "agenda"     label "Mijn Dag"   — "Je dag, van kompas tot leefstijlmoment."
  id "voortgang"  label "Voortgang"  — "Wat zich opstapelt sinds je check."
  id "hermeting"  label "Hermeting"  — "Meet of het werkt."

TAB_SECTIONS:
  vandaag: ["kompasHome"]
  agenda: ["agendaHome"]        -> AgendaScreen
  voortgang: ["voortgangHub"]   -> VoortgangHub
  hermeting: ["retest", "future"]

Productjobs zoals ze nu bedoeld zijn:
  Kompas     = waar sta ik, wat is het ene ding
  Mijn Dag   = uitvoeren (dagtijdlijn, blokken, check-ins)
  Voortgang  = werkt wat ik doe? (bewijs) + waar kijk ik verder
  Hermeting  = de cyclus sluiten

Monetisatie vandaag: affiliate links op de publieke vergelijkingspagina's.
In het dashboard verkopen we niets. Premium bestaat nog niet als product;
er is een WACHTLIJST voor "Premium · Begeleiding". Scores, trends,
leefstijllijn, advies en historie zijn en blijven gratis.

===============================================================================
3. AS-BUILT: WAT ER NU OP VOORTGANG STAAT (geverifieerd, HEAD 1bb3564)
===============================================================================

3.1 Screen-router
  src/components/dashboard/VoortgangHub.tsx routeert op ?screen=
    (leeg) = hub          -> VoortgangHubScroll
    statistieken          -> StatistiekenView (met ?blik=stand|advies|tijd)
    favorieten            -> FavorietenView
    inzichten             -> VitaalscoreInzichtenView
    lichaamssamenstelling -> LichaamssamenstellingView
  URL-helpers: src/lib/dashboard-url.ts, src/lib/statistieken-blik.ts
  Default blik: "advies" als voedingscheck ontbreekt, anders "stand".

3.2 Hub-scroll (src/components/dashboard/voortgang/VoortgangHubScroll.tsx)
  volgorde: VoortgangHero -> VoortgangDomeinRing -> VoortgangRichtingBeat
            -> VoortgangRouteList  (+ DomeinDoelZetten als modal)

3.3 VoortgangHero.tsx
  - full-bleed dark blok: bg #132414, rounded-b-3xl, -mx-3 sm:-mx-4
    min-[1440px]:-mx-6, grid-overlay + sage glow, lg: twee kolommen
  - eyebrow: "BEWIJS · DAG {cycleDay}"
  - H1 per state (4 states uit src/lib/voortgang-bewijs-copy.ts):
      beantwoord: "Er zit beweging in."
      opbouwend:  "Er stapelt zich iets op. Lezen doe je straks."
      dun:        "Er ligt nog te weinig om iets te lezen."
      wachtend:   "Je bewijs begint bij je eerste dag."
  - body: regel.line (dynamisch: actieve dagen, focus-delta, dagen tot hermeting)
  - reassurance-regel per state (klein, 40% wit)
  - CTA's: als hermeting <=14 dagen -> "Naar je hermeting" (primair) +
    "Wat staat er voor vandaag" (naar tab agenda). Anders -> primair
    regel.ctaLabel (default "Wat staat er voor vandaag", naar tab agenda)
    + tekstlink "Bekijk je {prioriteit}".
  - rechts: VoortgangBewijsband — interactieve SVG van de 30-daagse cyclus
    met meetpunten en scrub (src/lib/voortgang-bewijsband.ts)
  - event: trackEvent("dashboard_voortgang_bewijs_state", {state, cycle_day,
    active_days}) + clarityTag("dashboard_voortgang", "bewijs_<state>")

3.4 VoortgangDomeinRing.tsx
  - CockpitTile; eyebrow "Je metingen"; H3 "Wat je van jezelf weet"
  - per domein een rij: kleurstip + label + Sparkline (72x24) +
    band-kortlabel + DeltaBadge + meta ("N metingen · X dagen geleden" of
    "nog niet apart gemeten")
  - interventiedomeinen krijgen een doel-subrij: eigen woorden + "nu N",
    knop "Zetten →" / "Bijwerken →" (opent DomeinDoelZetten)
  - readout-domeinen staan apart onder "Volgt uit de rest"
  - dekkingsregel: "Je hebt N van de 7 domeinen apart gemeten. ..."

3.5 VoortgangRichtingBeat.tsx
  - full-bleed beat (-mx-3 ... border-y, eigen achtergrondklasse ps-dash-beat)
  - MET doel op het prioriteitsdomein: eyebrow "Je doel · {domein} · dag N
    van 30", H2 = eigen woorden, GOAL_MODE_COPY (verwerven/behouden/
    herpakken), ijkpuntregel "Bij je start stond dit op X, nu op Y.",
    knop "Bekijk je cijfers over tijd →" (naar Statistieken)
  - ZONDER doel: as-graphic met vitality-bands — start/nu/volgend niveau,
    percentages absoluut gepositioneerd (pct(), fillLeft/fillWidth/
    dashLeft/dashWidth), labels "Bij je start" / "Nu" / "Volgend niveau"

3.6 VoortgangRouteList.tsx  — DIT IS DE NAVIGATIE DIE MOET VERHUIZEN
  Kop "Verder kijken" / H2 "Waar je dit verder uitzoekt", 3 rijen:
    Statistieken      — "Wat je metingen zeggen over supplementen"
    Favorieten        — "Je eigen keuzes en onze aanraders"
    Jouw inzichten    — "Je totaalscore en wat je prioriteit drijft"
  Daaronder, na een divider, label "BINNENKORT", 3 rijen met terra-badge:
    Lichaamssamenstelling — "Vet, spier en vocht als aparte meetlat"
                            badge "Binnenkort in te vullen"
                            -> opent screen=lichaamssamenstelling (bestaat,
                               toont lege identiteitsvelden)
    Je wearable koppelen  — "Slaap en herstel automatisch mee laten lopen"
                            badge "Binnenkort"
                            -> GEEN scherm; alleen events
                               emitAccountClientEvent("wearable.interest_clicked")
                               + trackEvent("wearable_interest")
    Begeleiding naast je leefstijl — "Wekelijks iemand die met je meekijkt"
                            badge "In ontwikkeling"
                            -> opent Statistieken blik=tijd en scrollt naar
                               #premium-begeleiding (PremiumWaitlistCard)

3.7 De linker rail (zijbalk) — NU LEEG OP VOORTGANG
  src/components/dashboard/cockpit/CockpitFrame.tsx rendert
  CockpitContextRail met drie modi uit src/lib/context-rail.ts:
    "profile" | "kompasHome" | "domainTools"
  In Dashboard.tsx:
    desiredRailMode = (empty || tab !== "vandaag") ? "profile"
                      : !viewedDomain ? "kompasHome" : "domainTools"
  Gevolg: op tab=voortgang staat de rail ALTIJD op "profile" — hij toont
  alleen "Wie ben ik" (naam, anker, status). De hele zijbalk is dus
  ongebruikte navigatieruimte op precies het oppervlak dat zes bestemmingen
  in de scroll propt.
  Mobiel: de desktop-aside is `hidden md:flex`; onder md is er alleen een
  compacte profielbalk (`md:hidden`). Een zijbalk-oplossing MOET dus een
  expliciet mobiel antwoord hebben (375px is de maatgevende breedte).
  ContextRailToolId is een gesloten union: "vandaag" | "stappenplan" |
  "checkin" | "supplementen" | "gids" | "inzichten" — vandaag alleen gevuld
  voor het beweging-domein (buildBewegingRailTools).

3.8 Mijn Dag (tab agenda) — de tegenhanger
  src/components/dashboard/agenda/ bevat o.a. AgendaScreen, AgendaShell,
  AgendaTodayHero, AgendaWeekStrip, AgendaDayTimeline, AgendaBlockCard,
  AgendaBlockDetailSheet, AgendaAddBlockSheet, AgendaFocusPicker,
  AgendaTimeBucketPicker, AgendaPlanStepStrip, AgendaProvenanceStrip,
  AgendaMetaRow, PriorityOverTimePanel, KompasLooseCard.
  Bestaande koppelingen tussen de twee werelden vandaag:
    - Voortgang -> Mijn Dag: één hero-CTA ("Wat staat er voor vandaag")
    - Mijn Dag -> Voortgang: NIETS expliciets
    - impliciet: cycleEvidence.activeDays (adherence) voedt de bewijsregel
      op Voortgang; PriorityOverTimePanel woont in agenda/ maar wordt op
      Statistieken blik=tijd gerenderd
  Er is dus wél datadeling, maar geen zichtbaar routecontract.

3.9 Meetpunten die al bestaan (hergebruiken vóór je iets nieuws verzint)
  GA4: dashboard_voortgang_hub_click {destination, surface}
       dashboard_voortgang_bewijs_state {state, cycle_day, active_days}
       dashboard_voortgang_domein_click {domain}
       dashboard_voortgang_terug {from}
       dashboard_voortgang_tab_reset
       dashboard_statistieken_blik_switch {from, to}
       dashboard_lichaamssamenstelling_getoond {surface}
       dashboard_voortgang_supplementen_click {surface}
       dashboard_kompas_begeleiding_link_click {surface}
       dashboard_context_rail_tool_click {...}
       wearable_interest {surface}
  Clarity: clarityTag("dashboard_voortgang", <waarde>)
  Durable domain_events (src/lib/events.ts): wearable.interest_clicked,
       premium.waitlist_joined, premium.price_indicated, affiliate.click,
       dashboard.advies_gate_passed, remeasure.invited, focus.viewed,
       dashboard.domain_check_cta_clicked
  LET OP: een NIEUW client-event vanaf het dashboard vereist registratie op
  drie plekken (src/lib/events.ts + src/lib/account-events-client.ts +
  allowlist in src/app/api/account/events/route.ts), anders 403. De
  client-allowlist bevat nu maar vijf types. Stel dus alleen nieuwe durable
  events voor als een GA4-event echt niet volstaat.

===============================================================================
4. DE VIJF ASSEN WAAROP JE MOET LEVEREN
===============================================================================

VISIE          — één zin die Voortgang doet wat geen ander oppervlak mag
                 overnemen. Alles wat die zin niet dient: benoem het en snijd.
ARCHITECTUUR   — hub-compositie met maximaal 2 à 3 jobs boven de vouw;
                 navigatie in de rail; URL-contract intact; expliciet
                 koppelvlak agenda <-> voortgang.
CONVERSIE/     — de weg van gratis bewijs naar betaalde begeleiding, plus de
FINANCIEEL       plek waar leefstijl-producten later landen, zonder dat de
                 bewijsjob gekaapt wordt door commerce.
COMPLIANCE     — geen diagnose-taal, geen medische claims, eerlijke
                 premium-belofte, en een privacy-signaal zodra
                 productgegevens aan een profiel gekoppeld worden.
ROUTEVOLGING   — de lus Kompas -> Mijn Dag -> Voortgang -> Hermeting moet
                 zichtbaar zijn ín het ontwerp, niet alleen in de tabbar.

===============================================================================
5. DE VIJF CONCRETE PROBLEMEN
===============================================================================

P1 TE VOL / OVERKILL
   Vier zware blokken, drie ervan full-bleed met negatieve marges, direct op
   elkaar. Geen contrastritme, geen flagship, alles even luid. Bepaal per
   blok: behouden / verdunnen / verplaatsen / schrappen — en waar het naartoe
   gaat als het weggaat.

P2 NAVIGATIE HOORT IN DE ZIJBALK
   De zes bestemmingen uit VoortgangRouteList moeten links in de zijbalk
   staan (of anderszins permanent klikbaar), niet onderaan de scroll. De
   inventaris ligt vast:
     Verder kijken: Statistieken · Favorieten · Jouw inzichten
     "Binnenkort" (naam mag/moet beter): Lichaamssamenstelling ·
       Je wearable koppelen · Begeleiding naast je leefstijl
   Jij bepaalt: rail-modus en groepering, labels, de nieuwe naam voor
   "BINNENKORT", badge-taal, actieve staat, en het mobiele equivalent op
   375px. Elk item moet klikbaar zijn met óf een echte route óf een meetbaar
   interest-signaal. Geen dode belofte zonder oppervlak.

P3 HERO ALS CONVERSIEKAART MET LEEFSTIJLADVIES
   De hero is nu een bewijs-documentaire. Hij moet de conversiekaart worden:
   herkenning -> wat werkt bij jou -> de volgende leefstijlstap -> (waar
   passend) begeleiding. Herzie de copy, en beslis expliciet wat er met de
   Bewijsband gebeurt: behouden zoals hij is, vereenvoudigen, verplaatsen of
   vervangen door iets dat de conversie beter draagt. Onderbouw. Denk daarbij
   mee met de toekomst: het dashboard krijgt later een productlaag
   (herordenen/abonnement, zie sectie H) — de hero moet daar ruimte voor
   hebben zonder er nu iets van te tonen.

P4 "JE METINGEN EN JE DOEL" — SAMENHANG EN GEEN OVERLOOP
   DomeinRing en RichtingBeat vertellen samen één verhaal (waar sta je, waar
   wil je heen) maar zijn twee losse zware secties met botsende visuele
   talen: sparklines + badges in tegeltaal, daarnaast een full-bleed as met
   absoluut gepositioneerde markers die op smalle schermen tegen elkaar aan
   loopt. Ontwerp dit als één samenhangend geheel — of als een bewuste split
   met duidelijke hiërarchie — dat er professioneel uitziet, niet overloopt
   op 375px, en waarin de LOGICA zichtbaar is: check -> dagelijks doen ->
   hermeting -> advies.

P5 MIJN DAG EN VOORTGANG MOETEN GEKOPPELD
   Ontwerp het contract tussen tab "agenda" en tab "voortgang":
     - welke signalen reizen van Voortgang naar Mijn Dag (en als welke CTA)
     - welke signalen reizen terug (adherence voedt bewijs — maak dat
       zichtbaar in plaats van impliciet)
     - wat mag NIET dubbel verteld worden op beide tabs
     - waar dat contract fysiek landt: hero, metingen-blok, zijbalk of een
       eigen strip
   Doel: de gebruiker voelt één systeem — doen op Mijn Dag, aflezen op
   Voortgang — niet twee losse dashboards.

===============================================================================
6. OPEN PRODUCTVRAAG (beantwoorden, niet bouwen)
===============================================================================

Dennis' idee, waar je in sectie H een gemotiveerd antwoord op geeft:

  "Kan leefstijl gekoppeld worden aan de agenda als optie — en later:
   leefstijl-producten van partners (producten, abonnementen) koppelen aan
   het profiel, zodat herbestellen en trouw-blijven zichtbaar worden in
   Voortgang én Mijn Dag?"

Geef: ja/nee/wanneer, met onderbouwing tegen de huidige positionering
("De Consumentenbond van supplementen", "wij verkopen zelf niets", affiliate
als verdienmodel). Beschrijf waar dit in de IA landt, wat gratis is versus
premium versus partner-commerce, welk privacy-effect het heeft (profiel +
productgegevens = nieuw verwerkingsdoel, register- en privacyverklaring-
gate), en wat er NU al als ghost/teaser in het ontwerp mag zonder een
belofte te doen die we niet waarmaken.

===============================================================================
7. INVARIANTEN — NIET OVERTREDEN
===============================================================================

- Nooit een tweede score. Adherence, beleving en evidence blijven gescheiden.
- Geen nieuwe content-locks: scores, trends, leefstijllijn, advies en
  historie blijven gratis. Premium = begeleiding (vandaag: wachtlijst).
- Geen medische claims, geen diagnose-taal. "Adviezen, geen diagnoses."
- Nederlandse UI-copy, nuchter en concreet; toon volgens WRITING_VOICE:
  begrip -> urgentie -> actie. Geen hype, geen uitroeptekens, geen emoji.
- URL-contract blijft: ?tab=voortgang&screen=...&blik=...
- Mobiel eerst: 375px is de maat. Tikdoelen >= 44px.
- Wat je wegsnijdt krijgt een vervangende landingsplek, of je verdedigt
  expliciet waarom het helemaal weg mag.

===============================================================================
8. GEVRAAGDE OUTPUT — SECTIES A T/M L
===============================================================================

A. VERDUNNINGSAUDIT
   Tabel over alle huidige hub-onderdelen (hero, bewijsband, domeinring,
   doel-subrijen, richting-beat, routelijst, binnenkort-rijen) met per regel:
   wat het vertelt · voor wie het waarde heeft · verdict (behouden /
   verdunnen / verplaatsen / schrappen) · waar het heen gaat · wat je
   verliest. Sluit af met: hoeveel blokken blijven er over en waarom precies
   die.

B. PRODUCTJOB EN CONVERSIEKAART
   De ene zin voor Voortgang. Drie anti-jobs (wat het expliciet niet is).
   Daarna de conversiekaart: van gratis bewijs naar begeleiding, met per
   stap het moment, het bewijs dat de stap rechtvaardigt, en de CTA. Benoem
   waar affiliate/favorieten in die kaart passen zonder de bewijsjob te
   kapen.

C. ZIJBALK-NAVIGATIE
   Het volledige rail-ontwerp voor Voortgang: modus, groepering, labels,
   volgorde, actieve staat, badges, en de nieuwe naam voor "BINNENKORT".
   Expliciet: het mobiele equivalent op 375px (en waarom die vorm). Geef ook
   aan wat er met de huidige VoortgangRouteList gebeurt (verdwijnt volledig,
   of blijft er een rest-CTA in de scroll) en welk effect dat heeft op de
   bestaande events dashboard_voortgang_hub_click {destination, surface}.

D. KOPPELCONTRACT MIJN DAG <-> VOORTGANG
   Een tabel met per signaal: eigenaar · waar het getoond wordt · waar het
   heen linkt · wat de andere tab er NIET over zegt. Plus de twee concrete
   CTA-paden (Voortgang -> Mijn Dag en Mijn Dag -> Voortgang) met copy.
   Plus: hoe maak je zichtbaar dat wat je op Mijn Dag doet het bewijs op
   Voortgang voedt, zonder een tweede score te introduceren.

E. HERO-HERONTWERP
   Nieuwe compositie en nieuwe copy per state (behoud de vier states of
   beargumenteer een andere indeling). Geef letterlijke NL-copy: eyebrow, H1,
   body, CTA-labels, reassurance. Beslis en verdedig wat er met de
   Bewijsband gebeurt. Beschrijf de rol van de hero in de conversiekaart uit
   B en de plek van het leefstijladvies erin.

F. METINGEN EN DOEL — HERONTWERP
   Eén samenhangend ontwerp voor wat nu DomeinRing + RichtingBeat is.
   Beschrijf: compositie, hiërarchie, welke data per domein zichtbaar blijft,
   hoe doelen erin zitten, hoe je de overloop op 375px oplost, en hoe de
   route/logica (check -> doen -> hermeting -> advies) afleesbaar wordt.
   Wees concreet over de visuele taal: welke grafiek, welke schaal, welke
   labels, welk gedrag bij weinig data.

G. ROUTEKAART
   Een mermaid-diagram plus tabel van de volledige lus: vier tabs, de
   Voortgang-subschermen (screen=, blik=), en de deep links
   (#premium-begeleiding). Per pijl: de trigger, de copy op de knop, en het
   event. Markeer expliciet welke pijlen vandaag ontbreken.

H. TOEKOMSTHAAK: LEEFSTIJL x AGENDA x PARTNERPRODUCTEN
   Het antwoord op de open productvraag uit blok 6. Geef: verdict met
   onderbouwing, de IA-plek (nieuw zijbalk-item / onder Favorieten /
   binnenkort-groep), de scheiding gratis vs premium vs partner-commerce,
   de privacy- en registerimpact op hoofdlijnen, het risico voor de
   onafhankelijkheidspositionering en hoe je dat mitigeert, en wat er nu al
   als ghost in de prebuild mag.

I. CONVERSIE EN MEETPUNTEN
   Per nieuw of gewijzigd interactiepunt: welk bestaand GA4-event het
   hergebruikt (met welke params), of er een Clarity-tag bij hoort, en of
   een durable domain_event nodig is. Als je een nieuw durable event
   voorstelt: noem de drie registratieplekken en verdedig waarom GA4 niet
   volstaat. Geef ook de leesvraag per meetpunt: welke beslissing neem je
   over twee weken op basis van dit cijfer?

J. COMPLIANCE-GATE
   Loop je eigen copy na op: medische claims, diagnose-taal, premium-
   beloftes die we niet waarmaken, "binnenkort" zonder datum, en
   profielgekoppelde productgegevens. Geef per risico de veilige formulering.
   Benoem expliciet of je voorstel een update van het verwerkingsregister of
   de privacyverklaring vereist.

K. HTML-PREBUILD
   Eén standalone HTML-bestand (inline CSS, minimale vanilla JS, geen build,
   geen externe assets behalve Google Fonts). Eisen:
     - toont de nieuwe Voortgang-hub inclusief de zijbalk-navigatie
     - werkt en oogt correct op 375px en op >= 1280px (responsive, niet twee
       losse mockups)
     - de zijbalk-items zijn klikbaar en tonen minimaal een plausibele
       inhoud of lege staat
     - toont minstens twee datastaten (bijv. "veel data" en "net begonnen")
       via een schakelaar
     - geen horizontale overflow, geen overlappende labels
     - dashboard-palet (#132414 / --sage #5A8F6A / --terra #C8956C),
       DM Sans + DM Serif Display
     - de toekomsthaak uit H alleen als expliciet gemarkeerde ghost
   Lever het als één codeblok met bestandsnaam
   docs/design/voortgang-conversiekaart-prebuild-2026-07.html

L. BOUWGOLVEN EN EERSTE BOUWPAKKET
   Drie tot vijf golven, elk los reviewbaar en los meetbaar (attributie: niet
   meerdere conversie-gevoelige wijzigingen in één deploy zonder dat het
   effect apart af te lezen is). Per golf: wat er verandert, welke bestanden
   geraakt worden, wat het meetpunt is, en het risico. Werk golf 1 uit als
   Cursor-bouwpakket-briefing (nog geen prompt: de ingrediënten waaruit ik
   een Cursor-prompt maak). Sluit af met "Bewust niet gedaan": minstens drie
   dingen die je hebt overwogen en afgewezen, met reden.

===============================================================================
9. WERKWIJZE
===============================================================================

- Begin met A. Als je vindt dat de opdracht verkeerd geframed is, zeg dat in
  één alinea vóór A en ga daarna alsnog door de secties heen.
- Wees concreet: letterlijke NL-copy, echte labels, echte getallen in
  voorbeelden. Geen "hier komt een pakkende kop".
- Gebruik tabellen waar dat sneller leest dan proza, en mermaid voor de
  routekaart.
- Verzin geen bestandspaden of API's die hierboven niet genoemd zijn.
- Nederlandse output. Geen emoji.
```

---

## Verificatie-log

Alle claims in dit document zijn op 29 juli 2026 nagelopen tegen branch `s0-s1-stappenplan-ontdichten`, HEAD `1bb3564` ("feat(dashboard): Statistieken opdelen in Stand, Advies en Over tijd"). Werkboom schoon op één untracked bestand (`.mcp.json`) na.


| Claim                                                                                                       | Bron                                                                                                              |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Vier tabs met labels Kompas / Mijn Dag / Voortgang / Hermeting                                              | `[src/data/dashboard/index.ts:317-350](../../src/data/dashboard/index.ts#L317-L350)`                              |
| `TAB_SECTIONS.voortgang = ["voortgangHub"]`, `agenda = ["agendaHome"]`                                      | `[src/data/dashboard/index.ts:352-357](../../src/data/dashboard/index.ts#L352-L357)`                              |
| Hub-volgorde Hero → DomeinRing → RichtingBeat → RouteList                                                   | `[VoortgangHubScroll.tsx](../../src/components/dashboard/voortgang/VoortgangHubScroll.tsx)`                       |
| Hero full-bleed `#132414`, 4 states, CTA naar agenda, Bewijsband rechts                                     | `[VoortgangHero.tsx:26-38,109-198](../../src/components/dashboard/voortgang/VoortgangHero.tsx#L26-L198)`          |
| DomeinRing eyebrow "Je metingen", sparkline + band + delta + doel-subrij                                    | `[VoortgangDomeinRing.tsx](../../src/components/dashboard/voortgang/VoortgangDomeinRing.tsx)`                     |
| RichtingBeat: doelblok of band-as met absolute markers, full-bleed `border-y`                               | `[VoortgangRichtingBeat.tsx:81-160](../../src/components/dashboard/voortgang/VoortgangRichtingBeat.tsx#L81-L160)` |
| RouteList: 3 routes + "BINNENKORT" met 3 badge-rijen; wearable heeft geen scherm                            | `[VoortgangRouteList.tsx:16-32,86-180](../../src/components/dashboard/voortgang/VoortgangRouteList.tsx#L16-L180)` |
| Rail staat op `"profile"` zodra `tab !== "vandaag"`                                                         | `[Dashboard.tsx:4091-4100](../../src/components/dashboard/Dashboard.tsx#L4091-L4100)`                             |
| Rail-aside is `hidden md:flex`, mobiel alleen profielbalk                                                   | `[CockpitContextRail.tsx:204-244](../../src/components/dashboard/cockpit/CockpitContextRail.tsx#L204-L244)`       |
| `ContextRailToolId` is gesloten union van zes ids; alleen beweging vult tools                               | `[src/lib/context-rail.ts:23-29,76-128](../../src/lib/context-rail.ts#L23-L128)`                                  |
| 18 componenten in `src/components/dashboard/agenda/`; `PriorityOverTimePanel` wordt buiten agenda gerenderd | `[Dashboard.tsx:29,3470](../../src/components/dashboard/Dashboard.tsx#L3470)`                                     |
| Client domain-events allowlist bevat vijf types                                                             | `[src/lib/account-events-client.ts:3-10](../../src/lib/account-events-client.ts#L3-L10)`                          |
| `wearable.interest_clicked`, `premium.waitlist_joined`, `affiliate.click` bestaan als domain-event          | `[src/lib/events.ts:50-66](../../src/lib/events.ts#L50-L66)`                                                      |
| `VoortgangReisStrip` / `VoortgangLogboekSection` / `VoortgangBewijsRegel` niet meer geïmporteerd in de hub  | grep op `src/components/dashboard/`                                                                               |


**Meetpunt:** dit document verandert geen code en heeft dus geen eigen meetpunt. Sectie I van de Opus-output levert het meetplan; dat wordt bindend in het Cursor-bouwpakket uit sectie L.