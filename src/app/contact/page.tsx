import type { Metadata } from "next";
import ContactForm from "@/components/contact-form";
import Container from "@/components/layout/Container";

export const metadata: Metadata = {
    title: {
        absolute: "Contact | Perfect Supplement",
    },
    description:
        "Hulp, veelgestelde vragen en contactinformatie van Perfect Supplement.",
};

export default function ContactPage() {
    return (
        <>
            {/* Hero */}
            <section className="border-b border-stone-200/80 bg-stone-50">
                <Container>
                    <div className="max-w-6xl py-12 md:py-16 lg:py-20">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
                            DIRECT CONTACT
                        </p>

                        <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-stone-900 md:text-5xl">
                            Stuur ons een bericht
                        </h1>

                        <p className="mt-6 max-w-3xl text-lg leading-8 text-stone-600">
                            Voor algemene vragen, inhoudelijke feedback of een
                            zakelijke aanvraag kun je hieronder direct contact
                            opnemen.
                        </p>

                        <p className="mt-4 max-w-2xl text-base leading-7 text-stone-500">
                            Zoek je eerst meer context of veelgestelde vragen?
                            Die staan apart op de FAQ-pagina in de footer.
                        </p>
                    </div>
                </Container>
            </section>

            {/* Contact — e-mail als laatste stap */}
            <section
                id="kom-je-er-niet-uit"
                className="scroll-mt-24 bg-[var(--ps-bg)]"
            >
                <Container>
                    <div className="max-w-6xl py-8 md:py-12">
                        <div className="max-w-3xl">
                            <div className="mb-4 rounded-2xl border border-stone-200 bg-gradient-to-br from-stone-50 via-white to-white p-5 shadow-sm ring-1 ring-stone-900/[0.04] md:p-6">
                                <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
                                    Zakelijke aanvraag
                                </p>
                                <h3 className="mt-3 text-xl font-semibold tracking-tight text-stone-900">
                                    Zakelijke partner worden?
                                </h3>
                                <p className="mt-3 text-sm leading-6 text-stone-600">
                                    Gebruik hetzelfde formulier en vermeld kort je organisatie,
                                    het type samenwerking en je voorstel. Dan kunnen we sneller
                                    beoordelen of het inhoudelijk past bij Perfect Supplement.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-stone-200 bg-white shadow-sm ring-1 ring-stone-900/[0.04]">
                                <ContactForm
                                    title="Stuur ons een bericht"
                                    description="Voor algemene vragen, feedback en zakelijke aanvragen."
                                />
                            </div>
                            <p className="mt-10 text-sm leading-7 text-stone-500 md:mt-12">
                                Perfect Supplement is een onafhankelijk platform gericht op
                                transparante, evidence-based informatie over supplementen.
                            </p>
                        </div>
                    </div>
                </Container>
            </section>
        </>
    );
}
