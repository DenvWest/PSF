import Disclosure from "@/components/ui/Disclosure";
import Container from "@/components/layout/Container";

export default function MoneyPageLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Container className="py-8">
            <div className="mx-auto max-w-4xl">
                <Disclosure />
                {children}
            </div>
        </Container>
    );
}
