import { ReactNode } from "react";

type ContentSectionProps = {
    id?: string;
    title: string;
    description?: string;
    children: ReactNode;
};

export default function ContentSection({
    id,
    title,
    description,
    children,
}: ContentSectionProps) {
    return (
        <section id={id} className="py-12 md:py-16">
            <div className="mx-auto max-w-6xl px-4 md:px-6">
                <div className="max-w-2xl">
                    <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2>
                    {description ? (
                        <p className="mt-3 text-sm leading-6 text-slate-600 md:text-base">{description}</p>
                    ) : null}
                </div>
                <div className="mt-8">{children}</div>
            </div>
        </section>
    );
}
