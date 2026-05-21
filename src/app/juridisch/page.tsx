import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Juridische Informatie | PerfectSupplement",
  description:
    "Juridische informatie van PerfectSupplement. Lees hoe wij omgaan met disclaimer, privacy en affiliate links.",
  alternates: {
    canonical: "https://perfectsupplement.nl/disclaimer",
  },
};

export default function JuridischPage() {
  permanentRedirect("/disclaimer");
}
