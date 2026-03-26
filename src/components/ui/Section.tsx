import { ReactNode } from "react";
import Container from "@/components/layout/Container";

type SectionProps = {
    eyebrow?: string;
    title: string;
    description?: string;
    children: ReactNode;
};

export default function Section({
    eyebrow,
    title,
    description,
    children,
}: SectionProps) {
    return (
        <section className="py-20">
            <Container>
                <div className="max-w-2xl">
                    {eyebrow ? (
                        <p className="ps-eyebrow">{eyebrow}</p>
                    ) : null}

                    <h2 className="ps-display mt-4 text-[1.875rem] leading-[1.1] text-stone-900 sm:text-[2.25rem]">
                        {title}
                    </h2>

                    {description ? (
                        <p className="mt-4 text-lg leading-8 text-stone-500">
                            {description}
                        </p>
                    ) : null}
                </div>

                <div className="mt-10">{children}</div>
            </Container>
        </section>
    );
}
