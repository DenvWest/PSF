import type { BlogArtikel } from "@/types/blog";
import { toRefs } from "@/lib/referentie-bewijs";

export const creatineEnBreinData: BlogArtikel = {
  slug: "creatine-en-brein-slaaptekort",
  categorie: "supplementen",
  titel: "Creatine en je brein: wat het onderzoek bij slaaptekort laat zien",
  coverImage: "/images/blog/creatine-en-brein-slaaptekort-v2.jpg",
  coverImageAlt: "Persoon die ’s nachts wakker ligt met telefoonlicht in bed",
  heroIntro:
    "Creatine als 'nootropic' is een van de snelst groeiende verhalen op social media. En anders dan bij veel supplementenhypes zit er echt onderzoek onder — alleen niet het onderzoek dat de posts suggereren. Hier lees je waar de bewijslijn sterk is (kortdurend slaaptekort, vegetariërs), waar hij dun blijft (uitgeruste mensen, dagelijks functioneren) en waarom geen enkele verkoper dit in Europa op het etiket mag zetten. Voor de brede vergelijking: [alle supplementen](/supplementen).",
  leestijd: "9 min",
  gepubliceerdOp: "2026-09-04",
  laatstBijgewerktOp: "2026-09-04",
  leesNuanceOnderHero:
    "Er bestaat in de EU geen toegestane gezondheidsclaim voor creatine en cognitie of concentratie. Dit artikel beschrijft onderzoek, geen belofte — en aanhoudende concentratieklachten horen bij je huisarts, niet bij een supplement.",
  secties: [
    {
      type: "tekst",
      titel: "Waarom je hersenen überhaupt creatine gebruiken",
      bewijsNiveau: "redelijk",
      tekst:
        "Je hersenen zijn energetisch duur: ongeveer een vijfde van je rustverbruik gaat naar een orgaan van anderhalve kilo. Net als in spierweefsel werkt daar een creatine-fosfaatsysteem dat ATP snel bijlaadt op momenten van piekvraag. Hersenweefsel maakt bovendien deels zijn eigen creatine aan en de opname vanuit het bloed verloopt trager dan in spieren — de bloed-hersenbarrière laat zich minder makkelijk vullen.\n\nDat verklaart twee dingen tegelijk. Het mechanisme is echt, en het is ook de reden dat effecten in de hersenen kleiner en trager zijn dan in de spier. Meer over die energieketen staat bij [ATP](/kennisbank/atp) en [mitochondriën](/kennisbank/mitochondrien).",
    },
    {
      type: "tekst",
      titel: "Waar de signalen het duidelijkst zijn",
      bewijsNiveau: "beperkt",
      subkoppen: [
        { titel: "Onder slaaptekort" },
        { titel: "Bij vegetariërs en veganisten" },
      ],
      tekst:
        "Het patroon in het onderzoek is opvallend consistent: creatine doet het meest wanneer het energiesysteem onder druk staat. In studies met kunstmatig slaaptekort presteerden deelnemers op reactie- en stemmingstaken beter met creatine dan met placebo. Recenter onderzoek met hersenscans liet zien dat een eenmalige hoge dosis tijdens een doorwaakte nacht de energiefosfaten in het brein en de prestatie op cognitieve taken beïnvloedde — een intrigerende bevinding, maar wel bij een kleine groep en met een dosering die ver boven het dagelijkse gebruik ligt.\n\nDe tweede groep waar effecten opduiken: mensen die weinig of geen vlees en vis eten. Creatine zit vooral in dierlijke producten, dus vegetariërs beginnen met een lagere voorraad en hebben meer ruimte om te winnen. In geheugentaken zijn juist bij deze groep de duidelijkste verschillen gevonden.\n\nBij goed uitgeruste omnivoren die normaal eten, blijven de gevonden effecten klein en inconsistent. Systematische reviews concluderen voorzichtig dat er signaal zit op geheugen en misschien op verwerkingssnelheid, met studies die verschillen in dosering, duur en gebruikte taken.",
      bewijsKanttekening:
        "De cognitieve trials zijn klein, kortdurend en heterogeen. Ze zijn ruim voldoende om het onderzoeksspoor interessant te noemen, en ruim onvoldoende om een uitkomst voor jouw werkweek te voorspellen.",
      callouts: [
        {
          variant: "letop",
          tekst:
            "Creatine is geen behandeling voor concentratieklachten, brain fog of vermoeidheid. Houden die aan, laat dan eerst de gewone oorzaken uitsluiten — slaapstoornis, bloedarmoede, schildklier, medicatie, stemming.",
        },
      ],
    },
    {
      type: "tekst",
      titel: "Wat er in Europa niet op het etiket mag",
      bewijsNiveau: "sterk",
      tekst:
        "Voor creatine zijn in de EU twee gezondheidsclaims toegestaan, en beide gaan over spieren: fysieke prestaties bij zeer korte, intensieve inspanning vanaf 3 gram per dag, en spierkracht in combinatie met krachttraining bij volwassenen boven de 55 jaar. Cognitie, focus, geheugen of 'mentale energie' staan er niet bij.\n\nEen verkoper die creatine met een brein-belofte aanprijst, overtreedt dus de claimverordening — ongeacht hoe interessant de studies zijn. Dat is een bruikbaar signaal over hoe zorgvuldig die verkoper met de rest van zijn teksten omgaat. Hoe dit systeem werkt lees je bij [EFSA-claims](/kennisbank/efsa-claims).",
    },
    {
      type: "tekst",
      titel: "De volgorde die wél iets oplevert",
      tekst:
        "Als de bevindingen het sterkst zijn onder slaaptekort, dan is de conclusie oncomfortabel maar logisch: het grootste rendement zit in de slaap zelf, niet in het supplement dat de schade wat verzacht. Een structureel slaaptekort van twee uur per nacht los je niet op met vijf gram poeder — zie [slaapschuld](/kennisbank/slaapschuld) en [slaapritme herstellen](/blog/slaapritme-herstellen).\n\nDat maakt creatine niet zinloos. Het maakt het een tweede laag: eerst de basis, dan een supplement waarvan het spiereffect goed onderbouwd is en het breineffect een bonusspoor in ontwikkeling. Die volgorde — basis eerst, dan pas stapelen — is precies wat de [Leefstijlcheck](/intake) voor je ordent.",
    },
    {
      type: "opsomming",
      titel: "Hoe je dit onderzoek eerlijk leest",
      inleiding:
        "Vier vragen die je bij elk 'creatine voor je brein'-bericht kunt stellen.",
      items: [
        "Wie deed er mee: uitgeruste omnivoren, of mensen onder slaaptekort of met een vegetarisch dieet?",
        "Welke dosis en hoe lang? Eenmalige megadoses in een scan zijn iets anders dan 5 gram per dag.",
        "Wat is er gemeten: een reactietaak in een lab, of iets dat op je werkdag lijkt?",
        "Wordt er een claim gedaan die in de EU niet is toegestaan? Dan verkoopt iemand je een verwachting.",
      ],
    },
    {
      type: "tekst",
      titel: "Turbo: kies op wat wél vaststaat",
      tekst:
        "Het spiereffect van creatine is degelijk onderbouwd en betaalbaar; het breinspoor is nieuwsgierig-makend en onaf. Wil je op die eerste grond kiezen, vergelijk dan op zuiverheid, dosering en prijs per claim-conforme dag: [beste creatine](/beste/creatine). En wil je zien hoe creatine zich verhoudt tot de andere stoffen die je overweegt, dan staan ze op de [supplementengids](/supplementen) allemaal langs dezelfde meetlat.",
    },
  ],
  kernpunten: [
    "Je brein gebruikt hetzelfde creatine-fosfaatsysteem als je spieren, maar vult trager.",
    "De duidelijkste effecten zitten bij slaaptekort en bij vegetariërs met een lage uitgangsvoorraad.",
    "Bij uitgeruste omnivoren zijn effecten klein en inconsistent.",
    "In de EU bestaat geen toegestane claim voor creatine en cognitie — beide claims gaan over spieren.",
    "Structureel slaaptekort verhelp je met slaap, niet met een supplement.",
  ],
  samenvatting:
    "Creatine in de hersenen is een echt mechanisme met voorlopig bescheiden bewijs: de duidelijkste effecten komen uit studies onder slaaptekort en bij vegetariërs, terwijl uitgeruste omnivoren kleine en inconsistente verschillen laten zien. In de EU is er geen toegestane claim voor cognitie — beide creatineclaims gaan over spieren. Wie op focus stuurt, wint het meest bij het aanpakken van de slaap zelf.",
  supplementCTA: {
    naam: "Creatine monohydraat",
    uitleg:
      "Toegestane EU-claims gaan uitsluitend over fysieke prestatie en spierkracht. Cognitie is onderzoeksterrein, geen claim — beoordeel verkopers daar ook op.",
    href: "/beste/creatine",
  },
  cornerstoneLink: {
    label: "Supplementgids: creatine",
    href: "/supplementen/creatine",
  },
  vergelijkingExtraLink: {
    label: "Alle supplementen op één meetlat",
    href: "/supplementen",
  },
  gerelateerdeSluggen: [
    "creatine-en-herstel",
    "creatine-dosering-en-laadfase",
    "slaapritme-herstellen",
  ],
  metaTitle: "Creatine en je brein: wat zegt het onderzoek?",
  metaDescription:
    "Creatine voor focus en geheugen: waar het bewijs zit (slaaptekort, vegetariërs), waar het dun blijft, en waarom een cognitieclaim in de EU niet mag.",
  keywords: [
    "creatine hersenen",
    "creatine cognitie",
    "creatine focus",
    "creatine slaaptekort",
    "creatine geheugen",
    "creatine nootropic",
  ],
  referenties: toRefs([
    "Rae C, Digney AL, McEwan SR, Bates TC. Oral creatine monohydrate supplementation improves brain performance: a double-blind, placebo-controlled, cross-over trial. Proc Biol Sci. 2003;270(1529):2147-2150.",
    "McMorris T, Harris RC, Swain J, et al. Effect of creatine supplementation and sleep deprivation, with mild exercise, on cognitive and psychomotor performance, mood state, and plasma concentrations of catecholamines and cortisol. Psychopharmacology (Berl). 2006;185(1):93-103.",
    "Avgerinos KI, Spyrou N, Bougioukas KI, Kapogiannis D. Effects of creatine supplementation on cognitive function of healthy individuals: a systematic review of randomized controlled trials. Exp Gerontol. 2018;108:166-173.",
    "Prokopidis K, Giannos P, Triantafyllidis KK, Kechagias KS, Forbes SC, Candow DG. Effects of creatine supplementation on memory in healthy individuals: a systematic review and meta-analysis of randomized controlled trials. Nutr Rev. 2023;81(4):416-427.",
    "Gordji-Nejad A, Matusch A, Kleedörfer S, et al. Single dose creatine improves cognitive performance and induces changes in cerebral high energy phosphates during sleep deprivation. Sci Rep. 2024;14:4937.",
    "Roschel H, Gualano B, Ostojic SM, Rawson ES. Creatine supplementation and brain health. Nutrients. 2021;13(2):586.",
    "Benton D, Donohoe R. The influence of creatine supplementation on the cognitive functioning of vegetarians and omnivores. Br J Nutr. 2011;105(7):1100-1105.",
    "Commission Regulation (EU) No 432/2012 establishing a list of permitted health claims made on foods. Official Journal of the European Union. 2012.",
  ]),
};
