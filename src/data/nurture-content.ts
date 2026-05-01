import type { ProfileLabel } from "@/lib/intake-engine";

// ============================================================
// Types
// ============================================================

export type TemplateKey =
  | "day0_welcome"
  | "day3_quickwins"
  | "day7_deepdive"
  | "day14_halfweg"
  | "day21_momentum"
  | "day30_herhaalmeting";

export type DomainKey =
  | "sleep_score"
  | "energy_score"
  | "stress_score"
  | "nutrition_score"
  | "movement_score"
  | "recovery_score";

export type ProfileLabelName = ProfileLabel["name"];

export interface SupplementTip {
  name: string;
  reason: string;
  url: string;
}

export interface NurtureBlock {
  subject: string;
  preheader: string;
  greeting: string;
  bodyParagraphs: string[];
  tip: string;
  cta: { text: string; url: string };
}

export interface DomainSupplementTip {
  intro: string;
  supplement: SupplementTip;
}

// ============================================================
// Domain-specifieke supplement-tips (gebruikt in dag 3, 7, 14)
// ============================================================

export const domainSupplementTips: Record<DomainKey, DomainSupplementTip> = {
  sleep_score: {
    intro:
      "Je slaap kwam uit de Leefstijlcheck als je grootste aandachtspunt.",
    supplement: {
      name: "Magnesium",
      reason:
        "Magnesium glycinaat ondersteunt je spierontspanning en slaapkwaliteit — vooral als je merkt dat je lichaam 's avonds niet goed tot rust komt.",
      url: "/beste-magnesium",
    },
  },
  energy_score: {
    intro: "Je energieniveau was je laagste score in de Leefstijlcheck.",
    supplement: {
      name: "Omega-3",
      reason:
        "EPA en DHA ondersteunen je energiehuishouding op celniveau. Vooral als je weinig vette vis eet, kan dit verschil maken.",
      url: "/beste-omega-3-supplement",
    },
  },
  stress_score: {
    intro: "Stress kwam naar voren als je grootste aandachtspunt.",
    supplement: {
      name: "Ashwagandha",
      reason:
        "Ashwagandha (KSM-66) helpt je cortisolniveaus in balans te houden — zodat je lichaam beter herstelt van dagelijkse stress.",
      url: "/beste-ashwagandha",
    },
  },
  nutrition_score: {
    intro: "Je voeding — en met name je omega-3 inname — scoorde het laagst.",
    supplement: {
      name: "Omega-3",
      reason:
        "De meeste mannen krijgen te weinig EPA en DHA binnen via voeding. Een goed omega-3 supplement is vaak de makkelijkste eerste stap.",
      url: "/beste-omega-3-supplement",
    },
  },
  movement_score: {
    intro: "Je bewegingspatroon heeft ruimte voor verbetering.",
    supplement: {
      name: "Magnesium",
      reason:
        "Magnesium ondersteunt je spierfunctie en helpt krampen voorkomen — vooral relevant als je meer gaat bewegen.",
      url: "/beste-magnesium",
    },
  },
  recovery_score: {
    intro: "Je herstel scoorde het laagst — je lichaam krijgt niet genoeg rust.",
    supplement: {
      name: "Magnesium",
      reason:
        "Magnesium speelt een sleutelrol in spierherstel en ontspanning. Bij een lage herstelscore is dit vaak de eerste stap.",
      url: "/beste-magnesium",
    },
  },
};

// ============================================================
// Urgentie-aanpassingen
// ============================================================

export const urgencyModifiers = {
  critical: {
    toneNote:
      "Wees direct en concreet. Geen omhaal. Deze persoon heeft meerdere lage scores en heeft behoefte aan duidelijke eerste stappen.",
  },
  moderate: {
    toneNote:
      "Warm en ondersteunend. Er is werk aan de winkel, maar geen paniek.",
  },
  mild: {
    toneNote: "Licht en positief. Kleine verbeteringen, grote impact.",
  },
  healthy: {
    toneNote:
      "Feliciteren met goede scores. Focus op optimalisatie en behoud.",
  },
};

// ============================================================
// Profielgestuurde content per template-dag
//
// Profielnamen komen rechtstreeks uit de intake-engine:
//   sleep     → "Onrustige Slaper"
//   energy    → "Lage Batterij"
//   stress    → "Stressdrager"
//   nutrition → "Stille Tekorten"
//   movement  → "Stilzitter"
//   recovery  → "Stille Slijter"
//   (all > 60)→ "In Balans"
// ============================================================

export const nurtureContent: Record<
  TemplateKey,
  Record<ProfileLabelName, NurtureBlock>
> = {
  // ── DAG 0: WELKOM ────────────────────────────────────────
  day0_welcome: {
    "Lage Batterij": {
      subject: "Je Herstelplan staat klaar",
      preheader: "Je energiescore laat zien waar de winst zit",
      greeting: "Goed dat je de Leefstijlcheck hebt gedaan.",
      bodyParagraphs: [
        "Je resultaten laten zien dat je energie structureel onder druk staat. Dat is niet 'gewoon ouder worden' — het is een signaal dat je lichaam iets mist.",
        "In je Herstelplan vind je concrete stappen die je deze week al kunt nemen. Geen grote veranderingen, maar slimme eerste stappen.",
      ],
      tip: "Begin vandaag met één ding: eet binnen 30 minuten na het opstaan een eiwitrijk ontbijt. Dit stabiliseert je bloedsuiker en geeft je ochtendenergie een boost.",
      cta: { text: "Bekijk je Herstelplan", url: "/intake" },
    },
    "Onrustige Slaper": {
      subject: "Je Herstelplan staat klaar",
      preheader: "Je slaapscore laat zien waar je kunt verbeteren",
      greeting: "Goed dat je de Leefstijlcheck hebt gedaan.",
      bodyParagraphs: [
        "Je resultaten wijzen op een verstoord slaappatroon. Dat heeft impact op alles — je energie, je stemming, je herstel.",
        "Het goede nieuws: slaap is een van de domeinen waar je het snelst verbetering kunt zien met de juiste aanpassingen.",
      ],
      tip: "Probeer vanavond je schermtijd te stoppen 60 minuten voor het slapengaan. Lees een boek, doe een ademhalingsoefening, of ga gewoon even zitten. Je brein heeft dat signaal nodig om af te schakelen.",
      cta: { text: "Bekijk je Herstelplan", url: "/intake" },
    },
    "Stressdrager": {
      subject: "Je Herstelplan staat klaar",
      preheader: "Je stresspatroon verdient aandacht",
      greeting: "Goed dat je de Leefstijlcheck hebt gedaan.",
      bodyParagraphs: [
        "Je resultaten laten zien dat stress een structurele rol speelt in hoe je je voelt. Dat is niet zwak — het is je lichaam dat aangeeft dat het herstel nodig heeft.",
        "Chronische stress remt je testosteronproductie, verstoort je slaap en vreet aan je energie. Maar er zijn concrete stappen die helpen.",
      ],
      tip: "Begin vandaag met 3 minuten ademhalingsoefening: 4 tellen inademen, 7 tellen vasthouden, 8 tellen uitademen. Doe dit voor het slapengaan. Het activeert je parasympathisch zenuwstelsel.",
      cta: { text: "Bekijk je Herstelplan", url: "/intake" },
    },
    "Stille Tekorten": {
      subject: "Je Herstelplan staat klaar",
      preheader: "Je voedingsbasis heeft ruimte voor verbetering",
      greeting: "Goed dat je de Leefstijlcheck hebt gedaan.",
      bodyParagraphs: [
        "Je resultaten laten zien dat de basis — voeding, hydratatie, essentiële voedingsstoffen — nog niet op orde is. Dat is geen verwijt, maar een kans: hier zit vaak de grootste winst.",
        "Supplementen zijn nuttig, maar alleen als de basis staat. Daarom beginnen we daar.",
      ],
      tip: "Check vandaag eens hoeveel water je drinkt. De vuistregel: 30 ml per kilo lichaamsgewicht. Bij 85 kilo is dat 2,5 liter. De meeste mannen zitten op de helft.",
      cta: { text: "Bekijk je Herstelplan", url: "/intake" },
    },
    "Stilzitter": {
      subject: "Je Herstelplan staat klaar",
      preheader: "Meer bewegen hoeft niet ingewikkeld te zijn",
      greeting: "Goed dat je de Leefstijlcheck hebt gedaan.",
      bodyParagraphs: [
        "Je resultaten laten zien dat beweging je laagste score is. Na 40 is een actieve leefstijl één van de krachtigste middelen om energie, slaap en stemming te verbeteren.",
        "Het goede nieuws: je hoeft niet naar de sportschool. Kleine, dagelijkse beweging heeft al een meetbaar effect.",
      ],
      tip: "Begin vandaag met 15 minuten wandelen — bij voorkeur buiten en na de lunch. Daglicht en lichte beweging verlagen cortisol en verbeteren je energieniveau de rest van de dag.",
      cta: { text: "Bekijk je Herstelplan", url: "/intake" },
    },
    "Stille Slijter": {
      subject: "Je Herstelplan staat klaar",
      preheader: "Meerdere domeinen vragen aandacht — hier begin je",
      greeting: "Goed dat je de Leefstijlcheck hebt gedaan.",
      bodyParagraphs: [
        "Je resultaten laten een breed patroon zien: niet één domein springt eruit, maar meerdere gebieden staan onder druk. Dat is het 'stille slijten' — je functioneert, maar niet op het niveau dat je wilt.",
        "De sleutel is niet alles tegelijk aanpakken, maar beginnen bij de basis.",
      ],
      tip: "Focus deze week op twee dingen: een vast bedtijd (elke dag dezelfde tijd) en 20 minuten wandelen per dag. Dat lijkt simpel, maar het legt de fundering voor alles wat daarna komt.",
      cta: { text: "Bekijk je Herstelplan", url: "/intake" },
    },
    "In Balans": {
      subject: "Je Herstelplan staat klaar",
      preheader: "Je scoort goed — hier is hoe je het nog beter maakt",
      greeting: "Goed dat je de Leefstijlcheck hebt gedaan.",
      bodyParagraphs: [
        "Je scores laten een solide basis zien. Dat is niet vanzelfsprekend — het is het resultaat van bewuste keuzes.",
        "Nu is het moment om te kijken hoe je die basis kunt vasthouden en op bepaalde punten kunt optimaliseren. Want ook een goede basis heeft onderhoud nodig.",
      ],
      tip: "Focus deze week op één domein dat je wilt verfijnen. Bekijk je Herstelplan en kies het gebied met de meeste groeimogelijkheid.",
      cta: { text: "Bekijk je Herstelplan", url: "/intake" },
    },
  },

  // ── DAG 3: QUICK WINS ────────────────────────────────────
  day3_quickwins: {
    "Lage Batterij": {
      subject: "3 dingen die je energie deze week verbeteren",
      preheader: "Kleine stappen, merkbaar verschil",
      greeting: "Drie dagen geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Energie opbouwen gaat niet in één dag. Maar er zijn dingen die je vandaag kunt doen die je morgen al voelt.",
      ],
      tip: "Quick win #1: Stop na 14:00 met cafeïne. Quick win #2: Eet bij elke maaltijd een eiwitbron (eieren, vis, noten, kwark). Quick win #3: Ga 10 minuten naar buiten — daglicht in de ochtend reset je biologische klok.",
      cta: { text: "Welk supplement past bij jouw profiel?", url: "/beste-omega-3-supplement" },
    },
    "Onrustige Slaper": {
      subject: "3 dingen die je slaap deze week verbeteren",
      preheader: "Vanavond al beter slapen",
      greeting: "Drie dagen geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Slaapverbetering begint niet in bed — het begint overdag. Je lichaam heeft signalen nodig om te weten dat het tijd is om af te schakelen.",
      ],
      tip: "Quick win #1: Slaapkamer op 18°C (koel slapen = dieper slapen). Quick win #2: Geen schermen 60 min voor bed. Quick win #3: Zelfde bedtijd, ook in het weekend — je circadiaan ritme heeft regelmaat nodig.",
      cta: { text: "Welk magnesium helpt bij slaap?", url: "/beste-magnesium" },
    },
    "Stressdrager": {
      subject: "3 stressverlagers die je vandaag kunt proberen",
      preheader: "Geen meditatiecursus nodig",
      greeting: "Drie dagen geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Stress verminderen hoeft niet ingewikkeld te zijn. Het gaat niet om grote veranderingen, maar om kleine momenten van herstel verspreid over de dag.",
      ],
      tip: "Quick win #1: 4-7-8 ademhaling (3 minuten, 2× per dag). Quick win #2: Wandel 15 minuten na de lunch — het verlaagt cortisol meetbaar. Quick win #3: Schrijf 's avonds 3 dingen op die goed gingen vandaag.",
      cta: { text: "Hoe ashwagandha stress verlaagt", url: "/beste-ashwagandha" },
    },
    "Stille Tekorten": {
      subject: "3 voedingstips die je basis versterken",
      preheader: "Je bouwt een huis — begin bij het fundament",
      greeting: "Drie dagen geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Je voedingsbasis is het fundament voor alles. Supplementen zijn waardevol, maar pas als je basis staat.",
      ],
      tip: "Quick win #1: Eet 2× per week vette vis (zalm, makreel, haring). Quick win #2: Voeg bij elke maaltijd een handvol groente toe. Quick win #3: Vervang één keer per dag een tussendoortje door noten.",
      cta: { text: "Waarom omega-3 belangrijk is", url: "/beste-omega-3-supplement" },
    },
    "Stilzitter": {
      subject: "3 kleine stappen die je bewegingspatroon doorbreken",
      preheader: "Je hoeft geen sporter te zijn om het verschil te voelen",
      greeting: "Drie dagen geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Meer bewegen hoeft niet betekenen dat je een sportschoolabonnement neemt. Kleine, frequente beweging verspreid over de dag heeft al een meetbaar effect op je energie en stemming.",
      ],
      tip: "Quick win #1: Sta elk uur 5 minuten op en beweeg. Quick win #2: Loop of fiets voor boodschappen in plaats van de auto. Quick win #3: Doe 10 minuten stretchen voor het slapengaan — het verlaagt je rusthartslag.",
      cta: { text: "Magnesium voor spierfunctie", url: "/beste-magnesium" },
    },
    "Stille Slijter": {
      subject: "Begin hier: 3 kleine stappen die het verschil maken",
      preheader: "Focus op de basis, niet op alles tegelijk",
      greeting: "Drie dagen geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Als meerdere domeinen aandacht vragen, is de verleiding groot om overal tegelijk aan te werken. Doe dat niet. Begin bij de basis.",
      ],
      tip: "Quick win #1: Drink 2 liter water per dag (zet een fles op je bureau). Quick win #2: Ga elke dag 15 minuten naar buiten. Quick win #3: Leg je telefoon buiten de slaapkamer.",
      cta: { text: "Bekijk je Herstelplan opnieuw", url: "/intake" },
    },
    "In Balans": {
      subject: "3 optimalisaties voor wie al goed scoort",
      preheader: "Je basis staat — dit zijn de volgende stappen",
      greeting: "Drie dagen geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Als je al goed scoort, zit de winst in de details. Kleine optimalisaties op het gebied van voeding, slaapkwaliteit en herstel leveren merkbaar verschil op.",
      ],
      tip: "Quick win #1: Eet 2× per week vette vis voor je omega-3 inname. Quick win #2: Controleer je slaapkwaliteit — even wakker worden is normaal, maar diepe slaap is cruciaal. Quick win #3: Plan één echte rustdag per week in.",
      cta: { text: "Bekijk vergelijkingspagina's", url: "/beste-omega-3-supplement" },
    },
  },

  // ── DAG 7: DEEP DIVE ─────────────────────────────────────
  day7_deepdive: {
    "Lage Batterij": {
      subject: "Waarom je energie daalt na 40 (en wat je eraan doet)",
      preheader: "Het is niet 'normaal' — het is oplosbaar",
      greeting: "Een week geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Na 40 verandert je stofwisseling. Je mitochondriën — de energiecentrales van je cellen — worden minder efficiënt. Tegelijk daalt je testosteron geleidelijk, wat direct invloed heeft op je energieniveau.",
        "Maar dit is geen onvermijdelijk verval. Met de juiste voeding, beweging en gerichte supplementen kun je dit proces vertragen en zelfs deels omkeren.",
      ],
      tip: "Deze week: voeg omega-3 toe aan je routine. EPA en DHA ondersteunen je mitochondriale functie — dat is de motor van je energie.",
      cta: { text: "Vergelijk omega-3 supplementen", url: "/beste-omega-3-supplement" },
    },
    "Onrustige Slaper": {
      subject: "Wat er in je brein gebeurt als je slecht slaapt",
      preheader: "Slaap is geen luxe — het is herstel",
      greeting: "Een week geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Tijdens diepe slaap ruimt je brein afvalstoffen op via het glymfatisch systeem. Je spieren herstellen, je immuunsysteem wordt bijgevuld, en je groeihormoon piekt. Als die diepe slaap ontbreekt, bouw je een slaapschuld op die alles beïnvloedt.",
        "Magnesium speelt hierin een sleutelrol: het activeert je parasympathisch zenuwstelsel (je 'ruststand') en helpt je spieren ontspannen.",
      ],
      tip: "Overweeg magnesium glycinaat voor het slapengaan. Het is de best opneembare vorm en specifiek onderzocht op slaapkwaliteit.",
      cta: { text: "Vergelijk magnesium supplementen", url: "/beste-magnesium" },
    },
    "Stressdrager": {
      subject: "Hoe chronische stress je lichaam sloopt (en hoe je het stopt)",
      preheader: "Cortisol is niet de vijand — chronisch cortisol wel",
      greeting: "Een week geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Cortisol is je stresshormoon — en in korte pieken is het nuttig. Maar als het chronisch hoog blijft, onderdrukt het je testosteronproductie, verstoort het je slaap, en remt het je spierherstel.",
        "Ashwagandha (specifiek de KSM-66 extract) is in meerdere studies onderzocht op het verlagen van chronisch cortisol. Het is geen wondermiddel, maar het kan een zinvolle aanvulling zijn naast leefstijlveranderingen.",
      ],
      tip: "Lees meer over hoe ashwagandha werkt en waar je op moet letten bij het kiezen van een supplement.",
      cta: { text: "Vergelijk ashwagandha supplementen", url: "/beste-ashwagandha" },
    },
    "Stille Tekorten": {
      subject: "Waarom supplementen zonder basis niet werken",
      preheader: "Eerst het fundament, dan de verfijning",
      greeting: "Een week geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Een supplement is precies dat: een aanvulling. Als je basis — voeding, hydratatie, slaap — niet op orde is, gooi je geld weg aan supplementen die je lichaam niet goed kan opnemen.",
        "De uitzondering is omega-3. De meeste Nederlanders krijgen structureel te weinig EPA en DHA binnen, en het is lastig om dat alleen via voeding op te lossen (je zou 3-4× per week vette vis moeten eten).",
      ],
      tip: "Als je één supplement kiest terwijl je aan je basis werkt: laat het omega-3 zijn.",
      cta: { text: "Vergelijk omega-3 supplementen", url: "/beste-omega-3-supplement" },
    },
    "Stilzitter": {
      subject: "Waarom bewegen na 40 zo anders werkt",
      preheader: "Niet harder — slimmer",
      greeting: "Een week geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Na 40 verlies je zonder actief gebruik gemiddeld 1% spiermassa per jaar. Dat klinkt weinig, maar over 10 jaar is het merkbaar: minder kracht, langzamer herstel, vaker vermoeid.",
        "Het goede nieuws: dit proces is grotendeels omkeerbaar. Zelfs lichte krachttraining 2× per week maakt al verschil — en wandelen dagelijks verlaagt je risico op chronische aandoeningen.",
      ],
      tip: "Voeg deze week twee dingen toe: 20 minuten wandelen per dag en één keer oefeningen met lichaamsgewicht (squats, planks). Niet meer — consistentie is belangrijker dan volume.",
      cta: { text: "Magnesium voor spierfunctie", url: "/beste-magnesium" },
    },
    "Stille Slijter": {
      subject: "Het 'stille slijten' doorbreken: waar begin je?",
      preheader: "Niet alles tegelijk — wel het juiste eerst",
      greeting: "Een week geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Als meerdere domeinen onder druk staan, is de vraag: waar begin je? Het antwoord is bijna altijd slaap. Zonder goede slaap werkt geen enkele andere interventie optimaal — niet voeding, niet beweging, niet supplementen.",
        "Daarom is de eerste stap: je slaapfundament op orde brengen. Vast ritme, koele kamer, geen schermen voor bed.",
      ],
      tip: "Focus de komende week uitsluitend op je slaap. Als dat staat, pak je volgende week je voeding aan.",
      cta: { text: "Bekijk je Herstelplan opnieuw", url: "/intake" },
    },
    "In Balans": {
      subject: "Hoe je een goede basis vasthoudt na 40",
      preheader: "Behoud vraagt dezelfde aandacht als opbouw",
      greeting: "Een week geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Een goede leefstijlbasis onderhoud je niet automatisch — het vraagt bewuste keuzes die je elke week opnieuw maakt. De mannen die na 40 vitaal blijven, zijn niet geluksvogels: ze hebben goede gewoontes die ze vasthouden.",
        "Nu is het moment om te kijken waar nog winst zit. Omega-3 is voor de meeste mannen het laaghangende fruit: de meesten eten te weinig vette vis en missen EPA en DHA.",
      ],
      tip: "Check of je voldoende omega-3 binnenkrijgt. Als je minder dan 2× per week vette vis eet, is een supplement het overwegen waard.",
      cta: { text: "Vergelijk omega-3 supplementen", url: "/beste-omega-3-supplement" },
    },
  },

  // ── DAG 14: HALVERWEGE ───────────────────────────────────
  day14_halfweg: {
    "Lage Batterij": {
      subject: "Halverwege: merk je al verschil?",
      preheader: "Twee weken is genoeg om de eerste veranderingen te voelen",
      greeting: "Twee weken geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Als je de quick wins uit onze eerdere mails hebt toegepast — eiwitrijk ontbijt, minder cafeïne na 14:00, dagelijks daglicht — dan zou je de eerste veranderingen kunnen merken.",
        "Verandering gaat niet lineair. Sommige dagen voelen beter, andere niet. Dat is normaal. Het gaat om de trend over weken, niet over dagen.",
      ],
      tip: "Houd deze week eens bij hoe je energie fluctueert door de dag: noteer om 10:00, 14:00 en 20:00 een score van 1-10. Na een week zie je je patroon.",
      cta: { text: "Vergelijk omega-3 supplementen", url: "/beste-omega-3-supplement" },
    },
    "Onrustige Slaper": {
      subject: "Halverwege: slaapt het al wat beter?",
      preheader: "Je slaappatroon verandert niet in één nacht",
      greeting: "Twee weken geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Slaapverbetering is een proces. Je circadiaan ritme heeft 1-2 weken nodig om zich aan te passen aan een nieuw patroon. Als je consistent bent geweest met je bedtijd en schermtijd, zou je nu de eerste resultaten kunnen merken.",
        "Als je nog geen verbetering voelt: geef het nog een week. Consistentie is belangrijker dan perfectie.",
      ],
      tip: "Probeer vanavond 200-400 mg magnesium glycinaat, 30-60 minuten voor bed. Het helpt je lichaam in de 'ruststand' te komen.",
      cta: { text: "Welk magnesium is het beste voor slaap?", url: "/beste-magnesium" },
    },
    "Stressdrager": {
      subject: "Halverwege: hoe gaat het met je stress?",
      preheader: "Kleine veranderingen, cumulatief effect",
      greeting: "Twee weken geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Stressmanagement is geen eenmalige actie — het is een dagelijkse gewoonte. Als je de ademhalingsoefeningen en wandelingen hebt volgehouden, bouw je langzaam een buffer op.",
        "Het effect van leefstijlveranderingen op cortisol is meetbaar na 2-4 weken. Je zit nu precies in die fase.",
      ],
      tip: "Voeg deze week iets toe: 5 minuten journaling voor het slapengaan. Schrijf op wat je bezighoudt — het 'legen' van je hoofd helpt je brein om los te laten.",
      cta: { text: "Hoe ashwagandha cortisol verlaagt", url: "/beste-ashwagandha" },
    },
    "Stille Tekorten": {
      subject: "Halverwege: staat je basis al steviger?",
      preheader: "Elke verbetering in je voeding telt",
      greeting: "Twee weken geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Als je de voedingstips hebt gevolgd — meer vis, meer groente, meer water — dan bouw je nu aan een steviger fundament. Je lichaam heeft 2-4 weken nodig om de effecten te voelen.",
        "Nu is een goed moment om te kijken of een omega-3 supplement je kan helpen. Vooral als je niet 3× per week vis eet.",
      ],
      tip: "Houd deze week een voedingsdagboek bij — niet om calorieën te tellen, maar om te zien of je voldoende variatie en voedingsstoffen binnenkrijgt.",
      cta: { text: "Vergelijk omega-3 supplementen", url: "/beste-omega-3-supplement" },
    },
    "Stilzitter": {
      subject: "Halverwege: beweeg je al meer?",
      preheader: "Twee weken is genoeg om een patroon te zien",
      greeting: "Twee weken geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Als je de afgelopen twee weken dagelijks bent gaan lopen of meer bent gaan bewegen, merk je nu waarschijnlijk het eerste effect: iets meer energie, iets betere slaap.",
        "Beweging heeft een opstapelend effect. Elke stap telt — en het wordt makkelijker naarmate je het vaker doet.",
      ],
      tip: "Voeg deze week één keer krachttraining toe: squats, lunges, push-ups. Geen sportschool nodig — 20 minuten thuis is al genoeg om spiermassa te behouden.",
      cta: { text: "Magnesium voor spierfunctie", url: "/beste-magnesium" },
    },
    "Stille Slijter": {
      subject: "Halverwege: focus op één ding tegelijk",
      preheader: "Niet alles hoeft nu — consistentie wint",
      greeting: "Twee weken geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Als je de afgelopen twee weken je slaap hebt verbeterd, is nu het moment om je tweede domein aan te pakken. Kijk naar je Herstelplan: welk domein scoorde op-één-na-laagst?",
        "Voeg deze week één nieuwe gewoonte toe — niet twee, niet drie. Stapelen werkt alleen als elke laag stevig staat.",
      ],
      tip: "Ga terug naar je Herstelplan en kies je volgende focusdomein. Eén duidelijke actie per week is genoeg.",
      cta: { text: "Bekijk je Herstelplan", url: "/intake" },
    },
    "In Balans": {
      subject: "Halverwege: hoe houd je dit vol?",
      preheader: "Goede gewoontes vragen actief onderhoud",
      greeting: "Twee weken geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Als je al goed scoort, is het verleidelijk om niets te doen. Maar goede scores zijn geen garantie — ze zijn het resultaat van aanhoudende keuzes.",
        "Nu is het moment om te checken of je huidige gewoontes houdbaar zijn op de lange termijn. Slaap, voeding en beweging zijn de drie pijlers die het meest opleveren.",
      ],
      tip: "Kies deze week één gewoonte die je wilt verankeren: elke dag wandelen, elke dag een eiwitrijk ontbijt, of elke avond schermvrij voor bed. Houd het bij voor de rest van de maand.",
      cta: { text: "Vergelijk omega-3 supplementen", url: "/beste-omega-3-supplement" },
    },
  },

  // ── DAG 21: MOMENTUM ─────────────────────────────────────
  day21_momentum: {
    "Lage Batterij": {
      subject: "Drie weken: je bouwt momentum op",
      preheader: "De gewoontes die je nu hebt, bepalen hoe je je over een maand voelt",
      greeting: "Drie weken geleden startte je met je Herstelplan.",
      bodyParagraphs: [
        "Na drie weken begin je de grens te bereiken waar gewoontes makkelijker worden. De inspanning om je ochtendroutine vol te houden voelt minder — dat is je brein dat een nieuw patroon aanleert.",
        "Over 9 dagen ontvang je een herinnering om de Leefstijlcheck opnieuw te doen. Dan kun je meten wat er veranderd is.",
      ],
      tip: "Houd vol wat werkt. Voeg deze week niets nieuws toe — consolideer wat je hebt.",
      cta: { text: "Vergelijk omega-3 supplementen", url: "/beste-omega-3-supplement" },
    },
    "Onrustige Slaper": {
      subject: "Drie weken: je slaapritme vindt zijn weg",
      preheader: "Consistentie is de sleutel — en je bent er bijna",
      greeting: "Drie weken geleden startte je met je Herstelplan.",
      bodyParagraphs: [
        "Na drie weken consistent slaapritme begint je lichaam zich aan te passen. Je circadiaan ritme wordt sterker, je melatonineproductie komt op gang op het juiste moment.",
        "Over 9 dagen kun je de Leefstijlcheck opnieuw doen. Dan zie je zwart-op-wit of je slaapscore is verbeterd.",
      ],
      tip: "Houd je slaapritme vast — ook in het weekend. Dat is het moeilijkste, maar ook het belangrijkste.",
      cta: { text: "Vergelijk magnesium supplementen", url: "/beste-magnesium" },
    },
    "Stressdrager": {
      subject: "Drie weken: je stressbuffer groeit",
      preheader: "Elke dag dat je oefent, wordt de buffer sterker",
      greeting: "Drie weken geleden startte je met je Herstelplan.",
      bodyParagraphs: [
        "Stressmanagement is als spiertraining: het wordt sterker door herhaling. Na drie weken ademhalingsoefeningen en bewuste rustmomenten, is je cortisolrespons aan het veranderen.",
        "Over 9 dagen kun je de Leefstijlcheck opnieuw doen. Dan meet je of je stressscore is verbeterd.",
      ],
      tip: "Houd deze week vast wat werkt. Consistentie verslaat intensiteit.",
      cta: { text: "Vergelijk ashwagandha supplementen", url: "/beste-ashwagandha" },
    },
    "Stille Tekorten": {
      subject: "Drie weken: je fundament wordt sterker",
      preheader: "Elke gezonde keuze bouwt voort op de vorige",
      greeting: "Drie weken geleden startte je met je Herstelplan.",
      bodyParagraphs: [
        "Na drie weken betere voeding begint je lichaam het verschil te merken. Je darmmicrobioom past zich aan, je energieniveau stabiliseert, en je herstel verbetert.",
        "Over 9 dagen kun je de Leefstijlcheck opnieuw doen. Dan zie je of je voedingsscore is verbeterd.",
      ],
      tip: "Blijf consistent met wat je hebt opgebouwd. De basis is bijna op orde — daarna kun je gericht supplementen toevoegen.",
      cta: { text: "Vergelijk omega-3 supplementen", url: "/beste-omega-3-supplement" },
    },
    "Stilzitter": {
      subject: "Drie weken: je lichaam went aan beweging",
      preheader: "Wat eerst moeite kostte, wordt nu gewoonte",
      greeting: "Drie weken geleden startte je met je Herstelplan.",
      bodyParagraphs: [
        "Na drie weken dagelijkse beweging begint je lichaam te wennen. Je energie is stabieler, je slaap is iets dieper, en de eerste stappen voelen minder als een opgave.",
        "Over 9 dagen kun je de Leefstijlcheck opnieuw doen. Dan zie je of je bewegingsscore is verbeterd.",
      ],
      tip: "Verhoog deze week licht: van 15 naar 20 minuten wandelen, of voeg een tweede krachttraining toe. Kleine stap, groot effect op de lange termijn.",
      cta: { text: "Magnesium voor spierfunctie", url: "/beste-magnesium" },
    },
    "Stille Slijter": {
      subject: "Drie weken: stap voor stap vooruit",
      preheader: "Je bent verder dan je denkt",
      greeting: "Drie weken geleden startte je met je Herstelplan.",
      bodyParagraphs: [
        "Als 'stille slijter' is vooruitgang soms lastig te voelen — juist omdat de veranderingen subtiel zijn. Maar ze zijn er. Betere slaap, iets meer energie, wat minder spanning.",
        "Over 9 dagen doe je de Leefstijlcheck opnieuw. Dan zie je in cijfers wat er veranderd is.",
      ],
      tip: "Schrijf vandaag op: wat gaat beter dan 3 weken geleden? Soms moet je het bewust opmerken.",
      cta: { text: "Bekijk je Herstelplan", url: "/intake" },
    },
    "In Balans": {
      subject: "Drie weken: je goede gewoontes zijn stevig",
      preheader: "Nu is het moment om te optimaliseren",
      greeting: "Drie weken geleden startte je met je Herstelplan.",
      bodyParagraphs: [
        "Na drie weken consistent goede gewoontes zijn ze steviger verankerd. Dit is het moment om te kijken of er een supplement is dat je basis versterkt.",
        "Over 9 dagen kun je de Leefstijlcheck opnieuw doen. Wees benieuwd of je scores nog beter zijn geworden.",
      ],
      tip: "Overweeg een omega-3 supplement als aanvulling op je basis. Het is laagdrempelig en ondersteunt hart, hersenen en energiehuishouding.",
      cta: { text: "Vergelijk omega-3 supplementen", url: "/beste-omega-3-supplement" },
    },
  },

  // ── DAG 30: HERHAALMETING ────────────────────────────────
  day30_herhaalmeting: {
    "Lage Batterij": {
      subject: "30 dagen: tijd om te meten waar je staat",
      preheader: "Je Leefstijlcheck opnieuw doen duurt 3 minuten",
      greeting: "Een maand geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Je hebt een maand aan je energie gewerkt. Nu is het tijd om te meten: zijn je scores verbeterd? Welke domeinen zijn vooruitgegaan? Waar is nog winst te halen?",
        "De herhaalmeting geeft je een nieuw Herstelplan met geüpdatete aanbevelingen op basis van je huidige situatie.",
      ],
      tip: "Doe de Leefstijlcheck opnieuw — het duurt 3 minuten en je ziet direct je voortgang.",
      cta: { text: "Doe de herhaalmeting", url: "/intake" },
    },
    "Onrustige Slaper": {
      subject: "30 dagen: hoe staat je slaap er nu voor?",
      preheader: "Meet je voortgang in 3 minuten",
      greeting: "Een maand geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Je hebt een maand aan je slaap gewerkt. De herhaalmeting laat je zien of je slaapscore is verbeterd — en welke volgende stap het meest impact heeft.",
      ],
      tip: "Doe de Leefstijlcheck opnieuw en vergelijk je resultaten met een maand geleden.",
      cta: { text: "Doe de herhaalmeting", url: "/intake" },
    },
    "Stressdrager": {
      subject: "30 dagen: is je stress veranderd?",
      preheader: "Meet het verschil in 3 minuten",
      greeting: "Een maand geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Een maand stressmanagement. De herhaalmeting laat je zien wat er veranderd is — in je stressscore, maar ook in je slaap en energie (die worden vaak meegezogen).",
      ],
      tip: "Doe de Leefstijlcheck opnieuw. Je resultaten worden vergeleken met een maand geleden.",
      cta: { text: "Doe de herhaalmeting", url: "/intake" },
    },
    "Stille Tekorten": {
      subject: "30 dagen: staat je basis nu steviger?",
      preheader: "Meet je voortgang in 3 minuten",
      greeting: "Een maand geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Een maand werken aan je basis. De herhaalmeting laat je zien of je voedingsscore is verbeterd — en of je nu klaar bent voor gerichte supplementen.",
      ],
      tip: "Doe de Leefstijlcheck opnieuw. Als je basis verbeterd is, krijg je andere aanbevelingen dan een maand geleden.",
      cta: { text: "Doe de herhaalmeting", url: "/intake" },
    },
    "Stilzitter": {
      subject: "30 dagen: beweeg je al meer?",
      preheader: "Meet je voortgang in 3 minuten",
      greeting: "Een maand geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Een maand meer bewegen. De herhaalmeting laat je zien of je bewegingsscore is verbeterd — en hoe dat doorwerkt in je energie en slaap.",
      ],
      tip: "Doe de Leefstijlcheck opnieuw en vergelijk je bewegings-, energie- en slaapscores.",
      cta: { text: "Doe de herhaalmeting", url: "/intake" },
    },
    "Stille Slijter": {
      subject: "30 dagen: tijd om te zien wat er veranderd is",
      preheader: "Je vooruitgang in cijfers — in 3 minuten",
      greeting: "Een maand geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Als 'stille slijter' zijn verbeteringen soms moeilijk te voelen. Daarom is meten zo waardevol: de herhaalmeting laat je objectief zien wat er is veranderd.",
      ],
      tip: "Doe de Leefstijlcheck opnieuw. De cijfers vertellen het verhaal dat je gevoel soms mist.",
      cta: { text: "Doe de herhaalmeting", url: "/intake" },
    },
    "In Balans": {
      subject: "30 dagen: ben je nog steeds in balans?",
      preheader: "Meet je voortgang in 3 minuten",
      greeting: "Een maand geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Je scoorde een maand geleden al goed. De vraag is: heb je dat vastgehouden — of is er een domein dat aandacht nodig heeft?",
        "De herhaalmeting laat je zien waar je nu staat en wat de slimste volgende stap is.",
      ],
      tip: "Doe de Leefstijlcheck opnieuw. Drie minuten, direct inzicht in je huidige staat.",
      cta: { text: "Doe de herhaalmeting", url: "/intake" },
    },
  },
};

// ============================================================
// Helper: bepaal het zwakste domein
// ============================================================

export function getWeakestDomain(
  domainScores: Record<string, number>,
): DomainKey {
  const domains: DomainKey[] = [
    "sleep_score",
    "energy_score",
    "stress_score",
    "nutrition_score",
    "movement_score",
    "recovery_score",
  ];

  let weakest: DomainKey = "sleep_score";
  let lowestScore = Infinity;

  for (const domain of domains) {
    const score = domainScores[domain] ?? 100;
    if (score < lowestScore) {
      lowestScore = score;
      weakest = domain;
    }
  }

  return weakest;
}

// ============================================================
// Helper: map sequence dag naar template key
// ============================================================

export function sequenceDayToTemplateKey(day: number): TemplateKey {
  const map: Record<number, TemplateKey> = {
    0: "day0_welcome",
    3: "day3_quickwins",
    7: "day7_deepdive",
    14: "day14_halfweg",
    21: "day21_momentum",
    30: "day30_herhaalmeting",
  };
  return map[day] ?? "day30_herhaalmeting";
}

// ============================================================
// Helper: bouw gepersonaliseerde email content
// ============================================================

export function buildNurtureEmail(
  sequenceDay: number,
  profileLabel: string,
  domainScores: Record<string, number>,
  urgencyLevel: string,
): {
  subject: string;
  preheader: string;
  blocks: NurtureBlock;
  supplementTip: DomainSupplementTip | null;
  urgencyTone: string;
} {
  const templateKey = sequenceDayToTemplateKey(sequenceDay);
  const knownLabel = profileLabel as ProfileLabelName;

  const dayContent = nurtureContent[templateKey];
  const blocks =
    dayContent[knownLabel] ?? dayContent["Stille Slijter"];

  const weakestDomain = getWeakestDomain(domainScores);

  const showSupplementTip = [
    "day3_quickwins",
    "day7_deepdive",
    "day14_halfweg",
  ].includes(templateKey);
  const supplementTip = showSupplementTip
    ? domainSupplementTips[weakestDomain]
    : null;

  const urgencyTone =
    urgencyModifiers[urgencyLevel as keyof typeof urgencyModifiers]
      ?.toneNote ?? urgencyModifiers.moderate.toneNote;

  return {
    subject: blocks.subject,
    preheader: blocks.preheader,
    blocks,
    supplementTip,
    urgencyTone,
  };
}
