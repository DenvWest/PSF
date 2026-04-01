"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export type FaqItem = {
  a: string;
  link?: {
    href: string;
    label: string;
  };
  q: string;
};

type FaqSearchProps = {
  items: FaqItem[];
};

function normalize(value: string): string {
  return value.toLocaleLowerCase("nl-NL").trim();
}

export default function FaqSearch({ items }: FaqSearchProps) {
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => {
    const normalizedQuery = normalize(query);

    if (!normalizedQuery) {
      return items;
    }

    return items.filter((item) => {
      const haystack = normalize(
        `${item.q} ${item.a} ${item.link?.label ?? ""}`,
      );

      return haystack.includes(normalizedQuery);
    });
  }, [items, query]);

  return (
    <div>
      <div className="rounded-2xl border border-stone-200 bg-white p-3 shadow-sm ring-1 ring-stone-900/[0.04]">
        <label htmlFor="faq-search" className="sr-only">
          Zoek in veelgestelde vragen
        </label>
        <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5 shrink-0 text-stone-400"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 104.473 8.7l2.664 2.663a.75.75 0 101.06-1.06l-2.663-2.664A5.5 5.5 0 009 3.5zM5 9a4 4 0 118 0 4 4 0 01-8 0z"
              clipRule="evenodd"
            />
          </svg>
          <input
            id="faq-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Zoek in veelgestelde vragen"
            className="w-full border-0 bg-transparent text-sm text-stone-700 outline-none placeholder:text-stone-400"
          />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <details
              key={item.q}
              className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm ring-1 ring-stone-900/[0.04] transition open:shadow-md open:ring-stone-900/[0.06]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold tracking-tight text-stone-900 md:px-6 md:py-5 [&::-webkit-details-marker]:hidden">
                <span>{item.q}</span>
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-stone-500 transition group-open:rotate-180"
                  aria-hidden
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </summary>
              <div className="border-t border-stone-100 px-5 pb-5 pt-0 text-sm leading-7 text-stone-600 md:px-6 md:pb-6">
                <p className="pt-4">{item.a}</p>
                {item.link ? (
                  <p className="mt-3">
                    <Link
                      href={item.link.href}
                      className="font-medium text-stone-800 underline decoration-stone-300/80 underline-offset-4 transition hover:text-stone-900"
                    >
                      {item.link.label}
                    </Link>
                  </p>
                ) : null}
              </div>
            </details>
          ))
        ) : (
          <div className="rounded-2xl border border-stone-200 bg-white px-5 py-6 text-sm leading-6 text-stone-600 shadow-sm ring-1 ring-stone-900/[0.04]">
            Geen veelgestelde vraag gevonden voor deze zoekterm.
          </div>
        )}
      </div>
    </div>
  );
}
