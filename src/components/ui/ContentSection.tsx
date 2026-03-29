import { ReactNode } from "react";
import Container from "@/components/layout/Container";

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
            <Container>
                <div className="max-w-2xl">
                    <h2 className="ps-display text-[1.625rem] leading-[1.15] tracking-tight text-stone-900 md:text-[1.875rem]">
                        {title}
                    </h2>
                    {description ? (
                        <p className="mt-3 text-sm leading-[1.75] text-stone-500 md:text-base">
                            {description}
                        </p>
                    ) : null}
                </div>
                <div className="mt-8">{children}</div>
            </Container>
        </section>
    );
}
