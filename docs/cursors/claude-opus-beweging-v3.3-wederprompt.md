# Wederprompt — Beweging v3.3: het voorstel wordt persoonlijk, Mijn Dag volgt de live agenda

> **Status:** uitgevoerd. De prebuild staat in [`beweging-keuze-consumentenbond-prebuild-v3.3-2026-08.html`](../design/beweging-keuze-consumentenbond-prebuild-v3.3-2026-08.html).
> **Basis:** v3.2-prebuild, gericht uitgebreid — niet opnieuw uitgevonden.
> **Vorige stap:** [`claude-opus-beweging-v3.2-wederprompt.md`](claude-opus-beweging-v3.2-wederprompt.md)
> **Aanleiding:** kritische review op v3.2 met Opus-prompt v3.3 (8 augustus 2026).
> **Opgesteld:** 8 augustus 2026.

---

## 1. Wederwoord in één alinea

De kern van de review klopt en is overgenomen: v3.2 was Peter-47-kracht-thuis geschilderd,
niet afgeleid. Het voorstel, het waarom en de plek komen nu uit een profiel-object met vier
velden, en elk daarvan is in de chrome om te zetten zodat je kunt zíen dat het meebeweegt.
Scherm D volgt nu de live agenda in plaats van andersom. Op twee punten wijk ik af van de
voorgestelde *oplossing* (§3), en ik vond één lock-schending die niet in de review stond en
zwaarder weegt dan een deel van wat er wél in stond (§4).

---

## 2. Overgenomen zonder wijziging

| # | Bevinding review | Wat er gebeurd is |
| --- | --- | --- |
| A1 | Kop "2 keer kracht thuis" is hardcoded | Kop = frequentie + wat (`programHead`). Plek staat in de sublead. |
| A2 | "Je wilde het zelf doen" is speculatief | Ankerregel bestaat alleen bij een gezet anker. Geen anker → twee waarom-regels. |
| A3 | "Na je 40e" is statisch | Drie leeftijdsvarianten (40–49 / 50–59 / 60+), per programma anders geformuleerd. |
| A4 | Waarom-regel 1 moet weten of er een beweegcheck was | `WHY[programma].src.lc` vs `.bc`. Een Leefstijlcheck zegt niets over je conditie, dus zegt de copy dat ook niet. |
| A5 | Geen regel dat dit op Mijn Dag landt | "Komt op Mijn Dag · maandag 3 augustus · 18:00", direct bóven de primaire knop. |
| A6 | "Ik ben ervaren" niet in MVP, wel een stille link | Link onder de ghost-knop → sheet die alleen `currentLayer` verzet. |
| E1 | Conditie ontbreekt naast kracht | Tweede read-only regel onder de kop, alleen bij een gemeten conditie-gap. Geen tweede Gedaan-knop. |
| E2 | Geen weekstand | "Eén gedaan deze week · nog één te gaan", meebewegend met afvinken. |
| E3 | Plek niet op E wijzigbaar | Klopt, en blijft zo: dat woont in je programma. |
| E4 | Brede sportkeuze op E | Niet gebouwd. |
| C1 | Emotie = resultaat, niet wanneer-wel/niet | Laag-tik geeft één resultaat-zin + metaregel; de rest achter "Bekijk waarom". |
| C2 | Geen open panelen bij load | `followCurrent` eruit, `open: null`. |
| D1 | Prebuild moet live volgen | Tray/raster-schakelaar conform `resolvePlanStepPlacement`; mock-label bovenaan. |
| D2 | Geen ladder-schakelaar op D | Niet gebouwd; calibratie loopt via A en Voortgang. |
| D3 | Geen tier-picker op D | Was er niet, is er niet. |
| B1 | Brug: conditie-actie alleen als het profiel het toelaat | 2 acties bij Leefstijlcheck, 3 bij beweegcheck. Nooit meer dan 3. |

---

## 3. Twee afwijkingen — en waarom

### 3.1 Plek zit niet in de wizard, maar in "Je programma"

**Voorgesteld:** `PATTERNS` uitbreiden naar kracht-thuis, kracht-gym, kracht-groep.

**Probleem:** dat schuift twee velden in elkaar. `MovementStartPattern` is in
[`movement-prefs.ts`](../../src/lib/movement-prefs.ts) een enum van drie waarden
(`kracht | conditie | dagelijks_ritme`), 1:1 met `WEEK_CATEGORY_OPTIONS`. Plek is een
tweede as: kracht thuis en kracht in de sportschool zijn hetzelfde programma op een andere
plek. Ze in één lijstje zetten naast "conditie" maakt van een enum van 3 een enum van 5 die
twee dingen tegelijk codeert — precies de veldsplitsing die in de sportlaag-analyse al is
gelockt (locatie en sport apart houden). En het maakt van een wizard van 30 seconden een
wizard van drie stappen.

**Gebouwd:** plek is een eigen veld met drie waarden en woont in de programma-uitklap, naast
de dosis. Dat is dezelfde plek waar de review het in zijn eigen MVP-tabel zet
("Sublead + programma-sheet"). De spec-rij *Plek* stond daar al als dode tekst; die is nu de
besturing. Het effect dat gevraagd werd is er wél: titel, sublead, vorm-spec en plek-spec
synchroniseren naar E, C en Mijn Dag.

**Bijvangst:** het programma wisselen verzet nu ook `need` en de dagen, en bouwt de planner
opnieuw op. In v3.2 wisselde alleen de titel mee, zodat de kop "3× wandelen" kon beloven
terwijl de planner nog om twee dagen vroeg.

### 3.2 De week-readout op Mijn Dag staat UIT, niet aan

**Voorgesteld:** "max 2 regels, optioneel toggle in reviewer-chrome".

**Probleem:** het Mijn Dag-verdict zet de week-readout op **DEFER** wegens doublure met
Voortgang. Een blok dat standaard aan staat is niet gedefererd; dan is de toggle een
feature-vlag die per ongeluk de verkeerde kant op staat.

**Gebouwd:** hij bestaat, hij is twee positieve regels, en hij staat **uit** bij load. De
reviewer-chrome zet hem aan met het label "uit (verdict DEFER)". Zo is te zien wat het zou
worden zonder te doen alsof het besluit al gevallen is.

---

## 4. Eén bevinding die niet in de review stond

**De prebuild schond de copy-verbodslijst.** `BESLUIT_BEWEGING_PRODUCT_EN_IA.md` §C.2 verbiedt
in UI-copy zonder uitzondering onder meer *spoor · startpatroon · categorie · kompas ·
stappenplan · fase · coming soon*. v3.2 gebruikte "kies je spoor" en "Eén spoor is genoeg" in
de wizard, "Leefstijl-kompas · beweging" in de rail en "Beweging · je kompas" op Voortgang.
Dat is geen detail: het is dezelfde vier-namen-bug die dat besluit juist oploste. In v3.3 heet
de wizard **Jouw programma**, en de ladder heet overal **ladder** — het woord dat op Mijn Dag
al stond.

De review vraagt zelf op twee plekken om "kompas-readout" en "Waar sta je in je kompas?".
Die zijn uitgevoerd als *ladder*, met dezelfde betekenis.

**Twee dingen die hierbij blijven staan (bewust, geen bug):**

- Scherm **B** is geparkeerd en niet herschreven; daar staat nog "Week 1 van 8" en soortgelijke
  copy. Dat is de v3.2-lijn (§7): een scherm zonder pad ernaartoe herschrijven suggereert dat
  het terugkomt.
- De **code-namen** (`startPattern`, `MovementStartChoice`) blijven ongemoeid. §C.2 is een
  copy-regel, geen refactor-opdracht.

---

## 5. Wat gebouwd is — per scherm

**A · eerste keer.** Bron-regel uit het profiel · kop = *"Dit stellen we voor: 2 keer kracht"* ·
sublead = plek + duur · waarom-blok van twee of drie regels uit het profiel · landingsregel
*"Komt op Mijn Dag · maandag 3 augustus · 18:00"* boven de primaire knop · *ander moment* als
link eronder · ghost *Ik doe hem nu* · stille link *Ik doe al structureel kracht* → sheet.
In "Je programma": vorm, plek (drie chips), duur per keer, dosis-doel.

**A2 · wizard.** Twee stappen, geen drie. Stap 1 zet het programma (en daarmee frequentie,
dagen en planner). Stap 2 zet het anker — dat levert nu écht iets op: de derde waarom-regel.
Eigen woorden blijven de aparte "Jouw reden"-regel.

**E · elke dag.** Weekstand telt wat je deed. Conditie-regel read-only onder de kop, alleen bij
een gemeten gap. Afvinken op E zet dezelfde staat als de knop op Mijn Dag en telt één keer mee.

**C · Voortgang.** Opent dicht. Laag-tik → paneel met kop · één resultaat-zin · metaregel ·
"Bekijk waarom". Achter die vouw: wanneer wel, wanneer niet, de evidence-zin, de richtlijn en
de previewkaarten. Footer-link "Lees alles over kracht en conditie" (label-only, `href="#"`).

**D · Mijn Dag.** Reviewer-label bovenaan dat zegt waarop dit gebaseerd is. Dagstap in de tray
(dashed, geen tijd, "Kies een moment") of in het raster (met tijd). Een moment kiezen in de
tray schakelt zichtbaar om naar het raster — dat is de beloning die "Verplaats" live nog mist.
Week-readout uit. Geen ladder op deze surface.

**Brug.** Twee acties, drie bij een beweegcheck. Laag 3 heeft nooit acties, maar de reden
verschilt nu per stand: "nog niet nodig" als je er niet bent, "dat doe je in je programma" als
je er wel bent.

---

## 6. Acceptatiecriteria — en hoe ze getoetst zijn

Getoetst in headless Chrome, layout in een iframe van exact 375px (Chrome klemt een
window-breedte onder 500px), met een geïnjecteerd klikscript — niet met het oog alleen.

| Criterium | Uitkomst |
| --- | --- |
| `a-why` wisselt mee met de profiel-schakelaar (≥3 varianten) | 4 varianten over vier schakelaars |
| Geen anker → 2 regels; wel anker → 3 regels | beide bevestigd |
| Kop bevat geen plek, sublead wel | bevestigd; titel op E/C/D volgt de plek |
| "Komt op Mijn Dag" staat bóven de primaire knop | bevestigd via `compareDocumentPosition` |
| De tijd staat één keer in het plan-blok (buiten de picker) | 1× |
| C: geen open paneel bij load; tik opent sheet met resultaat-zin | bevestigd |
| C: wanneer wel/niet zit achter "Bekijk waarom" | bevestigd |
| D: tray ↔ raster schakelbaar; tray bij load | bevestigd |
| D: week-readout uit bij load, aan te zetten, zonder noemer | bevestigd |
| Brug: 2 acties (Leefstijlcheck) / 3 (beweegcheck), nooit meer | bevestigd |
| E: conditie-regel alleen bij beweegcheck, zonder knop | bevestigd |
| 375px: max 1 primaire knop boven de vouw op A | 1 (`Zet mijn eerste keer klaar`, top 545px) |
| 375px: geen horizontale overflow, geen element > 375px | scrollWidth 360px, 0 elementen |
| Verboden UI-woorden (spoor/kompas/stappenplan/startpatroon/categorie/coming soon) | 0 in gebruikersmodus, B uitgezonderd |
| Geen "x van y"-readout in de UI | 0 |
| Klikdoorloop van 111 interacties | 0 JS-fouten, schone console |

---

## 7. Open punten — bewust niet in v3.3

- **Scherm B** blijft geparkeerd en ongewijzigd, inclusief zijn copy.
- **De conditie-gap is afgeleid uit de bron**, niet gemeten: `src === "bc"`. Bij implementatie
  moet dat een echte uitspraak uit de beweegcheck worden, geen proxy op "welke check deed je".
- **BC-kracht-ok tilt alleen het dóel op** (15–20 → 25–40 min), niet de frequentie. Frequentie
  verhogen op basis van een zelfverklaring hoort achter een meting, niet achter een vinkje.
- **De evidence-gids voor beweging bestaat niet.** De footer-link op C is label-only.
- **Meetpunten.** De prebuild is een ontwerpartefact, er zit geen tracking in. Bij implementatie
  horen bij deze wijziging minimaal: het vastzetten van het eerste moment, het wisselen van
  plek, het openen van de zelf-calibratie-sheet en het bevestigen daarvan, en het kiezen van een
  moment vanuit de tray (tray → raster).
