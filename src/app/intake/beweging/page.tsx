import type { Metadata } from "next";
import MovementCapture from "@/components/intake/MovementCapture";

export const metadata: Metadata = {
  title: "Beweeg-check — PerfectSupplement",
  description:
    "Twee korte vragen over wat je nu aan beweging doet. Je ziet direct waar winst zit en kiest zelf je eerste stap — geen schema, geen verplichting.",
};

export default function BewegingPage() {
  return <MovementCapture />;
}
