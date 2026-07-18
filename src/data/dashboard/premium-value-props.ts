export type PremiumValuePropIcon = "trend" | "compare" | "target" | "calendar";

export type PremiumValueProp = {
  id: string;
  icon: PremiumValuePropIcon;
  title: string;
  body: string;
  comingSoon?: boolean;
};

/** Gedeelde copy: wat premium Statistieken oplevert. */
export const PREMIUM_STATISTIEKEN_VALUE_PROPS: PremiumValueProp[] = [
  {
    id: "trends-per-domein",
    icon: "trend",
    title: "Trends per domein",
    body: "Zie hoe slaap, stress, voeding, beweging en verbinding bewegen tussen je checks.",
  },
  {
    id: "vergelijk-metingen",
    icon: "compare",
    title: "Vergelijk je metingen",
    body: "Je eerste check naast je laatste hermeting — in één overzicht wat er is verschoven.",
  },
  {
    id: "sterke-zwakke-punten",
    icon: "target",
    title: "Sterke en zwakke punten",
    body: "Direct zichtbaar welk domein vooruitgaat en welk domein aandacht vraagt.",
  },
  {
    id: "activiteiten-logboek",
    icon: "calendar",
    title: "Activiteiten logboek",
    body: "Zie welke leefstijl-stappen in je check en hermeting ontbraken.",
    comingSoon: true,
  },
];

export const PREMIUM_HUB_VALUE_PROP_IDS = ["trends-per-domein", "vergelijk-metingen"] as const;

export const PREMIUM_SOFT_UPSELL_PROP_IDS = [
  "vergelijk-metingen",
  "sterke-zwakke-punten",
] as const;

export const PREMIUM_STATISTIEKEN_SOFT_UPSELL = {
  heading: "Eén meting is een foto. Meerdere is een film.",
  body: "Jouw lijn laat al zien waar je nu staat. Premium vergelijkt je metingen automatisch en laat zien waar je vooruitgang boekt.",
  cta: "Zet me op de wachtlijst voor Premium",
} as const;

export function getPremiumValuePropsByIds(
  ids: readonly string[],
): PremiumValueProp[] {
  return ids
    .map((id) => PREMIUM_STATISTIEKEN_VALUE_PROPS.find((item) => item.id === id))
    .filter((item): item is PremiumValueProp => item != null);
}
