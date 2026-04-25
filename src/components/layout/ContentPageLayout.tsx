import { ReactNode } from "react";
import Link from "next/link";
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

                    <nav className="mt-16 border-t border-stone-100 pt-8">
                        <p className="text-xs font-medium uppercase tracking-widest text-stone-400">
                            Verder lezen
                        </p>
                        <ul className="mt-4 flex flex-wrap gap-4 text-sm text-stone-500">
                            <li>
                                <Link href="/" className="hover:text-stone-900">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/supplementen"
                                    className="hover:text-stone-900"
                                >
                                    Supplementengids
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/intake"
                                    className="hover:text-stone-900"
                                >
                                    Gratis intake
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/methodologie"
                                    className="hover:text-stone-900"
                                >
                                    Methodologie
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" className="hover:text-stone-900">
                                    Blog
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>
            </Container>
        </div>
    );
}
