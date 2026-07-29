export type PremiumValuePropIcon = "trend" | "compare" | "target" | "calendar";

export type PremiumValueProp = {
  id: string;
  icon: PremiumValuePropIcon;
  title: string;
  body: string;
  comingSoon?: boolean;
};

/**
 * Gedeelde copy: wat premium begeleiding oplevert.
 * Alle vier staan bewust op comingSoon — de dienst bestaat nog niet.
 * Je scores, je lijn en ons oordeel blijven gratis; die horen hier niet in.
 */
export const PREMIUM_STATISTIEKEN_VALUE_PROPS: PremiumValueProp[] = [
  {
    id: "wekelijkse-meekijk",
    icon: "calendar",
    title: "Wekelijks iemand die meekijkt",
    body: "Niet één keer per hermeting, maar elke week even langs je lijn — en een bericht als er iets opvalt.",
    comingSoon: true,
  },
  {
    id: "hermeting-samen",
    icon: "compare",
    title: "Je hermeting samen doorlopen",
    body: "Na 30 dagen kijk je niet alleen naar het verschil, maar hoor je ook waar het vandaan komt.",
    comingSoon: true,
  },
  {
    id: "vragen-tussendoor",
    icon: "target",
    title: "Vragen tussendoor",
    body: "Loopt het vast, of twijfel je over een keuze naast je leefstijl? Je hoeft niet te wachten op je volgende check.",
    comingSoon: true,
  },
  {
    id: "bijsturen-in-je-plan",
    icon: "target",
    title: "Bijsturen in je plan",
    body: "Je plan verandert mee met wat er werkt — niet pas als je er zelf iets van vindt.",
    comingSoon: true,
  },
];

export const PREMIUM_HUB_VALUE_PROP_IDS = ["wekelijkse-meekijk", "hermeting-samen"] as const;

export const PREMIUM_SOFT_UPSELL_PROP_IDS = [
  "hermeting-samen",
  "vragen-tussendoor",
] as const;

export function getPremiumValuePropsByIds(
  ids: readonly string[],
): PremiumValueProp[] {
  return ids
    .map((id) => PREMIUM_STATISTIEKEN_VALUE_PROPS.find((item) => item.id === id))
    .filter((item): item is PremiumValueProp => item != null);
}
