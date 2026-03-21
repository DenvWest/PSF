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
                        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
                            {eyebrow}
                        </p>
                    ) : null}

                    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                        {title}
                    </h2>

                    {description ? (
                        <p className="mt-4 text-lg leading-8 text-slate-600">
                            {description}
                        </p>
                    ) : null}
                </div>

                <div className="mt-10">{children}</div>
            </Container>
        </section>
    );
}
