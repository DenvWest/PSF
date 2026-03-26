import ContentPageLayout from "@/components/layout/ContentPageLayout";

export default function PrivacyPage() {
    return (
        <ContentPageLayout
            eyebrow="Juridisch"
            title="Privacyverklaring"
            intro={
                <>
                    Op deze pagina leggen we uit welke gegevens deze website verwerkt, waarom
                    dit gebeurt en hoe zorgvuldig met die gegevens wordt omgegaan.
                </>
            }
        >
            <section>
                <h2 className="text-xl font-semibold text-slate-900">1. Over deze website</h2>
                <p className="mt-3">
                        Perfect Supplement is een informatieve website over voedingssupplementen,
                        vergelijkingen en methodologie. Sommige links op deze website zijn affiliate
                        links. Dat betekent dat wij een commissie kunnen ontvangen wanneer je via
                        zo&apos;n link een aankoop doet. Dit heeft geen invloed op de prijs die jij betaalt.
                    </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-slate-900">
                    2. Welke gegevens we verzamelen
                </h2>
                <p className="mt-3">
                        We verzamelen alleen gegevens die nodig zijn om de website goed te laten
                        functioneren, te beveiligen en te verbeteren.
                    </p>

                <ul className="mt-4 list-disc space-y-2 pl-6">
                        <li>IP-adres, waar mogelijk geanonimiseerd</li>
                        <li>browsertype en apparaatgegevens</li>
                        <li>bezochte pagina&apos;s en klikgedrag</li>
                        <li>datum en tijd van het bezoek</li>
                        <li>technische foutmeldingen en beveiligingsinformatie</li>
                    </ul>

                <p className="mt-4">
                        We verzamelen via deze website geen accounts en vragen niet om gevoelige
                        medische gegevens.
                    </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-slate-900">3. Waarom we gegevens verwerken</h2>
                <p className="mt-3">
                        Gegevens worden uitsluitend verwerkt voor de volgende doelen:
                    </p>

                <ul className="mt-4 list-disc space-y-2 pl-6">
                        <li>het technisch laten werken van de website</li>
                        <li>het verbeteren van content, gebruikservaring en prestaties</li>
                        <li>het analyseren van algemeen websitegebruik</li>
                        <li>het beveiligen van de website tegen misbruik</li>
                        <li>het correct registreren van affiliate verwijzingen</li>
                    </ul>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-slate-900">4. Cookies en analytics</h2>
                <p className="mt-3">
                        Deze website kan functionele cookies, analytische cookies en affiliate cookies
                        gebruiken.
                    </p>

                <div className="mt-4 space-y-4">
                    <div>
                        <h3 className="font-semibold text-slate-900">Functionele cookies</h3>
                        <p className="mt-1">
                                Deze zijn nodig om de website correct te laten werken.
                            </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-900">Analytische cookies</h3>
                        <p className="mt-1">
                                Hiermee krijgen we inzicht in het gebruik van de website, zodat we inhoud,
                                navigatie en prestaties kunnen verbeteren. Waar mogelijk worden deze gegevens
                                privacyvriendelijk ingesteld.
                            </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-900">Affiliate cookies</h3>
                        <p className="mt-1">
                                Wanneer je op een affiliate link klikt, kan een partner of netwerk een cookie
                                plaatsen om te registreren dat een aankoop via deze website tot stand is gekomen.
                            </p>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-slate-900">5. Externe partijen</h2>
                <p className="mt-3">
                        Voor analytics, hosting of affiliate tracking kunnen externe partijen worden gebruikt.
                        Deze partijen verwerken gegevens uitsluitend voor hun eigen technische rol of op basis
                        van hun eigen privacyvoorwaarden.
                    </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-slate-900">6. Bewaartermijn</h2>
                <p className="mt-3">
                        Gegevens worden niet langer bewaard dan nodig is voor de doelen waarvoor ze zijn
                        verzameld, tenzij een langere bewaartermijn wettelijk vereist is.
                    </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-slate-900">7. Beveiliging</h2>
                <p className="mt-3">
                        We nemen redelijke technische en organisatorische maatregelen om gegevens te beschermen,
                        zoals HTTPS, software-updates, toegangsbeveiliging, back-ups en basisbeveiliging tegen
                        misbruik of ongeautoriseerde toegang.
                    </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-slate-900">8. Jouw rechten</h2>
                <p className="mt-3">
                        Afhankelijk van de situatie kun je verzoeken om inzage, correctie of verwijdering van
                        persoonsgegevens. Ook kun je bezwaar maken tegen bepaalde verwerkingen wanneer dat van
                        toepassing is.
                    </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-slate-900">9. Externe websites</h2>
                <p className="mt-3">
                        Deze website kan links bevatten naar externe websites. Wij zijn niet verantwoordelijk
                        voor de inhoud of het privacybeleid van die websites.
                    </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-slate-900">10. Wijzigingen</h2>
                <p className="mt-3">
                        Deze privacyverklaring kan worden aangepast wanneer wetgeving, tools of de website
                        veranderen. De meest recente versie staat altijd op deze pagina.
                    </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-slate-900">11. Contact</h2>
                <p className="mt-3">
                        Vragen over privacy of gegevensverwerking kun je stellen via de contactpagina of via
                        het e-mailadres dat je op de website vermeldt.
                    </p>
            </section>
        </ContentPageLayout>
    );
}