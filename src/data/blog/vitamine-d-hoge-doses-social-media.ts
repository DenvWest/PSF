import type { BlogArtikel } from "@/types/blog";
import { toRefs } from "@/lib/referentie-bewijs";

export const vitamineDHogeDosesSocialMediaData: BlogArtikel = {
  slug: "vitamine-d-hoge-doses-social-media",
  categorie: "supplementen",
  titel: "Hoge doses vitamine D: wat social media niet vertelt",
  heroIntro:
    "10.000 IE per dag, 50.000 IE per week, 'de officiële adviezen zijn veel te laag' — hoge doses [vitamine D](/kennisbank/vitamine-d) zijn een terugkerend genre op elke tijdlijn. Het argument is altijd hetzelfde: instanties zijn te voorzichtig en meer is beter. Er zijn inmiddels grote trials die precies dat hebben onderzocht, en de uitkomst is niet wat de posts beloven. Soms is het zelfs de omgekeerde kant op.",
  leestijd: "9 min",
  gepubliceerdOp: "2026-09-01",
  laatstBijgewerktOp: "2026-09-01",
  leesNuanceOnderHero:
    "Dit artikel is voorlichting, geen doseringsadvies en geen diagnose. Vastgestelde tekorten worden soms met hoge doses behandeld — dat gebeurt onder begeleiding van een arts en is iets anders dan zelf opschalen.",
  secties: [
    {
      type: "tekst",
      titel: "Waar het meer-is-beter-idee vandaan komt",
      tekst:
        "Observationeel onderzoek liet jarenlang zien dat mensen met een lage vitamine D-status vaker van alles hadden: meer infecties, meer hart- en vaatziekten, meer sterfte, meer depressie. Als je die grafieken naast elkaar legt, ligt de conclusie voor het grijpen — vul het aan en je verlaagt al die risico's.\n\nDat is de klassieke stap van associatie naar oorzaak. Een lage vitamine D-status is namelijk ook een uitstekende marker voor iets anders: weinig buiten komen, weinig bewegen, overgewicht, chronische ziekte. Een lage waarde kan het gevólg zijn van slechte gezondheid in plaats van de oorzaak. Alleen een trial kan die twee uit elkaar halen.",
      callouts: [
        {
          variant: "kerninzicht",
          tekst:
            "Vitamine D is een van de best onderzochte supplementen ter wereld — juist daarom weten we zo goed waar suppletie bij mensen zónder tekort weinig oplevert.",
        },
      ],
    },
    {
      type: "tekst",
      titel: "Wat de grote trials lieten zien",
      bewijsNiveau: "sterk",
      subkoppen: [
        { titel: "VITAL en D2d" },
        { titel: "Waarom dat niet betekent 'vitamine D doet niets'" },
      ],
      tekst:
        "De VITAL-trial randomiseerde ruim 25.000 deelnemers naar 2000 IE vitamine D3 per dag of placebo, met kanker en hart- en vaatziekten als primaire uitkomsten. Na ruim vijf jaar was er op die primaire uitkomsten geen significant verschil. De D2d-trial testte 4000 IE per dag bij mensen met prediabetes en vond geen significante verlaging van het risico op diabetes.\n\nDat is een belangrijk resultaat, maar het betekent iets specifieks: bij een grotendeels goed-gevoede populatie met een redelijke uitgangsstatus levert extra vitamine D voor die uitkomsten weinig op. Het zegt weinig over mensen met een echt tekort, waar aanvulling wel degelijk zin heeft — en het haalt niets af van de erkende rol bij botten, spieren en immuunfunctie. De vraag is niet 'werkt vitamine D', maar 'werkt méér vitamine D bij iemand die al genoeg heeft'. Op die tweede vraag is het antwoord doorgaans nee.",
    },
    {
      type: "tekst",
      titel: "Waar het kantelt: meer kan minder worden",
      bewijsNiveau: "redelijk",
      tekst:
        "Interessanter dan 'geen effect' is dat er trials zijn waarin hoge doses ongunstiger uitpakten dan lagere. In een RCT bij oudere vrouwen leidde een jaarlijkse megadosis van 500.000 IE tot méér valincidenten en fracturen dan placebo. Een trial met maandelijkse hoge doses bij ouderen liet een vergelijkbaar patroon zien bij vallen, en een studie waarin 4000 en 10.000 IE per dag werden vergeleken met 400 IE vond bij de hoge doses geen betere maar juist een lagere botdichtheid op sommige meetpunten.\n\nDe verklaring is niet definitief, maar het patroon is consistent genoeg om serieus te nemen: bij micronutriënten is de dosis-responscurve vaak U-vormig. Te weinig is slecht, meer is beter tot een punt, en daarboven kantelt het. 'Meer is beter' is precies de aanname die dit type onderzoek onderuithaalt.",
      bewijsKanttekening:
        "Deze bevindingen komen uit specifieke populaties (vaak oudere vrouwen) en deels uit bolusdosering, wat niet hetzelfde is als dagelijkse inname. Ze zijn een reden tot voorzichtigheid, geen bewijs dat elke hoge dosis schaadt.",
    },
    {
      type: "tekst",
      titel: "De bovengrens en echte toxiciteit",
      tekst:
        "EFSA hanteert voor volwassenen een aanvaardbare bovengrens van 100 microgram (4000 IE) per dag voor langdurige inname. Dat is een veiligheidsmarge, geen kliffrand: één capsule erboven is geen vergiftiging.\n\nEchte vitamine D-toxiciteit bestaat wel en verloopt via hypercalciëmie — te veel calcium in het bloed, met misselijkheid, dorst, veel plassen, verwardheid en op termijn nierschade. Het treedt vrijwel uitsluitend op bij langdurig zeer hoge inname (meestal tienduizenden IE per dag over maanden) of bij doseerfouten in producten. Duizeligheid hoort in dat rijtje thuis — en staat verwarrend genoeg óók op lijstjes van tekortklachten; zie [vitamine D en aandoeningen](/blog/vitamine-d-aandoeningen-onderzoek). Via de zon kan het niet: je huid breekt overtollige previtamine D3 zelf af.\n\nHet punt is niet dat je bang moet zijn voor vitamine D. Het punt is dat de opwaartse ruimte zonder tekort klein is en het risico er wél is — een slechte verhouding voor een pil die je op gezag van een tijdlijn slikt.",
    },
    {
      type: "opsomming",
      titel: "Vijf signalen dat een post je iets verkoopt",
      inleiding:
        "Dit patroon herken je terug bij vrijwel elk supplement, niet alleen bij vitamine D.",
      items: [
        "'De officiële adviezen zijn te laag' zonder te noemen welke trials er zijn gedaan en wat die vonden.",
        "Een echt mechanisme dat wordt uitvergroot tot een uitkomst waar het onderzoek niet over gaat — zie ook [D3 en K2](/blog/vitamine-d-en-k2-samen).",
        "Een percentage dat klopt, met een conclusie die er niet uit volgt — zoals bij [zonnebrand en vitamine D](/blog/zonnebrand-en-vitamine-d).",
        "Anekdotes over energie en 'brain fog' in plaats van uitkomsten uit gecontroleerd onderzoek.",
        "Een kortingscode onder de video.",
      ],
    },
    {
      type: "tekst",
      titel: "Wat dan wel",
      tekst:
        "De saaie route is ook de verdedigbare: weet of je een tekort hebt voordat je doseert. Bij een gemeten tekort en advies van je huisarts is aanvulling zinvol en soms tijdelijk hoger gedoseerd. Zonder meting en zonder risicoprofiel is de gangbare, ruim binnen de bovengrens vallende dosering het redelijke vertrekpunt — zie [vitamine D meten](/blog/vitamine-d-meten-wanneer-zinvol) en vergelijk producten op [beste vitamine D](/beste/vitamine-d). Hoe wij supplementen wegen staat in de [PS-Score-methodiek](/ps-score).",
    },
    {
      type: "tekst",
      titel: "Turbo: check of dit überhaupt jouw knop is",
      tekst:
        "Als vermoeidheid je aanleiding is om vitamine D te overwegen, is de kans groot dat slaap, stress of eiwitinname meer opleveren. De [Leefstijlcheck](/intake) zet die domeinen naast elkaar zodat je gericht kiest in plaats van stapelt. Bredere context: [energie na 40](/energie-na-40).",
    },
  ],
  kernpunten: [
    "Grote trials (VITAL, D2d) vonden geen effect van suppletie op hun primaire uitkomsten bij mensen zonder tekort.",
    "Megadoses gaven in meerdere studies méér vallen en fracturen, niet minder.",
    "EFSA's bovengrens voor volwassenen is 4000 IE (100 µg) per dag bij langdurig gebruik.",
    "Toxiciteit verloopt via hypercalciëmie en komt door pillen, nooit door de zon.",
    "Aanvullen bij een gemeten tekort is iets heel anders dan opschalen op gevoel.",
  ],
  samenvatting:
    "Het 'meer is beter'-verhaal over vitamine D komt uit observationeel onderzoek dat associatie met oorzaak verwart. Grote trials als VITAL en D2d vonden geen effect op hun primaire uitkomsten bij mensen zonder tekort, en megadoses gaven in meerdere studies juist meer valincidenten en fracturen. EFSA houdt 4000 IE per dag aan als bovengrens voor langdurig gebruik. Meet bij twijfel in plaats van te doseren op gevoel.",
  supplementCTA: {
    naam: "Vitamine D3",
    uitleg:
      "Kies een gangbare dosering ruim binnen de bovengrens, of volg het advies bij een gemeten tekort — vergelijk µg/IE en prijs per dag.",
    href: "/beste/vitamine-d",
  },
  cornerstoneLink: {
    label: "Supplementgids: vitamine D",
    href: "/supplementen/vitamine-d",
  },
  vergelijkingExtraLink: {
    label: "Vitamine D supplementen vergelijken",
    href: "/beste/vitamine-d",
  },
  gerelateerdeSluggen: [
    "vitamine-d-en-k2-samen",
    "vitamine-d-meten-wanneer-zinvol",
    "zonnebrand-en-vitamine-d",
  ],
  metaTitle: "Hoge doses vitamine D: wat social media niet vertelt",
  metaDescription:
    "10.000 IE vitamine D per dag? Wat VITAL en D2d vonden, waarom megadoses in trials méér fracturen gaven en waar EFSA's bovengrens van 4000 IE ligt.",
  keywords: [
    "vitamine d hoge dosering",
    "vitamine d overdosering",
    "10000 ie vitamine d",
    "vitamine d bovengrens",
    "vitamine d teveel symptomen",
    "vitamine d onzin social media",
  ],
  referenties: toRefs([
    "Manson JE, Cook NR, Lee IM, et al. Vitamin D supplements and prevention of cancer and cardiovascular disease (VITAL). N Engl J Med. 2019;380(1):33-44.",
    "Pittas AG, Dawson-Hughes B, Sheehan P, et al. Vitamin D supplementation and prevention of type 2 diabetes (D2d). N Engl J Med. 2019;381(6):520-530.",
    "Sanders KM, Stuart AL, Williamson EJ, et al. Annual high-dose oral vitamin D and falls and fractures in older women: a randomized controlled trial. JAMA. 2010;303(18):1815-1822.",
    "Bischoff-Ferrari HA, Dawson-Hughes B, Orav EJ, et al. Monthly high-dose vitamin D treatment for the prevention of functional decline: a randomized clinical trial. JAMA Intern Med. 2016;176(2):175-183.",
    "Burt LA, Billington EO, Rose MS, Raymond DA, Hanley DA, Boyd SK. Effect of high-dose vitamin D supplementation on volumetric bone density and bone strength: a randomized clinical trial. JAMA. 2019;322(8):736-745.",
    "EFSA Panel on Dietetic Products, Nutrition and Allergies. Scientific opinion on the tolerable upper intake level of vitamin D. EFSA Journal. 2012;10(7):2813.",
    "Marcinowska-Suchowierska E, Kupisz-Urbanska M, Lukaszkiewicz J, Pludowski P, Jones G. Vitamin D toxicity: a clinical perspective. Front Endocrinol. 2018;9:550.",
  ]),
};
