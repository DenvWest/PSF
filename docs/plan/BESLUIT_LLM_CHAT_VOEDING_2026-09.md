# Besluit — een chatvenster met LLM op de check en het dagboek

**Datum:** 25 september 2026
**Status:** **richting besloten** (Dennis). Bouwen mag achter een vlag en met synthetische invoer. **Live met echte gebruikers pas als V1–V6 (§3) rond zijn.**
**Aanleiding:** Dennis, 25 sep: *"Ik weet dat eerder gezegd werd dat het niet nodig is, dat het met rules, aanbeveling van vragenlijst niet nodig is, maar ik wil met de toekomst meegaan, is het mogelijk een chatvenster en een LLM op vragenlijst-voedingsdagboek te creeren?"*
**Herziet:** `ARCHITECTUUR_CONVERSATIONELE_VOEDINGSINVOER_2026-09.md` §0 (C1), §6.3 en §13 · voor één doel ook `docs/core/INTAKE_SYSTEM.md` ("geen AI/ML tot 500+"), `PLAN_MEASUREMENT_PERSONALIZATION.md` §F en `PLAN_NURTURE_MULTIPRODUCT_DATA_READINESS.md` DEEL 3 (zie §2)
**Bouwt op:** `BESLUITDOCUMENT_SESSIE_ARCHITECTUUR_2026-09.md` (de sessie is het anker voor de anonieme chat)

---

## 1. Wat besloten is

Er komt een chatvenster met een LLM op twee plekken:

1. **Op de check (`/intake`)** — de vragen van de check als gesprek, in plaats van (of naast) de schuifjes.
2. **In het dagboek** — vertellen wat je at, in plaats van zoeken en porties kiezen.

De rolverdeling uit de architectuur (§2.1 daar) blijft de kern:

> **De LLM is tolk en gesprekspartner. Hij vult alleen invoervelden die al bestaan** (de antwoorden van de check; de items in het dagboek). **Elk getal over voeding, elke score, elk advies en elke supplementroute komt uit de bestaande deterministische code.**

## 2. Wat dit vervangt, en wat blijft staan

| Eerder besluit | Na vandaag |
|---|---|
| "Regelgebaseerd, geen AI/ML tot 500+ gebruikers" (`INTAKE_SYSTEM.md`) | **Blijft** voor de engine: scoring, triggers, profielen, selectie. **Geldt niet** voor een LLM die per verzoek de eigen invoer van één gebruiker vertaalt naar bestaande invoervelden. |
| "Geen LLM op persoonsdata vóór 500+ én vóór G1–G7" (`PLAN_NURTURE…` DEEL 3) | **Blijft** voor aggregatie, modelverbetering en training (k-anonimiteit, drempel). Voor interpretatie per verzoek gelden in plaats daarvan V1–V6. |
| Architectuur §6.3/§13: "LLM pas na trigger" | **Vervallen.** De volgorde staat in §5. |

**Blijft onverkort staan:**

- Geen kcal- of macroteller (C2).
- Een som in het dagboek is een ondergrens (C3).
- Het 2+2-venster (C4).
- De claimgrens: EFSA-tekst alleen uit `approved-claims.ts`, en `FORBIDDEN_PHRASES_GLOBAL` op alles wat het model schrijft.
- Geen training op gebruikersdata.
- Geen diagnose-taal (`WRITING_VOICE.md`).

## 3. Voorwaarden vóór live met echte gebruikers (V1–V6)

| # | Voorwaarde | Waarom | Wie |
|---|---|---|---|
| **V1** | **Verwerker en regio kiezen.** *Aanbeveling:* Claude via een **EU-regio** (Google Vertex AI of Amazon Bedrock), zodat "gezondheidsgegevens blijven in de EU" (`VERWERKINGSREGISTER.md`) waar blijft. Alternatief: de Anthropic API rechtstreeks. Die kent `inference_geo` alleen als `"us"` of `"global"`, dus dat is een doorgifte buiten de EU, met gevolgen voor het register en de privacyverklaring. | Vrije tekst over eten is een art. 9-gegeven; vandaag verlaat geen enkel art. 9-gegeven de EU | Dennis |
| **V2** | Verwerkersovereenkomst plus de voorwaarden over bewaren en trainen van de gekozen verwerker, vastgelegd in het privacy-archief | AVG art. 28 | Dennis |
| **V3** | Juridische toets: dekt uitdrukkelijke toestemming (art. 9 lid 2 sub a) dit doel met een eigen tekst? | Nieuw verwerkingsdoel | Dennis + jurist |
| **V4** | DPIA-aanvulling (nieuw risico: vrije tekst naar een externe verwerker), verwerkingsregister, privacyverklaring | Art. 35, art. 30 | Claude schrijft een concept, Dennis en de jurist bevestigen |
| **V5** | Eigen `consent_type` (voorstel `nutrition_ai_chat`) met versie, intrekbaar. **Zonder toestemming: de bestaande schuifjes en de zoekfunctie**, zonder dat je iets kwijtraakt | Granulaire toestemming (DPIA §5) | Claude |
| **V6** | Kosten en misbruik: Turnstile, rate limit per sessie, een maximum aan beurten en tekens per gesprek, en een maandbudget in de console van de provider | Een anonieme ingang naar een betaalde API | Claude (code) + Dennis (budget) |

## 4. Wat vóór die voorwaarden wél kan

- **Bouwen achter een vlag** (`NUTRITION_AI_CHAT_ENABLED`, standaard uit), zodat de site onveranderd blijft tot V1–V6 rond zijn.
- **Ontwikkelen en testen met synthetische invoer.** Verzonnen zinnen zijn geen persoonsgegevens; daarvoor is een ontwikkelsleutel genoeg. Die zet Dennis zelf in `.env.local`; Claude raakt dat bestand niet aan.
- **Een evaluatieset van synthetische gesprekken en zinnen**, die tegelijk de testset is. Op die set wordt het model gekozen, met kosten per voltooid gesprek als maat.

## 5. Volgorde

1. **Sessie S1–S3** (sessie-besluitdocument). De anonieme chat op de check heeft een sessie nodig als anker voor zijn toestemming, en die sessie komt dan bij de toestemming, vóór de eerste vraag (sessiedocument §10).
2. **Chat op de check (eerst).** Dit is de kleinste LLM-koppeling: 12 schuifjes plus 2 meta-vragen, elk met een vast bereik, dus de output is triviaal te valideren. Hij komt bij elke nieuwe bezoeker, de scoring blijft ongewijzigd, en de schuifjes blijven de terugval. Ontwerp: architectuurdocument §6.4.
3. **Chat in het dagboek.** Dit is moeilijker (371 producten, porties, meerduidigheid). De deterministische parser uit het architectuurdocument §2.3 wordt hier de terugval als het model faalt of weigert, en is geen voorwaarde meer.

**Meetpunt:** het aandeel voltooide checks via chat tegenover via de schuifjes, en de tijd tot het resultaat. Als de schuifjes beter scoren, blijft de chat een keuze naast de schuifjes en wordt hij niet de standaard. Een vragenlijst met vaste antwoorden kan sneller zijn dan typen, en dat moet de meting uitwijzen, niet een aanname.

## 6. Afgewezen, met reden

- **De LLM rekent voedingswaarden uit.** Niet reproduceerbaar en zonder herkomst; `FOOD_SOURCES` is de bron.
- **De LLM stelt advies of een supplementkeuze op.** De claimgrens is deterministisch (`approved-claims.ts`, `resolveGatedComparisonPath`).
- **Wachten tot 500+ checks.** Door Dennis afgewezen voor dit doel. De drempel was bedoeld voor statistisch leren over veel gebruikers, niet voor het vertalen van één invoer.
- **Transcripten standaard bewaren.** Niet besloten; de aanbeveling blijft "niet bewaren" (architectuur §3.1). Tijdens het gesprek houdt de client de geschiedenis vast. Wat telt, is wat de gebruiker bevestigt.
