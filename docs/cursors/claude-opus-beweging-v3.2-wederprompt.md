# Wederprompt — Beweging v3.2: eerste keer plant, brug voegt toe

> **Status:** uitgevoerd. De prebuild staat in [`beweging-keuze-consumentenbond-prebuild-v3.2-2026-08.html`](../design/beweging-keuze-consumentenbond-prebuild-v3.2-2026-08.html).
> **Basis:** v3.1-prebuild, gericht uitgebreid — niet opnieuw uitgevonden.
> **Vorige stap:** [`claude-opus-beweging-leefstijl-piramide-v3.1-prompt.md`](claude-opus-beweging-leefstijl-piramide-v3.1-prompt.md)
> **Aanleiding:** spar-notities Beweging V3.2 (8 augustus 2026) — vijf bevindingen op v3.1.
> **Opgesteld:** 8 augustus 2026.

---

## 1. Wederwoord in één alinea

De diagnose van de spar-notities klopt: v3.1 is architectuur voor reviewers, geen flow voor Peter. Alle vijf bevindingen zijn overgenomen. Op drie punten wijk ik af van de voorgestelde *oplossing*, omdat die zoals opgeschreven een gelockt besluit uit `BESLUIT_BEWEGING_PRODUCT_EN_IA.md` zou breken of een dode plek in de UI zou maken. Die drie staan in §3, met onderbouwing. Daarnaast vond ik twee dingen die niet in de notities stonden en die zwaarder wegen dan een deel van wat er wél in stond (§4).

---

## 2. Overgenomen zonder wijziging

| # | Bevinding spar-notities | Wat er gebeurd is |
| --- | --- | --- |
| 1 | "Twee keer kracht" valt uit de lucht; jargon-lead; Gedaan/korte vóór planning | A1 heeft geen afvink-knop meer. Lead in gewone taal, waarom-blok van drie regels. |
| 2 | Wizard stap 2 kent alleen vier vaste ankers | Chip "Iets anders — ik typ het zelf" + tekstveld (max 80 tekens), met de regel dat het je advies niet verandert. |
| 3 | Brug stapelt vier concepten; titel klinkt als verplichting | Brug heet "Voeg iets toe aan je basis", toont laag 1–3, laag 2 read-only, sheet met max 3 acties. De keten is eruit. |
| 4 | Toegevoegde items niet zichtbaar/afvinkbaar op E | Blok "Vandaag ook" op E, dezelfde staat als de rij op Mijn Dag — afvinken op de een zet de ander mee. |
| 5 | C is het museum: zes panelen tegelijk uit | Meetpad en eigen begeleiding gevouwen. Per laag één metaregel; onderbouwing achter "Bekijk waarom". |
| extra | Statebars/protolines zijn prototype-only | Gebruikersmodus staat standaard aan en verbergt statusbalken, sub-staat-schakelaars en ontwerpnotities. |
| extra | D-meta-paragrafen zijn specs, geen UI | Verhuisd naar `<details>` "Regels achter deze dag — voor reviewers". |
| extra | Brug inline op de basis-rij van D is verwarrend | Verplaatst naar een eigen blok onder de dag. |

---

## 3. Drie afwijkingen — en waarom

### 3.1 De plan-CTA is vooringevuld, geen picker

**Voorgesteld:** `[Plan mijn eerste sessie]` als primaire knop met een datum+tijd-picker.

**Probleem:** `BESLUIT_BEWEGING_PRODUCT_EN_IA.md` §A.4 verbod 1 is hard — *"Geen scherm dat een keuze eist vóór het een antwoord geeft. Elke picker, tier-selectie of configuratie die tussen het openen en het voorstel staat, is verboden."* §A.4 zegt het ook positief: *"je kiest niet, je bevestigt of je maakt het kleiner."* Een lege picker als primaire actie draait dat om en zet de `MovementStartChoice`-blokkade terug die §D.2 juist wegnam.

**Gebouwd:** het moment staat er al — *"Voorstel: maandag 3 augustus · 18:00"*, uit de check. De primaire knop bevestigt dat in één tik (`Zet mijn eerste keer klaar`). `ander moment` staat eronder als link en opent de bestaande planner. Zo is de intentie van de notitie gehaald (plannen is primair, afvinken niet) zonder het verbod te breken.

**Bijvangst:** hiermee vervalt sub-staat A4. A heeft nu drie staten — voorstel · instellen · moment vastgezet — en dat is ook wat er werkelijk gebeurt.

### 3.2 Laag 3 in de brug is leesbaar, niet dood

**Voorgesteld:** laag 3 grijs/locked in de mini-piramide.

**Probleem:** v3.1 lock 6 maakt gesloten lagen onklikbaar in de brug, met een goede reden: lezen over laag 6 wordt een uitnodiging. Die reden geldt voor de commercie-laag, niet voor "progressief opbouwen". Een trede die zichtbaar is, eruitziet als een knop en niets doet, is de duurste UI die er is — precies het argument waarmee `MovementSportLens` gekilld werd (§A.3 rij 5).

**Gebouwd:** laag 3 opent wél, maar de sheet bevat geen enkele actie: *"Nog niet nodig. Houd eerst je twee krachtdagen vier weken vol. Lezen mag altijd. Plannen nog niet."* Lezen mag, plannen kan niet — dat is Bond-gedrag, en de laag verdwijnt niet uit beeld.

### 3.3 Geen noemers in de week-readout

**Niet in de notities, wel een schending.** v3.1 toonde op Mijn Dag *"Laag 1 · dagelijks bewegen — 4/7"* met een balk die voor 57% vol stond, en de mock-alert zei *"Je hield laag 1–2 deze week 5 van de 7 dagen vol."* `BESLUIT` §A.4 verbod 4 is expliciet: *"Geen readout die telt wat je niet deed. Geen '2 van 7 dagen', geen lege balken naast gevulde."*

**Gebouwd:** *"Kracht · je basis — allebei je krachtdagen"* (balk vol) en *"Dagelijks bewegen · staan en lopen — 4 dagen bewogen"* (geen balk, geen noemer). De alert zegt *"Je deed deze week allebei je krachtdagen."*

---

## 4. Twee bevindingen die niet in de notities stonden

**De profielkaart stond vóór het voorstel.** Op 375px opende A met de mock-persoonkaart: *"Peter · 47 jaar · Beweegscore ▮▮▯▯▯ matig · Doel: spierbehoud en energie"* — de complete jargon-set die we net uit de lead haalden, ruim 150px hoog, vóór de eerste zin product. Dat is prototype-context, geen productonderdeel. Hij staat nu alleen in reviewermodus.

**De brug had geen enkele actie.** De vijf bevindingen gaan over stapeling, maar het diepere probleem was dat "Zet er iets naast" nergens toe leidde: mini-piramide (uitlezing) + volgende stap (tekst) + keten (uitlezing) + `Open Voortgang` (navigatie). Vier blokken, nul manieren om iets toe te voegen. Dat is waarom de sheet met `Zet op Mijn Dag` de kern van v3.2 is en niet een detail.

---

## 5. Wat gebouwd is — per scherm

**A · eerste keer.** Welkomstregel · bron in één regel · voorstel als kop (*"Dit stellen we voor: 2 keer kracht thuis"*) · sublead *"Kwartiertje per keer. Thuis, zonder sportschool."* · waarom-blok met drie regels van elk onder de tien woorden · één primaire knop met vooringevuld moment · `ander moment` · ghost-knop `Ik doe hem nu` die naar de dagstaat brengt. De spec-lijst (vorm/plek/duur) is uit het eerste beeld en zit in de programma-uitklap. Eigen doel in de wizard, met de eigen woorden terug als *"Jouw reden: …"* onder het waarom-blok.

**E · elke dag.** Ongewijzigd waar het sterk was (één vraag, korte variant, review ná afvinken). Nieuw: blok "Vandaag ook" met de toegevoegde items, afvinkbaar, gedeelde staat met Mijn Dag. Brug staat dicht en heet `Voeg iets toe aan je basis`.

**Brug.** Drie treden (1–3) in echte piramidevorm, laag 1 onderaan. Laag 2 is een `div`, geen knop, met badge *"basis"* en regel *"Dit is je basis · staat al in je dag"*. Laag 1 opent een sheet met drie acties (staan per werkuur · blokje na het eten · stevig wandelen), elk met één knop. Onder de sheet: `Bekijk waarom` met de evidence-zin en de richtlijn. De keten is weg; er blijft één quiet link naar Voortgang.

**C · Voortgang.** Piramide en noordster-regel onveranderd. Per laag één metaregel `Prioriteit: hoog · Onderbouwing: WHO 2020 · Moeite: medium`; de evidence-zin zit achter `Bekijk waarom`. Meetpad en eigen begeleiding staan in `<details>`, dicht. De keten staat hier, in één regel.

**D · Mijn Dag.** Week-readout zonder noemers. Toegevoegde items krijgen een eigen rij, gesorteerd op tijd, met `Markeer als gedaan`. Brug onder de dag in plaats van in de basis-rij. Reviewer-regels in `<details>`.

---

## 6. Acceptatiecriteria — en hoe ze getoetst zijn

Getoetst in headless Chrome op 375px met een geïnjecteerd klikscript (niet met het oog alleen).

| Criterium | Uitkomst |
| --- | --- |
| A toont max 1 primaire CTA boven de vouw | 1 (`Zet mijn eerste keer klaar`). In een viewport van 524px staat hij op 522px — met de prototype-chrome (92px) meegerekend, die in het product niet bestaat. |
| Eerste bezoek: geen "Gedaan" vóór planning-aanbod | `#a-done` en `#a-short` bestaan niet meer; de enige afvink-knoppen staan op E en D. |
| Brug: klik laag 1 → sheet met ≥1 "Zet op Mijn Dag" | 2 klikbare treden, 1 read-only, 3 acties in de sheet van laag 1. |
| Toevoegen landt op beide surfaces | 1 rij op Mijn Dag, 1 regel onder "Vandaag ook"; afvinken op E zet de knop op D op gedaan. |
| C: meetpad gevouwen | 2 `details.fold`, beide dicht bij load. |
| Proto-toggles blijven, statebar verborgen in gebruikersmodus | `data-mode="user"` bij load; statebar `display:none`, in reviewermodus `block`. |
| Geen keten in de brug, wel op C | 0 respectievelijk 1. |
| Self-contained, geen console-fouten | Eén bestand, geen externe requests, schone console. |

---

## 7. Open punten — bewust niet in v3.2

- **Scherm B blijft geparkeerd en ongewijzigd.** De B1-taalregel is toegepast op A, E, de brug, C en D. De kaartteksten in B zijn niet herschreven: dat scherm heeft geen pad ernaartoe en herschrijven zou suggereren dat het terugkomt.
- **Bridge-mapping naar `beweging-help-bridge.ts`.** De `ADD_ACTIONS`-tabel in de prebuild is mock. Bij implementatie wordt dat `layer → acties`, met `blokje` als nieuwe optie die vandaag nog nergens bestaat.
- **Echte datumkiezer.** De planner is de bestaande mock; het vooringevulde moment komt in het product uit de check plus de agenda-voorkeuren.
- **Generalisatie van de piramide naar andere domeinen.** Staat als silhouetten in `<details>` op C, zonder inhoud — onveranderd sinds v3.1.
- **Meetpunten.** De prebuild is een ontwerpartefact; er zit geen tracking in. Bij implementatie horen bij deze wijziging minimaal: het vastzetten van het eerste moment, `Ik doe hem nu`, het openen van een laag in de brug, en het toevoegen van een actie vanuit de sheet.

---

## Prompt (copy-paste) — als je v3.2 opnieuw wilt laten genereren

```text
Je bent senior product designer + UX-architect + evidence editor voor
PerfectSupplement — de Consumentenbond van leefstijl voor mannen 40+.

Lever één self-contained HTML-prebuild die het bestaande bestand
"beweging-keuze-consumentenbond-prebuild-v3.1-2026-08.html" UITBREIDT.
Behoud alle schermen (A/E/B/C/D), tokens, dark forest, DM Serif + DM Sans,
en alle gelockte besluiten. Vervang gericht waar hieronder staat. Geen React,
geen essay buiten de HTML.

DOELGROEP-IJKPUNT
Peter, 47, laag opgeleid, leest op zijn telefoon om 21:40. Hij heeft één
Leefstijlcheck gedaan en verder niets. Elke zin die hij twee keer moet lezen
is een ontwerpfout.

HARDE LOCKS (uit v3 en v3.1 — schenden = mislukt ontwerp)
1. A en E blijven één surface met twee staten.
2. De in-flow deur is de dunne brug, nooit scherm B als etalage.
3. Geen ordinaal ("trede 4 van 6", "fase 1 van 3").
4. Bond-oordeel blijft op de kaart; de piramide sorteert interventietype.
5. Laag 6 (supplementen/wearables) is altijd gated.
6. Moeite = bijstelling ná het voorstel, geen intake-as.
7. Voortgang meet, Mijn Dag doet. Geen tweede vinklijst.
8. Geen readout die telt wat je niet deed — geen "4 van 7", geen halfvolle
   balk als default.
9. Geen keuze die vóór het antwoord staat: het voorstel is er al als het
   scherm opent; je bevestigt het of maakt het kleiner.

WAT v3.2 VERANDERT

A · eerste keer
- Verwijder "Gedaan" en "Ik doe de korte" van A. Wie hier voor het eerst
  staat, heeft niets gedaan.
- Kop = het voorstel in gewone taal. Sublead = duur en plek, één zin.
- Blok "Waarom dit bij jou past": drie regels, elk onder de tien woorden,
  zonder de woorden beweegscore, spierbehoud of conditie.
- Primaire actie = het VOORGESTELDE moment vastzetten. Toon dag en tijd al
  ingevuld ("Voorstel: maandag 3 augustus · 18:00") met "ander moment" als
  link naar de planner. Geen lege picker als primaire actie.
- Secundair (ghost): "Ik doe hem nu" — brengt naar de dagstaat, waar de
  enige afvink-knop staat.
- Spec-lijst (vorm/plek/duur) uit het eerste beeld, naar de programma-uitklap.
- Sub-staten: A1 voorstel · A2 instellen · A3 moment vastgezet. A4 vervalt.

A2 · wizard
- Naast de vaste ankers een chip "Iets anders — ik typ het zelf" met een
  tekstveld (max 80 tekens) en de regel: dit verandert je advies niet.
- Toon het eigen doel terug als "Jouw reden: …".

Brug (A, E, D — één component)
- Titel: "Voeg iets toe aan je basis". Lead: "Je basis blijft staan. Dit is extra."
- Toon laag 1 t/m 3 als échte treden (laag 1 onderaan, breedst), niet zes.
- Laag 2 is read-only: geen knop, badge "basis", regel "Dit is je basis ·
  staat al in je dag".
- Tik op laag 1 → sheet met maximaal drie acties, elk met één knop
  "Zet op Mijn Dag". Tik op laag 3 → sheet zonder acties: "Nog niet nodig.
  Houd eerst je twee krachtdagen vier weken vol. Lezen mag altijd."
- Onder elke sheet: "Bekijk waarom", ingeklapt, met de evidence-zin en de bron.
- Verwijder de keten Check → Advies → Favorieten → Beste uit de brug.

E · elke dag
- Behoud één vraag, korte variant en review ná afvinken.
- Nieuw blok "Vandaag ook": wat er náást je basis in je dag staat, afvinkbaar,
  met dezelfde staat als de rij op Mijn Dag. Afvinken op de een zet de ander mee.
- Brug staat dicht.

C · Voortgang
- Per laag één metaregel: "Prioriteit: hoog · Onderbouwing: WHO 2020 ·
  Moeite: medium". De evidence-zin verhuist achter "Bekijk waarom".
- Meetpad en eigen begeleiding in <details>, dicht bij load, op dezelfde plek.
- De keten staat hier, in één regel.

D · Mijn Dag
- Week-readout zonder noemers: "allebei je krachtdagen", "4 dagen bewogen".
- Toegevoegde items krijgen een eigen rij, gesorteerd op tijd.
- Brug onder de dag, niet in de basis-rij.
- Meta-paragrafen over duur/verplaatsen naar <details> voor reviewers.

Prototype-chrome
- Schakelaar "Weergave: gebruiker | reviewer". Gebruikersmodus staat aan bij
  load en verbergt statusbalken, sub-staat-schakelaars, de mock-profielkaart
  en de ontwerpnotities. Tabs en laag-schakelaar blijven staan.

TAAL
Nederlands, B1. Maximaal vijftien woorden per zin. Geen anglicismen, geen
vakjargon in leads, geen diagnose-taal, geen "boost".

ACCEPTATIE
- 375px: maximaal één primaire knop boven de vouw op A.
- Eerste bezoek biedt nergens "Gedaan" vóór er iets gepland of gestart is.
- Klik op laag 1 in de brug levert minstens één werkende "Zet op Mijn Dag".
- Wat je toevoegt is zichtbaar op Beweging én op Mijn Dag, met één staat.
- C toont het meetpad ingeklapt.
- Eén HTML-bestand, offline werkend, geen console-fouten.
- HTML-comment bovenaan: wat v3.2 lockt t.o.v. v3.1, maximaal twaalf regels.
```
