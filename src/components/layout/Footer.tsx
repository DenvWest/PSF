import Image from "next/image";
import Link from "next/link";

const exploreLinks = [
    { href: "/kennisbank", label: "Kennisbank" },
    { href: "/supplementen", label: "Supplementen" },
    { href: "/methodologie", label: "Methodologie" },
];

const infoLinks = [
    { href: "/privacy", label: "Privacy" },
    { href: "/disclaimer", label: "Disclaimer" },
    { href: "/affiliate-disclosure", label: "Affiliate disclosure" },
    { href: "/contact", label: "Contact" },
];

export default function Footer() {
    return (
        <footer className="mt-24 border-t border-slate-200 bg-white">
            <div className="mx-auto max-w-6xl px-6 md:px-8">
                <div className="grid gap-10 py-12 md:grid-cols-3 md:gap-12 md:py-14">
                    <div className="md:col-span-1">
                        <Link href="/" className="inline-flex items-center gap-2.5">
                            <Image
                                src="/icon.png"
                                alt="PerfectSupplement logo"
                                width={28}
                                height={28}
                                className="h-7 w-7 rounded-lg"
                            />
                            <span className="text-base font-semibold tracking-tight text-slate-900">
                                Perfect<span className="text-green-600">Supplement</span>
                            </span>
                        </Link>
                        <p className="mt-4 text-sm leading-relaxed text-slate-500">
                            Een onafhankelijke kennisbank voor supplementen. Gidsen,
                            vergelijkingen en keuzes op basis van bewijs.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                            Verkennen
                        </h4>
                        <ul className="mt-4 space-y-2.5">
                            {exploreLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-slate-600 transition hover:text-slate-900"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                            Info
                        </h4>
                        <ul className="mt-4 space-y-2.5">
                            {infoLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-slate-600 transition hover:text-slate-900"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-100 py-5 md:flex-row md:items-center md:justify-between">
                    <p className="text-xs text-slate-400">
                        © 2026 Perfect Supplement. Alle rechten voorbehouden.
                    </p>
                    <p className="text-xs text-slate-400">
                        Deze site bevat affiliate-links. Wij ontvangen mogelijk een vergoeding bij aankoop,{" "}
                        <Link href="/affiliate-disclosure" className="underline underline-offset-2 transition hover:text-slate-600">
                            lees meer
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </footer>
    );
}
