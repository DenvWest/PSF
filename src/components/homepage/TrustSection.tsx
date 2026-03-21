import Link from "next/link";
import Section from "@/components/ui/Section";

export default function TrustSection() {
    return (
        <Section
            eyebrow="Transparant & rustig"
            title="Waar je op kunt vertrouwen"
            description="We beoordelen op inhoud, dosering en transparantie — niet op marketing. Op elke pagina proberen we keuzes en trade-offs helder te maken, zodat je snel snapt wat je krijgt."
        >
            <div className="max-w-2xl">
                <Link
                    href="/methodologie"
                    className="inline-flex text-sm font-medium text-slate-600 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-900 hover:decoration-slate-400"
                >
                    Lees hoe we beoordelen
                </Link>
            </div>
        </Section>
    );
}
