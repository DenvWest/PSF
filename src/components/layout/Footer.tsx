import Image from "next/image";
import Link from "next/link";
import Container from "@/components/layout/Container";
import { DISCLAIMER_TEXTS } from "@/lib/disclaimer-text";

const exploreLinks = [
    { href: "/intake", label: "Leefstijlcheck" },
    { href: "/profiel", label: "Herken je patroon?" },
    { href: "/voeding-na-40", label: "Voeding na 40" },
    { href: "/beweging-na-40", label: "Beweging na 40" },
    { href: "/supplementen", label: "Supplementen" },
    { href: "/gidsen", label: "Gidsen na 40" },
    { href: "/kennisbank", label: "Kennisbank" },
    { href: "/blog", label: "Blog" },
];

const profielLinks = [
    { href: "/profiel/onrustige-slaper", label: "Onrustige Slaper" },
    { href: "/profiel/stressdrager", label: "Stressdrager" },
    { href: "/profiel/lage-batterij", label: "Lage Batterij" },
    { href: "/profiel/overtrainer", label: "Overtrainer" },
];

const vergelijkingLinks = [
    { href: "/beste/magnesium", label: "Beste magnesium" },
    { href: "/beste/omega-3-supplement", label: "Beste omega-3" },
    { href: "/beste/ashwagandha", label: "Beste ashwagandha" },
    { href: "/supplementen/melatonine", label: "Melatonine (informatief)" },
];

const infoLinks = [
    { href: "/methodologie", label: "Methodologie" },
    { href: "/over-ons", label: "Over ons" },
    { href: "/contact", label: "Contact" },
];

export default function Footer() {
    return (
        <footer className="border-t border-stone-200 bg-[var(--ps-bg)]">
            <Container>
                <div className="grid gap-10 py-14 md:grid-cols-2 md:gap-12 lg:grid-cols-5 lg:gap-12 lg:py-16">
                    <div className="md:col-span-1">
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
                        <p className="mt-4 text-sm leading-relaxed text-stone-500">
                            De rustige gids voor mannen 40+: eerst grip op slaap, stress en
                            herstel — daarna pas supplementen. Gratis Leefstijlcheck,
                            onafhankelijk en zonder sponsors.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                            Verkennen
                        </h4>
                        <ul className="mt-4 space-y-2.5">
                            {exploreLinks.map((link) => (
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
                            Profielen
                        </h4>
                        <ul className="mt-4 space-y-2.5">
                            {profielLinks.map((link) => (
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
                            Vergelijkingen
                        </h4>
                        <ul className="mt-4 space-y-2.5">
                            <li>
                                <Link
                                    href="/supplementen"
                                    className="text-sm text-stone-600 transition hover:text-stone-900"
                                >
                                    Alle vergelijkingen{" "}
                                    <span aria-hidden="true">→</span>
                                </Link>
                            </li>
                            {vergelijkingLinks.map((link) => (
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
                            Info
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
                        <Link href="/privacy" className="text-xs text-stone-400 underline-offset-2 hover:text-stone-600 hover:underline">
                            Privacy
                        </Link>
                        <Link href="/disclaimer" className="text-xs text-stone-400 underline-offset-2 hover:text-stone-600 hover:underline">
                            Disclaimer
                        </Link>
                        <Link href="/medische-disclaimer" className="text-xs text-stone-400 underline-offset-2 hover:text-stone-600 hover:underline">
                            Medische disclaimer
                        </Link>
                        <Link href="/affiliate-disclosure" className="text-xs text-stone-400 underline-offset-2 hover:text-stone-600 hover:underline">
                            Affiliate disclosure
                        </Link>
                        <Link href="/faqs" className="text-xs text-stone-400 underline-offset-2 hover:text-stone-600 hover:underline">
                            FAQ
                        </Link>
                    </div>
                    <p className="text-xs text-stone-400">
                        {DISCLAIMER_TEXTS.footer}{" "}
                        <Link href="/disclaimer" className="underline underline-offset-2 transition hover:text-stone-600">
                            Meer →
                        </Link>
                    </p>
                    <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                        <p className="text-xs text-stone-400">
                            © 2026 PerfectSupplement. Alle rechten voorbehouden.
                        </p>
                        <p className="text-xs text-stone-400">
                            Deze site bevat affiliate-links. Wij ontvangen mogelijk een vergoeding bij aankoop,{" "}
                            <Link href="/affiliate-disclosure" className="underline underline-offset-2 transition hover:text-stone-600">
                                lees meer
                            </Link>
                            .
                        </p>
                    </div>
                </div>
            </Container>
        </footer>
    );
}
