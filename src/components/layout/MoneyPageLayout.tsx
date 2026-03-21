import Disclosure from "@/components/ui/Disclosure";

export default function MoneyPageLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="max-w-4xl mx-auto px-4">
            {/* Disclosure altijd bovenaan */}
            <Disclosure />

            {children}
        </div>
    );
}