"use client";

import { useState } from "react";
import Link from "next/link";

type Categorie = "Slaap" | "Stress" | "Energie" | "Herstel";

const aanbevelingen: Record<
    Categorie,
    { supplement: string; reden: string; gids: string; vergelijking: string }
> = {
    Slaap: {
        supplement: "Magnesium Glycinaat",
        reden: "Magnesium ondersteunt ontspanning van het zenuwstelsel en verbetert slaapkwaliteit — met name de glycinaatvorm wordt het best opgenomen.",
        gids: "/supplementen/magnesium",
        vergelijking: "/beste-magnesium",
    },
    Stress: {
        supplement: "Ashwagandha",
        reden: "Ashwagandha verlaagt cortisolwaarden aantoonbaar. Effectief bij chronische stress en mentale vermoeidheid.",
        gids: "/supplementen/ashwagandha",
        vergelijking: "/beste-ashwagandha",
    },
    Energie: {
        supplement: "Vitamine D3 + K2",
        reden: "Bij mannen 40+ is een tekort aan vitamine D veelvoorkomend en direct gekoppeld aan vermoeidheid en energieproblemen.",
        gids: "/supplementen/vitamine-d",
        vergelijking: "/beste-vitamine-d",
    },
    Herstel: {
        supplement: "Omega-3 (EPA/DHA)",
        reden: "Omega-3 dempt laaggradige ontstekingen die herstel vertragen, en ondersteunt spierherstel na inspanning.",
        gids: "/supplementen/omega-3",
        vergelijking: "/beste-omega-3-supplement",
    },
};

const categorieen: Categorie[] = ["Slaap", "Stress", "Energie", "Herstel"];

export default function SupplementKeuzeHulp() {
    const [geselecteerd, setGeselecteerd] = useState<Categorie | null>(null);

    const aanbeveling = geselecteerd ? aanbevelingen[geselecteerd] : null;

    return (
        <section
            className="border-b border-stone-200/60 bg-white py-16 md:py-20"
            aria-label="Keuzehulp"
        >
            <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex items-center gap-3 md:mb-10">
                    <div className="h-px w-6 bg-stone-400" aria-hidden="true" />
                    <p className="text-[0.625rem] font-medium uppercase tracking-[0.3em] text-stone-500">
                        Keuzehulp
                    </p>
                </div>

                <p className="font-display text-xl font-semibold tracking-tight text-stone-900 md:text-2xl">
                    Wat speelt er bij jou?
                </p>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-stone-500">
                    Kies een symptoom — we laten je zien welk supplement het meest relevant is.
                </p>

                {/* Buttons */}
                <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {categorieen.map((cat) => {
                        const isSelected = geselecteerd === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() =>
                                    setGeselecteerd(isSelected ? null : cat)
                                }
                                aria-pressed={isSelected}
                                className={`rounded-xl border py-3 px-6 text-sm font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
                                    isSelected
                                        ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                                        : "border-emerald-600/40 bg-white text-stone-700 hover:border-emerald-600 hover:bg-emerald-50"
                                }`}
                            >
                                {cat}
                            </button>
                        );
                    })}
                </div>

                {/* Recommendation card */}
                <div
                    className={`mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 transition-all duration-300 ease-out ${
                        aanbeveling
                            ? "max-h-[400px] opacity-100 translate-y-0"
                            : "max-h-0 opacity-0 translate-y-2 pointer-events-none"
                    }`}
                    aria-live="polite"
                >
                    {aanbeveling && (
                        <div className="p-6 md:p-8">
                            <p className="mb-1 text-[0.625rem] font-medium uppercase tracking-[0.26em] text-stone-400">
                                Aanbeveling
                            </p>
                            <h2 className="font-display text-2xl font-semibold tracking-tight text-stone-900 md:text-3xl">
                                {aanbeveling.supplement}
                            </h2>
                            <p className="mt-3 max-w-prose text-[0.9375rem] leading-relaxed text-stone-600">
                                {aanbeveling.reden}
                            </p>
                            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                                <Link
                                    href={aanbeveling.vergelijking}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-emerald-700"
                                >
                                    Bekijk beste opties
                                    <span aria-hidden="true">→</span>
                                </Link>
                                <Link
                                    href={aanbeveling.gids}
                                    className="text-sm font-medium text-stone-600 underline decoration-stone-300 underline-offset-4 transition hover:text-stone-900 hover:decoration-stone-500"
                                >
                                    Lees de volledige gids
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
