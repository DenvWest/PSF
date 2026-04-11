import Image from "next/image";
import Link from "next/link";
import Container from "@/components/layout/Container";

const exploreLinks = [
    { href: "/intake", label: "Leefstijlcheck" },
    { href: "/blog", label: "Blog" },
    { href: "/supplementen", label: "Supplementen" },
];

const infoLinks = [
    { href: "/methodologie", label: "Methodologie" },
    { href: "/faqs", label: "FAQ's" },
    { href: "/privacy", label: "Privacy" },
    { href: "/disclaimer", label: "Disclaimer" },
    { href: "/affiliate-disclosure", label: "Affiliate disclosure" },
    { href: "/contact", label: "Contact" },
];

export default function Footer() {
    return (
        <footer className="border-t border-stone-200 bg-[var(--ps-bg)]">
            <Container>
                <div className="grid gap-10 py-14 md:grid-cols-3 md:gap-16 lg:py-16">
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
                            Onafhankelijk platform voor mannen 40+ over supplementen,
                            leefstijl en herstel. Vergelijkingen, persoonlijke intake
                            en advies op basis van bewijs.
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

                <div className="flex flex-col gap-3 border-t border-stone-100 py-6 md:flex-row md:items-center md:justify-between">
                    <p className="text-xs text-stone-400">
                        © 2026 Perfect Supplement. Alle rechten voorbehouden.
                    </p>
                    <p className="text-xs text-stone-400">
                        Deze site bevat affiliate-links. Wij ontvangen mogelijk een vergoeding bij aankoop,{" "}
                        <Link href="/affiliate-disclosure" className="underline underline-offset-2 transition hover:text-stone-600">
                            lees meer
                        </Link>
                        .
                    </p>
                </div>
            </Container>
        </footer>
    );
}
