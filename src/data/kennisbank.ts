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
