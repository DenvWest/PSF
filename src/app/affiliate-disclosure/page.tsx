import type { Metadata } from "next";
import ContentPageLayout from "@/components/layout/ContentPageLayout";

export const metadata: Metadata = {
  title: "Affiliate Disclosure | PerfectSupplement",
  description:
    "Affiliate disclosure van PerfectSupplement. Lees hoe wij omgaan met affiliate links en vergoedingen.",
  alternates: {
    canonical: "https://perfectsupplement.nl/affiliate-disclosure",
  },
};

export default function AffiliateDisclosurePage() {
    return (
        <ContentPageLayout
            eyebrow="Juridisch"
            title="Affiliate disclosure"
            intro={
                <>
                    Deze pagina legt uit hoe affiliate links op deze website werken.
                </>
            }
        >
            <section>
                <h2 className="text-xl font-semibold text-stone-900">1. Wat zijn affiliate links?</h2>
                <p className="mt-3">
                        Sommige links op deze website zijn affiliate links. Dat betekent dat wij een commissie
                        kunnen ontvangen wanneer je via zo&apos;n link een aankoop doet bij een partner of webshop.
                    </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-stone-900">2. Heeft dit invloed op de prijs?</h2>
                <p className="mt-3">
                        Nee. Voor jou als bezoeker verandert de prijs meestal niet. Een eventuele vergoeding wordt
                        betaald door de verkoper of het affiliate netwerk.
                    </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-stone-900">3. Waarom we affiliate links gebruiken</h2>
                <p className="mt-3">
                        Affiliate inkomsten helpen om de website te onderhouden, onderzoek te doen, content te
                        schrijven en vergelijkingen up-to-date te houden.
                    </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-stone-900">4. Invloed op beoordelingen</h2>
                <p className="mt-3">
                        We streven naar transparante en inhoudelijke vergelijkingen. Affiliate partners horen geen
                        directe invloed te hebben op onze methodologie, uitleg of de manier waarop informatie wordt
                        gepresenteerd.
                    </p>
            </section>
        </ContentPageLayout>
    );
}