import ContentPageLayout from "@/components/layout/ContentPageLayout";

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

                <div className="mt-4 space-y-5">
                    <div>
                        <h3 className="font-semibold text-stone-900">Functionele cookies</h3>
                        <p className="mt-1">
                            Deze cookies zijn nodig om de website technisch goed te laten functioneren.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-stone-900">Analytische cookies</h3>
                        <p className="mt-1">
                            Deze cookies helpen ons begrijpen hoe bezoekers de website gebruiken, zodat we
                            navigatie, content en prestaties kunnen verbeteren.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-stone-900">Affiliate cookies</h3>
                        <p className="mt-1">
                            Wanneer je op een affiliate link klikt, kan een partner of affiliate netwerk een
                            cookie plaatsen om te registreren dat een aankoop via deze website is gedaan.
                        </p>
                    </div>
                </div>
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
                <h2 className="text-xl font-semibold text-stone-900">4. Cookies beheren</h2>
                <p className="mt-3">
                    Je kunt cookies beheren, blokkeren of verwijderen via de instellingen van je browser.
                    Houd er rekening mee dat sommige onderdelen van de website minder goed kunnen werken
                    wanneer cookies zijn uitgeschakeld.
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