import Link from "next/link";
import Container from "@/components/layout/Container";
import {
    BlogArticleExcerpt,
    BlogArticleIntro,
} from "@/components/blog/BlogArticleIntro";
import ContentSection from "@/components/ui/ContentSection";
import RelatedPages from "@/components/ui/RelatedPages";
import { buildArticlePageMetadata, getBlogPostBySlug } from "@/data/blog-posts";
import {
    veelgemaakteFouten,
    segmentatie,
} from "@/features/supplementen/data/supplement-kiezen-waar-op-letten";

export function generateMetadata() {
    return {
        ...buildArticlePageMetadata("supplement-kiezen-waar-op-letten"),
        alternates: { canonical: "/supplement-kiezen-waar-op-letten" },
    };
}

const relatedPages = [
    {
        href: "/beste-magnesium",
        title: "Beste magnesium supplement",
        description: "Vergelijk vormen en vind een keuze die past bij ontspanning, slaap of algemeen gebruik.",
    },
    {
        href: "/beste-omega-3-supplement",
        title: "Beste omega-3 supplement",
        description: "EPA, DHA, vorm van de olie en praktische keuzes voor dagelijks gebruik.",
    },
    {
        href: "/waar-let-je-op-bij-omega-3",
        title: "Waar let je op bij omega-3?",
        description: "Dieper ingaan op dosering, transparantie en prijs per dag bij visolie en algenolie.",
    },
    {
        href: "/magnesium-vergelijken",
        title: "Magnesium vergelijken",
        description: "Vormen en toepassingen naast elkaar.",
    },
];

export default function SupplementKiezenWaarOpLettenPage() {
    const post = getBlogPostBySlug("supplement-kiezen-waar-op-letten");
    if (!post) {
        throw new Error("Blog post supplement-kiezen-waar-op-letten ontbreekt");
    }

    return (
        <main className="text-stone-900">
            <article>
            <section className="border-b border-stone-200 bg-stone-50">
                <Container className="py-16 md:py-24">
                    <header>
                    <BlogArticleIntro post={post} />
                    <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
                        Waar moet je op letten bij het kiezen van een supplement?
                    </h1>
                    <BlogArticleExcerpt post={post} />
                    </header>
                    <p className="mt-5 max-w-2xl text-base leading-7 text-stone-600 md:text-lg">
                        Supplementen zijn er in overvloed — en niet alles wat op de schap staat, is even
                        zinvol. Tussen slimme marketing en echte kwaliteit zit vaak een groot verschil. In
                        dit artikel lees je waar je écht op moet letten als je een{" "}
                        <strong className="font-semibold text-stone-800">beste supplement</strong> wilt{" "}
                        <strong className="font-semibold text-stone-800">kiezen</strong>: inhoudelijk,
                        rustig en zonder overdreven beloftes.
                    </p>
                </Container>
            </section>

            <ContentSection
                title="Intro: veel keuze, weinig houvast"
                description="Als je zoekt op supplement kiezen waar op letten, wil je vooral grip op de feiten — niet op slogans."
            >
                <div className="max-w-3xl space-y-4 text-sm leading-7 text-stone-600 md:text-base">
                    <p>
                        Winkels en webshops zijn gevuld met potjes, capsules en poeders. Dat voelt
                        overweldigend: wat is nodig, wat is overbodig, en wanneer betaal je voor kwaliteit
                        in plaats van voor een mooi verhaal?
                    </p>
                    <p>
                        Een eerlijke aanpak begint bij het scheiden van marketing en samenstelling. Merken
                        die transparant zijn over dosering, vorm en testen, helpen je om{" "}
                        <strong className="font-semibold text-stone-800">kwaliteit supplementen te herkennen</strong>
                        . De rest van dit artikel geeft je een praktisch kader — toepasbaar op magnesium,
                        omega-3 en andere categorieën.
                    </p>
                </div>
            </ContentSection>

            <ContentSection
                title="Waarom niet elk supplement hetzelfde is"
                description="Zelfs met dezelfde naam op het etiket kunnen producten sterk verschillen."
            >
                <div className="max-w-3xl space-y-4 text-sm leading-7 text-stone-600 md:text-base">
                    <p>
                        Twee potjes “magnesium” of “omega-3” zijn zelden identiek. Verschillen zitten in{" "}
                        <strong className="font-semibold text-stone-800">kwaliteit van grondstoffen</strong>,{" "}
                        <strong className="font-semibold text-stone-800">opneembaarheid</strong> (hoe goed je
                        lichaam de stof kan gebruiken),{" "}
                        <strong className="font-semibold text-stone-800">dosering</strong> en de{" "}
                        <strong className="font-semibold text-stone-800">vorm</strong> van het supplement.
                    </p>
                    <p>
                        Bij magnesium speelt de chemische binding een grote rol: niet elke vorm gedraagt zich
                        hetzelfde in het lichaam. Bij omega-3 maakt het uit of je visolie of algenolie kiest,
                        en hoeveel van de werkzame vetzuren EPA en DHA je per capsule daadwerkelijk binnenkrijgt
                        — los van de totale visolie op het etiket.
                    </p>
                    <ul className="mt-6 space-y-3 text-sm leading-6 text-stone-600 md:text-base">
                        <li className="flex gap-3">
                            <span className="mt-0.5 flex-shrink-0 text-stone-500">—</span>
                            <span>
                                <strong className="font-semibold text-stone-800">Kwaliteit:</strong> zuiverheid,
                                contaminanten en (bij vetzuren) oxidatie.
                            </span>
                        </li>
                        <li className="flex gap-3">
                            <span className="mt-0.5 flex-shrink-0 text-stone-500">—</span>
                            <span>
                                <strong className="font-semibold text-stone-800">Opneembaarheid:</strong> niet
                                elke vorm levert hetzelfde op in de praktijk.
                            </span>
                        </li>
                        <li className="flex gap-3">
                            <span className="mt-0.5 flex-shrink-0 text-stone-500">—</span>
                            <span>
                                <strong className="font-semibold text-stone-800">Dosering:</strong> wat staat
                                er op het etiket versus wat je echt aan werkzame stof binnenkrijgt.
                            </span>
                        </li>
                        <li className="flex gap-3">
                            <span className="mt-0.5 flex-shrink-0 text-stone-500">—</span>
                            <span>
                                <strong className="font-semibold text-stone-800">Vorm:</strong> capsule,
                                vloeibaar of tablet — wat past bij jouw routine en tolerantie.
                            </span>
                        </li>
                    </ul>
                </div>
            </ContentSection>

            <ContentSection
                title="De 6 belangrijkste factoren"
                description="Gebruik dit als checklist wanneer je een supplement vergelijkt — ongeacht het merk."
            >
                <div className="max-w-3xl space-y-12">
                    <section>
                        <h3 className="text-lg font-semibold text-stone-900 md:text-xl">
                            1. Werkzame stof en dosering
                        </h3>
                        <div className="mt-4 space-y-4 text-sm leading-7 text-stone-600 md:text-base">
                            <p>
                                Het eerste wat je wilt weten:{" "}
                                <strong className="font-semibold text-stone-800">wat zit er echt in</strong>, in
                                relevante eenheden? Bij omega-3 zijn dat doorgaans de hoeveelheden{" "}
                                <strong className="font-semibold text-stone-800">EPA en DHA</strong> (in mg) per
                                portie — niet alleen “1000 mg visolie”, want daarvan is maar een deel de
                                werkzame omega-3. Vergelijk daarom EPA/DHA als je producten eerlijk naast elkaar
                                wilt leggen.
                            </p>
                            <p>
                                Bij magnesium zie je vaak een totaal aan “magnesium” vermeld, maar de bruikbare
                                vergelijking is <strong className="font-semibold text-stone-800">elementair
                                magnesium</strong>: het daadwerkelijke magnesiumgehalte in de verbinding. Een
                                hogere mg-waarde op de voorkant kan misleidend zijn als het om een zout gaat met
                                veel “ballast” rond het mineraal.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-stone-900 md:text-xl">
                            2. Opneembaarheid (bioavailability)
                        </h3>
                        <div className="mt-4 space-y-4 text-sm leading-7 text-stone-600 md:text-base">
                            <p>
                                Niet elke vorm van een stof wordt even goed opgenomen of verdragen. Bij
                                magnesium wordt{" "}
                                <strong className="font-semibold text-stone-800">bisglycinaat</strong> vaak
                                genoemd als goed verdragen en bruikbaar voor doelen rond ontspanning en slaap;
                                <strong className="font-semibold text-stone-800"> oxide</strong> bevat veel
                                elementair magnesium maar wordt in de praktijk minder efficiënt opgenomen — wat
                                niet per se “fout” is, maar wel vraagt om andere verwachtingen over dosering
                                en effect.
                            </p>
                            <p>
                                Bij visolie maakt de drager uit: olie in{" "}
                                <strong className="font-semibold text-stone-800">triglyceridevorm</strong> wordt
                                vaak als natuurlijker beschouwd dan{" "}
                                <strong className="font-semibold text-stone-800">ethylesters</strong>, die een
                                andere technologische route hebben. Beide kunnen kwaliteit leveren; het gaat om
                                combinatie met dosering, stabiliteit en wat het merk aantoont over oxidatie en
                                zuiverheid.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-stone-900 md:text-xl">
                            3. Zuiverheid en kwaliteit
                        </h3>
                        <div className="mt-4 space-y-4 text-sm leading-7 text-stone-600 md:text-base">
                            <p>
                                Supplementen kunnen sporen van{" "}
                                <strong className="font-semibold text-stone-800">zware metalen</strong> of
                                andere verontreinigingen bevatten, afhankelijk van de bron en productie. Serieuze
                                merken laten vaak testen uitvoeren en communiceren daarover — al is het niveau
                                van detail per merk verschillend.
                            </p>
                            <p>
                                Bij <strong className="font-semibold text-stone-800">omega-3</strong> is{" "}
                                <strong className="font-semibold text-stone-800">oxidatie</strong> (ranzigheid)
                                een kwaliteitsindicator: geoxideerde olie wil je vermijden. Aandacht voor
                                bewaaradvies, verpakking (bijvoorbeeld bescherming tegen licht) en
                                houdbaarheidsdatum helpt; merken die TOTOX-waarden of vergelijkbare metingen
                                delen, maken vergelijken eenvoudiger.
                            </p>
                            <p>
                                <strong className="font-semibold text-stone-800">Certificeringen</strong> (zoals
                                onafhankelijke keurmerken of GMP) zijn geen garantie op alles, maar ze kunnen
                                wel een extra controlelaag suggereren. Lees wat het keurmerk precies dekt.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-stone-900 md:text-xl">
                            4. Vorm van het supplement
                        </h3>
                        <div className="mt-4 space-y-4 text-sm leading-7 text-stone-600 md:text-base">
                            <p>
                                <strong className="font-semibold text-stone-800">Capsules</strong> zijn
                                praktisch voor gerichte dosering en meenemen.{" "}
                                <strong className="font-semibold text-stone-800">Vloeibare</strong> omega-3 kan
                                prettig zijn bij grote volumes of als je moeite hebt met slikken — let dan op
                                smaak, bewaring en doseren per ml.
                            </p>
                            <p>
                                <strong className="font-semibold text-stone-800">Tabletten</strong> versus{" "}
                                <strong className="font-semibold text-stone-800">poeder</strong>: tabletten zijn
                                compact; poeders geven flexibiliteit in dosering en mengen in drank. Wat “beter”
                                is, hangt af van tolerantie (bijvoorbeeld maag-darm), routine en of je extra
                                vulstoffen wilt vermijden.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-stone-900 md:text-xl">
                            5. Transparantie van het merk
                        </h3>
                        <div className="mt-4 space-y-4 text-sm leading-7 text-stone-600 md:text-base">
                            <p>
                                Een helder etiket vertelt je per portie hoeveel werkzame stof je krijgt — zonder
                                dat je hoeft te gokken. Wantrouw vage termen als “blend” zonder uitgesplitste
                                hoeveelheden:{" "}
                                <strong className="font-semibold text-stone-800">proprietary blends</strong>{" "}
                                maskeren vaak dat de duurdere ingrediënten slechts in minieme hoeveelheden
                                voorkomen.
                            </p>
                            <p>
                                Goede transparantie betekent ook: batchinformatie waar relevant, duidelijke
                                gebruiksadviezen, en eerlijke verwachtingen over wat een supplement wél en niet
                                doet.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-stone-900 md:text-xl">
                            6. Prijs versus kwaliteit
                        </h3>
                        <div className="mt-4 space-y-4 text-sm leading-7 text-stone-600 md:text-base">
                            <p>
                                De laagste prijs per potje zegt weinig als de werkzame dosis per dag tegenvalt.
                                Reken daarom liever de{" "}
                                <strong className="font-semibold text-stone-800">prijs per werkzame stof</strong>{" "}
                                (bijvoorbeeld prijs per 250 mg EPA+DHA, of per 100 mg elementair magnesium) dan
                                alleen het bedrag op de kassabon.
                            </p>
                            <p>
                                <strong className="font-semibold text-stone-800">Goedkoop is vaak duurkoop</strong>{" "}
                                als je dubbele hoeveelheden nodig hebt om een eerlijke dosis te halen, of als
                                kwaliteit (oxidatie, zuiverheid) onder de maat is. Dat wil niet zeggen dat elk
                                duur product automatisch beter is — vergelijk altijd op inhoud.
                            </p>
                        </div>
                    </section>
                </div>
            </ContentSection>

            <ContentSection
                title="Veelgemaakte fouten"
                description="Deze valkuilen zien we vaak terug — ongeacht ervaring."
            >
                <ul className="max-w-3xl space-y-3 text-sm leading-6 text-stone-600 md:text-base">
                    {veelgemaakteFouten.map((item) => (
                        <li key={item} className="flex gap-3">
                            <span className="mt-0.5 flex-shrink-0 text-stone-500">—</span>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </ContentSection>

            <ContentSection
                title="Welke keuze past bij jou?"
                description="Korte oriëntatie — geen medisch advies; bij twijfel over gezondheid of medicatie: vraag je zorgverlener."
            >
                <div className="grid gap-6 md:grid-cols-2">
                    {segmentatie.map((item) => (
                        <article
                            key={item.title}
                            className="rounded-2xl border border-stone-200 bg-stone-50 p-6"
                        >
                            <h3 className="text-base font-semibold text-stone-900">{item.title}</h3>
                            <p className="mt-3 text-sm leading-6 text-stone-600">{item.text}</p>
                        </article>
                    ))}
                </div>
                <div className="mt-8 max-w-3xl space-y-4 text-sm leading-7 text-stone-600 md:text-base">
                    <p>
                        Voor <strong className="font-semibold text-stone-800">waar op letten bij magnesium</strong>{" "}
                        (vormen, elementair magnesium, praktische keuzes) kun je verder lezen op onze pagina met{" "}
                        <Link
                            href="/beste-magnesium"
                            className="font-medium text-stone-800 underline-offset-4 hover:underline"
                        >
                            beste magnesium supplementen
                        </Link>
                        . Zo vergelijk je opties inhoudelijk, in plaats van alleen op prijs te filteren.
                    </p>
                    <p>
                        Voor <strong className="font-semibold text-stone-800">waar op letten bij omega-3</strong>{" "}
                        (EPA/DHA, oxidatie, vorm van de olie) is onze selectie en toelichting te vinden bij de{" "}
                        <Link
                            href="/beste-omega-3-supplement"
                            className="font-medium text-stone-800 underline-offset-4 hover:underline"
                        >
                            beste omega-3 supplementen
                        </Link>
                        . Daar bundelen we de factoren die voor vetzuren het meest verschil maken.
                    </p>
                </div>
            </ContentSection>

            <ContentSection
                title="Conclusie: kwaliteit boven marketing"
                description="Een betrouwbare keuze begint bij feiten op het etiket — niet bij de grootste belofte op de verpakking."
            >
                <div className="max-w-3xl space-y-4 text-sm leading-7 text-stone-600 md:text-base">
                    <p>
                        Een supplement kiezen waar op letten komt neer op: werkzame stof en echte dosering,
                        opneembaarheid die past bij je doel, zuiverheid, een vorm die bij je leefstijl past,
                        transparantie van het merk, en een eerlijke prijs per werkzame eenheid — niet per
                        glimmend potje.
                    </p>
                    <p>
                        Wil je concreet vergelijken binnen een categorie? Bekijk onze vergelijking van{" "}
                        <Link
                            href="/beste-magnesium"
                            className="font-medium text-stone-800 underline-offset-4 hover:underline"
                        >
                            beste magnesium supplementen
                        </Link>{" "}
                        en{" "}
                        <Link
                            href="/beste-omega-3-supplement"
                            className="font-medium text-stone-800 underline-offset-4 hover:underline"
                        >
                            beste omega-3 supplementen
                        </Link>
                        . Daar leggen we uit waarom bepaalde producten in onze selectie vallen — rustig,
                        inhoudelijk en zonder overdreven claims.
                    </p>
                </div>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                        href="/beste-magnesium"
                        className="inline-flex items-center justify-center rounded-xl bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
                    >
                        Bekijk beste magnesium supplementen
                    </Link>
                    <Link
                        href="/beste-omega-3-supplement"
                        className="inline-flex items-center justify-center rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-medium text-stone-900 transition hover:border-stone-300"
                    >
                        Bekijk beste omega-3 supplementen
                    </Link>
                </div>
            </ContentSection>

            <RelatedPages
                title="Verder lezen"
                description="Diepgang per categorie en onze keuzes — aansluitend op dit artikel."
                items={relatedPages}
            />

            <Container>
                <div className="mt-16 rounded-2xl bg-stone-50 px-6 py-10 text-center">
                    <p className="ps-eyebrow">Persoonlijk advies</p>
                    <p className="mt-3 text-xl font-semibold text-stone-900">
                        Weet jij welk supplement bij jou past?
                    </p>
                    <p className="mt-2 text-sm text-stone-500">
                        12 vragen, 3 minuten — direct een persoonlijk herstelplan.
                    </p>
                    <Link
                        href="/intake"
                        className="mt-6 inline-block rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white hover:bg-stone-700"
                    >
                        Start de gratis intake →
                    </Link>
                </div>
            </Container>
            </article>
        </main>
    );
}
