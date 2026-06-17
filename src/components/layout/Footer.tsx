import Link from "next/link";
import Container from "@/components/layout/Container";
import { DISCLAIMER_TEXTS } from "@/lib/disclaimer-text";

const footerColumns = [
    {
        title: "Start hier",
        links: [
            { href: "/intake", label: "Leefstijlcheck" },
            { href: "/gidsen", label: "Gidsen na 40" },
            { href: "/profiel", label: "Profielen" },
            { href: "/blog", label: "Blog" },
            { href: "/kennisbank", label: "Kennisbank" },
        ],
    },
    {
        title: "Supplementen",
        links: [
            { href: "/supplementen", label: "Supplementgids" },
            { href: "/supplementen", label: "Vergelijkingen" },
            { href: "/methodologie", label: "Methodologie" },
        ],
    },
    {
        title: "PerfectSupplement",
        links: [
            { href: "/over-ons", label: "Over ons" },
            { href: "/contact", label: "Contact" },
            { href: "/faqs", label: "FAQ" },
            { href: "/affiliate-disclosure", label: "Affiliate disclosure" },
        ],
    },
    {
        title: "Account",
        links: [
            { href: "/account/login", label: "Inloggen" },
            { href: "/dashboard", label: "Mijn dashboard" },
        ],
    },
] as const;

const bottomLegalLinks = [
    { href: "/privacy", label: "Privacy" },
    { href: "/juridisch", label: "Juridisch" },
    { href: "/cookies", label: "Cookies" },
    { href: "/disclaimer", label: "Disclaimer" },
    { href: "/medische-disclaimer", label: "Medische disclaimer" },
] as const;

export default function Footer() {
    return (
        <footer className="border-t border-stone-200 bg-[var(--ps-bg)]">
            <Container>
                <div className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10 lg:py-14">
                    {footerColumns.map((column) => (
                        <div key={column.title}>
                            <h4 className="text-sm font-semibold text-stone-900">
                                {column.title}
                            </h4>
                            <ul className="mt-4 space-y-2.5">
                                {column.links.map((link) => (
                                    <li key={`${column.title}-${link.label}`}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-stone-600 transition hover:text-stone-900"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="border-t border-stone-100 py-5 text-center">
                    <p className="text-xs text-stone-400">
                        © 2026 PerfectSupplement
                        {bottomLegalLinks.map((link) => (
                            <span key={link.href}>
                                {" "}
                                <span className="text-stone-300">·</span>{" "}
                                <Link
                                    href={link.href}
                                    className="underline-offset-2 transition hover:text-stone-600 hover:underline"
                                >
                                    {link.label}
                                </Link>
                            </span>
                        ))}
                    </p>
                    <p className="mt-2 text-xs text-stone-400">
                        {DISCLAIMER_TEXTS.footer}{" "}
                        <Link
                            href="/disclaimer"
                            className="underline underline-offset-2 transition hover:text-stone-600"
                        >
                            Meer →
                        </Link>
                    </p>
                </div>
            </Container>
        </footer>
    );
}
