import type { Metadata } from "next";
import ContentPageLayout from "@/components/layout/ContentPageLayout";
import PrivacyRevokeConsent from "@/components/privacy/PrivacyRevokeConsent";

export const metadata: Metadata = {
  title: "Privacyverklaring | PerfectSupplement",
  description:
    "Privacyverklaring van PerfectSupplement. Lees hoe wij omgaan met jouw persoonsgegevens.",
  alternates: {
    canonical: "https://perfectsupplement.nl/privacy",
  },
};

export default function PrivacyPage() {
    return (
        <ContentPageLayout
            eyebrow="Juridisch"
            title="Privacyverklaring"
            intro={
                <>
                    Laatst bijgewerkt: 12 april 2026. PerfectSupplement is een initiatief van Dennis
                    van Westbroek, KVK 74667653.
                </>
            }
        >
            <section>
                <h2 className="text-xl font-semibold text-stone-900">Contactgegevens</h2>
                <p className="mt-3">
                    Vragen over privacy of gegevensverwerking kun je richten aan de ondernemer
                    achter deze website:
                </p>
                <ul className="mt-4 list-disc space-y-2 pl-6">
                    <li>
                        E-mail:{" "}
                        <a
                            href="mailto:info@perfectsupplement.nl"
                            className="font-medium text-stone-800 underline-offset-4 hover:underline"
                        >
                            info@perfectsupplement.nl
                        </a>
                    </li>
                    <li>KvK-nummer: 74667653</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-stone-900">Welke gegevens verzamelen we</h2>

                <div className="mt-6 space-y-6">
                    <div>
                        <h3 className="font-semibold text-stone-900">Leefstijlcheck</h3>
                        <p className="mt-2">
                            De leefstijlcheck verwerkt je intake-antwoorden. Deze gegevens kunnen
                            gezondheidsinformatie en andere bijzondere persoonsgegevens bevatten in de
                            zin van artikel 9 AVG. We verwerken ze uitsluitend op basis van jouw expliciete
                            toestemming.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-stone-900">
                            Contactformulier en optioneel e-mailadres
                        </h3>
                        <p className="mt-2">
                            Via het contactformulier verwerken we je naam, e-mailadres en bericht. Als je
                            daarvoor kiest, kun je een e-mailadres opgeven om herinnerd te worden voor een
                            herhaalmeting; dat adres gebruiken we alleen voor die herinnering.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-stone-900">Automatisch verzamelde gegevens</h3>
                        <p className="mt-2">
                            Voor inzicht in het gebruik van de site gebruiken we Google Analytics met
                            cookies. Cloudflare Turnstile wordt ingezet ter bescherming tegen misbruik en
                            plaatst geen trackingcookies voor advertentiedoeleinden. Voor de intake wordt een
                            functioneel sessiecookie{" "}
                            <span className="font-mono text-stone-700">psf_intake_sid</span> gebruikt om je
                            voortgang technisch vast te leggen.
                        </p>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-stone-900">Waarom we gegevens verwerken</h2>
                <p className="mt-3">
                    Hieronder staat per doel welke rechtsgrond we hanteren en welke gegevens daarbij horen.
                </p>
                <div className="mt-4 overflow-x-auto rounded-3xl border border-stone-200">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-stone-50 text-stone-600">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Doel</th>
                                <th className="px-4 py-3 font-semibold">Rechtsgrond</th>
                                <th className="px-4 py-3 font-semibold">Gegevens</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-t border-stone-200">
                                <td className="px-4 py-3 align-top">
                                    Leefstijlcheck uitvoeren en resultaat tonen
                                </td>
                                <td className="px-4 py-3 align-top">
                                    Art. 9 lid 2 sub a AVG (expliciete toestemming voor bijzondere
                                    persoonsgegevens), in combinatie met art. 6 lid 1 sub a AVG waar nodig
                                </td>
                                <td className="px-4 py-3 align-top">
                                    Intake-antwoorden (waaronder mogelijke gezondheidsgegevens)
                                </td>
                            </tr>
                            <tr className="border-t border-stone-200">
                                <td className="px-4 py-3 align-top">Beantwoorden van contactverzoeken</td>
                                <td className="px-4 py-3 align-top">Art. 6 lid 1 sub f AVG (gerechtvaardigd belang)</td>
                                <td className="px-4 py-3 align-top">Naam, e-mailadres, bericht</td>
                            </tr>
                            <tr className="border-t border-stone-200">
                                <td className="px-4 py-3 align-top">Herinnering voor herhaalmeting</td>
                                <td className="px-4 py-3 align-top">Art. 6 lid 1 sub a AVG (toestemming)</td>
                                <td className="px-4 py-3 align-top">E-mailadres</td>
                            </tr>
                            <tr className="border-t border-stone-200">
                                <td className="px-4 py-3 align-top">
                                    Beveiliging, fraudepreventie en technisch beheer
                                </td>
                                <td className="px-4 py-3 align-top">Art. 6 lid 1 sub f AVG (gerechtvaardigd belang)</td>
                                <td className="px-4 py-3 align-top">
                                    Onder meer IP-gegevens (waar mogelijk gehasht of ingekort), Turnstile- en
                                    serverlogs
                                </td>
                            </tr>
                            <tr className="border-t border-stone-200">
                                <td className="px-4 py-3 align-top">Inzicht in gebruik van de website</td>
                                <td className="px-4 py-3 align-top">Art. 6 lid 1 sub a AVG (toestemming)</td>
                                <td className="px-4 py-3 align-top">
                                    Via Google Analytics verzamelde gebruiks- en apparaatgegevens
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-stone-900">Bewaartermijnen</h2>
                <div className="mt-4 overflow-x-auto rounded-3xl border border-stone-200">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-stone-50 text-stone-600">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Categorie</th>
                                <th className="px-4 py-3 font-semibold">Termijn</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-t border-stone-200">
                                <td className="px-4 py-3">Intake-sessies</td>
                                <td className="px-4 py-3">2 jaar</td>
                            </tr>
                            <tr className="border-t border-stone-200">
                                <td className="px-4 py-3">Contactberichten</td>
                                <td className="px-4 py-3">1 jaar</td>
                            </tr>
                            <tr className="border-t border-stone-200">
                                <td className="px-4 py-3">Registraties van toestemming (consent)</td>
                                <td className="px-4 py-3">5 jaar na intrekking</td>
                            </tr>
                            <tr className="border-t border-stone-200">
                                <td className="px-4 py-3">Beveiligingslogs</td>
                                <td className="px-4 py-3">90 dagen</td>
                            </tr>
                            <tr className="border-t border-stone-200">
                                <td className="px-4 py-3">Google Analytics</td>
                                <td className="px-4 py-3">14 maanden</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-stone-900">Jouw rechten</h2>
                <p className="mt-3">
                    Onder de AVG heb je onder meer de volgende rechten, voor zover van toepassing op jouw
                    situatie:
                </p>
                <ul className="mt-4 list-disc space-y-2 pl-6">
                    <li>
                        <span className="font-medium text-stone-800">Inzage</span> — je kunt vragen welke
                        persoonsgegevens we van je verwerken.
                    </li>
                    <li>
                        <span className="font-medium text-stone-800">Correctie</span> — je kunt onjuiste of
                        onvolledige gegevens laten aanpassen.
                    </li>
                    <li>
                        <span className="font-medium text-stone-800">Verwijdering</span> — je kunt in
                        aanmerking komen voor verwijdering, rekening houdend met wettelijke verplichtingen.
                    </li>
                    <li>
                        <span className="font-medium text-stone-800">Toestemming intrekken</span> — waar
                        verwerking op toestemming berust, kun je die intrekken. Dat kan via de onderstaande
                        knop of door een e-mail te sturen naar{" "}
                        <a
                            href="mailto:info@perfectsupplement.nl"
                            className="font-medium text-stone-800 underline-offset-4 hover:underline"
                        >
                            info@perfectsupplement.nl
                        </a>
                        .
                    </li>
                    <li>
                        <span className="font-medium text-stone-800">Bezwaar</span> — je kunt bezwaar maken
                        tegen verwerking op basis van gerechtvaardigd belang, voor zover dat recht op jou van
                        toepassing is.
                    </li>
                    <li>
                        <span className="font-medium text-stone-800">Gegevensoverdraagbaarheid</span> — voor
                        gegevens die je ons hebt verstrekt en die we verwerken met toestemming of contract,
                        kun je in aanmerking komen voor overdracht in een gangbaar formaat.
                    </li>
                    <li>
                        <span className="font-medium text-stone-800">Klacht</span> — je kunt een klacht
                        indienen bij de Autoriteit Persoonsgegevens (
                        <a
                            href="https://www.autoriteitpersoonsgegevens.nl"
                            className="font-medium text-stone-800 underline-offset-4 hover:underline"
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            autoriteitpersoonsgegevens.nl
                        </a>
                        ).
                    </li>
                </ul>

                <div className="mt-8 border-t border-stone-200 pt-8">
                    <PrivacyRevokeConsent embedded />
                </div>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-stone-900">Beveiliging</h2>
                <p className="mt-3">
                    We treffen passende technische en organisatorische maatregelen om je gegevens te
                    beschermen, waaronder:
                </p>
                <ul className="mt-4 list-disc space-y-2 pl-6">
                    <li>versleutelde verbinding via HTTPS;</li>
                    <li>Row Level Security en server-side alleen toegang tot de database waar van toepassing;</li>
                    <li>IP-adressen waar passend gehasht of beperkt vastgelegd;</li>
                    <li>beveiligingsheaders op de website;</li>
                    <li>Cloudflare Turnstile ter bescherming van formulieren tegen geautomatiseerd misbruik.</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-stone-900">Cookies</h2>
                <p className="mt-3">
                    Functionele cookies zijn nodig voor de werking van de site en worden geplaatst zonder
                    voorafgaande toestemming via de cookiebanner. Analytische cookies (Google Analytics)
                    plaatsen we pas nadat je daarvoor toestemming geeft.
                </p>
                <div className="mt-4 overflow-x-auto rounded-3xl border border-stone-200">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-stone-50 text-stone-600">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Cookie</th>
                                <th className="px-4 py-3 font-semibold">Type</th>
                                <th className="px-4 py-3 font-semibold">Bewaartermijn</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-t border-stone-200">
                                <td className="px-4 py-3 font-mono text-stone-700">psf_intake_sid</td>
                                <td className="px-4 py-3">Functioneel (sessie / intake)</td>
                                <td className="px-4 py-3">90 dagen</td>
                            </tr>
                            <tr className="border-t border-stone-200">
                                <td className="px-4 py-3 font-mono text-stone-700">_ga / _ga_*</td>
                                <td className="px-4 py-3">Analytisch (Google Analytics)</td>
                                <td className="px-4 py-3">14 maanden</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-stone-900">Derde partijen</h2>
                <p className="mt-3">
                    We maken voor hosting, beveiliging, analyse en communicatie gebruik van onderstaande
                    verwerkers. Waar nodig zijn verwerkersovereenkomsten gesloten.
                </p>
                <div className="mt-4 overflow-x-auto rounded-3xl border border-stone-200">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-stone-50 text-stone-600">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Dienst</th>
                                <th className="px-4 py-3 font-semibold">Rol / locatie</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-t border-stone-200">
                                <td className="px-4 py-3">Supabase</td>
                                <td className="px-4 py-3">Database / hosting — EU (Frankfurt)</td>
                            </tr>
                            <tr className="border-t border-stone-200">
                                <td className="px-4 py-3">Cloudflare</td>
                                <td className="px-4 py-3">
                                    CDN, beveiliging, Turnstile — wereldwijd, met waarborgen conform AVG
                                </td>
                            </tr>
                            <tr className="border-t border-stone-200">
                                <td className="px-4 py-3">Google Analytics</td>
                                <td className="px-4 py-3">Webanalyse — Verenigde Staten, EU-US Data Privacy Framework</td>
                            </tr>
                            <tr className="border-t border-stone-200">
                                <td className="px-4 py-3">Zoho CRM</td>
                                <td className="px-4 py-3">CRM — EU</td>
                            </tr>
                            <tr className="border-t border-stone-200">
                                <td className="px-4 py-3">Resend</td>
                                <td className="px-4 py-3">E-mail — Verenigde Staten, EU-US Data Privacy Framework</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-stone-900">Gegevensoverdracht buiten de EU</h2>
                <p className="mt-3">
                    Als gegevens buiten de Europese Economische Ruimte worden doorgegeven, doen we dat met
                    passende waarborgen, zoals het EU-US Data Privacy Framework waar van toepassing, en anders
                    met door de Europese Commissie goedgekeurde standaardcontractbepalingen (SCC&apos;s) of
                    vergelijkbare maatregelen.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-stone-900">Minderjarigen</h2>
                <p className="mt-3">
                    Deze website richt zich op mannen vanaf ongeveer veertig jaar. We verzamelen niet bewust
                    persoonsgegevens van personen jonger dan zestien jaar. Als je denkt dat we onbedoeld
                    dergelijke gegevens hebben verwerkt, neem dan contact met ons op zodat we dit kunnen
                    verwijderen.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-stone-900">Wijzigingen</h2>
                <p className="mt-3">
                    Deze privacyverklaring kan worden aangepast, bijvoorbeeld bij wijzigingen in wetgeving,
                    diensten of onze werkwijze. De meest recente versie staat altijd op deze pagina; de datum
                    van de laatste wijziging staat bovenaan deze verklaring.
                </p>
            </section>
        </ContentPageLayout>
    );
}
