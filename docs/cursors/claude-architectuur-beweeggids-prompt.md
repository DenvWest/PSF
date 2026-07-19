# Prompt — Architectuur Bewegingsgids (PerfectSupplement)

> **Gebruik:** kopieer alles onder **Prompt (copy-paste)** naar Claude Opus in een nieuw gesprek. Voeg de **screenshot van de Slaapgids-strategische review** toe als bijlage. Optioneel: `CLAUDE.md`, `docs/core/WRITING_VOICE.md`, `src/app/beweging-na-40/page.tsx`, `src/data/gids/beweging.ts`.
>
> **Output:** uitsluitend architectuur — geen code, geen uitgewerkte hoofdstukteksten, geen diffs.

---

## Waarom deze prompt

PerfectSupplement heeft vier diepe leefstijlgidsen (slaap, stress, energie, herstel). De vijfde — **Bewegen** — moet de **sterkste schakel** worden in de klantreis, niet een kopie van de andere vier en niet een standaard sportgids.

De Slaapgids-strategische review (7.8/10) toont het patroon: **excellent content, lekkende naden**. De Bewegingsgids moet vanaf architectuur-fase die naden dichten — vooral de overgang naar dashboard, check-naamgeving en return-states na opt-in.

Deze prompt dwingt Opus om:
- een **documentaire WHY-first** structuur te ontwerpen (gedragspsychologie vóór minuten/schema's);
- **STEP-beweegstijl** zelf te definiëren en door de hele gids te weven;
- de keten **gids → trust → Leefstijlcheck → dashboard → beweegplan → retentie** als één ontwerp te behandelen;
- een **multi-perspectief kritiekronde** te doorlopen vóór de definitieve architectuur.

---

## Gebruiksinstructie

1. Open Claude Opus (nieuw gesprek).
2. Voeg bijlagen toe:
   - Screenshot Slaapgids-review (scorecard + kernthese + drie lekkende naden)
   - Optioneel: `CLAUDE.md`, `docs/core/WRITING_VOICE.md`
3. Kopieer het volledige blok onder **Prompt (copy-paste)**.
4. Verwachte output: vaste secties A t/m J (zie onderaan prompt). Geen body-copy.
5. Gebruik de output als blueprint voor content, PDF, pillar-upgrade en funnel-fixes — implementatie gebeurt apart in Cursor.

---

## Prompt (copy-paste)

```text
ROL: Je bent Senior Learning Experience Designer, Behavioral Scientist, Information
Architect en Preventieve Gezondheidsexpert voor PerfectSupplement (perfectsupplement.nl).
Je bent GEEN copywriter. Je schrijft GEEN uitgewerkte hoofdstukteksten.
Je ontwerpt uitsluitend ARCHITECTUUR: structuur, volgorde, psychologie, CTAs, visuals,
funnel-naden en methodiek-integratie.

Lees CLAUDE.md mee als je het hebt. Lever UITSLUITEND architectuur/analyse.
Geen code, geen diffs, geen edits, geen "ik ga nu bouwen".

═══════════════════════════════════════════════════════════════════════════════
BIJLAGEN (door Dennis)
═══════════════════════════════════════════════════════════════════════════════

1. VERPLICHT: Screenshot "Strategische review — De gratis Slaapgids als startpunt
   van de reis" (scorecard 7.8/10, kernthese 4-pijler-ruggengraat, drie lekkende naden).
   Gebruik dit als kwaliteitslat — de Bewegingsgids moet dezelfde kwaliteit halen op
   content/trust, maar STRUCTUREEL beter scoren op funnel-naden en dashboard-overgang.

2. OPTIONEEL: huidige dunne beweging-pillar (/beweging-na-40) en opt-in (/gids/beweging)
   als "huidige staat" — niet als doelarchitectuur.

═══════════════════════════════════════════════════════════════════════════════
DOEL
═══════════════════════════════════════════════════════════════════════════════

Ontwerp de volledige architectuur van de vijfde leefstijlgids: BEWEGEN.

Deze gids moet:
- voelen als de meest motiverende, logische en overtuigende gids uit de hele serie;
- beginnen bij WAAROM (gedragspsychologie), niet bij minuten/oefeningen/schema's;
- de lezer stap voor stap laten denken:
  (1) "Ik wist niet dat bewegen ZÓ veel doet."
  (2) "Eigenlijk zou ik hier vandaag al iets mee moeten doen."
  (3) "Oké, hoe ga ik beginnen?"
- STEP-beweegstijl centraal integreren — niet als los hoofdstuk, maar als rode draad;
- de productketen naadloos ontwerpen:
  website → gids → trust → inzicht → dashboard → begeleiding → retentie;
- scorecard-doel voor je eigen ontwerp: totaal ≥8.5/10, met dashboard-overgang ≥8.0/10
  (Slaapgids haalde 6.0 op die dimensie).

═══════════════════════════════════════════════════════════════════════════════
HARDE CONTEXT (geverifieerd — neem als waar aan)
═══════════════════════════════════════════════════════════════════════════════

MERK & DOELGROEP
- PerfectSupplement: onafhankelijk supplementen-vergelijkingsplatform, positionering
  "De Consumentenbond van supplementen".
- Doelgroep: mannen 40+.
- Scope: leefstijlcoach — adviezen, geen diagnoses. Stepped care: leefstijl eerst,
  supplementen pas laat. Geen medische claims.
- Schrijfstem (voor architectuur-labels, niet voor body-copy): begrip → urgentie → actie;
  jij-vorm; concreet; geen hype/diagnose-taal (WRITING_VOICE.md).

BESTAANDE GIDS-SERIE (benchmark — premium-kwaliteit, eigen identiteit per thema)
- Slaap: /slaap-verbeteren-na-40 + PDF slaapgids + /gids/slaap
- Stress: /stress-verminderen-na-40 + /gids/stress
- Energie: /energie-na-40 + /gids/energie
- Herstel: /herstel-verbeteren-na-40 + /gids/herstel
Patroon diepe gidsen: herkenning → biologie na 40 → leefstijl → supplementen →
week-voor-week → verder lezen → Leefstijlcheck-CTA → FAQ (~3500 woorden pillar).

BEWEGEN — HUIDIGE STAAT (dun — moet worden opgewaardeerd)
- Pillar: /beweging-na-40 (~1000 woorden; kracht/ritme/herstel; sport-gericht)
- Opt-in: /gids/beweging (email-sequence, GEEN PDF yet; src/data/gids/beweging.ts)
- Micro-check: /intake/beweging (1 min)
- Full check: /intake (Leefstijlcheck)
- Persoonlijk plan: /intake/plan/movement ("Bewegingsplan na 40")
- Dashboard: BewegingScreen (analyse → Stappenplan-link)
- Inzichten-feed: /inzichten?pijler=beweging

PRODUCT-SPOREN BEWEGING (bestaan al — architectuur moet hierop aansluiten)
- Drie sporen: Kracht · Conditie · Dagelijks ritme
  (src/lib/movement-week-categories.ts)
- Plan-structuur: main (hoofdactiviteit) vs micro (bewegingssnack / sedentary break)
- Plan-template: src/data/lifestyle-plans/movement.ts (guideThema: "beweging")

STEP-BEWEEGSTIJL
- STEP staat NIET gedefinieerd in de codebase. JIJ definieert de letters (S/T/E/P)
  en legt de relatie vast tot:
  (a) gedragsreis (begrijpen → bewust → actie → gewoonte → duurzaam), en
  (b) de drie product-sporen (Kracht/Conditie/Dagelijks ritme).
- Kies één heldere hiërarchie: STEP = methodiek-laag; sporen = inhoudelijke vertaling.
- Documenteer je keuze expliciet in de output.

SLAAPGUIDS-LESSEN (uit bijlage — MOET je verbeteren)
Scorecard Slaapgids: 7.8/10 — "Sterke basis, lekkende naden."

Sterk:
- Content quality 9.0, Trust 9.0, Meting 8.5
- 4-pijler-ruggengraat: Inslapen / Doorslapen / Regelmaat / Uitgerust wakker
- Zelfde taal in PDF, analyse, dashboard, check
- Ladder: Algemeen → Persoonlijk → Begeleiding

Lekkende naden (Bewegingsgids moet deze structureel voorkomen):
1. PDF linkt naar pagina die PDF opnieuw aanbiedt (dead-end / dubbele opt-in)
2. Persoonlijke analyse verdwijnt achter login (trust-break)
3. Drie overlappende "checks" met verschillende namen (verwarring)
4. Zwakke punten: PDF als digitale ervaring 6.5, overgang dashboard 6.0

IA-REGELS
- Publieke pillar/gids: GEEN persoonlijke scores tonen
- Personalisatie begint na check, zichtbaar in dashboard/plan
- Eén canonieke naamgeving voor checks — geen vierde parallel pad

METING (architectuur moet meetpunten benoemen, niet implementeren)
- Hergebruik bestaande events waar mogelijk:
  email.opted_in (source: guide, thema: beweging)
  hub_connector_click (pillar beweging)
  dashboard_beweging_checkin_click, dashboard_beweging_plan_click,
  dashboard_beweging_gids_click
- Nieuwe events alleen als strikt nodig voor attributie

═══════════════════════════════════════════════════════════════════════════════
HET GROTE VERSCHIL (creatieve opdracht)
═══════════════════════════════════════════════════════════════════════════════

Standaard beweeggidsen beginnen met: richtlijnen, minuten, oefeningen, schema's.
Jij ontwerpt het TEGENOVERGESTELDE:

Fase 1 — Overtuiging (waarom)
Fase 2 — Urgentie (vandaag relevant)
Fase 3 — Actie (hoe begin je laagdrempelig)

Onderwerpen die terugkomen — NIET als lange opsomming, maar als clusters in een
verhaal:
energie, hersenen, concentratie, stress, slaap, bloedsuiker, insuline, hart- en
vaatziekten, cholesterol, gewicht, vetverbranding, hormonen, spieren, gewrichten,
botten, ouder worden, dementie, depressie, angst, productiviteit, werkprestaties,
zelfvertrouwen, weerbaarheid, levensverwachting, gezonde levensjaren.

═══════════════════════════════════════════════════════════════════════════════
TAAK A — RUGGENGRAAT & STEP
═══════════════════════════════════════════════════════════════════════════════

1. Definieer STEP-beweegstijl:
   - Letter S, T, E, P: betekenis + gedragsdoel per letter
   - Hoe STEP de reis structureren: van begrijpen → bewust worden → kleine acties
     → gewoontevorming → duurzame leefstijl
   - Waar STEP terugkomt in elk hoofdstuk (niet alleen aan het eind)

2. Ontwerp de 4-pijler-equivalent voor BEWEGEN (niet slaap-pijlers kopiëren):
   - 4 duidelijke, memorabele pijlers die door PDF, gids, check, dashboard en plan
     dezelfde taal gebruiken
   - Elke pijler: één zin definitie + één herkenningszin voor man 40+

3. Leg de hiërarchie vast:
   STEP (methodiek) ↔ 4 pijlers (structuur) ↔ 3 sporen (Kracht/Conditie/Ritme)
   ↔ main/micro (actiegranulariteit)

═══════════════════════════════════════════════════════════════════════════════
TAAK B — DOCUMENTAIRE-ARCHITECTUUR (hoofdstukken)
═══════════════════════════════════════════════════════════════════════════════

Ontwerp de volledige hoofdstukstructuur als een LOGISCHE REIS, geen opsomming.

Per hoofdstuk lever je:
- Werkende titel (kort, nieuwsgierigheid-opwekkend — geen body-copy)
- Cluster(s) die het behandelt (uit de onderwerpenlijst)
- Psychologische functie: waarom staat dit HIER en niet later?
- Emotie die het oproept (bijv. herkenning, verbazing, urgentie, hoop, agency)
- Gedragsverandering die het stimuleert (bijv. reframing, self-efficacy, intentie)
- STEP-moment: welke letter(s) actief zijn
- Visualisatie/infographic/schema dat het hoofdstuk sterker maakt
  (beschrijf het concept, geen design-assets)
- Cliffhanger naar volgend hoofdstuk (1 zin)

Eisen:
- Geen "Hoofdstuk 1/2/3"-gevoel — wel een verhaalboog
- Clusters i.p.v. encyclopedische lijst
- Rode draad expliciet benoemen en per hoofdstuk terugkoppelen
- Supplementen pas in laat stadium (stepped care) — architectuur moet dit respecteren
- Eindhoofdstuk: laagdrempelig startplan — GEEN sportschema, wel "vandaag beginnen"

═══════════════════════════════════════════════════════════════════════════════
TAAK C — FUNNEL, CTAs & LEKKENDE NADEN
═══════════════════════════════════════════════════════════════════════════════

Ontwerp de integratie met Leefstijlcheck, dashboard en beweegplan.

1. CTA-matrix (tabel):
   Kolommen: Moment in gids | Lezer-state | CTA-label (concept) | Doel-URL |
   Ladder-stap (Algemeen/Persoonlijk/Begeleiding) | Meetpunt

   Minimaal deze momenten adresseren:
   - Na herkenning (micro-commitment)
   - Na "wow-moment" (beweging doet veel meer dan ik dacht)
   - Halverwege (personaliseer zonder scores op publieke pagina)
   - Vóór startplan (intentie → actie)
   - Na startplan (retentie / vervolg)
   - Eind van gids (dashboard-bridge)

2. Glossary — één naam per concept (NL, consistent door hele product):
   - Gratis gids / stappenplan
   - Bewegingscheck (micro)
   - Leefstijlcheck (full)
   - Bewegingsanalyse (dashboard)
   - Bewegingsplan / Stappenplan
   Leg uit wanneer welke term gebruikt wordt en welke termen je VERMIJDT.

3. Seam-fixes (expliciet t.o.v. Slaapgids):
   - Hoe voorkom je dubbele opt-in / PDF dead-end?
   - Hoe behoud je analyse-resultaten zonder login-trust-break?
   - Hoe voorkom je check-verwarring?
   - Hoe maakt de gids de dashboard-overgang logisch i.p.v. geforceerd?

4. Keten-diagram in tekst:
   Leefstijlcheck → Persoonlijk Dashboard → Persoonlijk Beweegplan
   (waar in de gids, waar in e-mail-sequence, waar op pillar)

5. PDF vs web-pillar:
   - Wat leeft alleen in PDF?
   - Wat leeft alleen op web?
   - Wat is gedeeld?
   - Hoe versterken ze elkaar zonder te doubleren?

═══════════════════════════════════════════════════════════════════════════════
TAAK D — STARTPLAN ("VANDAAG BEGINNEN")
═══════════════════════════════════════════════════════════════════════════════

Ontwerp een laagdrempelig startplan als architectuur (geen uitgeschreven oefeningen):

- Duur: eerste 7 dagen (niet 12 weken sportschema)
- Regels: iedereen kan morgen starten; geen sportschool vereist; main + micro
- Koppeling aan STEP en aan 3 sporen (Kracht/Conditie/Ritme)
- Differentiatie: starter vs iemand die al traint (zonder complexe vertakking —
  max 2 paden)
- Succescriterium: lezer denkt "Ik ga vandaag beginnen", niet "Leuk verhaal"
- Brug naar /intake/plan/movement: wat is gratis in gids vs wat personaliseert het plan?

═══════════════════════════════════════════════════════════════════════════════
TAAK E — ONDERSCHEID & IDENTITEIT
═══════════════════════════════════════════════════════════════════════════════

1. vs standaard beweeggidsen op markt:
   - Wat doen zij verkeerd in volgorde/structuur?
   - Wat maakt deze gids onmiskenbaar PerfectSupplement?

2. vs de andere vier PerfectSupplement-gidsen:
   - Wat behoud je (premium-kwaliteit, trust, stepped care)?
   - Wat doe je bewust ANDERS (why-first, documentaire, geen week-voor-week als kern)?

3. Eigen identiteit in één zin + drie visuele/tone-of-voice differentiators
   (architectuur-niveau, geen copy)

═══════════════════════════════════════════════════════════════════════════════
TAAK F — MULTI-PERSPECTIEF KRITIEKRONDE
═══════════════════════════════════════════════════════════════════════════════

Beoordeel je EERSTE ontwerp (A–E) alsof je een team bent. Per perspectief:
- 2–3 scherpe kritiekpunten
- 1 concrete verbetering

Perspectieven (verplicht alle zeven):
1. Gedragspsycholoog (motivatie, self-efficacy, habit loop)
2. Arts / preventieve geneeskunde (evidence, claims-grens)
3. Fysiotherapeut / bewegingsexpert (haalbaarheid, blessurerisico 40+)
4. UX-designer (funnel, cognitieve load, mobile 375px)
5. Educationspecialist (learning design, retentie, chunking)
6. Gezondheidswetenschapper (clustering evidence, geen pseudowetenschap)
7. Storytelling-expert (narratieve boog, cliffhangers, documentaire-gevoel)

Daarna: lever de VERBETERDE DEFINITIEVE ARCHITECTUUR waarin alle kritiek is verwerkt.
Markeer expliciet wat je hebt gewijzigd t.o.v. versie 1.

═══════════════════════════════════════════════════════════════════════════════
OUTPUTFORMAAT (exact deze secties, in deze volgorde)
═══════════════════════════════════════════════════════════════════════════════

A. Executive summary (max 15 regels)

B. Self-scorecard (10 dimensies, 1–10 + korte motivatie)
   Minimaal: content-architectuur, trust/compliance, funnel-architectuur,
   dashboard-overgang, PDF-digitale ervaring, STEP-integratie, differentiatie,
   startplan-haalbaarheid, meetbaarheid, mobile UX

C. Rode draad (1 paragraaf + terugkerend motif/symboliek)

D. STEP-definitie + hiërarchie (STEP ↔ pijlers ↔ sporen ↔ main/micro)

E. 4-pijler-ruggengraat Bewegen (tabel: pijler | definitie | herkenningszin |
   waar in product)

F. Hoofdstukarchitectuur — versie 1 (tabel met alle kolommen uit Taak B)

G. CTA-matrix + glossary + seam-fixes + keten-diagram

H. 7-dagen startplan-architectuur (Taak D)

I. Onderscheid & identiteit (Taak E)

J. Kritiekronde (7 perspectieven) + DIFF (wat gewijzigd) +
   DEFINITIEVE hoofdstukarchitectuur (tabel) +
   DEFINITIEVE TOC (genummerde lijst voor implementatie)

═══════════════════════════════════════════════════════════════════════════════
CONSTRAINTS
═══════════════════════════════════════════════════════════════════════════════

- GEEN uitgewerkte hoofdstukteksten, geen marketing-copy, geen FAQ-antwoorden
- GEEN code, geen bestands-patches, geen "ik ga nu bouwen"
- GEEN nieuwe parallelle productroutes naast bestaande (/intake, /intake/beweging,
  /intake/plan/movement, /gids/beweging, dashboard Beweging)
- GEEN persoonlijke scores op publieke pillar/gids
- GEEN medische diagnoses of behandelclaims
- Supplementen/archief: alleen als laatste stepped-care-laag benoemen
- Affiliate: nooit in gids-body; alleen context dat vergelijking apart bestaat
- Denk diep; kies niet voor de voor de hand liggende indeling
- Als iets onduidelijk is: kies de sterkste optie, documenteer de assumptie,
  ga door — stel geen vragen terug aan Dennis

BEGIN.
```

---

## Verwachte output (checklist)

Na het draaien van de prompt moet Opus minimaal opleveren:

- [ ] **A** — Executive summary
- [ ] **B** — Self-scorecard (doel ≥8.5 totaal, dashboard ≥8.0)
- [ ] **C** — Rode draad
- [ ] **D** — STEP-definitie + hiërarchie
- [ ] **E** — 4-pijler-ruggengraat Bewegen
- [ ] **F** — Hoofdstukarchitectuur v1 (tabel)
- [ ] **G** — CTA-matrix, glossary, seam-fixes, keten
- [ ] **H** — 7-dagen startplan-architectuur
- [ ] **I** — Onderscheid t.o.v. markt en serie
- [ ] **J** — Kritiekronde + diff + definitieve TOC

Geen code. Geen body-copy. Wel implementeerbare structuur voor content, PDF, pillar en funnel.

---

## Volgende stap na Opus-output

1. Review sectie J (definitieve TOC) — akkoord of bijsturen.
2. Aparte Cursor-prompt voor implementatie: pillar upgrade, gids-opt-in copy, PDF-structuur, CTA-meetpunten (volgt pas na goedgekeurde architectuur).
