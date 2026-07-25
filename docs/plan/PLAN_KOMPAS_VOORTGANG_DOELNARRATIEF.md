# Kompas Home — Voortgang als doel-narratief per domein

> **Status (25 jul 2026): akkoord, in uitvoering** (zie §6). Aanleiding: Home-decluttering op branch `s0-s1-stappenplan-ontdichten`. Het huidige `VoortgangSection` in [`KompasHomeCard.tsx`](../../src/components/dashboard/kompas/KompasHomeCard.tsx) (aggregaat-trajectory-paneel + streak-kaart + week-grid + milestone) neemt veel verticale ruimte in Home, terwijl er al een aparte **Voortgang**-tab bestaat (`DASHBOARD_TABS`, zie [`src/data/dashboard/index.ts`](../../src/data/dashboard/index.ts)) met dezelfde bestemming. In plaats van het blok kaal te schrappen — wat de hermeting-reminder zou meeslepen, die nergens anders zit — wordt het **herkaderd**: één compacte regel per domein die laat zien waar je vandaan komt, waar je nu staat en waar je naartoe werkt. Geen nieuwe score, wél de Future You-belofte die elders al vastligt.
> Geënt op [`BEWEEG_COCKPIT_FUTURE_YOU.md`](./BEWEEG_COCKPIT_FUTURE_YOU.md) (besluit 4: nooit een tweede/verzonnen score naast de engine-score) en [`ANALYSE_LONGEVITY_HOME_DOMEINGEDREVEN.md`](./ANALYSE_LONGEVITY_HOME_DOMEINGEDREVEN.md) (trends per domein tonen als richting + delta + volgende stap + bron — nooit een oordeel). Sluit aan bij **"Leefstijlring Fase C"** (W/M/6M-trend per domein) uit de geconsolideerde bouwvolgorde — dit doc is een lichtere, narratieve invulling daarvan, gericht op de Home-verdichting. Copy volgt [`WRITING_VOICE.md`](../core/WRITING_VOICE.md).

---

## 0. De kern in drie zinnen

1. Vervang het ene aggregaat-paneel (totaal-vitaliteit + één pijnregel van het prioriteitsdomein) door **vijf compacte doel-regels**, één per domein — elk met baseline → nu → eerstvolgende band, als narratief, nooit als tweede cijfer.
2. Dit is **technisch bijna gratis**: `getVitalityBand`/`getNextVitalityBand` werken al op elke 0–100-score (niet alleen de aggregaat-vitaliteit), en elke `KompasDomainRow` heeft al `score`, `delta` en `nextStep`. Het enige nieuwe werk is copy en een compacte lay-out.
3. Dit lost het ruimteprobleem in Home op zónder de hermeting-reminder te laten vervallen — die blijft een losse, korte strook (huidig gedrag van `buildKompasMilestone`), niet verweven met de doel-regels.

---

## 1. Wat er nu staat, en waarom het knelt

`VoortgangSection` (`KompasHomeCard.tsx:527-687`) bevat, in volgorde:

- `TrajectoryPanel` — grote aggregaat-vitaliteitsbalk met start-/doelmarkers + één pijnregel van het prioriteitsdomein (`getVitalityExplainer`).
- Een 2-koloms grid: streak-kaart + "deze week"-stippen.
- Een milestone-strook (`buildKompasMilestone`) — hermeting-nudge, week-voortgang, of een neutrale regel.
- De knop **"Bekijk je voortgang"**, die exact dezelfde navigatie doet (`setVoortgangScreen("hub"); selectTab("voortgang")`) als de altijd-zichtbare **Voortgang**-tab in de nav (desktop tabbar + mobiele bottom nav). Puur redundante chrome.

Dat is veel ruimte voor content die grotendeels dupliceert wat één tik verderop (de Voortgang-tab) al staat, en die maar één domein (de prioriteit) een stem geeft — terwijl Home net is heringericht rond alle vijf domeinen (ring + `DomainMeterBar` per domein, "Leefstijlring Fase A").

**Let op — twee dingen zitten wél alleen in dit blok, nergens anders:**

- `remeasureDue`/`showRemeasureReminder` (`Dashboard.tsx:2977`) wordt alléén aan `KompasHomeCard` doorgegeven, alléén gebruikt in `VoortgangSection`. Geen tab-badge, geen andere plek toont "tijd voor je hermeting".
- `KompasLogboekSection` (check-geschiedenis, laatste 5 hermetingen met prioriteit-op-dat-moment) wordt alléén in `KompasHomeCard.tsx` gerenderd (desktop verborgen in de Vandaag-kolom, mobiel als eigen sectie) — niet in `VoortgangHub.tsx`. Als dit blok wegvalt zonder vervanging, verdwijnt de checklog uit de hele app.

Beide moeten dus een landingsplek houden — zie §5.

---

## 2. Het concept — oud-jij → nu → toekomstige-jij, per domein

In plaats van één aggregaat-balk: vijf regels, elk opgebouwd uit drie ankers die al bestaan:

| Anker | Bron | Voorbeeld-mechanisme |
|---|---|---|
| **Waar je vandaan kwam** | `row.score - row.delta` (alleen tonen als er een eerdere meting is — zelfde guard als de huidige `baseline`-berekening in `TrajectoryPanel`) | "Je begon op 42" |
| **Waar je nu staat** | `row.score` (al beschikbaar via `buildKompasDomainRows`) | "nu op 58" |
| **Waar je naartoe werkt** | `getNextVitalityBand(row.score)` — dezelfde 5 banden (Uit balans·Op gang·Goed·Sterk·Optimaal) die overal in de app al staan | "op weg naar Sterk" |

Dit is precies het patroon dat `TrajectoryPanel` nu al toepast op de aggregaat-vitaliteit (`baseline`/`target`-markers, `getNextVitalityBand`) — alleen per domein toegepast in plaats van eenmalig op het totaal. Geen nieuwe scoringslogica, geen nieuw getal: **dezelfde bron, vijf keer, met een korte narratieve zin eromheen.**

---

## 3. Technische bouwstenen (grotendeels al aanwezig)

| Nodig | Bestaat al? | Bron |
|---|---|---|
| Score + delta per domein | ✅ | `KompasDomainRow.score/delta` — `src/lib/kompas-home.ts:53-75` |
| Eerstvolgende band (het "doel") | ✅, generiek op elke score | `getNextVitalityBand(score)` — `src/lib/vitality-gauge.ts:78-81` |
| Bandlabel + kleur | ✅ | `getVitalityBand(score)` — zelfde bestand |
| Volgende stap per domein | ✅ | `row.nextStep` (`resolvePlanStepContent`) |
| Baseline (oud-jij) | ✅, patroon bestaat al | `TrajectoryPanel`'s `baseline`-berekening, per-domein toe te passen |
| Hermeting-reminder | ✅, blijft ongewijzigd | `buildKompasMilestone` — losse strook, niet in de doel-regels verweven |
| Narratieve regel per domein | ❌ **nieuw** | copywerk, zie §4 |
| Compacte lay-out (5 regels i.p.v. paneel+kaarten+grid) | ❌ **nieuw** | UI, geen nieuwe databron |

---

## 4. Voorbeeldcopy — vijf domeinen

Toon: empathisch → concreet, "jij/jou", geen diagnose-taal, geen tweede cijfer, geen uitroeptekens (`WRITING_VOICE.md` §2-3). Format per regel: **[label] score · badge-band · narratieve toekomstige-jij-zin.**

| Domein | Voorbeeldregel |
|---|---|
| **Slaap** | *"Slaap — van 46 naar 61. Je bouwt naar 'Sterk': de nachten waarin je dieper slaapt, tellen nu al mee voor hoe uitgerust je over vijf jaar nog wakker wordt."* |
| **Beweging** | *"Beweging — van 38 naar 52. Op weg naar 'Goed': elke week die je vasthoudt is een stap dichter bij zelf de trap op blijven komen, ook over tien jaar."* |
| **Voeding** | *"Voeding — stabiel op 64, al in 'Sterk'. Dit is het fundament dat de rest van je herstel draagt — vasthouden is hier de opdracht."* |
| **Stress** | *"Stress & herstel — van 51 naar 59. Onderweg naar 'Goed': rustmomenten die je nu inbouwt, zijn wat je later voor je laat werken in plaats van tegen je."* |
| **Verbinding** | *"Verbinding — nog geen eerdere meting. Dit wordt je startpunt — vanaf hier zie je of de contacten die je onderhoudt, meebewegen."* |

Nuances om vast te houden bij het echte schrijfwerk:

- Bij `optimaal` (hoogste band, geen volgende band) wordt "op weg naar…" een "behoud"-zin — niet forceren naar een niet-bestaand doel (zelfde randgeval als `TrajectoryPanel` nu al met `nextBand == null`).
- Bij ontbrekende baseline (nog geen eerdere meting) geen "van X naar Y", maar de bestaande *"Dit wordt je startpunt"*-frase (consistent met `BEWEEG_COCKPIT_FUTURE_YOU.md` §2.1 leeg-state).
- Geen "Concerning"/"Below average"-achtige oordeelstaal, geen biologische leeftijd — harde grens uit `ANALYSE_LONGEVITY_HOME_DOMEINGEDREVEN.md`.

---

## 5. Wat dit betekent voor `KompasHomeCard.tsx`

- `TrajectoryPanel` (aggregaat) + de streak/week-grid **vervallen** uit Home — vervangen door de vijf doel-regels uit §2/§4.
- De knop **"Bekijk je voortgang"** vervalt (redundant met de altijd-zichtbare Voortgang-tab, zie §1).
- **Hermeting-reminder**: blijft, als losse, korte milestone-strook (huidig gedrag `buildKompasMilestone`, ongewijzigde copy) — niet verweven in de doel-regels, zodat 'ie zijn eigen prioriteit houdt.
- **Logboek (`KompasLogboekSection`)**: nog geen besluit — moet óf een plek houden in Home (bv. als klein blijvertje naast de hermeting-strook), óf verhuizen naar `VoortgangHub.tsx`, óf een bewuste keuze worden om te laten vervallen. Dit is een open punt, geen aanname — zie §6.
- `onGoVoortgang`/`remeasureDue`/`onRemeasure`-props op `KompasHomeCardProps` blijven nodig zolang de hermeting-strook blijft; worden pas ongebruikt als ook die vervalt (niet voorgesteld hier).

---

## 6. Besluiten (25 jul 2026)

1. **Akkoord om te bouwen** als onderdeel van de Home-decluttering — geen aparte review-ronde vooraf.
2. **Focus-domein krijgt een eigen blok**, naast de vijf generieke doelregels: het prioriteitsdomein toont oud-jij → nu → doel expliciet met de bestaande pijnregel (`getVitalityExplainer`) erbij, in plaats van de aggregaat-`TrajectoryPanel`. Dit vervangt de eerdere "Logboek blijft/verhuist"-vraag — de nadruk ligt op de gekozen focus, niet op de ruwe checkgeschiedenis-lijst. `KompasLogboekSection` zelf blijft ongewijzigd staan (geen andere plek in de app toont 'm) totdat hier bewust een vervolgbesluit over valt.
3. **Voorspelling per domein** — uitgewerkt in een apart doc: [`PLAN_FUNCTIONELE_CAPACITEIT_PROGNOSE.md`](./PLAN_FUNCTIONELE_CAPACITEIT_PROGNOSE.md). Kern: een generiek band-narratief (dit doc) is vandaag de enige beschikbare data; een functietest-gedreven prognose (bv. bewegingsuitslag → programma-kalibratie + eventueel prognose-copy) is een eigen traject met nieuwe intake-data en, voor de prognose-copy-kant, een evidence-audit — geen blokkade voor de declutter van vandaag.
4. **Lay-out**: vijf regels als lijst (zelfde stijl als de bestaande `DomainMeterBar`-rijen), focus-blok er los boven/naast — craft-detail, geen architectuurkeuze.

*Opgesteld 25 juli 2026 n.a.v. gesprek over Kompas Home-decluttering. Verandert geen bestaande DEFER/FREEZE/KILL-status.*
