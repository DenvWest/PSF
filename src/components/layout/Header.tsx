"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const mainLinks = [
    { href: "/intake", label: "Leefstijlcheck" },
    { href: "/supplementen", label: "Supplementen" },
    { href: "/blog", label: "Blog" },
];

const menuLinks = [
    { href: "/", label: "Home" },
    { href: "/intake", label: "Leefstijlcheck" },
    { href: "/supplementen", label: "Supplementen" },
    { href: "/methodologie", label: "Methodologie" },
    { href: "/blog", label: "Blog" },
];

const infoLinks = [
    { href: "/contact", label: "Contact" },
    { href: "/privacy", label: "Privacy" },
    { href: "/disclaimer", label: "Disclaimer" },
];

const searchItems = [
    { href: "/blog", label: "Blog", group: "Direct naar" },
    { href: "/supplementen", label: "Supplementen", group: "Direct naar" },
    { href: "/intake", label: "Leefstijlcheck", group: "Direct naar" },
    { href: "/methodologie", label: "Methodologie", group: "Direct naar" },
    { href: "/omega-3-vergelijken", label: "Omega-3 vergelijken", group: "Vergelijkingen" },
    { href: "/beste-omega-3-supplement", label: "Beste omega-3 supplement", group: "Vergelijkingen" },
    { href: "/beste-magnesium", label: "Beste magnesium supplement", group: "Vergelijkingen" },
    { href: "/beste-ashwagandha", label: "Beste ashwagandha supplement", group: "Vergelijkingen" },
    { href: "/magnesium-vergelijken", label: "Magnesium vergelijken", group: "Vergelijkingen" },
    { href: "/beste-omega-3-supplement", label: "Beste omega-3 supplement", group: "Keuzehulpen" },
    { href: "/beste-magnesium", label: "Beste magnesium supplement", group: "Keuzehulpen" },
    { href: "/beste-ashwagandha", label: "Beste ashwagandha supplement", group: "Keuzehulpen" },
    { href: "/wat-is-omega-3", label: "Wat is omega-3?", group: "Ingrediënten" },
    { href: "/waar-let-je-op-bij-omega-3", label: "Waar let je op bij omega-3?", group: "Ingrediënten" },
];

export default function Header() {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [menuOpen, setMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);

    const closeSearch = () => {
        setSearchOpen(false);
        setQuery("");
        setActiveIndex(0);
    };

    useEffect(() => {
        if (!searchOpen) return;

        const startY = window.scrollY;
        const threshold = 8;

        const onScroll = () => {
            if (Math.abs(window.scrollY - startY) > threshold) {
                closeSearch();
            }
        };

        window.addEventListener("scroll", onScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", onScroll);
        };
    }, [searchOpen]);

    const filteredResults = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        return searchItems.filter((item) =>
            item.label.toLowerCase().includes(q)
        );
    }, [query]);

    const directItems = searchItems.filter((item) => item.group === "Direct naar");
    const comparisonItems = searchItems.filter((item) => item.group === "Vergelijkingen");

    const openSearch = () => {
        setMenuOpen(false);
        setSearchOpen(true);
        setQuery("");
        setActiveIndex(0);
    };

    const handleSearchSubmit = () => {
        if (!query.trim()) return;
        if (filteredResults.length === 0) return;

        const target = filteredResults[activeIndex] ?? filteredResults[0];
        closeSearch();
        router.push(target.href);
    };

    return (
        <>
            <header
                className={`sticky top-0 z-50 border-b border-stone-200/60 backdrop-blur ${searchOpen ? "bg-white/95" : "bg-[var(--ps-bg)]/90"
                    }`}
            >
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
                    <div className="flex items-center gap-10">
                        <Link
                            href="/"
                            className="flex items-center gap-3"
                        >
                            <Image
                                src="/icon.png"
                                alt="PerfectSupplement logo"
                                width={34}
                                height={34}
                                className="h-8 w-8 rounded-lg md:h-[34px] md:w-[34px]"
                                priority
                            />
                            <span className="text-lg font-semibold tracking-tight text-stone-900">
                                Perfect<span className="text-stone-800">Supplement</span>
                            </span>
                        </Link>

                        <nav className="hidden items-center gap-7 md:flex">
                            {mainLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-sm font-medium text-stone-500 transition hover:text-stone-900"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            aria-label="Open zoekfunctie"
                            onClick={openSearch}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-stone-500 transition hover:border-stone-200 hover:bg-stone-50 hover:text-stone-900"
                        >
                            <svg
                                aria-hidden="true"
                                viewBox="0 0 24 24"
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="11" cy="11" r="7" />
                                <path d="m20 20-3.5-3.5" />
                            </svg>
                        </button>

                        <button
                            type="button"
                            aria-label="Open menu"
                            onClick={() => setMenuOpen(true)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-stone-500 transition hover:border-stone-200 hover:bg-stone-50 hover:text-stone-900"
                        >
                            <svg
                                aria-hidden="true"
                                viewBox="0 0 24 24"
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            >
                                <path d="M4 7h16" />
                                <path d="M4 12h16" />
                                <path d="M4 17h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            <div
                className={`fixed inset-x-0 bottom-0 top-[72px] z-40 transition ${searchOpen ? "pointer-events-auto" : "pointer-events-none"
                    }`}
            >
                <div
                    onClick={closeSearch}
                    className={`absolute inset-0 bg-stone-950/12 backdrop-blur-md transition-opacity duration-300 ${searchOpen ? "opacity-100" : "opacity-0"
                        }`}
                />

                <div
                    className={`absolute inset-x-0 top-0 border-b border-stone-200 bg-white/90 backdrop-blur-xl transition-all duration-300 ${searchOpen ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0"
                        }`}
                >
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="flex min-h-[72px] items-center gap-4">
                            <svg
                                aria-hidden="true"
                                viewBox="0 0 24 24"
                                className="h-5 w-5 shrink-0 text-stone-400"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="11" cy="11" r="7" />
                                <path d="m20 20-3.5-3.5" />
                            </svg>

                            <label htmlFor="apple-search" className="sr-only">
                                Zoek in de site
                            </label>

                            <input
                                ref={inputRef}
                                id="apple-search"
                                type="text"
                                value={query}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setQuery(value);
                                    setActiveIndex(0);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Escape") {
                                        e.preventDefault();
                                        closeSearch();
                                    }

                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleSearchSubmit();
                                    }

                                    if (e.key === "ArrowDown" && filteredResults.length > 0) {
                                        e.preventDefault();
                                        setActiveIndex((prev) =>
                                            prev + 1 >= filteredResults.length ? 0 : prev + 1
                                        );
                                    }

                                    if (e.key === "ArrowUp" && filteredResults.length > 0) {
                                        e.preventDefault();
                                        setActiveIndex((prev) =>
                                            prev - 1 < 0 ? filteredResults.length - 1 : prev - 1
                                        );
                                    }
                                }}
                                placeholder="Zoek in de site"
                                className="w-full border-0 bg-transparent py-5 text-[2rem] font-semibold tracking-tight text-stone-900 outline-none placeholder:text-stone-400 md:text-[2.2rem]"
                            />

                            <button
                                type="button"
                                aria-label="Sluit zoeken"
                                onClick={closeSearch}
                                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-transparent text-stone-500 transition hover:border-stone-200 hover:bg-stone-50 hover:text-stone-900"
                            >
                                <svg
                                    aria-hidden="true"
                                    viewBox="0 0 24 24"
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                >
                                    <path d="M6 6l12 12" />
                                    <path d="M18 6 6 18" />
                                </svg>
                            </button>
                        </div>

                        <div className="pb-8">
                            {!query && (
                                <div className="grid gap-10 md:grid-cols-2">
                                    <div>
                                        <p className="mb-4 text-sm font-medium text-stone-400">
                                            Direct naar
                                        </p>
                                        <div className="space-y-3">
                                            {directItems.map((item) => (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    onClick={closeSearch}
                                                    className="block text-base text-stone-600 transition hover:text-stone-900"
                                                >
                                                    → {item.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="mb-4 text-sm font-medium text-stone-400">
                                            Populaire vergelijkingen
                                        </p>
                                        <div className="space-y-3">
                                            {comparisonItems.map((item) => (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    onClick={closeSearch}
                                                    className="block text-base text-stone-600 transition hover:text-stone-900"
                                                >
                                                    → {item.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {query && (
                                <div>
                                    <p className="mb-4 text-sm font-medium text-stone-400">
                                        Resultaten
                                    </p>

                                    {filteredResults.length > 0 ? (
                                        <>
                                            <p className="mb-4 text-sm text-stone-400">
                                                Gebruik ↑ ↓ om te kiezen en Enter om te openen.
                                            </p>

                                            <div className="space-y-2">
                                                {filteredResults.map((item, index) => {
                                                    const isActive = index === activeIndex;

                                                    return (
                                                        <button
                                                            key={item.href}
                                                            type="button"
                                                            onMouseEnter={() => setActiveIndex(index)}
                                                            onClick={() => {
                                                                closeSearch();
                                                                router.push(item.href);
                                                            }}
                                                            className={`block w-full rounded-2xl border px-4 py-4 text-left transition ${isActive
                                                                ? "border-stone-300 bg-stone-50"
                                                                : "border-transparent bg-transparent hover:border-stone-200 hover:bg-stone-50"
                                                                }`}
                                                        >
                                                            <span className="block font-medium text-stone-900">
                                                                {item.label}
                                                            </span>
                                                            <span className="mt-1 block text-sm text-stone-500">
                                                                {item.group}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-base text-stone-500">
                                            Geen resultaten gevonden.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div
                className={`fixed inset-0 z-50 transition ${menuOpen ? "pointer-events-auto" : "pointer-events-none"
                    }`}
            >
                <div
                    onClick={() => setMenuOpen(false)}
                    className={`absolute inset-0 bg-black/20 backdrop-blur-[1px] transition-opacity duration-300 ${menuOpen ? "opacity-100" : "opacity-0"
                        }`}
                />

                <aside
                    className={`absolute right-0 top-0 h-full w-full max-w-sm border-l border-stone-200 bg-white shadow-2xl transition-transform duration-300 ease-out ${menuOpen ? "translate-x-0" : "translate-x-full"
                        }`}
                >
                    <div className="flex items-center justify-between border-b border-stone-200 px-6 py-5">
                        <span className="text-sm font-semibold text-stone-900">Menu</span>
                        <button
                            type="button"
                            aria-label="Sluit menu"
                            onClick={() => setMenuOpen(false)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-stone-500 transition hover:border-stone-200 hover:bg-stone-50 hover:text-stone-900"
                        >
                            <svg
                                aria-hidden="true"
                                viewBox="0 0 24 24"
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            >
                                <path d="M6 6l12 12" />
                                <path d="M18 6 6 18" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex h-[calc(100%-81px)] flex-col justify-between overflow-y-auto px-6 py-6">
                        <nav className="space-y-1">
                            {menuLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMenuOpen(false)}
                                    className="block rounded-2xl px-4 py-3 text-base font-medium text-stone-800 transition hover:bg-stone-50 hover:text-stone-900"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="mt-10 border-t border-stone-200 pt-6">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">
                                Info
                            </p>
                            <div className="space-y-1">
                                {infoLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setMenuOpen(false)}
                                        className="block rounded-2xl px-4 py-3 text-sm font-medium text-stone-500 transition hover:bg-stone-50 hover:text-stone-900"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </>
    );
}
