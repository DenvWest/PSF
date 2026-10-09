# Plan — kennisbank: de brug van begrip naar "wat eet ik eigenlijk?"

**Datum:** 9 oktober 2026
**Status:** voorstel, wacht op review van Dennis (hooks in §3 en §5). Nog geen code.
**Vervolg op:** `BESLUIT_PROFIELEN_NAAR_VOEDINGSGIDSEN_2026-10.md` (naam blijft "Wat mis je?") · `BESLUIT_GIDS_SLUGS_EN_VOEDING_2026-10.md` (voeding-eerst) · `ARCHITECTUUR_ECOSYSTEEM_CONTENTGRAAF_2026-09.md` (kennisbank = BEGRIP/SUBTOPIC, 37 termen)
**Botst met:** niets gevonden bij `grep -rli kennisbank docs/plan/`. Raakt wel de Verdieping-gate (moat-besluit, 5 jul): zie §4.

## 1. Aanleiding

Dennis wil twee dingen bij elke kennisbankterm:

1. De lezer krijgt het gevoel "ik wil mijn voedingspatroon wel weten".
2. Wie via SEO op een supplement-term binnenkomt, denkt: "wat eet ik eigenlijk?"

Audit van de 37 termen (9 okt):

- Geen enkele term heeft een eigen brug naar de check. Alle krijgen onderaan hetzelfde blok (`page.tsx` TermPage): tier 1 "Dit was de algemene uitleg…", tier 2/3 "Eerst je bord, dan pas een supplement".
- Alleen `eiwitbehoefte-na-40` noemt de check in de lopende tekst.
- 15 termen zijn gegate (tier ≥ 2, niet `publicFullContent`): bezoeker en Google zien alleen de definitie plus de gate. De gate vraagt om de check zonder te zeggen waarom die voor déze term telt.
- Supplement-termen (`adaptogens`, `chelaatvorm`, `magnesiumvormen`) linken naar `/beste/*`, maar nergens staat "zit dit al in je eten?".

## 2. Besluit-voorstel

**Eén plan, twee sporen, aparte PR's.**

- **Spoor 1 — de brug (infrastructuur + 20 hooks):** één optioneel veld `voedingBrug` op `KennisbankTerm`, één component, plaatsing midden in de pagina, één meetpunt.
- **Spoor 2 — vier nieuwe mechanisme-begrippen (content):** per begrip een eigen PR, omdat bronnen één voor één gelezen moeten worden. Gebruikt de brug uit spoor 1.

Groepen: **A** voeding zit er al in (13 termen) en **B** supplementzoeker (7 termen) nu; **C** lichaam en leefstijl (10) en **D** methodiek (7) bewust uitgesteld (zie §6).

## 3. Spoor 1 — brug op 20 termen

### Ontwerp

- Type: `voedingBrug?: { groep: 'A' | 'B'; hook: string; bronnen?: string[] }` in `src/data/kennisbank.ts`. `bronnen` = 2–4 voedingsbronnen, kwalitatief, geen getallen.
- Component: `src/components/kennisbank/KennisbankVoedingBrug.tsx` (server component, link via `IntakeCtaLink`).
- Plaatsing: direct na het blok `whyItMatters`. Bij gegate termen direct na `whatIsIt`, boven de gate: de brug is dus ook publiek en voor Google zichtbaar.
- Het onderste blok blijft; de brug staat er niet naast als dubbele CTA maar eerder, met een eigen hook.
- Knoptekst uit `CHECK_CTA` (geen eigen duur-label: `CONTENT_CHECKS.voeding.duurLabel` = "1 minuut" tegenover "3 minuten" elders is een open punt uit het profielbesluit).
- Copy: `WRITING_VOICE.md` (begrip → urgentie → actie), fit-taal, geen diagnose of medische claim, geen getallen die we niet onderbouwen.

### Meetpunt

Hergebruik `IntakeCtaLink` met `locatie="kennisbank_brug_<slug>"` (bestaand event-type, zie hoe `kennisbank_<slug>` nu loopt). Geen nieuw event tenzij de bouw laat zien dat de locatie niet in de allowlist past; dan registratie op de drie plekken (`events.ts`, `intake-events-client.ts`, allowlist in `api/intake/events/route.ts`). Af te lezen: doorklik per term en per groep. Drempel: na enkele weken een doorklikratio onder ~3% op een groep → brug herschrijven, niet méér termen bouwen.

### De 20 hooks (ter review)

Per term: hook (1–2 zinnen) · voedingsbronnen. Alles is concept; bronnen zijn algemeen bekend en worden bij de bouw tegen de bestaande termtekst en referenties gelegd.

**Groep A — voeding zit er al in**

| Term | Hook | Bronnen |
|---|---|---|
| eiwitbehoefte-na-40 | Eiwit zie je op je bord, niet op een etiket. Weet jij hoeveel je per maaltijd binnenkrijgt? | zuivel, ei, vis, peulvruchten |
| leucinedrempel | De drempel geldt per maaltijd, niet per dag. Ook met een volle dag eten kan één maaltijd er net onder zitten. | zuivel, ei, vlees, vis, soja |
| wei-eiwit | Een shake dicht een gat. De vraag is eerst of dat gat er bij jou is. | zuivel, ei, peulvruchten |
| kalium-natrium-balans | Die verhouding zit zelden in één product, maar in wat je elke dag eet. Zie waar jij uitkomt. | groenten, fruit, peulvruchten |
| vitamine-d-inname | Vitamine D neem je het best met vet. Wat staat er op je bord als je hem neemt? | vette vis, ei, olie |
| vitamine-d | **A:** Vitamine D haal je maar voor een klein deel uit eten. Hoeveel jij binnenkrijgt, laat de check zien. · **B:** Een supplement voegt toe wat je bord laat liggen. Weet je wat je bord eigenlijk levert? | vette vis, ei, verrijkte producten |
| vitamine-k2 | K2 zit vooral in gefermenteerde en dierlijke producten. Eet je die regelmatig? | kaas, eierdooier, natto |
| epa-dha | Vette vis levert EPA en DHA rechtstreeks. Hoe vaak staat die per week op tafel? | zalm, makreel, haring |
| multivitamine | Een multivitamine dekt alles een beetje af. De check laat zien waar je bord echt iets mist. | groenten, fruit, volkoren |
| oxidatieve-stress | De antioxidanten waar dit over gaat komen vooral uit groenten en fruit. Hoeveel kleur zit er op je bord? | groenten, fruit, noten |
| insulineresistentie | Wat je eet speelt hier mee. De check stelt geen diagnose; hij laat zien wat er in je eetpatroon opvalt. | volkoren, peulvruchten, groenten |
| adh | De ADH is een norm voor je hele dag, niet voor één product. Hoeveel haal je al uit eten? | n.v.t. (algemeen) |
| biobeschikbaarheid | Hoeveel je opneemt hangt ook af van wat je erbij eet. Zie wat jouw bord doet. | n.v.t. (algemeen) |

**Groep B — supplementzoeker ("zit het al in je eten?")**

| Term | Hook | Bronnen |
|---|---|---|
| adaptogens | Voor je een plant kiest: slaap, stress en energie hangen ook af van wat je binnenkrijgt. Begin bij je bord. | n.v.t. |
| chelaatvorm | Een betere vorm helpt alleen als er iets mist. Zit het mineraal al in wat je eet? | noten, zaden, groene bladgroenten |
| magnesiumvormen | Voor je een vorm kiest: hoeveel magnesium krijg je al binnen? | groene bladgroenten, noten, zaden, volkoren |
| atp | Energie begint bij wat je eet. Zie welke bouwstenen op je bord ontbreken. | vlees, vis, volkoren |
| testosteron | Voor je een supplement overweegt: wat krijg je van zink, eiwit en vitamine D al binnen? | vlees, vis, ei, zuivel |
| mitochondrien | Je cellen draaien op wat je eet. Zie waar jouw bord iets mist. | vis, groenten, volkoren |
| derde-partij-testen | Een test controleert de capsule, niet of je hem nodig hebt. Dat begint bij je bord. | n.v.t. |

### Open voor Dennis

1. Akkoord op de toon en de hooks? Voor `vitamine-d` kies je A of B.
2. Plaatsing "na `whyItMatters`, bij gegate termen boven de gate" akkoord?
3. `adh` en `biobeschikbaarheid` hebben geen vaste voedingsbron; hook zonder bronnenregel akkoord?

## 4. Gate en SEO

De brug staat boven de gate en is dus publiek. Dat past bij het moat-besluit (tier 2–3 lekt nu, teaser + gate is het uitgangspunt): de brug is een teaser, geen verdieping. De gate zelf verandert niet in spoor 1; een aanpassing van de gate-tekst ("waarom de check hier telt") is een apart, later besluit.

## 5. Spoor 2 — vier nieuwe mechanisme-begrippen

Aanleiding: LinkedIn-reeks (W. Wallace) laat zien dat een supplement weken nodig kan hebben, dat uitgangsstatus bepaalt of het werkt, en dat voeding/vorm ertoe doet. Wij nemen **geen tekst of grafiek** over: we gebruiken de primaire bronnen en schrijven in eigen stem.

| Voorstel-slug | Kernvraag | Voedingsbrug |
|---|---|---|
| `opbouwtijd-supplement` | Waarom duurt het weken voor een supplement werkt? | Wat zit al in je bord? Dat bepaalt hoe ver je al bent |
| `uitgangsstatus` | Waarom werkt hetzelfde supplement bij de één wel en bij de ander niet? | Check = uitgangssituatie |
| `supplement-niet-bij-iedereen` | Voor wie heeft een supplement weinig toegevoegde waarde? | Fit-taal, geen groepenlijst met claims |
| `voeding-versus-capsule` | Wat doet een bord wat een capsule niet doet? | Voedingsbronnen per stof |

Eisen per begrip: `insightTier: 1`, volledig publiek (nooit gegate), minimaal 5 referenties (Vancouver), eigen PR, brug uit spoor 1.

### Bronstatus (9 okt, alleen kernclaims via zoekresultaten gecheckt)

| Bron | Status |
|---|---|
| Hultman 1996, J Appl Physiol (creatine ~20% na 6 d op 20 g of 28 d op 3 g) | Gecheckt |
| Manson 2019 VITAL, NEJM (geen effect kanker/hart; omega-3 −28% hartinfarct, vooral bij weinig vis) | Gecheckt |
| Webb & Engelsen 2006, Photochem Photobiol 82(6):1697–1703 | Bron bestaat; stadstijden niet nagerekend |
| Winter-UVB-grens 52°N (Edmonton okt–mrt) | Grotendeels gecheckt; Nederland ≈ april–september zelf aanmaken |
| Gezondheidsraad 2012 / Voedingscentrum (15–30 min buiten; supplement voor 0–4 jr, vrouwen 50+, 70+, donkere huid, weinig buiten) | Gecheckt |
| Katan 1997, J Lipid Res (58 mannen, 0/3/6/9 g visolie/dag, 12 mnd) | Gecheckt (samenvatting): EPA in serum-cholesterolesters plateau na 4–8 wkn (halfwaardetijd 4,8 d); in rode bloedcellen halfwaardetijd 28 d, evenwicht na ~180 d. Het bericht zegt "serum ~4 weken": schrijf **4–8 weken** |
| Heaney 2003, Am J Clin Nutr 77:204–210 (67 mannen, ~20 wkn, 0/25/125/250 µg = 0/1.000/5.000/10.000 IE) | Gecheckt (samenvatting): evenwicht stijgt evenredig met dosis (~0,70 nmol/L per µg). De claim "5.000 IE: bijna vol na 2–3 maanden" staat niet in de samenvatting → tijdsverloop **nog niet bevestigd** |
| Browning 2012, Am J Clin Nutr 96:748–758 (204 personen, 12 mnd) | Gecheckt (samenvatting): opnametijd varieert van dagen (plasma-fosfatidylcholine) tot maanden (mononucleaire cellen) tot >12 mnd (vetweefsel); geen dosisrespons voor EPA in rode bloedcellen |
| Neubronner 2011, Eur J Clin Nutr 65:247–254 | Bron bestaat, maar gaat over **triglyceride- versus ethylesterform** en de omega-3-index, niet over opbouwtijd. Past bij *voeding-versus-capsule* (vorm doet ertoe), niet bij *opbouwtijd* |
| Khanna 2022, Nutrients 14(23):5189 (KNMI-coauteurs) | Bron bestaat: gemiddelde "vitamine D-winter" 126 dagen, spreiding 4–215 dagen. De Nederlandse waarde is **niet** gelezen (MDPI 403, PMC captcha) |
| UV-index ≥ 3 in Nederland ≈ maart–september | Alleen via een mediasite (maxvandaag.nl); RIVM-pagina geeft het niet. **Niet citeerbaar** zonder primaire KNMI/RIVM-bron |
| Young 2020, Shih 2018, DANCODE, buikvet/vit D-studie | **Niet gecheckt** — pas citeren na lezen van de bron zelf |

### Open punten spoor 2

- **Nederlandse UV-gegevens** (KNMI/TEMIS) per maand zijn niet gevonden. Zonder die cijfers geen Nederlands zonnetijden-begrip, alleen het Gezondheidsraad-advies. Amerikaanse en Britse stadstabellen gelden niet als vervanger.
- Per begrip: slug-keuze, `theme`, `relatedComparisons` (alleen bij concrete stof, bijv. `/beste/vitamine-d`) en `relatedSlugs` vastleggen in de eigen PR.
- Geen affiliate-link in het begrip (alleen op vergelijkingspagina's).
- Compliance: "voor wie werkt het niet" in fit-taal ("minder kans op effect als je al voldoende binnenkrijgt"), nooit diagnose-taal.

## 6. Afgewezen / uitgesteld

- **Losse betogen als kennisbankartikel.** Kennisbank = begrippen ("wat is X"). Mechanisme-uitleg wordt een begrip, geen essay.
- **Tekst/figuren van de LinkedIn-reeks overnemen.** Auteursrecht; eigen stem en primaire bronnen.
- **Affiliate-links op het begrip.** Monetisatie zit één stap verder, op `/beste/*`.
- **De nieuwe begrippen achter de Verdieping-gate.** Zij zijn bovenste trechter; verbergen voor Google is hier contraproductief.
- **Naam "Voedingscheck".** Blijft afgewezen (§3.9 / profielbesluit): de check heet "Wat mis je?".
- **Groep C (lichaam en leefstijl, 10 termen) en D (methodiek, 7 termen)** uitgesteld. C: voeding is indirect en slaap/stress/beweging zijn bewust uit de navigatie (voeding-eerst-besluit). D: de brug is hier "naar de vergelijking", niet "naar je bord". `sociale-verbinding` blijft buiten beeld (verborgen domein).
- **Nieuw event-type** — alleen als bestaande niet passen.

## 7. Volgorde

1. Dit plan reviewen (Dennis): hooks, plaatsing, A/B-keuze `vitamine-d`.
2. Spoor 1 bouwen op een eigen branch, klaar-check, PR, lokaal laten zien op eigen poort.
3. Doorklik per groep een paar weken meten.
4. Spoor 2: eerst `opbouwtijd-supplement` (sterkste bronnen, bestaande zoekvraag), daarna de andere drie.
