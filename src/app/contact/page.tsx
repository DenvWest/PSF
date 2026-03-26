import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";

export const metadata: Metadata = {
    title: {
        absolute: "Contact | Perfect Supplement",
    },
    description:
        "Hulp, veelgestelde vragen en contactinformatie van Perfect Supplement.",
};

const CONTACT_EMAIL = "info@perfectsupplement.nl";
const MAIL_SUBJECT = "Vraag via Perfect Supplement";
const MAIL_BODY = `Hallo,

Ik neem contact op via de website van Perfect Supplement over:`;

const mailtoWithDraftHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(MAIL_SUBJECT)}&body=${encodeURIComponent(MAIL_BODY)}`;

const helpCards = [
    {
        title: "Veelgestelde vragen",
        description:
            "Snelle antwoorden op veelvoorkomende vragen over de website en onze content.",
        href: "/contact#veelgestelde-vragen",
    },
    {
        title: "Methodologie",
        description:
            "Lees hoe wij supplementen beoordelen op basis van transparantie, dosering en kwaliteit.",
        href: "/methodologie",
    },
    {
        title: "Feedback of suggestie",
        description:
            "Zie je een fout of heb je een aanvulling voor onze content? Laat het ons weten.",
        href: "/contact#kom-je-er-niet-uit",
    },
    {
        title: "Samenwerken",
        description:
            "Voor zakelijke aanvragen, partnerships of affiliate-gerelateerde vragen.",
        href: "/contact#kom-je-er-niet-uit",
    },
] as const;

const faqItems = [
    {
        q: "Hoe beoordelen jullie supplementen?",
        a: "We kijken onder meer naar dosering, vorm, transparantie van etikettering, prijs per werkzame eenheid en hoe duidelijk de bron en samenstelling zijn. Waar mogelijk leggen we de link met gangbare wetenschappelijke richtlijnen. De volledige aanpak staat beschreven in onze methodologie.",
    },
    {
        q: "Geven jullie medisch advies?",
        a: "Nee. Onze artikelen en vergelijkingen zijn informatief en geen vervanging voor een consult bij je arts, diëtist of apotheker. Bij gezondheidsklachten, zwangerschap, medicijngebruik of twijfel: altijd professioneel advies inwinnen.",
    },
    {
        q: "Kun je een product of merk voorstellen?",
        a: "We geven geen persoonlijke aanbevelingen buiten wat we op de site publiceren. Onze gidsen en vergelijkingen volgen vaste, open criteria — voor iedere lezer hetzelfde.",
    },
    {
        q: "Werken jullie onafhankelijk?",
        a: "Redactioneel wel: inhoud en keuzes zijn gebaseerd op onze methodologie, niet op adverteerders. De site kan affiliate-links bevatten; dat is altijd duidelijk aangegeven en verandert niet hoe we producten beoordelen. Meer over hoe we dat communiceren:",
        link: { href: "/affiliate-disclosure", label: "Affiliate disclosure" },
    },
    {
        q: "Hoe neem ik contact op voor samenwerking?",
        a: "Mail naar info@perfectsupplement.nl met een korte omschrijving van je organisatie en je vraag. We lezen alles en reageren zodra dat past bij de aard van je aanvraag.",
    },
];

export default function ContactPage() {
    return (
        <>
            {/* Hero */}
            <section className="border-b border-stone-200/80 bg-stone-50">
                <Container>
                    <div className="max-w-6xl py-16 md:py-20 lg:py-24">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
                            CONTACT
                        </p>

                        <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-stone-900 md:text-5xl">
                            Waar kunnen we je mee helpen?
                        </h1>

                        <p className="mt-6 max-w-3xl text-lg leading-8 text-stone-600">
                            Heb je een vraag over onze vergelijkingen, methodologie, content
                            of een mogelijke samenwerking? Hieronder vind je de snelste
                            route.
                        </p>

                        <div className="mt-10 grid gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl border border-stone-200/90 bg-white/90 px-4 py-3.5 text-sm leading-6 text-stone-700 shadow-sm ring-1 ring-stone-900/[0.03]">
                                Transparante criteria
                            </div>
                            <div className="rounded-2xl border border-stone-200/90 bg-white/90 px-4 py-3.5 text-sm leading-6 text-stone-700 shadow-sm ring-1 ring-stone-900/[0.03]">
                                Evidence-based uitgangspunten
                            </div>
                            <div className="rounded-2xl border border-stone-200/90 bg-white/90 px-4 py-3.5 text-sm leading-6 text-stone-700 shadow-sm ring-1 ring-stone-900/[0.03] sm:col-span-1">
                                Geen chat of formulier — rustig en direct
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Help hub — klikbare routes */}
            <section className="border-b border-stone-100 bg-[var(--ps-bg)]">
                <Container>
                    <div className="max-w-6xl py-14 md:py-16 lg:py-20">
                        <div className="max-w-2xl">
                            <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
                                Snel naar
                            </p>
                            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900 md:text-3xl">
                                Kies je route
                            </h2>
                            <p className="mt-4 text-base leading-7 text-stone-600 md:text-lg md:leading-8">
                                Van veelgestelde vragen tot onze methodologie en zakelijke
                                contacten — alles op één plek, in dezelfde rustige toon als de
                                rest van de site.
                            </p>
                        </div>

                        <div className="mt-10 grid gap-5 md:grid-cols-2">
                            {helpCards.map((card) => (
                                <Link
                                    key={card.title}
                                    href={card.href}
                                    className="group flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-7 shadow-sm ring-1 ring-stone-900/[0.04] transition hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md"
                                >
                                    <h3 className="text-lg font-semibold tracking-tight text-stone-900">
                                        {card.title}
                                    </h3>
                                    <p className="mt-3 flex-1 text-sm leading-6 text-stone-600">
                                        {card.description}
                                    </p>
                                    <p className="mt-6 text-sm font-medium text-stone-800 underline decoration-stone-300 underline-offset-4 transition group-hover:text-stone-800 group-hover:decoration-stone-400">
                                        Open
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </Container>
            </section>

            {/* FAQ */}
            <section
                id="veelgestelde-vragen"
                className="scroll-mt-24 border-b border-stone-100 bg-stone-50/60"
            >
                <Container>
                    <div className="max-w-6xl py-14 md:py-20">
                        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-14 xl:gap-20">
                            <div className="lg:pt-1">
                                <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
                                    Veelgestelde vragen
                                </p>
                                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
                                    Antwoorden die bij ons horen
                                </h2>
                                <p className="mt-4 text-base leading-7 text-stone-600">
                                    Korte, eerlijke antwoorden — geen marketingtaal. Voor de
                                    volledige achtergrond kun je altijd doorlinken naar{" "}
                                    <Link
                                        href="/methodologie"
                                        className="font-medium text-stone-800 underline decoration-stone-300/80 underline-offset-4 transition hover:text-stone-900"
                                    >
                                        de methodologie
                                    </Link>
                                    .
                                </p>
                            </div>

                            <div className="space-y-3">
                                {faqItems.map((item) => (
                                    <details
                                        key={item.q}
                                        className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm ring-1 ring-stone-900/[0.04] transition open:shadow-md open:ring-stone-900/[0.06]"
                                    >
                                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold tracking-tight text-stone-900 md:px-6 md:py-5 [&::-webkit-details-marker]:hidden">
                                            <span>{item.q}</span>
                                            <span
                                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-stone-500 transition group-open:rotate-180"
                                                aria-hidden
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                    className="h-4 w-4"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </span>
                                        </summary>
                                        <div className="border-t border-stone-100 px-5 pb-5 pt-0 text-sm leading-7 text-stone-600 md:px-6 md:pb-6">
                                            <p className="pt-4">{item.a}</p>
                                            {"link" in item && item.link ? (
                                                <p className="mt-3">
                                                    <Link
                                                        href={item.link.href}
                                                        className="font-medium text-stone-800 underline decoration-stone-300/80 underline-offset-4 transition hover:text-stone-900"
                                                    >
                                                        {item.link.label}
                                                    </Link>
                                                </p>
                                            ) : null}
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Contact — e-mail als laatste stap */}
            <section
                id="kom-je-er-niet-uit"
                className="scroll-mt-24 bg-[var(--ps-bg)]"
            >
                <Container>
                    <div className="max-w-6xl py-14 md:py-20">
                        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-gradient-to-br from-stone-50/90 via-white to-white shadow-sm ring-1 ring-stone-900/[0.04] md:flex md:min-h-[220px]">
                            <div className="flex flex-1 flex-col justify-center border-b border-stone-100 px-8 py-10 md:border-b-0 md:border-r md:px-10 md:py-12">
                                <h2 className="text-2xl font-semibold tracking-tight text-stone-900 md:text-3xl">
                                    Kom je er niet uit?
                                </h2>
                                <p className="mt-4 max-w-xl text-base leading-7 text-stone-600">
                                    Voor algemene vragen, feedback of zakelijke aanvragen kun je
                                    contact opnemen via{" "}
                                    <a
                                        href={`mailto:${CONTACT_EMAIL}`}
                                        className="font-medium text-stone-800 underline decoration-stone-300/80 underline-offset-4 transition hover:text-stone-900"
                                    >
                                        {CONTACT_EMAIL}
                                    </a>
                                    .
                                </p>
                            </div>
                            <div className="flex flex-col justify-center bg-white/80 px-8 py-10 md:w-[min(100%,320px)] md:shrink-0 md:px-10 md:py-12">
                                <a
                                    href={mailtoWithDraftHref}
                                    className="inline-flex w-full items-center justify-center rounded-xl bg-stone-900 px-5 py-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-stone-800"
                                >
                                    Stuur een e-mail
                                </a>
                                <p className="mt-4 text-center text-xs leading-5 text-stone-500 md:text-left">
                                    Opent je standaard mailprogramma met een leeg concept.
                                </p>
                            </div>
                        </div>

                        <p className="mx-auto mt-14 max-w-3xl text-center text-sm leading-7 text-stone-500 md:mt-16">
                            Perfect Supplement is een onafhankelijk platform gericht op
                            transparante, evidence-based informatie over supplementen.
                        </p>
                    </div>
                </Container>
            </section>
        </>
    );
}
