import ContentPageLayout from "@/components/layout/ContentPageLayout";

export default function ContactPage() {
    return (
        <ContentPageLayout
            eyebrow="Contact"
            title="Contact"
            intro={
                <>
                    Heb je een vraag, opmerking of correctie? Neem dan contact op.
                </>
            }
        >
            <section className="space-y-6">
                <p>
                    Voor algemene vragen, feedback of zakelijke verzoeken kun je contact opnemen
                    via het e-mailadres dat je hier later toevoegt.
                </p>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                    <p className="text-sm font-medium text-slate-900">E-mail</p>
                    <p className="mt-2 text-sm text-slate-600">jij@perfectsupplement.nl</p>
                </div>
            </section>
        </ContentPageLayout>
    );
}