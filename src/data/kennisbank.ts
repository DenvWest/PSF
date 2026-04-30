export type KennisbankTheme =
  | 'lichaam-veroudering'
  | 'leefstijl-herstel'
  | 'supplementwetenschap'
  | 'longevity'

export interface KennisbankTerm {
  slug: string
  term: string
  theme: KennisbankTheme
  shortDefinition: string
  content: {
    whatIsIt: string
    howItWorks: string
    whyItMatters: string
  }
  relatedSlugs: string[]
  relatedComparisons: string[]
  metaTitle: string
  metaDescription: string
}

export const themeLabels: Record<KennisbankTheme, {
  title: string
  description: string
  icon: string
  colorClasses: {
    bg: string
    accent: string
    tekst: string
  }
}> = {
  'lichaam-veroudering': {
    title: 'Lichaam & Veroudering',
    description: 'Wat er fysiologisch verandert na je 40e — en waarom dat niet het einde is.',
    icon: '🧬',
    colorClasses: {
      bg: 'from-rose-950 to-rose-900',
      accent: 'bg-white/10 ring-white/20',
      tekst: 'text-rose-200/80',
    },
  },
  'leefstijl-herstel': {
    title: 'Leefstijl & Herstel',
    description: 'De basis die op orde moet zijn vóórdat supplementen zin hebben.',
    icon: '🌿',
    colorClasses: {
      bg: 'from-emerald-950 to-emerald-900',
      accent: 'bg-white/10 ring-white/20',
      tekst: 'text-emerald-200/80',
    },
  },
  supplementwetenschap: {
    title: 'Supplementwetenschap',
    description: 'De begrippen die je nodig hebt om supplementen eerlijk te beoordelen.',
    icon: '🔬',
    colorClasses: {
      bg: 'from-sky-950 to-sky-900',
      accent: 'bg-white/10 ring-white/20',
      tekst: 'text-sky-200/80',
    },
  },
  longevity: {
    title: 'Longevity & Gezond Ouder Worden',
    description: 'Het grotere plaatje: niet langer leven, maar langer goed leven.',
    icon: '⏳',
    colorClasses: {
      bg: 'from-amber-950 to-amber-900',
      accent: 'bg-white/10 ring-white/20',
      tekst: 'text-amber-200/80',
    },
  },
}

export const kennisbankTerms: KennisbankTerm[] = [
  {
    slug: 'biobeschikbaarheid',
    term: 'Biobeschikbaarheid',
    theme: 'supplementwetenschap',
    shortDefinition: 'Het percentage van een stof dat je lichaam daadwerkelijk opneemt en kan gebruiken.',
    content: {
      whatIsIt: `Niet alles wat je slikt, komt ook aan waar het moet zijn. Biobeschikbaarheid is het percentage van een ingenomen stof dat daadwerkelijk je bloedbaan bereikt en door je cellen gebruikt kan worden. Dit verschilt enorm per supplementvorm — bij sommige vormen neemt je lichaam slechts 4% op, bij andere meer dan 80%.

Het verschil tussen wat je inneemt en wat je lichaam benut, is vaak groter dan je denkt. Een hoge dosering op het etiket zegt weinig als je lichaam het meeste ongebruikt weer uitscheidt.`,
      howItWorks: `Drie factoren bepalen hoeveel je lichaam opneemt:

De chemische vorm van de stof. Magnesiumoxide heeft een biobeschikbaarheid van ongeveer 4%. Magnesiumglycinaat komt uit op zo'n 80%. Hetzelfde mineraal, compleet andere opname.

Of je het met voedsel inneemt. Vetoplosbare stoffen (zoals vitamine D en omega-3) worden beter opgenomen met een vetrijke maaltijd.

Je individuele darmgezondheid. Ontstekingen, medicijngebruik of een verstoord microbioom kunnen de opname verlagen.`,
      whyItMatters: `Een goedkoop supplement met lage biobeschikbaarheid is uiteindelijk duurder dan het lijkt. De relevante maat is niet de prijs per capsule, maar de prijs per daadwerkelijk opgenomen milligram. Daarom weegt biobeschikbaarheid 25% mee in onze beoordelingsmethodiek.`,
    },
    relatedSlugs: ['chelaatvorm'],
    relatedComparisons: ['/beste-magnesium', '/beste-omega-3-supplement', '/beste-ashwagandha', '/beste-vitamine-d', '/beste-creatine', '/beste-zink'],
    metaTitle: 'Biobeschikbaarheid: Wat Het Is en Waarom Het Matteert',
    metaDescription: 'Niet alles wat je slikt wordt opgenomen. Biobeschikbaarheid bepaalt hoeveel je lichaam écht gebruikt. Uitgelegd in begrijpelijke taal.',
  },
  {
    slug: 'chelaatvorm',
    term: 'Chelaatvorm',
    theme: 'supplementwetenschap',
    shortDefinition: 'Een mineraal gebonden aan een aminozuur, waardoor je lichaam het veel beter opneemt.',
    content: {
      whatIsIt: `Chelaat komt van het Griekse "chele" — klauw. Bij een chelaatvorm wordt een mineraal vastgepakt door een aminozuur. Dit maakt het herkenbaar voor je darmwand, waardoor het als voedingsstof wordt opgenomen in plaats van als losse chemische verbinding.

Voorbeelden die je op etiketten tegenkomt: magnesiumbisglycinaat, zinkpicolinaat, ijzerbisglychinaat. Het aminozuur in de naam verraadt de chelaatvorm.`,
      howItWorks: `Losse mineralen (zoals magnesiumoxide of calciumcarbonaat) reageren met maagzuur en andere stoffen in je spijsvertering. Een groot deel gaat verloren voordat het je dunne darm bereikt.

Een gecheleerd mineraal is beschermd door het aminozuur. Het reist intact naar je dunne darm, waar het via aminozuur-transporters wordt opgenomen — dezelfde route als eiwitten uit voeding. Dit verklaart het grote verschil in biobeschikbaarheid tussen vormen.`,
      whyItMatters: `Als je op een etiket "glycinaat" of "bisglycinaat" ziet, is dat een chelaatvorm. "Oxide" of "carbonaat" zijn dat niet. Dit onderscheid bepaalt of je supplement daadwerkelijk werkt of grotendeels ongebruikt je lichaam verlaat. Chelaatvorm is een van de eerste dingen waar wij op letten bij het beoordelen van minerale supplementen.`,
    },
    relatedSlugs: ['biobeschikbaarheid'],
    relatedComparisons: ['/beste-magnesium', '/beste-zink'],
    metaTitle: 'Chelaatvorm: Waarom de Vorm van je Mineraal Ertoe Doet',
    metaDescription: 'Chelaatvorm betekent dat een mineraal gebonden is aan een aminozuur. Dit verhoogt de opname drastisch. Simpel uitgelegd.',
  },
  {
    slug: 'adaptogens',
    term: 'Adaptogens',
    theme: 'supplementwetenschap',
    shortDefinition: 'Plantaardige stoffen die je lichaam helpen zich aan te passen aan stress, zonder het te forceren.',
    content: {
      whatIsIt: `Adaptogens zijn een categorie planten en paddenstoelen die al eeuwen gebruikt worden in Ayurveda en traditionele Chinese geneeskunde. De term werd in 1947 geïntroduceerd door de Russische farmacoloog Nikolai Lazarev.

Het bijzondere aan adaptogens is dat ze niet in één richting werken. Ze helpen je lichaam balans vinden. Is je cortisol te hoog? Ze ondersteunen verlaging. Te laag? Ze helpen normalisatie. Vandaar de naam: ze helpen je lichaam zich aan te passen.`,
      howItWorks: `Adaptogens werken via de HPA-as — het stressresponssysteem dat loopt van je hypothalamus via je hypofyse naar je bijnieren. Bij chronische stress raakt dit systeem overbelast.

Adaptogens moduleren de communicatie binnen deze as en ondersteunen een gezonde cortisolcurve. De meest onderzochte adaptogens zijn ashwagandha (met name het KSM-66 extract), rhodiola rosea en lion's mane.`,
      whyItMatters: `Voor mannen na 40 met aanhoudende stress is de HPA-as vaak langdurig overbelast. Adaptogens zijn geen wondermiddel, maar de wetenschappelijke onderbouwing groeit — vooral voor ashwagandha zijn er inmiddels meerdere dubbelblinde, placebogecontroleerde studies die effecten op cortisol en slaapkwaliteit aantonen.`,
    },
    relatedSlugs: ['circadiaan-ritme'],
    relatedComparisons: ['/beste-ashwagandha'],
    metaTitle: 'Adaptogens: Wat Ze Zijn en Hoe Ze Werken',
    metaDescription: 'Adaptogens helpen je lichaam omgaan met stress. Van ashwagandha tot rhodiola — wat zegt de wetenschap? Helder uitgelegd.',
  },
  {
    slug: 'epa-dha',
    term: 'EPA en DHA',
    theme: 'supplementwetenschap',
    shortDefinition: 'De twee actieve omega-3 vetzuren die je lichaam niet zelf aanmaakt.',
    content: {
      whatIsIt: `EPA (eicosapentaeenzuur) en DHA (docosahexaeenzuur) zijn de twee omega-3 vetzuren waar het werkelijk om draait. ALA — de plantaardige omega-3 uit lijnzaad en walnoten — wordt soms ook omega-3 genoemd, maar je lichaam zet slechts 5-10% daarvan om naar EPA en DHA.

Vette vis (zalm, makreel, haring) en algen zijn de directe bronnen. Voor wie weinig vis eet, is een supplement met geconcentreerde EPA en DHA de meest praktische route.`,
      howItWorks: `EPA is vooral betrokken bij ontstekingsprocessen — het helpt ontstekingsreacties reguleren. DHA is een bouwsteen van je hersenen (zo'n 40% van de vetzuren in je hersenen is DHA) en je netvlies.

EFSA-goedgekeurde claims: EPA+DHA dragen bij aan een normale hartfunctie (bij 250 mg/dag). DHA draagt bij aan normale hersenfunctie en een normaal gezichtsvermogen (bij 250 mg DHA/dag). Let op: er bestaat géén goedgekeurde EFSA-claim voor energie of vermoeidheid.`,
      whyItMatters: `Bij het vergelijken van omega-3 supplementen is de totale visolie per capsule misleidend. Waar je op moet letten is de EPA+DHA-concentratie. Een capsule van 1000 mg visolie met slechts 300 mg EPA+DHA is veel minder effectief dan een capsule met 900 mg EPA+DHA. Dit verschil bepaalt zowel de effectiviteit als de werkelijke prijs per werkzame dosis.`,
    },
    relatedSlugs: ['biobeschikbaarheid'],
    relatedComparisons: ['/beste-omega-3-supplement'],
    metaTitle: 'EPA en DHA: De Omega-3 Vetzuren Die Ertoe Doen',
    metaDescription: 'EPA en DHA zijn de actieve omega-3 vetzuren. Wat doen ze, hoeveel heb je nodig, en waar let je op? Duidelijk uitgelegd.',
  },
  {
    slug: 'circadiaan-ritme',
    term: 'Circadiaan Ritme',
    theme: 'lichaam-veroudering',
    shortDefinition: 'Je interne 24-uursklok die slaap, hormonen, energie en stofwisseling aanstuurt.',
    content: {
      whatIsIt: `Je circadiaan ritme is een biologische klok die in vrijwel elke cel van je lichaam tikt. Het wordt aangestuurd door een klein klompje hersencellen — de suprachiasmatische nucleus — en gesynchroniseerd door licht.

Dit ritme bepaalt wanneer je melatonine aanmaakt (slaap), wanneer je cortisol piekt (wakker worden), wanneer je spijsvertering het actiefst is, en wanneer je lichaam het efficiëntst herstelt. Het is niet alleen een slaapklok — het stuurt je hele fysiologie aan.`,
      howItWorks: `Licht via je netvlies signaleert aan je biologische klok of het dag of nacht is. Overdag: cortisol omhoog, melatonine omlaag, alertheid en spijsvertering actief. Bij duisternis: cortisol omlaag, melatonine omhoog, herstelprocessen geactiveerd.

Na 40 wordt dit systeem gevoeliger voor verstoring. Blauw licht van schermen onderdrukt je melatonineproductie sterker, onregelmatige bedtijden verstoren het ritme sneller, en je cortisolcurve vlakt af — waardoor je 's ochtends trager op gang komt en 's avonds minder goed afschakelt.`,
      whyItMatters: `Een verstoord circadiaan ritme beïnvloedt niet alleen je slaap, maar ook je hormoonbalans, energieniveau, gewicht en herstelvermogen. Het verklaart waarom je 7 uur slaapt maar toch moe wakker wordt — het is niet altijd de kwantiteit, maar de timing en kwaliteit die uit zijn. Goed slaapritme is het fundament waar leefstijlverbeteringen en supplementen op bouwen.`,
    },
    relatedSlugs: ['adaptogens'],
    relatedComparisons: ['/beste-magnesium', '/beste-ashwagandha'],
    metaTitle: 'Circadiaan Ritme: Je Interne Klok Uitgelegd',
    metaDescription: 'Je circadiaan ritme stuurt slaap, hormonen en energie aan. Na 40 wordt het gevoeliger. Wat kun je eraan doen?',
  },
  {
    slug: 'healthspan',
    term: 'Healthspan',
    theme: 'longevity',
    shortDefinition: 'Het aantal jaren dat je in goede gezondheid leeft — niet hoe oud je wordt, maar hoe goed.',
    content: {
      whatIsIt: `Lifespan is hoe lang je leeft. Healthspan is hoe lang je goed leeft — zonder chronische ziekten, zonder dagelijkse beperkingen, met energie en veerkracht. Het verschil tussen die twee noemen onderzoekers de "morbidity gap": de jaren aan het einde van je leven die je in slechte gezondheid doorbrengt.

In Nederland is de gemiddelde levensverwachting rond de 82 jaar. Maar de gemiddelde gezonde levensverwachting ligt op ongeveer 64. Dat betekent gemiddeld 18 jaar met beperkingen. Healthspan-denken draait om het verkleinen van die kloof.`,
      howItWorks: `Healthspan wordt bepaald door een samenspel van factoren: metabole gezondheid, spiermassa, cardiovasculaire fitheid, cognitieve functie en chronische ontsteking. Na 40 versnellen de meeste van deze processen — maar ze zijn grotendeels beïnvloedbaar.

De vijf pijlers waar onderzoekers naar kijken: slaapkwaliteit, voedingspatroon, beweging (met name krachttraining en VO2max), stressmanagement en sociale verbinding. Supplementen spelen een ondersteunende rol, maar pas nadat deze pijlers staan.`,
      whyItMatters: `PerfectSupplement is gebouwd vanuit healthspan-denken. Daarom staat leefstijl altijd op nummer één en supplementen op nummer twee. De Leefstijlcheck meet niet of je supplementen nodig hebt — hij meet hoe sterk je fundament is. Want een supplement op een zwak fundament is als een dakkapel op een rot dak.`,
    },
    relatedSlugs: ['circadiaan-ritme'],
    relatedComparisons: [],
    metaTitle: 'Healthspan: Niet Hoe Lang, Maar Hoe Goed Je Leeft',
    metaDescription: 'Healthspan is het aantal gezonde jaren. Na 40 wordt het verschil met lifespan groter. Maar je kunt er iets aan doen.',
  },
]

export function getTermBySlug(slug: string): KennisbankTerm | undefined {
  return kennisbankTerms.find((t) => t.slug === slug)
}

export function getTermsByTheme(theme: KennisbankTheme): KennisbankTerm[] {
  return kennisbankTerms.filter((t) => t.theme === theme)
}

export function getAllThemes(): KennisbankTheme[] {
  return Object.keys(themeLabels) as KennisbankTheme[]
}
