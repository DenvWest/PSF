import type { Metadata } from "next";
import NutritionCapture from "@/components/intake/NutritionCapture";

export const metadata: Metadata = {
  title: "Voedingscheck — PerfectSupplement",
  description:
    "Beantwoord 6 korte vragen over je voeding van gisteren en ontvang direct een persoonlijke inname-inschatting en leefstijladvies.",
};

export default function VoedingPage() {
  return <NutritionCapture />;
}
