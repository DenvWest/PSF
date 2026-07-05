# Fable — Leefstijlcheck & metadata evidence-audit (juli 2026)

Her-evaluatie na Wave 5 (CONTENT_METADATA 55/55, category insightSlugs 14 categorieën).
Vraag: is de keten Leefstijlcheck → scores/signalen → metadata → content → conversie
betrouwbaar, wetenschappelijk verdedigbaar en niet suggestief-generaliserend?
Alle bevindingen geverifieerd tegen de codebase op 2026-07-05. Geen code gewijzigd.

---

## 1. Executive summary

**Verdict: NUANCEER — metadata-batch mag live blijven.** De metadata zelf is grotendeels
solide (36/55 OK, 2 veld-verwijderingen, 0 structurele fouten) en de twee velden met het
grootste generalisatie-risico (`profile`, `relatedSupplementId`) hebben vandaag **geen enkele
renderende consumer** — het risico is latent, niet acuut. De acute problemen zitten niet in
Wave 5 maar in de **oudere copy-laag** eronder.

Top-3 risico's (alle P0, geen ervan door Wave 5 geïntroduceerd):

1. **`SIGNAL_COPY.melatonine_signal` is feitelijk omgekeerd aan de engine.** Copy zegt
   "terwijl je stress hoog blijft"; de trigger (`SLP_ONSET <= 2 && STR_FREQ >= 3`,
   `intake-engine.ts:202`) vuurt juist bij **beheersbare** stress (STR_FREQ 3–4 = "zelden/
   soms"). De gebruiker krijgt een claim over zichzelf die zijn eigen antwoorden tegenspreekt.
2. **`PILLAR_CONTEXT_COPY.voeding` ("Je eet zelden vette vis — voeding is je prioriteit")
   kan feitelijk onwaar zijn**: nutrition-prioriteit kan ontstaan door alléén lage NUT_PROT
   terwijl NUT_O3 = 3 ("2x per week of vaker"). Zelfde patroon bij `slaap` ("Je valt laat in
   en slaapt onrustig") en `PROFILE_COPY["Lage Batterij"]` ("Je energiecurve zakt sneller dan
   je lichaam bijhoudt" — kan getriggerd zijn door alleen movement_score < 35).
3. **`creatine_signal` heeft een tak die zonder trainingsbelasting vuurt** (`recoveryPrimary`,
   `intake-engine.ts:196-199`): herstel-als-laagste-domein volstaat. Copy én content
   (creatine-en-herstel, overtrainingssyndroom via gapSignal in de hub) veronderstellen
   "je traint regelmatig" — bij een niet-trainer is dat suggestieve generalisatie.

Verder: verbinding is sinds rules 1.3.0 een volwaardig interventiedomein maar heeft **0/55
content-slugs** en alleen een werkstress-proxy in de taxonomy; twee vitaliteit-strings noemen
nog "slaap, stress, voeding en beweging" zonder verbinding.

---

## 2. Epistemische ladder (§1)

```
Laag 0  Vraag-antwoord (self-report)
        │  Wat je mag zeggen: "Je gaf aan …" — letterlijke restatement van het antwoord.
        │  16 items, 1–4 schalen; geen meting, geen duur-item voor slaap.
        ▼
Laag 1  Domeinscore (0–100, calcDomainScores)
        │  "X scoort laag/gemiddeld/sterk in jouw antwoorden." Genormaliseerde som,
        │  géén gevalideerde klinische schaal. Herstel = 1 item ({33,67,100}),
        │  verbinding = 1 item ({25,50,75,100}) — grove signalen, geen precisiematen.
        ▼
Laag 2  Deficiency signal (boolean, getDeficiencySignals)
        │  "Dit patroon in je antwoorden past bij …" Regelmatige drempellogica;
        │  een signal is een routerings-beslissing, geen vaststelling over het lichaam.
        │  Inname-inschatting mag ("krijgt waarschijnlijk te weinig binnen"),
        │  statusclaim niet ("hebt een tekort") — COMPLIANCE.md.
        ▼
Laag 3  Profiellabel (getProfileLabel — marketing-archetype)
        │  "Je startprofiel is X" = herkenningslabel over de scores, nooit over de persoon.
        │  Eén drempel (bv. sleep_score < 40) draagt het label; copy mag dus alleen
        │  claimen wat die drempel zelf zegt.
        ▼
Laag 4  CONTENT_METADATA (content-tag, statisch)
        │  Tag betekent "relevant WHEN signal/profile true" — de content bewijst het
        │  signal niet, en de tag mag nooit in de content-tekst zelf doorsijpelen
        │  als "dit speelt bij jou".
        ▼
Laag 5  Category insightSlug (evidence-link)
        │  "Bij deze vraag hoort deze uitleg." Vereist minstens één directe
        │  evidence-koppeling; thematische proxies expliciet markeren.
        ▼
Laag 6  UI-copy ("Speelt voor jou nu", Q1-hero, fase-regel)
           Alleen hier komt personalisatie en alleen uit user-context (cookie + answers),
           nooit uit de statische tag. Referentie-formules: "laag in jouw antwoorden"
           (score-bands.ts:42), "Op basis van je laatste check-in — niet je clicks"
           (inzichten/page.tsx:125), "Datapunt op basis van je antwoorden — geen diagnose"
           (results-reveal-copy.ts:5).
```

Elke laag omhoog verliest informatie en wint retoriek. De regel die alles samenvat:
**copy op laag N mag alleen beweren wat laag N-1 daadwerkelijk vastlegt.** De drie P0's
hierboven zijn precies plekken waar copy op laag 2–3 méér beweert dan laag 0–1 draagt.

---

## 3. Metadata-audit — alle 55 slugs (§2)

Consumers vandaag actief: `gapSignal` (hub-herordening, `inzichten/page.tsx:99-107`),
`planPhase` (`InsightPhaseNote` op blog `BlogArticlePage.tsx:254` en kennisbank
`kennisbank/[slug]/page.tsx:299`), `theme` (validatie + THEME_CONTENT_MAP-naad).
**`profile` en `relatedSupplementId` hebben géén renderende consumer** (grep bevestigd:
alleen normalizer, types en tests) — dormant, dus beoordeeld op toekomstig risico.

| slug | theme | gapSignal | profile | planPhase | relSuppId | Oordeel | Probleem | Fix |
|---|---|---|---|---|---|---|---|---|
| ademhaling-tegen-stress | stress | — | — | 1 | — | OK | | |
| alcohol-slaap-energie-na-40 | sleep | — | — | — | — | OK | | |
| ashwagandha-werking-mannen | stress | cortisol_risk | Stressdrager | — | — | NUANCEER | gapSignal duwt on-hold-botanical-content vooraan bij gestresste users | Behouden mits artikel de EFSA-on-hold-disclaimer prominent houdt; profile-tag pas activeren na herziening |
| beste-magnesium | sleep | magnesium_signal | — | — | magnesium-glycinaat | OK | | |
| beste-omega-3-supplement | nutrition | omega3_deficiency | — | — | omega-3 | OK | | |
| cortisol-en-slaap | sleep | cortisol_risk | — | — | — | OK | | |
| cortisol-en-testosteron | stress | cortisol_risk | — | — | — | NUANCEER | testosteron-hoek zit niet in de cortisol_risk-trigger; mechanistisch artikel, geen engine-link | Acceptabel als relevantie-tag; geen fix nodig |
| cortisol-verlagen-natuurlijk | stress | cortisol_risk | Stressdrager | 1 | — | OK | | |
| creatine-en-herstel | movement | creatine_signal | Overtrainer | — | creatine | NUANCEER | creatine_signal-tak `recoveryPrimary` vuurt zonder training → artikel "voor trainenden" vooraan bij niet-trainer | Engine-tak aanscherpen (P1), tag zelf OK |
| eiwit-na-40 | nutrition | protein_gap_signal | — | — | eiwitpoeder | OK | | |
| eiwitinname-timing-mannen-40 | nutrition | protein_gap_signal | — | — | eiwitpoeder | OK | | |
| energie-verhogen-natuurlijk | movement | energy_dip_unexplained | Lage Batterij | — | — | NUANCEER | theme movement = proxy (geen energy-theme); signal-match is inhoudelijk wél sterk (dip zonder slaap/voeding-verklaring → beweging/daglicht) | Accepteren; theme-proxy documenteren |
| krachttraining-na-40 | movement | — | — | 1 | — | OK | | |
| magnesium-en-slaap | sleep | magnesium_signal | — | — | magnesium-glycinaat | OK | | |
| magnesium-en-slaapkwaliteit | sleep | magnesium_signal | — | 2 | magnesium-glycinaat | OK | fase 2 klopt exact met slaapplan (magnesium-steps in `slp-phase-week-2-4`, `sleep.ts:109-140`) | |
| melatonine-na-40 | sleep | melatonine_signal | — | — | — | NUANCEER | SIGNAL_COPY van dit signal is omgekeerd (zie §6); tag zelf is info-only en OK (forbidden-route heeft geen koop-CTA) | Copy-fix P0 elders; tag behouden |
| melatonine-wanneer-wel-niet | sleep | — | — | — | — | OK | | |
| middagdip-bloedsuiker-na-40 | nutrition | omega3_deficiency | — | — | — | **VERWIJDER VELD** | Causale sprong: "eet zelden vette vis" ⇏ middagdip/bloedsuiker-relevantie; artikel gaat over vezels/eetritme | `gapSignal` verwijderen (taxonomy-links voeding-vezels/-ritme blijven — die zijn wél direct) |
| omega-3-concentratie-energie | nutrition | omega3_deficiency | — | — | omega-3 | NUANCEER | EFSA kent omega-3 géén energie-/vermoeidheidclaim toe; supplement-id + energie-framing is grensgeval | Artikel-check: supplement alleen noemen binnen hart/hersen/ogen-claims; anders relSuppId weg |
| omega-3-en-herstel | movement | omega3_deficiency | — | — | omega-3 | NUANCEER | idem: geen EFSA-herstel-claim voor omega-3 | Artikel-check zoals hierboven |
| slaap-verbeteren-40-plus | sleep | — | Onrustige Slaper | 1 | — | OK | profile dormant; zie systemische noot | |
| slaaphygiene-mannen-40-plus | sleep | — | — | 1 | — | OK | | |
| slaapritme-herstellen | sleep | — | — | 1 | — | OK | | |
| stress-werk-grenzen-stellen | stress | — | Stressdrager | — | — | OK | als stress-content prima; het probleem is de verbinding-proxy in de taxonomy (§4) | |
| supplement-kiezen-waar-op-letten | nutrition | — | — | — | — | OK | | |
| testosteron-en-energie-na-40 | movement | — | — | — | — | NUANCEER | theme movement = proxy voor energie-onderwerp | Accepteren; documenteren |
| vitamine-d-en-energie | nutrition | — | — | — | vitamine-d3 | NUANCEER | EFSA vitamine D: immuun/botten/spieren — géén energieclaim; titel + supplement-id = grensgeval | Artikel-check: vermoeidheid-framing alleen via magnesium of zonder supplementkoppeling |
| vitamine-d-tekort-herkennen | nutrition | — | — | — | vitamine-d3 | NUANCEER | "tekort herkennen" is status-taal (vereist meting); bestaande titel, niet Wave 5 | Artikel-check: "tekort" alleen met bloedonderzoek-verwijzing; overweeg titel bij redactieronde |
| waar-let-je-op-bij-omega-3 | nutrition | omega3_deficiency | — | — | omega-3 | OK | | |
| wat-is-omega-3 | nutrition | omega3_deficiency | — | — | omega-3 | OK | | |
| zink-en-testosteron | nutrition | — | — | — | zink | OK | EFSA-testosteronclaim voor zink bestaat | |
| adaptogens | stress | — | Stressdrager | — | — | OK | profile dormant | |
| adh | nutrition | — | — | — | — | OK | | |
| atp | movement | — | — | — | — | NUANCEER | energie-mechanisme onder movement-theme (pijler = energie) | Accepteren; theme-proxy documenteren |
| biobeschikbaarheid | nutrition | — | — | — | — | OK | | |
| chelaatvorm | nutrition | — | — | — | — | OK | | |
| circadiaan-ritme | sleep | — | — | 1 | — | OK | | |
| cortisol | stress | cortisol_risk | Stressdrager | — | — | OK | | |
| derde-partij-testen | nutrition | — | — | — | — | OK | | |
| efsa-claims | nutrition | — | — | — | — | OK | | |
| eiwitbehoefte-na-40 | nutrition | protein_gap_signal | — | — | eiwitpoeder | OK | | |
| epa-dha | nutrition | omega3_deficiency | — | — | omega-3 | OK | | |
| healthspan | movement | — | — | — | — | NUANCEER | longevity-begrip onder movement | Accepteren |
| hpa-as | stress | cortisol_risk | — | — | — | OK | | |
| insulineresistentie | nutrition | — | — | — | — | OK | | |
| magnesiumvormen | sleep | magnesium_signal | — | — | magnesium-glycinaat | NUANCEER | theme=sleep maar pijler=voeding (via KENNISBANK_THEME supplementwetenschap) — theme/pijler-divergentie | theme naar nutrition, óf divergentie bewust laten en documenteren |
| melatonine | sleep | melatonine_signal | — | — | — | OK | copy-fix van het signal dekt ook deze tag | |
| mitochondrien | movement | — | — | — | — | NUANCEER | energie-mechanisme onder movement | Accepteren |
| nervus-vagus | stress | — | — | 1 | — | OK | | |
| overtrainingssyndroom | movement | creatine_signal | Overtrainer | — | — | NUANCEER | zie §10 vraag 2: dormant profile = geen acuut risico; creatine_signal-tak wel | Engine-tak aanscherpen; profile-veld pas activeren met betere trigger |
| oxidatieve-stress | movement | — | — | — | omega-3 | **VERWIJDER VELD** | relSuppId koppelt omega-3 aan antioxidant-context; EFSA kent omega-3 geen antioxidantclaim toe — impliciete claim-associatie zodra veld ooit rendert | `relatedSupplementId` verwijderen |
| slaaphygiene | sleep | — | — | 1 | — | OK | | |
| slaapschuld | sleep | sleep_issue_no_stress | — | — | — | NUANCEER | zie §10 vraag 3: proxy (check meet geen slaapduur; SOL ≠ slaapschuld) | Behouden als relevantie-tag; geen bewijs-framing in content-intro |
| testosteron | movement | — | — | — | — | NUANCEER | theme-proxy (pijler = energie) | Accepteren |
| vitamine-d | nutrition | — | — | — | vitamine-d3 | OK | | |

**Telling: 36 OK (65%) · 17 NUANCEER (31%) · 2 VERWIJDER VELD (4%) · 0 HERZIEN-hele-rij.**

Systemische noot bij alle 9 profile-dragende rijen: het veld is vandaag dood. Dat is de
juiste toestand — **activeer het niet zonder eerst de beoordelingsregel af te dwingen**
(statische content mag nooit impliceren dat de lezer dat profiel heeft; alleen user-context
mag profiel-personaliseren). CLAUDE.md-meetregel geldt dan ook: geen dormant veld activeren
zonder meetpunt.

### De 10 riskantste koppelingen (gesorteerd op acute impact)

1. `SIGNAL_COPY.melatonine_signal` — feitelijk omgekeerd aan de trigger (P0, copy).
2. `PILLAR_CONTEXT_COPY.voeding` — kan onware bewering renderen ("zelden vette vis" bij NUT_O3=3) (P0, copy).
3. `PROFILE_COPY["Lage Batterij"]` — energiecurve-claim bij mogelijk puur movement-trigger (P0, copy).
4. `cortisol_risk`-copy claimt hersteltijd ("uitrusten kost je merkbaar meer tijd") terwijl STR_RCV niet in de trigger zit (P0, copy).
5. `creatine_signal` `recoveryPrimary`-tak → creatine/OTS-content vooraan bij niet-trainers (P1, engine).
6. middagdip-bloedsuiker ← `omega3_deficiency` — causale sprong met actieve consumer (hub-sort) (P0, metadata).
7. oxidatieve-stress ← `relatedSupplementId: omega-3` — claim-associatie, nu dormant (P1, metadata).
8. verbinding-steun → stress-werk-grenzen-stellen als enige evidence-link (P1, taxonomy).
9. omega-3/vitamine-D energie- en herstel-getitelde artikelen mét supplement-id — EFSA-grens (P1, redactie-check).
10. melatonine-na-40 als éérste slug in categorie slaap-inslapen — leefstijl-eerst-inversie t.o.v. de engine (die ritme/licht vóór melatonine-info zet) (P2, taxonomy-ordening).

---

## 4. Taxonomy-matrix — 14 gevulde categorieën (§3)

Evidence-grade: A = directe koppeling vraag↔content↔literatuur · B = mechanistisch/indirect
maar verdedigbaar · C = thematische proxy.

| categoryId | questionId | insightSlugs | Grade | Toelichting |
|---|---|---|---|---|
| slaap-inslapen | SLP_ONSET | melatonine-na-40, circadiaan-ritme | B | Circadiaan-ritme is de A-link; melatonine-na-40 als eerste positie inverteert leefstijl-eerst — **volgorde omdraaien** |
| slaap-doorslapen | SLP_WAKE | magnesium-en-slaap, cortisol-en-slaap | B | magnesium_signal bevat SLP_WAKE<=2, dus engine-aligned; magnesium→doorslapen-evidence zelf is matig (EFSA-claims zijn niet slaapspecifiek) |
| slaap-ritme | SLP_CONS | slaapritme-herstellen, circadiaan-ritme, melatonine | A | Sterkste categorie: gedrag→gedragscontent |
| slaap-kwaliteit | SLP_QUAL | magnesium-en-slaapkwaliteit, slaapschuld | B | slaapschuld = duur-construct terwijl SLP_QUAL kwaliteit meet; acceptabel als verdieping |
| stress-belasting | STR_FREQ | cortisol-verlagen-natuurlijk, hpa-as | B | Mechanisme-uitleg past bij frequentie-item |
| stress-herstelmomenten | STR_RCV | ademhaling-tegen-stress, nervus-vagus | A | Ademhalingsinterventies: meta-analytisch onderbouwd (stressRefs) |
| stress-ademhaling | — (none) | ademhaling-tegen-stress | A | Direct |
| verbinding-steun | CON_SOC | stress-werk-grenzen-stellen | **C** | **Zwakste link van het systeem.** CON_SOC meet sociale steun (partner/vrienden/familie); het artikel gaat over professioneel grenzen stellen. Werkrelaties ≠ terugvalbasis. Enige link bovendien |
| voeding-eiwit | NUT_PROT | eiwitbehoefte-na-40, eiwit-na-40 | A | Direct, sterkste refs (EFSA DRV protein) |
| voeding-vetzuren | NUT_O3 | wat-is-omega-3, epa-dha | A | Direct |
| voeding-vezels | — (none) | middagdip-bloedsuiker-na-40 | B | Vezels↔glykemische respons is direct genoeg (Reynolds 2019 in nutritionRefs) |
| voeding-ritme | — (none) | middagdip-bloedsuiker-na-40 | B | Eetritme↔middagdip verdedigbaar |
| beweging-kracht | MOV_STR | krachttraining-na-40, creatine-en-herstel | A/B | Krachttraining = A (WHO/Grgic); creatine-en-herstel = B, supplement-context correct als tweede |
| beweging-cardio | MOV_CARD | energie-verhogen-natuurlijk | **C+** | Cardio-vraag → energie-artikel is een proxy; er is geen cardio-specifiek stuk. Acceptabel tijdelijk; cardio-artikel is de structurele fix |

Elke self_report-categorie behalve **verbinding-steun** heeft minstens één A- of B-link.
Verbinding is bovendien het enige interventiedomein met nul eigen content (0/55 slugs theme
`connection`, `THEME_CONTENT_MAP.connection` volledig leeg) — zie §5.

---

## 5. Leefstijlcheck — wetenschappelijke betrouwbaarheid (§4)

**Dragen 16 vragen de 7 domeinscores?** Ja, met twee gedocumenteerde zwaktes: herstel is een
1-item schaal ({33,67,100}) en verbinding een 1-item schaal ({25,50,75,100}). DOMAIN_MODEL.md
benoemt herstel expliciet als "grof signaal, niet precisiemaat" — diezelfde kwalificatie
hoort ook bij verbinding. De evidence-onderbouwing per vraag (`leefstijlcheck-evidence.ts`)
is netjes: consistente structuur, echte referenties (spot-check van de 5 zwakste vragen:
NRG_PATN/NRG_DEP (3★) leunen op gedragsplausibiliteit en dat stáát er ook eerlijk bij;
LIF_SUN's Khalsa 2003 phase-response-curve en Wood 2018 alcohol-thresholds kloppen; CON_SOC's
Holt-Lunstad 2015 is de juiste kernreferentie). De `answerMeaning`-formuleringen zijn
voorbeeldig patroon-taal ("wordt vaker gezien binnen patronen met…"), nergens diagnose.

**Zwakste schakel (laagste evidence × hoogste conversie-impact):** de keten
`RCV_PHYS (1 item) → recovery_score → creatine_signal → creatine-conversie`. Drie versterkers
stapelen: een 1-item-schaal, de `recoveryPrimary`-tak die zonder trainingsbelasting vuurt, en
een supplement-route eraan vast. Tweede plek: NRG_DEP (3★) voedt energy_score → "Lage
Batterij" → supplementroutes, met de rode profielcopy erbovenop.

**Readouts als rapport:** het model is netjes doorgevoerd (urgentie/prioriteit/vitaliteit
alleen op interventiedomeinen, `profile.domain` nooit een readout, METINGEN-hints benoemen
het). Twee copy-strings zijn achtergebleven bij rules 1.2.0: `getVitalityScoreBody` locked-
variant ("Slaap, stress, voeding en beweging — samengebracht in één score",
`vitality-score-copy.ts:61`) en `METINGEN_DOMAINS_HINT` (`vitality-score-copy.ts:107`) —
beide missen verbinding. Feitelijke onjuistheid over de eigen methodiek: P1.

**rules 1.3.0 — verbinding als 5e interventiedomein:** engine ✅, evidence-bestand ✅
(CON_SOC 5★ + refs), maar content/metadata ✗: 0/55 slugs met theme `connection`,
`THEME_CONTENT_MAP.connection` leeg (geen pillarHref, geen profielpagina, geen
knowledgeSlugs), taxonomy heeft alleen de werkstress-proxy. Wie verbinding als prioriteit
krijgt, komt in een lege winkel. Dat is geen compliance-risico (er is géén supplement-hoek
voor verbinding — terecht), maar wel een integriteits-gat in de belofte van de check.

---

## 6. Generalisatie-audit — taalpatroon (§5)

| Familie | Bestanden | Patroon | Score |
|---|---|---|---|
| Score-first | `score-bands.ts`, `results-reveal-copy.ts`, `themes.ts` GENERIC_OPENING, hub-subcopy | "laag in jouw antwoorden", "geen diagnose", "Op basis van je laatste check-in — niet je clicks" | **GROEN** — dit is de referentiestandaard |
| Signal-second-person | `explanation-copy.ts` SIGNAL_COPY | "Je eet zelden…" t/m "Je spanning blijft…" | **ORANJE, 2× ROOD** — zie paren hieronder |
| Metadata-driven UI | `AanpakQ1EiwitHero.tsx`, hub "Speelt voor jou nu", `InsightPhaseNote` | "Uit jouw antwoorden: …" | **GROEN-ORANJE** — gating klopt (NUT_PROT<=2, `aanpak-q1-eiwit.ts`); één randje bij NUT_PROT=1 |
| Profiel-archetype | `explanation-copy.ts` PROFILE_COPY, PILLAR_CONTEXT_COPY, `RevealHeroCard` | "Onrustige Slaper" + hook-zin | **ORANJE, 2× ROOD** |

Per-signal beoordeling van `SIGNAL_COPY` (engine-trigger ernaast gelegd):

| Signal | Copy | Score | Waarom |
|---|---|---|---|
| omega3_deficiency | "Je eet zelden vette vis" | groen | Letterlijke restatement van NUT_O3<=1 |
| sleep_issue_no_stress | "Je slaap hapert terwijl je stress beheersbaar lijkt" | groen | Matcht trigger exact, "lijkt" is correct voorbehoud |
| low_recovery_no_load | "Je herstel blijft achter zonder duidelijke trainingsbelasting" | groen | Matcht trigger; 1-item-basis is de enige nuance |
| magnesium_signal | "Je slaap- of stresspatroon wijst op extra ondersteuning via magnesium" | oranje | "wijst op ondersteuning via X" maakt van een patroon een supplement-behoefte |
| protein_gap_signal | "Je eiwitinname blijft waarschijnlijk achter" | oranje | Inname-inschatting mag (COMPLIANCE), maar antwoord-anker ontbreekt |
| energy_dip_unexplained | "Je energie zakt zonder dat slaap of voeding het verklaart" | oranje | "verklaart" is causale taal; trigger checkt alleen dat die scores ≥50 zijn |
| creatine_signal | "Je traint regelmatig en merkt dat je na inspanning langer moe blijft" | **rood** | `recoveryPrimary`-tak vuurt zonder training → bewering kan onwaar zijn |
| cortisol_risk | "Je spanning blijft lang hangen — ontspannen en uitrusten kosten je merkbaar meer tijd" | **rood** | Trigger = STR_FREQ+SLP_CONS+NRG_PATN; hersteltijd (STR_RCV) zit er niet in — claim zonder databasis |
| melatonine_signal | "Je valt moeilijk in slaap terwijl je stress hoog blijft" | **rood** | Feitelijk omgekeerd: STR_FREQ>=3 = stress juist beheersbaar |

### Voor/na-paren (score-first herschrijvingen)

1. **melatonine_signal** —
   FOUT: "Je valt moeilijk in slaap terwijl je stress hoog blijft"
   GOED: "Inslapen kost je tijd, terwijl stress in jouw antwoorden beheersbaar lijkt"
   (identiek aan de correcte zusje-copy van sleep_issue_no_stress — de triggers zíjn ook identiek, zie §7-noot)

2. **cortisol_risk** —
   FOUT: "Je spanning blijft lang hangen — ontspannen en uitrusten kosten je merkbaar meer tijd"
   GOED: "Je gaf aan vaak gestrest te zijn, met een onregelmatig slaapritme en lage dagenergie — dat patroon vraagt eerst om ritme en herstelmomenten"

3. **creatine_signal** —
   FOUT: "Je traint regelmatig en merkt dat je na inspanning langer moe blijft"
   GOED (twee varianten, engine-tak-afhankelijk): bij movementLoad>=3: "Je traint stevig terwijl herstel laag scoort in jouw antwoorden"; anders: "Herstel kwam laag uit jouw antwoorden"

4. **PROFILE_COPY["Lage Batterij"]** —
   FOUT: "Je energiecurve zakt sneller dan je lichaam bijhoudt" (lichaams-claim; kan puur movement-getriggerd zijn)
   GOED: "Energie of beweging kwam laag uit jouw antwoorden — daar zit je snelste winst"

5. **PILLAR_CONTEXT_COPY.voeding** —
   FOUT: "Je eet zelden vette vis — voeding is je prioriteit" (kan onwaar zijn bij NUT_O3=3)
   GOED: "Voeding kwam in jouw antwoorden het laagst naar voren — daar begin je"
   (zelfde fix voor `.slaap`: "Je valt laat in en slaapt onrustig" → "Slaap kwam in jouw antwoorden het laagst naar voren")

6. **protein_gap_signal** —
   FOUT: "Je eiwitinname blijft waarschijnlijk achter"
   GOED: "Je gaf aan weinig bewust eiwit te eten, terwijl je traint of traag herstelt — eiwit scoort laag in jouw antwoorden"

7. **magnesium_signal** —
   FOUT: "Je slaap- of stresspatroon wijst op extra ondersteuning via magnesium"
   GOED: "Doorslapen of herstelmomenten scoren laag in jouw antwoorden — magnesium past bij dit patroon, ná voeding en ritme"

Kleinere punten: `AanpakQ1EiwitHero` "Uit jouw antwoorden: je eet weinig bewust eiwit" klopt
letterlijk bij NUT_PROT=2 (het ís het antwoordlabel) maar bij NUT_PROT=1 zei de gebruiker
"ik weet het niet / let er niet op" — overweeg "…of je let er niet op" toe te voegen.
`getVitalityScoreCardCopy` heading "Je bent {band}" ("Je bent uit balans") is persoons-taal
waar "Je basis scoort {band}" score-taal zou zijn — P2. `InsightPhaseNote` is generiek
correct: "Hoort bij fase N van het leefstijlplan. Waar sta jij?" claimt niets persoonlijks
en de CTA maakt de brug expliciet via de check.

---

## 7. Conversie-keten traces — 4 domein-paden (§6)

**Slaap** — SLP_WAKE=1 → sleep_score laag → magnesium_signal true → prioriteit slaap →
hub "Speelt voor jou nu" sorteert magnesium-getagde items vooraan → beste-magnesium →
/beste/magnesium. Claim-keten netjes (EFSA-magnesiumclaims correct geciteerd in
`intake-engine.ts` adviesteksten, telkens "na ritme en voeding"). Enige suggestie-punt:
de oranje magnesium_signal-copy (§6 paar 7). **Integriteit: goed.**

**Stress** — STR_FREQ=1, SLP_CONS=1, NRG_PATN=2 → cortisol_risk true → prioriteit stress →
hub zet ashwagandha-werking-mannen + cortisol-artikelen vooraan. Twee zwaktes: de rode
cortisol_risk-copy (claim over hersteltijd zonder databasis) en on-hold-botanical-content
die door personalisatie momentum krijgt. De uitsluitings-nuance in het artikel zelf (moat-
besluit) is precies wat dit acceptabel houdt — bewaken bij redactie. **Integriteit: matig,
copy-fix nodig.**

**Voeding** — NUT_PROT=2, MOV_STR=3 → protein_gap_signal true → AanpakMode toont Q1-hero
"Uit jouw antwoorden: je eet weinig bewust eiwit" → /voeding-na-40 (leefstijl) →
eiwitpoeder-vergelijk alleen als "adv"-voetnoot. Dit is de **best gebouwde keten**: gating
klopt (NUT_PROT<=2 = letterlijk het antwoordlabel), voeding-eerst is visueel afgedwongen,
supplement is expliciet gemarkeerd als advertentie-achtige aanvulling. **Integriteit: sterk —
gebruik dit als sjabloon.**

**Beweging/herstel** — RCV_PHYS=1, MOV_CARD=1 (traint niet) → recovery is laagste domein →
`recoveryPrimary` → creatine_signal true → hub zet creatine-en-herstel en (via herstel-pijler)
overtrainingssyndroom vooraan; SIGNAL_COPY beweert "je traint regelmatig". Hier ontstaat de
scherpste suggestieve generalisatie van het systeem: content en copy over trainenden bij
iemand die aangaf niet te trainen. **Integriteit: zwak — engine-tak aanscherpen (P1).**

Expliciete checks uit de opdracht:
- **Kan één true signal te veel naar voren schuiven?** Beperkt: de sort werkt alleen binnen
  de prioriteits-pijler en is binair (hit/geen hit), stabiel verder op bestaande volgorde
  (`inzichten/page.tsx:101-107`). Maximaal schuiven 3–4 items; geen cascade-risico.
- **Q1-hero vs NUT_PROT-drempel:** aligned (`shouldShowAanpakQ1EiwitHero` = NUT_PROT<=2;
  copy = het antwoordlabel van waarde 2).
- **InsightPhaseNote op SEO-pagina's:** generiek OK; impliceert geen persoonlijke fase-kennis
  en de "Waar sta jij?"-CTA maakt het conditionele karakter expliciet.

Engine-noot bij dit hoofdstuk: `melatonine_signal` en `sleep_issue_no_stress` hebben exact
dezelfde trigger (`intake-engine.ts:202` vs `:388`). Dat is gedocumenteerd (INTAKE_SYSTEM.md)
maar betekent dat twee verschillende copy-regels op één patroon kunnen renderen — na de
copy-fix zijn ze in elk geval consistent; overweeg op termijn één signal met twee consumers.

---

## 8. Betrouwbaarheidsscorecard (§7)

| Dimensie | Score 1–5 | Toelichting |
|---|---|---|
| Wetenschappelijke onderbouwing vragen | **4** | Eerlijke sterren, echte refs, patroon-taal in answerMeaning; 1-item-schalen herstel/verbinding drukken de score |
| Score/signal logica (engine) | **3** | Kern solide en gedocumenteerd; creatine_signal-recoveryPrimary-tak en melatonine≡K2-duplicaat zijn de missers |
| Metadata-engine alignment | **4** | 55/55 valide tegen types/tests; 2 veld-verwijderingen; gapSignal-tags op 1 na engine-consistent |
| Category evidence-links | **3** | 12/14 A of B; verbinding-proxy en cardio-proxy; melatonine-eerst-ordening |
| Copy: niet-generaliserend | **3** | Score-first-laag is voorbeeldig; SIGNAL/PROFILE/PILLAR-laag heeft 4 rode regels waarvan 1 feitelijk omgekeerd |
| Conversie-keten integriteit | **4** | Voeding-keten is sjabloonwaardig; leefstijl-eerst structureel afgedwongen; 1 zwak pad (beweging/herstel) |
| Consumentenbond-positionering (inname vs status) | **4** | Inname-vs-status-regel wordt vrijwel overal gerespecteerd; "tekort herkennen"-titel en supplement-ids op energie-content zijn de randjes |

---

## 9. Antwoord op Dennis' 5 steekproef-vragen (§E)

1. **magnesium-en-slaapkwaliteit — planPhase 2 + magnesium_signal: klopt de koppeling?**
   **Ja.** Het slaapplan introduceert magnesium precies in fase 2 (`slp-magnesium-voeding` en
   `slp-magnesium-vergelijk` in `slp-phase-week-2-4`, beide `showWhen: magnesium_signal`,
   `lifestyle-plans/sleep.ts:109-140`). Metadata, engine en plan zeggen hier hetzelfde. Dit
   is de netste koppeling van de batch.

2. **overtrainingssyndroom — profile Overtrainer + creatine_signal: te sterk archetype op
   statische content?** **Nee — zolang `profile` dormant blijft; ja zodra het activeert.**
   Het profile-veld heeft geen renderende consumer, dus vandaag is er geen archetype-effect.
   Het reële probleem is `creatine_signal`: de `recoveryPrimary`-tak laat het OTS-artikel in
   de hub vooraan komen bij iemand die niet traint. Fix in de engine (tak beperken tot
   movementLoad>=2 of een apart `overtrainer_pattern`-signaal), niet in de metadata.

3. **slaapschuld — sleep_issue_no_stress: logisch en evidence-based?** **Logisch als
   relevantie-tag, niet evidence-direct.** De check meet geen slaapduur (er is geen
   SLP_DUR-item), en slaapschuld is een duur-construct terwijl de trigger op inslaap-latentie
   zit. Onder de regel "tag = relevant WHEN signal true" is dit acceptabel (slaap-verdieping
   zonder supplement-hoek voor iemand met slaapklacht-zonder-stressverklaring). Behouden,
   maar de content-intro mag nooit suggereren dat de check slaapschuld heeft vastgesteld.

4. **verbinding-steun → stress-werk-grenzen-stellen: acceptabele proxy of misleidend?**
   **Als enige link: misleidend.** CON_SOC vraagt naar mensen "bij wie je echt jezelf kunt
   zijn en op wie je kunt terugvallen"; het artikel gaat over professioneel grenzen stellen
   zonder je carrière te schaden. Dat zijn verschillende constructen (steun ontvangen vs
   belasting begrenzen). De evidence-basis voor verbinding bestaat al in het eigen
   evidence-bestand (socialConnectionRefs: Holt-Lunstad, Santini, Umberson) — er is alleen
   geen content die erop staat. P1: één verbinding-artikel schrijven (geen supplement-hoek
   nodig — juist een kans voor de Consumentenbond-positionering) en de proxy degraderen tot
   tweede positie of verwijderen.

5. **planPhase-spreiding — te veel fase-1 op slaap?** **Ja, de spreiding is scheef: 10× fase
   1, 1× fase 2, 0× fase 3** (slaap: 5× fase 1 + 1× fase 2). Functioneel is het risico klein
   (InsightPhaseNote is generiek), maar de fase-regel verliest onderscheidend vermogen als
   bijna alles "fase 1" zegt. P2: fase 2/3-kandidaten taggen waar het plan dat draagt (bv.
   magnesium-en-slaap → 2, creatine-en-herstel → 2, hermeting-gerelateerde content → 3) —
   alleen waar de plan-fase het aantoonbaar dekt, niet om de verdeling mooi te maken.

---

## 10. Aanbevelingen geprioriteerd

### P0 — compliance / feitelijk onjuist / generaliserend (één datawijziging + copy-fixes)

1. `src/data/explanation-copy.ts` — vier regels herschrijven naar score-first (§6 paren
   1, 2, 3, 4): `SIGNAL_COPY.melatonine_signal` (omgekeerd), `SIGNAL_COPY.cortisol_risk`
   (hersteltijd-claim zonder databasis), `SIGNAL_COPY.creatine_signal` (trainings-aanname),
   `PROFILE_COPY["Lage Batterij"]` (lichaams-claim).
2. `src/data/explanation-copy.ts` — `PILLAR_CONTEXT_COPY.voeding` en `.slaap` vervangen door
   de prioriteit-formule (§6 paar 5); deze twee kunnen aantoonbaar onware zinnen renderen.
3. `src/data/insight-metadata.ts` — `gapSignal` verwijderen bij `middagdip-bloedsuiker-na-40`
   en `relatedSupplementId` verwijderen bij `oxidatieve-stress`.
4. `src/lib/vitality-score-copy.ts` — verbinding toevoegen aan de locked-body-string (regel
   61) en `METINGEN_DOMAINS_HINT` (regel 107): feitelijke drift t.o.v. rules 1.3.0.

### P1 — evidence zwak maar niet gevaarlijk

5. Engine: `creatine_signal` — `recoveryPrimary`-tak beperken tot `movementLoad >= 2`, of
   splitsen in `overtrainer_pattern` (training+herstel) en `low_recovery` (alleen herstel)
   met eigen copy. RULES_VERSION-bump + changelog-regel vereist.
6. Verbinding-content: één artikel/kennisbank-begrip op CON_SOC-evidence; daarna
   `verbinding-steun.insightSlugs` en `THEME_CONTENT_MAP.connection` vullen.
7. Redactie-check (geen metadata-wijziging): omega-3-concentratie-energie, omega-3-en-herstel,
   vitamine-d-en-energie, vitamine-d-tekort-herkennen — supplementverwijzingen binnen
   EFSA-claimgrenzen houden; "tekort herkennen" alleen met bloedonderzoek-kader.
8. Taxonomy-ordening slaap-inslapen: circadiaan-ritme vóór melatonine-na-40 (leefstijl-eerst
   ook in de linkvolgorde).

### P2 — structuur / conventie

9. Tagging-conventie vastleggen in een doc-comment op `ContentMetadata` (drie regels):
   (a) `gapSignal` alleen bij een directe engine-inhoud-link, geen thematische buren;
   (b) `profile` en `relatedSupplementId` zijn dormant — activering vereist review + meetpunt;
   (c) theme-proxies (energie→movement) zijn bewust, pijler ≠ theme is toegestaan.
10. planPhase-spreiding aanvullen waar het plan het draagt (§9 vraag 5).
11. "Je bent {band}" → "Je basis scoort {band}" in `getVitalityScoreCardCopy`; Q1-hero-zin
    uitbreiden met "…of je let er niet op" voor het NUT_PROT=1-geval.
12. Overweeg `melatonine_signal`/`sleep_issue_no_stress` samen te voegen tot één signal met
    twee consumers (identieke triggers) bij de volgende RULES_VERSION-bump.

---

## 11. Cursor-prompt-skelet (P0-bundel, max 1 — copy + metadata, geen engine)

```text
## Rol
Je bent Next.js/TypeScript developer voor PerfectSupplement (perfectsupplement.nl).

## Context
Lees vóór je begint:
- docs/cursors/fable-leefstijlcheck-metadata-evidence-audit-2026-07.md (§6 voor/na-paren, §10 P0)
- docs/core/COMPLIANCE.md (inname vs status) en src/lib/score-bands.ts (referentie-toon)
- Te wijzigen bestanden (exact 3):
  - src/data/explanation-copy.ts — SIGNAL_COPY (melatonine_signal, cortisol_risk,
    creatine_signal), PROFILE_COPY["Lage Batterij"], PILLAR_CONTEXT_COPY (voeding, slaap)
  - src/data/insight-metadata.ts — 2 veld-verwijderingen
  - src/lib/vitality-score-copy.ts — 2 strings verbinding toevoegen
- ALLEEN LEZEN: src/lib/intake-engine.ts (triggers), src/lib/recommendation-explainer.ts
  (consumer van de copy), src/components/intake/RevealHeroCard.tsx

## Taak
1. explanation-copy.ts: vervang de zes copy-regels door de score-first varianten uit
   audit-§6 (paren 1 t/m 5, letterlijk overnemen).
2. insight-metadata.ts: verwijder `gapSignal: "omega3_deficiency"` bij
   "middagdip-bloedsuiker-na-40" en `relatedSupplementId: "omega-3"` bij "oxidatieve-stress".
   Raak verder geen enkele entry aan.
3. vitality-score-copy.ts: voeg verbinding toe in de locked-body (regel ±61) en in
   METINGEN_DOMAINS_HINT (regel ±107), conform rules_version 1.3.0.

Privacy/meten: copy- en data-only — geen nieuwe events; bestaande metingen (hub-sort,
fase-regel, reveal) blijven ongewijzigd doorlopen.

## Constraints
- GEEN wijzigingen aan src/lib/intake-engine.ts (RULES_VERSION-bump is een aparte P1-taak)
- Geen wijzigingen aan componenten, routes, tests of andere data-bestanden
- Nederlandse UI strings, Engelse variabelen; EFSA-teksten elders letterlijk laten staan
- Geen git commands, geen commit

## Acceptatiecriterium
- [ ] Geen enkele SIGNAL_COPY/PROFILE_COPY/PILLAR_CONTEXT_COPY-regel beweert iets dat de
      bijbehorende trigger niet meet (check tegen intake-engine.ts getSignals/getProfileLabel)
- [ ] middagdip-bloedsuiker-na-40 heeft geen gapSignal; oxidatieve-stress geen relatedSupplementId
- [ ] Beide vitaliteit-strings noemen vijf interventiedomeinen incl. verbinding
- [ ] Diff raakt uitsluitend de 3 genoemde bestanden
- [ ] grep -rn "console.log" src/ → leeg; npx tsc --noEmit groen; vitest groen
      (insight-metadata.test.ts blijft slagen — de verwijderde velden zijn optioneel)

Niet automatisch committen. Stop na de aanpassingen zodat ik kan reviewen.
```

---

## 30-dagen meetnotitie

- Hub-sort: `inzichten_focus_viewed` en content-clicks vanuit "Speelt voor jou nu" per
  pijler — verwacht geen zichtbare knik van de middagdip-tagverwijdering (item zakt alleen
  terug naar chronologische positie binnen de voeding/energie-lijst).
- Reveal: feedback-rating ("Herken je jezelf in dit overzicht?") vóór/na de copy-fixes —
  dit is de directe graadmeter voor de generalisatie-herschrijvingen.
- AanpakMode: `approach_q1_eiwit`-CTR als benchmark voor de score-first-stijl (de best
  presterende keten is ook de meest feitelijke — dat argument wil je met data hard maken).

---

*Opgesteld: 5 juli 2026 (Fable-sessie evidence-audit). Geen code gewijzigd, geen commits.*
