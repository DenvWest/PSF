# Besluit: stappen, energie en afvallen — hoe ver gaan we met beweegdata in voeding

**Datum:** 8 oktober 2026
**Status:** Besloten (Dennis, 8 okt: "akkoord met advies en drie stappen"). Nog niets gebouwd.
**Aanleiding:** vraag of stappen/verbrande calorieën ergens gekoppeld moeten worden zodat ze iets zeggen over macro's en micro's, ook met afvallen als doel; en wat Mijn Dag/Agenda functioneel mist.
**Bouwt voort op:** `BLAUWDRUK_ADAPTIEF_BEWEEGSYSTEEM.md` (r. 333), `BLAUWDRUK_BEWEEGSYSTEEM_DASHBOARD_STAPPENPLAN.md` (r. 41), `BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md`, `BESLUIT_DOELEN_VERBONDEN_2026-10.md` (r. 39), `BESLUIT_VOEDINGSRICHTING_2026-10.md`, `BESLUIT_GRATIS_NU_PREMIUM_AANBOD_2026-10.md`, `ARCHITECTUUR_LIFESTYLE_PLANNER.md` §15, `AUDIT_MIJN_DAG_AGENDA_2026-08.md`.

## 1. Besluit

| Stap | Wat | Wanneer | Poort |
|---|---|---|---|
| 1 | Eén getal "gemiddeld aantal stappen per dag", zelf ingevuld, in Je doelen naast het bestaande activiteitsniveau. Stuurt energie- en eiwitnorm bij. | Eerstvolgende kleine plak | Verwerkingsregister bijwerken; meetpunt in dezelfde wijziging |
| 2 | Gesynchroniseerd 7–14-daags gemiddelde vervangt de zelfinvoer (Apple Health / Health Connect / provider). Nooit een dagelijks verbrand-getal. | Fase E | §15-poort: register, DPA, DPIA vóór activatie |
| 3 | Afvallen = weektrend gewicht en inname naast het eiwitdoel voor spierbehoud. Geen tekortvoorschrift. | Na stap 1 | Past bij "adviezen, geen diagnoses" |

## 2. Wat dit wijzigt aan eerdere besluiten

- **Genuanceerd, niet herroepen:** "geen kcal/energieverbruik" (`BLAUWDRUK_ADAPTIEF_BEWEEGSYSTEEM.md` r. 333) bleef gelden omdat zelfgerapporteerde minuten schijnprecisie geven. Dat blijft zo voor minuten. Een gemiddeld stappental (zelf of gemeten) mag wél als *input voor de norm* dienen, nooit als getoond "verbrand"-getal.
- **Ongemoeid:** calorierichtlijn of vooringestelde macro-verdeling blijft afgewezen (`BESLUIT_DOELEN_VERBONDEN_2026-10.md` r. 39); asymmetrie-regel blijft (geen rood kruis op macro's/kcal).

## 3. Afgewezen, met reden

| Optie | Reden |
|---|---|
| Verbrande calorieën uit stappen tonen of als eetbudget gebruiken ("je mag nog 340 kcal") | Stappen → kcal wijkt snel 20–30% af (gewicht, tempo, pas); valt onder de afgewezen calorierichtlijn; schijnprecisie |
| "Stappen zeggen iets over je micronutriënten" | Bewegen verhoogt energie, eiwit, koolhydraten en vocht; de meeste micro-normen (EFSA) veranderen er niet door. Claim zou niet onderbouwd zijn |
| Afvalplan met dagelijks tekort of doelkilo's als vaste vraag | Diagnose-/voorschrifttaal; `BESLUIT_VOEDINGSRICHTING_2026-10.md` wees "hoeveel kilo" al af als vaste vraag |
| Wearable-sync nu | §15-poort (DPA/DPIA) niet gehaald; geen schrijvers |

## 4. Gratis en premium

Volgt `BESLUIT_GRATIS_NU_PREMIUM_AANBOD_2026-10.md`: gratis = betekenis van vandaag en 7 dagen; premium = verband over tijd.

- **Gratis:** handmatig stappengemiddelde en het effect op je normen.
- **Premium:** "op dagen met meer stappen eet je X" over 30–90 dagen; later de automatische sync.
- **NEVO-voorwaarde** (geen kosten voor eindgebruikers) raakt premium: de betaalde waarde zit in het inzicht, niet in de voedingsdata zelf.

## 5. Mijn Dag / Agenda: wat het toont en wat functioneel ontbreekt

Stand uit de code op `origin/main` van 8 okt.

**Toont nu:** de dagstap uit je plan (blok `analysis`), je eigen momenten (`routine`, incl. categorie voeding) en externe blokken; per week tot 3 tekort-voorstellen (`agenda-tekort-voorstellen.ts`, bv. "vette vis bij het avondeten") en een patroonregel met weekdekking van één stof (`AgendaPatroonRegel`). Dagstappen verbergen kan per dag of voor altijd (Instellingen of Agenda).

**Ontbreekt functioneel:**
1. **Geen verband met het dagboek.** Een voorgesteld voeding-moment of de patroonregel linkt niet naar wat je at; afvinken schrijft niets naar het dagboek, en het dagboek (sinds #194 gebaseerd op je gewone maaltijden) vult de Agenda niet.
2. **Geen supplement-innamemoment** in de Agenda, terwijl het een doel van de site is.
3. **Geen stappendoel** (volgt uit stap 1 hierboven; pas relevant als dat getal bestaat).
4. **De augustus-audit is niet opnieuw getoetst.** `AUDIT_MIJN_DAG_AGENDA_2026-08.md` meldde blockers B1–B4 (24:00-grens bij verplaatsen, stille mutatiefouten, `plan_step_dismissed_date` verliest de vorige dagkeuze, tracking vóór succes). Er zijn sindsdien 19 commits aan de Agenda geweest; welke blockers nog open zijn is niet vastgesteld.

**Voorstel (nog niet besloten):** eerst B1–B4 opnieuw toetsen, daarna één functionele plak: een voeding-moment uit een tekort-voorstel opent bij afvinken het dagboek vooraf ingevuld. Dat sluit aan bij "voeding eerst" en vraagt geen nieuwe data.

## 6. Open

- Valt het zelf ingevulde stappengemiddelde onder gezondheidsgegevens in het verwerkingsregister? Waarschijnlijk ja (zoals het activiteitsniveau); vastleggen bij bouw van stap 1.
- Meetpunt voor stap 1: bij de bouw kiezen en registreren op de drie plekken uit CLAUDE.md.
- Keuze Agenda-plak (§5) wacht op Dennis.

## 7. Agenda als gratis/premium-drager (besloten 8 okt, Dennis: akkoord)

Dit is plak 6 ("de keten sluiten") en plak 8 (ontkoppeling) uit `BESLUIT_VOEDINGSFOCUS_DASHBOARD_2026-09.md` §3.7/§6, geen nieuw idee. Volgorde:

| Plak | Wat | Opmerking |
|---|---|---|
| A | "Focus: Voeding" uit het ⋯-menu (één focusdomein, plak 8); "Plan" zichtbaar i.p.v. verstopt; blockers B1–B4 uit de augustus-audit opnieuw toetsen | Dagstap blijft werken: volgt uit de prioriteit |
| B | Agenda leidt read-only af wat het dagboek die dag heeft (per eetmoment, niet per kloktijd); feitelijke feedback in de stapkaart ("Gisteren ingevuld: ontbijt 12 g · lunch 31 g · diner 28 g"); afvinken blijft de keuze van de gebruiker | Geen migratie. Asymmetrie-regel: nooit "niet gehaald" afleiden uit een dagboek. Meetpunt in dezelfde wijziging |
| C | Dagstappen per doel (`NUT_DOEL`): selectie uit de bestaande bibliotheek, geen nieuwe adviesmotor | Eerst copy en bronnen per doel laten toetsen (`WRITING_VOICE.md`); "afvallen zonder spierverlies" = bestaande eiwit-per-maaltijd-stap. Geen kcal-plan per doel |

Gratis: dagstap, match met het dagboek van vandaag en gisteren, feiten van gisteren. Premium: verband over 30–90 dagen en doelspecifieke reeks.

## 8. Dagkaart, handleiding en chat (besloten 8 okt, Dennis)

Volgt op plak B (PR #200). De eiwit-kaart in "Doorlopend vandaag" was niet mooi; vervangen door:

- **Dagkaart boven de dagblokken** ("Je dag in stoffen") met chips voor eiwit, omega-3, magnesium, vitamine D en zink. Eiwit toont per maaltijd (ontbijt/lunch/avondeten), de andere stoffen het dagaandeel van je norm. Vinkje alleen als het dagboek het bewijst; leeg is neutraal. Alleen kernstoffen met een norm: de informatieve gevolgde stoffen (vezels, natrium, enz.) hebben geen ✓-regel en staan er niet in.
- **"Bekijk je plan" wordt "Handleiding"** (voedingshandleiding), in de kaartkop. De Agenda-dagweergave heeft geen context-paneel; het zijpaneel `AgendaContextSidebar` bestaat alleen in de weekweergave.
- **Weg uit de Agenda:** de "Je patroon"-knop, de "Naar je dagboek"-link en het label "Voeding · Basis" bij de plan-stap. Dagboek en Patroon staan in de onderbalk.
- **Notulen: later, samen met de chat.** Notulen van een gesprek betekent het gesprek bewaren; dat botst met het voorstel in `CONCEPT_V1_V6_LLM_CHAT_2026-10.md` §4 ("gesprek niet bewaren") en vraagt eerst V1–V3. Zonder gesprek kan een printbaar plan-overzicht later apart.
- **Chatbot-optie vervangt "Handleiding" pas als `NUTRITION_AI_CHAT_ENABLED` aan staat.** Geen "Binnenkort"-knop zonder functie.
- **Afgewezen voor nu:** een stoffenkiezer op basis van de informatieve gevolgde stoffen (geen norm, dus geen ✓).
- **Idee voor later, niet besloten:** klikken op een uur in de Agenda opent menu, product of supplement bestellen. Raakt `BESLUIT_VOEDINGSFOCUS_DASHBOARD_2026-09.md` §3.7: een echte bestelfunctie is daar bewust niet gebouwd (affiliate is uitgaand). Eerst een eigen besluit.
- **Meetpunten:** `agenda_dagkaart_shown`, `agenda_dagkaart_stof_gekozen`, `dashboard_agenda_plan_click` (surface `agenda_dagkaart`).

