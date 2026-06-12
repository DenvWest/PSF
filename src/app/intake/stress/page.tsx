import type { Metadata } from "next";
import StressCheckin from "@/components/intake/StressCheckin";

export const metadata: Metadata = {
  title: "Stress-check — PerfectSupplement",
  description:
    "Drie korte vragen over hoe je stress nu is. Je ziet direct waar rust te winnen is en kiest zelf je eerste stap — geen schema, geen verplichting.",
};

export default function StressPage() {
  return <StressCheckin />;
}
