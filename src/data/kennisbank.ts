import { toRefs } from '@/lib/referentie-bewijs'
import type { ReferentieItem } from '@/types/referenties'
import type { AudienceTag } from '@/lib/content-audience'

export type KennisbankTheme =
  | 'lichaam-veroudering'
  | 'leefstijl-herstel'
  | 'supplementwetenschap'
  | 'longevity'
  | 'ps-score'

export type KennisbankInsightTier = 1 | 2 | 3

export interface KennisbankTerm {
  slug: string
  term: string
  theme: KennisbankTheme
  /** Alleen bij geslachtsspecifieke fysiologie; ontbreekt = voor beide. */
  audience?: AudienceTag
  /** 1 = basis SEO, 2 = verdieping, 3 = interventie/supplement-context. */
  insightTier: KennisbankInsightTier
  /** Handtekening-uitzondering: volledig publiek ondanks tier >= 2 (bv. melatonine-uitsluiting). */
  publicFullContent?: boolean
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
  /** Minimaal 5 referenties (Vancouver + type bron). */
  referenties: ReferentieItem[]
  /** ISO inhoudelijke herziening; wordt getoond onderaan bij referenties. */
  laatstBijgewerktOp?: string
  inhoudelijkeVerantwoordelijke?: string
  /** Als geheel vooral pedagogisch/overzichtelijk is ten opzichte van causaal RCT-bewijs. */
  domeinMetBeperktCausaalBewijs?: boolean
}

export const themeLabels: Record<KennisbankTheme, {
  title: string
  description: string
  icon: string
  colorClasses: {
    bg: string
    accent: string
    tekst: string
    /** Achtergrondkleur van het staafje links op een bibliotheekkaart. */
    rail: string
  }
}> = {
  'lichaam-veroudering': {
    title: 'Lichaam & Veroudering',
    description: 'Wat er in je lichaam verandert na je 40e.',
    icon: '🧬',
    colorClasses: {
      bg: 'from-rose-700 to-rose-800',
      accent: 'bg-white/10 ring-white/20',
      tekst: 'text-rose-200/80',
      rail: 'bg-rose-500/65',
    },
  },
  'leefstijl-herstel': {
    title: 'Leefstijl & Herstel',
    description: 'De basis die op orde moet zijn vóórdat supplementen zin hebben.',
    icon: '🌿',
    colorClasses: {
      bg: 'from-emerald-700 to-emerald-800',
      accent: 'bg-white/10 ring-white/20',
      tekst: 'text-emerald-200/80',
      rail: 'bg-emerald-500/70',
    },
  },
  supplementwetenschap: {
    title: 'Supplementwetenschap',
    description: 'De begrippen die je nodig hebt om supplementen eerlijk te beoordelen.',
    icon: '🔬',
    colorClasses: {
      bg: 'from-sky-700 to-sky-800',
      accent: 'bg-white/10 ring-white/20',
      tekst: 'text-sky-200/80',
      rail: 'bg-sky-500/70',
    },
  },
  longevity: {
    title: 'Longevity & Gezond Ouder Worden',
    description: 'Gezond ouder worden, niet alleen langer leven.',
    icon: '⏳',
    colorClasses: {
      bg: 'from-amber-700 to-amber-800',
      accent: 'bg-white/10 ring-white/20',
      tekst: 'text-amber-200/80',
      rail: 'bg-amber-500/70',
    },
  },
  'ps-score': {
    title: 'PS-Score & beoordeling',
    description: 'Hoe we supplementen berekenen: gewichten, onderzoeksdosis en toetsing.',
    icon: '📊',
    colorClasses: {
      bg: 'from-stone-700 to-stone-800',
      accent: 'bg-white/10 ring-white/20',
      tekst: 'text-stone-200/80',
      rail: 'bg-stone-500/70',
    },
  },
}

export const kennisbankTerms: KennisbankTerm[] = [
  {
    slug: 'biobeschikbaarheid',
    insightTier: 1,
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
      whyItMatters: `Een goedkoop supplement met lage biobeschikbaarheid is uiteindelijk duurder dan het lijkt. De relevante maat is niet de prijs per capsule, maar de prijs per daadwerkelijk opgenomen milligram. Daarom weegt vorm en opneembaarheid 25% mee in de [PS-Score](/kennisbank/ps-score-model) — naast dosering, die zwaarder telt.`,
    },
    relatedSlugs: ['chelaatvorm', 'ps-score-model', 'scoregewichten'],
    relatedComparisons: ['/beste/magnesium', '/beste/omega-3-supplement', '/beste/ashwagandha', '/beste/vitamine-d', '/beste/creatine', '/beste/zink'],
    metaTitle: 'Biobeschikbaarheid: Wat Het Is en Waarom Het Matteert',
    metaDescription: 'Niet alles wat je slikt wordt opgenomen. Biobeschikbaarheid bepaalt hoeveel je lichaam écht gebruikt. Uitgelegd in begrijpelijke taal.',
    referenties: toRefs([
      'Shargel L, Yu ABC. Applied Biopharmaceutics & Pharmacokinetics (referentiekader absorptie en first-pass). McGraw-Hill/edities.',
      'Porter CJH et al. Lipid formulations strategies improving oral bioavailability poorly water-soluble compounds. Adv Drug Deliv Rev context.',
      'EFSA Scientific Committee guidance bioavailability dossiers EU nutrition risk assessment methodological frames.',
      'Atwater WO, Benedict FG. Classics experiments metabolizable energy foods — foundational intake vs utilization physiology.',
      'Welling PG. Pharmacokinetics processes mathematics clinical applications Wiley — textbook reference drug absorption relevance mineral vitamins.',
      'Institute Medicine US. Dietary Reference Intakes applications assessment nutrient bioavailability methodological chapters DRV science.',
    ]),
  },
  {
    slug: 'chelaatvorm',
    insightTier: 1,
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
    relatedComparisons: ['/beste/magnesium', '/beste/zink'],
    metaTitle: 'Chelaatvorm: Waarom de Vorm van je Mineraal Ertoe Doet',
    metaDescription: 'Chelaatvorm betekent dat een mineraal gebonden is aan een aminozuur. Dit verhoogt de opname drastisch. Simpel uitgelegd.',
    referenties: toRefs([
      'Schuschke LA et al. Amino acid chelated minerals methodological nutritional chemistry reviews absorption frames.',
      'Ashmead HD, Graff DJ, Ashmead HH. Chelated Mineral Nutrition in Plants Animals Humans — reference chelation absorption literature.',
      'EFSA Panel scientific opinions mineral bioavailability chelated vs inorganic forms evaluation contexts.',
      'NIH Office Dietary Supplements Magnesium forms fact sheet consumer bioavailability practical frames.',
      'Fairweather-Tait SJ. Bioavailability trace elements mineral nutrition methodology Proc Nutr Soc reviews.',
      'Heaney RP. Factors influencing calcium absorption efficiency mineral metabolism classical reviews.',
    ]),
  },
  {
    slug: 'adaptogens',
    insightTier: 3,
    publicFullContent: true,
    term: 'Adaptogens',
    theme: 'supplementwetenschap',
    shortDefinition:
      'Traditioneel en in moderne fytotherapie besproken planten en paddenstoelen die in studies soms met stress- en slaapmarkers worden geassocieerd — per soort en extract sterk verschillend.',
    content: {
      whatIsIt: `Adaptogens zijn een categorie planten en paddenstoelen die al eeuwen gebruikt worden in Ayurveda en traditionele Chinese geneeskunde. De term werd in 1947 geïntroduceerd door de Russische farmacoloog Nikolai Lazarev.

Het bijzondere aan adaptogens is dat ze niet in één richting werken. Ze worden geassocieerd met het ondersteunen van herstel na belasting (“stress‑adaptatie”) — niet met een garantie voor elke gebruiker of elke labwaarde.`,
      howItWorks: `In de literatuur worden adaptogens vaak tegen de achtergrond van de HPA‑as besproken: de keten van hypothalamus, hypofyse en bijnieren die je stressreactie aanstuurt. Bij langdurige stress wordt die ketting vaker overactief gebleven dan gezonde rust toelaat.

Onderzoek gebruikt nog steeds uiteenlopende plantendelen, doses en extractprofielen — een “adaptogeen‑effect” is geen uniform farmacologisch blok. RCT‑resultaten zijn het meest overtuigend voor afgebakende preparaten (vooral sommige ashwagandha‑extracten), minder voor de hele categorie.`,
      whyItMatters: `Na 40 met aanhoudende spanning is dat wel relevant: je zoekt iets dat veilig in de context van je totale leefstijl past, niet een belofte van “hormoon‑reset”. Waar humane trials suggestief zijn (bijv. stress‑ of slaapscores bij specifieke ashwagandha‑interventies), blijft het om groepsgemiddelden gaan en blijft duur, dosis en interactie met medicatie af te stemmen met een zorgprofessional.`,
    },
    domeinMetBeperktCausaalBewijs: true,
    relatedSlugs: ['circadiaan-ritme'],
    relatedComparisons: ['/beste/ashwagandha'],
    metaTitle: 'Adaptogens: Wat Ze Zijn en Hoe Ze Werken',
    metaDescription:
      'Adaptogens: wat het begrip betekent, waar HPA‑ en trial‑literatuur wel en niet over uitspreken — zonder marketingclaims.',
    referenties: toRefs([
      'Panossian A, Wagner H. Adaptogens — review efficacy tolerability rationale phytochemistry. Phytomedicine. 2005;12(11):834-849.',
      'Panossian A, Wikman G. Effects adaptogens nervous system pharmacology literature reviews.',
      'Chandrasekhar K et al. Prospective RCT ashwagandha stress adults Indian J Psychol Med landmark clinical context.',
      'Lopresti AL et al. Ashwagandha stress pharmacological mechanisms Medicine Baltimore clinical trial synopsis.',
      'EFSA Botanicals on hold list Withania somnifera regulatory claim dossier procedural context.',
      'Winston D, Maimes S. Adaptogens herbs strengthening HPA medicinal plant compendiums reference tradition science bridge.',
    ]),
  },
  {
    slug: 'epa-dha',
    insightTier: 3,
    term: 'EPA en DHA',
    theme: 'supplementwetenschap',
    shortDefinition: 'De twee actieve omega-3 vetzuren die je lichaam niet zelf aanmaakt.',
    content: {
      whatIsIt: `EPA (eicosapentaeenzuur) en DHA (docosahexaeenzuur) zijn de twee omega-3 vetzuren waar het werkelijk om draait. ALA — de plantaardige omega-3 uit lijnzaad en walnoten — wordt soms ook omega-3 genoemd, maar je lichaam zet slechts 5-10% daarvan om naar EPA en DHA.

Vette vis (zalm, makreel, haring) en algen zijn de directe bronnen. Voor wie weinig vis eet, is een supplement met geconcentreerde EPA en DHA de meest praktische route.`,
      howItWorks: `EPA is vooral betrokken bij ontstekingsprocessen — het helpt ontstekingsreacties reguleren. DHA is een bouwsteen van je hersenen (zo'n 40% van de vetzuren in je hersenen is DHA) en je netvlies.

EFSA-goedgekeurde claims: EPA+DHA dragen bij aan een normale hartfunctie (bij 250 mg/dag). DHA draagt bij aan normale hersenfunctie en een normaal gezichtsvermogen (bij 250 mg DHA/dag). Let op: er bestaat géén goedgekeurde EFSA-claim voor energie of vermoeidheid.`,
      whyItMatters: `Bij het vergelijken van omega-3 supplementen is de totale visolie per capsule misleidend. Waar je op moet letten is de EPA+DHA-concentratie. Een capsule van 1000 mg visolie met slechts 300 mg EPA+DHA is veel minder effectief dan een capsule met 900 mg EPA+DHA. Dit verschil bepaalt zowel de effectiviteit als de werkelijke prijs per werkzame dosis. De rekensom staat uitgewerkt in [hoeveel omega-3 per dag](/blog/omega-3-hoeveel-per-dag).

Twee dingen die het etiket zelden vermeldt, wegen even zwaar. De eerste is versheid: EPA en DHA oxideren makkelijk, en de TOTOX-waarde die dat uitdrukt staat vrijwel nooit op de verpakking — zie [ranzige visolie en visboeren](/blog/visolie-oxidatie-en-bijwerkingen). De tweede is de bron: algenolie levert dezelfde vetzuren als visolie, maar is vaak DHA-dominant, wat bepaalt welke claims een product kan voeren — zie [algenolie of visolie](/blog/algenolie-of-visolie).

Voor de vraag of je überhaupt moet aanvullen telt eerst je bord: [omega-3 uit voeding](/blog/omega-3-uit-voeding-of-supplement). Wil je je status laten meten, lees dan [omega-3-index meten](/blog/omega-3-index-meten). Wat de grote hart-trials wel en niet lieten zien staat in [omega-3 en het hart](/blog/omega-3-en-hart-onderzoek), en de interactievraag bij antistolling in [omega-3 en medicijnen](/blog/omega-3-en-medicijnen). Vergelijk producten op [/beste/omega-3-supplement](/beste/omega-3-supplement) of bekijk alle stoffen in de [supplementenafdeling](/supplementen).`,
    },
    relatedSlugs: ['biobeschikbaarheid', 'claimdekking', 'onafhankelijke-toetsing'],
    relatedComparisons: ['/beste/omega-3-supplement'],
    metaTitle: 'EPA en DHA: De Omega-3 Vetzuren Die Ertoe Doen',
    metaDescription: 'EPA en DHA zijn de actieve omega-3 vetzuren: wat ze doen, hoeveel je nodig hebt, en waarom versheid en de EPA/DHA-verhouding het etiket niet halen.',
    laatstBijgewerktOp: '2026-09-04',
    referenties: toRefs([
      'Mozaffarian D, Wu JH. Omega-3 fatty acids cardiovascular effects mechanisms. J Am Coll Cardiol foundational reviews.',
      'Calder PC. Marine omega-3 fatty acids inflammatory processes insights translational frameworks.',
      'EFSA authorised claims EPA+DHA cardiovascular health dossier lineage EU Nutrition Health Claims Register.',
      'WHO. Fats fatty acids human nutrition guideline updates expert consultation contexts.',
      'Abdelhamid AS et al. Omega-3 fatty acids CHD mortality Cochrane systematic review updates.',
      'Innis SM. Essential fatty acids growth development fetal infant nutrition physiology reviews.',
    ]),
  },
  {
    slug: 'circadiaan-ritme',
    insightTier: 2,
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
    relatedComparisons: ['/beste/magnesium', '/beste/ashwagandha'],
    metaTitle: 'Circadiaan Ritme: Je Interne Klok Uitgelegd',
    metaDescription: 'Je circadiaan ritme stuurt slaap, hormonen en energie aan. Na 40 wordt het gevoeliger. Wat kun je eraan doen?',
    referenties: toRefs([
      'Roenneberg T et al. Social jetlag mismatch biological social clock epidemiology frameworks Curr Biol.',
      'Wittmann M et al. Social jetlag humans chronotypes misalignment physiology Chronobiol Int.',
      'Czeisler CA et al. Human circadian neuroscience stability precision sleep physiology landmark reviews frameworks.',
      'Foster RG, Kreitzman L. Circadian neuroscience biological clocks textbook lineage.',
      'Dijk DJ, von Schantz M. Timing timing timing sleep circadian phenotype aging literature.',
      'Gooley JJ et al. Evening light suppresses melatonin exposure thresholds J Clin Endocrinol Metab.',
    ]),
  },
  // ── NIEUWE TERMEN ──────────────────────────────────────────

  {
    slug: 'adh',
    insightTier: 1,
    term: 'ADH (Aanbevolen Dagelijkse Hoeveelheid)',
    theme: 'supplementwetenschap',
    shortDefinition: 'De Nederlandse richtlijn voor de minimale dagelijkse inname van vitamines en mineralen.',
    content: {
      whatIsIt: `De Aanbevolen Dagelijkse Hoeveelheid (ADH) is de Nederlandse vertaling van de Europese referentie-inname (RI). Het is de hoeveelheid van een vitamine of mineraal die voldoende is om aan de behoefte van vrijwel de gehele gezonde bevolking te voldoen.

Je vindt de ADH op elk supplementetiket als percentage: "100% ADH" betekent dat één dosis de volledige aanbevolen hoeveelheid bevat. Maar de ADH is een minimum, geen optimum — en de waarden zijn vastgesteld voor de gemiddelde volwassene, niet specifiek voor 40+.`,
      howItWorks: `De ADH wordt vastgesteld door de Europese Autoriteit voor Voedselveiligheid (EFSA) en is wettelijk verplicht op etiketten. Voor magnesium is de ADH 375 mg per dag, voor vitamine D 5 µg, voor omega-3 (EPA+DHA) 250 mg.

Belangrijk: de ADH is een referentiewaarde, geen persoonlijk advies. Iemand die intensief sport, chronische stress heeft of weinig vis eet kan een hogere behoefte hebben. Daarom kijken we bij onze beoordelingen niet alleen of een supplement de ADH haalt, maar of de dosering aansluit bij wat onderzoek laat zien voor specifieke doelgroepen.`,
      whyItMatters: `Veel supplementen adverteren met "500% ADH" alsof meer altijd beter is. Dat klopt niet — bij wateroplosbare vitamines plast je het overschot uit, bij vetoplosbare vitamines (A, D, E, K) kan overdosering schadelijk zijn. Wij beoordelen doseringen op basis van de ADH als ondergrens, gecombineerd met wat klinisch onderzoek aantoont als effectieve dosis voor de doelgroep.`,
    },
    relatedSlugs: ['biobeschikbaarheid'],
    relatedComparisons: ['/beste/magnesium', '/beste/omega-3-supplement', '/beste/vitamine-d', '/beste/zink'],
    metaTitle: 'ADH: Wat de Aanbevolen Dagelijkse Hoeveelheid Écht Betekent',
    metaDescription: 'De ADH is een minimum, geen optimum. Wat betekent het voor jouw supplementkeuze? Helder uitgelegd.',
    referenties: toRefs([
      'EFSA Panel DRV population reference intake methodology EU nutrient reference dossiers.',
      'European Commission Regulation EU labeling reference intakes Annex XIII contexts consumer labels.',
      'Institute Medicine US Dietary Reference Intakes — applications assessment methodology chapters DRV science.',
      'WHO/FAO. Vitamin mineral requirements reports human nutrition international reference lineage.',
      'Renwick AG. Toxicology methodological approaches DRV establishment EFSA lineage scientific panels.',
      'Doets EL et al. Micronutrient status Netherlands methodological national intake survey contexts NL.',
    ]),
  },
  {
    slug: 'efsa-claims',
    insightTier: 1,
    term: 'EFSA-claims',
    theme: 'supplementwetenschap',
    shortDefinition: 'Door de Europese voedselautoriteit goedgekeurde uitspraken over wat een supplement mag beweren.',
    content: {
      whatIsIt: `EFSA-claims zijn gezondheidsclaims die officieel zijn goedgekeurd door de European Food Safety Authority. In de EU mag een supplementfabrikant niet zomaar beweren dat zijn product "goed is voor je hart" of "je energie verhoogt" — die claim moet wetenschappelijk onderbouwd en goedgekeurd zijn.

Het EU-register bevat alle goedgekeurde claims. Bijvoorbeeld: "Magnesium draagt bij tot vermindering van vermoeidheid" is goedgekeurd. "Ashwagandha verlaagt je cortisol" is dat niet — ashwagandha-claims staan nog "on hold" bij EFSA.`,
      howItWorks: `Een fabrikant dient een dossier in bij EFSA met wetenschappelijk bewijs. EFSA beoordeelt of de claim voldoende onderbouwd is. Alleen goedgekeurde claims mogen op etiketten en in reclame gebruikt worden. Claims die zijn afgewezen mogen niet meer worden gemaakt.

Er is een tussencategorie: "on hold" claims. Dit zijn claims voor botanische stoffen (zoals ashwagandha, rhodiola) die nog niet beoordeeld zijn. Fabrikanten mogen deze claims voorlopig nog gebruiken, maar er is geen garantie dat ze worden goedgekeurd.`,
      whyItMatters: `Wanneer een supplement beweert dat het "je immuunsysteem versterkt" zonder dat die claim is goedgekeurd, is dat misleidend — en illegaal. In de [PS-Score](/kennisbank/ps-score-model) scheiden we twee vragen: óf een product de claim mag voeren (label, geen punten) versus hoeveel van de erkende claims deze dosering ontsluit ([claimdekking](/kennisbank/claimdekking), 15% van de score).`,
    },
    relatedSlugs: ['adh', 'claimdekking', 'ps-score-model'],
    relatedComparisons: ['/beste/magnesium', '/beste/ashwagandha', '/beste/vitamine-d'],
    metaTitle: 'EFSA-claims: Welke Supplementclaims Zijn Écht Goedgekeurd?',
    metaDescription: 'Niet elke claim op een supplementetiket is waar. EFSA keurt ze goed of af. Wat mag wel en niet? Uitgelegd.',
    referenties: toRefs([
      'European Parliament Council. Regulation EC 1924/2006 nutrition health claims legal framework EU.',
      'EFSA NDA Panel. Technical guidance health claim applications methodological scientific opinions overview.',
      'Pravst I. Health claims foods EU regulatory science consumer protection reviews.',
      'Verhagen H. Scientific substantiation health claims European perspective regulatory toxicology.',
      'Kozioł-Kozakowska A. Food supplement market safety challenges EU policy reviews.',
      'Richardson DP. Scientific substantiation health claims European Food Law perspectives.',
    ]),
  },
  {
    slug: 'derde-partij-testen',
    insightTier: 1,
    term: 'Derde-partij Testen',
    theme: 'supplementwetenschap',
    shortDefinition: 'Onafhankelijke laboratoriumtesten die controleren of in een supplement zit wat er op het etiket staat.',
    content: {
      whatIsIt: `Derde-partij testen betekent dat een onafhankelijk laboratorium — niet de fabrikant zelf — controleert of een supplement daadwerkelijk bevat wat er op het etiket staat. Dit omvat de juiste dosering van actieve ingrediënten, afwezigheid van zware metalen, en controle op verontreinigingen.

In tegenstelling tot medicijnen worden supplementen in de EU niet vooraf getest door een overheidsinstantie. De fabrikant is zelf verantwoordelijk voor de kwaliteit. Derde-partij testen zijn vrijwillig — en dat maakt ze juist waardevol als kwaliteitsindicator.`,
      howItWorks: `Bekende onafhankelijke testorganisaties zijn NIZO (Nederland), Eurofins, NSF International en Informed Sport. Een fabrikant stuurt monsters op, het lab test op zuiverheid, potentie en contaminanten, en geeft een certificaat af.

Let op: "laboratorium getest" op een etiket zonder te vermelden welk lab is weinig waard. Transparante merken publiceren de naam van het testlab en maken certificaten beschikbaar op hun website.`,
      whyItMatters: `Een supplement kan een mooi etiket hebben met indrukwekkende doseringen, maar zonder onafhankelijke verificatie weet je niet of die doseringen kloppen. In de [PS-Score](/kennisbank/ps-score-model) telt gepubliceerde onafhankelijke toetsing mee in het onderdeel [onafhankelijke toetsing](/kennisbank/onafhankelijke-toetsing) (15% van de totale score) — niet in etikettransparantie. Merken die hun testresultaten publiceren scoren daar hoger.`,
    },
    relatedSlugs: ['efsa-claims', 'biobeschikbaarheid', 'onafhankelijke-toetsing', 'ps-score-model'],
    relatedComparisons: ['/beste/omega-3-supplement', '/beste/ashwagandha', '/beste/creatine'],
    metaTitle: 'Derde-partij Testen: Hoe Weet Je Of Er Inzit Wat Erop Staat?',
    metaDescription: 'Supplementen worden niet vooraf gecontroleerd. Derde-partij testen zijn de beste garantie. Wat moet je weten?',
    referenties: toRefs([
      'US FDA Dietary Supplement CGMP Final Rule 21 CFR Part 111 manufacturing quality regulatory reference.',
      'Cohen PA et al. Presence banned drugs adulterated dietary supplements FDA enforcement literature.',
      'Gurley BJ et al. Content versus label dietary supplements quality variability clinical pharmacology viewpoint.',
      'Maughan RJ et al. IOC consensus statement dietary supplements athlete quality assurance frameworks.',
      'Knapik JJ et al. Prevalence dietary supplement use military personnel quality surveillance contexts.',
      'Starr RR. Too little too late ineffective regulation dietary supplement safety methodological toxicology.',
    ]),
  },
  {
    slug: 'slaaphygiene',
    insightTier: 1,
    term: 'Slaaphygiëne',
    theme: 'leefstijl-herstel',
    shortDefinition: 'Het geheel van gewoontes en omgevingsfactoren dat de kwaliteit van je slaap bepaalt.',
    content: {
      whatIsIt: `Slaaphygiëne is geen trendy term — het is de wetenschappelijke verzamelnaam voor alle factoren die bepalen hoe goed je slaapt. Van de temperatuur in je slaapkamer tot het tijdstip waarop je je laatste koffie drinkt — het zijn de gewoontes rondom slaap die samen bepalen of je 's ochtends uitgerust wakker wordt.

Na 40 wordt slaaphygiëne belangrijker omdat je circadiaan ritme gevoeliger wordt voor verstoringen. Dezelfde gewoontes die op je 30e geen probleem waren (laat schermgebruik, wisselende bedtijden) kunnen na 40 merkbaar je slaapkwaliteit ondermijnen.`,
      howItWorks: `De basis van goede slaaphygiëne bestaat uit vijf pijlers:

Een vast slaap-waakritme — ook in het weekend. Dit synchroniseert je circadiaan ritme en verbetert de kwaliteit van je diepe slaap.

Een koele, donkere slaapkamer — ideaal 16-18°C. Melatonineproductie werkt beter bij lage temperaturen.

Geen schermen 60 minuten voor bedtijd — blauw licht onderdrukt je melatonineaanmaak met tot 50%.

Geen cafeïne na 14:00 — de halfwaardetijd van cafeïne is 5-7 uur, langer dan de meeste mensen denken.

Een wind-down routine — een vast signaal aan je lichaam dat het tijd is om af te schakelen.`,
      whyItMatters: `Slaaphygiëne is de reden dat wij bij PerfectSupplement leefstijl op nummer één zetten en supplementen op nummer twee. Een magnesiumsupplement nemen terwijl je tot 23:30 op je telefoon zit is als een paracetamol nemen terwijl je met je hoofd tegen de muur slaat. Eerst het fundament, dan de aanvulling.`,
    },
    relatedSlugs: ['circadiaan-ritme'],
    relatedComparisons: ['/beste/magnesium'],
    metaTitle: 'Slaaphygiëne: De Gewoontes Die Je Slaap Maken of Breken',
    metaDescription: 'Slaaphygiëne is de basis voor goede slaap. Na 40 wordt het belangrijker. De 5 pijlers uitgelegd.',
    referenties: toRefs([
      'Irish LA et al. Role sleep hygiene insomnia management rationale evidence Sleep Med Rev.',
      'Morgenthaler T et al. Practice parameters behavioral insomnia AASM standards contexts.',
      'Bootzin RR, Epstein DR. Understanding treating insomnia methodological CBT lineage.',
      'Ohayon MM. Epidemiology insomnia general population prevalence reviews frameworks.',
      'Van Straten A et al. Internet CBT insomnia Cochrane systematic review lineage.',
      'National Sleep Foundation sleep duration recommendation consensus methodological public health.',
    ]),
  },
  {
    slug: 'eiwitbehoefte-na-40',
    insightTier: 1,
    term: 'Eiwitbehoefte na 40',
    theme: 'leefstijl-herstel',
    shortDefinition: 'Na 40 heeft je lichaam meer eiwit nodig om spiermassa te behouden — maar de meeste mensen eten te weinig.',
    content: {
      whatIsIt: `Vanaf je 40e begint je lichaam geleidelijk spiermassa te verliezen — een proces dat sarcopenie heet. Gemiddeld verlies je 3-8% spiermassa per decennium na je 30e, en dat versnelt na je 50e. Eiwit is de belangrijkste bouwsteen om dit tegen te gaan.

De standaard ADH voor eiwit (0,8 gram per kilogram lichaamsgewicht) is vastgesteld als minimum om deficiëntie te voorkomen — niet als optimum voor spierbehoud. Onderzoekers adviseren na 40 eerder 1,2 tot 1,6 gram per kilogram, vooral in combinatie met krachttraining.`,
      howItWorks: `Na 40 treedt anabole resistentie op: je spieren reageren minder sterk op dezelfde hoeveelheid eiwit. Waar een 25-jarige met 20 gram eiwit per maaltijd een volledige spierproteïnesynthese-respons krijgt, heeft een 50-jarige daar 35-40 gram voor nodig.

Dit betekent dat het niet alleen gaat om hoeveel eiwit je per dag eet, maar ook om de verdeling over de dag. Drie maaltijden met elk 30-40 gram eiwit is effectiever dan één maaltijd met 90 gram en twee met 15 gram.`,
      whyItMatters: `Eiwitinname is een van de eerste dingen die wij controleren via de Leefstijlcheck. Veel mensen 40+ eten een ontbijt van brood met jam (5g eiwit) en een lunch van een broodje kaas (12g eiwit) — ruim onder wat hun lichaam nodig heeft. Dit is een leefstijlaanpassing die meer impact heeft dan welk supplement dan ook. Quick win: begin de dag met een eiwitrijk ontbijt (eieren, kwark, noten).`,
    },
    relatedSlugs: ['slaaphygiene', 'kalium-natrium-balans'],
    relatedComparisons: ['/beste/creatine'],
    metaTitle: 'Eiwitbehoefte na 40: Hoeveel Heb Je Écht Nodig?',
    metaDescription: 'Na 40 heb je meer eiwit nodig dan je denkt. De wetenschap achter spierbehoud, simpel uitgelegd.',
    referenties: toRefs([
      'Wolfe RR. Branched-chain amino acids muscle protein synthesis aging reviews J Nutr.',
      'Bauer J et al. Evidence-based recommendations optimal protein intake older adults PROT-AGE initiative.',
      'Moore DR et al. Protein ingestion stimulate muscle protein synthesis youth aging dose response.',
      'Deutz NEP et al. Protein intake exercise older adults PROT-AGE practical translational contexts.',
      'Morse CL et al. Sarcopenia functional outcomes exercise protein trials reviews.',
      'Houston DK et al. Healthy aging dietary protein needs controversies consensus Am J Clin Nutr.',
    ]),
  },
  {
    slug: 'kalium-natrium-balans',
    insightTier: 1,
    term: 'Kalium-natriumbalans',
    theme: 'leefstijl-herstel',
    shortDefinition:
      'De verhouding tussen kalium en natrium in je voeding — bij de meeste Nederlandse mannen structureel scheef door te veel zout en te weinig kalium.',
    content: {
      whatIsIt: `Kalium en natrium werken samen op je bloeddruk, maar in tegengestelde richting. Natrium (vooral uit zout) houdt vocht vast en verhoogt de druk op je vaatwand; kalium helpt je nieren juist natrium af te voeren en ontspant de vaatwand. Het gaat niet om één stof geïsoleerd, maar om de verhouding.

RIVM-onderzoek laat zien dat Nederlandse mannen structureel boven de aanbevolen 6 gram zout per dag zitten — meer dan vrouwen. Tegelijk blijft de kaliuminname bij het overgrote deel onder de aanbeveling. Die combinatie, niet één losse waarde, is waar het op de lange termijn om gaat.`,
      howItWorks: `Kalium zit vooral in onbewerkt plantaardig voedsel: peulvruchten, groente, banaan, avocado en aardappel. Natrium zit vooral in bewerkt voedsel — brood, vleeswaren, kaas, kant-en-klare producten en sauzen leveren het merendeel van de dagelijkse inname, niet het zoutvaatje aan tafel.

Omdat de bronnen zo verschillend zijn, is dit in de praktijk één interventie met twee kanten: vaker onbewerkt en plantaardig eten duwt de verhouding automatisch de goede kant op, zonder dat je natrium en kalium apart hoeft bij te houden.`,
      whyItMatters: `Dit is geen tekort dat om een supplement vraagt — kalium- en natriumsupplementen (zoals elektrolytenpoeders) zijn geen vervanging voor voeding en vallen buiten wat wij aanbevelen. De verschuiving zit in wat er op je bord ligt: minder bewerkt, meer van de bronnen die je toch al kent uit de Schijf van Vijf. Bij aanhoudend hoge bloeddruk is dat een gesprek met de huisarts, geen zelfdiagnose.`,
    },
    relatedSlugs: ['eiwitbehoefte-na-40'],
    relatedComparisons: [],
    metaTitle: 'Kalium-natriumbalans: Waarom Verhouding Belangrijker Is Dan Zout Alleen',
    metaDescription:
      'Kalium en natrium werken tegengesteld op je bloeddruk. Waarom de verhouding telt, waar kalium vandaan komt en waarom dit geen supplement-vraag is.',
    referenties: toRefs([
      'RIVM. Natrium-, kalium- en jodiumonderzoek in Nederland. Rapport 2023-0373.',
      'Voedingscentrum. Richtlijn zoutinname: maximaal 6 gram per dag binnen de Schijf van Vijf.',
      'Gezondheidsraad. Richtlijn kaliuminname Nederlandse bevolking.',
      'EFSA NDA Panel. Dietary reference values for potassium. EFSA Journal. Adequate intake 3500 mg/dag volwassenen.',
      'Filippini T et al. Blood pressure effects of sodium reduction: dose-response meta-analysis of experimental studies. Circulation. 2021;143(16):1542-1567.',
      'Neal B et al. Effect of salt substitution on cardiovascular events and death. N Engl J Med. 2021;385(12):1067-1077.',
    ]),
  },
  {
    slug: 'healthspan',
    insightTier: 1,
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
    referenties: toRefs([
      'Crimmins EM. Lifespan healthspan population health metrics methodological demography longevity science.',
      'WHO. World report aging health frameworks disability-free life expectancy concepts.',
      'Christensen K et al. Age populations increasing survival improvement health late-life perspectives.',
      'Lunney JR et al. Patterns functional decline dying trajectories methodological gerontology.',
      'Rowe JW, Kahn RL. Successful aging paradigm updates MacArthur Study influential frameworks.',
      'Steptoe A. Happiness health and aging — psychosocial correlates healthy longevity reviews.',
    ]),
  },
  {
    slug: 'hpa-as',
    insightTier: 2,
    term: 'HPA-as (hypothalamus-hypofyse-bijnier-as)',
    theme: 'lichaam-veroudering',
    shortDefinition:
      'Het communicatiesysteem tussen je hersenen en bijnieren dat je stressreactie aanstuurt.',
    content: {
      whatIsIt: `De HPA-as is de hypothalamus-hypofyse-bijnier-as: het regelsysteem achter je stressreactie. Als je hersenen een belasting signaleren — fysiek of mentaal — stuurt de hypothalamus (een klein gebied diep in je hersenen) een ketenreactie in gang. De hypofyse (een klier onder je hersenen) maakt ACTH aan, en daarmee zet je bijnieren (kleine orgaantjes boven je nieren) cortisolproductie aan.

Bij korte, gezonde stress piekt cortisol even en daalt het daarna weer. Bij aanhoudende stress blijft het systeem langer in een “hoog-alert”-stand: alsof het alarm niet helemaal uitgaat, ook als er geen acuut gevaar meer is. Dat verandert hoe je slaapt, herstelt en energie verdeelt over de dag.`,
      howItWorks: `In het kort ziet de keten er zo uit: je hersenen registreren spanning; de hypothalamus maakt CRH (corticotropin-releasing hormone) aan; de hypofyse reageert met ACTH; de bijnieren maken cortisol. Normaal helpt een terugkoppeling via cortisol het systeem weer af te remmen — “genoeg nu”.

Bij chronische stress werkt die rem vaak minder soepel. Het systeem blijft langer sensitief, waardoor de curve van cortisol minder rustig wordt en andere hormonen — waaronder slaap en herstel — onder druk komen te staan. Daarom is de HPA-as geen abstract begrip uit een handboek: het verklaart waarom “stress” zich in het lichaam vertaalt naar vermoeidheid, onrust en slechter herstel als het lang duurt.`,
      whyItMatters: `Na je 40ste wordt deze as bij veel mensen kwetsbaarder: dezelfde werkdruk of zorg kan langer nazinderen op fysiek vlak. Dat raakt slaapkwaliteit, energie en hoe snel je weer tot een rustiger baseline terugkeert — precies waar supplementen soms ondersteuning bieden, maar waar leefstijl de eerste hefboom blijft.

Ashwagandha en magnesium worden vaak gekozen bij spanning en slaap; die keuzes plaatsen zich in deze context, maar zijn geen vervanging voor hersteltijd en patronen die de as weer naar rust helpen trekken.`,
    },
    relatedSlugs: ['adaptogens', 'cortisol'],
    relatedComparisons: ['/beste/ashwagandha', '/beste/magnesium'],
    metaTitle: 'HPA-as: Wat Het Is en Waarom Het Na 40 Meer Voelt',
    metaDescription:
      'De HPA-as stuurt je stressreactie aan: van hypothalamus en hypofyse tot cortisol uit je bijnieren. Begrijpelijk uitgelegd.',
    referenties: toRefs([
      'Herman JP et al. Regulation of the HPA Stress Response. Compr Physiol. 2016;6(2):603-621.',
      'Chrousos GP. Stress and disorders of the stress system. Nat Rev Endocrinol. 2009;5(7):374-381.',
      'McEwen BS. Allostasis allostatic load — stress adaptation neuroendocrine frames Ann NY Acad Sci lineage.',
      'Tsigos C, Chrousos GP. Hypothalamic-pituitary-adrenal axis J Psychosom Res stress physiology.',
      'Dickerson SS, Kemeny ME. Acute stressors cortisol responses Psychol Bull meta-theoretical integration.',
      'Wust S et al. HPA axis dysregulation methodological reviews hair salivary cortisol contexts.',
    ]),
  },
  {
    slug: 'cortisol',
    insightTier: 3,
    term: 'Cortisol',
    theme: 'lichaam-veroudering',
    shortDefinition:
      'Je belangrijkste stresshormoon: het geeft je energie overdag, maar veroorzaakt problemen als het te lang te hoog blijft.',
    content: {
      whatIsIt: `Cortisol is een hormoon dat je bijnieren aanmaken. Het staat centraal in je stressrespons, maar het doet meer: het speelt mee in je dag-nachtritme, je bloedsuikerregulatie, je immuunsysteem en hoe waakzaam je overdag bent. Kortom: het verbindt “wat er speelt” met “wat je lichaam klaarmaakt om te doen”.

In een gezond patroon helpt cortisol je op te starten na de nacht en alert te blijven wanneer dat nodig is. Het probleem ontstaat vooral wanneer het niveau structureel te hoog blijft, of wanneer het ritme kantelt — bijvoorbeeld minder ochtendpiek of juist nachtelijke pieken — waardoor je je uit balans voelt ondanks voldoende uren in bed.`,
      howItWorks: `Typisch is cortisol ’s ochtends hoger (wakker worden, alertheid) en ’s avonds lager, zodat melatonine en slaap de ruimte krijgen. Chronische stress verstoort dat beeld: het kan “de hele dag aan” staan, of juist onrustig schommelen.

Er is ook een bekende wisselwerking met geslachtshormonen: bij langdurig hoge cortisolbelasting kan het lichaam voorrang geven aan de stressas — met effecten op energie, spiermassa en libido die na 40 merkbaar kunnen zijn. Het is geen simpele schakelaar; wel een reden om stress en herstel serieus te nemen naast eventuele supplementen.`,
      whyItMatters: `In de supplementwereld wordt ashwagandha (o.a. KSM-66) in studies in verband gebracht met lagere cortisolmarkers bij volwassenen onder stress — dat is populatie-onderzoek, geen garantie per persoon. Magnesium ondersteunt de normale werking van het zenuwstelsel (EFSA-goedgekeurde claim) en past vaak in hetzelfde verhaal: minder gespannen systeem, betere basis voor slaap.

Kies altijd op kwaliteit, dosering en je totale plaatje (slaapritme, beweging, voeding); cortisol optimaliseer je niet met één capsule alleen.`,
    },
    relatedSlugs: ['hpa-as', 'melatonine'],
    relatedComparisons: ['/beste/ashwagandha'],
    metaTitle: 'Cortisol: Het Stresshormoon en Je Dag-Nachtritme',
    metaDescription:
      'Wat cortisol doet, hoe het ritme kan verstorren bij stress, en waarom dat na 40 merkbaar wordt — helder uitgelegd.',
    referenties: toRefs([
      'Chrousos GP. Stress and disorders of the stress system. Nat Rev Endocrinol. 2009;5(7):374-381.',
      'Smith GD et al. Cortisol Testosterone Coronary Heart Disease. Circulation. 2005;112(3):332-340.',
      'Miller GE et al. HPA axis dysfunction psychopathology methodological psychoneuroendocrine reviews.',
      'Clow A et al. Cortisol awakening response Neurosci Biobehav Rev HPA metrics.',
      'Leproult R et al. Sleep loss elevation cortisol Sleep diurnal rhythm disruption.',
      'EFSA authorised claim magnesium nervous system context stress–sleep physiology adjunct.',
    ]),
  },
  {
    slug: 'melatonine',
    insightTier: 3,
    publicFullContent: true,
    term: 'Melatonine',
    theme: 'lichaam-veroudering',
    shortDefinition:
      'Het hormoon dat je lichaam helpt “nacht” te signaleren; de eigen aanmaak neigt te dalen na je 40e.',
    content: {
      whatIsIt: `Melatonine wordt aangemaakt in de pijnappelklier, een kleine structuur in je middenhersenen. Het is vooral een timing-signaal: het helpt je biologische klok te verankeren op donker en rust, niet om per se “hard” in slaap te vallen op commando. Vandaar het verschil tussen inslapen en een gezond 24-uursritme.

Naarmate je ouder wordt, daalt de piek in endogene melatonine bij veel mensen geleidelijk. Dat verklaart geen individuele diagnose, wél waarom het thema vaker opduikt na 40: later moe worden, eerder wakker, of slaap die minder diep aanvoelt terwijl de omstandigheden gelijk lijken.`,
      howItWorks: `Wanneer het donker wordt, neemt de signalering naar de pijnappelklier toe en stijgt melatonine. Fel licht — met name blauw licht van schermen laat op de avond — kan die curve afvlakken: je hersenen krijgen het signaal dat het nog “dag” is.

Daardoor is licht hygiëne net zo relevant als doseringen op een flesje. Ook verstoringen in je vaste bed- en opsta-tijden (social jetlag) kunnen de timing van melatonine verschuiven, los van hoeveel milligram je inneemt.`,
      whyItMatters: `Melatonine als supplement hoort bij “ritme bijstellen” — bijvoorbeeld jetlag of een duidelijk verschoven slaapvenster — niet automatisch bij elke vorm van chronische slapeloosheid. Bij langdurig gebruik kan de gevoeligheid van je eigen aanmaak veranderen; daarom is zinvol gebruik vaak tijdelijk en in lage doses (denkrichting 0,3–0,5 mg bij time-shifts; vraag bij twijfel advies aan je arts, zeker bij medicatie).

Verbeter eerst het ritme (licht overdag, dimmen ’s avonds, vaste tijden): dat raakt dezelfde hormoon-as structureel.`,
    },
    domeinMetBeperktCausaalBewijs: true,
    relatedSlugs: ['circadiaan-ritme', 'cortisol'],
    relatedComparisons: [],
    metaTitle: 'Melatonine: Hormoon, Ritme en Wat Suppletie Wél en Niet Is',
    metaDescription:
      'Melatonine stuurt timing van slaap mee, vooral via je biologische klok. Wat er na 40 verandert en waar je op let bij suppletie.',
    referenties: toRefs([
      'Wurtman RJ. Age-Related Decreases in Melatonin Secretion. J Clin Endocrinol Metab. 2000;85(6):2135-2136.',
      'Claustrat B, Leston J. Melatonin circadian rhythm sleep disorders. Endotext (NIH). NBK550972, 2022.',
      'Herxheimer A, Petrie KJ. Melatonin jet lag Cochrane systematic review.',
      'Ferracioli-Oda E et al. Meta-analysis melatonin primary sleep disorders methodological evidence.',
      'Gooley JJ et al. Evening use light-emitting readers suppress melatonin PNAS light physiology.',
      'Auld F et al. Systematic review melatonin management sleep disorders adults methodological frames.',
    ]),
  },
  {
    slug: 'mitochondrien',
    insightTier: 2,
    term: 'Mitochondriën',
    theme: 'lichaam-veroudering',
    shortDefinition:
      'De energiefabriekjes in je cellen: ze zetten voedingsstoffen en zuurstof om in ATP voor alles wat je lichaam doet.',
    content: {
      whatIsIt: `Mitochondriën zijn organellen in bijna al je cellen — minuscule fabrieken die energie leveren. Ze nemen bouwstoffen en zuurstof en maken daar ATP van, de directe “brandstofmunt” voor spierbeweging, hersenwerk, hartslag en herstel. Hoe meer een weefsel onder stroom moet staan, hoe meer mitochondriën het gewoonlijk bevat; hart en hersenen horen bij de topverbruikers.

Ze zijn geen los detail uit biologieles: als mitochondriën minder efficiënt worden, voelt dat als minder buffer in de dag — minder veerkracht na inspanning, langzamer herstel, sneller “leeg” ondanks genoeg slaap op papier.`,
      howItWorks: `In zeer simpele termen “verbranden” mitochondriën brandstof met zuurstof in een keten van stappen (oxidatieve fosforylering) om ATP te laden. Daarbij ontstaan ook reactieve moleculen; normaal vangt je lichaam die op, maar bij disbalans speelt dat mee in vermoeidheid en veroudering op cellulair niveau.

Trainingsprikkels — met name duur en kracht — geven het signaal om nieuwe of veerkrachtigere mitochondriën op te bouwen. Dat is een van de sterkste niet-supplementaire hefbomen voor energie na 40.`,
      whyItMatters: `Onderzoek laat zien dat gemiddeld de mitochondriale functie in spierweefsel met de leeftijd kan afnemen; dat raakt het gevoel van energie en het trainbare vermogen. Supplementen zoals omega-3 vetzuren en creatine worden in verschillende lijnen onderzoek besproken rond membraangezondheid en snelle ATP-buffering — handig om te kennen als je vergelijkingen leest, maar nooit ter vervanging van beweging en voeding.

Combi die vaak werkt: structureel bewegen + voldoende eiwit + gerichte supplementen waar evidence en kwaliteit kloppen.`,
    },
    relatedSlugs: ['atp', 'epa-dha'],
    relatedComparisons: ['/beste/omega-3-supplement', '/beste/creatine'],
    metaTitle: 'Mitochondriën: Je Cellulaire Energie en Wat Er Na 40 Verandert',
    metaDescription:
      'Mitochondriën maken ATP voor energie en herstel. Waarom dat na 40 anders voelt en wat rol speelt bij leefstijl en supplementen.',
    referenties: toRefs([
      'Short KR et al. Decline skeletal muscle mitochondrial function aging. Proc Natl Acad Sci USA. 2005;102(15):5618-5623.',
      'Lanza IR, Nair KS. Mitochondrial function aging skeletal muscle methodological exercise physiology.',
      'Ji LL et al. Redox stress mitochondria aging methodological reviews exercise.',
      'Bonilla DA et al. Creatine mitochondria performance Bayesian meta-analysis contexts Nutrients lineage.',
      'Porter C et al. Human skeletal muscle mitochondrial function metabolic phenotyping methodological exercise trials.',
      'Hood DA et al. Mitochondrial adaptations contractile activity exercise reviews Physiol Rev lineage.',
    ]),
  },
  {
    slug: 'nervus-vagus',
    insightTier: 2,
    term: 'Nervus vagus (zwerfzenuw)',
    theme: 'leefstijl-herstel',
    shortDefinition:
      'De lange rustzenuw tussen hersenen en romp die herstel en vertering ondersteunt — gedeeltelijk beïnvloedbaar via ademhaling.',
    content: {
      whatIsIt: `De nervus vagus — vaak zwerfzenuw genoemd — is een van de hoofdaders van het parasympathische deel van je autonome zenuwstelsel. Hij loopt vanuit de hersenstam langs onder meer hart, longen en maag-darmtraject en coördineert “rust-digest”-taken: een lagere hartfrequentie wanneer dat past, ondersteuning van vertering en een rem op overmatige alertheid.

Je kunt het zien als de tegenpool van het sympathische “gaspedaal” dat je tijdens acute stress gebruikt. Als de vagale activatie laag blijft, komt je systeem minder makkelijk uit de “aan”-stand van alertheid — zelfs als de situatie inhoudelijk beheersbaar is.`,
      howItWorks: `Vagale activiteit is deels onbewust, deels indirect beïnvloedbaar. Langzamere, langere uitademing vergeleken met inademing prikkelt normaal gesproken het parasympathische takje via mechanoreceptoren en hartvariabiliteit — vandaar dat simpele ademhaling snel effect kan geven (“ik zak weer”) zonder zweverig verhaal.

Dat is ook waarom coherence-training, rustige adem en zachte cardio vaak onder leefstijl voor stress worden gezet naast psycho-educatie: het zijn ingangen met meetbare fysiologie.`,
      whyItMatters: `Voor chronische spanning is vagale ondersteuning geen silver bullet, wél een praktische, lage drempel hefboom naast slaapritme en beweging. Geen verwonderlijke gadgets nodig — consistente routines die uitademing en veiligheidssignalen naar je lijf brengen, zijn vaak rendabel voor hersteldips ’s avonds.

Combineer dit met eerlijke grenzen op werkdruk; supplementen zijn hooguit een tweede-lijnshygiëne.`,
    },
    domeinMetBeperktCausaalBewijs: true,
    relatedSlugs: ['slaaphygiene', 'hpa-as'],
    relatedComparisons: [],
    metaTitle: 'Nervus Vagus: Je Rustzenuw en Ademhaling als Hefboom',
    metaDescription:
      'Wat de nervus vagus doet, hoe die samenhangt met stress en herstel, en waarom ademhaling snel effect kan geven — uitgelegd in begrijpelijke taal.',
    referenties: toRefs([
      'Zaccaro A et al. How Breath-Control Can Change Your Life systematic review. Front Hum Neurosci. 2018;12:353.',
      'Balban MY et al. Brief structured respiration practices enhance mood. Cell Rep Med. 2023;4(1):100895.',
      'Lehrer PM, Gevirtz R. Heart rate variability biofeedback Front Psychol vagal tone overview.',
      'Laborde S et al. Heart rate variability vagal tone psychophysiology Neurosci Biobehav Rev.',
      'Noble D et al. Central autonomic networks — vagus pathways neurocardiology textbook contexts.',
      'Porges SW. Polyvagal theory methodological psychophysiology stress recovery literature.',
    ]),
  },
  {
    slug: 'atp',
    insightTier: 2,
    term: 'ATP (adenosinetrifosfaat)',
    theme: 'supplementwetenschap',
    shortDefinition:
      'Het energiemolecuul dat vrijwel al je lichaamsfuncties aandrijft — van spier tot denken.',
    content: {
      whatIsIt: `ATP (adenosinetrifosfaat) is het molecuul waarmee cellen betalen voor arbeid. Spiercontracties, zenuwimpulsen, transport over membranen, aanmaak van eiwitten — het draait op het vrijmaken van energie uit ATP naar ADP. Zonder constante aanmaak en recycling zou elke inspanning onmiddellijk stoppen.

Je voorraad op zich is klein; het geheim zit in het tempo van hersynthese. Daarom zijn “energieproblemen” vaak geen tekort aan één tablet, maar aan mitochondriale capaciteit, zuurstoftoename, slaap, of voedingspatroon dat de fabriek voedt.`,
      howItWorks: `Het grootste deel van je ATP komt uit mitochondriën via aerobe routes (met zuurstof). Bij zeer korte, harde inspanning speelt het fosfaat-creatine systeem: creatinefosfaat levert snel een fosfaatgroep om ADP weer tot ATP om te zetten. Dat verklaart waarom creatine zowel in de sportschool als in cognitieve studies bij slaaptekort terugkomt: hersenen zijn energie-intensief en profiteren van een snellere buffer.

Macro’s (koolhydraten, vetten, eiwitten) zijn uiteindelijk de grondstoffen; training verhoogt het vermogen om die om te zetten in bruikbare ATP.`,
      whyItMatters: `Als je creatine of andere “energie”-supplementen beoordeelt, is het nuttig ATP te begrijpen als keten: substraat → mitochondriën → ATP → prestatie/herstel. Creatine ondersteunt de snelle herlading, niet magisch oneindig vermogen.

Lees vergelijkingen dus op dosering, vorm en zuiverheid — en blijf slaap en eiwit (zie ook eiwit na 40) als basis zien.`,
    },
    relatedSlugs: ['mitochondrien', 'eiwitbehoefte-na-40'],
    relatedComparisons: ['/beste/creatine'],
    metaTitle: 'ATP: Het Energiemolecuul Achter Inspanning en Denken',
    metaDescription:
      'Wat ATP is, hoe je lichaam het maakt en verbruikt, en waarom creatine in dat plaatje past — zonder marketingjargon.',
    referenties: toRefs([
      'Avgerinos KI et al. Effects creatine supplementation cognitive function healthy individuals. Exp Gerontol. 2018;108:166-173.',
      'Wyss M, Kaddurah-Daouk R. Creatine creatine kinase systems physiological processes. Physiol Rev classical bioenergetics.',
      'Walker JB. Creatine biosynthesis regulation function. Adv Enzymol Relat Areas Mol Biol methodological frames.',
      'Wallimann T et al. Cellular creatine kinase systems energy homeostasis — bioenergetics reviews.',
      'Berg JM, Tymoczko JL, Gatto GJ, Stryer L. Biochemistry (W.H. Freeman) — ATP, oxidative phosphorylation chapters standard reference.',
      'Hood DA et al. Mitochondrial adaptations contractile activity — Physiol Rev exercise energy coupling.',
    ]),
  },
  {
    slug: 'testosteron',
    insightTier: 3,
    term: 'Testosteron',
    theme: 'lichaam-veroudering',
    audience: 'mannen',
    shortDefinition:
      'Het belangrijkste mannelijke geslachtshormoon — met invloed op energie, spierbehoud en stemming, maar sterk individueel en leeftijdsafhankelijk.',
    content: {
      whatIsIt: `Testosteron wordt vooral in de testikels aangemaakt (met een klein deel uit de bijnieren). Het hoort bij mannelijke ontwikkeling, spiermassa, botdichtheid en libido — maar “normaal” is een bandbreedte, geen enkel doelgetal op een bonnetje.

Na je 40e dalen gemiddelde waarden geleidelijk; hoe snel en hoe merkbaar dat is, verschilt sterk per persoon. Vermoeidheid of minder zin in training heeft vaak meerdere oorzaken tegelijk (slaap, stress, voeding, medicatie).`,
      howItWorks: `Testosteron volgt een dagritme en reageert op slaap, inspanning en stressbelasting. Langdurige stress en slechte slaap kunnen samenhangen met minder gunstige hormonale patronen — dat is populatie-onderzoek, geen voorspelling voor jouw bloedwaarde.

Labtesten (totaal en soms vrij testosteron) horen in medische context: interpretatie hangt af van tijdstip, klachten en andere markers. Zelf-diagnose via marketing is riskant.`,
      whyItMatters: `Supplementen zoals zink of creatine worden soms besproken rond mannelijke gezondheid, maar vervangen geen medische beoordeling bij aanhoudende klachten. Lees onze pillar [testosteron na 40](/testosteron-na-40) en vergelijk zink inhoudelijk op [/beste/zink](/beste/zink) — altijd naast leefstijl (slaap, krachttraining, stress).`,
    },
    relatedSlugs: ['cortisol', 'hpa-as'],
    relatedComparisons: ['/beste/zink', '/beste/creatine'],
    metaTitle: 'Testosteron: Wat Het Is en Wat Verandert Na 40',
    metaDescription:
      'Testosteron uitgelegd: functie, leeftijdstrend en waarom labwaarden context nodig hebben — zonder supplement-hype.',
    referenties: toRefs([
      'Feldman HA et al. Age trends serum testosterone Massachusetts Male Aging Study. J Clin Endocrinol Metab. 2002;87(2):589-598.',
      'Harman SM et al. Longitudinal effects aging serum total free testosterone healthy men. J Clin Endocrinol Metab. 2001;86(2):724-731.',
      'Travison TG et al. Harmonized reference ranges testosterone J Clin Endocrinol Metab methodological.',
      'Bhasin S et al. Testosterone therapy men hypogonadism Endocrine Society clinical practice guideline context.',
      'Leproult R, Van Cauter E. Effect of 1 week sleep restriction on testosterone levels in young healthy men. JAMA. 2011;305(21):2173-2174.',
      'Prasad AS et al. Zinc status and serum testosterone levels in healthy adults. Nutrition. 1996;12(5):344-348.',
    ]),
  },
  {
    slug: 'slaapschuld',
    insightTier: 2,
    term: 'Slaapschuld',
    theme: 'leefstijl-herstel',
    shortDefinition:
      'Het cumulatieve tekort aan slaap over dagen of weken — vaak merkbaar als traagheid, prikkelbaarheid en slechter herstel.',
    content: {
      whatIsIt: `Slaapschuld ontstaat wanneer je structureel minder slaapt dan je lichaam nodig heeft — niet alleen één slechte nacht. Veel mensen 40+ compenseren met koffie en “doorgaan”, terwijl concentratie, humeur en herstel langzaam afnemen.

Het is geen officiële diagnose op zich; wel een bruikbaar begrip om te zien waarom kleine verbeteringen in bedtijd groot effect kunnen hebben.`,
      howItWorks: `Slaap bestaat uit cycli (licht, diep, REM). Tekort raakt vooral diepe slaap en REM — fases die belangrijk zijn voor herstel en geheugen. Je kunt “genoeg uren” hebben en toch niet uitgerust zijn als het ritme verstoord is (laat naar bed, schermlicht, alcohol).

Inhalen van slaap in het weekend helpt deels, maar lost een verstoord weekritme niet volledig op.`,
      whyItMatters: `Voor supplementen is slaap de basis: melatonine ondersteunt vooral timing, magnesium past bij ontspanning — geen vervanging van structurele slaapschuld. Lees [slaap verbeteren na 40](/slaap-verbeteren-na-40) en blogs over [slaapritme](/blog/slaapritme-herstellen).`,
    },
    relatedSlugs: ['melatonine', 'cortisol', 'slaaphygiene'],
    relatedComparisons: ['/beste/magnesium'],
    metaTitle: 'Slaapschuld: Wat Het Is en Hoe Je Het Terugdraait',
    metaDescription:
      'Slaapschuld uitgelegd: hoe tekort zich opstapelt en welke leefstijlstappen eerst helpen — vóór supplementen.',
    referenties: toRefs([
      'Van Dongen HP et al. The cumulative cost of additional wakefulness: dose-response effects on neurobehavioral functions and sleep physiology. Sleep. 2003;26(2):117-126.',
      'Banks S, Dinges DF. Behavioral and physiological consequences of sleep restriction. J Clin Sleep Med. 2007;3(5):519-528.',
      'Walker MP. Why we sleep — neurocognitive consequences sleep loss reviews.',
      'Leproult R, Van Cauter E. Role of sleep and sleep loss in hormonal release and metabolism. Endocr Dev.',
      'Irish LA et al. The role of sleep hygiene in promoting public health: a review of empirical evidence. Sleep Med Rev. 2015;22:23-36.',
      'Czeisler CA. Duration timing safety during sleepiness circadian physiology perspective.',
    ]),
  },
  {
    slug: 'sociale-verbinding',
    insightTier: 1,
    term: 'Sociale verbinding',
    theme: 'leefstijl-herstel',
    shortDefinition:
      'Mensen bij wie je jezelf kunt zijn en op wie je kunt terugvallen — een van de sterkst onderbouwde leefstijlfactoren voor gezond ouder worden.',
    content: {
      whatIsIt: `Sociale verbinding gaat niet over hoeveel mensen je kent, maar over de kwaliteit van een handvol relaties: mensen bij wie je jezelf kunt zijn en op wie je kunt terugvallen als het tegenzit. Voor veel mensen boven de 40 versmalt dat netwerk ongemerkt — werk, gezin en agenda eten de vriendschappen op die vroeger vanzelf gingen.

In grote overzichtsstudies hangt het ontbreken van zulke steun samen met een hoger risico op vroegtijdig overlijden — in de orde van grootte van bekende risicofactoren als roken en overgewicht. Dat maakt verbinding geen 'soft' thema, maar een volwaardig leefstijldomein, naast slaap, stress, voeding en beweging.`,
      howItWorks: `Het mechanisme loopt via je stress-systeem. Betrouwbaar contact dempt de stressrespons: in gezelschap van mensen die je vertrouwt, komt je lichaam sneller terug in de herstelstand. Chronisch gebrek aan steun houdt datzelfde systeem juist licht geactiveerd — met doorwerking op slaap, energie en herstel.

Daarnaast werkt verbinding via gedrag: wie ergens verwacht wordt, beweegt meer, drinkt gemiddeld minder en houdt routines makkelijker vol. Steun ontvangen en grenzen stellen zijn daarbij verschillende vaardigheden — een vol werkleven is geen vervanging voor mensen bij wie je terecht kunt.`,
      whyItMatters: `Er bestaat geen supplement voor dit domein — en dat zeggen we er nadrukkelijk bij. De winst zit in gedrag: één vast contactmoment per week met iemand bij wie je jezelf kunt zijn, is een kleinere stap dan het klinkt en een van de best onderbouwde leefstijlacties die er zijn.

In de Leefstijlcheck telt verbinding mee als interventiedomein. Scoort het bij jou laag, begin dan niet met méér agenda-items, maar met één terugkerend moment — bellen, wandelen, sporten met dezelfde persoon. Herhaling bouwt de terugvalbasis, niet de grootte van je netwerk.`,
    },
    relatedSlugs: ['nervus-vagus', 'cortisol', 'healthspan'],
    relatedComparisons: [],
    metaTitle: 'Sociale verbinding en gezondheid na je 40e | PerfectSupplement',
    metaDescription:
      'Waarom sociale verbinding een volwaardig leefstijldomein is na 40: wat het met je stress-systeem doet, wat de wetenschap zegt en welke kleine stap het meest oplevert. Geen supplement — bewust.',
    referenties: toRefs([
      'Holt-Lunstad J, Smith TB, Layton JB. Social relationships and mortality risk: a meta-analytic review. PLoS Med. 2010.',
      'Holt-Lunstad J, Smith TB, Baker M, et al. Loneliness and social isolation as risk factors for mortality: a meta-analytic review. Perspect Psychol Sci. 2015.',
      'Santini ZI, Koyanagi A, Tyrovolas S, et al. The association between social relationships and depression: a systematic review. J Affect Disord. 2015.',
      'Umberson D, Montez JK. Social relationships and health: a flashpoint for health policy. J Health Soc Behav. 2010.',
      'Valtorta NK, Kanaan M, Gilbody S, et al. Loneliness and social isolation as risk factors for coronary heart disease and stroke: systematic review and meta-analysis. Heart. 2016.',
    ]),
    laatstBijgewerktOp: '2026-07-05',
  },
  {
    slug: 'magnesiumvormen',
    insightTier: 3,
    publicFullContent: true,
    term: 'Magnesiumvormen',
    theme: 'supplementwetenschap',
    shortDefinition:
      'Niet elk magnesium op het etiket wordt even goed opgenomen — de chemische vorm bepaalt opname en doel.',
    content: {
      whatIsIt: `Magnesium komt in supplementen als verschillende zouten: oxide, citraat, bisglycinaat, tauraat, enzovoort. Het elementaire magnesium per capsule verschilt per vorm — en dus ook wat je lichaam effectief binnenkrijgt.

“400 mg magnesium” op de voorkant kan citraat, oxide of een mix zijn; zonder specificatie is vergelijken lastig.`,
      howItWorks: `Oxide heeft doorgaans lagere opname; citraat en glycinaat worden vaak beter verdragen en opgenomen. Bisglycinaat (chelaat) wordt gekoppeld aan aminozuur-transporters — relevant als je gevoelige darmen hebt.

Transparantie op het etiket (elementair mg, vorm, geen verkapte blends) is waar onze [magnesiumvergelijking](/beste/magnesium) op scoort.`,
      whyItMatters: `Kies vorm op doel en verdraging: avond/ontspanning vs algemene aanvulling. Lees ook [biobeschikbaarheid](/kennisbank/biobeschikbaarheid) en [chelaatvorm](/kennisbank/chelaatvorm).`,
    },
    relatedSlugs: ['biobeschikbaarheid', 'chelaatvorm'],
    relatedComparisons: ['/beste/magnesium'],
    metaTitle: 'Magnesiumvormen: Oxide, Citraat, Bisglycinaat en Meer',
    metaDescription:
      'Magnesiumvormen vergeleken: opname, verdraging en waar je op let bij het kiezen van een supplement.',
    referenties: toRefs([
      'Schwalfenberg GK, Genuis SJ. The importance of magnesium in clinical healthcare. ScientificWorldJournal. 2017;2017:4179326.',
      'Workinger JL et al. Challenges in magnesium absorption: regulating factors and adaptations. Nutr Rev. 2018;76(11):849-867.',
      'NIH Office of Dietary Supplements. Magnesium Fact Sheet for Health Professionals.',
      'EFSA authorised claims magnesium nervous system muscle fatigue contexts.',
      'Gröber U et al. Myth or Reality—Transdermal Magnesium? Nutrients. 2017;9(8):813.',
      'Institute of Medicine. Dietary Reference Intakes: magnesium DRV methodological chapters.',
    ]),
  },
  {
    slug: 'overtrainingssyndroom',
    insightTier: 2,
    term: 'Overtrainingssyndroom',
    theme: 'leefstijl-herstel',
    shortDefinition:
      'Een langdurige disbalans tussen trainingbelasting en herstel — met vermoeidheid, slechtere prestaties en soms stemmingsverandering.',
    content: {
      whatIsIt: `Overtraining (of het overtrainingssyndroom) is geen “lui zijn” — het is wanneer je lichaam wekenlang meer belasting krijgt dan het kan verwerken, ondanks slaap en voeding die op papier oké lijken. Veel fanatieke sporters 40+ herkennen het patroon: harder trainen terwijl prestaties en stemming achteruitgaan.

Het verschilt van een normale dip na zware week: het houdt aan en verbetert niet met één rustweek.`,
      howItWorks: `Belasting = training + werkstress + slaaptekort. Herstel = slaap, voeding (eiwit), rustdagen en soms minder volume. Zonder die balans blijft het sympathische “aan”-gevoel langer hangen; herstelmarkers en subjectief welzijn kunnen achterblijven.

Diagnose hoort bij sportmedisch/zorgprofessional bij aanhoudende klachten; online checklists zijn geen vervanging.`,
      whyItMatters: `Supplementen zoals creatine of magnesium ondersteunen delen van het plaatje, maar vervangen geen deload. Zie profiel [Overtrainer](/profiel/overtrainer), pillar [herstel na 40](/herstel-verbeteren-na-40) en blog [creatine en herstel](/blog/creatine-en-herstel).`,
    },
    relatedSlugs: ['mitochondrien', 'cortisol'],
    relatedComparisons: ['/beste/creatine', '/beste/magnesium'],
    metaTitle: 'Overtrainingssyndroom: Tekenen en Herstelroute',
    metaDescription:
      'Overtraining uitgelegd: wanneer te veel belasting wint van herstel en welke stappen eerst helpen.',
    referenties: toRefs([
      'Meeusen R et al. Prevention diagnosis and treatment of the overtraining syndrome. Eur J Sport Sci. 2013;13(1):1-24.',
      'Kreher JB, Schwartz JB. Overtraining syndrome: a practical guide. Sports Health. 2012;4(2):128-138.',
      'Budgett R. Fatigue and underperformance in athletes: the overtraining syndrome. Br J Sports Med. 1998;32(2):107-110.',
      'Halson SL. Monitoring training load to understand fatigue in athletes. Sports Med. 2014;44(Suppl 2):S139-S147.',
      'Foster C et al. Monitoring training in athletes with reference to overtraining syndrome. Med Sci Sports Exerc.',
      'Kellmann M et al. Recovery and performance in sport: consensus statement. Int J Sports Physiol Perform.',
    ]),
  },
  {
    slug: 'vitamine-d',
    insightTier: 3,
    term: 'Vitamine D',
    theme: 'lichaam-veroudering',
    shortDefinition:
      'Een vetoplosbare stof die je huid maakt onder invloed van UVB-zonlicht — en die in Nederland vaak tekortschiet, vooral in de winter.',
    content: {
      whatIsIt: `Vitamine D is technisch geen vitamine maar een prohormoon: je huid zet cholesterol om in vitamine D3 onder UVB-licht. Daarna wordt het in lever en nieren geactiveerd. Het reguleert calcium, botten, spieren en immuunfunctie — honderden genen worden erdoor beïnvloed.`,
      howItWorks: `In Nederland is de zon tussen oktober en maart vaak te laag voor voldoende huidsynthese — vooral bij binnenwerk, donkere huid of bedekkende kleding. Wat daarbij telt is de hoek: onder een zonnestand van ongeveer 45 graden bereikt te weinig UVB de grond, en achter glas gebeurt er niets omdat ramen UVB wegfilteren. Melanine en leeftijd verlengen de benodigde blootstelling; de huid maakt na verzadiging vanzelf niets meer aan, waardoor je via de zon geen overdosis kunt oplopen.

Zonbescherming filtert in laboratoriumtests 95–98% van datzelfde UVB, maar in veldonderzoek leidt normaal gebruik zelden tot een lagere status — mensen smeren dunner dan de testnorm en blijven langer buiten. Zie [zonnebrand en vitamine D](/blog/zonnebrand-en-vitamine-d), [hoeveel zon je nodig hebt](/blog/vitamine-d-zon-nederland) en het jaarritme in [vitamine D door het jaar heen](/blog/vitamine-d-seizoenen-jaarritme).

Voeding levert meestal te weinig (vette vis, verrijkte producten). Suppletie met D3 (cholecalciferol) is gangbaar na bloedmeting (25-OH-vitamine D) en medisch advies. De EFSA-bovengrens voor langdurige inname bij volwassenen is 100 µg (4000 IE) per dag; grote trials als VITAL en D2d vonden bij mensen zonder tekort geen effect op hun primaire uitkomsten — zie [hoge doses vitamine D](/blog/vitamine-d-hoge-doses-social-media).`,
      whyItMatters: `Veel mensen 40+ hebben in de winter een lage status zonder het te weten. EFSA erkent claims op botten, spieren en immuunsysteem — geen erkende claim op "meer energie" als etiketbelofte. De standaardtest is 25-OH-vitamine D, niet de actieve 1,25-vorm; wanneer meten iets toevoegt staat in [vitamine D meten](/blog/vitamine-d-meten-wanneer-zinvol). Praktische innamevragen (vet, tijdstip, combinaties) staan bij [vitamine D innemen](/kennisbank/vitamine-d-inname); wat onderzoek zegt over schildklier, diabetes en duizeligheid staat in [vitamine D en aandoeningen](/blog/vitamine-d-aandoeningen-onderzoek), en de slaapvraag in [vitamine D en slaap](/blog/vitamine-d-en-slaap).

Lees verder: [vitamine D en energie](/blog/vitamine-d-en-energie), [tekort herkennen](/blog/vitamine-d-tekort-herkennen) en de keuzevraag [D3 met of zonder K2](/blog/vitamine-d-en-k2-samen). Vergelijk producten op [/beste/vitamine-d](/beste/vitamine-d). De Leefstijlcheck vraagt naar zonlicht (LIF_SUN).`,
    },
    relatedSlugs: ['mitochondrien', 'vitamine-k2', 'vitamine-d-inname'],
    relatedComparisons: ['/beste/vitamine-d'],
    metaTitle: 'Vitamine D: Wat Doet Het en Wanneer Suppletie?',
    metaDescription:
      'Vitamine D uitgelegd: zonnestand en UVB in Nederland, zonbescherming, tekort, EFSA-claims, bovengrens en wanneer meten zinvol is na 40.',
    laatstBijgewerktOp: '2026-09-01',
    referenties: toRefs([
      'Holick MF. Vitamin D deficiency. N Engl J Med. 2007;357(3):266-281.',
      'Ross AC et al. Dietary Reference Intakes for Calcium and Vitamin D. Institute of Medicine. 2011.',
      'EFSA Panel on Dietetic Products. Scientific opinion on dietary reference values for vitamin D. EFSA Journal. 2016;14(10):4547.',
      'Bouillon R et al. Skeletal and extraskeletal actions of vitamin D: impact on health. Nat Rev Endocrinol. 2019;15(11):632-645.',
      'Amrein K et al. Vitamin D deficiency 2.0: an update on the current status worldwide. Eur J Clin Nutr. 2020;74(11):1498-1513.',
      'Spiro A, Buttriss JL. Vitamin D: an overview of vitamin D status and intake in Europe. Nutr Bull. 2014;39(4):322-350.',
      'Webb AR, Kline L, Holick MF. Influence of season and latitude on the cutaneous synthesis of vitamin D3. J Clin Endocrinol Metab. 1988;67(2):373-378.',
      'Neale RE, Khan SR, Lucas RM, Waterhouse M, Whiteman DC, Olsen CM. The effect of sunscreen on vitamin D: a review. Br J Dermatol. 2019;181(5):907-915.',
      'Manson JE, Cook NR, Lee IM, et al. Vitamin D supplements and prevention of cancer and cardiovascular disease (VITAL). N Engl J Med. 2019;380(1):33-44.',
      'EFSA Panel on Dietetic Products, Nutrition and Allergies. Scientific opinion on the tolerable upper intake level of vitamin D. EFSA Journal. 2012;10(7):2813.',
    ]),
  },
  {
    slug: 'vitamine-k2',
    insightTier: 3,
    term: 'Vitamine K2',
    theme: 'lichaam-veroudering',
    shortDefinition:
      'Een vetoplosbare vitamine (vaak als MK-7 in D3-combo’s) met twee geautoriseerde EU-claims — en één hartclaim die EFSA heeft afgewezen.',
    content: {
      whatIsIt: `Vitamine K is een familie: K1 (fylloquinon, vooral in groene bladgroenten) en K2 (menaquinonen, o.a. MK-4 en MK-7). In supplementen naast vitamine D3 zie je meestal K2 als MK-7, omdat die langer in het bloed blijft dan MK-4 en daardoor bij één dosis per dag past.

De EU-etiketclaims gelden voor vitamine K als nutriënt, niet voor een merkvorm. Wat wél op het etiket mag: vitamine K draagt bij tot de instandhouding van normale botten, en tot de normale bloedstolling. Die twee zijn geautoriseerd (EFSA Journal 2009;7(9):1228).`,
      howItWorks: `K2 activeert vitamine-K-afhankelijke eiwitten die betrokken zijn bij botmetabolisme en stolling. MK-7 heeft een langere halfwaardetijd dan MK-4; daarom doseren dagelijkse combo’s vaak 37–90 mcg MK-7 naast D3 in een oliedrager (beide zijn vetoplosbaar).

De marketingzin die je overal ziet — K2 zou calcium uit slagaders 'wegsturen' en D3 zou zonder K2 onveilig zijn — is precies de hart- en bloedvatenclaim die EFSA heeft afgewezen (EFSA Journal 2012;10(3):2714, ID 125). Die mag nergens in copy. D3 heeft eigen erkende claims, onder meer op de normale opname van calcium en fosfor; K2 voegt daar de erkende bot- en stollingsclaims aan toe, geen hartbelofte.`,
      whyItMatters: `Na 40 koopt de doelgroep D3+K2 vaak als één product. Dat is een echte keuzevraag bij vitamine D die je al overweegt — geen reden voor een losse K2-pagina. Die afweging (wat MK-7 wel doet, wat de meerprijs waard is, wanneer je oppast) staat uitgewerkt in [vitamine D en K2 samen](/blog/vitamine-d-en-k2-samen). Vergelijk combinaties op [/beste/vitamine-d](/beste/vitamine-d) en lees [vitamine D](/kennisbank/vitamine-d) voor zonlicht, tekort en D3-claims. Bij vitamine-K-antagonisten (antistolling) eerst met arts of apotheker overleggen: de stollingsclaim is er niet voor niets. De claimgrens zelf staat ook bij [EFSA-claims](/kennisbank/efsa-claims).`,
    },
    relatedSlugs: ['vitamine-d', 'efsa-claims', 'vitamine-d-inname'],
    relatedComparisons: ['/beste/vitamine-d'],
    metaTitle: 'Vitamine K2: Wat Mag Op Het Etiket — En Wat Niet',
    metaDescription:
      'Vitamine K2 (MK-7) uitgelegd: geautoriseerde bot- en stollingsclaims, de afgewezen hartclaim, en waarom D3+K2 bij vitamine D hoort.',
    laatstBijgewerktOp: '2026-09-01',
    referenties: toRefs([
      'EFSA Panel on Dietetic Products, Nutrition and Allergies. Scientific Opinion on the substantiation of health claims related to vitamin K. EFSA Journal. 2009;7(9):1228.',
      'EFSA Panel on Dietetic Products, Nutrition and Allergies. Vitamin K2 and maintenance of the elastic properties of the arteries: scientific opinion. EFSA Journal. 2012;10(3):2714.',
      'Commission Regulation (EU) No 432/2012 establishing a list of permitted health claims. Official Journal of the European Union. 2012.',
      'Schurgers LJ, Teunissen KJ, Hamulyak K, et al. Vitamin K-containing dietary supplements: comparison of synthetic vitamin K1 and natto-derived menaquinone-7. Blood. 2007;109(8):3279-3283.',
      'Knapen MH, Drummen NE, Smit E, Vermeer C, Theuwissen E. Three-year low-dose menaquinone-7 supplementation helps decrease bone loss in healthy postmenopausal women. Osteoporos Int. 2013;24(9):2499-2507.',
      'Booth SL. Vitamin K: food composition and dietary intakes. Food Nutr Res. 2012;56:5505.',
    ]),
  },
  {
    slug: 'vitamine-d-inname',
    insightTier: 2,
    term: 'Vitamine D innemen',
    theme: 'supplementwetenschap',
    shortDefinition:
      'Wanneer en waarmee je vitamine D inneemt: vet maakt verschil, het tijdstip nauwelijks — en een paar combinaties vragen wél aandacht.',
    content: {
      whatIsIt: `Rondom het innemen van vitamine D circuleren veel regels die stelliger klinken dan het onderzoek rechtvaardigt: 's ochtends zou beter zijn, 's avonds zou je slaap verstoren, en van alles zou je het niet samen mogen nemen. De hoofdlijn is eenvoudiger.

Vitamine D3 is vetoplosbaar. Dat is de enige innamefactor waarvan het effect op opname consistent is aangetoond: neem je het bij een maaltijd die vet bevat, dan wordt er meer opgenomen dan op een lege maag. Het gaat om gewone hoeveelheden vet — olie in je eten, zuivel, noten, vis, ei — niet om een speciale toevoeging.`,
      howItWorks: `Het tijdstip zelf is nauwelijks onderzocht en er is geen sterk bewijs dat ochtend of avond beter werkt. Wat wél telt is dat je het moment koppelt aan een maaltijd met vet, en dat je het volhoudt — vergeten innemen doet meer af aan je status dan het verkeerde uur.

De suggestie dat avondinname je slaap verstoort via melatonine wordt op supplementensites vaak herhaald, maar rust niet op overtuigend onderzoek bij gangbare doseringen. Wie er last van denkt te hebben, kan het moment verschuiven; een algemene regel valt er niet uit af te leiden. De volledige onderbouwing staat in [vitamine D en slaap](/blog/vitamine-d-en-slaap).

Over combinaties zijn er drie die aandacht verdienen. Zeer hoge doses vitamine A als supplement kunnen de werking van vitamine D tegenwerken. Calcium in overmaat is relevant omdat vitamine D juist de calciumopname verhoogt — de gangbare hoeveelheden in een multivitamine zijn geen probleem, extreme stapeling wel. En bij thiazide-diuretica (bepaalde plaspillen), die de calciumuitscheiding via de nieren verminderen, vraagt extra vitamine D overleg met arts of apotheker vanwege het risico op een te hoge calciumspiegel. Ook langdurig gebruik van sommige maagzuurremmers en corticosteroïden raakt het vitamine D-metabolisme.

Magnesium is nodig als cofactor bij de omzetting van vitamine D naar de actieve vorm. Dat is echte biochemie, maar het is geen argument om beide op hetzelfde tijdstip te nemen — het gaat om je algehele magnesiumvoorziening, niet om timing.`,
      whyItMatters: `De praktische samenvatting is kort: neem het bij een maaltijd met vet, op een moment dat je onthoudt, en check bij antistolling, plaspillen of langdurige medicatie even met arts of apotheker. Alles daarbuiten is grotendeels detail.

Belangrijker dan het innamemoment is de vraag of je het überhaupt nodig hebt: zie [vitamine D](/kennisbank/vitamine-d), [vitamine D meten](/blog/vitamine-d-meten-wanneer-zinvol) en de seizoenscontext in [vitamine D door het jaar heen](/blog/vitamine-d-seizoenen-jaarritme). Voor de keuze tussen D3 en D3+K2: [vitamine D en K2 samen](/blog/vitamine-d-en-k2-samen). Doseringsgrenzen staan in [hoge doses vitamine D](/blog/vitamine-d-hoge-doses-social-media).`,
    },
    relatedSlugs: ['vitamine-d', 'vitamine-k2', 'biobeschikbaarheid'],
    relatedComparisons: ['/beste/vitamine-d'],
    metaTitle: 'Vitamine D Innemen: Wanneer, Waarmee En Wat Niet Combineren',
    metaDescription:
      'Vitamine D innemen: waarom vet wel uitmaakt en het tijdstip nauwelijks, en welke combinaties (vitamine A, calcium, plaspillen) aandacht vragen.',
    laatstBijgewerktOp: '2026-09-01',
    referenties: toRefs([
      'Dawson-Hughes B, Harris SS, Lichtenstein AH, Dolnikowski G, Palermo NJ, Rasmussen H. Dietary fat increases vitamin D3 absorption. J Acad Nutr Diet. 2015;115(2):225-230.',
      'Mulligan GB, Licata A. Taking vitamin D with the largest meal improves absorption and results in higher serum levels of 25-hydroxyvitamin D. J Bone Miner Res. 2010;25(4):928-930.',
      'Uwitonze AM, Razzaque MS. Role of magnesium in vitamin D activation and function. J Am Osteopath Assoc. 2018;118(3):181-189.',
      'Rejnmark L. Effects of vitamin D on muscle function and performance: a review of evidence from randomized controlled trials. Ther Adv Chronic Dis. 2011;2(1):25-37.',
      'Gronstedt Fernandez B, Vestergaard P. Drug interactions with vitamin D and calcium: a clinical overview. Basic Clin Pharmacol Toxicol. 2019;125(Suppl 3):5-13.',
      'Institute of Medicine. Dietary Reference Intakes for Calcium and Vitamin D. Washington DC: National Academies Press; 2011.',
    ]),
  },
  {
    slug: 'insulineresistentie',
    insightTier: 3,
    term: 'Insulineresistentie',
    theme: 'lichaam-veroudering',
    shortDefinition:
      'Wanneer cellen minder gevoelig worden voor insuline — vaak besproken rond energie, gewicht en metabole gezondheid na 40.',
    content: {
      whatIsIt: `Insuline helpt glucose uit je bloed naar cellen te brengen. Bij insulineresistentie reageert het lichaam minder goed: de alvleesklier maakt meer insuline aan om hetzelfde effect te halen. Dat patroon wordt vaak genoemd in de context van type 2-diabetes-risico en “energiedips” na maaltijden — maar individuele klachten zijn niet specifiek genoeg om zelf te diagnosticeren.`,
      howItWorks: `Factoren die in onderzoek terugkomen: buikvet, weinig beweging, slaaptekort en hoge inname van ultra-bewerkte koolhydraten. Krachttraining en eiwitrijke maaltijden ondersteunen vaak stabilere bloedsuikerspiegels — geen wondermiddel, wel een praktische hefboom naast medische begeleiding.`,
      whyItMatters: `Na 40 hangt energie vaak samen met metabole gezondheid. Lees [energie na 40](/energie-na-40) voor voorzichtige koppelingen — altijd met huisarts bij aanhoudende klachten of risicofactoren.`,
    },
    relatedSlugs: ['mitochondrien', 'atp'],
    relatedComparisons: [],
    metaTitle: 'Insulineresistentie: Uitleg en Relevantie Na 40',
    metaDescription:
      'Insulineresistentie in begrijpelijke taal: wat het betekent, wat onderzoek zegt en wanneer medische hulp past.',
    referenties: toRefs([
      'Reaven GM. Banting lecture 1988. Role of insulin resistance in human disease. Diabetes. 1988;37(12):1595-1607.',
      'Kahn SE et al. Mechanisms linking obesity to insulin resistance and type 2 diabetes. Nature. 2006;444(7121):840-846.',
      'Petersen KF, Shulman GI. Etiology of insulin resistance. Am J Med. 2006;119(5 Suppl 1):S10-S16.',
      'WHO. Diabetes fact sheet and prevention frameworks.',
      'American Diabetes Association Standards of Care — insulin resistance screening contexts.',
      'Spiegel K et al. Sleep loss: a novel risk factor for insulin resistance and type 2 diabetes. J Appl Physiol.',
    ]),
  },
  {
    slug: 'oxidatieve-stress',
    insightTier: 3,
    term: 'Oxidatieve stress',
    theme: 'longevity',
    shortDefinition:
      'Een disbalans tussen vrije radicalen en antioxidanten — vaak genoemd bij veroudering, training en voeding.',
    content: {
      whatIsIt: `Je lichaam produceert continu reactieve zuurstofsoorten als bijproduct van energieproductie en afweer. Antioxidanten (eigen enzymen én uit voeding) neutraliseren het overschot. Als de balans scheef staat, spreken onderzoekers van oxidatieve stress — een concept, geen diagnose die je thuis meet.`,
      howItWorks: `Intensieve training verhoogt tijdelijk oxidatieve signalen; dat hoort bij adaptatie als herstel en voeding meekomen. Chronische ontsteking, roken, slaaptekort en ongezonde voeding worden vaker genoemd als aanhoudende belasting.`,
      whyItMatters: `Omega-3, vitamine D en beweging worden in verschillende lijnen onderzoek besproken in bredere gezondheidscontext — geen reden om mega-doses antioxidanten te stapelen zonder reden. Verbind met [EPA en DHA](/kennisbank/epa-dha) en pillars [herstel](/herstel-verbeteren-na-40) / [energie](/energie-na-40).`,
    },
    relatedSlugs: ['mitochondrien', 'epa-dha'],
    relatedComparisons: ['/beste/omega-3-supplement'],
    metaTitle: 'Oxidatieve Stress: Wat Het Betekent in de Praktijk',
    metaDescription:
      'Oxidatieve stress uitgelegd: balans, training, voeding en waarom meer supplementen niet automatisch beter is.',
    referenties: toRefs([
      'Halliwell B, Gutteridge JMC. Free Radicals in Biology and Medicine. Oxford University Press reference frames.',
      'Powers SK, Jackson MJ. Exercise-induced oxidative stress: cellular mechanisms and impact on muscle force production. Physiol Rev. 2008;88(4):1243-1276.',
      'Lobo V et al. Free radicals antioxidants functional foods impact human health. Pharmacogn Rev.',
      'Calder PC. Omega-3 fatty acids and inflammatory processes. Nutrients.',
      'Ristow M et al. Antioxidants prevent health-promoting effects of physical exercise in humans. Proc Natl Acad Sci USA controversial trial context.',
      'Harman D. Aging: a theory based on free radical and radiation chemistry. J Gerontol classical framing.',
    ]),
  },
  {
    slug: 'multivitamine',
    insightTier: 1,
    term: 'Multivitamine',
    theme: 'supplementwetenschap',
    shortDefinition:
      'Eén supplement met een breed pakket vitamines en mineralen tegelijk — bedoeld als "alles-in-één", niet gericht op een specifiek tekort.',
    content: {
      whatIsIt: `Een multivitamine bundelt tien tot dertig micronutriënten in één capsule of tablet, vaak rond de aanbevolen dagelijkse hoeveelheid (ADH) per stof. Het idee is dekking "voor de zekerheid" — niet een antwoord op een gemeten tekort of een specifiek profiel.

Dat onderscheidt een multivitamine van gerichte suppletie: waar [vitamine D](/kennisbank/vitamine-d) of magnesium een stof is die je kiest op basis van een concrete aanleiding, is een multivitamine een vast pakket dat voor iedereen hetzelfde is — ongeacht wat je leefstijl, voeding of bloedwaarden al dekken.`,
      howItWorks: `Grootschalige reviews vinden bij niet-deficiënte volwassenen geen consistent voordeel van multivitamines op harde uitkomsten zoals hart- en vaatziekten of kanker. De USPSTF-review concludeerde in 2013 onvoldoende bewijs voor een algemene aanbeveling, en het bijbehorende redactionele standpunt in Annals of Internal Medicine werd expliciet getiteld "Enough Is Enough". Het USPSTF-standpunt van 2022 herhaalde dat beeld en waarschuwde specifiek tegen bèta-caroteen en vitamine E in supplementvorm.

Dat betekent niet dat elke vitamine of elk mineraal nutteloos is — het betekent dat "alles een beetje" iets anders is dan "gericht wat nodig is". De Gezondheidsraad en het Voedingscentrum adviseren gerichte suppletie voor specifieke risicogroepen (zoals vitamine D in de winter, of B12 bij een plantaardig voedingspatroon), niet een algemeen multivitamine-advies voor iedereen.`,
      whyItMatters: `Voor een profiel na 40 is de vraag niet "welke multivitamine is het beste", maar "welk domein in mijn leefstijl vraagt om iets, en is dat met voeding of gericht supplement op te lossen". Een multivitamine beantwoordt die vraag niet — het slaat de vraag over. Lees het volledige argument in [waarom wij geen multivitamine aanbevelen](/blog/multivitamine-zinvol-na-40), of bekijk hoe we stoffen wél beoordelen via de [methodologie](/methodologie).`,
    },
    relatedSlugs: ['biobeschikbaarheid', 'efsa-claims'],
    relatedComparisons: [],
    metaTitle: 'Multivitamine: Wat Het Is en Wat Onderzoek Zegt',
    metaDescription:
      'Multivitamine uitgelegd: wat erin zit, wat grootschalig onderzoek vindt bij niet-deficiënte volwassenen, en waarom gerichte suppletie een ander uitgangspunt is.',
    referenties: toRefs([
      'Guallar E et al. Enough is enough: stop wasting money on vitamin and mineral supplements. Ann Intern Med. 2013;159(12):850-851.',
      'Fortmann SP et al. Vitamin and mineral supplements in the primary prevention of cardiovascular disease and cancer: a systematic evidence review for the U.S. Preventive Services Task Force. Ann Intern Med. 2013;159(12):824-834.',
      'US Preventive Services Task Force. Vitamin, mineral, and multivitamin supplementation to prevent cardiovascular disease and cancer: US Preventive Services Task Force recommendation statement. JAMA. 2022;327(23):2326-2333.',
      'Gezondheidsraad. Achtergronddocument vitamine D en overige voedingsnormen — gerichte suppletie-advisering risicogroepen.',
      'Voedingscentrum. Voedingssupplementen: wanneer zinvol en voor wie — adviesbasis Nederlandse consument.',
      'EFSA NDA Panel. Scientific opinions on health claims related to vitamins and minerals — claim-per-stof in plaats van productniveau.',
    ]),
  },
  {
    slug: 'ps-score-model',
    insightTier: 1,
    term: 'PS-Score',
    theme: 'ps-score',
    laatstBijgewerktOp: '2026-09-03',
    shortDefinition:
      'Een berekende score van 0 tot 100 voor supplementen in onze catalogus — uit etiketfeiten, EU-claims en gepubliceerde toetsing, zonder prijs.',
    content: {
      whatIsIt: `De PS-Score is geen redactioneel cijfer dat iemand intikt. Het is een geversioneerde rekensom: vijf onderdelen leveren elk 0–100 punten (of vallen weg als we ze niet kunnen vaststellen), en die worden gewogen tot één totaal. Modelversie 1.2.0 staat vastgelegd op [/ps-score](/ps-score); wijzigt de formule, dan wijzigt de versie en herberekenen we de catalogus.

Drie uitgangspunten sturen het model. Berekend, niet ingetypt: elk onderdeel volgt uit een etiketfeit, het Europese claimregister of een labrapport dat de fabrikant publiceert. Prijs zit er niet in: kosten krijgen een aparte rang, zodat kwaliteit en prijs los af te wegen blijven. Niet weten is geen nul: ontbreekt bijvoorbeeld het elementaire gehalte, dan valt dat onderdeel weg en hernormaliseren we het gewicht over de rest.`,
      howItWorks: `De vijf onderdelen zijn: [dosering t.o.v. onderzoeksdosis](/kennisbank/onderzoeksdosis) (30%), vorm en opneembaarheid (25%), [dekking van erkende EU-claims](/kennisbank/claimdekking) (15%), [etikettransparantie](/kennisbank/etikettransparantie) (15%) en [onafhankelijke toetsing](/kennisbank/onafhankelijke-toetsing) (15%). Waarom precies die verhouding — en waarom dat geen natuurwet is — staat onder [scoregewichten](/kennisbank/scoregewichten).

Op productkaarten zie je per onderdeel de punten en het effectieve gewicht. Valt een onderdeel uit (bijvoorbeeld claimdekking bij ashwagandha, waar geen EU-claim bestaat), dan herverdeelt het model automatisch. De redactionele scores op [/beste](/beste/magnesium)-pagina's (0–10, met o.a. smaak en gemak) staan hier los van.`,
      whyItMatters: `Zonder openbare rekensom is een "kwaliteitsscore" een marketinglabel. De PS-Score laat zien waar een cijfer vandaan komt, wat het model bewust niet meet (eigen labanalyses, smaak, geschiktheid voor jouw doel), en hoe je effectpotentieel (dosis × vorm) kunt scheiden van vertrouwen (transparantie en toetsing). Bekijk de volledige methode op [/ps-score](/ps-score) of blader door producten op [/supplementen](/supplementen#producten).`,
    },
    relatedSlugs: [
      'scoregewichten',
      'onderzoeksdosis',
      'claimdekking',
      'etikettransparantie',
      'onafhankelijke-toetsing',
      'biobeschikbaarheid',
    ],
    relatedComparisons: ['/beste/magnesium', '/beste/omega-3-supplement'],
    metaTitle: 'PS-Score: Hoe We Supplementen Berekenen',
    metaDescription:
      'De PS-Score (0–100) is berekend uit dosering, vorm, EU-claims, etikettransparantie en toetsing. Model 1.2.0 uitgelegd.',
    referenties: toRefs([
      'European Parliament and Council. Regulation (EC) No 1924/2006 on nutrition and health claims made on foods. OJ L 404, 30.12.2006.',
      'EFSA NDA Panel. Guidance on the scientific requirements for health claims related to antioxidants, oxidative damage and cardiovascular health. EFSA Journal methodological frame.',
      'Dwyer JT et al. Dietary supplements: regulatory challenges and research resources. Nutrients. 2018;10(1):41.',
      'Maughan RJ et al. IOC consensus statement: dietary supplements and the high-performance athlete. Br J Sports Med. 2018;52(7):439-455.',
      'Calder PC. Very long-chain n-3 fatty acids and human health: fact, fiction and the future. Proc Nutr Soc / Ann Nutr Metab context PMID 31808863.',
      'Institute of Medicine. Dietary Reference Intakes: the essential guide to nutrient requirements — dose vs. adequacy framing.',
    ]),
  },
  {
    slug: 'scoregewichten',
    insightTier: 1,
    term: 'Scoregewichten',
    theme: 'ps-score',
    laatstBijgewerktOp: '2026-09-03',
    domeinMetBeperktCausaalBewijs: true,
    shortDefinition:
      'De percentages waarmee de vijf PS-Score-onderdelen meetellen — een bewuste prioritering, geen percentage dat een meta-analyse voorschrijft.',
    content: {
      whatIsIt: `In model 1.2.0 wegen de onderdelen als volgt: dosering 30%, vorm en opneembaarheid 25%, claimdekking 15%, etikettransparantie 15%, onafhankelijke toetsing 15%. Samen 100%. Exacte percentages zijn redactionele keuzes: er bestaat geen peer-reviewed studie die zegt "vorm moet 25% zijn". Wel bestaat sterk bewijs dat elk onderdeel ertoe doet — en dat effect zonder adequate dosis of opneembare vorm niet te verwachten is.

Andere scoremodellen wegen anders. Zo legt een Amerikaans label-scoremodel "clinical adequacy" (dosering t.o.v. onderzoek) vaak het zwaarst — rond de 35% — en combineert transparantie met andere labeldimensies. Wij houden vijf aparte onderdelen omdat EU-claimdekking en gepubliceerde toetsing in Europa een andere rol spelen dan in DSHEA-landen.`,
      howItWorks: `Effectpotentieel krijgt 55%: dosering (30%) is de poort — onder de [onderzoeksdosis](/kennisbank/onderzoeksdosis) schaalt de score lineair mee; vorm (25%) voorkomt dat oxide of ethylester even hoog scoort als beter opneembare varianten. Vertrouwen en nut krijgen 45%: [claimdekking](/kennisbank/claimdekking) (15%) meet hoeveel erkende EU-claims deze dosering ontsluit, niet of de claim "mag"; [etikettransparantie](/kennisbank/etikettransparantie) (15%) straft proprietary blends en ontbrekende getallen; [toetsing](/kennisbank/onafhankelijke-toetsing) (15%) beloont gepubliceerde externe controle.

Ten opzichte van 1.1.0 ging dosering omhoog (+5), claimdekking en transparantie omlaag (−5 elk), toetsing omhoog (+5). Claimdrempels liggen vaak ver onder onderzoeksdoses; transparantie is een hygiene-factor met afnemende meerwaarde zodra het etiket open is; literatuur over label-inaccurateit en contaminatie onderbouwt meer gewicht voor toetsing — met een plafond van 15%, omdat wij (nog) geen eigen labanalyses doen.`,
      whyItMatters: `Zonder uitleg van de gewichten lijkt elk cijfer willekeurig. Met uitleg kun je het oneens zijn — en dat is precies het punt. Lees de rekensom op [/ps-score](/ps-score) of het overzicht onder [PS-Score](/kennisbank/ps-score-model).`,
    },
    relatedSlugs: [
      'ps-score-model',
      'onderzoeksdosis',
      'claimdekking',
      'etikettransparantie',
      'onafhankelijke-toetsing',
      'biobeschikbaarheid',
    ],
    relatedComparisons: [],
    metaTitle: 'Scoregewichten: Waarom 30/25/15/15/15 in de PS-Score',
    metaDescription:
      'Waarom dosering 30% weegt en toetsing 15%: redactionele prioritering met literatuur over dosis, vorm, claims en verificatie.',
    referenties: toRefs([
      'Calder PC. n-3 Fatty acids and cardiovascular disease: evidence explained and mechanisms explored. Clin Sci / Ann Nutr Metab 2020 PMID 31808863 — research dose vs. population advice.',
      'Walker AF et al. Mg citrate vs Mg oxide bioavailability urinary excretion RCT. Magnes Res. 2003;16(3):183-191.',
      'Neubronner J et al. Enhanced increase of omega-3 index from re-esterified triglycerides versus ethyl esters. Eur J Clin Nutr. 2011;65(2):247-254.',
      'Jagim AR et al. Common ingredient profiles of multi-ingredient pre-workout supplements: proprietary blends and underdosing risks. J Int Soc Sports Nutr context.',
      'Dwyer JT, Coates PM, Smith MJ. Dietary supplements: knowledge and confidence among healthcare professionals — quality verification need. Nutrients reviews.',
      'Or F et al. Analytical challenges ensuring dietary supplement quality: international perspectives. Front Pharmacol. 2021;12:714434.',
    ]),
  },
  {
    slug: 'onderzoeksdosis',
    insightTier: 1,
    term: 'Onderzoeksdosis',
    theme: 'ps-score',
    laatstBijgewerktOp: '2026-09-03',
    shortDefinition:
      'De dagdosering waarbij het aangehaalde onderzoek effect laat zien — niet de wettelijke claimdrempel, en niet "meer is beter".',
    content: {
      whatIsIt: `De onderzoeksdosis is de ondergrens waartegen de PS-Score de etiketdosering afzet. Blijft een product daaronder, dan schaalt het doseringsonderdeel lineair mee (100 mg elementair magnesium bij een doel van 200 mg → 50 punten). Komt de dosis tussen onderzoeksdosis en bovengrens, dan is dat onderdeel 100. Erboven volgt aftrek: hoger is hier niet beter.

Dat is iets anders dan de EFSA-claimdrempel. Die bepaalt of een fabrikant een goedgekeurde zin op de verpakking mag zetten — bij mineralen vaak al vanaf 15% van de referentie-inname. Die drempel zegt weinig over of de dosis in de buurt komt van wat trials en meta-analyses gebruikten.`,
      howItWorks: `Per categorie staat de waarde vast in het scoremodel. Magnesium: 200 mg elementair (meta-analyses rond slaap/stress), bovengrens 250 mg (EFSA UL voor magnesium uit supplementen). Omega-3: 1000 mg EPA+DHA (cardiometabole trials; model 1.0.0 had hier foutief 500 mg, een innameaanbeveling), UL 5 g. Vitamine D: 20 µg D3, UL 100 µg. Zink: 15 mg elementair, UL 25 mg. Creatine: 3 g (EFSA-claimvoorwaarde / ISSN onderhoud 3–5 g), bovengrens 5 g. Ashwagandha: 300 mg gestandaardiseerd wortelextract, bovengrens 600 mg. Eiwitpoeder: 20 g eiwit per portie (MPS-plateau), bovengrens 40 g. Melatonine: doseringsonderdeel valt uit — geen eenduidige onderzoeksdosis in dit model.

De volledige tabel met bronvermelding staat op [/ps-score](/ps-score).`,
      whyItMatters: `Dosering weegt 30% in de [PS-Score](/kennisbank/ps-score-model) — het zwaarste onderdeel — omdat een ondergedoseerd product geen effect kan leveren dat het onderzoek belooft, ongeacht hoe mooi de vorm of het etiket is. Zie ook [scoregewichten](/kennisbank/scoregewichten) en [claimdekking](/kennisbank/claimdekking).`,
    },
    relatedSlugs: ['ps-score-model', 'scoregewichten', 'claimdekking', 'efsa-claims', 'vitamine-d-inname'],
    relatedComparisons: [
      '/beste/magnesium',
      '/beste/omega-3-supplement',
      '/beste/vitamine-d',
      '/beste/creatine',
    ],
    metaTitle: 'Onderzoeksdosis: Waartegen We Dosering Meten',
    metaDescription:
      'Onderzoeksdosis vs. EFSA-claimdrempel: waarom 200 mg magnesium of 1000 mg EPA+DHA de PS-Score stuurt, niet de wettelijke ondergrens.',
    referenties: toRefs([
      'Zhang Y et al. Association of magnesium intake and status with sleep quality: systematic review/meta-analysis contexts PMID 33865376.',
      'Abbasi B et al. The effect of magnesium supplementation on primary insomnia in elderly: double-blind placebo-controlled clinical trial. J Res Med Sci. 2012;17(12):1161-1169. PMID 28445426 context cluster.',
      'Calder PC. Very long-chain n-3 fatty acids and human health. Ann Nutr Metab. 2020;76(Suppl 1) — PMID 31808863; ~1 g EPA+DHA trial dosing.',
      'Bischoff-Ferrari HA et al. A pooled analysis of vitamin D dose requirements for fracture prevention. BMJ. 2012;345:e4229. PMID 22833605.',
      'EFSA NDA Panel. Scientific Opinion on the Tolerable Upper Intake Level of magnesium / vitamin D / zinc — UL frames for supplemental intake.',
      'Kreider RB et al. International Society of Sports Nutrition position stand: safety and efficacy of creatine supplementation. J Int Soc Sports Nutr. 2017;14:18. PMID 28615996.',
      'EFSA NDA Panel. Creatine and increase in physical performance — conditions of use 3 g/day. EFSA Journal. 2011;9(7):2303.',
    ]),
  },
  {
    slug: 'claimdekking',
    insightTier: 1,
    term: 'Claimdekking',
    theme: 'ps-score',
    laatstBijgewerktOp: '2026-09-03',
    shortDefinition:
      'Hoeveel van de erkende EU-gezondheidsclaims voor een stof deze dagdosering ontsluit — een aandeel, geen ja/nee-label.',
    content: {
      whatIsIt: `Claimdekking beantwoordt: van alle bruikbare, goedgekeurde claims die voor deze stof op de Europese lijst staan, hoeveel haalt déze dosering? Het resultaat is een percentage van 0 tot 100 dat 15% meeweegt in de [PS-Score](/kennisbank/ps-score-model).

Dat is iets anders dan de vraag "mag dit product zijn claim voeren?". Die tweede vraag is een drempel (vaak 15% van de referentie-inname bij mineralen): alles of niets, geen glijdende schaal. Daarom staat die uitkomst als label op de productkaart, niet als punten.`,
      howItWorks: `Voor magnesium of zink is er in de praktijk één relevante drempel: haal je die, dan dekt de dosering de bruikbare claims. Bij omega-3 is er wél een gradient. De hartclaim vraagt 250 mg EPA+DHA per dag; de hersen- en gezichtsclaims vragen elk apart 250 mg DHA. Een olie met veel EPA en weinig DHA ontsluit er één van de drie — dat verschil is echt en telt mee.

Bestaat er geen erkende claim (ashwagandha, eiwit als zodanig), dan valt claimdekking weg en hernormaliseert het model. Kosten rekenen we apart per claim-conforme dag: doseer je onder de drempel, dan heb je meer nodig en stijgt de dagprijs.`,
      whyItMatters: `Claimdrempels liggen vaak ver onder de [onderzoeksdosis](/kennisbank/onderzoeksdosis). Alleen "claim-conform" zijn zegt dus weinig over of de dosis in trialgebied ligt. Daarom weegt claimdekking lichter dan dosering (15% vs. 30%), maar verdwijnt het niet: voor omega-3 maakt de DHA-splitsing een reëel verschil tussen producten. Achtergrond: [EFSA-claims](/kennisbank/efsa-claims).`,
    },
    relatedSlugs: ['efsa-claims', 'onderzoeksdosis', 'ps-score-model', 'scoregewichten', 'adh'],
    relatedComparisons: ['/beste/omega-3-supplement', '/beste/magnesium'],
    metaTitle: 'Claimdekking: EU-Claims Ontsluiten in de PS-Score',
    metaDescription:
      'Claim mogen vs. claimdekking: waarom de PS-Score meet hoeveel erkende EU-claims jouw dosering ontsluit — vooral relevant bij omega-3.',
    referenties: toRefs([
      'European Parliament and Council. Regulation (EC) No 1924/2006 on nutrition and health claims made on foods.',
      'European Commission. EU Register of nutrition and health claims — authorised Article 13/14 claims and conditions of use.',
      'EFSA NDA Panel. Scientific Opinion on health claims related to eicosapentaenoic acid (EPA) and docosahexaenoic acid (DHA) — heart, brain and vision claim conditions.',
      'EFSA NDA Panel. Scientific Opinion on health claims related to magnesium — source-of conditions tied to Annex Regulation 1924/2006.',
      'Pravst I. Health claims on foods in the EU: regulation, science and consumer protection. Eur J Nutr / Food Law reviews.',
      'Verhagen H, van Loveren H. Status of nutrition and health claims in Europe: scientific and regulatory perspectives.',
    ]),
  },
  {
    slug: 'etikettransparantie',
    insightTier: 1,
    term: 'Etikettransparantie',
    theme: 'ps-score',
    laatstBijgewerktOp: '2026-09-03',
    shortDefinition:
      'Vier controleerbare etiketfeiten: gekwantificeerde werkzame stof, dagdosering, uitgesplitste samenstelling, en geen proprietary blend.',
    content: {
      whatIsIt: `Etikettransparantie meet of je zelf kunt nalopen wat erin zit — niet of het product "werkt". In de PS-Score zijn het vier ja/nee-feiten die optellen tot 100 punten: werkzame stof in een getal (30), expliciete dagdosering (25), samenstelling per vorm uitgesplitst (25), geen proprietary blend (20). Het onderdeel weegt 15% mee.`,
      howItWorks: `Proprietary blends vermelden wel ingredienten, maar niet de hoeveelheid per stof. In pre-workout- en complexproducten zit een groot deel van de actieve stoffen vaak in zo'n blend — waardoor je niet kunt checken of de dosis in de buurt van onderzoek komt. Uitgesplitste samenstelling is vooral relevant bij mengsels (meerdere magnesiumvormen, EPA én DHA): zonder verdeling kun je de effectieve dosis per vorm niet herleiden.

Ontbreekt het elementaire gehalte of de dagdosering, dan kunnen andere scoreonderdelen (dosering, claimdekking) soms niet berekend worden. Transparantie is dus ook de voorwaarde om de rest van het model eerlijk te laten werken.`,
      whyItMatters: `Zonder open etiket is elke "klinische dosis"-claim oncontroleerbaar. Literatuur over sport- en afslanksupplementen laat zien dat blends underdosing en verborgen stimulerende stoffen faciliteren. Daarom blijft transparantie in de score — maar lichter dan dosering: eenmaal volledig open is de meerwaarde afnemend. Zie [PS-Score](/kennisbank/ps-score-model) en [scoregewichten](/kennisbank/scoregewichten).`,
    },
    relatedSlugs: ['ps-score-model', 'scoregewichten', 'onderzoeksdosis', 'onafhankelijke-toetsing', 'derde-partij-testen'],
    relatedComparisons: ['/beste/magnesium', '/beste/ashwagandha'],
    metaTitle: 'Etikettransparantie: Wat Je Zelf Op de Verpakking Nakijkt',
    metaDescription:
      'Vier etiketfeiten in de PS-Score: hoeveelheid, dagdosering, uitsplitsing en geen proprietary blend — waarom dat 15% weegt.',
    referenties: toRefs([
      'Jagim AR et al. Multi-ingredient pre-workout supplements: prevalence of proprietary blends and implications for efficacy and safety. J Int Soc Sports Nutr.',
      'Attipoe S et al. Label accuracy of select weight-loss dietary supplements — proprietary blends and undisclosed amounts. Nutrients. 2024;16(24):4369.',
      'US FDA. Dietary Supplement Labeling Guide — proprietary blend declaration rules (net weight, descending order).',
      'Maughan RJ et al. IOC consensus statement: dietary supplements and the high-performance athlete — quality and labeling concerns.',
      'Cohen PA. Hazards of hindsight — monitoring the safety of nutritional supplements. N Engl J Med. 2014;370(14):1277-1280.',
      'Dwyer JT et al. Dietary supplements: regulatory challenges and research resources. Nutrients. 2018;10(1):41.',
    ]),
  },
  {
    slug: 'onafhankelijke-toetsing',
    insightTier: 1,
    term: 'Onafhankelijke toetsing',
    theme: 'ps-score',
    laatstBijgewerktOp: '2026-09-03',
    shortDefinition:
      'Of een merk eindproduct of grondstof extern laat controleren én dat publiceert — plus categorie-markers zoals TOTOX of zware metalen.',
    content: {
      whatIsIt: `Onafhankelijke toetsing in de PS-Score meet of er bewijs buiten de fabrikant zichtbaar is: een onafhankelijk labonderzoek op het eindproduct (70 punten) en erkende grondstofkeurmerken zoals Creapure® of Quali-D® (tot 30 punten). Daarnaast tellen categorie-specifieke markers mee waar ze ergens over gaan — bijvoorbeeld oxidatiewaarde (TOTOX/PV/AV) bij omega-3, of verontreinigingstesten bij eiwit en ashwagandha.

Dit is niet hetzelfde als [etikettransparantie](/kennisbank/etikettransparantie): transparantie vraagt of getallen op de verpakking staan; toetsing vraagt of iemand buiten het merk die inhoud of zuiverheid heeft nagekeken en of dat is gepubliceerd.`,
      howItWorks: `Universeel: labtest + keurmerken, genormaliseerd op 100. Merkgebonden grondstofstandaarden tellen hier mee omdat de chemische vorm eronder al in het vorm-onderdeel scoort — één feit één keer. Gestandaardiseerde botanicals (KSM-66®) tellen hier juist niet mee: daar ís standaardisatie de vorm.

Bij omega-3 weegt een gepubliceerde oxidatiewaarde zwaar (GOED hanteert TOTOX ≤26 als vrijwillige bovengrens); zonder waarde is versheid niet te controleren. Verontreiniging (zware metalen, dioxines, pesticiden) telt waar de categorie dat vraagt. Ontbreekt een marker of is hij niet van toepassing, dan krimpt de noemer mee — geen straf-nul voor creatine omdat creatine niet oxideert.

Belangrijke grens: wij analyseren (nog) geen potjes zelf. Een merk dat wél test maar niets publiceert, scoort lager dan het verdient. Zie ook [derde-partij testen](/kennisbank/derde-partij-testen).`,
      whyItMatters: `Reviews laten structureel label-inaccurateit, adulteratie en contaminatie zien in het supplementveld. Zonder verificatie rusten dosis- en vormscores op onbewezen etiketclaims. Daarom weegt toetsing in model 1.2.0 15% (was 10%) — met een plafond, omdat gepubliceerde COA's nog geen eigen meting zijn. Volledige methode: [/ps-score](/ps-score).`,
    },
    relatedSlugs: [
      'derde-partij-testen',
      'etikettransparantie',
      'ps-score-model',
      'scoregewichten',
      'epa-dha',
    ],
    relatedComparisons: ['/beste/omega-3-supplement', '/beste/creatine', '/beste/ashwagandha'],
    metaTitle: 'Onafhankelijke Toetsing in de PS-Score',
    metaDescription:
      'Labtest, keurmerken en TOTOX/metalen in de PS-Score: wat 15% weegt, en waarom publicatie telt — niet alleen "getest"-claims.',
    referenties: toRefs([
      'Or F et al. Analytical challenges and metrological approaches to ensuring dietary supplement quality: international perspectives. Front Pharmacol. 2021;12:714434.',
      'Martinez-Sanz JM et al. Intended or unintended doping? A review of the presence of doping substances in dietary supplements used in sports. Nutrients / adulteration prevalence reviews.',
      'Crawford C et al. Screening for consistency and contamination within and between bottles of herbal supplements. PLoS One. 2021;16(12):e0260463.',
      'GOED. GOED Voluntary Monograph — oxidation limits including TOTOX ≤26 for EPA/DHA oils.',
      'Maughan RJ et al. IOC consensus statement: dietary supplements and the high-performance athlete. Br J Sports Med. 2018;52(7):439-455.',
      'Commission Regulation (EU) 2023/915 on maximum levels for certain contaminants in food — heavy metals and dioxins context for fish oils.',
    ]),
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
