export type HowItWorksQuestion = {
  id: "nodig" | "voeding" | "supplement";
  question: string;
  answer: string;
  where: string;
};

export const HOW_IT_WORKS_QUESTIONS: readonly HowItWorksQuestion[] = [
  {
    id: "nodig",
    question: "Heb je wel een supplement nodig?",
    answer:
      "Eerst kijken we naar wat je eet. Haal je met je voeding de norm voor een stof, dan voegt een supplement daar weinig toe.",
    where: "De check · Patroon",
  },
  {
    id: "voeding",
    question: "Welke voeding brengt je naar je norm?",
    answer:
      "Per stof zie je de rijkste bronnen en wat je al binnenkrijgt, tegen jouw persoonlijke norm (Gezondheidsraad, EFSA).",
    where: "Dagboek · Patroon · Doelen",
  },
  {
    id: "supplement",
    question: "Welk supplement is goed beoordeeld én past bij wat je eet?",
    answer:
      "Blijft er een gat, dan zet je voeding naast supplement — met de PS-Score: een beoordeling van het product, niet van jou.",
    where: "Keuze",
  },
];

export const HOW_IT_WORKS_INTRO = "Drie vragen, in deze volgorde:";

export const HOW_IT_WORKS_DISCLAIMER =
  "Adviezen, geen diagnoses: we kijken naar wat je eet, niet naar je bloed. Of je echt een tekort hebt, stelt alleen een arts vast. Je gegevens zijn van jou — exporteer of verwijder ze wanneer je wilt.";
