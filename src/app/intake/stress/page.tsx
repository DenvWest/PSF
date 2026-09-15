import type { Metadata } from "next";
import StressCheckin from "@/components/intake/StressCheckin";
import { canonicalMetadata } from "@/lib/seo/canonical";
import { basicOpenGraph } from "@/lib/seo/open-graph";

const TITLE = "Stress-check — PerfectSupplement";
const DESCRIPTION =
  "Drie korte vragen over hoe je stress nu is. Je ziet direct waar rust te winnen is en kiest zelf je eerste stap — geen schema, geen verplichting.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  ...canonicalMetadata("/intake/stress"),
  ...basicOpenGraph({ path: "/intake/stress", title: TITLE, description: DESCRIPTION }),
};

export default function StressPage() {
  return <StressCheckin />;
}
