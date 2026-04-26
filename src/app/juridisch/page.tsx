import type { Metadata } from "next";
import ContentPageLayout from "@/components/layout/ContentPageLayout";

export const metadata: Metadata = {
  title: "Juridische Informatie | PerfectSupplement",
  description:
    "Juridische informatie van PerfectSupplement. Lees hoe wij omgaan met disclaimer, privacy en affiliate links.",
  alternates: {
    canonical: "https://perfectsupplement.nl/juridisch",
  },
};

export default function JuridischPage() {
    return (
        <ContentPageLayout
            eyebrow="Juridisch"
            title="Juridische informatie"
            intro={
                <>
                    Op deze pagina vind je de algemene disclaimer, medische disclaimer en
                    affiliate disclosure van deze website.
                </>
            }
        >
            <section>
                    <h2 className="text-2xl font-semibold text-stone-900">
                        Algemene disclaimer
                    </h2>

                <div className="mt-5 space-y-4">
                        <p>
                            De informatie op deze website is uitsluitend bedoeld voor algemene
                            informatieve en educatieve doeleinden. Hoewel we streven naar zorgvuldige,
                            duidelijke en zo actueel mogelijke informatie, kunnen we niet garanderen
                            dat alle informatie volledig, foutloos of altijd actueel is.
                        </p>
                        <p>
                            Beslissingen die worden genomen op basis van informatie op deze website
                            zijn volledig voor eigen risico.
                        </p>
                        <p>
                            Vergelijkingen, samenvattingen en beoordelingen zijn gebaseerd op eigen
                            criteria, beschikbare productinformatie, openbare bronnen en een interne
                            methodologie. Producten, verpakkingen, ingrediënten, prijzen en
                            beschikbaarheid kunnen in de tijd veranderen.
                        </p>
                        <p>
                            Controleer daarom altijd zelf de meest recente informatie op de website
                            van de aanbieder of fabrikant voordat je een aankoopbeslissing neemt.
                        </p>
                        <p>
                            Deze website kan links bevatten naar externe websites. Wij hebben geen
                            controle over de inhoud, beschikbaarheid, prijsinformatie of het
                            privacybeleid van deze externe websites en zijn daarvoor niet verantwoordelijk.
                        </p>
                        <p>
                            Voor zover wettelijk toegestaan aanvaarden wij geen aansprakelijkheid
                            voor directe of indirecte schade die voortvloeit uit het gebruik van
                            deze website of uit het vertrouwen op informatie die hier is gepubliceerd.
                        </p>
                    </div>
                </section>

                <section className="border-t border-stone-200 pt-12">
                    <h2 className="text-2xl font-semibold text-stone-900">
                        Medische disclaimer
                    </h2>

                    <div className="mt-5 space-y-4 leading-7">
                        <p>
                            De inhoud van deze website is geen medisch advies en mag niet worden
                            gezien als vervanging van professioneel medisch advies, diagnose of
                            behandeling.
                        </p>
                        <p>
                            Raadpleeg altijd een arts, apotheker of andere gekwalificeerde
                            zorgverlener bij vragen over je gezondheid, medicatie, medische
                            aandoeningen of het gebruik van voedingssupplementen.
                        </p>
                        <p>
                            De werking, veiligheid en geschiktheid van supplementen kunnen per
                            persoon verschillen. Factoren zoals leeftijd, medicatiegebruik,
                            zwangerschap, aandoeningen en leefstijl kunnen invloed hebben op de
                            juiste keuze.
                        </p>
                        <p>
                            Informatie over ingrediënten, doseringen, veiligheid, bijwerkingen of
                            toepassingen is bedoeld als algemene context en niet als persoonlijke
                            aanbeveling.
                        </p>
                        <p>
                            Gebruik supplementen met voorzichtigheid en volg altijd de aanwijzingen
                            van de fabrikant of van een zorgprofessional.
                        </p>
                        <p>
                            Het gebruik van informatie van deze website en het gebruik van
                            supplementen gebeurt volledig op eigen verantwoordelijkheid.
                        </p>
                    </div>
                </section>

                <section className="border-t border-stone-200 pt-12">
                    <h2 className="text-2xl font-semibold text-stone-900">
                        Affiliate disclosure
                    </h2>

                    <div className="mt-5 space-y-4 leading-7">
                        <p>
                            Sommige links op deze website zijn affiliate links. Dat betekent dat
                            wij een commissie kunnen ontvangen wanneer je via zo&apos;n link een
                            aankoop doet bij een partner of webshop.
                        </p>
                        <p>
                            Voor jou verandert er niets aan de prijs. Een eventuele vergoeding
                            wordt betaald door de verkoper of het affiliate netwerk.
                        </p>
                        <p>
                            Affiliate inkomsten helpen om de website te onderhouden, onderzoek te
                            doen, content te schrijven en vergelijkingen actueel te houden.
                        </p>
                        <p>
                            Partners horen geen directe invloed te hebben op onze methodologie,
                            uitleg, vergelijkingen of de manier waarop informatie wordt gepresenteerd.
                        </p>
                    </div>
                </section>

                <section className="border-t border-stone-200 pt-12">
                    <h2 className="text-2xl font-semibold text-stone-900">Wijzigingen</h2>

                    <div className="mt-5 space-y-4 leading-7">
                        <p>
                            De inhoud van deze website en deze juridische informatie kunnen op elk
                            moment worden aangepast zonder voorafgaande aankondiging.
                        </p>
                    </div>
                </section>
            </ContentPageLayout>
    );
}