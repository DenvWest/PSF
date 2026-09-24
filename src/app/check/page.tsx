import type { Metadata } from "next";
import CheckChooser from "@/components/intake/CheckChooser";
import { canonicalMetadata } from "@/lib/seo/canonical";
import { basicOpenGraph } from "@/lib/seo/open-graph";

const TITLE = "Kies je check — Voedingcheck of Leefstijlcheck";
const DESCRIPTION =
  "Voedingcheck voor een snel antwoord over je voeding, of Leefstijlcheck voor het volledige beeld van slaap, stress, beweging en voeding samen. Allebei gratis en anoniem.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  ...canonicalMetadata("/check"),
  ...basicOpenGraph({ path: "/check", title: TITLE, description: DESCRIPTION }),
};

export default function CheckPage() {
  return <CheckChooser />;
}
