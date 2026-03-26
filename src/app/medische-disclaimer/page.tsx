import ContentPageLayout from "@/components/layout/ContentPageLayout";

export default function MedischeDisclaimerPage() {
    return (
        <ContentPageLayout
            eyebrow="Juridisch"
            title="Medische disclaimer"
            intro={
                <>
                    De inhoud van deze website is informatief en educatief bedoeld en vervangt
                    geen professioneel medisch advies.
                </>
            }
        >
            <section>
                <h2 className="text-xl font-semibold text-stone-900">1. Geen medisch advies</h2>
                <p className="mt-3">
                        De informatie op deze website is geen medisch advies en mag niet worden gebruikt als
                        vervanging van professioneel advies, diagnose of behandeling door een arts of andere
                        gekwalificeerde zorgverlener.
                    </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-stone-900">2. Persoonlijke situatie verschilt</h2>
                <p className="mt-3">
                        De werking, veiligheid en geschiktheid van supplementen kunnen per persoon verschillen.
                        Factoren zoals leeftijd, medicatiegebruik, zwangerschap, aandoeningen en leefstijl kunnen
                        invloed hebben op de juiste keuze.
                    </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-stone-900">3. Overleg met een professional</h2>
                <p className="mt-3">
                        Raadpleeg altijd een arts, apotheker of andere gekwalificeerde zorgverlener voordat je
                        begint met het gebruik van voedingssupplementen, zeker bij bestaande klachten, medicatiegebruik,
                        zwangerschap of twijfel over veiligheid.
                    </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-stone-900">4. Eigen verantwoordelijkheid</h2>
                <p className="mt-3">
                        Het gebruik van informatie van deze website en het gebruik van supplementen gebeurt volledig
                        op eigen verantwoordelijkheid.
                    </p>
            </section>
        </ContentPageLayout>
    );
}