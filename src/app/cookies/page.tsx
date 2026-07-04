import type { Metadata } from "next";
import CookieInventoryTable from "@/components/analytics/CookieInventoryTable";
import CookiePreferencesButton from "@/components/analytics/CookiePreferencesButton";
import ContentPageLayout from "@/components/layout/ContentPageLayout";

export const metadata: Metadata = {
  title: "Cookiebeleid | PerfectSupplement",
  description:
    "Cookiebeleid van PerfectSupplement. Lees hoe wij omgaan met cookies en jouw privacy.",
  alternates: {
    canonical: "https://perfectsupplement.nl/cookies",
  },
};

export default function CookiesPage() {
  return (
    <ContentPageLayout
      eyebrow="Juridisch"
      title="Cookieverklaring"
      intro={
        <>
          Op deze pagina leggen we uit welke soorten cookies deze website kan gebruiken
          en waarom.
        </>
      }
    >
      <section>
        <h2 className="text-xl font-semibold text-stone-900">1. Wat zijn cookies?</h2>
        <p className="mt-3">
          Cookies zijn kleine tekstbestanden die via je browser op je apparaat worden geplaatst.
          Ze helpen om websites goed te laten werken, voorkeuren te onthouden en gebruik te meten.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-stone-900">
          2. Welke cookies deze website kan gebruiken
        </h2>
        <div className="mt-4">
          <CookieInventoryTable />
        </div>
        <p className="mt-4 text-sm text-stone-600">
          Op pagina&apos;s met persoonlijke gezondheidsgegevens — de leefstijlcheck, je rapport
          en je dashboard — schakelen we sessie-opnames (Microsoft Clarity) uit, ook als je
          analytische cookies hebt toegestaan.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-stone-900">3. Waarom we cookies gebruiken</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6">
          <li>om de website goed te laten werken</li>
          <li>om prestaties en gebruik te analyseren</li>
          <li>om affiliate verwijzingen correct te kunnen registreren</li>
          <li>om de website gebruiksvriendelijker te maken</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-stone-900">4. Je cookievoorkeuren beheren</h2>
        <p className="mt-3">
          Analytische cookies plaatsen we alleen met jouw toestemming. Je kunt je
          keuze op elk moment wijzigen of intrekken:
        </p>
        <div className="mt-4">
          <CookiePreferencesButton
            label="Cookievoorkeuren wijzigen"
            className="rounded-lg border border-ps-green bg-white px-4 py-2.5 text-sm font-semibold text-ps-green transition hover:bg-ps-green-light"
          />
        </div>
        <p className="mt-4">
          Daarnaast kun je cookies beheren, blokkeren of verwijderen via de
          instellingen van je browser. Houd er rekening mee dat sommige onderdelen
          van de website minder goed kunnen werken wanneer cookies zijn uitgeschakeld.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-stone-900">5. Wijzigingen</h2>
        <p className="mt-3">
          Deze cookieverklaring kan worden aangepast wanneer wetgeving, tools of de website
          veranderen.
        </p>
      </section>
    </ContentPageLayout>
  );
}
