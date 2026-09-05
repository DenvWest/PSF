import type { BlogArtikel } from "@/types/blog";
import { toRefs } from "@/lib/referentie-bewijs";

export const magnesiumVoorWieWelNietData: BlogArtikel = {
  slug: "magnesium-voor-wie-wel-niet",
  categorie: "supplementen",
  titel: "Voor wie is magnesium zinvol — en voor wie niet?",
  coverImage: "/images/blog/magnesium-voor-wie-wel-niet.jpg",
  coverImageAlt: "Keuken met verse ingrediënten in plaats van een multi",
  heroIntro:
    "Magnesium wordt verkocht alsof het voor iedereen hetzelfde doet. Dat doet het niet. Bij iemand die maagzuurremmers slikt is de onderbouwing sterk; bij een goed etende dertiger zonder klachten is die er nauwelijks; en bij iemand met een verminderde nierfunctie is het een reden om éérst met de arts te overleggen. Dit artikel loopt acht profielen langs en zegt per profiel wat het beste bewijs oplevert — inclusief de gevallen waarin het antwoord “nee” of “niet zonder arts” is.",
  leestijd: "12 min",
  gepubliceerdOp: "2026-09-04",
  laatstBijgewerktOp: "2026-09-04",
  leesNuanceOnderHero:
    "Profielen zijn geen diagnoses. Ze helpen je inschatten hoe sterk de onderbouwing in jouw situatie is; ze vervangen geen beoordeling door huisarts, POH of apotheker die je volledige beeld kent.",
  secties: [
    {
      type: "tekst",
      titel: "Waarom één antwoord hier niet bestaat",
      bewijsNiveau: "sterk",
      tekst:
        "Bij de meeste supplementen gaat de discussie over de stof. Bij magnesium gaat hij over de persoon. Magnesium is namelijk geen middel dat een effect toevoegt, maar een mineraal dat een tekort opheft — en of dat iets oplevert, hangt volledig af van de vraag of dat tekort er is.\n\nDat verklaart waarom het onderzoek zo verdeeld oogt. Trials bij mensen met een lage uitgangsstatus laten regelmatig effect zien; trials bij mensen die al voldoende binnenkrijgen laten dat vrijwel nooit zien. Dat is geen tegenspraak maar hetzelfde antwoord, twee keer. Alleen worden die twee groepen in productteksten stelselmatig op één hoop gegooid, waardoor een bevinding bij een tekortgroep als algemene belofte gaat rondzingen.\n\nDe nuttige vraag is dus nooit “werkt magnesium”, maar “hoe groot is de kans dat ik krap zit, en wat kost het me als ik ernaast zit”. De profielen hieronder beantwoorden die twee vragen.",
      callouts: [
        {
          variant: "kerninzicht",
          tekst:
            "Magnesium heft een tekort op; het voegt niets toe aan een status die al toereikend is. Elk profiel hieronder is in feite een schatting van de kans dat je in de eerste groep zit.",
        },
      ],
    },
    {
      type: "opsomming",
      titel: "Profielen waarbij de onderbouwing sterk is",
      inleiding:
        "Hier is niet alleen de kans op een krappe status verhoogd, maar is dat verband ook goed gedocumenteerd. In deze situaties is aanvullen verdedigbaar — en soms is het gesprek met je arts of apotheker de eerste stap, niet de laatste.",
      items: [
        "Je gebruikt langdurig maagzuurremmers — protonpompremmers zijn in kaart gebracht als oorzaak van een verlaagd magnesium, sterk genoeg voor officiële waarschuwingen van medicijnautoriteiten. Gebruik je ze langer dan een jaar, breng de magnesiumbepaling dan actief ter sprake — zie [magnesium en medicijnen](/blog/magnesium-in-combinatie-met-medicijnen).",
        "Je gebruikt plaspillen (lisdiuretica of thiaziden) — die verhogen de magnesiumuitscheiding via de nier. Dit hoort in overleg met de voorschrijver, omdat het samenhangt met kalium en natrium — zie [kalium-natriumbalans](/kennisbank/kalium-natrium-balans).",
        "Je hebt slecht gereguleerde diabetes type 2 — verhoogde glucose in de urine trekt magnesium mee; het verband is consistent in observationeel onderzoek.",
        "Je drinkt structureel fors alcohol — dit is een van de best gedocumenteerde oorzaken van een echt magnesiumtekort, via verlies langs zowel darm als nier.",
        "Je hebt een chronische darmaandoening, coeliakie of een maagverkleining — het opnameoppervlak en de doorlooptijd zijn veranderd; hier speelt magnesium in een breder plaatje van meerdere micronutriënten.",
      ],
    },
    {
      type: "opsomming",
      titel: "Profielen waarbij het redelijk maar niet hard is",
      inleiding:
        "Hier is de inname vaak krap of de behoefte verhoogd, maar ontbreekt het bewijs dat suppletie daadwerkelijk klachten verbetert. Aanvullen is te verdedigen als aanvulling van de inname — niet als behandeling.",
      items: [
        "Je eet weinig volkoren, noten, zaden en peulvruchten — dan is de kans op een structureel krappe inname reëel en is aanvullen logisch. Eerst rekenen loont: zie [magnesium uit voeding](/blog/magnesium-uit-voeding).",
        "Je traint intensief en zweet veel — de behoefte ligt bij sporters wat hoger, maar het prestatie-effect van suppletie concentreert zich bij sporters die vooraf al krap zaten. Zie [krachttraining na 40](/blog/krachttraining-na-40).",
        "Je slaapt onrustig en komt 's avonds niet los — de trials zijn klein en van matige kwaliteit; het effect is plausibel maar bescheiden. Eerlijk uitgewerkt in [magnesium voor slaap](/blog/magnesium-en-slaap).",
        "Je staat langdurig onder spanning — er is een aannemelijk tweerichtingsverband tussen stress en magnesiumverlies, met bescheiden bewijs voor suppletie. Zie [magnesium en stress](/blog/magnesium-en-stress).",
        "Je bent vrouw in of rond de overgang — de inname is in deze groep vaak krap en botbehoud wordt relevanter; specifieke overgangsklachten zijn echter niet aangetoond te verbeteren. Zie [magnesium in de overgang](/blog/magnesium-overgang-vrouwen).",
      ],
    },
    {
      type: "opsomming",
      titel: "Profielen waarbij het antwoord nee is — of niet zonder arts",
      inleiding:
        "Dit is het deel dat in productteksten ontbreekt. Niet omdat magnesium gevaarlijk is, maar omdat “het kan geen kwaad” in deze gevallen niet klopt of simpelweg niets oplevert.",
      items: [
        "Je hebt een verminderde nierfunctie of nierziekte — je nier is het orgaan dat een overschot afvoert. Werkt die minder goed, dan kan magnesium zich ophopen. Dit is een uitgesproken reden om níet zelf te starten, maar eerst te overleggen.",
        "Je gebruikt bisfosfonaten of bepaalde antibiotica — magnesium kan de werking daarvan verminderen door binding in de darm. Aanvullen kán, maar het innameschema is dan geen detail: leg het voor aan je apotheker.",
        "Je eet gevarieerd, hebt geen klachten en gebruikt geen medicatie — dan is de kans op een tekort klein en is er geen bewijs dat extra magnesium iets toevoegt. Dit is de grootste groep die het toch koopt.",
        "Je zoekt een energieboost — magnesium draagt bij tot vermindering van vermoeidheid en moeheid, maar dat geldt bij het aanvullen van een tekort. Bij een normale status is er niets om op te heffen — zie [magnesiumtekort herkennen](/blog/magnesium-tekort-herkennen).",
        "Je wilt er kramp mee oplossen zonder aangetoond tekort — dit is de slechtst onderbouwde toepassing van allemaal; de Cochrane-conclusie staat in [magnesium en spierkrampen](/blog/magnesium-en-spierkrampen).",
        "Je bent zwanger of geeft borstvoeding — niet omdat magnesium schadelijk is, maar omdat doseringen en indicaties hier eigen kaders hebben. Dat gesprek voer je met verloskundige of arts.",
      ],
      callouts: [
        {
          variant: "letop",
          tekst:
            "“Baat het niet, dan schaadt het niet” is bij een verminderde nierfunctie geen geldige redenering. Dat is de enige categorie in dit artikel waar de vraag echt medisch is.",
        },
      ],
    },
    {
      type: "tekst",
      titel: "Mannen en vrouwen: waar het verschil zit en waar niet",
      bewijsNiveau: "redelijk",
      tekst:
        "Het fysiologische verschil is kleiner dan de marketing suggereert. De aanbevolen hoeveelheid ligt bij vrouwen wat lager dan bij mannen — ruwweg 300 tegen 350 mg per dag — simpelweg omdat die norm meeschaalt met lichaamsgewicht. Er is geen aparte magnesiumbehoefte die uit geslacht zelf voortkomt.\n\nWat wel verschilt, is de context. Bij vrouwen na de menopauze wordt botbehoud een zwaarder wegend thema, en magnesium draagt bij aan de instandhouding van normale botten — een claim die overigens ook bij mannen geldt. Bij mannen boven de 40 loopt de vraag vaker via training, herstel en slaap. Dat zijn verschillen in wat er speelt, niet in hoe het mineraal werkt.\n\nDaarom vind je bij ons geen aparte “magnesium voor mannen” en “magnesium voor vrouwen” met andere aanbevelingen. Wat er wél toe doet is de rest van je situatie: medicatie, voedingspatroon, alcohol, darm en nier. Die staan hierboven, en die verschillen per persoon veel sterker dan per geslacht.",
      bewijsKanttekening:
        "Sekseverschillen in magnesiumbehoefte zijn grotendeels afgeleid van verschillen in lichaamsgewicht en vetvrije massa; er is geen aangetoonde afwijkende fysiologie die een apart doseringsadvies rechtvaardigt.",
    },
    {
      type: "tekst",
      titel: "Als je in geen enkel profiel past",
      tekst:
        "Dat is een veelvoorkomende uitkomst en het is geen slecht nieuws. Het betekent dat magnesium waarschijnlijk niet de knop is die bij jou het meeste doet — en dat het zinvoller is om te bepalen welke knop dat wél is dan om er alsnog een potje bij te kopen.\n\nDat is precies wat de [Leefstijlcheck](/intake) doet: hij loopt slaap, stress, beweging en voeding langs en laat zien welk domein bij jou het zwaarst weegt, zodat je aan de goede kant van de rij begint. En wil je zelf de stoffen naast elkaar zien met hun onderbouwing, dosering en vorm, dan staat dat compleet in de [supplementengids](/supplementen) — inclusief de stoffen waar wij niet enthousiast over zijn.",
    },
  ],
  kernpunten: [
    "Magnesium heft een tekort op; bij een toereikende status voegt het niets toe.",
    "Sterke onderbouwing bij maagzuurremmers, plaspillen, ontregelde diabetes, fors alcoholgebruik en darmaandoeningen.",
    "Redelijk bij een arme inname, intensief sporten, onrustige slaap, langdurige spanning en rond de overgang.",
    "Niet zonder arts bij verminderde nierfunctie; geen aangetoond nut bij een gevarieerd etende, klachtenvrije gebruiker.",
    "Het man/vrouw-verschil in behoefte volgt uit lichaamsgewicht, niet uit afwijkende fysiologie.",
  ],
  samenvatting:
    "Of magnesium zinvol is, hangt niet af van de stof maar van de persoon: het heft een tekort op en voegt niets toe aan een status die al toereikend is. De onderbouwing is sterk bij langdurig gebruik van maagzuurremmers of plaspillen, bij ontregelde diabetes, fors alcoholgebruik en darmaandoeningen. Ze is redelijk bij een arme inname, intensief sporten, onrustige slaap en langdurige spanning. Bij een verminderde nierfunctie hoort het gesprek eerst bij de arts, en bij een gevarieerd etende gebruiker zonder klachten is er geen aangetoond nut.",
  supplementCTA: {
    naam: "Magnesium",
    uitleg:
      "Past jouw situatie in een van de eerste twee groepen: vergelijk op elementair magnesium per dagdosering, op vorm en pas daarna op prijs.",
    href: "/beste/magnesium",
  },
  cornerstoneLink: {
    label: "Hoofdstuk-gids: energie na 40",
    href: "/energie-na-40",
  },
  vergelijkingExtraLink: {
    label: "Alle supplementen in de supplementengids",
    href: "/supplementen",
  },
  gerelateerdeSluggen: [
    "magnesium-tekort-herkennen",
    "magnesium-in-combinatie-met-medicijnen",
    "magnesium-en-spierkrampen",
  ],
  metaTitle: "Voor wie is magnesium zinvol — en voor wie niet? 8 profielen",
  metaDescription:
    "Magnesium: wanneer wel en wanneer niet. Acht profielen met per profiel hoe sterk het bewijs is — van maagzuurremmers en plaspillen tot nierfunctie en gewoon gezond eten.",
  keywords: [
    "is magnesium zinvol",
    "magnesium wanneer wel niet",
    "wie heeft magnesium nodig",
    "magnesium nierfunctie",
    "magnesium niet gebruiken",
    "magnesium mannen vrouwen verschil",
  ],
  referenties: toRefs([
    "Cheungpasitporn W, Thongprayoon C, Kittanamongkolchai W, et al. Proton pump inhibitors linked to hypomagnesemia: a systematic review and meta-analysis of observational studies. Ren Fail. 2015;37(7):1237-1241.",
    "Gröber U, Schmidt J, Kisters K. Magnesium in prevention and therapy. Nutrients. 2015;7(9):8199-8226.",
    "Garrison SR, Korownyk CS, Kolber MR, et al. Magnesium for skeletal muscle cramps. Cochrane Database Syst Rev. 2020;9:CD009402.",
    "Boyle NB, Lawton C, Dye L. The effects of magnesium supplementation on subjective anxiety and stress: a systematic review. Nutrients. 2017;9(5):429.",
    "Cascella M, Vaqar S. Hypermagnesemia. StatPearls. Treasure Island (FL): StatPearls Publishing.",
    "EFSA Panel on Dietetic Products, Nutrition and Allergies. Dietary reference values for magnesium. EFSA Journal. 2015;13(7):4186.",
    "Nielsen FH, Lukaski HC. Update on the relationship between magnesium and exercise. Magnes Res. 2006;19(3):180-189.",
  ]),
};
