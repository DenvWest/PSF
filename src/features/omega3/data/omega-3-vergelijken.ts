import type { AffiliateSlug } from "@/data/affiliate-links";
import { omega3Products } from "@/data/products/omega3";
import type { Omega3Product } from "@/types/product";

export const comparisonCriteria = [
    "dosering",
    "transparantie",
    "gebruiksgemak",
    "prijs per dag",
    "toepasbaarheid",
];

export function formatPricePerDayEur(eur: number): string {
    return `€${eur.toFixed(2).replace(".", ",")}`;
}

export function formatEpaDhaLabel(p: Pick<Omega3Product, "epaMg" | "dhaMg">): string {
    return `${p.epaMg} + ${p.dhaMg} mg`;
}

/** Vorm column: compact label for table scan */
export function formatVormLabel(p: Omega3Product): string {
    if (p.form === "Gummies") {
        return "Gummies";
    }
    if (p.affiliateSlug === "arctic-blue-algenolie") {
        return "Vloeibaar (algen)";
    }
    return "Vloeibaar (vis)";
}

export const comparisonTableRows = omega3Products.map((p) => ({
    product: p.name,
    epaDha: formatEpaDhaLabel(p),
    vorm: formatVormLabel(p),
    pricePerDay: formatPricePerDayEur(p.pricePerDayEur),
    score: p.score.toFixed(1),
    affiliateSlug: p.affiliateSlug,
    isBest: p.affiliateSlug === "arctic-blue-visolie",
}));

export type TopThreeRole = "best" | "alternative" | "budget";

export const topThree: Array<{
    role: TopThreeRole;
    badge: string;
    rankLabel: string;
    affiliateSlug: AffiliateSlug;
    /** 3–4 short USPs for the card */
    usps: string[];
    shortDescription: string;
}> = [
    {
        role: "best",
        badge: "🏆 Beste keuze 2026",
        rankLabel: "#1 Beste keuze",
        affiliateSlug: "arctic-blue-visolie",
        usps: [
            "Hoogste totaalscore in deze vergelijking",
            "Sterke EPA/DHA-balans voor dagelijks gebruik",
            "Vloeibaar — geen grote capsules",
            "Scherpste prijs per dag in deze selectie (€0,58)",
        ],
        shortDescription:
            "De allround keuze als je één product wilt met de beste balans tussen dosering, kwaliteit en prijs per dag.",
    },
    {
        role: "alternative",
        badge: "Alternatief",
        rankLabel: "#2 Alternatief",
        affiliateSlug: "arctic-blue-algenolie",
        usps: [
            "Plantaardige omega-3 (algen)",
            "Hogere DHA per portie in deze lijn",
            "Vloeibaar en eenvoudig te doseren",
            "Goede optie zonder visolie",
        ],
        shortDescription:
            "Ideaal als je bewust kiest voor algen in plaats van visolie, met een duidelijke plantaardige positionering.",
    },
    {
        role: "budget",
        badge: "Budget",
        rankLabel: "#3 Budget",
        affiliateSlug: "arctic-blue-gummies",
        usps: [
            "Laagste instapprijs per fles in deze selectie",
            "Eenvoudige routine: geen olie of capsules",
            "Geschikt voor wie bewust een lagere EPA/DHA per portie wil",
            "Smaak en gemak voor dagelijks gebruik",
        ],
        shortDescription:
            "Praktische instap als je vooral laagdrempelig wilt beginnen met smaak en routine — niet de laagste prijs per dag (zie #1).",
    },
];

export const highlights = [
    {
        label: "Topkeuze",
        value: "Arctic Blue Visolie",
        text: "Sterke balans tussen dosering, dagelijks gebruik en algemene productfit.",
    },
    {
        label: "Beste prijs/gebruiksgemak",
        value: "Arctic Blue Gummies",
        text: "Laagdrempelige keuze voor wie vooral eenvoud en routine belangrijk vindt.",
    },
    {
        label: "Beste plantaardige optie",
        value: "Arctic Blue Algenolie",
        text: "Logische keuze als je liever een omega-3 uit algen gebruikt dan uit visolie.",
    },
];

export const products: Array<{
    name: string;
    score: string;
    summary: string;
    specs: string[];
    pros: string[];
    cons: string[];
    bestFor: string;
    breakdown: [string, string][];
    affiliateSlug: AffiliateSlug;
}> = [
    {
        name: "Arctic Blue Visolie",
        score: "8.8",
        summary:
            "Sterke allround keuze voor wie een goede mix zoekt van dosering, gebruiksgemak en een duidelijke productpositionering.",
        specs: ["Type: Visolie", "Dosering: Hoog", "Prijs per dag: €0,58"],
        pros: [
            "Sterke totaalbalans voor dagelijks gebruik",
            "Vloeibare vorm zonder grote capsules",
        ],
        cons: ["Smaak is niet voor iedereen ideaal", "Minder handig als je liever gummies kiest"],
        bestFor: "Topkeuze",
        breakdown: [
            ["Dosering", "9/10"],
            ["Transparantie", "8/10"],
            ["Gebruiksgemak", "8/10"],
            ["Prijs per dag", "8/10"],
        ],
        affiliateSlug: "arctic-blue-visolie",
    },
    {
        name: "Arctic Blue Gummies",
        score: "8.4",
        summary:
            "Praktische keuze voor bezoekers die vooral een eenvoudige, smakelijke en laagdrempelige routine willen opbouwen.",
        specs: ["Type: Gummies", "Dosering: Laag", "Prijs per dag: €0,72"],
        pros: [
            "Toegankelijk en gebruiksvriendelijk",
            "Past goed bij wie geen olie of grote capsules wil",
        ],
        cons: ["Lagere EPA/DHA per portie", "Minder geschikt als je maximale dosering zoekt"],
        bestFor: "Beste prijs/gebruiksgemak",
        breakdown: [
            ["Dosering", "6/10"],
            ["Transparantie", "8/10"],
            ["Gebruiksgemak", "9/10"],
            ["Prijs per dag", "8/10"],
        ],
        affiliateSlug: "arctic-blue-gummies",
    },
    {
        name: "Arctic Blue Algenolie",
        score: "8.2",
        summary:
            "Plantaardige omega-3 optie voor wie bewust liever geen visolie gebruikt, maar wel een vloeibare bron wil overwegen.",
        specs: ["Type: Algenolie", "Dosering: Gemiddeld", "Prijs per dag: €0,62"],
        pros: [
            "Plantaardige bron van omega-3",
            "Logische keuze bij voorkeur voor algen in plaats van visolie",
        ],
        cons: ["Vaak wat duurder dan standaard visolie", "Voor veel bezoekers niet de eerste prijskeuze"],
        bestFor: "Beste plantaardige optie",
        breakdown: [
            ["Dosering", "8/10"],
            ["Transparantie", "8/10"],
            ["Gebruiksgemak", "8/10"],
            ["Prijs per dag", "7/10"],
        ],
        affiliateSlug: "arctic-blue-algenolie",
    },
];

export const tableRows = [
    {
        product: "Arctic Blue Visolie",
        type: "Visolie",
        dosage: "Hoog",
        transparency: "Goed",
        convenience: "Goed",
        price: "€0,58",
        bestFor: "Topkeuze",
    },
    {
        product: "Arctic Blue Gummies",
        type: "Gummies",
        dosage: "Laag",
        transparency: "Goed",
        convenience: "Sterk",
        price: "€0,72",
        bestFor: "Beste prijs/gebruiksgemak",
    },
    {
        product: "Arctic Blue Algenolie",
        type: "Algenolie",
        dosage: "Gemiddeld",
        transparency: "Goed",
        convenience: "Goed",
        price: "€0,62",
        bestFor: "Beste plantaardige optie",
    },
];

export const decisionGuide: Array<{
    title: string;
    product: string;
    text: string;
    affiliateSlug: AffiliateSlug;
}> = [
    {
        title: "Beste voor dagelijks gebruik",
        product: "Arctic Blue Visolie",
        text: "De beste balans tussen EPA/DHA, vloeibare inname en prijs per dag voor een vaste routine.",
        affiliateSlug: "arctic-blue-visolie",
    },
    {
        title: "Beste hoge dosering (EPA+DHA)",
        product: "Arctic Blue Visolie",
        text: "In deze selectie het hoogste totaal aan EPA+DHA per aanbevolen portie — geschikt als je dosering prioriteit geeft.",
        affiliateSlug: "arctic-blue-visolie",
    },
    {
        title: "Beste budget (prijs per dag)",
        product: "Arctic Blue Visolie",
        text: "Met €0,58 per dag de scherpste prijs per dag in dit overzicht. Controleer altijd het actuele etiket en de aanbevolen portie.",
        affiliateSlug: "arctic-blue-visolie",
    },
];

export const choiceRoutes: Array<{
    title: string;
    product: string;
    text: string;
    affiliateSlug: AffiliateSlug;
}> = [
    {
        title: "Topkeuze",
        product: "Arctic Blue Visolie",
        text: "Kies deze route als je vooral een uitgebalanceerde combinatie zoekt van dosering, gebruiksgemak en een sterke totaalindruk.",
        affiliateSlug: "arctic-blue-visolie",
    },
    {
        title: "Beste prijs/gebruiksgemak",
        product: "Arctic Blue Gummies",
        text: "Past beter als je vooral eenvoudig wilt beginnen en dagelijkse inname laagdrempelig wilt houden.",
        affiliateSlug: "arctic-blue-gummies",
    },
    {
        title: "Beste plantaardige optie",
        product: "Arctic Blue Algenolie",
        text: "Geschikt voor wie liever een plantaardige bron kiest en algenolie boven visolie verkiest.",
        affiliateSlug: "arctic-blue-algenolie",
    },
];

export const omega3WatchPoints = [
    {
        title: "EPA/DHA-verhouding",
        text: "Let op beide waarden per portie, niet alleen op ‘omega-3’ totaal — EPA en DHA zijn de actieve vetzuren.",
    },
    {
        title: "Vorm (triglyceride vs ethyl ester)",
        text: "Triglyceride-achtige vormen worden vaak prettiger verdragen; ethyl esters kunnen geconcentreerder zijn — vergelijk op etiket.",
    },
    {
        title: "Zuiverheid en oxidatie",
        text: "Kies transparante merken met testen op zware metalen en oxidatie (peroxide/anisidine) waar beschikbaar.",
    },
    {
        title: "Dosering",
        text: "Reken om naar mg EPA+DHA per dag en naar prijs per dag, zodat je producten eerlijk vergelijkt.",
    },
];

export const ctaTrustLines = [
    "Vandaag besteld = snel geleverd",
    "Officiële aanbieder",
    "Geen extra kosten",
] as const;

export const pageTrustSignals = [
    "Onafhankelijk beoordeeld",
    "Gebaseerd op wetenschappelijk onderzoek",
    "Geen sponsoring",
] as const;
