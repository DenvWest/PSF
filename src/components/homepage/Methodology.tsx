import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function Methodology() {
    return (
        <Section
            eyebrow="Methodologie"
            title="Hoe wij beoordelen"
            description="Een korte introductie op onze beoordelingsmethode."
        >
            <div className="grid gap-6 md:grid-cols-3">
                <Card
                    title="Ingrediënten"
                    text="We kijken naar samenstelling en relevantie."
                />
                <Card
                    title="Dosering"
                    text="We vergelijken doseringen met praktische bruikbaarheid."
                />
                <Card
                    title="Transparantie"
                    text="We letten op openheid van het merk en de formule."
                />
            </div>

            <div className="mt-8">
                <Button href="/methodologie" variant="secondary">
                    Lees volledige methodologie
                </Button>
            </div>
        </Section>
    );
}

