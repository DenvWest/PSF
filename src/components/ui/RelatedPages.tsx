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
                        className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300"
                    >
                        <h3 className="text-base font-semibold text-slate-900 transition group-hover:text-green-700">
                            {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                    </Link>
                ))}
            </div>
        </ContentSection>
    );
}
