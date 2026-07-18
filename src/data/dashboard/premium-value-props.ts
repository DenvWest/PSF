export type PremiumValueProp = {
  id: string;
  title: string;
  body: string;
  comingSoon?: boolean;
};

/** Gedeelde copy: wat premium Statistieken oplevert (micro/meso + begeleiding). */
export const PREMIUM_STATISTIEKEN_VALUE_PROPS: PremiumValueProp[] = [
  {
    id: "activiteiten-logboek",
    title: "Activiteiten logboek",
    body: "Zie welke leefstijl-stappen in je check en hermeting ontbraken — bewustwording, geen dagelijks bijhouden.",
    comingSoon: true,
  },
  {
    id: "prioriteit-over-tijd",
    title: "Prioriteit over tijd",
    body: "Hoe je vertrekpunt verschuift over metingen — meso-inzicht naast je scores.",
  },
  {
    id: "begeleiding",
    title: "Wekelijkse begeleiding",
    body: "Iemand kijkt onafhankelijk met je mee op je cijfers — zonder merkverkoop.",
  },
];

export const PREMIUM_HUB_VALUE_PROP_IDS = ["begeleiding", "prioriteit-over-tijd"] as const;

export const PREMIUM_SOFT_UPSELL_PROP_IDS = ["prioriteit-over-tijd", "begeleiding"] as const;

export const PREMIUM_STATISTIEKEN_SOFT_UPSELL = {
  heading: "Trends over weken?",
  body: "Jouw lijn laat al zien waar je staat. Met Plus zie je ook hoe je prioriteit verschuift — en krijg je wekelijks terugkoppeling.",
  cta: "Op de wachtlijst voor begeleiding",
} as const;

export function getPremiumValuePropsByIds(
  ids: readonly string[],
): PremiumValueProp[] {
  return ids
    .map((id) => PREMIUM_STATISTIEKEN_VALUE_PROPS.find((item) => item.id === id))
    .filter((item): item is PremiumValueProp => item != null);
}
