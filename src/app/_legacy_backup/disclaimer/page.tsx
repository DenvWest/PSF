import ContentPageLayout from "@/components/layout/ContentPageLayout";

export default function DisclaimerPage() {
    return (
        <ContentPageLayout
            eyebrow="Juridisch"
            title="Disclaimer"
            intro={
                <>
                    Op deze pagina vind je de algemene disclaimer, affiliate disclosure en medische
                    disclaimer van deze website.
                </>
            }
        >
            <section>
                <h2 className="text-xl font-semibold text-slate-900">1. Algemene informatie</h2>
                <p className="mt-3">
                        De informatie op deze website is uitsluitend bedoeld voor algemene informatieve
                        en educatieve doeleinden. Hoewel we streven naar zorgvuldige, duidelijke en zo
                        actueel mogelijke informatie, kunnen we niet garanderen dat alle informatie
                        volledig, foutloos of altijd actueel is.
                    </p>
                <p className="mt-3">
                        Beslissingen die worden genomen op basis van informatie op deze website zijn
                        volledig voor eigen risico.
                    </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-slate-900">2. Geen medisch advies</h2>
                <p className="mt-3">
                        De inhoud van deze website is geen medisch advies en mag niet worden gezien als
                        vervanging van professioneel medisch advies, diagnose of behandeling.
                    </p>
                <p className="mt-3">
                        Raadpleeg altijd een arts, apotheker of andere gekwalificeerde zorgverlener bij
                        vragen over je gezondheid, medicatie, medische aandoeningen of het gebruik van
                        voedingssupplementen.
                    </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-slate-900">3. Supplementen en gezondheid</h2>
                <p className="mt-3">
                        Reacties op supplementen kunnen per persoon verschillen. Informatie over ingrediënten,
                        doseringen, veiligheid, bijwerkingen of toepassingen is bedoeld als algemene context en
                        niet als persoonlijke aanbeveling.
                    </p>
                <p className="mt-3">
                        Gebruik supplementen met voorzichtigheid en volg altijd de aanwijzingen van de fabrikant
                        of van een zorgprofessional.
                    </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-slate-900">4. Affiliate disclosure</h2>
                <p className="mt-3">
                        Sommige links op deze website zijn affiliate links. Dat betekent dat wij een commissie
                        kunnen ontvangen wanneer je via zo&apos;n link een aankoop doet.
                    </p>
                <p className="mt-3">
                        Voor jou verandert er niets aan de prijs. De commissie wordt betaald door de verkoper
                        of het affiliate netwerk.
                    </p>
                <p className="mt-3">
                        Affiliate vergoedingen helpen om de website te onderhouden, onderzoek te doen en content
                        te publiceren. Partners hebben geen directe invloed op de inhoud, methodologie of plaatsing
                        van informatie op deze website.
                    </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-slate-900">5. Vergelijkingen en beoordelingen</h2>
                <p className="mt-3">
                        Vergelijkingen, samenvattingen en beoordelingen zijn gebaseerd op eigen criteria,
                        beschikbare productinformatie, openbare bronnen en een interne methodologie. Deze
                        informatie kan veranderen wanneer producten, verpakkingen, ingrediënten of beschikbaarheid
                        wijzigen.
                    </p>
                <p className="mt-3">
                        Controleer daarom altijd zelf de meest recente informatie op de website van de aanbieder
                        of fabrikant voordat je een aankoopbeslissing neemt.
                    </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-slate-900">6. Externe websites</h2>
                <p className="mt-3">
                        Deze website bevat links naar externe websites. Wij hebben geen controle over de inhoud,
                        beschikbaarheid, prijsinformatie, productwijzigingen of het privacybeleid van deze externe
                        websites en zijn daarvoor niet verantwoordelijk.
                    </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-slate-900">7. Aansprakelijkheid</h2>
                <p className="mt-3">
                        Voor zover wettelijk toegestaan aanvaarden wij geen aansprakelijkheid voor directe of
                        indirecte schade die voortvloeit uit het gebruik van deze website of het vertrouwen op
                        informatie die op deze website is gepubliceerd.
                    </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-slate-900">8. Wijzigingen</h2>
                <p className="mt-3">
                        De inhoud van deze website en deze disclaimer kunnen op elk moment worden aangepast zonder
                        voorafgaande aankondiging.
                    </p>
            </section>
        </ContentPageLayout>
    );
}