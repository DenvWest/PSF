export type ClaimAuthority = "EFSA" | "EU Register" | "N/A";

export type EvidenceLevel =
    | "toegestane gezondheidsclaim"
    | "regulatoire context"
    | "algemene productcontext";

export type ClaimEntry = {
    ingredient: string;
    slug: string;
    claim: string;
    authority: ClaimAuthority;
    source: string;
    evidence: string;
    evidenceLevel: EvidenceLevel;
    condition?: string;
    minimumEffectiveDose?: string;
    targetAudience?: string[];
    notes?: string;
    caution?: string;
};

export const claims: ClaimEntry[] = [
    {
        ingredient: "Omega-3",
        slug: "omega-3",
        claim: "EPA en DHA dragen bij aan een normale hartfunctie.",
        authority: "EFSA",
        source: "EU Register of Nutrition and Health Claims",
        evidence:
            "Het gunstige effect wordt verkregen bij een dagelijkse inname van 250 mg EPA en DHA.",
        evidenceLevel: "toegestane gezondheidsclaim",
        condition: "Gebruik alleen wanneer de dagdosering minimaal 250 mg EPA + DHA levert.",
        minimumEffectiveDose: "250 mg EPA + DHA per dag",
        targetAudience: ["algemene gezondheid", "hartgezondheid", "dagelijks gebruik"],
        notes:
            "Voor vergelijking is vooral relevant hoeveel EPA en DHA een product per aanbevolen dagdosering levert, niet alleen hoeveel visolie in milligram op het etiket staat.",
        caution:
            "Formuleer dit niet als behandeling of preventie van hart- en vaatziekten. Het blijft een toegestane algemene gezondheidsclaim.",
    },
    {
        ingredient: "Omega-3",
        slug: "omega-3",
        claim: "DHA draagt bij aan de instandhouding van een normale hersenfunctie.",
        authority: "EFSA",
        source: "EU Register of Nutrition and Health Claims",
        evidence:
            "Het gunstige effect wordt verkregen bij een dagelijkse inname van 250 mg DHA.",
        evidenceLevel: "toegestane gezondheidsclaim",
        condition: "Gebruik alleen wanneer de dagdosering minimaal 250 mg DHA levert.",
        minimumEffectiveDose: "250 mg DHA per dag",
        targetAudience: ["cognitieve ondersteuning", "algemene gezondheid", "dagelijks gebruik"],
        notes:
            "Deze claim is vooral relevant bij producten die daadwerkelijk een betekenisvolle hoeveelheid DHA bevatten. Een omega 3 supplement met vooral EPA draagt deze claim niet automatisch.",
        caution:
            "Niet breder formuleren dan toegestaan en niet presenteren als oplossing voor concentratieproblemen of neurologische klachten.",
    },
    {
        ingredient: "Omega-3",
        slug: "omega-3",
        claim: "DHA draagt bij aan de instandhouding van een normaal gezichtsvermogen.",
        authority: "EFSA",
        source: "EU Register of Nutrition and Health Claims",
        evidence:
            "Het gunstige effect wordt verkregen bij een dagelijkse inname van 250 mg DHA.",
        evidenceLevel: "toegestane gezondheidsclaim",
        condition: "Gebruik alleen wanneer de dagdosering minimaal 250 mg DHA levert.",
        minimumEffectiveDose: "250 mg DHA per dag",
        targetAudience: ["algemene gezondheid", "visuele functie", "dagelijks gebruik"],
        notes:
            "Ook hier is de verhouding tussen EPA en DHA relevant. Een product kan veel totale visolie bevatten, maar toch te weinig DHA leveren voor deze claim.",
        caution:
            "Gebruik dit als informatieve productcontext en niet als impliciete medische claim rond oogproblemen of visuele aandoeningen.",
    },
];

export function getClaimsBySlug(slug: string) {
    return claims.filter((entry) => entry.slug === slug);
}