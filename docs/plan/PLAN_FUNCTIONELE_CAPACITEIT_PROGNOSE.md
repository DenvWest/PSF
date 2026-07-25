# Functionele capaciteit — testen, programma-kalibratie en prognose

> **Status (25 jul 2026): ontwerpvoorstel, nog niet gebouwd, nog geen intake-data.** Aanleiding: tijdens de Kompas Home-declutter bracht Dennis een idee in dat eerst te snel gelijkgesteld werd aan de afgewezen "Future You Score" — dat was onterecht. Dit doc trekt het idee recht uit elkaar: wat een écht functietest-gedreven feature is (bouwbaar, laag risico) versus wat geïndividualiseerde medische-uitkomst-taal is (waardevol, maar compliance-gevoelig, vraagt een audit vóór het copy wordt).
> Geënt op [`BEWEEG_COCKPIT_FUTURE_YOU.md`](./BEWEEG_COCKPIT_FUTURE_YOU.md), [`PLAN_KOMPAS_VOORTGANG_DOELNARRATIEF.md`](./PLAN_KOMPAS_VOORTGANG_DOELNARRATIEF.md), en de geconsolideerde bouwvolgorde (stappen 9-10: programma-view + 5-waypoint-model met pijn-deel).

---

## 0. Het idee, in Dennis' eigen voorbeeld

Vanuit de vragenlijst/intake of het logboek wordt een functionele beweging getest: bv. *kan iemand een lunge tot 90° kniebuiging maken, 8 herhalingen, zonder pijn of balansverlies?* Zo niet, dan is dat (a) een directe input voor het programma — niet 90° lunges voorschrijven, maar bv. een statische 45°-hold van 5×5 sec, pijnvrij, als startpunt, opbouwend naar meer herhalingen/diepte — én (b) een signaal met een echte wetenschappelijke lading: beperkte, pijnvrije bewegingsuitslag bij dit soort basisbewegingen hangt samen met verhoogd risico op verder spier- en functieverlies, valpartijen, en concrete gevolgen op hogere leeftijd (traplopen, opstaan uit een stoel, een kleinkind optillen, zonder angst blijven fietsen).

**Dit is geen slecht idee — het is een van de sterkste hefbomen die dit doc tot nu toe gezien heeft.** Twee dingen maken het anders dan de eerder afgewezen "Future You Score":

1. Het is een **échte, aparte meting** (functiecapaciteit), niet een verzonnen tweede cijfer bovenop dezelfde leefstijldata.
2. Het heeft **wetenschappelijke precedenten**: gevalideerde instrumenten in de geriatrische fysiotherapie meten precies dit soort dingen om functionele achteruitgang en valrisico te voorspellen — de *Short Physical Performance Battery* (gang-snelheid, chair-stand, balans), *Timed Up and Go*, de *30-second chair stand test*, handknijpkracht. Al deze instrumenten worden in de wetenschappelijke literatuur gebruikt als voorspellers van functionele achteruitgang, vallen en zelfstandigheid bij ouderen. Een pijnvrije-ROM-test (lunge/kniebuiging) staat in dezelfde geest, al is "90°/95° lunge, 8 herhalingen" zelf geen 1-op-1 gevalideerd klinisch instrument.

Dat onderscheid is precies waarom dit **twee aparte trajecten** zijn met een heel verschillend risicoprofiel.

---

## 1. Traject A — programma-kalibratie (bouw dit, laag risico)

De test bepaalt het **startpunt en de opbouw in het beweegprogramma** — geen uitspraak over de toekomst, puur oefenprogrammering:

- Intake/logboek-vraag per bewegingspatroon (lunge, squat, step-up, evt. uit te breiden): *kan pijnvrij tot hoek X, Y herhalingen, met/zonder gewicht?*
- Bepaalt de instapoefening: niet 90° maar bv. 45° statisch vasthouden, pijnvrij, als startpunt.
- Herhaalbaar en meetbaar per week — dit is precies het soort **echte, harde voortgangsdata** waar `BEWEEG_COCKPIT_FUTURE_YOU.md` al ruimte voor laat ("de payoff komt bij je hermeting, als je terugkijkt op wat er veranderde") — geen verzonnen cijfer, een echte trainingsvariabele.
- Past direct in de al geplande architectuur: stap 9 (**programma-view**) en stap 10 (**5-waypoint-model + pijn-deel**) uit de geconsolideerde bouwvolgorde ([[psf-beweging-leefstijlring-volgorde]]) — dit doc geeft die twee stappen voor het eerst concrete inhoud in plaats van een lege placeholder ("pijn-deel").
- **Geen nieuwe compliance-vraag.** Dit is oefenprogrammering op basis van zelfgerapporteerde pijn/mobiliteit — dezelfde soort data als de bestaande recovery-hint (`movement-recovery-hint.ts`) al verwerkt.

---

## 2. Traject B — prognose-copy (waardevol, maar audit eerst)

Het aantrekkelijke stuk van het idee: *"dit voorspelt of je op je 75e nog de trap op kunt, je kleinkind kunt optillen, niet meer bang hoeft te zijn om te vallen."* Sterke, motiverende, concrete copy — precies het soort tastbaarheid dat "Future You" bedoelt te zijn.

**Het risico:** een geïndividualiseerde uitspraak over toekomstige medische/functionele uitkomsten (val, knieprothese, functieverlies) gebaseerd op één informele test raakt de grens van "geen medische claims — adviezen, geen diagnoses" (`CLAUDE.md`, `COMPLIANCE.md`). Het verschil met een neutrale leefstijl-band ("op weg naar Sterk") is dat dit een **specifieke, naar de persoon gerichte prognose over gezondheidsuitkomsten** is — dat is een andere claim-klasse, ook als de onderliggende wetenschap klopt.

**Aanbevolen mitigatie — bevolkingsniveau-feit in plaats van persoonlijke voorspelling**, zelfde stijl als de rest van de app (`WRITING_VOICE.md`, [[psf-leefstijlcheck-copy-stijl]]: feit-eerst/bron-mechanisme, dan een korte actie):

| ❌ Niet (persoonlijke prognose) | ✅ Wel (bevolkingsniveau-feit + actie) |
|---|---|
| *"Jij loopt risico op een knieprothese."* | *"Beperkte, pijnvrije kniebuiging hangt in onderzoek samen met meer moeite met traplopen en een hoger valrisico op latere leeftijd — daarom bouwt je programma hier gericht aan."* |
| *"Dit voorspelt of je je kleinkind kunt optillen op je 75e."* | *"Functionele kracht in dit bewegingspatroon is een van de dingen die op latere leeftijd het verschil maakt tussen zelfstandig blijven en hulp nodig hebben — vandaar dat we dit meten."* |

**Vóór dit naar productie-copy gaat:** dezelfde evidence-audit-ronde als eerder bij Leefstijlcheck (bronnen per claim controleren, P0-copyfixes waar nodig) — zie [[psf-evidence-audit-leefstijlcheck]] als precedent (verdict destijds: NUANCEER, een paar omgekeerde/te stellige claims eruit).

---

## 3. Wat dit betekent voor de Kompas Home-declutter (vandaag)

- Traject A bestaat nog niet in data (geen intake-vraag, geen tracking) — de Beweging-regel in de nieuwe 5-domein-doelregel (`PLAN_KOMPAS_VOORTGANG_DOELNARRATIEF.md`) kan er **vandaag** dus nog niets mee tonen.
- Home shipt vandaag met de generieke banden-narratieve regel (score/band, zoals afgesproken) voor alle vijf domeinen, Beweging incluis.
- Zodra Traject A gebouwd is (stap 9-10), krijgt de Beweging-doelregel specifieke inhoud (bv. *"lunge-diepte 45°→90°, pijnvrij: 2 van 5 stappen"*) in plaats van alleen de score-band — dat is een latere, kleine aanpassing van diezelfde regel-component, geen nieuwe architectuur.
- **Geen blokkade voor vandaag.** Dit is het vervolgtraject, geen vereiste voor de declutter.

---

## 4. Open voor Dennis

1. Welke bewegingen naast de lunge wil je testen? *Sit-to-stand-herhalingen* ligt het dichtst bij een gevalideerd instrument (chair-rise test) en is daarmee het makkelijkst te verdedigen als eerste test; squat-diepte en single-leg-stance zijn logische vervolgtests.
2. Wil je Traject B (prognose-copy) nu al laten scopen richting een evidence-audit, of eerst Traject A bouwen en zien hoe de echte data eruitziet voor je de copy-laag aanpakt?
3. Waar landt de functionele testdata — nieuwe tabel/kolom, of binnen de bestaande `answers`-jsonb (zelfde patroon als de rest van de intake)?

*Opgesteld 25 juli 2026. Verandert geen bestaande DEFER/FREEZE/KILL-status. Geen implementatie tot akkoord — dit is traject A/B allebei nog ontwerp, geen van beide is vandaag scope.*
