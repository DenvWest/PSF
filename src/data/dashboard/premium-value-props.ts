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
