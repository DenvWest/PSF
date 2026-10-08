# Concept: voorwaarden V1–V6 voor het chatvenster met LLM

**Datum:** 8 oktober 2026
**Status:** CONCEPT. Geen enkel deel hiervan is juridisch getoetst; niets hiervan staat in `DPIA.md`, `VERWERKINGSREGISTER.md` of de privacyverklaring tot Dennis en de jurist het bevestigen.
**Hoort bij:** `BESLUIT_LLM_CHAT_VOEDING_2026-09.md` (V1–V6 in §3). Premium-plaatsing: `BESLUIT_STAPPEN_ENERGIE_AFVALLEN_2026-10.md` §4 en §7.

## 1. Stand per voorwaarde

| # | Voorwaarde | Wie | Stand |
|---|---|---|---|
| V1 | Verwerker en regio kiezen | Dennis | Open — zie §2 |
| V2 | Verwerkersovereenkomst plus voorwaarden bewaren/trainen | Dennis | Open — hangt van V1 af |
| V3 | Juridische toets art. 9 lid 2 sub a voor dit doel | Dennis + jurist | Open — zie §3 (voor te leggen) |
| V4 | DPIA-aanvulling, register, privacyverklaring | Claude (concept) | Concept in §4; bevestigen door Dennis en jurist |
| V5 | Eigen `consent_type` `nutrition_ai_chat`, versie, intrekbaar | Claude | Code klaar (`nutrition-ai-chat-consent.ts`, tekst in `consent-texts.ts`), tekst is concept, nog geen UI en geen route |
| V6 | Kosten en misbruik | Claude + Dennis | Code klaar (`nutrition-ai-chat-guard.ts`: vlag, 20 beurten, 500 tekens/beurt, 6000 tekens/gesprek, 30 beurten/uur/account). Maandbudget in de console van de provider: Dennis |

Geen migratie nodig: `consent_records.consent_type` is vrije tekst en `account_id` bestaat sinds `20260815150000`.

## 2. V1 — wat Dennis moet beslissen

Het besluit van 25 sep adviseert Claude via een EU-regio (Google Vertex AI of Amazon Bedrock), zodat "gezondheidsgegevens blijven in de EU" blijft kloppen. Voordat je kiest, controleren bij de provider zelf (niet uit dit document aannemen):

1. Is het gewenste model beschikbaar in een EU-regio, en met EU-only verwerking (geen routering buiten de EU)?
2. Bewaren zij prompts of antwoorden, hoelang, en is uitzetten mogelijk (zero retention)?
3. Training op klantdata: contractueel uitgesloten?
4. Is er een standaard verwerkersovereenkomst (art. 28) met subverwerkers en doorgiftemechanisme?
5. Kosten per voltooid gesprek op de evaluatieset (besluit §4).

Alternatief uit het besluit: de Anthropic API rechtstreeks. Controleer daar dezelfde vijf punten en de regio-opties; een doorgifte buiten de EU raakt register, DPIA en privacyverklaring.

## 3. V3 — wat aan de jurist voor te leggen

- Dekt uitdrukkelijke toestemming (art. 9 lid 2 sub a) dit doel met de tekst in `NUTRITION_AI_CHAT_CONSENT_TEXT`?
- Is vrije tekst over eten "gegevens over gezondheid" in de zin van art. 9 (aanname: ja, voorzichtigheidshalve)?
- Mag de toestemming gekoppeld zijn aan het premium-aanbod, of is dat een niet-vrije toestemming? Voorstel: betaling geeft toegang tot de chat, toestemming is een aparte, intrekbare keuze, en zonder chat blijft het dagboek volledig bruikbaar.

## 4. V4 — concept-aanvulling (nog niet in de bestaande documenten)

**DPIA, §1 verwerking.** Nieuw doel: een ingelogde gebruiker met toestemming typt vrije tekst over wat hij at; een LLM van een externe verwerker vertaalt dat naar bestaande dagboekvelden (product, portie, eetmoment). Het model rekent niet en adviseert niet: elk getal en elk advies komt uit de bestaande deterministische code (besluit §1).

**Gegevens.** De getypte tekst (kan gezondheidsinformatie bevatten), het account-id alleen als intern rate-limit-sleutel (niet naar de verwerker). Naar de verwerker gaat uitsluitend de tekst van het gesprek, zonder naam, e-mailadres of andere profielgegevens.

**Bewaren.** Voorstel: het gesprek wordt door PerfectSupplement niet bewaard. Alleen de dagboekitems die de gebruiker bevestigt komen in de bestaande tabel. Logging zonder inhoud (aantal beurten, fout, duur). Voorwaarde bij V1: de verwerker bewaart niets, of een aantoonbaar korte termijn.

**Nieuwe risico's.**

| Risico | Maatregel |
|---|---|
| Vrije tekst naar externe verwerker (R-nieuw) | EU-regio, DPA, geen training, geen profielgegevens meesturen |
| Model verzint voedingswaarden of advies | Rolverdeling uit het besluit: model vult alleen velden; getallen en advies uit code; `FORBIDDEN_PHRASES_GLOBAL` op alle uitvoer |
| Gebruiker deelt meer dan nodig | Korte tekst boven het invoerveld; limiet 500 tekens per beurt |
| Toestemming niet vrij | Aparte opt-in, niet voorgevinkt, intrekbaar; zonder toestemming werkt het dagboek ongewijzigd |
| Kosten en misbruik | `AI_CHAT_LIMITS`, maandbudget bij de provider, vlag standaard uit |

**Verwerkingsregister.** Nieuwe regel "Chatvenster dagboek (LLM)": doel, gegevens, grondslag art. 9 lid 2 sub a, ontvanger (verwerker uit V1), regio, bewaartermijn (geen), intrekbaarheid.

**Privacyverklaring.** Nieuwe alinea: wat naar wie gaat, waarom, dat het gesprek niet wordt bewaard of voor training gebruikt, en hoe je intrekt.

## 5. Wat daarna kan, en in welke volgorde

1. Dennis: V1 → V2 → V3 (in die volgorde; V2 en V3 hangen van V1 af).
2. Claude, zodra V1 bekend is: concept in §4 definitief maken en als PR met wijzigingen in `DPIA.md`, register en privacyverklaring voorleggen.
3. Chat bouwen achter de vlag met synthetische invoer en de evaluatieset (besluit §4). Eerste koppeling volgens besluit §5 is de chat op de check, niet het dagboek; zeg het als de volgorde moet wisselen, dan leg ik dat vast.
4. Pas live na V1–V6 en na `nutrition_ai_chat`-toestemming in de UI. Intrekken van een account moet dan ook deze toestemming meenemen (`/api/account/revoke` doet nu alleen `account_storage`).
