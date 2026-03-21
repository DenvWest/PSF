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
        <main>
            <Container className="py-16">
                <div className="max-w-3xl">
                    <div className="mb-10">
                        {eyebrow ? (
                            <p className="text-sm font-medium uppercase tracking-wide text-green-700">
                                {eyebrow}
                            </p>
                        ) : null}
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                            {title}
                        </h1>
                        {intro ? (
                            <div className="mt-4 text-base leading-7 text-slate-600">
                                {intro}
                            </div>
                        ) : null}
                    </div>

                    <div className="space-y-12 text-base leading-7 text-slate-600">
                        {children}
                    </div>
                </div>
            </Container>
        </main>
    );
}
