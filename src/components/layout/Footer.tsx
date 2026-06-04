import Image from "next/image";
import Link from "next/link";
import Container from "@/components/layout/Container";
import { DISCLAIMER_TEXTS } from "@/lib/disclaimer-text";
import { LEEFSTIJLCHECK_FOOTER_SLOT_ID } from "@/lib/leefstijlcheck-footer-slot";

const platformLinks = [
    { href: "/intake", label: "Leefstijlcheck" },
    { href: "/gidsen", label: "Gidsen na 40" },
    { href: "/supplementen", label: "Supplementen" },
    { href: "/blog", label: "Blog" },
    { href: "/kennisbank", label: "Kennisbank" },
];

const infoLinks = [
    { href: "/methodologie", label: "Methodologie" },
    { href: "/over-ons", label: "Over ons" },
    { href: "/contact", label: "Contact" },
];

const legalLinks = [
    { href: "/privacy", label: "Privacy" },
    { href: "/disclaimer", label: "Disclaimer" },
    { href: "/medische-disclaimer", label: "Medische disclaimer" },
    { href: "/affiliate-disclosure", label: "Affiliate disclosure" },
    { href: "/faqs", label: "FAQ" },
];

export default function Footer() {
    return (
        <footer className="border-t border-stone-200 bg-[var(--ps-bg)] floating-cta-footer">
            <Container>
                <div className="floating-cta-footer-layout">
                    <div className="min-w-0 flex-1">
                        <div className="grid gap-10 py-12 md:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:py-14">
                            <div className="md:col-span-2 lg:col-span-1">
                                <Link href="/" className="inline-flex items-center gap-2.5">
                                    <Image
                                        src="/icon.png"
                                        alt="PerfectSupplement logo"
                                        width={28}
                                        height={28}
                                        className="h-7 w-7 rounded-lg"
                                    />
                                    <span className="text-base font-semibold tracking-tight text-stone-900">
                                        Perfect<span className="text-stone-800">Supplement</span>
                                    </span>
                                </Link>
                                <p className="mt-4 max-w-md text-sm leading-relaxed text-stone-500">
                                    De rustige gids voor mannen 40+: eerst grip op slaap, stress en
                                    herstel — daarna pas supplementen. Gratis Leefstijlcheck,
                                    onafhankelijk en zonder sponsors.
                                </p>
                            </div>

                            <div>
                                <h4 className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                                    Platform
                                </h4>
                                <ul className="mt-4 space-y-2.5">
                                    {platformLinks.map((link) => (
                                        <li key={link.href}>
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

                            <div>
                                <h4 className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                                    Over ons
                                </h4>
                                <ul className="mt-4 space-y-2.5">
                                    {infoLinks.map((link) => (
                                        <li key={link.href}>
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
                        </div>

                        <div className="border-t border-stone-100 py-6 space-y-3">
                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                                {legalLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="text-xs text-stone-400 underline-offset-2 hover:text-stone-600 hover:underline"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                            <p className="text-xs text-stone-400">
                                {DISCLAIMER_TEXTS.footer}{" "}
                                <Link href="/disclaimer" className="underline underline-offset-2 transition hover:text-stone-600">
                                    Meer →
                                </Link>
                            </p>
                            <p className="text-xs text-stone-400">
                                © 2026 PerfectSupplement. Deze site bevat affiliate-links —{" "}
                                <Link href="/affiliate-disclosure" className="underline underline-offset-2 transition hover:text-stone-600">
                                    lees meer
                                </Link>
                                .
                            </p>
                        </div>
                    </div>

                    <div id={LEEFSTIJLCHECK_FOOTER_SLOT_ID} className="floating-cta-footer-slot" />
                </div>
            </Container>
        </footer>
    );
}
