import type { BlogArtikel } from "@/types/blog";
import { toRefs } from "@/lib/referentie-bewijs";

export const overgangStressCortisolData: BlogArtikel = {
  slug: "overgang-stress-cortisol",
  categorie: "stress",
  audience: "vrouwen",
  titel: "Waarom je in de overgang sneller over je toeren raakt",
  coverImage: "/images/blog/overgang-stress-cortisol.jpg",
  coverImageAlt: "Vrouw van middelbare leeftijd die even pauzeert en ademhaalt",
  heroIntro:
    "Dezelfde drukte als vorig jaar, maar nu voelt het zwaarder — sneller geïrriteerd, moeilijker ontspannen, een kort lontje dat er eerder niet was. Dat is niet 'gewoon drukte', maar een herkenbaar patroon dat samenhangt met wat er hormonaal gebeurt in deze fase. Achtergrond over de bredere overgang staat in [de overgangsgids](/overgang).",
  leestijd: "8 min",
  gepubliceerdOp: "2026-09-05",
  laatstBijgewerktOp: "2026-09-05",
  secties: [
    {
      type: "tekst",
      titel: "De schakel tussen oestrogeen en je stressrespons",
      bewijsNiveau: "redelijk",
      tekst:
        "Oestrogeen heeft een dempend effect op de HPA-as — het systeem dat je stressrespons en cortisolaanmaak aanstuurt, uitgelegd bij [de HPA-as](/kennisbank/hpa-as). Zakt oestrogeen weg, dan verzwakt die demping, waardoor dezelfde stressor een sterkere en langduriger cortisolreactie kan geven dan voorheen. Dat verklaart een herkenbaar gevoel: niet per se meer stress van buitenaf, maar een systeem dat feller reageert op wat er al was.",
    },
    {
      type: "tekst",
      titel: "Slaaptekort maakt het een vicieuze cirkel",
      bewijsNiveau: "redelijk",
      tekst:
        "Slaapproblemen door opvliegers — zie [overgang en slecht slapen](/blog/overgang-slaapproblemen-opvliegers) — en een gevoeliger stresssysteem versterken elkaar. Te weinig slaap verhoogt cortisol de volgende dag, wat emotieregulatie lastiger maakt; die extra spanning maakt op zijn beurt inslapen moeilijker. Wie zich midden in de overgang 'anders' voelt qua kort lontje, herkent vaak precies deze combinatie eerder dan een op zichzelf staand stressprobleem.",
      bewijsKanttekening:
        "Stemmingsklachten in deze levensfase hebben vaak meerdere, overlappende oorzaken. Bij aanhoudende somberheid of angstklachten is contact met je huisarts de juiste vervolgstap, geen zelfdiagnose.",
    },
    {
      type: "opsomming",
      titel: "Wat de druk op je systeem verlaagt",
      inleiding:
        "Deze aanpak grijpt aan op het systeem zelf, niet op losse symptomen.",
      items: [
        "Regelmaat in slaap en maaltijden — een voorspelbaar dagritme dempt de stressrespons meetbaar.",
        "Beweging, vooral buiten: het verlaagt basale cortisolwaarden en verbetert slaap tegelijk.",
        "Ademhalingsoefeningen bij acute opflakkering — zie [ademhaling tegen stress](/blog/ademhaling-tegen-stress) voor een concrete techniek.",
        "Cafeïne na de middag afbouwen als je merkt dat je sneller geprikkeld raakt — het versterkt de cortisolpiek bovenop een toch al gevoeliger systeem.",
        "Grenzen expliciet maken op momenten met veel prikkels tegelijk (werk, zorg, huishouden) in plaats van 'er nog even doorheen bijten'.",
      ],
    },
    {
      type: "tekst",
      titel: "Waar ashwagandha wel en niet bij helpt",
      tekst:
        "Ashwagandha is het meest onderzochte adaptogeen bij stressklachten en heeft in gecontroleerde studies aangetoond cortisol te kunnen verlagen en subjectieve stress te verminderen. Dat onderzoek is grotendeels niet overgangsspecifiek uitgevoerd, dus zie het als een leefstijl-aanvulling naast de bovenstaande basis, niet als vervanging ervan. Zie [adaptogenen](/kennisbank/adaptogens) voor de achtergrond en [beste ashwagandha](/beste/ashwagandha) om producten te vergelijken.",
    },
    {
      type: "tekst",
      titel: "Turbo: een compleet beeld in plaats van los symptoom bestrijden",
      tekst:
        "Stress, slaap en energie beïnvloeden elkaar in deze fase sterk — de [Leefstijlcheck](/intake) laat in een paar minuten zien waar de grootste hefboom bij jou ligt. Vergelijken van supplementen kan daarna op [de supplementengids](/supplementen).",
    },
  ],
  kernpunten: [
    "Dalend oestrogeen verzwakt de demping op je stressrespons, waardoor dezelfde stressor feller aankomt.",
    "Slaaptekort door opvliegers en een gevoeliger stresssysteem versterken elkaar in een vicieuze cirkel.",
    "Regelmaat, beweging en ademhalingstechnieken grijpen aan op het systeem zelf.",
    "Ashwagandha kan ondersteunen, maar is grotendeels niet overgangsspecifiek onderzocht.",
  ],
  samenvatting:
    "Sneller over je toeren raken in de overgang komt doordat dalend oestrogeen de demping op je stressrespons verzwakt — dezelfde stressor geeft dan een fellere cortisolreactie. Slaaptekort door opvliegers versterkt dit patroon. Regelmaat, beweging en ademhalingstechnieken pakken het systeem zelf aan; ashwagandha kan daarnaast ondersteunen, met beperkt overgangsspecifiek bewijs.",
  cornerstoneLink: {
    label: "Overgang: wat verandert en wat helpt",
    href: "/overgang",
  },
  vergelijkingExtraLink: {
    label: "Vergelijk de beste ashwagandha supplementen",
    href: "/beste/ashwagandha",
  },
  gerelateerdeSluggen: [
    "overgang-slaapproblemen-opvliegers",
    "ademhaling-tegen-stress",
    "overgang-buikvet-gewichtstoename",
  ],
  metaTitle: "Overgang en stress: waarom je sneller over je toeren bent",
  metaDescription:
    "Waarom je in de overgang sneller geïrriteerd of gestrest raakt, hoe dalend oestrogeen je cortisolrespons beïnvloedt en wat volgens onderzoek helpt.",
  keywords: [
    "overgang stress",
    "overgang prikkelbaar",
    "overgang cortisol",
    "overgang emoties",
    "overgang kort lontje",
  ],
  referenties: toRefs([
    "Gordon JL, Girdler SS, Meltzer-Brody SE, et al. Ovarian hormone fluctuation, neurosteroids, and HPA axis dysregulation in perimenopausal depression. Am J Psychiatry. 2015;172(3):227-236.",
    "Woods NF, Mitchell ES. Symptoms during the perimenopause: prevalence, severity, trajectory, and significance in women's lives. Am J Med. 2005;118(Suppl 12B):14-24.",
    "Herman JP, McKlveen JM, Ghosal S, et al. Regulation of the hypothalamic-pituitary-adrenocortical stress response. Compr Physiol. 2016;6(2):603-621.",
    "Chandrasekhar K, Kapoor J, Anishetty S. A prospective, randomized double-blind, placebo-controlled study of safety and efficacy of a high-concentration full-spectrum extract of ashwagandha root in reducing stress and anxiety in adults. Indian J Psychol Med. 2012;34(3):255-262.",
    "Lopresti AL, Smith SJ, Malvi H, Kodgule R. An investigation into the stress-relieving and pharmacological actions of an ashwagandha extract: a randomized, double-blind, placebo-controlled study. Medicine (Baltimore). 2019;98(37):e17186.",
    "Bromberger JT, Kravitz HM. Mood and menopause: findings from the Study of Women's Health Across the Nation (SWAN) over 10 years. Obstet Gynecol Clin North Am. 2011;38(3):609-625.",
  ]),
};
