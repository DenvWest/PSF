"use client";

import { useMemo, useState } from "react";
import Container from "@/components/layout/Container";
import Link from "next/link";

// ─── Types ──────────────────────────────────────────────────────────────────

type FilterId = "alles" | "ingredienten" | "doelen" | "vergelijkingen";

type HubItem = {
    id: string;
    title: string;
    eyebrow: string;
    benefit: string;
    icon: string;
    href: string;
    secondaryHref?: string;
    secondaryLabel?: string;
    group: "ingredienten" | "doelen" | "vergelijkingen";
    /** hero/secondary appear in the featured strip; default goes to the grid */
    priority: "hero" | "secondary" | "default";
};

// ─── Data ────────────────────────────────────────────────────────────────────

const FEATURED: readonly HubItem[] = [
    {
        id: "omega-3",
        title: "Omega-3",
        eyebrow: "Ingrediënt",
        benefit:
            "Beste keuze voor de meeste mensen. Ondersteunt hart, hersenen en ontstekingsbalans.",
        icon: "🧠",
        href: "/omega-3-vergelijken",
        secondaryHref: "/beste-omega-3-supplement",
        secondaryLabel: "Bekijk topkeuzes",
        group: "ingredienten",
        priority: "hero",
    },
    {
        id: "magnesium",
        title: "Magnesium",
        eyebrow: "Ingrediënt",
        benefit:
            "Populair voor spieren, zenuwstelsel en rustiger slapen. Beschikbaar in meerdere vormen.",
        icon: "⚡",
        href: "/magnesium-vergelijken",
        secondaryHref: "/beste-magnesium",
        secondaryLabel: "Bekijk topkeuzes",
        group: "ingredienten",
        priority: "secondary",
    },
];

const GRID_ITEMS: readonly HubItem[] = [
    {
        id: "slaap",
        title: "Slaap",
        eyebrow: "Doel",
        benefit: "Rustiger naar bed en een betere nachtrust",
        icon: "🌙",
        href: "/slaap-supplement-vergelijken",
        secondaryHref: "/blog",
        secondaryLabel: "Meer lezen",
        group: "doelen",
        priority: "default",
    },
    {
        id: "energie",
        title: "Energie",
        eyebrow: "Doel",
        benefit: "Meer veerkracht en helderheid overdag",
        icon: "🔋",
        href: "/supplement-kiezen-waar-op-letten",
        secondaryHref: "/blog",
        secondaryLabel: "Blog",
        group: "doelen",
        priority: "default",
    },
    {
        id: "focus",
        title: "Focus",
        eyebrow: "Doel",
        benefit: "Concentratie en mentale scherpte",
        icon: "🎯",
        href: "/supplement-kiezen-waar-op-letten",
        secondaryHref: "/blog",
        secondaryLabel: "Blog",
        group: "doelen",
        priority: "default",
    },
    {
        id: "beste-omega-3",
        title: "Beste Omega-3",
        eyebrow: "Vergelijking",
        benefit: "Topkeuzes met scores en actuele prijzen",
        icon: "⭐",
        href: "/beste-omega-3-supplement",
        secondaryHref: "/omega-3-vergelijken",
        secondaryLabel: "Alle producten",
        group: "vergelijkingen",
        priority: "default",
    },
    {
        id: "beste-magnesium",
        title: "Beste Magnesium",
        eyebrow: "Vergelijking",
        benefit: "Vormen, dosering en prijs per dag vergeleken",
        icon: "✓",
        href: "/beste-magnesium",
        secondaryHref: "/magnesium-vergelijken",
        secondaryLabel: "Alle producten",
        group: "vergelijkingen",
        priority: "default",
    },
];

const ALL_FOR_FILTER: Record<FilterId, readonly HubItem[]> = {
    alles: GRID_ITEMS,
    ingredienten: [...FEATURED, ...GRID_ITEMS].filter(
        (i) => i.group === "ingredienten",
    ),
    doelen: GRID_ITEMS.filter((i) => i.group === "doelen"),
    vergelijkingen: GRID_ITEMS.filter((i) => i.group === "vergelijkingen"),
};

// ─── Filters ─────────────────────────────────────────────────────────────────

const FILTERS: Array<{ id: FilterId; label: string }> = [
    { id: "alles", label: "Alles" },
    { id: "ingredienten", label: "Ingrediënten" },
    { id: "doelen", label: "Doelen" },
    { id: "vergelijkingen", label: "Vergelijkingen" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SupplementenPage() {
    const [active, setActive] = useState<FilterId>("alles");

    const gridItems = useMemo(() => ALL_FOR_FILTER[active], [active]);

    return (
        <div className="bg-stone-50/40 pb-24">
            {/* ── Page header ─────────────────────────────────────────── */}
            <div className="border-b border-stone-200/80 bg-white">
                <Container className="py-12 md:py-16">
                    <div className="max-w-2xl">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
                            Supplementen
                        </p>
                        <h1 className="text-4xl font-semibold tracking-tight text-stone-900 md:text-5xl">
                            Kies een categorie
                        </h1>
                        <p className="mt-5 text-base leading-7 text-stone-600 md:text-lg">
                            Ingrediënten, doelen en vergelijkingen op één plek.
                            Start bij onze meest gekozen categorieën of filter
                            op wat bij jou past.
                        </p>
                    </div>
                </Container>
            </div>

            <Container className="pt-10 md:pt-14">
                {/* ── Featured tiles ────────────────────────────────────── */}
                <section aria-label="Aanbevolen categorieën">
                    <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                        Begin hier
                    </p>

                    <div className="grid gap-4 md:grid-cols-[1.45fr_1fr]">
                        {/* Omega-3 — hero tile */}
                        <Link
                            href="/omega-3-vergelijken"
                            className="group relative flex min-h-[240px] flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-500 p-7 shadow-lg shadow-emerald-900/20 ring-1 ring-emerald-500/30 transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-900/25 md:min-h-[280px] md:p-8"
                            aria-label="Omega-3 vergelijken — beste start"
                        >
                            {/* subtle background pattern */}
                            <div
                                className="pointer-events-none absolute inset-0 opacity-[0.06]"
                                aria-hidden
                                style={{
                                    backgroundImage:
                                        "radial-gradient(circle at 80% 20%, white 0%, transparent 60%)",
                                }}
                            />

                            <div className="relative flex flex-1 flex-col">
                                <div className="flex items-start justify-between gap-3">
                                    <span
                                        className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-2xl ring-1 ring-white/20 backdrop-blur-[2px] transition group-hover:bg-white/20"
                                        aria-hidden
                                    >
                                        🧠
                                    </span>
                                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/20">
                                        🏆 Beste keuze
                                    </span>
                                </div>

                                <div className="mt-auto">
                                    <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-emerald-200">
                                        Ingrediënt
                                    </p>
                                    <h2 className="mt-1 text-2xl font-bold tracking-tight text-white md:text-3xl">
                                        Omega-3
                                    </h2>
                                    <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-emerald-100">
                                        Beste keuze voor de meeste mensen.
                                        Ondersteunt hart, hersenen en
                                        ontstekingsbalans.
                                    </p>

                                    <div className="mt-6 flex flex-wrap items-center gap-3">
                                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-emerald-900 shadow-sm transition group-hover:bg-emerald-50">
                                            Begin met Omega-3 →
                                        </span>
                                        <span className="text-sm font-medium text-emerald-200 transition group-hover:text-white">
                                            Topkeuzes →
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* Magnesium — secondary tile */}
                        <Link
                            href="/magnesium-vergelijken"
                            className="group relative flex min-h-[240px] flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-white p-7 shadow-sm ring-1 ring-stone-200/50 transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md md:min-h-[280px] md:p-8"
                            aria-label="Magnesium vergelijken — populair"
                        >
                            <div className="flex flex-1 flex-col">
                                <div className="flex items-start justify-between gap-3">
                                    <span
                                        className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100 text-2xl ring-1 ring-stone-200/80 transition group-hover:bg-stone-200/70"
                                        aria-hidden
                                    >
                                        ⚡
                                    </span>
                                    <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold text-stone-700">
                                        ⭐ Populair
                                    </span>
                                </div>

                                <div className="mt-auto">
                                    <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-stone-500">
                                        Ingrediënt
                                    </p>
                                    <h2 className="mt-1 text-2xl font-bold tracking-tight text-stone-900 md:text-3xl">
                                        Magnesium
                                    </h2>
                                    <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-stone-600">
                                        Populair voor spieren, zenuwstelsel en
                                        rustiger slapen. Meerdere vormen
                                        vergeleken.
                                    </p>

                                    <div className="mt-6 flex flex-wrap items-center gap-3">
                                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition group-hover:bg-stone-800">
                                            Bekijk Magnesium →
                                        </span>
                                        <span className="text-sm font-medium text-stone-500 transition group-hover:text-stone-800">
                                            Topkeuzes →
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                </section>

                {/* ── Browse section ──────────────────────────────────── */}
                <section className="mt-14" aria-label="Verken categorieën">
                    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                            Verken categorieën
                        </p>

                        <div
                            className="flex flex-wrap gap-2"
                            role="tablist"
                            aria-label="Filter op type"
                        >
                            {FILTERS.map((f) => {
                                const isActive = active === f.id;
                                return (
                                    <button
                                        key={f.id}
                                        type="button"
                                        role="tab"
                                        aria-selected={isActive}
                                        id={`tab-${f.id}`}
                                        onClick={() => setActive(f.id)}
                                        className={`rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400 ${
                                            isActive
                                                ? "border-stone-900 bg-stone-900 text-white shadow-sm"
                                                : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50 hover:text-stone-900"
                                        }`}
                                    >
                                        {f.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* card grid */}
                    <ul
                        className="grid list-none gap-4 p-0 sm:grid-cols-2 xl:grid-cols-3"
                        aria-live="polite"
                        aria-labelledby={`tab-${active}`}
                    >
                        {gridItems.map((item) => (
                            <li key={item.id} className="list-none">
                                <article className="group flex h-full flex-col rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md">
                                    <div className="flex items-start justify-between gap-3">
                                        <span
                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100/90 text-lg ring-1 ring-stone-200/70 transition group-hover:bg-stone-200/60"
                                            aria-hidden
                                        >
                                            {item.icon}
                                        </span>
                                        <span className="rounded-full border border-stone-200 bg-stone-50/80 px-2.5 py-1 text-[0.6875rem] font-medium text-stone-600">
                                            {item.eyebrow}
                                        </span>
                                    </div>

                                    <h2 className="mt-4 text-lg font-semibold tracking-tight text-stone-900">
                                        {item.title}
                                    </h2>
                                    <p className="mt-2 text-sm leading-relaxed text-stone-600">
                                        {item.benefit}
                                    </p>

                                    <div className="mt-auto border-t border-stone-100 pt-5">
                                        <Link
                                            href={item.href}
                                            className="inline-flex w-full items-center justify-center rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400"
                                        >
                                            Bekijk {item.title} →
                                        </Link>
                                        {item.secondaryHref &&
                                        item.secondaryLabel ? (
                                            <Link
                                                href={item.secondaryHref}
                                                className="mt-3 block text-center text-sm font-medium text-stone-500 transition hover:text-stone-900"
                                            >
                                                {item.secondaryLabel}
                                            </Link>
                                        ) : null}
                                    </div>
                                </article>
                            </li>
                        ))}
                    </ul>

                    {gridItems.length === 0 ? (
                        <p className="mt-4 rounded-2xl border border-dashed border-stone-200 bg-stone-50/60 px-5 py-10 text-center text-sm text-stone-500">
                            Geen categorieën in dit filter.
                        </p>
                    ) : null}
                </section>

                {/* ── Editorial footer ────────────────────────────────── */}
                <section className="mt-16 grid gap-4 md:grid-cols-[1.1fr_0.9fr] md:items-start">
                    <div className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                            Werkwijze
                        </p>
                        <h2 className="mt-2 text-lg font-semibold tracking-tight text-stone-900 md:text-xl">
                            Rustig kiezen, zonder webshop-drukte
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-stone-600">
                            Geen eindeloze productlijsten. Je ziet eerst wat je
                            zoekt, klikt door naar vergelijkingen of gidsen, en
                            maakt daarna een weloverwogen keuze.{" "}
                            <Link
                                href="/methodologie"
                                className="font-medium text-stone-800 underline-offset-4 hover:underline"
                            >
                                Lees hoe wij beoordelen
                            </Link>
                            .
                        </p>
                    </div>

                    <aside className="rounded-2xl border border-stone-200 bg-white p-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                            Snel verder
                        </p>
                        <div className="mt-4 space-y-2.5">
                            <Link
                                href="/blog"
                                className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50/80 px-4 py-3.5 text-sm font-medium text-stone-900 transition hover:border-stone-200 hover:bg-white"
                            >
                                Naar het blog
                                <span className="text-stone-400" aria-hidden>
                                    →
                                </span>
                            </Link>
                            <Link
                                href="/methodologie"
                                className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50/80 px-4 py-3.5 text-sm font-medium text-stone-900 transition hover:border-stone-200 hover:bg-white"
                            >
                                Methodologie
                                <span className="text-stone-400" aria-hidden>
                                    →
                                </span>
                            </Link>
                            <Link
                                href="/supplement-kiezen-waar-op-letten"
                                className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50/80 px-4 py-3.5 text-sm font-medium text-stone-900 transition hover:border-stone-200 hover:bg-white"
                            >
                                Supplement kiezen
                                <span className="text-stone-400" aria-hidden>
                                    →
                                </span>
                            </Link>
                        </div>
                    </aside>
                </section>
            </Container>
        </div>
    );
}
