import type { Metadata } from "next";
import SleepCheckin from "@/components/intake/SleepCheckin";
import { canonicalMetadata } from "@/lib/seo/canonical";
import { basicOpenGraph } from "@/lib/seo/open-graph";

const TITLE = "Slaap-check — PerfectSupplement";
const DESCRIPTION =
  "Een paar korte vragen over hoe je nu slaapt. Je ziet direct waar de meeste winst zit en kiest zelf je eerste stap — geen schema, geen verplichting.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  ...canonicalMetadata("/intake/slaap"),
  ...basicOpenGraph({ path: "/intake/slaap", title: TITLE, description: DESCRIPTION }),
};

export default function SlaapPage() {
  return <SleepCheckin />;
}
