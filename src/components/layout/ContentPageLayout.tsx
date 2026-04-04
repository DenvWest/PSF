import { ReactNode } from "react";
import Container from "@/components/layout/Container";

type ContentPageLayoutProps = {
    eyebrow?: string;
    title: string;
    intro?: ReactNode;
    children: ReactNode;
};

export default function ContentPageLayout({
    eyebrow,
    title,
    intro,
    children,
}: ContentPageLayoutProps) {
    return (
        <div className="text-stone-900">
            <Container className="py-16 md:py-20">
                <div className="max-w-3xl">
                    <div className="mb-10">
                        {eyebrow ? (
                            <p className="ps-eyebrow">{eyebrow}</p>
                        ) : null}
                        <h1 className="ps-display mt-4 text-3xl leading-[1.12] text-stone-900 md:text-[2.125rem]">
                            {title}
                        </h1>
                        {intro ? (
                            <div className="mt-4 text-base leading-[1.75] text-stone-500">
                                {intro}
                            </div>
                        ) : null}
                    </div>

                    <div className="space-y-12 text-base leading-[1.75] text-stone-500">
                        {children}
                    </div>
                </div>
            </Container>
        </div>
    );
}
