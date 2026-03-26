import Link from "next/link";
import ContentSection from "@/components/ui/ContentSection";

type RelatedPageItem = {
    href: string;
    title: string;
    description: string;
};

type RelatedPagesProps = {
    title?: string;
    description?: string;
    items: RelatedPageItem[];
};

export default function RelatedPages({
    title = "Verder lezen",
    description = "Logische vervolgstappen binnen dit omega 3 cluster.",
    items,
}: RelatedPagesProps) {
    return (
        <ContentSection title={title} description={description}>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {items.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="group block rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-stone-300 hover:bg-stone-50/80"
                    >
                        <h3 className="text-base font-semibold text-stone-900 transition group-hover:text-stone-700">
                            {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-stone-500">
                            {item.description}
                        </p>
                    </Link>
                ))}
            </div>
        </ContentSection>
    );
}
