# Aanbeveling — SDT in het midden, vitaliteitsscore sterk, verbinding verdiept

> **Type:** besluitdocument. Synthese van drie analyses: het SDT/energie/herstel-rapport (aangeleverd 11 juli), `LEEFSTIJLCHECK_SCOPE_REVIEW.md` en `LEEFSTIJLCHECK_EXPERT_REVIEW.md`.
> **Vraag van Dennis:** hoe zetten we dit sterk neer — niet medisch, informatief, leefstijl-ondersteunend; zonder vragen-inflatie; met een wetenschappelijk sterke vitaliteitsscore en leefstijl + Self-Determination Theory in het midden?
> **Datum:** 11 juli 2026 · geverifieerd tegen `src/` (RULES_VERSION 1.3.1).

---

## 0. Eerst dit: het SDT-rapport is deels al geïmplementeerd

Het aangeleverde SDT-rapport dateert van vóór de 1.3.0-wijzigingen. Tegen de huidige code:

| SDT-rapport-aanbeveling | Status in code (geverifieerd) |
|---|---|
| P0 — conceptueel model corrigeren (parallelle behoeften, batterij-loop schrappen) | ✅ **Al gedaan** — `leefstijlcheck-evidence.ts` r.39 ("drie gelijkwaardige, parallelle basisbehoeften (geen volgorde)") en r.61 ("'energie-batterij' is als causaal mechanisme losgelaten") |
| P0 — readout-model afdwingen (energie/herstel sturen vitaliteit niet) | ✅ **Al gedaan** — `vitaliteit.ts` middelt alleen de 5 interventiedomeinen; `domain-role.ts` bestaat |
| P1 — V1: meet verbinding écht (1 item) | ✅ **Al gedaan** — CON_SOC, 5e interventiedomein sinds 1.3.0 |
| P1 — V2 zit-/dagactiviteit · V3 groente | ⬜ Open — bevestigd als hiaat door de expertreview (§2.5, §5) |
| P1 — NRG_DEP/alcohol-dubbeltelling ontkoppelen | ⬜ Open — herbouw ligt klaar (expertreview §8.4) |
| P2 — SDT-verdiepingsmodule (V4–V6) | ⬜ Open — hoort in het dashboard, zie §3 |

**Consequentie:** de vraag is niet meer "gaan we SDT meten" maar "waar zetten we de volgende SDT-laag neer zonder de check op te blazen". Dat is precies de vraag die Dennis stelt — en het antwoord is: **relatedness in tier-1 (bestaat al + één modifier), de rest van SDT in het dashboard**.

---

## 1. De sterke, niet-medische positionering — het drie-lagen-verhaal ís het verhaal

De niet-medische framing hoeft niet bedacht te worden; ze zit al in de architectuur en moet alleen **uitgesproken** worden:

- **Laag 1 — wat je draagt (determinanten):** autonomie, competentie, verbondenheid. SDT is motivatiewetenschap, geen geneeskunde — er bestaat geen "autonomie-diagnose". Dit is de veiligste taal die er is: universele menselijke behoeften, geen symptomen. ✅
- **Laag 2 — wat je doet (gedrag):** slaap, stress, verbinding, voeding, beweging. Gedragspatronen, geen gezondheidsstatus. ✅
- **Laag 3 — wat je merkt (uitlezing):** energie en herstel als readouts, vitaliteit als samenvatting. Subjectieve ervaring, geen klinische maat. ✅

**Framing-copy voor het resultaat (voorstel, ✅):**
> "Dit is geen medische test. We meten hoe goed je leefstijl je vitaliteit ondersteunt — vijf pijlers, elk even zwaar. Energie en herstel zijn je uitlezing; de pijlers zijn je knoppen."

De vitaliteitsscore heet daarmee wat hij is: een **leefstijl-alignment-score** ("in welke mate sluit jouw patroon aan bij onderzochte leefstijlprincipes" — die formulering staat al in `LEEFSTIJLCHECK_INTERPRETATION_NOTES`). Nooit een gezondheidsvoorspelling, nooit een risicoscore. De MDR/diagnose-grens wordt zo geen beperking maar de merkbelofte zelf: *wij meten je leefstijl, niet je lichaam.*

---

## 2. Vraagbudget: netto +1, via herverdeling — niet stapelen

Het SDT-rapport wil +3 (V1/V2/V3), de scope-review wil slaap afslanken en verbinding verbreden, de expertreview wil herbouw van zwakke items. Gecombineerd kan dat **budget-neutraal op één vraag na**:

| Pijler | Nu | Voorstel | Mutatie |
|--------|----|----------|---------|
| Slaap | 4 | **2** (SLP_QUAL + SLP_CONS, herschreven) | −2 → SLP_ONSET/WAKE naar slaap-check-in |
| Stress | 2 | 2 | herformuleringen expertreview |
| Verbinding | 1 | **2** (CON_SOC kwaliteit-first + CON_NEED-behoeftevraag) | +1 |
| Voeding | 2 | **3** (+ NUT_VEG groente-item) | +1 — herstelt mediterrane content-validiteit (Dinu 2018) |
| Beweging | 2 | **3** (+ MOV_SIT zit-item) | +1 — grootste evidence-hiaat (Ekelund 2016) |
| Energie (readout) | 2 | 2 (NRG_DEP herbouwd, alcohol eruit) | — |
| Herstel (readout) | 1 | 1 | — |
| Leefstijl (signaal) | 2 | 2 | — |
| **Totaal** | **16** | **17** | **+1, invultijd ~gelijk** |

**Antwoord op "drie verbinding-vragen in tier-1":** doe het niet — **twee** is het maximum dat het budget draagt, en het is genoeg voor wat tier-1 moet doen (ranken + personaliseren). CON_SOC (herschreven: "een paar, en dat is genoeg voor mij" = topscore) meet ervaren steun-adequaatheid; CON_NEED meet sociale behoefte zodat het advies persoonlijk wordt. De derde, vierde en vijfde as (eenzaamheid, wederkerigheid, sociale belasting) zijn te goed om in één tier-1-vraag te proppen — die verdienen de dashboard-check-in (§3). Drie sterk onderbouwde *assen*: ja. Drie tier-1-*vragen*: nee.

---

## 3. De dashboard-verbinding-check-in — jouw idee, en het is het juiste

Het voorstel "een verdiepende vragenlijst in dashboard-verbinding, aansluitend op SDT" is precies het voedingscheck-patroon: tier-1 signaleert, de check-in verdiept, het plan ondersteunt. Uitwerking:

**Route & plek:** `/intake/verbinding` (naast bestaande slaap/stress/voeding/beweging-check-ins); resultaat voedt de Verbinding-tab in het dashboard — die nu een premium-upsell-placeholder is (`VerbindingScreen`). De check-in geeft die tab eindelijk inhoud.

**Kern: drie sterk onderbouwde assen × 2 items = 6 vragen** (kort genoeg om af te maken, rijk genoeg voor een profiel):

| As | Items (coaching-hertaling) | Instrument-basis | Compliance |
|----|---------------------------|------------------|------------|
| **A. Verbondenheid ervaren** (SDT-relatedness) | "Ik voel me verbonden met de mensen die belangrijk voor me zijn" · "Ik voel me buitengesloten bij mensen waar ik juist bij wil horen" | BPNSFS-relatedness-subschaal (Chen et al. 2015, *Motiv Emot*, DOI 10.1007/s11031-014-9450-1) — satisfactie + frustratie apart, conform SDT | ✅ behoefte-taal, geen diagnose |
| **B. Gemis ervaren** (eenzaamheid) | "Er zijn genoeg mensen op wie ik kan terugvallen" · "Ik mis een echt goede vriend of maatje" | De Jong Gierveld 6-item (NL-gevalideerd; De Jong Gierveld & Van Tilburg 2006, DOI 10.1177/0164027506289723) | ⚠️ nooit "eenzaamheidstest" of -score tonen; alleen patroon-taal |
| **C. Geven & kosten** (wederkerigheid + belasting) | "Ik kan zelf ook iets betekenen voor de mensen om me heen" · "Sommige contacten kosten me meer energie dan ze opleveren" | Steun geven als onafhankelijke voorspeller (Brown 2003, PMID 12807404); negatieve ties (Umberson 2006, PMID 16583773) | ✅ / ⚠️ "kosten meer dan ze opleveren" is oordeelvrij genoeg |

**Output — geen score, wel een profiel + plan:** de check-in telt **niet** mee in de vitaliteitsscore (zelfde naad als de voedingscheck: verdieping verandert de baseline niet). Hij levert een verbindingsprofiel in herkennings-taal — bv. *"tevreden klein netwerk"* (A hoog, B laag: bevestiging, geen interventie), *"gever zonder tankstation"* (C-geven hoog, A/B-gemis: wederkerigheid-advies), *"contact-gemis"* (B hoog: laagdrempelige opbouw-route, incl. maatschappelijke verbondenheid als begaanbaarste pad — Jenkinson 2013) — plus koppeling aan het `connection.ts`-leefstijlplan (scope-review L2) en één habit.

**SDT-borging in het advies zelf (dit is waar SDT écht werkt):** SDT is een theorie over *waarom gedrag beklijft*, niet een vitaliteitsmaat. De implementatie is dus autonomie-ondersteunend advies: altijd 2–3 opties laten kiezen i.p.v. één opdracht ("kies wat bij je past"), competentie-taal ("dit lukt je al"), en nooit verplichtende framing. Evidence: autonomie-ondersteunende interventies verbeteren gedragsbehoud (Ntoumanis 2021, PMID 32064938; Ng 2012). Dat kost nul vragen en is de goedkoopste wetenschappelijke versterking van het hele product. ✅

**Later (P2):** de motivatie-items uit het SDT-rapport (V4 zelfeffectiviteit, V5 autonome motivatie, V6 gewoonte-automatisme) als optionele module ná het plan — ze voeden dan een `PlanCondition`-motivatieprofiel (scope-review L4) dat bepaalt *hoe* het plan doseert (kleine stappen vs uitdaging), niet wat de score is.

---

## 4. De vitaliteitsscore wetenschappelijk sterk — vier poten

1. **Psychometrisch kloppend maken** (expertreview prio 1–4): item-herskalering (optie-aantal ≠ gewicht; echte 0–100-schaal), urgentie-drempels herijken, "weet niet" niet als slechtste scoren, NRG_DEP herbouwen. Zonder deze basis is elke verdere claim bouwen op zand.
2. **Elk interventiedomein ≥ 2 items** — de herverdeling uit §2 levert dit vanzelf: verbinding 2, voeding 3, beweging 3, slaap 2, stress 2. Single-item-domeinen met 25-puntsprongen verdwijnen; de betrouwbaarheid per domein wordt vergelijkbaar.
3. **SDT op de juiste plek:** verbinding (relatedness) blijft als enige behoefte ín de score — verdedigbaar omdat het óók een zelfstandige leefstijlfactor is met eigen uitkomst-evidence (Holt-Lunstad 2010). Autonomie en competentie gaan **niet** de score in: dat zou determinanten en gedrag mengen en de score onuitlegbaar maken ("waarom telt mijn gevoel van autonomie mee in mijn leefstijlscore?"). Ze sturen de *advies-personalisatie* (§3). Score = laag 2 + relatedness; SDT = de motor eronder en de taal eromheen.
4. **Criterium-anker in de hermeting:** neem 1–2 items van de Subjective Vitality Scale (Ryan & Frederick 1997) op in de hermeting-flow — ongescoord, puur als validatie-anker. Daarmee kan met eigen data convergente validiteit worden aangetoond ("onze leefstijlscore hangt samen met ervaren vitaliteit") — het verschil tussen *beweren* dat de score vitaliteit ondersteunt en het *laten zien*. Samen met de item-analyse-pipeline (expertreview §9.6: spreiding, item-rest-correlaties, test-hertest via hermeting) is dit een volwaardige validatie-lus zonder extern onderzoek. ✅ (SVS-items zijn welzijns-, geen gezondheidsvragen.)

---

## 5. Fasering — gebundeld met wat al gepland staat

| Stap | Inhoud | Bron | RULES_VERSION |
|------|--------|------|---------------|
| 1 | Copy-PR: bias-herformuleringen + framing-copy §1 + autonomie-ondersteunende advieskeuze-taal | expertreview prio 5 + dit doc | Nee |
| 2 | Engine-bump (één keer): item-herskalering + drempel-herijking + CON_SOC + NUT_PROT-"weet niet" + NRG_DEP-herbouw | expertreview prio 1–4 | **Ja** |
| 3 | Analyse-script item-analyse op bestaande sessies (vóór stap 2 draaien voor de vóór/ná-vergelijking) | expertreview prio 7 | Nee |
| 4 | Tier-1-herverdeling: slaap −2, +CON_NEED, +NUT_VEG, +MOV_SIT (16→17) | dit doc §2 | **Ja** (tweede bump, of samen met stap 2 als één herziening) |
| 5 | `connection.ts`-plan + dashboard-verbinding-check-in (6 items, §3) + SVS-anker in hermeting | scope-review L2 + dit doc §3–4 | Nee (check-in scoort niet mee) |
| 6 | Motivatie-module V4–V6 → PlanCondition-personalisatie | SDT-rapport P2 + scope-review L4 | Nee |

Stappen 2+4 samenvoegen tot één herziening is te overwegen: één communicatiemoment, één delta-document, en de hermeting vergelijkt maar één keer over een regelset-grens heen.

---

## 6. Antwoord op de open beslispunten uit het SDT-rapport

1. **SDT echt meten of narratief houden?** Meten — maar gelaagd: relatedness zit al in tier-1 (CON_SOC, +CON_NEED erbij); eenzaamheid/wederkerigheid/belasting in de dashboard-check-in; autonomie/competentie als motivatie-module die het plan personaliseert. Niet alles in de hoofdflow.
2. **Hoeveel mag de check groeien?** Netto +1 (16→17) door herverdeling. De +3 uit het SDT-rapport wordt gehaald (V2 zit ✓, V3 groente ✓, verbinding-verdieping ✓) zonder +3 te kosten, omdat slaap 2 vragen afstaat aan de slaap-check-in.
3. **Ketenmodel corrigeren?** Al gebeurd — geverifieerd in `leefstijlcheck-evidence.ts` (parallelle behoeften r.39; batterij-loop losgelaten r.61). Geen actie nodig behalve dit ook in het SDT-rapport-archief noteren zodat het niet nogmaals wordt aanbevolen.

**Beslispunt — BESLOTEN (Dennis, 11 juli 2026):** de verbinding-check-in is **gratis** (data + engagement + de SDT-belofte waarmaken); het verdiepende plan/de begeleiding erachter is **premium** — consistent met "Verdieping na je check" (moat-besluitdoc 5 jul). De Verbinding-tab (nu premium-upsell-placeholder) krijgt dus: gratis check-in → profiel → gegate plan-verdieping.

---

*Referentie-caveat: BPNSFS (Chen 2015), SVS (Ryan & Frederick 1997) en De Jong Gierveld-DOI vóór publicatie op `/onderbouwing` verifiëren; Holt-Lunstad 2010, Cohen & Wills 1985 en Sutcliffe/Dunbar 2012 zijn in deze sessie al extern geverifieerd.*
*Meetpunten bij implementatie: bestaand `intake_completed` (stap 2/4-effect), check-in start/completed-events volgens voedingscheck-patroon (stap 5), `plan.viewed` voor het verbinding-plan. Nieuw client-event = drie registratiepunten.*
