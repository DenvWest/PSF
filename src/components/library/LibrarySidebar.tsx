"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { ContentAudience } from "@/lib/content-audience";
import type { LibraryGroup } from "@/lib/library/library-item";
import LibraryAudienceLens, {
  type AudienceContext,
} from "@/components/library/LibraryAudienceLens";
import {
  LIB_ASIDE,
  LIB_EYEBROW,
  LIB_PANEL,
} from "@/components/library/library-tokens";

export type LibraryToggle = {
  key: string;
  label: string;
  actief: boolean;
  onToggle: () => void;
};

export type LibraryCrossLink = {
  label: string;
  hint: string;
  href: string;
};

type LibrarySidebarProps = {
  intro: { title: string; body: string; link?: { label: string; href: string } };
  audience: ContentAudience;
  onAudience: (value: ContentAudience) => void;
  audienceCounts: Record<"mannen" | "vrouwen", number>;
  audienceContext: Record<ContentAudience, AudienceContext>;
  totaal: number;
  groups: Array<LibraryGroup & { icon?: ReactNode }>;
  /** "alles" of een groupKey. */
  group: string;
  onGroup: (value: string) => void;
  allesLabel: string;
  toggles: LibraryToggle[];
  crossLinks: LibraryCrossLink[];
  filtersActief: boolean;
  onWisFilters: () => void;
  /** Persoonlijk blok uit de check; server-side gevuld. */
  personalSlot?: ReactNode;
};

/**
 * De keuzekolom. Op desktop een kolom met alles onder elkaar, op mobiel de
 * lens plus één regel chips — zodat de artikelen meteen in beeld staan in
 * plaats van onder een scherm vol filters.
 */
export default function LibrarySidebar({
  intro,
  audience,
  onAudience,
  audienceCounts,
  audienceContext,
  totaal,
  groups,
  group,
  onGroup,
  allesLabel,
  toggles,
  crossLinks,
  filtersActief,
  onWisFilters,
  personalSlot,
}: LibrarySidebarProps) {
  const chip = (actief: boolean) =>
    actief
      ? "border-ps-green bg-ps-green font-semibold text-white shadow-[0_2px_8px_rgba(90,143,106,0.3)]"
      : "border-stone-200/90 bg-white text-stone-600 shadow-[0_1px_2px_rgba(28,25,23,0.03)] hover:border-ps-green/40 hover:text-ps-green";

  const rijKnop = (actief: boolean) =>
    actief
      ? "bg-ps-green font-semibold text-white shadow-sm"
      : "text-stone-600 hover:bg-stone-100/70 hover:text-ps-green";

  return (
    <aside aria-label="Verfijn de bibliotheek" className={LIB_ASIDE}>
      <div className="hidden lg:block">
        <p className="font-display text-sm font-semibold text-stone-900">
          {intro.title}
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-stone-500">
          {intro.body}
        </p>
        {intro.link ? (
          <Link
            href={intro.link.href}
            className="mt-2 inline-block text-xs font-medium text-ps-green transition-colors hover:text-ps-green-hover"
          >
            {intro.link.label} →
          </Link>
        ) : null}
      </div>

      <LibraryAudienceLens
        value={audience}
        onChange={onAudience}
        counts={audienceCounts}
        totaal={totaal}
        context={audienceContext}
      />

      {personalSlot}

      <div
        className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-0.5 scrollbar-hide lg:hidden"
        role="group"
        aria-label="Filter de bibliotheek"
      >
        <span className="relative flex-shrink-0">
          <select
            aria-label="Onderwerp"
            value={group}
            onChange={(event) => onGroup(event.target.value)}
            className={`h-10 appearance-none rounded-full border pl-4 pr-9 text-sm transition-[border-color,color,background-color,box-shadow] duration-200 focus:border-ps-green focus:outline-none focus:ring-2 focus:ring-ps-green/40 ${chip(
              group !== "alles",
            )}`}
          >
            <option value="alles">
              {allesLabel} ({totaal})
            </option>
            {groups.map((entry) => (
              <option key={entry.key} value={entry.key}>
                {entry.label} ({entry.count})
              </option>
            ))}
          </select>
          <span
            aria-hidden
            className={`pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[0.6rem] ${
              group !== "alles" ? "text-white/80" : "text-stone-400"
            }`}
          >
            ▼
          </span>
        </span>

        {toggles.map((toggle) => (
          <button
            key={toggle.key}
            type="button"
            onClick={toggle.onToggle}
            aria-pressed={toggle.actief}
            className={`h-10 flex-shrink-0 rounded-full border px-4 text-sm transition-[border-color,color,background-color,box-shadow,transform] duration-200 ease-out active:scale-[0.97] ${chip(toggle.actief)}`}
          >
            {toggle.label}
          </button>
        ))}

        {filtersActief ? (
          <button
            type="button"
            onClick={onWisFilters}
            className="h-10 flex-shrink-0 rounded-full border border-stone-200/90 bg-white px-4 text-sm text-stone-500 shadow-[0_1px_2px_rgba(28,25,23,0.03)] transition-colors hover:text-stone-900"
          >
            Wis filters
          </button>
        ) : null}
      </div>

      <div className="hidden lg:block">
        <p className={LIB_EYEBROW}>Onderwerp</p>
        <ul className="mt-2 space-y-0.5">
          <li>
            <button
              type="button"
              onClick={() => onGroup("alles")}
              aria-pressed={group === "alles"}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[0.8125rem] transition-colors ${rijKnop(
                group === "alles",
              )}`}
            >
              <span>{allesLabel}</span>
              <span className="tabular-nums opacity-70">{totaal}</span>
            </button>
          </li>
          {groups.map((entry) => (
            <li key={entry.key}>
              <button
                type="button"
                onClick={() => onGroup(entry.key)}
                aria-pressed={group === entry.key}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[0.8125rem] transition-colors ${rijKnop(
                  group === entry.key,
                )}`}
              >
                {entry.icon ? (
                  <span className="shrink-0 opacity-70" aria-hidden>
                    {entry.icon}
                  </span>
                ) : null}
                <span className="min-w-0 flex-1 truncate">{entry.label}</span>
                <span className="tabular-nums opacity-70">{entry.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {toggles.length > 0 ? (
        <div className="hidden lg:block">
          <p className={LIB_EYEBROW}>Verfijn</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {toggles.map((toggle) => (
              <button
                key={toggle.key}
                type="button"
                onClick={toggle.onToggle}
                aria-pressed={toggle.actief}
                className={`min-h-9 rounded-full border px-3.5 text-[0.8125rem] transition-[border-color,color,background-color,box-shadow,transform] duration-200 ease-out active:scale-[0.97] ${chip(toggle.actief)}`}
              >
                {toggle.label}
              </button>
            ))}
          </div>
          {filtersActief ? (
            <button
              type="button"
              onClick={onWisFilters}
              className="mt-2.5 text-xs font-medium text-stone-500 underline underline-offset-2 transition-colors hover:text-stone-900"
            >
              Wis filters
            </button>
          ) : null}
        </div>
      ) : null}

      {crossLinks.length > 0 ? (
        <nav aria-label="Verder op PerfectSupplement" className={`hidden lg:block ${LIB_PANEL}`}>
          <p className={LIB_EYEBROW}>Verder</p>
          <ul className="mt-2 divide-y divide-stone-100">
            {crossLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group flex items-start justify-between gap-3 py-2.5 transition-colors"
                >
                  <span className="min-w-0">
                    <span className="block text-[0.8125rem] font-medium text-stone-800 transition-colors group-hover:text-ps-green">
                      {link.label}
                    </span>
                    <span className="mt-0.5 block text-[0.75rem] leading-snug text-stone-500">
                      {link.hint}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className="mt-0.5 shrink-0 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:text-ps-green"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </aside>
  );
}
