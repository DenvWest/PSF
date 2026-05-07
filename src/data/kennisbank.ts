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
  /** Minimaal 5 wetenschappelijke of autoritaire bronvermeldingen. */
  bronnen: string[]
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
      bg: 'from-rose-700 to-rose-800',
      accent: 'bg-white/10 ring-white/20',
      tekst: 'text-rose-200/80',
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
    },
  },
  longevity: {
    title: 'Longevity & Gezond Ouder Worden',
    description: 'Het grotere plaatje: niet langer leven, maar langer goed leven.',
    icon: '⏳',
    colorClasses: {
      bg: 'from-amber-700 to-amber-800',
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
    bronnen: [
      'Shargel L, Yu ABC. Applied Biopharmaceutics & Pharmacokinetics (referentiekader absorptie en first-pass). McGraw-Hill/edities.',
      'Porter CJH et al. Lipid formulations strategies improving oral bioavailability poorly water-soluble compounds. Adv Drug Deliv Rev context.',
      'EFSA Scientific Committee guidance bioavailability dossiers EU nutrition risk assessment methodological frames.',
      'Atwater WO, Benedict FG. Classics experiments metabolizable energy foods — foundational intake vs utilization physiology.',
      'Welling PG. Pharmacokinetics processes mathematics clinical applications Wiley — textbook reference drug absorption relevance mineral vitamins.',
      'Institute Medicine US. Dietary Reference Intakes applications assessment nutrient bioavailability methodological chapters DRV science.',
    ],
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
    bronnen: [
      'Schuschke LA et al. Amino acid chelated minerals methodological nutritional chemistry reviews absorption frames.',
      'Ashmead HD, Graff DJ, Ashmead HH. Chelated Mineral Nutrition in Plants Animals Humans — reference chelation absorption literature.',
      'EFSA Panel scientific opinions mineral bioavailability chelated vs inorganic forms evaluation contexts.',
      'NIH Office Dietary Supplements Magnesium forms fact sheet consumer bioavailability practical frames.',
      'Fairweather-Tait SJ. Bioavailability trace elements mineral nutrition methodology Proc Nutr Soc reviews.',
      'Heaney RP. Factors influencing calcium absorption efficiency mineral metabolism classical reviews.',
    ],
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
    bronnen: [
      'Panossian A, Wagner H. Adaptogens — review efficacy tolerability rationale phytochemistry. Phytomedicine. 2005;12(11):834-849.',
      'Panossian A, Wikman G. Effects adaptogens nervous system pharmacology literature reviews.',
      'Chandrasekhar K et al. Prospective RCT ashwagandha stress adults Indian J Psychol Med landmark clinical context.',
      'Lopresti AL et al. Ashwagandha stress pharmacological mechanisms Medicine Baltimore clinical trial synopsis.',
      'EFSA Botanicals on hold list Withania somnifera regulatory claim dossier procedural context.',
      'Winston D, Maimes S. Adaptogens herbs strengthening HPA medicinal plant compendiums reference tradition science bridge.',
    ],
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
    bronnen: [
      'Mozaffarian D, Wu JH. Omega-3 fatty acids cardiovascular effects mechanisms. J Am Coll Cardiol foundational reviews.',
      'Calder PC. Marine omega-3 fatty acids inflammatory processes insights translational frameworks.',
      'EFSA authorised claims EPA+DHA cardiovascular health dossier lineage EU Nutrition Health Claims Register.',
      'WHO. Fats fatty acids human nutrition guideline updates expert consultation contexts.',
      'Abdelhamid AS et al. Omega-3 fatty acids CHD mortality Cochrane systematic review updates.',
      'Innis SM. Essential fatty acids growth development fetal infant nutrition physiology reviews.',
    ],
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
    bronnen: [
      'Roenneberg T et al. Social jetlag mismatch biological social clock epidemiology frameworks Curr Biol.',
      'Wittmann M et al. Social jetlag humans chronotypes misalignment physiology Chronobiol Int.',
      'Czeisler CA et al. Human circadian neuroscience stability precision sleep physiology landmark reviews frameworks.',
      'Foster RG, Kreitzman L. Circadian neuroscience biological clocks textbook lineage.',
      'Dijk DJ, von Schantz M. Timing timing timing sleep circadian phenotype aging literature.',
      'Gooley JJ et al. Evening light suppresses melatonin exposure thresholds J Clin Endocrinol Metab.',
    ],
  },
  // ── NIEUWE TERMEN ──────────────────────────────────────────

  {
    slug: 'adh',
    term: 'ADH (Aanbevolen Dagelijkse Hoeveelheid)',
    theme: 'supplementwetenschap',
    shortDefinition: 'De Nederlandse richtlijn voor de minimale dagelijkse inname van vitamines en mineralen.',
    content: {
      whatIsIt: `De Aanbevolen Dagelijkse Hoeveelheid (ADH) is de Nederlandse vertaling van de Europese referentie-inname (RI). Het is de hoeveelheid van een vitamine of mineraal die voldoende is om aan de behoefte van vrijwel de gehele gezonde bevolking te voldoen.

Je vindt de ADH op elk supplementetiket als percentage: "100% ADH" betekent dat één dosis de volledige aanbevolen hoeveelheid bevat. Maar de ADH is een minimum, geen optimum — en de waarden zijn vastgesteld voor de gemiddelde volwassene, niet specifiek voor mannen boven de 40.`,
      howItWorks: `De ADH wordt vastgesteld door de Europese Autoriteit voor Voedselveiligheid (EFSA) en is wettelijk verplicht op etiketten. Voor magnesium is de ADH 375 mg per dag, voor vitamine D 5 µg, voor omega-3 (EPA+DHA) 250 mg.

Belangrijk: de ADH is een referentiewaarde, geen persoonlijk advies. Iemand die intensief sport, chronische stress heeft of weinig vis eet kan een hogere behoefte hebben. Daarom kijken we bij onze beoordelingen niet alleen of een supplement de ADH haalt, maar of de dosering aansluit bij wat onderzoek laat zien voor specifieke doelgroepen.`,
      whyItMatters: `Veel supplementen adverteren met "500% ADH" alsof meer altijd beter is. Dat klopt niet — bij wateroplosbare vitamines plast je het overschot uit, bij vetoplosbare vitamines (A, D, E, K) kan overdosering schadelijk zijn. Wij beoordelen doseringen op basis van de ADH als ondergrens, gecombineerd met wat klinisch onderzoek aantoont als effectieve dosis voor de doelgroep.`,
    },
    relatedSlugs: ['biobeschikbaarheid'],
    relatedComparisons: ['/beste-magnesium', '/beste-omega-3-supplement', '/beste-vitamine-d', '/beste-zink'],
    metaTitle: 'ADH: Wat de Aanbevolen Dagelijkse Hoeveelheid Écht Betekent',
    metaDescription: 'De ADH is een minimum, geen optimum. Wat betekent het voor jouw supplementkeuze? Helder uitgelegd.',
    bronnen: [
      'EFSA Panel DRV population reference intake methodology EU nutrient reference dossiers.',
      'European Commission Regulation EU labeling reference intakes Annex XIII contexts consumer labels.',
      'Institute Medicine US Dietary Reference Intakes — applications assessment methodology chapters DRV science.',
      'WHO/FAO. Vitamin mineral requirements reports human nutrition international reference lineage.',
      'Renwick AG. Toxicology methodological approaches DRV establishment EFSA lineage scientific panels.',
      'Doets EL et al. Micronutrient status Netherlands methodological national intake survey contexts NL.',
    ],
  },
  {
    slug: 'efsa-claims',
    term: 'EFSA-claims',
    theme: 'supplementwetenschap',
    shortDefinition: 'Door de Europese voedselautoriteit goedgekeurde uitspraken over wat een supplement mag beweren.',
    content: {
      whatIsIt: `EFSA-claims zijn gezondheidsclaims die officieel zijn goedgekeurd door de European Food Safety Authority. In de EU mag een supplementfabrikant niet zomaar beweren dat zijn product "goed is voor je hart" of "je energie verhoogt" — die claim moet wetenschappelijk onderbouwd en goedgekeurd zijn.

Het EU-register bevat alle goedgekeurde claims. Bijvoorbeeld: "Magnesium draagt bij tot vermindering van vermoeidheid" is goedgekeurd. "Ashwagandha verlaagt je cortisol" is dat niet — ashwagandha-claims staan nog "on hold" bij EFSA.`,
      howItWorks: `Een fabrikant dient een dossier in bij EFSA met wetenschappelijk bewijs. EFSA beoordeelt of de claim voldoende onderbouwd is. Alleen goedgekeurde claims mogen op etiketten en in reclame gebruikt worden. Claims die zijn afgewezen mogen niet meer worden gemaakt.

Er is een tussencategorie: "on hold" claims. Dit zijn claims voor botanische stoffen (zoals ashwagandha, rhodiola) die nog niet beoordeeld zijn. Fabrikanten mogen deze claims voorlopig nog gebruiken, maar er is geen garantie dat ze worden goedgekeurd.`,
      whyItMatters: `Wanneer een supplement beweert dat het "je immuunsysteem versterkt" zonder dat die claim is goedgekeurd, is dat misleidend — en illegaal. Wij controleren bij elke beoordeling of de claims op het etiket en de website van de fabrikant overeenkomen met het EFSA-register. Een product dat ongefundeerde claims maakt, scoort lager op transparantie.`,
    },
    relatedSlugs: ['adh'],
    relatedComparisons: ['/beste-magnesium', '/beste-ashwagandha', '/beste-vitamine-d'],
    metaTitle: 'EFSA-claims: Welke Supplementclaims Zijn Écht Goedgekeurd?',
    metaDescription: 'Niet elke claim op een supplementetiket is waar. EFSA keurt ze goed of af. Wat mag wel en niet? Uitgelegd.',
    bronnen: [
      'European Parliament Council. Regulation EC 1924/2006 nutrition health claims legal framework EU.',
      'EFSA NDA Panel. Technical guidance health claim applications methodological scientific opinions overview.',
      'Pravst I. Health claims foods EU regulatory science consumer protection reviews.',
      'Verhagen H. Scientific substantiation health claims European perspective regulatory toxicology.',
      'Kozioł-Kozakowska A. Food supplement market safety challenges EU policy reviews.',
      'Richardson DP. Scientific substantiation health claims European Food Law perspectives.',
    ],
  },
  {
    slug: 'derde-partij-testen',
    term: 'Derde-partij Testen',
    theme: 'supplementwetenschap',
    shortDefinition: 'Onafhankelijke laboratoriumtesten die controleren of in een supplement zit wat er op het etiket staat.',
    content: {
      whatIsIt: `Derde-partij testen betekent dat een onafhankelijk laboratorium — niet de fabrikant zelf — controleert of een supplement daadwerkelijk bevat wat er op het etiket staat. Dit omvat de juiste dosering van actieve ingrediënten, afwezigheid van zware metalen, en controle op verontreinigingen.

In tegenstelling tot medicijnen worden supplementen in de EU niet vooraf getest door een overheidsinstantie. De fabrikant is zelf verantwoordelijk voor de kwaliteit. Derde-partij testen zijn vrijwillig — en dat maakt ze juist waardevol als kwaliteitsindicator.`,
      howItWorks: `Bekende onafhankelijke testorganisaties zijn NIZO (Nederland), Eurofins, NSF International en Informed Sport. Een fabrikant stuurt monsters op, het lab test op zuiverheid, potentie en contaminanten, en geeft een certificaat af.

Let op: "laboratorium getest" op een etiket zonder te vermelden welk lab is weinig waard. Transparante merken publiceren de naam van het testlab en maken certificaten beschikbaar op hun website.`,
      whyItMatters: `Een supplement kan een mooi etiket hebben met indrukwekkende doseringen, maar zonder onafhankelijke verificatie weet je niet of die doseringen kloppen. Derde-partij testen wegen mee in onze transparantie-score (20% van de totale beoordeling). Merken die hun testresultaten publiceren scoren hoger.`,
    },
    relatedSlugs: ['efsa-claims', 'biobeschikbaarheid'],
    relatedComparisons: ['/beste-omega-3-supplement', '/beste-ashwagandha', '/beste-creatine'],
    metaTitle: 'Derde-partij Testen: Hoe Weet Je Of Er Inzit Wat Erop Staat?',
    metaDescription: 'Supplementen worden niet vooraf gecontroleerd. Derde-partij testen zijn de beste garantie. Wat moet je weten?',
    bronnen: [
      'US FDA Dietary Supplement CGMP Final Rule 21 CFR Part 111 manufacturing quality regulatory reference.',
      'Cohen PA et al. Presence banned drugs adulterated dietary supplements FDA enforcement literature.',
      'Gurley BJ et al. Content versus label dietary supplements quality variability clinical pharmacology viewpoint.',
      'Maughan RJ et al. IOC consensus statement dietary supplements athlete quality assurance frameworks.',
      'Knapik JJ et al. Prevalence dietary supplement use military personnel quality surveillance contexts.',
      'Starr RR. Too little too late ineffective regulation dietary supplement safety methodological toxicology.',
    ],
  },
  {
    slug: 'slaaphygiene',
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
    relatedComparisons: ['/beste-magnesium'],
    metaTitle: 'Slaaphygiëne: De Gewoontes Die Je Slaap Maken of Breken',
    metaDescription: 'Slaaphygiëne is de basis voor goede slaap. Na 40 wordt het belangrijker. De 5 pijlers uitgelegd.',
    bronnen: [
      'Irish LA et al. Role sleep hygiene insomnia management rationale evidence Sleep Med Rev.',
      'Morgenthaler T et al. Practice parameters behavioral insomnia AASM standards contexts.',
      'Bootzin RR, Epstein DR. Understanding treating insomnia methodological CBT lineage.',
      'Ohayon MM. Epidemiology insomnia general population prevalence reviews frameworks.',
      'Van Straten A et al. Internet CBT insomnia Cochrane systematic review lineage.',
      'National Sleep Foundation sleep duration recommendation consensus methodological public health.',
    ],
  },
  {
    slug: 'eiwitbehoefte-na-40',
    term: 'Eiwitbehoefte na 40',
    theme: 'leefstijl-herstel',
    shortDefinition: 'Na 40 heeft je lichaam meer eiwit nodig om spiermassa te behouden — maar de meeste mannen eten te weinig.',
    content: {
      whatIsIt: `Vanaf je 40e begint je lichaam geleidelijk spiermassa te verliezen — een proces dat sarcopenie heet. Gemiddeld verlies je 3-8% spiermassa per decennium na je 30e, en dat versnelt na je 50e. Eiwit is de belangrijkste bouwsteen om dit tegen te gaan.

De standaard ADH voor eiwit (0,8 gram per kilogram lichaamsgewicht) is vastgesteld als minimum om deficiëntie te voorkomen — niet als optimum voor spierbehoud. Onderzoekers adviseren voor mannen boven de 40 eerder 1,2 tot 1,6 gram per kilogram, vooral in combinatie met krachttraining.`,
      howItWorks: `Na 40 treedt anabole resistentie op: je spieren reageren minder sterk op dezelfde hoeveelheid eiwit. Waar een 25-jarige met 20 gram eiwit per maaltijd een volledige spierproteïnesynthese-respons krijgt, heeft een 50-jarige daar 35-40 gram voor nodig.

Dit betekent dat het niet alleen gaat om hoeveel eiwit je per dag eet, maar ook om de verdeling over de dag. Drie maaltijden met elk 30-40 gram eiwit is effectiever dan één maaltijd met 90 gram en twee met 15 gram.`,
      whyItMatters: `Eiwitinname is een van de eerste dingen die wij controleren via de Leefstijlcheck. Veel mannen 40+ eten een ontbijt van brood met jam (5g eiwit) en een lunch van een broodje kaas (12g eiwit) — ruim onder wat hun lichaam nodig heeft. Dit is een leefstijlaanpassing die meer impact heeft dan welk supplement dan ook. Quick win: begin de dag met een eiwitrijk ontbijt (eieren, kwark, noten).`,
    },
    relatedSlugs: ['slaaphygiene'],
    relatedComparisons: ['/beste-creatine'],
    metaTitle: 'Eiwitbehoefte na 40: Hoeveel Heb Je Écht Nodig?',
    metaDescription: 'Na 40 heb je meer eiwit nodig dan je denkt. De wetenschap achter spierbehoud, simpel uitgelegd.',
    bronnen: [
      'Wolfe RR. Branched-chain amino acids muscle protein synthesis aging reviews J Nutr.',
      'Bauer J et al. Evidence-based recommendations optimal protein intake older adults PROT-AGE initiative.',
      'Moore DR et al. Protein ingestion stimulate muscle protein synthesis youth aging dose response.',
      'Deutz NEP et al. Protein intake exercise older adults PROT-AGE practical translational contexts.',
      'Morse CL et al. Sarcopenia functional outcomes exercise protein trials reviews.',
      'Houston DK et al. Healthy aging dietary protein needs controversies consensus Am J Clin Nutr.',
    ],
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
    bronnen: [
      'Crimmins EM. Lifespan healthspan population health metrics methodological demography longevity science.',
      'WHO. World report aging health frameworks disability-free life expectancy concepts.',
      'Christensen K et al. Age populations increasing survival improvement health late-life perspectives.',
      'Lunney JR et al. Patterns functional decline dying trajectories methodological gerontology.',
      'Rowe JW, Kahn RL. Successful aging paradigm updates MacArthur Study influential frameworks.',
      'Steptoe A. Happiness health and aging — psychosocial correlates healthy longevity reviews.',
    ],
  },
  {
    slug: 'hpa-as',
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

Ashwagandha en magnesium worden vaak gekozen bij spanning en slaap; die keuzes plaatsen zich in deze context, maar zijn geen vervanging voor hersteltijd en patronen die de as weer naar rust helpen trekken.

Bron: Herman JP et al. Regulation of the HPA Stress Response. Compr Physiol. 2016;6(2):603-621.`,
    },
    relatedSlugs: ['adaptogens', 'cortisol'],
    relatedComparisons: ['/beste-ashwagandha', '/beste-magnesium'],
    metaTitle: 'HPA-as: Wat Het Is en Waarom Het Na 40 Meer Voelt',
    metaDescription:
      'De HPA-as stuurt je stressreactie aan: van hypothalamus en hypofyse tot cortisol uit je bijnieren. Begrijpelijk uitgelegd.',
    bronnen: [
      'Herman JP et al. Regulation of the HPA Stress Response. Compr Physiol. 2016;6(2):603-621.',
      'Chrousos GP. Stress and disorders of the stress system. Nat Rev Endocrinol. 2009;5(7):374-381.',
      'McEwen BS. Allostasis allostatic load — stress adaptation neuroendocrine frames Ann NY Acad Sci lineage.',
      'Tsigos C, Chrousos GP. Hypothalamic-pituitary-adrenal axis J Psychosom Res stress physiology.',
      'Dickerson SS, Kemeny ME. Acute stressors cortisol responses Psychol Bull meta-theoretical integration.',
      'Wust S et al. HPA axis dysregulation methodological reviews hair salivary cortisol contexts.',
    ],
  },
  {
    slug: 'cortisol',
    term: 'Cortisol',
    theme: 'lichaam-veroudering',
    shortDefinition:
      'Je belangrijkste stresshormoon: het geeft je energie overdag, maar veroorzaakt problemen als het te lang te hoog blijft.',
    content: {
      whatIsIt: `Cortisol is een hormoon dat je bijnieren aanmaken. Het staat centraal in je stressrespons, maar het doet meer: het speelt mee in je dag-nachtritme, je bloedsuikerregulatie, je immuunsysteem en hoe waakzaam je overdag bent. Kortom: het verbindt “wat er speelt” met “wat je lichaam klaarmaakt om te doen”.

In een gezond patroon helpt cortisol je op te starten na de nacht en alert te blijven wanneer dat nodig is. Het probleem ontstaat vooral wanneer het niveau structureel te hoog blijft, of wanneer het ritme kantelt — bijvoorbeeld minder ochtendpiek of juist nachtelijke pieken — waardoor je je uit balans voelt ondanks voldoende uren in bed.`,
      howItWorks: `Typisch is cortisol ’s ochtends hoger (wakker worden, alertheid) en ’s avonds lager, zodat melatonine en slaap de ruimte krijgen. Chronische stress verstoort dat beeld: het kan “de hele dag aan” staan, of juist onrustig schommelen.

Er is ook een bekende wisselwerking met testosteron: bij langdurig hoge cortisolbelasting kan het lichaam voorrang geven aan stressas — met effecten op energie, spiermassa en libido die voor mannen 40+ merkbaar kunnen zijn. Het is geen simpele schakelaar; wel een reden om stress en herstel serieus te nemen naast eventuele supplementen.`,
      whyItMatters: `In de supplementwereld wordt ashwagandha (o.a. KSM-66) in studies in verband gebracht met lagere cortisolmarkers bij volwassenen onder stress — dat is populatie-onderzoek, geen garantie per persoon. Magnesium ondersteunt de normale werking van het zenuwstelsel (EFSA-goedgekeurde claim) en past vaak in hetzelfde verhaal: minder gespannen systeem, betere basis voor slaap.

Kies altijd op kwaliteit, dosering en je totale plaatje (slaapritme, beweging, voeding); cortisol optimaliseer je niet met één capsule alleen.

Bron: Chrousos GP. Stress and disorders of the stress system. Nat Rev Endocrinol. 2009;5(7):374-381.

Bron: Smith GD et al. Cortisol, Testosterone, and Coronary Heart Disease. Circulation. 2005;112(3):332-340.`,
    },
    relatedSlugs: ['hpa-as', 'melatonine'],
    relatedComparisons: ['/beste-ashwagandha'],
    metaTitle: 'Cortisol: Het Stresshormoon en Je Dag-Nachtritme',
    metaDescription:
      'Wat cortisol doet, hoe het ritme kan verstorren bij stress, en waarom dat na 40 merkbaar wordt — helder uitgelegd.',
    bronnen: [
      'Chrousos GP. Stress and disorders of the stress system. Nat Rev Endocrinol. 2009;5(7):374-381.',
      'Smith GD et al. Cortisol Testosterone Coronary Heart Disease. Circulation. 2005;112(3):332-340.',
      'Miller GE et al. HPA axis dysfunction psychopathology methodological psychoneuroendocrine reviews.',
      'Clow A et al. Cortisol awakening response Neurosci Biobehav Rev HPA metrics.',
      'Leproult R et al. Sleep loss elevation cortisol Sleep diurnal rhythm disruption.',
      'EFSA authorised claim magnesium nervous system context stress–sleep physiology adjunct.',
    ],
  },
  {
    slug: 'melatonine',
    term: 'Melatonine',
    theme: 'lichaam-veroudering',
    shortDefinition:
      'Het hormoon dat je lichaam helpt “nacht” te signaleren; de eigen aanmaak neigt te dalen na je 40e.',
    content: {
      whatIsIt: `Melatonine wordt aangemaakt in de pijnappelklier, een kleine structuur in je middenhersenen. Het is vooral een timing-signaal: het helpt je biologische klok te verankeren op donker en rust, niet om per se “hard” in slaap te vallen op commando. Vandaar het verschil tussen inslapen en een gezond 24-uursritme.

Naarmate je ouder wordt, daalt de piek in endogene melatonine bij veel mensen geleidelijk. Dat verklaart geen individuele diagnose, wél waarom het thema vaker opduikt bij mannen 40+: later moe worden, eerder wakker, of slaap die minder diep aanvoelt terwijl de omstandigheden gelijk lijken.`,
      howItWorks: `Wanneer het donker wordt, neemt de signalering naar de pijnappelklier toe en stijgt melatonine. Fel licht — met name blauw licht van schermen laat op de avond — kan die curve afvlakken: je hersenen krijgen het signaal dat het nog “dag” is.

Daardoor is licht hygiëne net zo relevant als doseringen op een flesje. Ook verstoringen in je vaste bed- en opsta-tijden (social jetlag) kunnen de timing van melatonine verschuiven, los van hoeveel milligram je inneemt.`,
      whyItMatters: `Melatonine als supplement hoort bij “ritme bijstellen” — bijvoorbeeld jetlag of een duidelijk verschoven slaapvenster — niet automatisch bij elke vorm van chronische slapeloosheid. Bij langdurig gebruik kan de gevoeligheid van je eigen aanmaak veranderen; daarom is zinvol gebruik vaak tijdelijk en in lage doses (denkrichting 0,3–0,5 mg bij time-shifts; vraag bij twijfel advies aan je arts, zeker bij medicatie).

Verbeter eerst het ritme (licht overdag, dimmen ’s avonds, vaste tijden): dat raakt dezelfde hormoon-as structureel.

Bron: Wurtman RJ. Age-Related Decreases in Melatonin Secretion. J Clin Endocrinol Metab. 2000;85(6):2135-2136.

Bron: Claustrat B, Leston J. Melatonin and circadian rhythm sleep disorders. Endotext (NIH), 2022. NBK550972.`,
    },
    relatedSlugs: ['circadiaan-ritme', 'cortisol'],
    relatedComparisons: [],
    metaTitle: 'Melatonine: Hormoon, Ritme en Wat Suppletie Wél en Niet Is',
    metaDescription:
      'Melatonine stuurt timing van slaap mee, vooral via je biologische klok. Wat er na 40 verandert en waar je op let bij suppletie.',
    bronnen: [
      'Wurtman RJ. Age-Related Decreases in Melatonin Secretion. J Clin Endocrinol Metab. 2000;85(6):2135-2136.',
      'Claustrat B, Leston J. Melatonin circadian rhythm sleep disorders. Endotext (NIH). NBK550972, 2022.',
      'Herxheimer A, Petrie KJ. Melatonin jet lag Cochrane systematic review.',
      'Ferracioli-Oda E et al. Meta-analysis melatonin primary sleep disorders methodological evidence.',
      'Gooley JJ et al. Evening use light-emitting readers suppress melatonin PNAS light physiology.',
      'Auld F et al. Systematic review melatonin management sleep disorders adults methodological frames.',
    ],
  },
  {
    slug: 'mitochondrien',
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

Combi die vaak werkt: structureel bewegen + voldoende eiwit + gerichte supplementen waar evidence en kwaliteit kloppen.

Bron: Short KR et al. Decline in skeletal muscle mitochondrial function with aging. Proc Natl Acad Sci. 2005;102(15):5618-5623.`,
    },
    relatedSlugs: ['atp', 'epa-dha'],
    relatedComparisons: ['/beste-omega-3-supplement', '/beste-creatine'],
    metaTitle: 'Mitochondriën: Je Cellulaire Energie en Wat Er Na 40 Verandert',
    metaDescription:
      'Mitochondriën maken ATP voor energie en herstel. Waarom dat na 40 anders voelt en wat rol speelt bij leefstijl en supplementen.',
    bronnen: [
      'Short KR et al. Decline skeletal muscle mitochondrial function aging. Proc Natl Acad Sci USA. 2005;102(15):5618-5623.',
      'Lanza IR, Nair KS. Mitochondrial function aging skeletal muscle methodological exercise physiology.',
      'Ji LL et al. Redox stress mitochondria aging methodological reviews exercise.',
      'Bonilla DA et al. Creatine mitochondria performance Bayesian meta-analysis contexts Nutrients lineage.',
      'Porter C et al. Human skeletal muscle mitochondrial function metabolic phenotyping methodological exercise trials.',
      'Hood DA et al. Mitochondrial adaptations contractile activity exercise reviews Physiol Rev lineage.',
    ],
  },
  {
    slug: 'nervus-vagus',
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

Combineer dit met eerlijke grenzen op werkdruk; supplementen zijn hooguit een tweede-lijnshygiëne.

Bron: Zaccaro A et al. How Breath-Control Can Change Your Life. Front Hum Neurosci. 2018;12:353.

Bron: Balban MY et al. Brief structured respiration practices enhance mood and reduce respiratory rate. Cell Rep Med. 2023;4(1):100895.`,
    },
    relatedSlugs: ['slaaphygiene', 'hpa-as'],
    relatedComparisons: [],
    metaTitle: 'Nervus Vagus: Je Rustzenuw en Ademhaling als Hefboom',
    metaDescription:
      'Wat de nervus vagus doet, hoe die samenhangt met stress en herstel, en waarom ademhaling snel effect kan geven — uitgelegd in begrijpelijke taal.',
    bronnen: [
      'Zaccaro A et al. How Breath-Control Can Change Your Life systematic review. Front Hum Neurosci. 2018;12:353.',
      'Balban MY et al. Brief structured respiration practices enhance mood. Cell Rep Med. 2023;4(1):100895.',
      'Lehrer PM, Gevirtz R. Heart rate variability biofeedback Front Psychol vagal tone overview.',
      'Laborde S et al. Heart rate variability vagal tone psychophysiology Neurosci Biobehav Rev.',
      'Noble D et al. Central autonomic networks — vagus pathways neurocardiology textbook contexts.',
      'Porges SW. Polyvagal theory methodological psychophysiology stress recovery literature.',
    ],
  },
  {
    slug: 'atp',
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

Lees vergelijkingen dus op dosering, vorm en zuiverheid — en blijf slaap en eiwit (zie ook eiwit na 40) als basis zien.

Bron: Avgerinos KI et al. Effects of creatine supplementation on cognitive function of healthy individuals. Exp Gerontol. 2018;108:166-173.`,
    },
    relatedSlugs: ['mitochondrien', 'eiwitbehoefte-na-40'],
    relatedComparisons: ['/beste-creatine'],
    metaTitle: 'ATP: Het Energiemolecuul Achter Inspanning en Denken',
    metaDescription:
      'Wat ATP is, hoe je lichaam het maakt en verbruikt, en waarom creatine in dat plaatje past — zonder marketingjargon.',
    bronnen: [
      'Avgerinos KI et al. Effects creatine supplementation cognitive function healthy individuals. Exp Gerontol. 2018;108:166-173.',
      'Wyss M, Kaddurah-Daouk R. Creatine creatine kinase systems physiological processes. Physiol Rev classical bioenergetics.',
      'Walker JB. Creatine biosynthesis regulation function. Adv Enzymol Relat Areas Mol Biol methodological frames.',
      'Wallimann T et al. Cellular creatine kinase systems energy homeostasis — bioenergetics reviews.',
      'Berg JM, Tymoczko JL, Gatto GJ, Stryer L. Biochemistry (W.H. Freeman) — ATP, oxidative phosphorylation chapters standard reference.',
      'Hood DA et al. Mitochondrial adaptations contractile activity — Physiol Rev exercise energy coupling.',
    ],
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
