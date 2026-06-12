import type { Metadata } from "next";
import SleepCheckin from "@/components/intake/SleepCheckin";

export const metadata: Metadata = {
  title: "Slaap-check — PerfectSupplement",
  description:
    "Een paar korte vragen over hoe je nu slaapt. Je ziet direct waar de meeste winst zit en kiest zelf je eerste stap — geen schema, geen verplichting.",
};

export default function SlaapPage() {
  return <SleepCheckin />;
}
