import { INTAKE_CTA } from "@/lib/intake-product-copy";
import type { ProfileLabel } from "@/lib/intake-engine";
import { INTERVENTION_DOMAIN_SCORE_KEYS } from "@/lib/intake-engine";
import type { ResolvedNurtureCta } from "@/lib/resolve-nurture-cta";
import type { NurturePlanGate } from "@/lib/content/nurture-interventions";
import { resolveDomainSupplementTip } from "@/lib/resolve-domain-supplement-tip";
import type { RecommendationInput } from "@/types/recommendation";

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
  | "recovery_score"
  | "connection_score";

export type ProfileLabelName = ProfileLabel["name"];

export type NurtureProfileKey = ProfileLabelName | "Overtrainer";

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

// Domain-specifieke supplement-tips (dag 14) — via resolveDomainSupplementTip + shared gate.

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
//   sleep                  → "Onrustige Slaper"
//   stress                 → "Stressdrager"
//   lage energie/beweging → "Lage Batterij"
//   (lage voeding/herstel als zwakste domein) → "In Balans" of ander benoemd profiel als fallback
//   (all > 60)→ "In Balans"
// ============================================================

export const nurtureContent: Record<
  TemplateKey,
  Record<NurtureProfileKey, NurtureBlock>
> = {
  // ── DAG 0: WELKOM ────────────────────────────────────────
  day0_welcome: {
    "Lage Batterij": {
      subject: "Je leefstijl-overzicht staat klaar",
      preheader: "Je energiescore laat zien waar de winst zit",
      greeting: "Goed dat je de Leefstijlcheck hebt gedaan.",
      bodyParagraphs: [
        "Je resultaten laten zien dat je energie structureel onder druk staat. Dat is niet 'gewoon ouder worden' — het is een signaal dat je lichaam iets mist.",
        "In je leefstijl-overzicht vind je concrete stappen die je deze week al kunt nemen. Geen grote veranderingen, maar slimme eerste stappen.",
      ],
      tip: "Begin vandaag met één ding: eet binnen 30 minuten na het opstaan een eiwitrijk ontbijt. Dit stabiliseert je bloedsuiker en geeft je ochtendenergie een boost.",
      cta: { text: "Bekijk je leefstijl-overzicht", url: "/intake" },
    },
    "Onrustige Slaper": {
      subject: "Je leefstijl-overzicht staat klaar",
      preheader: "Je slaapscore laat zien waar je kunt verbeteren",
      greeting: "Goed dat je de Leefstijlcheck hebt gedaan.",
      bodyParagraphs: [
        "Je gaf aan dat slaap nu een aandachtspunt is. Dat raakt vaak ook je energie, je stemming en je herstel.",
        "Het goede nieuws: slaap is een van de domeinen waar je het snelst verbetering kunt zien met de juiste aanpassingen.",
      ],
      tip: "Probeer vanavond je schermtijd te stoppen 60 minuten voor het slapengaan. Lees een boek, doe een ademhalingsoefening, of ga gewoon even zitten. Je brein heeft dat signaal nodig om af te schakelen.",
      cta: { text: "Bekijk je leefstijl-overzicht", url: "/intake" },
    },
    "Stressdrager": {
      subject: "Je leefstijl-overzicht staat klaar",
      preheader: "Je stresspatroon verdient aandacht",
      greeting: "Goed dat je de Leefstijlcheck hebt gedaan.",
      bodyParagraphs: [
        "Je resultaten laten zien dat stress een structurele rol speelt in hoe je je voelt. Dat is niet zwak — het is je lichaam dat aangeeft dat het herstel nodig heeft.",
        "Aanhoudende stress wordt vaak als belastend ervaren — voor je slaap, je energie en je veerkracht. Het goede nieuws: er zijn concrete stappen die helpen.",
      ],
      tip: "Begin vandaag met 3 minuten ademhalingsoefening: 4 tellen inademen, 7 tellen vasthouden, 8 tellen uitademen. Doe dit voor het slapengaan. Het activeert je parasympathisch zenuwstelsel.",
      cta: { text: "Bekijk je leefstijl-overzicht", url: "/intake" },
    },
    "In Balans": {
      subject: "Je leefstijl-overzicht staat klaar",
      preheader: "Je scoort goed — hier is hoe je het nog beter maakt",
      greeting: "Goed dat je de Leefstijlcheck hebt gedaan.",
      bodyParagraphs: [
        "Je scores laten een solide basis zien. Dat is niet vanzelfsprekend — het is het resultaat van bewuste keuzes.",
        "Nu is het moment om te kijken hoe je die basis kunt vasthouden en op bepaalde punten kunt optimaliseren. Want ook een goede basis heeft onderhoud nodig.",
      ],
      tip: "Focus deze week op één domein dat je wilt verfijnen. Bekijk je leefstijl-overzicht en kies het gebied met de meeste groeimogelijkheid.",
      cta: { text: "Bekijk je leefstijl-overzicht", url: "/intake" },
    },
    Overtrainer: {
      subject: "Je leefstijl-overzicht staat klaar",
      preheader: "Herstel vraagt nu je aandacht — niet harder trainen",
      greeting: "Goed dat je de Leefstijlcheck hebt gedaan.",
      bodyParagraphs: [
        "Je scores laten zien dat je lichaam meer rust nodig heeft dan je trainingsvolume suggereert. Dat is geen zwakte — het is een signaal dat volume en herstel uit balans zijn.",
        "De eerste stap is niet harder trainen, maar twee lichte dagen plannen en slaap prioriteren.",
      ],
      tip: "Plan vandaag welke twee zware sessies deze week je schrapt of vervangt door licht bewegen.",
      cta: { text: "Bekijk je profiel", url: "/profiel/overtrainer" },
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
      cta: { text: "Bekijk je leefstijl-overzicht", url: "/intake" },
    },
    "Onrustige Slaper": {
      subject: "3 dingen die je slaap deze week verbeteren",
      preheader: "Vanavond al beter slapen",
      greeting: "Drie dagen geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Slaapverbetering begint niet in bed — het begint overdag. Je lichaam heeft signalen nodig om te weten dat het tijd is om af te schakelen.",
      ],
      tip: "Quick win #1: Slaapkamer op 18°C (koel slapen = dieper slapen). Quick win #2: Geen schermen 60 min voor bed. Quick win #3: Zelfde bedtijd, ook in het weekend — je circadiaan ritme heeft regelmaat nodig.",
      cta: { text: "Bekijk je leefstijl-overzicht", url: "/intake" },
    },
    "Stressdrager": {
      subject: "3 stressverlagers die je vandaag kunt proberen",
      preheader: "Geen meditatiecursus nodig",
      greeting: "Drie dagen geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Stress verminderen hoeft niet ingewikkeld te zijn. Het gaat niet om grote veranderingen, maar om kleine momenten van herstel verspreid over de dag.",
      ],
      tip: "Quick win #1: 4-7-8 ademhaling (3 minuten, 2× per dag). Quick win #2: Wandel 15 minuten na de lunch — het verlaagt cortisol meetbaar. Quick win #3: Schrijf 's avonds 3 dingen op die goed gingen vandaag.",
      cta: { text: "Lees de praktische stressgids", url: "/stress-verminderen-na-40" },
    },
    "In Balans": {
      subject: "3 optimalisaties voor wie al goed scoort",
      preheader: "Je basis staat — dit zijn de volgende stappen",
      greeting: "Drie dagen geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Als je al goed scoort, zit de winst in de details. Kleine optimalisaties op het gebied van voeding, slaapkwaliteit en herstel leveren merkbaar verschil op.",
      ],
      tip: "Quick win #1: Eet 2× per week vette vis voor je omega-3 inname. Quick win #2: Controleer je slaapkwaliteit — even wakker worden is normaal, maar diepe slaap is cruciaal. Quick win #3: Plan één echte rustdag per week in.",
      cta: { text: "Bekijk je leefstijl-overzicht", url: "/intake" },
    },
    Overtrainer: {
      subject: "Wat doe je deze week minder?",
      preheader: "Volume terug — herstel eerst",
      greeting: "Drie dagen geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Meer trainen is nu niet de oplossing. Je lichaam vraagt om ruimte om bij te komen — dat begint met minder belasting, niet met harder pushen.",
      ],
      tip: "Kies 2 zware sessies deze week en maak ze licht of schrap ze. Vervang ze door 30–40 minuten wandelen zonder stopwatch.",
      cta: { text: INTAKE_CTA.nurtureOverview, url: "/intake" },
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
      // Overschreven op dag 7 door resolveLifestyleTipForDay (DAY_TIP_INDEX).
      tip: "Deze week: check je vispatroon en eiwitrijke maaltijden — voeding is de eerste hefboom voor energie.",
      cta: { text: "Lees over energie na 40", url: "/energie-na-40" },
    },
    "Onrustige Slaper": {
      subject: "Slaap en brein: wat onderzoek laat zien",
      preheader: "Slaap is geen luxe — het is herstel",
      greeting: "Een week geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Tijdens diepe slaap ruimt je brein afvalstoffen op via het glymfatisch systeem. Je spieren herstellen, je immuunsysteem wordt bijgevuld, en je groeihormoon piekt. Als die diepe slaap ontbreekt, bouw je een slaapschuld op die veel plekken raken.",
        "Een rustig zenuwstelsel vóór het slapen is de hefboom: een vast avondritueel, gedimd licht en geen schermen het laatste halfuur helpen je systeem schakelen naar herstel.",
      ],
      // Overschreven op dag 7 door resolveLifestyleTipForDay (DAY_TIP_INDEX).
      tip: "Vaste bedtijd en gedimd licht het laatste halfuur — je zenuwstelsel heeft dat signaal nodig om af te schakelen.",
      cta: { text: "Lees de slaapgids voor mannen 40+", url: "/slaap-verbeteren-na-40" },
    },
    "Stressdrager": {
      subject: "Hoe chronische stress je lichaam beïnvloedt — en wat je kunt doen",
      preheader: "Cortisol is niet de vijand — chronisch cortisol wel",
      greeting: "Een week geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Langdurige activering van de stress‑as heeft invloed op hormonen en nachtrust. Leefstijl (slaapritme, beweging, voorspelbare routines) wil je daarom eerst goed bekijken.",
        "De eerste stap is leefstijl: een vast slaapritme, dagelijkse beweging en korte rustmomenten. Pas als die basis staat, is een gerichte aanvulling zinvol om te overwegen.",
      ],
      tip:
        "Focus deze week op één vaste routine: dezelfde bedtijd, 10 minuten wandelen na de lunch, en 3 minuten ademhaling voor het slapen.",
      cta: { text: "Lees de praktische stressgids", url: "/stress-verminderen-na-40" },
    },
    "In Balans": {
      subject: "Hoe je een goede basis vasthoudt na 40",
      preheader: "Behoud vraagt dezelfde aandacht als opbouw",
      greeting: "Een week geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Een goede leefstijlbasis onderhoud je niet automatisch — het vraagt bewuste keuzes die je elke week opnieuw maakt. De mannen die na 40 vitaal blijven, zijn niet geluksvogels: ze hebben goede gewoontes die ze vasthouden.",
        "Nu is het moment om te kijken waar nog winst zit. Voor de meeste mannen ligt die in voeding: vaker vette vis, meer variatie, en consistent vasthouden wat al werkt.",
      ],
      // Overschreven op dag 7 door resolveLifestyleTipForDay (DAY_TIP_INDEX).
      tip: "Check je voedingspatroon: vaker vette vis en meer variatie op je bord houden je basis sterk.",
      cta: { text: "Bekijk je leefstijl-overzicht", url: "/intake" },
    },
    Overtrainer: {
      subject: "Herstel vraagt meer dan training",
      preheader: "Slaap en volume bepalen je vooruitgang",
      greeting: "Een week geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Na 40 is de marge tussen flinke vooruitgang en te weinig herstel kleiner. Dezelfde weekstructuur vraagt vaker om extra rust dan tien jaar geleden.",
        "Supplementen komen pas nadat volume en slaap eerlijk zijn tegen het licht gehouden.",
      ],
      tip: "30–40 minuten wandelen zonder stopwatch — geen interval, geen PR. Alleen bewegen om je systeem te laten landen.",
      cta: { text: "Lees het herstelthema", url: "/gids/herstel" },
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
      cta: { text: "Vergelijk omega-3 supplementen", url: "/beste/omega-3-supplement" },
    },
    "Onrustige Slaper": {
      subject: "Halverwege: slaapt het al wat beter?",
      preheader: "Je slaappatroon verandert niet in één nacht",
      greeting: "Twee weken geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Slaapverbetering is een proces. Je circadiaan ritme heeft 1-2 weken nodig om zich aan te passen aan een nieuw patroon. Als je consistent bent geweest met je bedtijd en schermtijd, zou je nu de eerste resultaten kunnen merken.",
        "Als je nog geen verbetering voelt: geef het nog een week. Consistentie is belangrijker dan perfectie.",
      ],
      tip: "Probeer vanavond voor bed een gangbare magnesiumdosis (volg etiket) en houd 2 uur afstand van bepaalde medicijnen; EFSA‑claims richten zich op zenuwstelsel, spieren, psychologische functie en vermoeidheid.",
      cta: { text: "Welk magnesium is het beste voor slaap?", url: "/beste/magnesium" },
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
      cta: { text: "Lees de praktische stressgids", url: "/stress-verminderen-na-40" },
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
      cta: { text: "Vergelijk omega-3 supplementen", url: "/beste/omega-3-supplement" },
    },
    Overtrainer: {
      subject: "Halverwege: hoe voelt je herstel?",
      preheader: "Slaapkwaliteit check-in",
      greeting: "Twee weken geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Als je volume hebt teruggeschroefd, zou je lichaam langzaam meer ruimte moeten voelen. Het effect is niet lineair — sommige dagen voelen beter, andere niet.",
        "Slaap is nu je belangrijkste hefboom: halfuur eerder naar bed heeft meer impact dan nog een supplement.",
      ],
      tip: "Halfuur eerder naar bed, 2 avonden op rij. Geen schermen in die extra halfuur — lezen of stil zitten is genoeg.",
      cta: { text: INTAKE_CTA.nurtureOverview, url: "/intake" },
    },
  },

  // ── DAG 21: MOMENTUM ─────────────────────────────────────
  day21_momentum: {
    "Lage Batterij": {
      subject: "Drie weken: je bouwt momentum op",
      preheader: "De gewoontes die je nu hebt, bepalen hoe je je over een maand voelt",
      greeting: "Drie weken geleden startte je met je leefstijl-overzicht.",
      bodyParagraphs: [
        "Na drie weken begin je de grens te bereiken waar gewoontes makkelijker worden. De inspanning om je ochtendroutine vol te houden voelt minder — dat is je brein dat een nieuw patroon aanleert.",
        "Over 9 dagen ontvang je een herinnering om de Leefstijlcheck opnieuw te doen. Dan kun je meten wat er veranderd is.",
      ],
      tip: "Houd vol wat werkt. Voeg deze week niets nieuws toe — consolideer wat je hebt.",
      cta: { text: "Vergelijk omega-3 supplementen", url: "/beste/omega-3-supplement" },
    },
    "Onrustige Slaper": {
      subject: "Drie weken: je slaapritme vindt zijn weg",
      preheader: "Consistentie is de sleutel — en je bent er bijna",
      greeting: "Drie weken geleden startte je met je leefstijl-overzicht.",
      bodyParagraphs: [
        "Na drie weken consistent slaapritme begint je lichaam zich aan te passen. Je circadiaan ritme wordt sterker, je melatonineproductie komt op gang op het juiste moment.",
        "Over 9 dagen kun je de Leefstijlcheck opnieuw doen. Dan zie je zwart-op-wit of je slaapscore is verbeterd.",
      ],
      tip: "Houd je slaapritme vast — ook in het weekend. Dat is het moeilijkste, maar ook het belangrijkste.",
      cta: { text: "Vergelijk magnesium supplementen", url: "/beste/magnesium" },
    },
    "Stressdrager": {
      subject: "Drie weken: je stressbuffer groeit",
      preheader: "Elke dag dat je oefent, wordt de buffer sterker",
      greeting: "Drie weken geleden startte je met je leefstijl-overzicht.",
      bodyParagraphs: [
        "Stressmanagement is als spiertraining: het wordt sterker door herhaling. Na drie weken ademhalingsoefeningen en bewuste rustmomenten, is je cortisolrespons aan het veranderen.",
        "Over 9 dagen kun je de Leefstijlcheck opnieuw doen. Dan meet je of je stressscore is verbeterd.",
      ],
      tip: "Houd deze week vast wat werkt. Consistentie verslaat intensiteit.",
      cta: { text: "Bekijk je leefstijl-overzicht", url: "/intake" },
    },
    "In Balans": {
      subject: "Drie weken: je goede gewoontes zijn stevig",
      preheader: "Nu is het moment om te optimaliseren",
      greeting: "Drie weken geleden startte je met je leefstijl-overzicht.",
      bodyParagraphs: [
        "Na drie weken consistent goede gewoontes zijn ze steviger verankerd. Dit is het moment om te kijken of er een supplement is dat je basis versterkt.",
        "Over 9 dagen kun je de Leefstijlcheck opnieuw doen. Wees benieuwd of je scores nog beter zijn geworden.",
      ],
      tip: "Overweeg omega‑3 als je weinig vis eet: EU‑claims gaan over hart en (DHA) hersenen — geen etiketclaim op ‘meer energie’.",
      cta: { text: "Vergelijk omega-3 supplementen", url: "/beste/omega-3-supplement" },
    },
    Overtrainer: {
      subject: "Drie weken: magnesium als aanvulling?",
      preheader: "Alleen na volume en slaap eerlijk gehouden",
      greeting: "Drie weken geleden startte je met je leefstijl-overzicht.",
      bodyParagraphs: [
        "Als je volume hebt teruggeschroefd en slaap hebt geprioriteerd, kun je nu kijken of magnesium je herstel ondersteunt — niet als vervanging van rust, maar als aanvulling.",
        "Magnesium draagt bij tot normale spierfunctie en vermindering van vermoeidheid onder EFSA-voorwaarden.",
      ],
      tip: "Check eerlijk: heb je echt 2 lichte dagen gehad en slaap voorrang gegeven? Pas dan is supplement de volgende stap.",
      cta: { text: INTAKE_CTA.nurtureOverview, url: "/intake" },
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
        "De herhaalmeting geeft je een nieuw leefstijl-overzicht met geüpdatete aanbevelingen op basis van je huidige situatie.",
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
    Overtrainer: {
      subject: "30 dagen: vergelijk je recovery-score",
      preheader: "Hermeting laat zien of volume en slaap hebben gewerkt",
      greeting: "Een maand geleden deed je de Leefstijlcheck.",
      bodyParagraphs: [
        "Je hebt een maand gericht op volume terug en slaap eerst. De herhaalmeting laat je zien of je recovery-score is verbeterd — en waar nog winst zit.",
      ],
      tip: "Doe de Leefstijlcheck opnieuw en vergelijk je recovery-score met de start.",
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
  const domains = INTERVENTION_DOMAIN_SCORE_KEYS as DomainKey[];

  let weakest: DomainKey = domains[0];
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

const ALL_DOMAINS: DomainKey[] = [...INTERVENTION_DOMAIN_SCORE_KEYS];

export function getDomainsByScoreAscending(
  domainScores: Record<string, number>,
): DomainKey[] {
  return [...ALL_DOMAINS].sort((left, right) => {
    const leftScore = domainScores[left] ?? 100;
    const rightScore = domainScores[right] ?? 100;
    return leftScore - rightScore;
  });
}

const LIFESTYLE_TIP_BY_DOMAIN: Record<DomainKey, string> = {
  stress_score: "5 min ademhaling vóór je telefoon pakt — vandaag nog.",
  sleep_score: "Vaste bedtijd, 3 nachten aanhouden — ook in het weekend.",
  energy_score: "Eiwitrijk eerste moment na opstaan — vóór de tweede kop koffie.",
  recovery_score: "Plan 2 lichte dagen deze week — schrap of verlicht zware sessies.",
  movement_score: "10 min daglicht vóór 10:00 — buiten, zonder telefoon.",
  nutrition_score: "2× deze week vette vis of eiwitrijke lunch — geen perfect dieet nodig.",
  connection_score:
    "Plan deze week één betekenisvol contact — kort bellen of samen iets doen telt.",
};

const DAY_TIP_INDEX: Partial<Record<number, number>> = {
  3: 0,
  7: 1,
  14: 2,
};

function urgencyTipPrefix(urgencyLevel: string): string {
  if (urgencyLevel === "critical") {
    return "Doe dit vandaag: ";
  }
  if (urgencyLevel === "mild" || urgencyLevel === "healthy") {
    return "Kleine optimalisatie: ";
  }
  return "";
}

export function resolveLifestyleTipForDay(
  domainScores: Record<string, number>,
  sequenceDay: number,
  urgencyLevel: string,
): string | null {
  const resolved = resolveLifestyleTipDomainForDay(
    domainScores,
    sequenceDay,
    urgencyLevel,
  );
  return resolved?.tip ?? null;
}

export function resolveLifestyleTipDomainForDay(
  domainScores: Record<string, number>,
  sequenceDay: number,
  urgencyLevel: string,
): { tip: string; domain: DomainKey } | null {
  const index = DAY_TIP_INDEX[sequenceDay];
  if (index === undefined) {
    return null;
  }
  const sorted = getDomainsByScoreAscending(domainScores);
  const domain = sorted[index] ?? sorted[0];
  const tip = `${urgencyTipPrefix(urgencyLevel)}${LIFESTYLE_TIP_BY_DOMAIN[domain]}`;
  return { tip, domain };
}

export function pickLifestyleTipFromOtherDomain(
  domainScores: Record<string, number>,
  excludeDomain: DomainKey,
  urgencyLevel: string,
): string {
  const sorted = getDomainsByScoreAscending(domainScores);
  const other = sorted.find((domain) => domain !== excludeDomain) ?? sorted[0];
  return `${urgencyTipPrefix(urgencyLevel)}${LIFESTYLE_TIP_BY_DOMAIN[other]}`;
}

export function nurtureOutputHasCrossDomainBalance(
  tipDomain: DomainKey,
  supplementDomain: DomainKey,
): boolean {
  return tipDomain !== supplementDomain;
}

const KNOWN_PROFILES: ProfileLabelName[] = [
  "Onrustige Slaper",
  "Lage Batterij",
  "Stressdrager",
  "In Balans",
];

export function resolveNurtureProfileKey(
  profileLabel: string,
  domainScores: Record<string, number>,
): NurtureProfileKey {
  const trimmed = profileLabel.trim();
  if (trimmed === "Stilzitter" || trimmed === "Stille Slijter") {
    return "Lage Batterij";
  }
  if (trimmed === "Overtrainer") {
    return "Overtrainer";
  }
  const movementScore = domainScores.movement_score;
  const recoveryScore = domainScores.recovery_score;
  if (
    Number.isFinite(movementScore) &&
    Number.isFinite(recoveryScore) &&
    movementScore >= 43 &&
    recoveryScore <= 35
  ) {
    return "Overtrainer";
  }
  if ((KNOWN_PROFILES as string[]).includes(trimmed)) {
    return trimmed as ProfileLabelName;
  }
  return "In Balans";
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
  opts?: {
    planGate?: NurturePlanGate | null;
    resolvedCta?: ResolvedNurtureCta;
    profileKey?: NurtureProfileKey;
    input?: RecommendationInput | null;
  },
): {
  subject: string;
  preheader: string;
  blocks: NurtureBlock;
  supplementTip: DomainSupplementTip | null;
  urgencyTone: string;
} {
  const templateKey = sequenceDayToTemplateKey(sequenceDay);
  const profileKey =
    opts?.profileKey ??
    resolveNurtureProfileKey(profileLabel, domainScores);

  const dayContent = nurtureContent[templateKey];
  const blocksBase =
    dayContent[profileKey] ?? dayContent["In Balans"];

  let blocks = opts?.resolvedCta
    ? {
        ...blocksBase,
        cta: { text: opts.resolvedCta.text, url: opts.resolvedCta.url },
      }
    : { ...blocksBase };

  const lifestyleTip = resolveLifestyleTipForDay(
    domainScores,
    sequenceDay,
    urgencyLevel,
  );
  if (lifestyleTip) {
    blocks = { ...blocks, tip: lifestyleTip };
  }

  const weakestDomain = getWeakestDomain(domainScores);

  const showSupplementTip = ["day14_halfweg"].includes(templateKey);
  const supplementTip = showSupplementTip
    ? resolveDomainSupplementTip(
        weakestDomain,
        opts?.planGate ?? null,
        opts?.input ?? null,
      )
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
