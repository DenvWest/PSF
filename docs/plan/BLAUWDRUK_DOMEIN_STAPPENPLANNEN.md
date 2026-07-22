# Domein-stappenplannen — de gedeelde arc over alle domeinen (blauwdruk)

> **Status (22 jul 2026): content-/systeem-blauwdruk. Geen code.** Legt vast hoe elk domein dezelfde professionele arc krijgt — *Hier begon je → Wat & waarom → Future You → opbouw in fases* — zodat de domein-agnostische shell ([`PLAN_COCKPIT_SLICE1_DOMEIN_AGNOSTISCH.md`](PLAN_COCKPIT_SLICE1_DOMEIN_AGNOSTISCH.md)) per domein alleen nog **content** hoeft te krijgen, geen nieuwe UI.
> **Verankerd tegen `main`**: domein-rollen en drivers komen 1:1 uit `src/lib/domain-role.ts`; de fase-titels uit de bestaande `src/data/lifestyle-plans/*.ts`.

## 1. Het gedeelde arc-contract

Elk **interventiedomein** krijgt dezelfde vier lagen — dit is de motor die één keer wordt gebouwd en per domein met content wordt gevuld:

1. **Hier begon je (0-punt)** — de nulmeting: domeinscore bij start + de intake-antwoorden + eerste beperkingen. Permanent referentiepunt (zie besturingssysteem-doc §4).
2. **Wat & waarom (het anker)** — de zelfgekozen diepere motivatie. Kleurt elke "waarom deze stap".
3. **Future You** — het concrete toekomstbeeld waar het domein naartoe bouwt (geen abstract "beter").
4. **De opbouw (route in fases)** — de progressie. Alle vier de templates delen al dezelfde horizon-structuur: **`deze-week` → `week-2-4` → `week-4-12`**.

## 2. De domeinen, naar rol (uit `domain-role.ts`)

| Domein | Rol | Plan-template? | Krijgt de volle arc? |
|---|---|---|---|
| **Beweging** | interventie | ✅ `movement.ts` | ✅ referentie (bestaat) |
| **Slaap** | interventie | ✅ `sleep.ts` | ✅ |
| **Stress** | interventie | ✅ `stress.ts` | ✅ |
| **Voeding** | interventie | ✅ `nutrition.ts` | ✅ |
| **Verbinding** | interventie | ❌ geen template | ⚠️ lichtere arc (anker + richting, geen 12-weken-opbouw) — aparte productbeslissing |
| **Energie** | **readout** | ❌ | ❌ geen plan — is een *uitkomst* (§4) |
| **Herstel** | **readout** | ❌ | ❌ geen plan — uitkomst **én** moderator (§4) |

## 3. De arc per interventiedomein

Fase-titels hieronder = de **echte** template-titels (grounded). Ankers voor slaap/stress/voeding zijn **voorstellen** (nieuw content-werk; beweging heeft ze al in `MOVEMENT_ANCHOR_OPTIONS`). Copy is illustratief, geen eindtekst (§6).

### 3.1 Beweging — *referentie, bestaat*
- **0-punt:** beweegscore + `MOVEMENT_QUESTIONS` (kracht/conditie/pijn/…).
- **Ankers (bestaan):** zelfstandigheid · meedoen · energie · kracht.
- **Future You:** "op je 75e nog zelf opstaan uit een lage stoel; de trap zonder na te denken."
- **Opbouw:** Deze week: kies je focus → Week 2–4: structureel krachttrainen → Week 4–12: verankeren & meten.
- **Herstel-moderator:** `RCV_FEEL`/recovery-hint (bestaat).

### 3.2 Slaap — `sleep.ts`
- **0-punt:** slaapscore + slaap-intake (inslaap-/doorslaap-/ochtendhelderheid).
- **Ankers (voorstel):** uitgerust wakker worden · 's nachts doorslapen · 's avonds tot rust komen · overdag helder blijven.
- **Future You:** "je wordt wakker vóór de wekker, uitgerust — geen middagdip meer."
- **Opbouw (echt):** Deze week: drie snelle winst (vast bedtijd · koele donkere kamer · niet laat eten) → Week 2–4: ritme bouwen → Week 4–12: verankeren & meten.
- **Driver van:** herstel én energie (§4).

### 3.3 Stress — `stress.ts`
- **0-punt:** stressscore + stress-intake (spanning/piekeren/ontladen).
- **Ankers (voorstel):** 's avonds kunnen uitschakelen · minder kort lontje · rustiger onder druk · opladen i.p.v. leeglopen.
- **Future You:** "je laadt op in plaats van leeg te lopen; druk raakt je minder."
- **Opbouw (echt):** Deze week: drie snelle winst → Week 2–4: grenzen en ritme verankeren → Week 4–12: verankeren & meten.
- **Driver van:** herstel (§4).

### 3.4 Voeding — `nutrition.ts`
- **0-punt:** voeding-band (eiwit/timing/vette vis) + voeding-intake.
- **Ankers (voorstel):** genoeg eiwit voor spierbehoud · stabiele energie zonder dips · sterker herstel · makkelijker op gewicht.
- **Future You:** "je bouwt spier in plaats van 'm te verliezen; energie zonder de namiddag-dip."
- **Opbouw (echt):** Deze week: eiwit als anker → Week 2–4: inzicht in je patroon → Week 4–12: aanvullen waar nodig.
- **Driver van:** energie (§4). *NB: voeding heeft "anker" al letterlijk in de fasetitel — mooie aansluiting.*

### 3.5 Verbinding — *interventie zónder template*
- Rol = interventie, maar er is (nog) geen `lifestyle-plan`. Aanbeveling: **lichtere arc** — anker + richting + 1–2 kleine acties, géén 12-weken-opbouw tot er een evidence-onderbouwd template is. Aparte productbeslissing; niet meenemen in de eerste content-uitrol.

## 4. Energie & herstel — hoe ze worden *ondersteund* (geen eigen plan)

Beide zijn readouts. Ze krijgen geen stappenplan; ze worden opgetild door de interventiedomeinen. Uit `READOUT_DRIVERS`:

```
energie  ← slaap · voeding · beweging
herstel  ← slaap · beweging · stress
```

- **Energie** = de gecombineerde **opbrengst**. Het "Future You" voor energie ("aan het eind van de dag nog energie over") is niet toevallig ook een *beweeg-anker* — dat toont de cross-domein-koppeling. Zichtbaar op het Kompas-overzicht (§5), niet als los plan.
- **Herstel** = opbrengst **én limiterende moderator**. De recovery-hint die beweging nu al heeft (dagkeuze verzachten bij zwaar herstel) **generaliseert naar elk domein**: herstel schroeft nooit op boven wat het lichaam toelaat — in slaap, stress en voeding net zo goed. Dit is de "energie en herstel ondersteunen"-belofte, concreet.

> **Ontwerpregel:** een readout krijgt nooit een eigen check-off of een eigen 12-weken-plan. Het toont zijn drivers ("werk aan je slaap → je herstel volgt") en zijn trend. Dat voorkomt een verzonnen tweede stuurlaag.

## 5. Kompas-overzicht — "Future You in álle domeinen"

De cross-domein arc leeft op het **Kompas-niveau** (Dashboard → Kompas → domein). Daar zie je:
- per interventiedomein: **0-punt · nu · Future You** naast elkaar (dezelfde arc, compact);
- energie + herstel als de **gecombineerde bestemming** (vitaliteit) die meebeweegt als de plannen lopen;
- de doorway naar elke domein-cockpit voor de details.

Zo is er één plek waar iemand ziet *waar hij in álles begon, wat hij wil veranderen, en wie hij wordt* — zonder vier losse plannen naast elkaar te hoeven lezen. De opbouw (route in fases) blijft per domein; de richting (Future You) wordt cross-domein zichtbaar.

## 6. Copy-discipline (belangrijk — content is niet vrij)

Ankers, Future-You-beelden en fase-copy per domein zijn **content-werk met regels**, geen vrije tekst:
- **Feit-eerst, wetenschappelijk verankerd** (bron/mechanisme vóór actie) — zoals de bestaande leefstijlcheck-copy.
- Langs de **evidence-audit** (geen omgekeerde of te stellige claims) en de **WRITING_VOICE** (begrip → urgentie → actie, geen diagnose-taal).
- **Varianten voorleggen** bij anker-/copy-keuzes i.p.v. eenzijdig invullen.

## 7. Wat generaliseert gratis vs. wat content-werk is

| Gratis (domein-agnostische shell/lib — bouw één keer) | Content-werk per domein |
|---|---|
| `CockpitShell`, `CockpitHeader`, `ContextInspector` | Anker-set (data) — nu alleen `MOVEMENT_ANCHOR_OPTIONS` |
| "Jouw route" waypoint-component | Future-You-copy per domein |
| betekenis-motor (pure lib) | Route-fase-labels / optionele identiteitsnamen |
| recovery-moderator (generaliseren van beweging) | 0-punt-view-copy per domein |
| Kompas-overzicht-frame | (evt.) `domain-prefs` als generalisatie van `movement-prefs` (anker per domein in answers-jsonb) |

> **Kernpunt:** de dure UI/architectuur bouw je één keer domein-agnostisch (slices 1–5). Daarna is elk nieuw domein een kleine, voorspelbare **content-slice** — plan-template (bestaat al voor slaap/stress/voeding), anker-set, Future-You-copy — die de bestaande shell erft. Geen vierde cockpit bouwen; vier keer dezelfde cockpit vullen.

## 8. Invarianten (blijven overal gelden)

Uit besturingssysteem §14.2, per domein: **één check-off** (de dagstap van dat domein), **één score** (engine, verandert bij hermeting), **dagstap gratis**, **geen gamification**. Readouts (energie/herstel) hebben géén check-off en géén eigen plan. Herstel is de limiterende laag in álle domeinen.
